-- Fix the duplicate policy issue
DROP POLICY IF EXISTS "Users can update their own typing status" ON public.typing_status;

-- Add missing fields to messages table for production messaging (retry)
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS deleted_by uuid,
ADD COLUMN IF NOT EXISTS deleted_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS content text,
ADD COLUMN IF NOT EXISTS media_url text,
ADD COLUMN IF NOT EXISTS media_type text;

-- Update existing data to use content instead of body where not already done
UPDATE public.messages SET content = body WHERE body IS NOT NULL AND content IS NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_client_id ON public.messages(client_id) WHERE client_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON public.messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_deleted ON public.messages(conversation_id, deleted_for_everyone, created_at DESC);

-- Create typing_status table for typing indicators
CREATE TABLE IF NOT EXISTS public.typing_status (
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  is_typing boolean DEFAULT false,
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (conversation_id, user_id)
);

-- Enable RLS on typing_status if not already enabled
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables WHERE schemaname = 'public' AND tablename = 'typing_status' AND rowsecurity = true
  ) THEN
    ALTER TABLE public.typing_status ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

-- Create corrected policies for typing_status
CREATE POLICY "Users can view typing status in their conversations" 
ON public.typing_status 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE c.id = conversation_id 
    AND (c.participant_a::text = auth.uid()::text OR c.participant_b::text = auth.uid()::text)
  )
);

CREATE POLICY "Users can insert their own typing status" 
ON public.typing_status 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own typing status records" 
ON public.typing_status 
FOR UPDATE 
USING (auth.uid()::text = user_id::text);
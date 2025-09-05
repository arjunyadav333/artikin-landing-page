-- Add missing fields to messages table for production messaging
ALTER TABLE public.messages 
ADD COLUMN deleted_by uuid,
ADD COLUMN deleted_at timestamp with time zone,
ADD COLUMN content text,
ADD COLUMN media_url text,
ADD COLUMN media_type text;

-- Update existing data to use content instead of body
UPDATE public.messages SET content = body WHERE body IS NOT NULL;

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

-- Enable RLS on typing_status
ALTER TABLE public.typing_status ENABLE ROW LEVEL SECURITY;

-- Create policies for typing_status
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

CREATE POLICY "Users can update their own typing status" 
ON public.typing_status 
FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own typing status" 
ON public.typing_status 
FOR UPDATE 
USING (auth.uid()::text = user_id::text);

-- Update RLS policies for messages to allow any participant to delete (not just message sender)
DROP POLICY IF EXISTS "Users can update their own messages" ON public.messages;

CREATE POLICY "Participants can update messages in their conversations" 
ON public.messages 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c 
    WHERE c.id = conversation_id 
    AND (c.participant_a::text = auth.uid()::text OR c.participant_b::text = auth.uid()::text)
  )
);

-- Create function to handle typing status updates with auto-cleanup
CREATE OR REPLACE FUNCTION public.update_typing_status(
  conv_id uuid,
  user_typing boolean DEFAULT false
) RETURNS void AS $$
BEGIN
  -- Insert or update typing status
  INSERT INTO public.typing_status (conversation_id, user_id, is_typing, updated_at)
  VALUES (conv_id, auth.uid(), user_typing, now())
  ON CONFLICT (conversation_id, user_id) 
  DO UPDATE SET 
    is_typing = user_typing,
    updated_at = now();
    
  -- Clean up old typing statuses (older than 3 seconds are considered stale)
  DELETE FROM public.typing_status 
  WHERE updated_at < now() - interval '3 seconds'
    AND conversation_id = conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Fix database schema issues and remove voice functionality

-- Drop voice-related storage buckets
DELETE FROM storage.buckets WHERE id IN ('chat-voice');

-- Check if conversation_participants table exists, if not create it
CREATE TABLE IF NOT EXISTS public.conversation_participants (
  conversation_id uuid NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  muted boolean DEFAULT false,
  pinned boolean DEFAULT false,  
  archived boolean DEFAULT false,
  last_read_message_id uuid,
  drafted_text text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (conversation_id, user_id)
);

-- Enable RLS on conversation_participants
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for conversation_participants
CREATE POLICY "Users can view their own participant records" 
ON public.conversation_participants FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own participant records" 
ON public.conversation_participants FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own participant records" 
ON public.conversation_participants FOR UPDATE 
USING (auth.uid()::text = user_id::text);

-- Enable real-time for messaging tables
ALTER TABLE public.conversations REPLICA IDENTITY FULL;
ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.message_attachments REPLICA IDENTITY FULL;
ALTER TABLE public.message_receipts REPLICA IDENTITY FULL;
ALTER TABLE public.conversation_participants REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_attachments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_receipts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversation_participants;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON public.conversations(participant_a, participant_b);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_message_attachments_message ON public.message_attachments(message_id);
CREATE INDEX IF NOT EXISTS idx_message_receipts_message ON public.message_receipts(message_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user ON public.conversation_participants(user_id);
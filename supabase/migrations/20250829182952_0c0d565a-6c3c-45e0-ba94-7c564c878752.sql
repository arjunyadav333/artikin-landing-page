-- Drop existing messaging tables to start fresh
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS conversations CASCADE;

-- Create conversations table (1:1 chats)
CREATE TABLE conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_a uuid NOT NULL,
  participant_b uuid NOT NULL,
  last_message_id uuid,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create unique index to ensure only one conversation per pair
CREATE UNIQUE INDEX ux_conversation_pair ON conversations(
  least(participant_a::text, participant_b::text), 
  greatest(participant_a::text, participant_b::text)
);

-- Create messages table with all message types
CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id uuid NOT NULL,
  kind text NOT NULL CHECK (kind IN ('text','image','video','document','audio','voice','link','sticker')),
  body text,
  meta jsonb DEFAULT '{}',
  reply_to uuid REFERENCES messages(id),
  edited_at timestamptz,
  deleted_for_everyone boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create message attachments table
CREATE TABLE message_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  file_url text NOT NULL,
  mime_type text NOT NULL,
  file_size int,
  width int,
  height int,
  duration int,
  created_at timestamptz DEFAULT now()
);

-- Create message receipts for delivery/read status
CREATE TABLE message_receipts (
  message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  status text NOT NULL CHECK (status IN ('sent','delivered','read')),
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (message_id, user_id)
);

-- Create conversation participants for per-user settings
CREATE TABLE conversation_participants (
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  muted boolean DEFAULT false,
  pinned boolean DEFAULT false,
  archived boolean DEFAULT false,
  last_read_message_id uuid,
  drafted_text text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  PRIMARY KEY (conversation_id, user_id)
);

-- Create starred messages table
CREATE TABLE starred_messages (
  user_id uuid NOT NULL,
  message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (user_id, message_id)
);

-- Create user blocks table
CREATE TABLE user_blocks (
  blocker_id uuid NOT NULL,
  blocked_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (blocker_id, blocked_id)
);

-- Add foreign key for last_message_id after messages table exists
ALTER TABLE conversations 
ADD CONSTRAINT fk_conversations_last_message 
FOREIGN KEY (last_message_id) REFERENCES messages(id);

-- Create performance indexes
CREATE INDEX idx_messages_conv_created ON messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_receipts_user_status ON message_receipts(user_id, status);
CREATE INDEX idx_conv_participant_user ON conversation_participants(user_id);
CREATE INDEX idx_conversations_participants ON conversations(participant_a, participant_b);
CREATE INDEX idx_conversations_updated ON conversations(updated_at DESC);
CREATE INDEX idx_message_attachments_message ON message_attachments(message_id);

-- Enable RLS on all tables
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE starred_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_blocks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view conversations they participate in" 
ON conversations FOR SELECT 
USING (auth.uid()::text = participant_a::text OR auth.uid()::text = participant_b::text);

CREATE POLICY "Users can create conversations" 
ON conversations FOR INSERT 
WITH CHECK (auth.uid()::text = participant_a::text OR auth.uid()::text = participant_b::text);

CREATE POLICY "Users can update conversations they participate in" 
ON conversations FOR UPDATE 
USING (auth.uid()::text = participant_a::text OR auth.uid()::text = participant_b::text);

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations" 
ON messages FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = messages.conversation_id 
    AND (c.participant_a::text = auth.uid()::text OR c.participant_b::text = auth.uid()::text)
  )
);

CREATE POLICY "Users can send messages in their conversations" 
ON messages FOR INSERT 
WITH CHECK (
  auth.uid()::text = sender_id::text AND
  EXISTS (
    SELECT 1 FROM conversations c
    WHERE c.id = messages.conversation_id 
    AND (c.participant_a::text = auth.uid()::text OR c.participant_b::text = auth.uid()::text)
  )
);

CREATE POLICY "Users can update their own messages" 
ON messages FOR UPDATE 
USING (auth.uid()::text = sender_id::text);

-- RLS Policies for message attachments
CREATE POLICY "Users can view attachments for accessible messages" 
ON message_attachments FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM messages m
    JOIN conversations c ON c.id = m.conversation_id
    WHERE m.id = message_attachments.message_id 
    AND (c.participant_a::text = auth.uid()::text OR c.participant_b::text = auth.uid()::text)
  )
);

CREATE POLICY "Users can create attachments for their messages" 
ON message_attachments FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM messages m
    WHERE m.id = message_attachments.message_id 
    AND m.sender_id::text = auth.uid()::text
  )
);

-- RLS Policies for message receipts
CREATE POLICY "Users can view receipts for accessible messages" 
ON message_receipts FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM messages m
    JOIN conversations c ON c.id = m.conversation_id
    WHERE m.id = message_receipts.message_id 
    AND (c.participant_a::text = auth.uid()::text OR c.participant_b::text = auth.uid()::text)
  )
);

CREATE POLICY "Users can create receipts" 
ON message_receipts FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own receipts" 
ON message_receipts FOR UPDATE 
USING (auth.uid()::text = user_id::text);

-- RLS Policies for conversation participants
CREATE POLICY "Users can view their own participant records" 
ON conversation_participants FOR SELECT 
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create their own participant records" 
ON conversation_participants FOR INSERT 
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update their own participant records" 
ON conversation_participants FOR UPDATE 
USING (auth.uid()::text = user_id::text);

-- RLS Policies for starred messages
CREATE POLICY "Users can manage their own starred messages" 
ON starred_messages FOR ALL 
USING (auth.uid()::text = user_id::text);

-- RLS Policies for user blocks
CREATE POLICY "Users can manage their own blocks" 
ON user_blocks FOR ALL 
USING (auth.uid()::text = blocker_id::text);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('chat-images', 'chat-images', false),
  ('chat-videos', 'chat-videos', false),
  ('chat-docs', 'chat-docs', false),
  ('chat-voice', 'chat-voice', false),
  ('chat-thumbs', 'chat-thumbs', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for chat buckets
CREATE POLICY "Authenticated users can upload to chat-images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'chat-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can upload to chat-videos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'chat-videos' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can upload to chat-docs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'chat-docs' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can upload to chat-voice"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'chat-voice' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can upload to chat-thumbs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'chat-thumbs' AND auth.uid() IS NOT NULL);

-- Enable realtime for all messaging tables
ALTER TABLE conversations REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;

ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

ALTER TABLE message_receipts REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE message_receipts;

ALTER TABLE conversation_participants REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE conversation_participants;
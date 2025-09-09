-- Create improved messaging tables for Instagram-style DMs

-- Update conversations table
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS opportunity_id uuid REFERENCES opportunities(id),
ADD COLUMN IF NOT EXISTS last_message_type text DEFAULT 'text',
ADD COLUMN IF NOT EXISTS last_message_at timestamp with time zone DEFAULT now(),
ADD COLUMN IF NOT EXISTS unread_count_user1 int DEFAULT 0,
ADD COLUMN IF NOT EXISTS unread_count_user2 int DEFAULT 0;

-- Update messages table for enhanced functionality  
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS message_type text DEFAULT 'text',
ADD COLUMN IF NOT EXISTS link_preview jsonb,
ADD COLUMN IF NOT EXISTS media_url text,
ADD COLUMN IF NOT EXISTS replied_to_message_id uuid REFERENCES messages(id),
ADD COLUMN IF NOT EXISTS delivered_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS seen_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS edited boolean DEFAULT false;

-- Create message_reactions table
CREATE TABLE IF NOT EXISTS message_reactions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_id uuid NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  emoji text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Add unique constraint to prevent duplicate reactions
ALTER TABLE message_reactions 
DROP CONSTRAINT IF EXISTS unique_user_message_emoji;
ALTER TABLE message_reactions 
ADD CONSTRAINT unique_user_message_emoji UNIQUE (message_id, user_id, emoji);

-- Enable RLS on message_reactions
ALTER TABLE message_reactions ENABLE ROW LEVEL SECURITY;

-- Create policies for message_reactions
DROP POLICY IF EXISTS "Users can create reactions for accessible messages" ON message_reactions;
CREATE POLICY "Users can create reactions for accessible messages" 
ON message_reactions 
FOR INSERT 
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM messages m
    JOIN conversations c ON c.id = m.conversation_id
    WHERE m.id = message_reactions.message_id 
    AND (c.participant_a = auth.uid() OR c.participant_b = auth.uid())
  )
);

DROP POLICY IF EXISTS "Users can view reactions for accessible messages" ON message_reactions;
CREATE POLICY "Users can view reactions for accessible messages" 
ON message_reactions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM messages m
    JOIN conversations c ON c.id = m.conversation_id
    WHERE m.id = message_reactions.message_id 
    AND (c.participant_a = auth.uid() OR c.participant_b = auth.uid())
  )
);

DROP POLICY IF EXISTS "Users can delete their own reactions" ON message_reactions;
CREATE POLICY "Users can delete their own reactions" 
ON message_reactions 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_message_reactions_message_id ON message_reactions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reactions_user_id ON message_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created ON messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_messages_replied_to ON messages(replied_to_message_id);

-- Create function to update conversation last_message info
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations 
  SET 
    last_message_at = NEW.created_at,
    last_message_type = COALESCE(NEW.message_type, 'text'),
    updated_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for updating conversation last_message
DROP TRIGGER IF EXISTS trigger_update_conversation_last_message ON messages;
CREATE TRIGGER trigger_update_conversation_last_message
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_last_message();

-- Create function to handle message delivery receipts
CREATE OR REPLACE FUNCTION handle_message_delivery()
RETURNS TRIGGER AS $$
BEGIN
  -- Mark as delivered immediately for the recipient
  UPDATE messages 
  SET delivered_at = now()
  WHERE id = NEW.id 
  AND delivered_at IS NULL;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for message delivery
DROP TRIGGER IF EXISTS trigger_handle_message_delivery ON messages;
CREATE TRIGGER trigger_handle_message_delivery
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION handle_message_delivery();
-- Update conversations table to match specification
ALTER TABLE conversations DROP COLUMN IF EXISTS participant_a CASCADE;
ALTER TABLE conversations DROP COLUMN IF EXISTS participant_b CASCADE;

-- Update conversation_participants table
ALTER TABLE conversation_participants ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- Update messages table to match specification  
ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_for_all boolean DEFAULT false;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_by uuid;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS content text;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS media_url text;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS media_type text;

-- Drop body column if it exists (replaced with content)
ALTER TABLE messages DROP COLUMN IF EXISTS body;

-- Update message_receipts table
ALTER TABLE message_receipts DROP CONSTRAINT IF EXISTS message_receipts_status_check;
ALTER TABLE message_receipts ADD CONSTRAINT message_receipts_status_check 
  CHECK (status IN ('sent', 'delivered', 'seen'));

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_messages_conv_created ON messages(conversation_id, created_at DESC);

-- Create RPC function: create_or_get_conversation
CREATE OR REPLACE FUNCTION create_or_get_conversation(user_a uuid, user_b uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conv_id uuid;
BEGIN
  -- Look for existing conversation between these users
  SELECT c.id INTO conv_id
  FROM conversations c
  JOIN conversation_participants cp1 ON cp1.conversation_id = c.id AND cp1.user_id = user_a
  JOIN conversation_participants cp2 ON cp2.conversation_id = c.id AND cp2.user_id = user_b
  WHERE cp1.deleted = false AND cp2.deleted = false
  LIMIT 1;
  
  -- If no conversation exists, create one
  IF conv_id IS NULL THEN
    INSERT INTO conversations DEFAULT VALUES RETURNING id INTO conv_id;
    
    -- Add both participants
    INSERT INTO conversation_participants (conversation_id, user_id) 
    VALUES (conv_id, user_a), (conv_id, user_b);
  END IF;
  
  RETURN conv_id;
END;
$$;

-- Create RPC function: delete_message_for_all
CREATE OR REPLACE FUNCTION delete_message_for_all(msg_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is sender or participant in conversation
  IF NOT EXISTS (
    SELECT 1 FROM messages m
    JOIN conversations c ON c.id = m.conversation_id
    JOIN conversation_participants cp ON cp.conversation_id = c.id
    WHERE m.id = msg_id AND (m.sender_id = auth.uid() OR cp.user_id = auth.uid())
  ) THEN
    RAISE EXCEPTION 'Not authorized to delete this message';
  END IF;
  
  UPDATE messages 
  SET deleted = true, 
      deleted_for_all = true, 
      deleted_by = auth.uid(), 
      deleted_at = now()
  WHERE id = msg_id;
END;
$$;

-- Create RPC function: mark_messages_seen
CREATE OR REPLACE FUNCTION mark_messages_seen(conv_id uuid, up_to_message_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_created_at timestamptz;
BEGIN
  -- Get timestamp of target message
  SELECT created_at INTO target_created_at
  FROM messages
  WHERE id = up_to_message_id AND conversation_id = conv_id;
  
  -- Update all receipts for messages up to this timestamp
  INSERT INTO message_receipts (message_id, user_id, status, updated_at)
  SELECT m.id, auth.uid(), 'seen', now()
  FROM messages m
  WHERE m.conversation_id = conv_id 
    AND m.sender_id != auth.uid()
    AND m.created_at <= target_created_at
  ON CONFLICT (message_id, user_id) 
  DO UPDATE SET status = 'seen', updated_at = now()
  WHERE message_receipts.status != 'seen';
  
  -- Update last_read_message_id
  UPDATE conversation_participants
  SET last_read_message_id = up_to_message_id
  WHERE conversation_id = conv_id AND user_id = auth.uid();
END;
$$;

-- Update RLS policies for new schema

-- Messages policies
DROP POLICY IF EXISTS "Users can view messages in their conversations" ON messages;
CREATE POLICY "Users can view messages in their conversations"
ON messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = messages.conversation_id 
      AND cp.user_id = auth.uid() 
      AND cp.deleted = false
  )
);

DROP POLICY IF EXISTS "Users can send messages in their conversations" ON messages;  
CREATE POLICY "Users can send messages in their conversations"
ON messages FOR INSERT
WITH CHECK (
  auth.uid() = sender_id AND
  EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = messages.conversation_id 
      AND cp.user_id = auth.uid() 
      AND cp.deleted = false
  )
);

DROP POLICY IF EXISTS "Users can update their own messages" ON messages;
CREATE POLICY "Users can update messages in their conversations"
ON messages FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM conversation_participants cp
    WHERE cp.conversation_id = messages.conversation_id 
      AND cp.user_id = auth.uid() 
      AND cp.deleted = false
  )
);

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE message_receipts;
ALTER PUBLICATION supabase_realtime ADD TABLE conversation_participants;
-- Fix database schema and add missing constraints and indexes

-- Add foreign key for last_message_id if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'conversations_last_message_id_fkey'
    ) THEN
        ALTER TABLE conversations 
        ADD CONSTRAINT conversations_last_message_id_fkey 
        FOREIGN KEY (last_message_id) REFERENCES messages(id);
    END IF;
END $$;

-- Add indexes for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversations_participants 
ON conversations (participant_a, participant_b);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_conversation_id 
ON messages (conversation_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_sender_id 
ON messages (sender_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_message_receipts_message_user 
ON message_receipts (message_id, user_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_conversation_participants_conv_user 
ON conversation_participants (conversation_id, user_id);

-- Enable realtime for messaging tables
ALTER TABLE conversations REPLICA IDENTITY FULL;
ALTER TABLE messages REPLICA IDENTITY FULL;
ALTER TABLE message_receipts REPLICA IDENTITY FULL;
ALTER TABLE conversation_participants REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE message_receipts;
ALTER PUBLICATION supabase_realtime ADD TABLE conversation_participants;
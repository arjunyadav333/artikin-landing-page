-- Update conversation_participants table to include deleted column if not exists
ALTER TABLE conversation_participants 
ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT false;

-- Update messages table to include proper status tracking and deleted field
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS deleted BOOLEAN DEFAULT false;

-- Ensure we have proper indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_deleted 
ON conversation_participants(user_id, deleted, pinned);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_created 
ON messages(conversation_id, created_at);

-- Create a function to get conversations with proper filtering
CREATE OR REPLACE FUNCTION get_user_conversations(user_id_param uuid)
RETURNS TABLE (
  id uuid,
  participant_a uuid,
  participant_b uuid,
  last_message_id uuid,
  updated_at timestamptz,
  created_at timestamptz,
  other_participant_id uuid,
  pinned boolean,
  deleted boolean
)
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.participant_a,
    c.participant_b,
    c.last_message_id,
    c.updated_at,
    c.created_at,
    CASE 
      WHEN c.participant_a = user_id_param THEN c.participant_b
      ELSE c.participant_a
    END as other_participant_id,
    COALESCE(cp.pinned, false) as pinned,
    COALESCE(cp.deleted, false) as deleted
  FROM conversations c
  LEFT JOIN conversation_participants cp ON (
    cp.conversation_id = c.id AND cp.user_id = user_id_param
  )
  WHERE (c.participant_a = user_id_param OR c.participant_b = user_id_param)
    AND COALESCE(cp.deleted, false) = false
  ORDER BY 
    COALESCE(cp.pinned, false) DESC,
    c.updated_at DESC;
END;
$$;
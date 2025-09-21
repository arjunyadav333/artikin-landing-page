-- Create optimized view for messages with sender info and reactions
CREATE OR REPLACE VIEW messages_with_details AS
SELECT 
  m.*,
  p.username as sender_username,
  p.display_name as sender_display_name,
  p.avatar_url as sender_avatar_url,
  COALESCE(
    json_agg(
      json_build_object(
        'id', mr.id,
        'user_id', mr.user_id,
        'emoji', mr.emoji,
        'created_at', mr.created_at
      )
    ) FILTER (WHERE mr.id IS NOT NULL),
    '[]'::json
  ) as reactions
FROM messages m
LEFT JOIN profiles p ON p.user_id = m.sender_id
LEFT JOIN message_reactions mr ON mr.message_id = m.id
GROUP BY m.id, p.username, p.display_name, p.avatar_url;

-- Create index for faster conversation message queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_conversation_created 
ON messages (conversation_id, created_at);

-- Create index for faster message reactions queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_message_reactions_message_id 
ON message_reactions (message_id);

-- Create index for faster profile queries by user_id
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_user_id 
ON profiles (user_id);

-- Create function to get conversation messages efficiently
CREATE OR REPLACE FUNCTION get_conversation_messages(conversation_id_param uuid)
RETURNS TABLE(
  id uuid,
  conversation_id uuid,
  sender_id uuid,
  kind text,
  body text,
  meta jsonb,
  reply_to uuid,
  edited_at timestamptz,
  deleted_for_everyone boolean,
  created_at timestamptz,
  deleted boolean,
  client_id text,
  pending boolean,
  message_type text,
  link_preview jsonb,
  media_url text,
  replied_to_message_id uuid,
  delivered_at timestamptz,
  seen_at timestamptz,
  edited boolean,
  sender_username text,
  sender_display_name text,
  sender_avatar_url text,
  reactions json
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM messages_with_details 
  WHERE messages_with_details.conversation_id = conversation_id_param
  ORDER BY created_at ASC;
$$;
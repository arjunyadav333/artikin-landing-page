-- Remove SECURITY DEFINER from view (not needed for views)
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
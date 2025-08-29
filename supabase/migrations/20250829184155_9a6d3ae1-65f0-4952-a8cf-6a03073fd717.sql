-- Create sample conversations for testing
INSERT INTO conversations (participant_a, participant_b, updated_at) VALUES
  ('ca828fc7-5dbf-434e-8631-bda74418eda3', '46999012-02ed-4c68-9d9b-00e31c997384', now()),
  ('ca828fc7-5dbf-434e-8631-bda74418eda3', 'a0f80e99-bcb3-44f4-8d82-3f7017ae8c3b', now());

-- Create conversation participants for all conversations
INSERT INTO conversation_participants (conversation_id, user_id)
SELECT c.id, c.participant_a FROM conversations c
UNION
SELECT c.id, c.participant_b FROM conversations c;

-- Create some sample messages
WITH conv_ids AS (
  SELECT id as conversation_id, participant_a, participant_b 
  FROM conversations 
  LIMIT 2
),
sample_messages AS (
  INSERT INTO messages (conversation_id, sender_id, kind, body, created_at)
  SELECT 
    conversation_id,
    participant_a as sender_id,
    'text' as kind,
    'Hey! How are you doing?' as body,
    now() - interval '2 hours' as created_at
  FROM conv_ids
  WHERE conversation_id = (SELECT id FROM conversations LIMIT 1)
  
  UNION ALL
  
  SELECT 
    conversation_id,
    participant_b as sender_id,
    'text' as kind,
    'I am doing great! Thanks for asking. How about you?' as body,
    now() - interval '1 hour' as created_at
  FROM conv_ids
  WHERE conversation_id = (SELECT id FROM conversations LIMIT 1)
  
  UNION ALL
  
  SELECT 
    conversation_id,
    participant_a as sender_id,
    'text' as kind,
    'Just finished working on some new designs. Want to see them?' as body,
    now() - interval '30 minutes' as created_at
  FROM conv_ids
  WHERE conversation_id = (SELECT id FROM conversations LIMIT 1)
  
  UNION ALL
  
  SELECT 
    conversation_id,
    participant_a as sender_id,
    'text' as kind,
    'Hi there! Are you available for a quick chat?' as body,
    now() - interval '1 hour' as created_at
  FROM conv_ids
  WHERE conversation_id = (SELECT id FROM conversations OFFSET 1 LIMIT 1)

  RETURNING id, conversation_id
)
-- Update conversations with last message IDs
UPDATE conversations 
SET last_message_id = (
  SELECT m.id 
  FROM messages m 
  WHERE m.conversation_id = conversations.id 
  ORDER BY m.created_at DESC 
  LIMIT 1
);

-- Create message receipts for sent messages
INSERT INTO message_receipts (message_id, user_id, status)
SELECT m.id, m.sender_id, 'sent'
FROM messages m;
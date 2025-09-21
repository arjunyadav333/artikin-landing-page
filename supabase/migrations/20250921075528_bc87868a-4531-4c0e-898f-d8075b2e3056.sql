-- Fix ambiguous column reference by using separate inserts with EXISTS checks
CREATE OR REPLACE FUNCTION public.create_or_get_conversation(user_a uuid, user_b uuid)
RETURNS TABLE(conversation_id uuid, existing boolean)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  conv_id uuid;
  min_user uuid;
  max_user uuid;
BEGIN
  -- Canonicalize pair so uniqueness is symmetric (min/max)
  IF user_a < user_b THEN
    min_user := user_a;
    max_user := user_b;
  ELSE
    min_user := user_b;
    max_user := user_a;
  END IF;

  -- Prevent self-messaging
  IF user_a = user_b THEN
    RAISE EXCEPTION 'Cannot create conversation with yourself';
  END IF;

  -- Try to find existing 1:1 conversation between these two users
  SELECT c.id INTO conv_id
  FROM conversations c
  WHERE (c.participant_a = min_user AND c.participant_b = max_user)
     OR (c.participant_a = max_user AND c.participant_b = min_user)
  LIMIT 1;

  IF conv_id IS NOT NULL THEN
    -- Return existing conversation
    conversation_id := conv_id;
    existing := true;
    RETURN NEXT;
    RETURN;
  END IF;

  -- Create new conversation atomically
  INSERT INTO conversations (participant_a, participant_b, created_at, updated_at) 
  VALUES (min_user, max_user, now(), now()) 
  RETURNING id INTO conv_id;

  -- Create participant records for both users only if they don't exist
  INSERT INTO conversation_participants (conversation_id, user_id, created_at) 
  SELECT conv_id, user_a, now()
  WHERE NOT EXISTS (
    SELECT 1 FROM conversation_participants 
    WHERE conversation_participants.conversation_id = conv_id 
    AND conversation_participants.user_id = user_a
  );

  INSERT INTO conversation_participants (conversation_id, user_id, created_at) 
  SELECT conv_id, user_b, now()
  WHERE NOT EXISTS (
    SELECT 1 FROM conversation_participants 
    WHERE conversation_participants.conversation_id = conv_id 
    AND conversation_participants.user_id = user_b
  );

  -- Return new conversation
  conversation_id := conv_id;
  existing := false;
  RETURN NEXT;
END;
$function$;
-- Add client_id column to messages table for optimistic UI reconciliation
ALTER TABLE public.messages 
ADD COLUMN client_id TEXT;

-- Add index for fast client_id lookups
CREATE INDEX idx_messages_client_id ON public.messages(client_id) WHERE client_id IS NOT NULL;

-- Add index for conversation_id + created_at for better message fetching performance
CREATE INDEX IF NOT EXISTS idx_messages_conversation_created_at 
ON public.messages(conversation_id, created_at DESC);

-- Add pending status tracking
ALTER TABLE public.messages 
ADD COLUMN pending BOOLEAN DEFAULT FALSE;

-- Create function to delete message for everyone
CREATE OR REPLACE FUNCTION public.delete_message_for_everyone(message_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Update message to mark as deleted for everyone
  UPDATE public.messages 
  SET 
    deleted_for_everyone = true,
    deleted = true,
    body = null,
    updated_at = now()
  WHERE id = message_id_param
    AND sender_id = auth.uid(); -- Only sender can delete for everyone
  
  -- Return whether any row was affected
  RETURN FOUND;
END;
$$;

-- Create function for fast message acknowledgment
CREATE OR REPLACE FUNCTION public.create_message_with_client_id(
  conversation_id_param uuid,
  sender_id_param uuid,
  client_id_param text,
  kind_param text DEFAULT 'text',
  body_param text DEFAULT null
)
RETURNS TABLE(
  id uuid,
  client_id text,
  created_at timestamptz,
  server_timestamp timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_message_id uuid;
BEGIN
  -- Verify user can send to this conversation
  IF NOT EXISTS (
    SELECT 1 FROM conversations c 
    WHERE c.id = conversation_id_param 
    AND (c.participant_a = sender_id_param OR c.participant_b = sender_id_param)
  ) THEN
    RAISE EXCEPTION 'User not authorized to send to this conversation';
  END IF;
  
  -- Insert the message
  INSERT INTO public.messages (
    conversation_id,
    sender_id,
    client_id,
    kind,
    body,
    created_at,
    pending
  ) VALUES (
    conversation_id_param,
    sender_id_param,
    client_id_param,
    kind_param,
    body_param,
    now(),
    false
  )
  RETURNING messages.id, messages.created_at INTO new_message_id, created_at;
  
  -- Update conversation timestamp
  UPDATE public.conversations 
  SET 
    updated_at = now(),
    last_message_id = new_message_id
  WHERE conversations.id = conversation_id_param;
  
  -- Return the message info for fast ACK
  RETURN QUERY 
  SELECT 
    new_message_id,
    client_id_param,
    created_at,
    now() as server_timestamp;
END;
$$;
-- Fix security issues from previous migration by setting proper search_path

-- Update the function to include proper security settings
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Update the message delivery function with proper security settings  
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
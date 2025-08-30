-- Phase 1: Critical Database & Backend Fixes

-- 1. Add DELETE policy for conversation_participants
CREATE POLICY "Users can delete their own participant records" 
ON public.conversation_participants 
FOR DELETE 
USING ((auth.uid())::text = (user_id)::text);

-- 2. Create function to auto-create participant records when conversations are created
CREATE OR REPLACE FUNCTION public.create_conversation_participants()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert participant records for both users
  INSERT INTO public.conversation_participants (conversation_id, user_id)
  VALUES 
    (NEW.id, NEW.participant_a),
    (NEW.id, NEW.participant_b);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- 3. Create trigger for auto-creating participants
CREATE TRIGGER create_participants_on_conversation
  AFTER INSERT ON public.conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.create_conversation_participants();

-- 4. Create function for automatic delivery receipt creation
CREATE OR REPLACE FUNCTION public.create_delivery_receipt()
RETURNS TRIGGER AS $$
DECLARE
  recipient_id uuid;
BEGIN
  -- Find the recipient (the other participant in the conversation)
  SELECT CASE 
    WHEN c.participant_a = NEW.sender_id THEN c.participant_b
    ELSE c.participant_a
  END INTO recipient_id
  FROM public.conversations c
  WHERE c.id = NEW.conversation_id;
  
  -- Create delivery receipt for the recipient
  IF recipient_id IS NOT NULL THEN
    INSERT INTO public.message_receipts (message_id, user_id, status)
    VALUES (NEW.id, recipient_id, 'delivered')
    ON CONFLICT (message_id, user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';

-- 5. Create trigger for auto-creating delivery receipts
CREATE TRIGGER create_delivery_receipt_on_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.create_delivery_receipt();

-- 6. Add composite unique constraint to message_receipts to prevent duplicates
ALTER TABLE public.message_receipts 
ADD CONSTRAINT unique_message_user_receipt 
UNIQUE (message_id, user_id);

-- 7. Create function to mark conversation messages as read
CREATE OR REPLACE FUNCTION public.mark_conversation_messages_read(
  conversation_id_param uuid,
  user_id_param uuid,
  up_to_message_id uuid
)
RETURNS INTEGER AS $$
DECLARE
  messages_marked INTEGER;
  target_created_at timestamptz;
BEGIN
  -- Get the timestamp of the target message
  SELECT created_at INTO target_created_at
  FROM public.messages
  WHERE id = up_to_message_id;
  
  -- Update message receipts to 'read' for all messages up to the target
  WITH marked_messages AS (
    INSERT INTO public.message_receipts (message_id, user_id, status)
    SELECT m.id, user_id_param, 'read'
    FROM public.messages m
    WHERE m.conversation_id = conversation_id_param
      AND m.sender_id != user_id_param
      AND m.created_at <= target_created_at
    ON CONFLICT (message_id, user_id) 
    DO UPDATE SET status = 'read', updated_at = now()
    WHERE message_receipts.status != 'read'
    RETURNING 1
  )
  SELECT COUNT(*) INTO messages_marked FROM marked_messages;
  
  -- Update last_read_message_id in conversation_participants
  UPDATE public.conversation_participants
  SET last_read_message_id = up_to_message_id
  WHERE conversation_id = conversation_id_param 
    AND user_id = user_id_param;
    
  RETURN messages_marked;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public';
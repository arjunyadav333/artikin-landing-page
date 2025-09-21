-- Fix the conversation that has profile ID instead of user ID
UPDATE conversations 
SET participant_a = 'a0f80e99-bcb3-44f4-8d82-3f7017ae8c3b'
WHERE id = '50764d5e-a615-4b04-8801-afbfa1c9b21e' 
  AND participant_a = '52ba5268-8b53-4ee8-91f7-00f6c029d5ae';
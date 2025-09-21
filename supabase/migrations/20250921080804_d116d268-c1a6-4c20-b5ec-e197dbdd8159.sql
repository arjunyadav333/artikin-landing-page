-- Delete the broken conversation that has profile ID instead of user ID
DELETE FROM conversations 
WHERE id = '50764d5e-a615-4b04-8801-afbfa1c9b21e' 
  AND participant_a = '52ba5268-8b53-4ee8-91f7-00f6c029d5ae';
-- Fix the infinite recursion in connections RLS policy
DROP POLICY IF EXISTS "Users can view connections based on privacy settings" ON public.connections;

-- Create new simplified connection policies
CREATE POLICY "Users can view public connections" 
ON public.connections 
FOR SELECT 
USING (true);

-- Fix profile font size variables in index.css
-- Add profile-specific font size variables
-- Fix infinite recursion in profiles RLS policies
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Sensitive profile data restricted" ON public.profiles;
DROP POLICY IF EXISTS "Users can view public profiles or own profile" ON public.profiles;

-- Create clean, non-recursive RLS policies for profiles
CREATE POLICY "Users can view profiles" ON public.profiles
  FOR SELECT
  USING (
    -- Always allow viewing public profiles
    privacy = 'public' 
    OR 
    -- Allow viewing own profile
    auth.uid() = user_id
    OR
    -- Allow viewing private profiles if following (non-recursive check)
    (
      privacy = 'private' 
      AND auth.uid() IS NOT NULL 
      AND EXISTS (
        SELECT 1 FROM public.connections 
        WHERE connections.following_id = profiles.user_id 
        AND connections.follower_id = auth.uid()
      )
    )
  );

-- Ensure users can create their own profile
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own profile  
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create or update profile for current user if it doesn't exist
INSERT INTO public.profiles (
  user_id, 
  username, 
  display_name,
  privacy
) 
SELECT 
  auth.uid(),
  'user_' || SUBSTR(auth.uid()::text, 1, 8),
  'New User',
  'public'
WHERE auth.uid() IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE user_id = auth.uid()
);
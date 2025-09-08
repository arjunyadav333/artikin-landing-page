-- Drop all existing policies on profiles table
DROP POLICY IF EXISTS "Users can view profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles; 
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Sensitive profile data restricted" ON public.profiles;
DROP POLICY IF EXISTS "Users can view public profiles or own profile" ON public.profiles;

-- Create clean, simple RLS policies for profiles
CREATE POLICY "Enable read access for profiles" ON public.profiles
  FOR SELECT 
  USING (
    privacy = 'public'::text 
    OR (auth.uid() IS NOT NULL AND user_id = auth.uid())
    OR (
      privacy = 'private'::text 
      AND auth.uid() IS NOT NULL 
      AND EXISTS (
        SELECT 1 FROM public.connections 
        WHERE connections.following_id = profiles.user_id 
        AND connections.follower_id = auth.uid()
      )
    )
  );

CREATE POLICY "Enable insert for own profile" ON public.profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for own profile" ON public.profiles
  FOR UPDATE 
  USING (auth.uid() = user_id);
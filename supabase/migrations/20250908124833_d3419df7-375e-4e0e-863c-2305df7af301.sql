-- Create a security definer function to check if user is following another user
CREATE OR REPLACE FUNCTION public.user_is_following(target_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.connections 
    WHERE follower_id = auth.uid() 
    AND following_id = target_user_id
  );
$$;

-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Enable read access for profiles" ON public.profiles;

-- Create a new, simpler policy without recursion
CREATE POLICY "Enable read access for profiles" ON public.profiles
FOR SELECT USING (
  privacy = 'public' OR 
  user_id = auth.uid() OR 
  (privacy = 'private' AND auth.uid() IS NOT NULL AND public.user_is_following(user_id))
);
-- Add indexes for fast role lookups if not exists
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- Create helper function to safely get user profile with role
CREATE OR REPLACE FUNCTION public.get_user_profile(user_uuid uuid DEFAULT auth.uid())
RETURNS TABLE(
  id uuid,
  user_id uuid,
  username text,
  display_name text,
  full_name text,
  role user_role,
  artform artform_type,
  organization_type organization_type,
  avatar_url text,
  bio text,
  location text,
  privacy text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    p.id,
    p.user_id,
    p.username,
    p.display_name,
    p.full_name,
    p.role,
    p.artform,
    p.organization_type,
    p.avatar_url,
    p.bio,
    p.location,
    p.privacy
  FROM public.profiles p
  WHERE p.user_id = user_uuid;
$$;

-- Create function to check if user has specific role
CREATE OR REPLACE FUNCTION public.user_has_role(user_uuid uuid, check_role user_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = user_uuid
      AND role = check_role
  );
$$;

-- Create function to get current user's role safely
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE user_id = auth.uid();
$$;

-- Grant execute permissions on the helper functions
GRANT EXECUTE ON FUNCTION public.get_user_profile(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_role(uuid, user_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_current_user_role() TO authenticated;
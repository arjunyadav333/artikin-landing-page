-- Ensure profiles table has proper role constraints and indexes
-- Check current state and add missing pieces

-- Add index for fast role lookups if not exists
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

-- Update RLS policies to ensure role security
-- Users can only update their own profile, but role changes need special handling
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile (except role)"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id 
  AND (NEW.role IS NULL OR NEW.role = OLD.role OR OLD.role IS NULL)
);

-- Allow initial profile creation with role (for signup)
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Ensure opportunities table uses role-based access
-- Update opportunities policies to use profile role check
DROP POLICY IF EXISTS "Organizations can create opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Organizations can update their opportunities" ON public.opportunities;
DROP POLICY IF EXISTS "Organizations can delete their opportunities" ON public.opportunities;

CREATE POLICY "Organizations can create opportunities"
ON public.opportunities
FOR INSERT
WITH CHECK (
  auth.uid() = user_id 
  AND public.user_has_role(auth.uid(), 'organization'::user_role)
);

CREATE POLICY "Organizations can update their opportunities"
ON public.opportunities
FOR UPDATE
USING (
  auth.uid() = user_id 
  AND public.user_has_role(auth.uid(), 'organization'::user_role)
);

CREATE POLICY "Organizations can delete their opportunities"
ON public.opportunities
FOR DELETE
USING (
  auth.uid() = user_id 
  AND public.user_has_role(auth.uid(), 'organization'::user_role)
);

-- Grant execute permissions on the helper functions
GRANT EXECUTE ON FUNCTION public.get_user_profile(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_role(uuid, user_role) TO authenticated;
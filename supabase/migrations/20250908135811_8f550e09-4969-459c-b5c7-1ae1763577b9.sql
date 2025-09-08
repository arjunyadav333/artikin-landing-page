-- Create a new security definer function that works better with authentication context
CREATE OR REPLACE FUNCTION public.get_current_user_profile_secure()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  username text,
  display_name text,
  full_name text,
  bio text,
  role user_role,
  artform artform_type,
  organization_type organization_type,
  avatar_url text,
  cover_url text,
  location text,
  website text,
  headline text,
  social_links jsonb,
  follower_count integer,
  following_count integer,
  posts_count integer,
  privacy text,
  phone_number text,
  pronouns text,
  contact_email text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  -- Get the current user ID
  current_user_id := auth.uid();
  
  -- Log for debugging
  RAISE LOG 'get_current_user_profile_secure called for user: %', current_user_id;
  
  -- Return null if no user is authenticated
  IF current_user_id IS NULL THEN
    RAISE LOG 'No authenticated user found in get_current_user_profile_secure';
    RETURN;
  END IF;
  
  -- Return the user's profile
  RETURN QUERY
  SELECT 
    p.id,
    p.user_id,
    p.username,
    p.display_name,
    p.full_name,
    p.bio,
    p.role,
    p.artform,
    p.organization_type,
    p.avatar_url,
    p.cover_url,
    p.location,
    p.website,
    p.headline,
    p.social_links,
    p.follower_count,
    p.following_count,
    p.posts_count,
    p.privacy,
    p.phone_number,
    p.pronouns,
    p.contact_email,
    p.created_at,
    p.updated_at
  FROM public.profiles p 
  WHERE p.user_id = current_user_id;
  
  RAISE LOG 'Profile query completed for user: %', current_user_id;
END;
$$;
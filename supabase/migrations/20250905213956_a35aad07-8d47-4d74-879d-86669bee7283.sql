-- Add privacy field to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS privacy text DEFAULT 'public' CHECK (privacy IN ('public', 'private'));

-- Create follows table for follower relationships
CREATE TABLE IF NOT EXISTS public.follows (
  follower_id uuid NOT NULL,
  followed_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (follower_id, followed_id)
);

-- Add indices for performance
CREATE INDEX IF NOT EXISTS idx_profiles_privacy ON public.profiles(privacy);
CREATE INDEX IF NOT EXISTS idx_follows_followed ON public.follows(followed_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);

-- Enable RLS on follows table
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- RLS policies for follows table
CREATE POLICY "Users can view all follows" ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can create their own follows" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can delete their own follows" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- Create RPC function for secure profile viewing
CREATE OR REPLACE FUNCTION public.get_profile_for_viewer(viewer_id uuid, profile_user_id uuid)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  username text,
  display_name text,
  full_name text,
  bio text,
  role user_role,
  location text,
  website text,
  avatar_url text,
  cover_url text,
  phone_number text,
  artform artform_type,
  organization_type organization_type,
  headline text,
  social_links jsonb,
  portfolio_count integer,
  verified boolean,
  stats jsonb,
  pronouns text,
  contact_email text,
  privacy text,
  is_following boolean,
  can_view_full boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  profile_privacy text;
  is_owner boolean;
  is_follower boolean;
  can_view boolean;
BEGIN
  -- Check if viewer is the profile owner
  is_owner := (viewer_id = profile_user_id);
  
  -- Get profile privacy setting
  SELECT p.privacy INTO profile_privacy 
  FROM public.profiles p 
  WHERE p.user_id = profile_user_id;
  
  -- If no profile found, return empty
  IF profile_privacy IS NULL THEN
    RETURN;
  END IF;
  
  -- Check if viewer follows the profile owner
  SELECT EXISTS(
    SELECT 1 FROM public.follows 
    WHERE follower_id = viewer_id AND followed_id = profile_user_id
  ) INTO is_follower;
  
  -- Determine if viewer can see full profile
  can_view := is_owner OR profile_privacy = 'public' OR is_follower;
  
  -- Return profile data based on viewing permissions
  IF can_view THEN
    -- Full profile view
    RETURN QUERY
    SELECT 
      p.id, p.user_id, p.username, p.display_name, p.full_name, p.bio, p.role,
      p.location, p.website, p.avatar_url, p.cover_url, p.phone_number, 
      p.artform, p.organization_type, p.headline, p.social_links, 
      p.portfolio_count, p.verified, p.stats, p.pronouns, p.contact_email,
      p.privacy, is_follower, true as can_view_full, p.created_at, p.updated_at
    FROM public.profiles p
    WHERE p.user_id = profile_user_id;
  ELSE
    -- Minimal profile view (private account, non-follower)
    RETURN QUERY
    SELECT 
      p.id, p.user_id, p.username, p.display_name, 
      null::text as full_name, null::text as bio, p.role,
      p.location, null::text as website, p.avatar_url, null::text as cover_url, 
      null::text as phone_number, p.artform, p.organization_type, 
      null::text as headline, null::jsonb as social_links, 
      null::integer as portfolio_count, p.verified, null::jsonb as stats, 
      null::text as pronouns, null::text as contact_email,
      p.privacy, is_follower, false as can_view_full, p.created_at, p.updated_at
    FROM public.profiles p
    WHERE p.user_id = profile_user_id;
  END IF;
END;
$$;
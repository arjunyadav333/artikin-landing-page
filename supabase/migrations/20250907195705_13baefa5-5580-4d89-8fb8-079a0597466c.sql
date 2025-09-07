-- Create storage buckets for profile pictures and cover pictures
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-pictures', 'profile-pictures', true);
INSERT INTO storage.buckets (id, name, public) VALUES ('cover-pictures', 'cover-pictures', true);

-- Create storage policies for profile pictures
CREATE POLICY "Profile pictures are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profile-pictures');

CREATE POLICY "Users can upload their own profile picture" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own profile picture" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own profile picture" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create storage policies for cover pictures
CREATE POLICY "Cover pictures are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'cover-pictures');

CREATE POLICY "Users can upload their own cover picture" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'cover-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own cover picture" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'cover-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own cover picture" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'cover-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Add missing columns to profiles table if they don't exist
DO $$ 
BEGIN
  -- Add follower_count if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'follower_count'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN follower_count integer DEFAULT 0;
  END IF;

  -- Add following_count if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'following_count'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN following_count integer DEFAULT 0;
  END IF;

  -- Add posts_count if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'posts_count'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN posts_count integer DEFAULT 0;
  END IF;

  -- Add headline if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'headline'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN headline text;
  END IF;

  -- Add social_links if not exists
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'social_links'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN social_links jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Create function to get profile by username
CREATE OR REPLACE FUNCTION public.get_profile_by_username(username_param text)
RETURNS TABLE(
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
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    p.id,
    p.user_id,
    p.username,
    p.display_name,
    p.full_name,
    CASE 
      WHEN p.privacy = 'public' OR p.user_id = auth.uid() THEN p.bio
      ELSE NULL 
    END as bio,
    p.role,
    p.artform,
    p.organization_type,
    p.avatar_url,
    p.cover_url,
    CASE 
      WHEN p.privacy = 'public' OR p.user_id = auth.uid() THEN p.location
      ELSE NULL 
    END as location,
    CASE 
      WHEN p.privacy = 'public' OR p.user_id = auth.uid() THEN p.website
      ELSE NULL 
    END as website,
    p.headline,
    CASE 
      WHEN p.privacy = 'public' OR p.user_id = auth.uid() THEN p.social_links
      ELSE '{}'::jsonb 
    END as social_links,
    p.follower_count,
    p.following_count,
    p.posts_count,
    p.privacy,
    p.created_at,
    p.updated_at
  FROM public.profiles p 
  WHERE p.username = username_param
  AND (
    p.privacy = 'public' OR 
    p.user_id = auth.uid() OR
    (p.privacy = 'private' AND auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.connections 
      WHERE following_id = p.user_id AND follower_id = auth.uid()
    ))
  );
$$;

-- Create triggers to auto-update follower/following counts
CREATE OR REPLACE FUNCTION public.handle_connection_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Increment following count for follower
    UPDATE public.profiles 
    SET following_count = following_count + 1 
    WHERE user_id = NEW.follower_id;
    
    -- Increment follower count for followed user
    UPDATE public.profiles 
    SET follower_count = follower_count + 1 
    WHERE user_id = NEW.following_id;
    
  ELSIF TG_OP = 'DELETE' THEN
    -- Decrement following count for follower
    UPDATE public.profiles 
    SET following_count = following_count - 1 
    WHERE user_id = OLD.follower_id;
    
    -- Decrement follower count for followed user
    UPDATE public.profiles 
    SET follower_count = follower_count - 1 
    WHERE user_id = OLD.following_id;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Create trigger for connection count updates
DROP TRIGGER IF EXISTS trigger_connection_count ON public.connections;
CREATE TRIGGER trigger_connection_count
  AFTER INSERT OR DELETE ON public.connections
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_connection_count();

-- Create trigger to auto-update posts count
CREATE OR REPLACE FUNCTION public.handle_posts_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles 
    SET posts_count = posts_count + 1 
    WHERE user_id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles 
    SET posts_count = posts_count - 1 
    WHERE user_id = OLD.user_id;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Create trigger for posts count updates
DROP TRIGGER IF EXISTS trigger_posts_count ON public.posts;
CREATE TRIGGER trigger_posts_count
  AFTER INSERT OR DELETE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_posts_count();
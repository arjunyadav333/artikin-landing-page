-- Fix function search path mutable warnings by setting explicit search paths

-- Update existing functions to have explicit search_path settings
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public, auth
AS $$
BEGIN
  INSERT INTO public.profiles (
    user_id, 
    username, 
    display_name, 
    full_name,
    role,
    phone_number,
    artform,
    organization_type,
    bio,
    location
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', 'user_' || substr(NEW.id::text, 1, 8)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'display_name', 'New User'),
    NEW.raw_user_meta_data->>'full_name',
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' = 'artist' THEN 'artist'::public.user_role
      WHEN NEW.raw_user_meta_data->>'role' = 'organization' THEN 'organization'::public.user_role
      ELSE NULL
    END,
    NEW.raw_user_meta_data->>'phone_number',
    CASE 
      WHEN NEW.raw_user_meta_data->>'artform' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'artform')::public.artform_type
      ELSE NULL
    END,
    CASE 
      WHEN NEW.raw_user_meta_data->>'organization_type' IS NOT NULL 
      THEN (NEW.raw_user_meta_data->>'organization_type')::public.organization_type
      ELSE NULL
    END,
    NEW.raw_user_meta_data->>'bio',
    NEW.raw_user_meta_data->>'location'
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_profile_public_info(profile_user_id uuid)
RETURNS TABLE(id uuid, user_id uuid, username text, display_name text, avatar_url text, role user_role, artform artform_type, location text, privacy text, bio text, full_name text, phone_number text)
LANGUAGE sql
SET search_path = public
AS $$
  SELECT 
    p.id, 
    p.user_id, 
    p.username, 
    p.display_name, 
    p.avatar_url, 
    p.role, 
    p.artform, 
    CASE 
      WHEN p.privacy = 'public' OR p.user_id = auth.uid() THEN p.location
      ELSE NULL 
    END as location,
    p.privacy,
    CASE 
      WHEN p.privacy = 'public' OR p.user_id = auth.uid() THEN p.bio
      ELSE NULL 
    END as bio,
    -- Sensitive fields only for profile owner
    CASE 
      WHEN p.user_id = auth.uid() THEN p.full_name
      ELSE NULL 
    END as full_name,
    CASE 
      WHEN p.user_id = auth.uid() THEN p.phone_number  
      ELSE NULL
    END as phone_number
  FROM public.profiles p 
  WHERE p.user_id = profile_user_id
  AND (
    p.privacy = 'public' OR 
    p.user_id = auth.uid() OR
    (p.privacy = 'private' AND auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.connections 
      WHERE following_id = p.user_id AND follower_id = auth.uid()
    ))
  );
$$;
-- Create enums for user roles and specific types
CREATE TYPE public.user_role AS ENUM ('artist', 'organization');

CREATE TYPE public.artform_type AS ENUM (
  'actor',
  'dancer', 
  'model',
  'photographer',
  'videographer',
  'instrumentalist',
  'singer',
  'drawing',
  'painting'
);

CREATE TYPE public.organization_type AS ENUM (
  'director',
  'producer',
  'production_house',
  'casting_agency',
  'casting_director',
  'event_management',
  'individual_hirer',
  'institution',
  'others'
);

-- Update profiles table to match new schema requirements
ALTER TABLE public.profiles 
DROP COLUMN IF EXISTS role,
ADD COLUMN role public.user_role,
ADD COLUMN full_name TEXT,
ADD COLUMN phone_number TEXT,
ADD COLUMN artform public.artform_type,
ADD COLUMN organization_type public.organization_type;

-- Add unique constraint on username if it doesn't exist
ALTER TABLE public.profiles 
ADD CONSTRAINT unique_username UNIQUE (username);

-- Update the handle_new_user function to work with new schema
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'auth'
AS $function$
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
$function$
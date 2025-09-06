-- Update existing users' roles based on their artform/organization_type
UPDATE public.profiles 
SET role = 'artist'::public.user_role 
WHERE role IS NULL AND artform IS NOT NULL;

UPDATE public.profiles 
SET role = 'organization'::public.user_role 
WHERE role IS NULL AND organization_type IS NOT NULL;

-- Update the handle_new_user function to properly set roles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public', 'auth'
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
    -- Properly determine role based on signup data
    CASE 
      WHEN NEW.raw_user_meta_data->>'role' = 'artist' OR NEW.raw_user_meta_data->>'artform' IS NOT NULL 
      THEN 'artist'::public.user_role
      WHEN NEW.raw_user_meta_data->>'role' = 'organization' OR NEW.raw_user_meta_data->>'organization_type' IS NOT NULL 
      THEN 'organization'::public.user_role
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
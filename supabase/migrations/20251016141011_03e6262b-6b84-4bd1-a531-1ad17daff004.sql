-- Phase 1.2: Implement Proper User Roles System

-- Create enum for app roles (DROP and recreate if exists)
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('artist', 'organization');
  END IF;
END $$;

-- Create user_roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE (user_id, role)
);

-- Add foreign key constraint
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'user_roles_user_id_fkey'
  ) THEN
    ALTER TABLE public.user_roles
      ADD CONSTRAINT user_roles_user_id_fkey 
      FOREIGN KEY (user_id) 
      REFERENCES auth.users(id) 
      ON DELETE CASCADE;
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage all roles" ON public.user_roles;
CREATE POLICY "Service role can manage all roles"
  ON public.user_roles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Migrate existing role data from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT 
  user_id, 
  CASE 
    WHEN role::text = 'artist' THEN 'artist'::app_role
    WHEN role::text = 'organization' THEN 'organization'::app_role
  END as role
FROM public.profiles
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Update RLS policies that reference roles to use has_role() function

-- Update opportunities policies
DROP POLICY IF EXISTS "Organizations can create opportunities" ON public.opportunities;
CREATE POLICY "Organizations can create opportunities"
  ON public.opportunities
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id 
    AND public.has_role(auth.uid(), 'organization'::app_role)
  );

DROP POLICY IF EXISTS "Organizations can update their opportunities" ON public.opportunities;
CREATE POLICY "Organizations can update their opportunities"
  ON public.opportunities
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id 
    AND public.has_role(auth.uid(), 'organization'::app_role)
  );

DROP POLICY IF EXISTS "Organizations can delete their opportunities" ON public.opportunities;
CREATE POLICY "Organizations can delete their opportunities"
  ON public.opportunities
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id 
    AND public.has_role(auth.uid(), 'organization'::app_role)
  );

-- Update opportunity_applications policies
DROP POLICY IF EXISTS "Organizations can update applications for their opportunities" ON public.opportunity_applications;
CREATE POLICY "Organizations can update applications for their opportunities"
  ON public.opportunity_applications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 
      FROM public.opportunities o
      WHERE o.id = opportunity_applications.opportunity_id 
        AND o.user_id = auth.uid()
        AND public.has_role(auth.uid(), 'organization'::app_role)
    )
  );

-- Update notify_matching_opportunity function to use user_roles
CREATE OR REPLACE FUNCTION public.notify_matching_opportunity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Notify artists whose artform matches the opportunity
  IF NEW.art_forms IS NOT NULL AND array_length(NEW.art_forms, 1) > 0 THEN
    INSERT INTO public.notifications (user_id, type, title, message, link, opportunity_id)
    SELECT 
      ur.user_id,
      'opportunity',
      'New Opportunity',
      'New ' || NEW.title || ' opportunity in ' || COALESCE(NEW.location, 'your area'),
      '/opportunities/' || NEW.id,
      NEW.id
    FROM public.user_roles ur
    JOIN public.profiles p ON p.user_id = ur.user_id
    WHERE ur.role = 'artist'::app_role
      AND p.artform::text = ANY(NEW.art_forms)
      AND ur.user_id != NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for updated_at on user_roles
CREATE OR REPLACE FUNCTION public.update_user_roles_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_user_roles_updated_at_trigger ON public.user_roles;
CREATE TRIGGER update_user_roles_updated_at_trigger
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_user_roles_updated_at();

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
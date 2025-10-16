-- Phase 2: Data Persistence Fixes

-- ============================================================================
-- STEP 2.1: Create Portfolio and Saves Tables
-- ============================================================================

-- Create portfolios table
CREATE TABLE IF NOT EXISTS public.portfolios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  media_urls TEXT[] NOT NULL DEFAULT '{}',
  media_types TEXT[] NOT NULL DEFAULT '{}', -- 'image', 'video', 'document'
  media_meta JSONB DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  likes_count INTEGER DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create saves table for saved posts
CREATE TABLE IF NOT EXISTS public.saves (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_id, post_id)
);

-- Enable RLS
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saves ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies for portfolios
-- ============================================================================

CREATE POLICY "Public portfolios viewable by everyone"
  ON public.portfolios FOR SELECT
  USING (visibility = 'public' OR user_id = auth.uid());

CREATE POLICY "Users can create their own portfolios"
  ON public.portfolios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolios"
  ON public.portfolios FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolios"
  ON public.portfolios FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- RLS Policies for saves
-- ============================================================================

CREATE POLICY "Users can view their own saves"
  ON public.saves FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create saves"
  ON public.saves FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their saves"
  ON public.saves FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- Create triggers for updated_at
-- ============================================================================

CREATE TRIGGER update_portfolios_updated_at
  BEFORE UPDATE ON public.portfolios
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================================
-- Create indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON public.portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_visibility ON public.portfolios(visibility);
CREATE INDEX IF NOT EXISTS idx_portfolios_featured ON public.portfolios(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_saves_user_id ON public.saves(user_id);
CREATE INDEX IF NOT EXISTS idx_saves_post_id ON public.saves(post_id);

-- ============================================================================
-- STEP 2.2: Create Storage Bucket for Portfolios
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolios', 'portfolios', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 2.3: Update Storage RLS Policies to Use Secure has_role()
-- ============================================================================

-- First, drop old insecure policies
DROP POLICY IF EXISTS "Organizations can upload opportunity images" ON storage.objects;
DROP POLICY IF EXISTS "Organizations can update their opportunity images" ON storage.objects;
DROP POLICY IF EXISTS "Organizations can delete their opportunity images" ON storage.objects;

-- Create secure policies using has_role() function
CREATE POLICY "Organizations can upload opportunity images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'opportunities' 
    AND auth.uid() IS NOT NULL
    AND public.has_role(auth.uid(), 'organization'::app_role)
  );

CREATE POLICY "Organizations can update their opportunity images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'opportunities' 
    AND auth.uid() IS NOT NULL
    AND public.has_role(auth.uid(), 'organization'::app_role)
  );

CREATE POLICY "Organizations can delete their opportunity images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'opportunities' 
    AND auth.uid() IS NOT NULL
    AND public.has_role(auth.uid(), 'organization'::app_role)
  );

-- Portfolio storage policies
CREATE POLICY "Anyone can view portfolio files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'portfolios');

CREATE POLICY "Users can upload their portfolio files"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'portfolios' 
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can update their portfolio files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'portfolios' 
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Users can delete their portfolio files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'portfolios' 
    AND auth.uid() IS NOT NULL
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================================
-- STEP 2.4: Create functions for saves count
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_save_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts 
    SET saves_count = saves_count + 1 
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts 
    SET saves_count = GREATEST(0, saves_count - 1)
    WHERE id = OLD.post_id;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Create trigger for save count
DROP TRIGGER IF EXISTS handle_save_count_trigger ON public.saves;
CREATE TRIGGER handle_save_count_trigger
  AFTER INSERT OR DELETE ON public.saves
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_save_count();
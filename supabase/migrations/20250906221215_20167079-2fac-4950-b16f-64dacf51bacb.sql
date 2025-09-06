-- Add new columns to opportunities table for the enhanced job posting feature
ALTER TABLE public.opportunities 
ADD COLUMN IF NOT EXISTS organization_name text,
ADD COLUMN IF NOT EXISTS city text,
ADD COLUMN IF NOT EXISTS state text,
ADD COLUMN IF NOT EXISTS art_forms text[],
ADD COLUMN IF NOT EXISTS experience_level text,
ADD COLUMN IF NOT EXISTS gender_preference text[],
ADD COLUMN IF NOT EXISTS language_preference text[],
ADD COLUMN IF NOT EXISTS image_url text;

-- Create storage bucket for opportunity images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('opportunities', 'opportunities', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for opportunity images
CREATE POLICY "Organizations can upload opportunity images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'opportunities' AND 
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'organization'
  )
);

CREATE POLICY "Opportunity images are publicly viewable" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'opportunities');

CREATE POLICY "Organizations can update their opportunity images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'opportunities' AND 
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'organization'
  )
);

CREATE POLICY "Organizations can delete their opportunity images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'opportunities' AND 
  auth.uid() IS NOT NULL AND
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'organization'
  )
);
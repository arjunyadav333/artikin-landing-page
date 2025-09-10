-- Create storage policies for opportunities bucket if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('opportunities', 'opportunities', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for opportunity images
CREATE POLICY "Anyone can view opportunity images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'opportunities');

CREATE POLICY "Organizations can upload opportunity images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'opportunities' 
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'organization'
  )
);

CREATE POLICY "Organizations can update their opportunity images" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'opportunities' 
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'organization'
  )
);

CREATE POLICY "Organizations can delete their opportunity images" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'opportunities' 
  AND auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'organization'
  )
);
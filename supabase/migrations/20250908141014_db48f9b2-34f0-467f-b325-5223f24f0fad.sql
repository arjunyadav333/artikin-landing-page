-- Create storage buckets for profile and cover pictures
INSERT INTO storage.buckets (id, name, public) 
VALUES 
  ('profile-pictures', 'profile-pictures', true),
  ('cover-pictures', 'cover-pictures', true)
ON CONFLICT (id) DO NOTHING;

-- Create RLS policies for profile pictures bucket
CREATE POLICY "Anyone can view profile pictures" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'profile-pictures');

CREATE POLICY "Users can upload their own profile pictures" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own profile pictures" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own profile pictures" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Create RLS policies for cover pictures bucket
CREATE POLICY "Anyone can view cover pictures" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'cover-pictures');

CREATE POLICY "Users can upload their own cover pictures" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'cover-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own cover pictures" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'cover-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own cover pictures" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'cover-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);
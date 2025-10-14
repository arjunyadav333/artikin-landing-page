-- Create posts storage bucket for user-generated content
INSERT INTO storage.buckets (id, name, public)
VALUES ('posts', 'posts', true)
ON CONFLICT (id) DO NOTHING;

-- RLS Policies for posts bucket
CREATE POLICY "Anyone can view posts bucket files"
ON storage.objects FOR SELECT
USING (bucket_id = 'posts');

CREATE POLICY "Authenticated users can upload to posts bucket"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'posts' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can update their own posts bucket files"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'posts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own posts bucket files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'posts' AND
  auth.uid()::text = (storage.foldername(name))[1]
);
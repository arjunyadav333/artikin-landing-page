-- Create storage policies for messaging buckets

-- Storage policies for chat-images bucket
CREATE POLICY "Users can upload their own images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'chat-images' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view images in their conversations" ON storage.objects
FOR SELECT USING (
  bucket_id = 'chat-images' 
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR EXISTS (
      SELECT 1 FROM message_attachments ma
      JOIN messages m ON m.id = ma.message_id
      JOIN conversations c ON c.id = m.conversation_id
      WHERE ma.file_url LIKE '%' || name 
      AND (
        c.participant_a::text = auth.uid()::text 
        OR c.participant_b::text = auth.uid()::text
      )
    )
  )
);

-- Storage policies for chat-videos bucket
CREATE POLICY "Users can upload their own videos" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'chat-videos' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view videos in their conversations" ON storage.objects
FOR SELECT USING (
  bucket_id = 'chat-videos' 
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR EXISTS (
      SELECT 1 FROM message_attachments ma
      JOIN messages m ON m.id = ma.message_id
      JOIN conversations c ON c.id = m.conversation_id
      WHERE ma.file_url LIKE '%' || name 
      AND (
        c.participant_a::text = auth.uid()::text 
        OR c.participant_b::text = auth.uid()::text
      )
    )
  )
);

-- Storage policies for chat-docs bucket
CREATE POLICY "Users can upload their own documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'chat-docs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view documents in their conversations" ON storage.objects
FOR SELECT USING (
  bucket_id = 'chat-docs' 
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR EXISTS (
      SELECT 1 FROM message_attachments ma
      JOIN messages m ON m.id = ma.message_id
      JOIN conversations c ON c.id = m.conversation_id
      WHERE ma.file_url LIKE '%' || name 
      AND (
        c.participant_a::text = auth.uid()::text 
        OR c.participant_b::text = auth.uid()::text
      )
    )
  )
);

-- Storage policies for chat-voice bucket
CREATE POLICY "Users can upload their own voice messages" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'chat-voice' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view voice messages in their conversations" ON storage.objects
FOR SELECT USING (
  bucket_id = 'chat-voice' 
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR EXISTS (
      SELECT 1 FROM message_attachments ma
      JOIN messages m ON m.id = ma.message_id
      JOIN conversations c ON c.id = m.conversation_id
      WHERE ma.file_url LIKE '%' || name 
      AND (
        c.participant_a::text = auth.uid()::text 
        OR c.participant_b::text = auth.uid()::text
      )
    )
  )
);

-- Storage policies for chat-thumbs bucket
CREATE POLICY "Users can upload their own thumbnails" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'chat-thumbs' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view thumbnails in their conversations" ON storage.objects
FOR SELECT USING (
  bucket_id = 'chat-thumbs' 
  AND (
    auth.uid()::text = (storage.foldername(name))[1]
    OR EXISTS (
      SELECT 1 FROM message_attachments ma
      JOIN messages m ON m.id = ma.message_id
      JOIN conversations c ON c.id = m.conversation_id
      WHERE ma.file_url LIKE '%' || name 
      AND (
        c.participant_a::text = auth.uid()::text 
        OR c.participant_b::text = auth.uid()::text
      )
    )
  )
);
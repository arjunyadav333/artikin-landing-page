import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface UploadOptions {
  bucket: 'profile-pictures' | 'cover-pictures';
  userId: string;
  type: 'avatar' | 'cover';
  maxWidth?: number;
  maxHeight?: number;
}

export function useImageUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const compressImage = async (
    file: Blob,
    maxWidth: number,
    maxHeight: number
  ): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      img.onload = () => {
        let { width, height } = img;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Canvas to Blob conversion failed'));
            }
          },
          'image/jpeg',
          0.85
        );
      };

      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const uploadImage = async (
    croppedImage: Blob,
    options: UploadOptions
  ): Promise<string> => {
    const { bucket, userId, type, maxWidth = 1500, maxHeight = 1500 } = options;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Compress image
      setUploadProgress(20);
      const compressedImage = await compressImage(croppedImage, maxWidth, maxHeight);

      // Delete old image if exists
      setUploadProgress(40);
      const { data: existingFiles } = await supabase.storage
        .from(bucket)
        .list(userId);

      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map((file) => `${userId}/${file.name}`);
        await supabase.storage.from(bucket).remove(filesToDelete);
      }

      // Upload new image
      setUploadProgress(60);
      const timestamp = Date.now();
      const fileName = `${userId}/${type}_${timestamp}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(fileName, compressedImage, {
          contentType: 'image/jpeg',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      setUploadProgress(80);
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(fileName);

      // Update profile
      setUploadProgress(90);
      const updateField = type === 'avatar' ? 'avatar_url' : 'cover_url';
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ [updateField]: urlData.publicUrl })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      setUploadProgress(100);

      // Invalidate queries to refresh profile data
      queryClient.invalidateQueries({ queryKey: ['currentProfile'] });
      queryClient.invalidateQueries({ queryKey: ['profile', userId] });

      toast({
        title: 'Success',
        description: `${type === 'avatar' ? 'Profile picture' : 'Cover image'} updated successfully`,
      });

      return urlData.publicUrl;
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Upload failed',
        description: error.message || 'Failed to upload image',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return {
    uploadImage,
    isUploading,
    uploadProgress,
  };
}

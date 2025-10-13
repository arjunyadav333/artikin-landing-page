import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      // First, get the post to retrieve media URLs
      const { data: post } = await supabase
        .from('posts')
        .select('media_urls')
        .eq('id', postId)
        .single();

      // Delete media files from storage if they exist
      if (post?.media_urls && post.media_urls.length > 0) {
        const deletePromises = post.media_urls.map(async (url: string) => {
          try {
            // Extract filename from URL
            const urlParts = url.split('/');
            const fileName = urlParts[urlParts.length - 1];
            
            if (fileName) {
              await supabase.storage
                .from('posts')
                .remove([fileName]);
            }
          } catch (error) {
            console.error('Failed to delete media file:', url, error);
            // Continue with post deletion even if media deletion fails
          }
        });

        await Promise.allSettled(deletePromises);
      }

      // Delete the post record
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) throw error;
    },
    onSuccess: () => {
      // Invalidate all post-related queries to ensure the deleted post is removed everywhere
      queryClient.invalidateQueries({ queryKey: ['homeFeed'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['userPosts'] }); // Remove from user profile posts
      queryClient.invalidateQueries({ queryKey: ['tagPosts'] }); // Remove from tag feeds
      queryClient.invalidateQueries({ queryKey: ['comments'] }); // Remove associated comments
    },
    onError: (error: any) => {
      // Error handling without toast
      console.error('Failed to delete post:', error);
    }
  });
};
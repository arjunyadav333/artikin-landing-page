import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useDeletePost = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
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
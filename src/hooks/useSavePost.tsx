import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SavePostParams {
  postId: string;
  isSaved: boolean;
}

export const useSavePost = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ postId, isSaved }: SavePostParams) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (isSaved) {
        // Remove save
        const { error } = await supabase
          .from('saves')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        
        if (error) throw error;
        return { action: 'unsaved', postId };
      } else {
        // Add save
        const { error } = await supabase
          .from('saves')
          .insert({
            post_id: postId,
            user_id: user.id
          });
        
        if (error) throw error;
        return { action: 'saved', postId };
      }
    },
    onMutate: async ({ postId, isSaved }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['posts'] });

      // Snapshot the previous value
      const previousPosts = queryClient.getQueryData(['posts']);

      // Optimistically update
      queryClient.setQueryData(['posts'], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            map: (post: any) =>
              post.id === postId
                ? {
                    ...post,
                    user_saved: !isSaved,
                    saves_count: isSaved ? post.saves_count - 1 : post.saves_count + 1,
                  }
                : post,
          })),
        };
      });

      return { previousPosts };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousPosts) {
        queryClient.setQueryData(['posts'], context.previousPosts);
      }
      
      toast({
        title: "Save failed",
        description: "There was an error saving the post. Please try again.",
        variant: "destructive",
      });
    },
    onSuccess: ({ action }) => {
      toast({
        title: action === 'saved' ? "Post saved!" : "Post unsaved",
        description: action === 'saved' 
          ? "Post has been saved to your collection." 
          : "Post has been removed from your saved collection.",
      });
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
  });
};
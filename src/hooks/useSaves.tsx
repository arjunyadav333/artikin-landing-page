import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Save {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

export const useSavedPosts = () => {
  return useQuery({
    queryKey: ['saved-posts'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Since saves table doesn't exist yet, return empty array
      // This will be implemented when the saves table is created
      return [];
    }
  });
};

export const useSavePost = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ postId, isSaved }: { postId: string; isSaved: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Since saves table doesn't exist yet, just simulate the action
      // This will be implemented when the saves table is created
      
      if (isSaved) {
        return { action: 'unsaved' };
      } else {
        return { action: 'saved' };
      }
    },
    onMutate: async ({ postId, isSaved }) => {
      // Optimistic update for posts query
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      
      const previousPosts = queryClient.getQueryData(['posts']);
      
      queryClient.setQueryData(['posts'], (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          pages: old.pages.map((page: any) => 
            page.map((post: any) => 
              post.id === postId 
                ? { ...post, user_saved: !isSaved }
                : post
            )
          )
        };
      });

      return { previousPosts };
    },
    onSuccess: (data) => {
      toast({
        title: data.action === 'saved' ? 'Post saved' : 'Post unsaved',
        description: data.action === 'saved' 
          ? 'Post has been saved to your collection' 
          : 'Post has been removed from your collection'
      });
    },
    onError: (error, variables, context) => {
      // Revert optimistic update
      if (context?.previousPosts) {
        queryClient.setQueryData(['posts'], context.previousPosts);
      }
      
      toast({
        title: 'Failed to save post',
        description: error.message,
        variant: "destructive"
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['saved-posts'] });
    }
  });
};
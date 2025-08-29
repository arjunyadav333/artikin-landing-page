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

      // Use type assertion since saves table exists but types not updated
      const { data, error } = await (supabase as any)
        .from('saves')
        .select(`
          id,
          created_at,
          posts!inner(
            *,
            profiles:profiles!posts_user_id_fkey(*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data?.map((save: any) => save.posts) || [];
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

      if (isSaved) {
        // Unsave the post
        const { error } = await (supabase as any)
          .from('saves')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);
        
        if (error) throw error;
        return { action: 'unsaved' };
      } else {
        // Save the post
        const { error } = await (supabase as any)
          .from('saves')
          .insert({ user_id: user.id, post_id: postId });
        
        if (error) throw error;
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
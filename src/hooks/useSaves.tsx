import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Save {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
}

/**
 * Check if a post is saved by the current user
 */
export const useIsPostSaved = (postId?: string) => {
  return useQuery({
    queryKey: ['postSaved', postId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('saves')
        .select('id')
        .eq('post_id', postId!)
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return !!data;
    },
    enabled: !!postId,
    staleTime: 30 * 1000, // 30 seconds
  });
};

/**
 * Get all saved posts for the current user
 */
export const useUserSaves = () => {
  return useQuery({
    queryKey: ['userSaves'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('saves')
        .select(`
          *,
          posts:post_id (
            *,
            profiles:user_id (
              id,
              user_id,
              username,
              display_name,
              avatar_url,
              role,
              artform,
              organization_type
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    staleTime: 60 * 1000, // 1 minute
  });
};

/**
 * Toggle save status of a post
 */
export const useToggleSave = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ postId, isSaved }: { postId: string; isSaved: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (isSaved) {
        // Unsave - delete the record
        const { error } = await supabase
          .from('saves')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);

        if (error) throw error;
        return { action: 'unsaved', postId };
      } else {
        // Save - insert new record
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
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['postSaved', postId] });

      // Snapshot previous value
      const previousSaveStatus = queryClient.getQueryData(['postSaved', postId]);

      // Optimistically update
      queryClient.setQueryData(['postSaved', postId], !isSaved);

      return { previousSaveStatus, postId };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context) {
        queryClient.setQueryData(['postSaved', context.postId], context.previousSaveStatus);
      }
      toast({
        title: "Failed to update save",
        description: "Please try again.",
        variant: "destructive"
      });
    },
    onSuccess: ({ action }) => {
      queryClient.invalidateQueries({ queryKey: ['userSaves'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      
      toast({
        title: action === 'saved' ? "Post saved" : "Post unsaved",
        description: action === 'saved' 
          ? "Post added to your saved items" 
          : "Post removed from your saved items"
      });
    },
  });
};

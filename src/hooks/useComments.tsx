import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  likes_count: number;
  user_liked?: boolean;
  created_at: string;
  updated_at: string;
  profiles?: {
    id: string;
    display_name: string;
    username: string;
    avatar_url?: string;
    role?: 'artist' | 'organization';
    artform?: string;
  };
}

export const useComments = (postId: string) => {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          post_id,
          user_id,
          content,
          likes_count,
          created_at,
          updated_at
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Get profile data for each comment and check likes
      if (data && data.length > 0) {
        const userIds = [...new Set(data.map(comment => comment.user_id))];
        
        // Fetch profiles
        const { data: profiles } = await supabase
          .from('profiles')
          .select('user_id, id, display_name, username, avatar_url, role, artform')
          .in('user_id', userIds);
        
        const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
        
        // Check likes if user is authenticated
        let likedCommentIds = new Set<string>();
        if (user) {
          const commentIds = data.map(comment => comment.id);
          const { data: likes } = await supabase
            .from('likes')
            .select('comment_id')
            .eq('user_id', user.id)
            .in('comment_id', commentIds);
          
          likedCommentIds = new Set(likes?.map(like => like.comment_id) || []);
        }

        return data.map(comment => ({
          ...comment,
          user_liked: likedCommentIds.has(comment.id),
          profiles: profileMap.get(comment.user_id)
        })) as Comment[];
      }

      return [];
    },
    enabled: !!postId
  });
};

export const useCreateComment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ postId, content }: { postId: string; content: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          user_id: user.id,
          content: content.trim()
        })
        .select('id, post_id, user_id, content, likes_count, created_at, updated_at')
        .single();

      if (error) throw error;
      
      // Get user profile for the new comment
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id, id, display_name, username, avatar_url, role, artform')
        .eq('user_id', user.id)
        .single();
      
      return { ...data, profiles: profile };
    },
    onSuccess: (newComment) => {
      // Update comments list
      queryClient.setQueryData(['comments', newComment.post_id], (old: Comment[] | undefined) => {
        if (!old) return [newComment];
        return [...old, newComment];
      });

      // Update post comments count
      queryClient.setQueryData(['posts'], (oldData: any) => {
        if (!oldData) return oldData;
        
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => 
            page.map((post: any) => 
              post.id === newComment.post_id 
                ? { ...post, comments_count: post.comments_count + 1 }
                : post
            )
          )
        };
      });

      toast({
        title: "Comment posted",
        description: "Your comment has been added successfully."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to post comment",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};

export const useLikeComment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ commentId, isLiked }: { commentId: string; isLiked: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (isLiked) {
        // Remove like
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('comment_id', commentId);
        
        if (error) throw error;
        return { action: 'unliked' };
      } else {
        // Add like
        const { error } = await supabase
          .from('likes')
          .insert({
            user_id: user.id,
            comment_id: commentId
          });
        
        if (error) throw error;
        return { action: 'liked' };
      }
    },
    onMutate: async ({ commentId, isLiked }) => {
      // Find which post this comment belongs to
      let postId: string | null = null;
      const queryCache = queryClient.getQueryCache();
      
      queryCache.findAll({ queryKey: ['comments'] }).forEach(query => {
        const data = query.state.data as Comment[] | undefined;
        if (data) {
          const comment = data.find(c => c.id === commentId);
          if (comment) {
            postId = comment.post_id;
          }
        }
      });

      if (postId) {
        // Optimistic update for comments
        await queryClient.cancelQueries({ queryKey: ['comments', postId] });
        
        const previousComments = queryClient.getQueryData(['comments', postId]);
        
        queryClient.setQueryData(['comments', postId], (old: Comment[] | undefined) => {
          if (!old) return old;
          
          return old.map(comment => 
            comment.id === commentId
              ? { 
                  ...comment, 
                  user_liked: !isLiked,
                  likes_count: comment.likes_count + (isLiked ? -1 : 1)
                }
              : comment
          );
        });

        return { previousComments, postId };
      }
    },
    onError: (error, variables, context) => {
      // Revert optimistic update
      if (context?.previousComments && context.postId) {
        queryClient.setQueryData(['comments', context.postId], context.previousComments);
      }
      
      toast({
        title: 'Failed to like comment',
        description: error.message,
        variant: "destructive"
      });
    },
    onSettled: (data, error, variables, context) => {
      if (context?.postId) {
        queryClient.invalidateQueries({ queryKey: ['comments', context.postId] });
      }
    }
  });
};
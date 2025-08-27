import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  likes_count?: number;
  profiles?: {
    id: string;
    user_id: string;
    display_name: string;
    username: string;
    avatar_url?: string;
  };
}

export const useComments = (postId?: string) => {
  return useQuery({
    queryKey: ['comments', postId],
    queryFn: async () => {
      if (!postId) return [];
      
      // First get the comments
      const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;
      if (!comments || comments.length === 0) return [];

      // Get user ids from comments
      const userIds = comments.map(comment => comment.user_id);
      
      // Get profiles for those users
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, user_id, display_name, username, avatar_url')
        .in('user_id', userIds);

      if (profilesError) throw profilesError;

      // Combine comments with profiles
      const commentsWithProfiles = comments.map(comment => ({
        ...comment,
        profiles: profiles?.find(profile => profile.user_id === comment.user_id) || null
      }));

      return commentsWithProfiles as Comment[];
    },
    enabled: !!postId,
    refetchOnWindowFocus: true,
    refetchInterval: 30000, // Refetch every 30 seconds for real-time feel
  });
};

export const useAddComment = () => {
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
          content,
        })
        .select('*')
        .single();

      if (error) throw error;
      
      // Get user profile separately
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, user_id, display_name, username, avatar_url')
        .eq('user_id', user.id)
        .single();

      return {
        ...data,
        profiles: profile
      };
    },
    onSuccess: (_, { postId }) => {
      queryClient.invalidateQueries({ queryKey: ['comments', postId] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to add comment",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

// Real-time subscription hook for comments
export const useCommentSubscription = (postId?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!postId) return;

    const channel = supabase
      .channel(`comments-${postId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${postId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['comments', postId] });
          queryClient.invalidateQueries({ queryKey: ['posts'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [postId, queryClient]);
};

import { useEffect } from 'react';
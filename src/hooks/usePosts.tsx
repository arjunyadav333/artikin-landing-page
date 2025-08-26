import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Post {
  id: string;
  user_id: string;
  title?: string;
  content: string;
  media_urls?: string[];
  media_type: string;
  tags?: string[];
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    id: string;
    username: string;
    display_name: string;
    avatar_url?: string;
    role?: string;
  };
  user_liked?: boolean;
}

export const usePosts = (limit = 10) => {
  return useInfiniteQuery({
    queryKey: ['posts', limit],
    queryFn: async ({ pageParam = 0 }) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Fetch posts with better range query
      const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .order('created_at', { ascending: false })
        .range(pageParam * limit, (pageParam + 1) * limit - 1);

      if (error) throw error;
      if (!posts?.length) return [];

      // Get unique user IDs for profile lookup
      const userIds = [...new Set(posts.map(p => p.user_id))];
      
      // Batch fetch profiles for all users
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url, role')
        .in('user_id', userIds);

      // Create profile lookup map for O(1) access
      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Batch fetch likes if user is authenticated
      let likedPostIds = new Set();
      if (user) {
        const { data: likes } = await supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', posts.map(p => p.id));
        
        likedPostIds = new Set(likes?.map(l => l.post_id) || []);
      }

      // Combine data efficiently
      const processedPosts = posts.map(post => ({
        ...post,
        profiles: profileMap.get(post.user_id),
        user_liked: likedPostIds.has(post.id)
      }));

      // Sort to show user's posts first (optimized)
      if (user) {
        return processedPosts.sort((a, b) => {
          const aIsUser = a.user_id === user.id;
          const bIsUser = b.user_id === user.id;
          if (aIsUser && !bIsUser) return -1;
          if (!aIsUser && bIsUser) return 1;
          return 0;
        });
      }

      return processedPosts;
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage.length === limit ? pages.length : undefined;
    },
    initialPageParam: 0,
    // Advanced caching configuration
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

export const useUserPosts = (userId: string) => {
  return useQuery({
    queryKey: ['userPosts', userId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Fetch user posts
      const { data: posts, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!posts?.length) return [];

      // Get profile for the user
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url, role')
        .eq('user_id', userId)
        .single();

      // Get likes if current user is authenticated
      let likedPostIds = new Set();
      if (user) {
        const { data: likes } = await supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', posts.map(p => p.id));
        
        likedPostIds = new Set(likes?.map(l => l.post_id) || []);
      }

      // Combine data
      return posts.map(post => ({
        ...post,
        profiles: profile,
        user_liked: likedPostIds.has(post.id)
      }));
    },
    enabled: !!userId,
    // Advanced caching
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (newPost: {
      title?: string;
      content: string;
      media_urls?: string[];
      media_type?: string;
      tags?: string[];
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('posts')
        .insert({
          ...newPost,
          user_id: user.id
        })
        .select('*')
        .single();

      if (error) throw error;
      
      // Get profile for the created post
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url, role')
        .eq('user_id', user.id)
        .single();

      return {
        ...data,
        profiles: profile,
        user_liked: false
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      toast({
        title: "Post created",
        description: "Your post has been successfully published."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create post",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};

export const useLikePost = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: string; isLiked: boolean }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);
        
        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert({
            user_id: user.id,
            post_id: postId
          });
        
        if (error) throw error;
      }
    },
    // Optimistic updates for better UX
    onMutate: async ({ postId, isLiked }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      
      // Snapshot previous value
      const previousPosts = queryClient.getQueryData(['posts']);
      
      // Optimistically update
      queryClient.setQueryData(['posts'], (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          pages: old.pages.map((page: any) =>
            page.map((post: any) =>
              post.id === postId
                ? {
                    ...post,
                    user_liked: !isLiked,
                    likes_count: isLiked ? post.likes_count - 1 : post.likes_count + 1
                  }
                : post
            )
          )
        };
      });
      
      return { previousPosts };
    },
    onError: (error: any, variables, context) => {
      // Rollback on error
      if (context?.previousPosts) {
        queryClient.setQueryData(['posts'], context.previousPosts);
      }
      toast({
        title: "Action failed",
        description: error.message,
        variant: "destructive"
      });
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    }
  });
};
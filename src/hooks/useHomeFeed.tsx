import { useState, useEffect, useCallback } from 'react';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface FeedPost {
  id: string;
  user_id: string;
  title?: string;
  content: string;
  media_urls?: string[];
  media_types?: string[];
  tags?: string[];
  visibility: 'public' | 'connections' | 'private';
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  updated_at: string;
  profile: {
    id: string;
    username: string;
    display_name: string;
    avatar_url?: string;
    role?: string;
    artform?: string;
    organization_type?: string;
  };
  is_liked?: boolean;
  is_following?: boolean;  
}

interface FeedPage {
  posts: FeedPost[];
  nextPage?: number;
}

const POSTS_PER_PAGE = 20;

export const useHomeFeed = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newPostsAvailable, setNewPostsAvailable] = useState(false);

  // Fetch feed posts with infinite scrolling
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch,
  } = useInfiniteQuery<FeedPage, Error>({
    queryKey: ['home-feed', user?.id],
    initialPageParam: 0,
    queryFn: async ({ pageParam = 0 }) => {
      if (!user) throw new Error('User not authenticated');

      const offset = (pageParam as number) * POSTS_PER_PAGE;

      // Get posts with profile data
      const { data: posts, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,  
          profiles (
            id,
            username,
            display_name,
            avatar_url,
            role,
            artform,
            organization_type
          )
        `)
        .eq('visibility', 'public')
        .order('created_at', { ascending: false })
        .range(offset, offset + POSTS_PER_PAGE - 1);

      if (postsError) throw postsError;

      // Get user's likes for these posts
      const postIds = posts?.map(p => p.id) || [];
      const { data: likes } = await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', user.id)
        .in('post_id', postIds);

      // Get user's follows
      const authorIds = posts?.map(p => p.user_id) || [];
      const { data: follows } = await supabase
        .from('connections')
        .select('following_id')
        .eq('follower_id', user.id)
        .in('following_id', authorIds);

      const likedPostIds = new Set(likes?.map(l => l.post_id) || []);
      const followingIds = new Set(follows?.map(f => f.following_id) || []);

      // Transform data
      const transformedPosts: FeedPost[] = posts?.map(post => ({
        ...post,
        profile: post.profiles as any,
        is_liked: likedPostIds.has(post.id),
        is_following: followingIds.has(post.user_id),
        visibility: post.visibility as 'public' | 'connections' | 'private',
      })) || [];

      return {
        posts: transformedPosts,
        nextPage: posts?.length === POSTS_PER_PAGE ? (pageParam as number) + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    enabled: !!user,
  });

  // Set up real-time subscriptions
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('home-feed-updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        (payload) => {
          console.log('New post:', payload);
          setNewPostsAvailable(true);
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'likes' },
        (payload) => {
          console.log('Like update:', payload);
          queryClient.invalidateQueries({ queryKey: ['home-feed'] });
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments' },
        (payload) => {
          console.log('Comment update:', payload);
          queryClient.invalidateQueries({ queryKey: ['home-feed'] });
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'shares' },
        (payload) => {
          console.log('Share update:', payload);
          queryClient.invalidateQueries({ queryKey: ['home-feed'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  // Load new posts
  const loadNewPosts = useCallback(() => {
    setNewPostsAvailable(false);
    refetch();
  }, [refetch]);

  // All posts from all pages
  const posts = data?.pages.flatMap(page => page.posts) || [];

  return {
    posts,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    newPostsAvailable,
    loadNewPosts,
    refetch,
  };
};

// Hook for liking posts
export const useLikePost = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: string; isLiked: boolean }) => {
      if (!user) throw new Error('User not authenticated');

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
          .insert({ user_id: user.id, post_id: postId });
        if (error) throw error;
      }

      return { postId, isLiked: !isLiked };
    },
    onMutate: async ({ postId, isLiked }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['home-feed'] });

      const previousData = queryClient.getQueryData(['home-feed', user?.id]);

      queryClient.setQueryData(['home-feed', user?.id], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((post: FeedPost) =>
              post.id === postId
                ? {
                    ...post,
                    is_liked: !isLiked,
                    likes_count: isLiked ? post.likes_count - 1 : post.likes_count + 1,
                  }
                : post
            ),
          })),
        };
      });

      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['home-feed', user?.id], context.previousData);
      }
      toast({
        title: 'Error',
        description: 'Failed to update like status',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['home-feed'] });
    },
  });
};

// Hook for following users
export const useFollowUser = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, isFollowing }: { userId: string; isFollowing: boolean }) => {
      if (!user) throw new Error('User not authenticated');

      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('connections')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', userId);
        if (error) throw error;
      } else {
        // Follow
        const { error } = await supabase
          .from('connections')
          .insert({ follower_id: user.id, following_id: userId });
        if (error) throw error;
      }

      return { userId, isFollowing: !isFollowing };
    },
    onMutate: async ({ userId, isFollowing }) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['home-feed'] });

      const previousData = queryClient.getQueryData(['home-feed', user?.id]);

      queryClient.setQueryData(['home-feed', user?.id], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          pages: old.pages.map((page: any) => ({
            ...page,
            posts: page.posts.map((post: FeedPost) =>
              post.user_id === userId
                ? { ...post, is_following: !isFollowing }
                : post
            ),
          })),
        };
      });

      return { previousData };  
    },
    onError: (err, variables, context) => {
      // Rollback optimistic update
      if (context?.previousData) {
        queryClient.setQueryData(['home-feed', user?.id], context.previousData);
      }
      toast({
        title: 'Error',
        description: 'Failed to update follow status',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['home-feed'] });
    },
  });
};

// Hook for sharing posts
export const useSharePost = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('shares')
        .insert({ user_id: user.id, post_id: postId });
      if (error) throw error;

      return postId;
    },
    onSuccess: () => {
      toast({
        title: 'Success',
        description: 'Post shared successfully',
      });
      queryClient.invalidateQueries({ queryKey: ['home-feed'] });
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to share post',
        variant: 'destructive',
      });
    },
  });
};
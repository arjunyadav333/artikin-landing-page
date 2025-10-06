import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

export interface PostProfile {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  full_name?: string;
  handle?: string;
  account_type?: 'artist' | 'organization';
  art_form?: string;
  avatar_url?: string;
  profile_pic?: string;
  role?: string;
  artform?: string;
  organization_type?: string;
  location?: string;
}

export interface HomeFeedPost {
  id: string;
  user_id: string;
  title?: string;
  content: string;
  media_urls?: string[];
  media_types?: string[];
  tags?: string[];
  visibility?: string;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  created_at: string;
  updated_at: string;
  profiles: PostProfile;
  user_liked?: boolean;
  is_following?: boolean;
}

export const useHomeFeed = (limit = 20) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchPosts = async ({ pageParam = 0 }) => {
    // Fetch posts with visibility rules using secure view
    let query = supabase
      .from('posts_with_profiles_secure')
      .select('*')
      .order('created_at', { ascending: false })
      .range(pageParam * limit, (pageParam + 1) * limit - 1);

    const { data: posts, error } = await query;
    if (error) throw error;

    if (!posts?.length) return [];

    // Get user interactions if authenticated
    let likedPostIds = new Set();
    let followedUserIds = new Set();
    
    if (user) {
      const postIds = posts.map(p => p.id);
      const userIds = [...new Set(posts.map(p => p.user_id))];

      const [{ data: likes }, { data: follows }] = await Promise.all([
        supabase
          .from('likes')
          .select('post_id')
          .eq('user_id', user.id)
          .in('post_id', postIds),
        supabase
          .from('connections')
          .select('following_id')
          .eq('follower_id', user.id)
          .in('following_id', userIds)
      ]);

      likedPostIds = new Set(likes?.map(l => l.post_id) || []);
      followedUserIds = new Set(follows?.map(f => f.following_id) || []);
    }

    // Transform data to match interface
    return posts.map(post => ({
      id: post.id,
      user_id: post.user_id,
      title: post.title,
      content: post.content,
      media_urls: post.media_urls,
      media_types: post.media_urls ? post.media_urls.map(() => 'image') : [], // Default to image type
      tags: post.tags,
      visibility: 'public',
      likes_count: post.likes_count || 0,
      comments_count: post.comments_count || 0,
      shares_count: post.shares_count || 0,
      created_at: post.created_at,
      updated_at: post.updated_at,
      profiles: {
        id: post.user_id,
        user_id: post.user_id,
        username: post.profile_username || 'user',
        display_name: post.profile_display_name || 'User',
        full_name: post.profile_display_name,
        handle: post.profile_username,
        account_type: (post.profile_role === 'artist' ? 'artist' : 'organization') as 'artist' | 'organization',
        art_form: post.profile_artform,
        avatar_url: post.profile_avatar_url,
        profile_pic: post.profile_avatar_url,
        role: post.profile_role,
        artform: post.profile_artform,
        organization_type: post.profile_organization_type,
        location: post.profile_location
      },
      user_liked: likedPostIds.has(post.id),
      is_following: followedUserIds.has(post.user_id)
    }));
  };

  const feedQuery = useInfiniteQuery({
    queryKey: ['homeFeed', limit],
    queryFn: fetchPosts,
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      return lastPage.length === limit ? pages.length : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - much longer cache
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  // Realtime subscriptions with reconnection and fallback
  useEffect(() => {
    if (!user) return;

    let reconnectAttempts = 0;
    const maxReconnectAttempts = 3;
    let isSubscribed = true;

    const setupSubscriptions = () => {
      const channels = [
        // New posts
        supabase
          .channel('posts-changes')
          .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'posts' 
          }, (payload) => {
            
            const { eventType, new: newPost, old: oldPost } = payload;
            
            queryClient.setQueryData(['homeFeed', limit], (old: any) => {
              if (!old?.pages) return old;
              
              const pages = [...old.pages];
              
              if (eventType === 'INSERT' && newPost) {
                // Add new post at the beginning
                if (pages[0]) {
                  pages[0] = [newPost, ...pages[0]];
                }
              } else if (eventType === 'DELETE' && oldPost) {
                // Remove deleted post
                pages.forEach(page => {
                  const index = page.findIndex((p: any) => p.id === oldPost.id);
                  if (index > -1) page.splice(index, 1);
                });
              } else if (eventType === 'UPDATE' && newPost) {
                // Update existing post
                pages.forEach(page => {
                  const index = page.findIndex((p: any) => p.id === newPost.id);
                  if (index > -1) page[index] = { ...page[index], ...newPost };
                });
              }
              
              return { ...old, pages };
            });
          })
          .subscribe((status) => {
            
            if (status === 'SUBSCRIBED') {
              reconnectAttempts = 0;
            } else if (status === 'CLOSED' && isSubscribed && reconnectAttempts < maxReconnectAttempts) {
              reconnectAttempts++;
              
              setTimeout(() => {
                if (isSubscribed) setupSubscriptions();
              }, Math.pow(2, reconnectAttempts) * 1000);
            }
          }),

        // Likes changes
        supabase
          .channel('likes-changes')
          .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'likes' 
          }, (payload) => {
            
            const postId = (payload.new as any)?.post_id || (payload.old as any)?.post_id;
            const isInsert = payload.eventType === 'INSERT';
            const affectedUserId = (payload.new as any)?.user_id || (payload.old as any)?.user_id;
            
            // Only update if this is not the current user's action (to avoid double counting with optimistic updates)
            if (affectedUserId === user.id) {
              
              return;
            }
            
            queryClient.setQueryData(['homeFeed', limit], (old: any) => {
              if (!old) return old;
              
              return {
                ...old,
                pages: old.pages.map((page: HomeFeedPost[]) =>
                  page.map(post => 
                    post.id === postId 
                      ? {
                          ...post,
                          likes_count: Math.max(0, post.likes_count + (isInsert ? 1 : -1))
                        }
                      : post
                  )
                )
              };
            });
          })
          .subscribe(),

        // Comments changes
        supabase
          .channel('comments-changes')
          .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'comments' 
          }, (payload) => {
            queryClient.setQueryData(['homeFeed', limit], (old: any) => {
              if (!old) return old;
              
              return {
                ...old,
                pages: old.pages.map((page: HomeFeedPost[]) =>
                  page.map(post => 
                    post.id === (payload.new as any).post_id 
                      ? { ...post, comments_count: post.comments_count + 1 }
                      : post
                  )
                )
              };
            });
          })
          .subscribe(),

        // Shares changes
        supabase
          .channel('shares-changes')
          .on('postgres_changes', { 
            event: 'INSERT', 
            schema: 'public', 
            table: 'shares' 
          }, (payload) => {            
            queryClient.setQueryData(['homeFeed', limit], (old: any) => {
              if (!old) return old;
              
              return {
                ...old,
                pages: old.pages.map((page: HomeFeedPost[]) =>
                  page.map(post => 
                    post.id === (payload.new as any)?.post_id 
                      ? { ...post, shares_count: post.shares_count + 1 }
                      : post
                  )
                )
              };
            });
          })
          .subscribe(),

        // Follows changes
        supabase
          .channel('follows-changes')
          .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'connections' 
          }, (payload) => {
            const { eventType, new: newConnection, old: oldConnection } = payload;
            
            if (user?.id && ((newConnection as any)?.follower_id === user.id || (oldConnection as any)?.follower_id === user.id)) {
              const targetUserId = ((newConnection || oldConnection) as any)?.following_id;
              
              queryClient.setQueryData(['homeFeed', limit], (old: any) => {
                if (!old?.pages) return old;
                
                const pages = [...old.pages];
                pages.forEach(page => {
                  page.forEach((post: any) => {
                    if (post.user_id === targetUserId) {
                      post.is_following = eventType === 'INSERT';
                    }
                  });
                });
                
                return { ...old, pages };
              });
              
              // Also invalidate connections queries
              queryClient.invalidateQueries({ queryKey: ['connections'] });
            }
          })
          .subscribe()
      ];

      return channels;
    };

    const channels = setupSubscriptions();

    return () => {
      isSubscribed = false;
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [user, queryClient]);

  return feedQuery;
};

// Like post mutation with optimistic updates
export const useLikePost = (limit = 20) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ postId, isLiked }: { postId: string; isLiked: boolean }) => {
      if (!user) throw new Error('Not authenticated');

      

      if (isLiked) {
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', postId);
        if (error) throw error;
        
      } else {
        const { error } = await supabase
          .from('likes')
          .insert({ user_id: user.id, post_id: postId });
        if (error) throw error;
        
      }
    },
    onMutate: async ({ postId, isLiked }) => {
      const queryKey = ['homeFeed', limit];
      await queryClient.cancelQueries({ queryKey: ['homeFeed'] });
      
      const previousData = queryClient.getQueryData(queryKey);
      
      queryClient.setQueryData(queryKey, (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          pages: old.pages.map((page: HomeFeedPost[]) =>
            page.map(post => 
              post.id === postId 
                ? {
                    ...post,
                    user_liked: !isLiked,
                    likes_count: isLiked ? Math.max(0, post.likes_count - 1) : post.likes_count + 1
                  }
                : post
            )
          )
        };
      });
      
      return { previousData, queryKey };
    },
    onError: (error, variables, context) => {
      if (context?.previousData && context?.queryKey) {
        queryClient.setQueryData(context.queryKey, context.previousData);
      }
      toast({
        title: "Failed to update like",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};

// Share post mutation
export const useSharePost = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (postId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('shares')
        .insert({ user_id: user.id, post_id: postId });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Post shared",
        description: "Post has been shared successfully"
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to share post",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};
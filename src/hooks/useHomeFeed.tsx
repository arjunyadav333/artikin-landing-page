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
  saves_count: number; // Add saves_count field
  created_at: string;
  updated_at: string;
  profiles: PostProfile;
  user_liked?: boolean;
  is_following?: boolean;
}

export const useHomeFeed = (limit = 10) => { // Phase 6: Reduced from 20 to 10
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
      saves_count: post.saves_count || 0,
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
    staleTime: 10 * 60 * 1000, // Phase 4: 10 minutes - aggressive caching
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  // Phase 7: Optimized realtime subscriptions with debouncing and visibility detection
  useEffect(() => {
    if (!user) return;

    let reconnectAttempts = 0;
    const maxReconnectAttempts = 1;
    let isSubscribed = true;
    let updateQueue: Array<() => void> = [];
    let debounceTimer: NodeJS.Timeout | null = null;
    let inactivityTimer: NodeJS.Timeout | null = null;
    let isActive = true;

    // Phase 3: Aggressive debounce - 500ms
    const debouncedUpdate = (updateFn: () => void) => {
      updateQueue.push(updateFn);
      
      if (debounceTimer) clearTimeout(debounceTimer);
      
      debounceTimer = setTimeout(() => {
        if (!isActive) return; // Skip if inactive
        updateQueue.forEach(fn => fn());
        updateQueue = [];
      }, 500); // Phase 3: Increased from 100ms to 500ms
    };

    // Phase 3: Pause subscriptions after 5s of inactivity
    const resetInactivityTimer = () => {
      if (inactivityTimer) clearTimeout(inactivityTimer);
      isActive = true;
      
      inactivityTimer = setTimeout(() => {
        isActive = false;
        console.log('Feed inactive - pausing realtime updates');
      }, 5000); // 5 seconds
    };

    // Phase 7: Check if page is visible
    const isPageVisible = () => document.visibilityState === 'visible';

    const setupSubscriptions = () => {
      if (!isPageVisible()) return []; // Don't subscribe if tab is inactive
      // Phase 7: Single combined subscription channel instead of 5 separate ones
      const channel = supabase
        .channel('feed-updates')
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'posts' 
        }, (payload) => {
          if (!isPageVisible()) return; // Skip if tab inactive
          
          debouncedUpdate(() => {
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
          });
        })
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'likes' 
        }, (payload) => {
          if (!isPageVisible()) return;
          
          debouncedUpdate(() => {
            const postId = (payload.new as any)?.post_id || (payload.old as any)?.post_id;
            const isInsert = payload.eventType === 'INSERT';
            const affectedUserId = (payload.new as any)?.user_id || (payload.old as any)?.user_id;
            
            if (affectedUserId === user.id) return;
            
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
          });
        })
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'comments' 
        }, (payload) => {
          if (!isPageVisible()) return;
          
          debouncedUpdate(() => {
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
          });
        })
        .on('postgres_changes', { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'shares' 
        }, (payload) => {
          if (!isPageVisible()) return;
          
          debouncedUpdate(() => {
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
          });
        })
        .on('postgres_changes', { 
          event: '*', 
          schema: 'public', 
          table: 'connections' 
        }, (payload) => {
          if (!isPageVisible()) return;
          
          debouncedUpdate(() => {
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
              
              queryClient.invalidateQueries({ queryKey: ['connections'] });
            }
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
        });

      return [channel];
    };

    let channels = setupSubscriptions();

    // Phase 3: Re-subscribe when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isSubscribed && channels.length === 0) {
        channels = setupSubscriptions();
        resetInactivityTimer();
      } else if (document.visibilityState === 'hidden') {
        // Unsubscribe when tab is hidden to save resources
        channels.forEach(channel => supabase.removeChannel(channel));
        channels = [];
        if (inactivityTimer) clearTimeout(inactivityTimer);
      }
    };

    // Phase 3: Reset inactivity on user interaction
    const handleUserActivity = () => {
      resetInactivityTimer();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('scroll', handleUserActivity, { passive: true });
    document.addEventListener('mousemove', handleUserActivity, { passive: true });
    document.addEventListener('touchstart', handleUserActivity, { passive: true });

    resetInactivityTimer(); // Start timer

    return () => {
      isSubscribed = false;
      if (debounceTimer) clearTimeout(debounceTimer);
      if (inactivityTimer) clearTimeout(inactivityTimer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('scroll', handleUserActivity);
      document.removeEventListener('mousemove', handleUserActivity);
      document.removeEventListener('touchstart', handleUserActivity);
      channels.forEach(channel => supabase.removeChannel(channel));
    };
  }, [user, queryClient, limit]);

  return feedQuery;
};

// Like post mutation with optimistic updates
export const useLikePost = (limit = 10) => { // Phase 6: Match new limit
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
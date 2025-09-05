import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useEffect } from 'react';

export interface Connection {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  profiles?: {
    id: string;
    username: string;
    display_name: string;
    avatar_url?: string;
    bio?: string;
    location?: string;
    role?: string;
  };
}

export const useConnections = (userId?: string, type: 'following' | 'followers' = 'following') => {
  const queryClient = useQueryClient();
  
  const query = useQuery({
    queryKey: ['connections', userId, type],
    queryFn: async () => {
      if (!userId) return [];

      const isFollowing = type === 'following';
      
      // Since there are no foreign key relationships, we need to fetch connections and profiles separately
      const { data: connections, error: connectionsError } = await supabase
        .from('connections')
        .select('*')
        .eq(isFollowing ? 'follower_id' : 'following_id', userId);

      if (connectionsError) {
        console.error('Connections query error:', connectionsError);
        throw connectionsError;
      }

      if (!connections?.length) {
        console.log(`No ${type} connections found`);
        return [];
      }

      // Get the user IDs we need to fetch profiles for
      const userIds = connections.map(conn => 
        isFollowing ? conn.following_id : conn.follower_id
      );

      // Fetch profiles separately
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          username,
          display_name,
          avatar_url,
          bio,
          location,
          role,
          artform,
          organization_type,
          created_at
        `)
        .in('user_id', userIds);

      if (profilesError) {
        console.error('Profiles query error:', profilesError);
        throw profilesError;
      }

      // Combine connections with profiles
      const result = connections.map(conn => ({
        ...conn,
        [isFollowing ? 'following' : 'follower']: profiles?.find(p => 
          p.user_id === (isFollowing ? conn.following_id : conn.follower_id)
        )
      }));

      console.log(`${type} data:`, result);
      return result;
    },
    enabled: !!userId
  });

  // Real-time subscription for connections updates
  useEffect(() => {
    if (!userId) return;

    const connectionsChannel = supabase
      .channel(`connections:${userId}:${type}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'connections'
        },
        (payload) => {
          console.log('Connections change:', payload);
          const { eventType, new: newConnection, old: oldConnection } = payload;
          
          // Check if this change affects the current user's connections
          const isRelevant = type === 'following' 
            ? ((newConnection as any)?.follower_id === userId || (oldConnection as any)?.follower_id === userId)
            : ((newConnection as any)?.following_id === userId || (oldConnection as any)?.following_id === userId);
            
          if (isRelevant) {
            // Optimistically update the cache
            queryClient.setQueryData(['connections', userId, type], (old: any) => {
              if (!old) return old;
              
              if (eventType === 'INSERT' && newConnection) {
                // Add new connection
                console.log('Adding new connection:', newConnection);
                return [...old, newConnection as any];
              } else if (eventType === 'DELETE' && oldConnection) {
                // Remove deleted connection
                console.log('Removing connection:', oldConnection);
                return old.filter((conn: any) => conn.id !== (oldConnection as any).id);
              }
              
              return old;
            });
            
            // Also invalidate to ensure consistency
            setTimeout(() => {
              queryClient.invalidateQueries({ queryKey: ['connections', userId] });
            }, 500);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(connectionsChannel);
    };
  }, [userId, type, queryClient]);

  return query;
};

export const useConnectionStatus = (targetUserId?: string) => {
  return useQuery({
    queryKey: ['connectionStatus', targetUserId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !targetUserId) return { isFollowing: false, isFollowedBy: false };

      const [followingResult, followerResult] = await Promise.all([
        supabase
          .from('connections')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId)
          .single(),
        supabase
          .from('connections')
          .select('id')
          .eq('follower_id', targetUserId)
          .eq('following_id', user.id)
          .single()
      ]);

      return {
        isFollowing: !followingResult.error,
        isFollowedBy: !followerResult.error
      };
    },
    enabled: !!targetUserId
  });
};

export const useFollowUser = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ targetUserId, isCurrentlyFollowing }: { 
      targetUserId: string; 
      isCurrentlyFollowing: boolean; 
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      if (isCurrentlyFollowing) {
        // Unfollow
        const { error } = await supabase
          .from('connections')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetUserId);
        
        if (error) throw error;
      } else {
        // Follow
        const { error } = await supabase
          .from('connections')
          .insert({
            follower_id: user.id,
            following_id: targetUserId
          });
        
        if (error) throw error;
      }
    },
    onMutate: async ({ targetUserId, isCurrentlyFollowing }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ['connections'] });
      await queryClient.cancelQueries({ queryKey: ['connectionStatus'] });
      await queryClient.cancelQueries({ queryKey: ['posts'] });
      await queryClient.cancelQueries({ queryKey: ['homeFeed'] });

      // Get previous values
      const previousConnectionStatus = queryClient.getQueryData(['connectionStatus', targetUserId]);
      const previousPosts = queryClient.getQueryData(['posts']);
      const previousHomeFeed = queryClient.getQueryData(['homeFeed']);
      
      // Optimistically update connection status
      queryClient.setQueryData(['connectionStatus', targetUserId], {
        isFollowing: !isCurrentlyFollowing,
        isFollowedBy: previousConnectionStatus ? (previousConnectionStatus as any).isFollowedBy : false
      });

      // Optimistically update posts data
      queryClient.setQueriesData({ queryKey: ['posts'] }, (oldData: any) => {
        if (!oldData?.pages) return oldData;
        
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            posts: page.posts?.map((post: any) => 
              post.user_id === targetUserId 
                ? { ...post, is_following: !isCurrentlyFollowing }
                : post
            ) || []
          }))
        };
      });

      // Optimistically update home feed data
      queryClient.setQueriesData({ queryKey: ['homeFeed'] }, (oldData: any) => {
        if (!oldData?.pages) return oldData;
        
        return {
          ...oldData,
          pages: oldData.pages.map((page: any) => ({
            ...page,
            posts: page.posts?.map((post: any) => 
              post.user_id === targetUserId 
                ? { ...post, is_following: !isCurrentlyFollowing }
                : post
            ) || []
          }))
        };
      });

      return { 
        previousConnectionStatus, 
        previousPosts, 
        previousHomeFeed,
        targetUserId 
      };
    },
    onSuccess: (_, { isCurrentlyFollowing }) => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['connectionStatus'] });
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['homeFeed'] });
      
      toast({
        title: isCurrentlyFollowing ? "Unfollowed" : "Following",
        description: isCurrentlyFollowing 
          ? "You are no longer following this user." 
          : "You are now following this user."
      });
    },
    onError: (error: any, variables, context) => {
      // Rollback optimistic updates
      if (context?.previousConnectionStatus) {
        queryClient.setQueryData(['connectionStatus', variables.targetUserId], context.previousConnectionStatus);
      }
      
      if (context?.previousPosts) {
        queryClient.setQueryData(['posts'], context.previousPosts);
      }
      
      if (context?.previousHomeFeed) {
        queryClient.setQueryData(['homeFeed'], context.previousHomeFeed);
      }
      
      toast({
        title: "Action failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};

export const useSuggestedUsers = () => {
  return useQuery({
    queryKey: ['suggestedUsers'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get users that the current user is not following
      const { data: following } = await supabase
        .from('connections')
        .select('following_id')
        .eq('follower_id', user.id);

      const followingIds = following?.map(f => f.following_id) || [];
      followingIds.push(user.id); // Exclude self

      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .not('user_id', 'in', `(${followingIds.join(',')})`)
        .limit(10);

      if (error) throw error;
      return profiles || [];
    }
  });
};
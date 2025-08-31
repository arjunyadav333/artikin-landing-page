import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  return useQuery({
    queryKey: ['connections', userId, type],
    queryFn: async () => {
      if (!userId) return [];

      const isFollowing = type === 'following';
      const { data, error } = await supabase
        .from('connections')
        .select(`
          *,
          following:profiles!connections_following_id_fkey (
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
          ),
          follower:profiles!connections_follower_id_fkey (
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
          )
        `)
        .eq(isFollowing ? 'follower_id' : 'following_id', userId);

      if (error) throw error;
      return data || [];
    },
    enabled: !!userId
  });
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
    onSuccess: (_, { isCurrentlyFollowing }) => {
      queryClient.invalidateQueries({ queryKey: ['connections'] });
      queryClient.invalidateQueries({ queryKey: ['connectionStatus'] });
      
      toast({
        title: isCurrentlyFollowing ? "Unfollowed" : "Following",
        description: isCurrentlyFollowing 
          ? "You are no longer following this user." 
          : "You are now following this user."
      });
    },
    onError: (error: any) => {
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
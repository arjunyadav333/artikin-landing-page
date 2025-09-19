import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

type ArtformType = "actor" | "dancer" | "model" | "photographer" | "videographer" | "instrumentalist" | "singer" | "drawing" | "painting";

export interface SuggestedArtist {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  role: 'artist' | 'organization';
  artform: ArtformType | null;
  location: string | null;
  follower_count: number;
  following_count: number;
  isFollowing?: boolean;
}

const ARTFORM_RELATIONSHIPS: Record<ArtformType, ArtformType[]> = {
  actor: ['model'], // actors might connect with models for casting
  photographer: ['videographer'], // photographers and videographers work together
  videographer: ['photographer'], // same relationship, reversed
  dancer: ['singer', 'instrumentalist'], // performers work together
  singer: ['instrumentalist', 'dancer'], // musicians and performers collaborate
  instrumentalist: ['singer', 'dancer'], // musicians collaborate with performers
  model: ['actor', 'photographer'], // models work with actors and photographers
  drawing: ['painting'], // visual artists connect
  painting: ['drawing'] // visual artists connect
};

export const useSuggestedArtists = (limit: number = 6) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['suggested-artists', user?.id, limit],
    queryFn: async (): Promise<SuggestedArtist[]> => {
      if (!user) return [];

      // Get current user's profile to know their artform
      const { data: currentProfile } = await supabase
        .from('profiles')
        .select('artform, role')
        .eq('user_id', user.id)
        .single();

      if (!currentProfile) return [];

      const userArtform = currentProfile.artform;
      const relatedArtforms = userArtform ? ARTFORM_RELATIONSHIPS[userArtform] || [] : [];

      let suggestions: SuggestedArtist[] = [];

      // Step 1: Try to find users with the same artform
      if (userArtform) {
        const { data: sameArtformUsers } = await supabase
          .from('profiles')
          .select(`
            id, user_id, username, display_name, avatar_url, 
            role, artform, location, follower_count, following_count
          `)
          .eq('artform', userArtform)
          .neq('user_id', user.id)
          .order('follower_count', { ascending: false })
          .limit(limit);

        if (sameArtformUsers) {
          suggestions = sameArtformUsers;
        }
      }

      // Step 2: If not enough users, add related artforms
      if (suggestions.length < limit && relatedArtforms.length > 0) {
        const remainingSlots = limit - suggestions.length;
        const existingUserIds = suggestions.map(u => u.user_id);

        const { data: relatedUsers } = await supabase
          .from('profiles')
          .select(`
            id, user_id, username, display_name, avatar_url, 
            role, artform, location, follower_count, following_count
          `)
          .in('artform', relatedArtforms)
          .not('user_id', 'in', `(${existingUserIds.map(id => `"${id}"`).join(',')})`)
          .neq('user_id', user.id)
          .order('follower_count', { ascending: false })
          .limit(remainingSlots);

        if (relatedUsers) {
          suggestions = [...suggestions, ...relatedUsers];
        }
      }

      // Step 3: If still not enough, add popular artists from any artform
      if (suggestions.length < limit) {
        const remainingSlots = limit - suggestions.length;
        const existingUserIds = suggestions.map(u => u.user_id);
        const userIdsFilter = existingUserIds.length > 0 
          ? `(${existingUserIds.map(id => `"${id}"`).join(',')})`
          : '()';

        const { data: popularUsers } = await supabase
          .from('profiles')
          .select(`
            id, user_id, username, display_name, avatar_url, 
            role, artform, location, follower_count, following_count
          `)
          .not('user_id', 'in', userIdsFilter)
          .neq('user_id', user.id)
          .not('role', 'is', null)
          .order('follower_count', { ascending: false })
          .limit(remainingSlots);

        if (popularUsers) {
          suggestions = [...suggestions, ...popularUsers];
        }
      }

      // Check follow status for each suggestion
      if (suggestions.length > 0) {
        const userIds = suggestions.map(u => u.user_id);
        const { data: connections } = await supabase
          .from('connections')
          .select('following_id')
          .eq('follower_id', user.id)
          .in('following_id', userIds);

        const followingIds = new Set(connections?.map(c => c.following_id) || []);
        
        suggestions = suggestions.map(suggestion => ({
          ...suggestion,
          isFollowing: followingIds.has(suggestion.user_id)
        }));
      }

      return suggestions.slice(0, limit);
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
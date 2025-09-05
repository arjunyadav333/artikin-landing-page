import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useProfileViews = (profileId?: string) => {
  return useQuery({
    queryKey: ['profileViews', profileId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profile_views')
        .select('*')
        .eq('profile_id', profileId!)
        .order('viewed_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!profileId
  });
};

export const useProfileBookmarks = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['profileBookmarks', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profile_bookmarks')
        .select(`
          *,
          profiles!profile_bookmarks_profile_id_fkey(*)
        `)
        .eq('user_id', user?.id!);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });
};

export const useBookmarkProfile = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ profileId, isBookmarked }: { profileId: string; isBookmarked: boolean }) => {
      if (!user) throw new Error('Not authenticated');

      if (isBookmarked) {
        const { error } = await supabase
          .from('profile_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('profile_id', profileId);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('profile_bookmarks')
          .insert({
            user_id: user.id,
            profile_id: profileId
          });
        
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profileBookmarks'] });
    }
  });
};

export const useTrackProfileView = () => {
  return useMutation({
    mutationFn: async (profileId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Don't track views for own profile
      if (user?.id === profileId) return;
      
      const sessionId = crypto.randomUUID();
      
      const { error } = await supabase
        .from('profile_views')
        .insert({
          viewer_id: user?.id || null,
          profile_id: profileId,
          session_id: sessionId
        });
      
      if (error && !error.message.includes('duplicate key')) {
        throw error;
      }
    }
  });
};
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  full_name?: string;
  bio?: string;
  role?: 'artist' | 'organization';
  location?: string;
  website?: string;
  avatar_url?: string;
  cover_url?: string;
  phone_number?: string;
  artform?: 'actor' | 'dancer' | 'model' | 'photographer' | 'videographer' | 'instrumentalist' | 'singer' | 'drawing' | 'painting';
  organization_type?: 'director' | 'producer' | 'production_house' | 'casting_agency' | 'casting_director' | 'event_management' | 'individual_hirer' | 'institution' | 'others';
  headline?: string;
  social_links?: Record<string, string>;
  portfolio_count?: number;
  verified?: boolean;
  stats?: Record<string, any>;
  pronouns?: string;
  contact_email?: string;
  privacy?: 'public' | 'private';
  is_following?: boolean;
  can_view_full?: boolean;
  created_at: string;
  updated_at: string;
}

export const useProfile = (userId?: string) => {
  return useQuery({
    queryKey: ['profile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId!)
        .single();
      
      if (error) throw error;
      return data as Profile;
    },
    enabled: !!userId,
    // Enhanced caching for profiles
    staleTime: 10 * 60 * 1000, // 10 minutes for profiles
    gcTime: 30 * 60 * 1000, // 30 minutes cache time
  });
};

export const useProfileByUsername = (username?: string) => {
  return useQuery({
    queryKey: ['profile', 'username', username],
    queryFn: async () => {
      const { data, error } = await supabase
        .rpc('get_profile_by_username', { username_param: username! });
      
      if (error) throw error;
      return data?.[0] as Profile;
    },
    enabled: !!username,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes cache time
  });
};

export const useCurrentProfile = () => {
  return useQuery({
    queryKey: ['currentProfile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data as Profile;
    },
    // Aggressive caching for current user profile
    staleTime: 15 * 60 * 1000, // 15 minutes for current user
    gcTime: 60 * 60 * 1000, // 1 hour cache time
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (updates: Partial<Profile>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentProfile'] });
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};
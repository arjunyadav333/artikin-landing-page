import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

export interface ProfileWithStats {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  full_name?: string;
  bio?: string;
  role?: Database['public']['Enums']['user_role'];
  artform?: Database['public']['Enums']['artform_type'];
  organization_type?: Database['public']['Enums']['organization_type'];
  avatar_url?: string;
  cover_url?: string;
  location?: string;
  website?: string;
  headline?: string;
  social_links?: Record<string, string>;
  follower_count?: number;
  following_count?: number;
  posts_count?: number;
  privacy?: 'public' | 'private';
  created_at: string;
  updated_at: string;
}

export const useProfileByUsername = (username?: string) => {
  return useQuery({
    queryKey: ['profile', 'username', username],
    queryFn: async () => {
      if (!username) throw new Error('Username is required');
      
      const { data, error } = await supabase.rpc('get_profile_by_username', {
        username_param: username
      });
      
      if (error) throw error;
      if (!data || data.length === 0) return null;
      
      return data[0] as ProfileWithStats;
    },
    enabled: !!username
  });
};

export const useUserPosts = (userId?: string) => {
  return useQuery({
    queryKey: ['user-posts', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId
  });
};

export const useUserPortfolios = (userId?: string) => {
  return useQuery({
    queryKey: ['user-portfolios', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      // This is a placeholder - you'll need to create a portfolios table
      // For now, return empty array
      return [];
    },
    enabled: !!userId
  });
};
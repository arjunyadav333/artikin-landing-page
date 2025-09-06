import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'artist' | 'organization';
export type ArtformType = 'actor' | 'dancer' | 'model' | 'photographer' | 'videographer' | 'instrumentalist' | 'singer' | 'drawing' | 'painting';
export type OrganizationType = 'director' | 'producer' | 'production_house' | 'casting_agency' | 'casting_director' | 'event_management' | 'individual_hirer' | 'institution' | 'others';

export interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  full_name?: string;
  role?: UserRole;
  artform?: ArtformType;
  organization_type?: OrganizationType;
  avatar_url?: string;
  bio?: string;
  location?: string;
  privacy?: string;
}

// Hook to get current user's profile with role
export const useCurrentUserProfile = () => {
  return useQuery({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_user_profile');
      
      if (error) throw error;
      return data?.[0] as UserProfile | null;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

// Hook to check if current user has a specific role
export const useUserHasRole = (role: UserRole) => {
  return useQuery({
    queryKey: ['userHasRole', role],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase.rpc('user_has_role', {
        user_uuid: user.id,
        check_role: role
      });
      
      if (error) throw error;
      return data as boolean;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};

// Hook to get user's role only
export const useCurrentUserRole = () => {
  return useQuery({
    queryKey: ['currentUserRole'],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_current_user_role');
      
      if (error) throw error;
      return data as UserRole | null;
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
};
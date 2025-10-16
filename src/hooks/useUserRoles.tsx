import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type AppRole = 'artist' | 'organization';

export interface UserRole {
  id: string;
  user_id: string;
  role: AppRole;
  created_at: string;
  updated_at: string;
}

/**
 * Hook to fetch the current user's roles from the secure user_roles table
 * This prevents privilege escalation attacks by keeping roles separate from profiles
 */
export const useUserRoles = () => {
  return useQuery({
    queryKey: ['userRoles'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data as UserRole[];
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 60 * 60 * 1000, // 1 hour cache time
  });
};

/**
 * Hook to get the primary role of the current user
 * Returns the first role found or null if no roles exist
 */
export const useCurrentUserRole = () => {
  const { data: roles, ...rest } = useUserRoles();
  
  return {
    ...rest,
    role: roles?.[0]?.role || null,
    hasRole: (role: AppRole) => roles?.some(r => r.role === role) || false,
    isArtist: roles?.some(r => r.role === 'artist') || false,
    isOrganization: roles?.some(r => r.role === 'organization') || false,
  };
};

/**
 * Hook to check if user has a specific role
 */
export const useHasRole = (roleToCheck: AppRole) => {
  const { data: roles, isLoading } = useUserRoles();
  
  return {
    hasRole: roles?.some(r => r.role === roleToCheck) || false,
    isLoading,
  };
};

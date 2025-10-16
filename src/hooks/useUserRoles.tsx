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
 * Hook to fetch a user's roles from the user_roles table
 * This replaces checking roles from the profiles table for security
 */
export const useUserRoles = (userId?: string) => {
  return useQuery({
    queryKey: ['userRoles', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId!);
      
      if (error) throw error;
      return data as UserRole[];
    },
    enabled: !!userId,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
  });
};

/**
 * Hook to fetch the current user's roles
 */
export const useCurrentUserRoles = () => {
  return useQuery({
    queryKey: ['currentUserRoles'],
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
    staleTime: 15 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

/**
 * Helper hook to check if current user has a specific role
 */
export const useHasRole = (role: AppRole) => {
  const { data: roles, isLoading } = useCurrentUserRoles();
  
  const hasRole = roles?.some(r => r.role === role) ?? false;
  
  return { hasRole, isLoading };
};

/**
 * Helper hook to get the current user's primary role
 * Returns the first role if user has multiple roles
 */
export const useCurrentUserRole = () => {
  const { data: roles, isLoading } = useCurrentUserRoles();
  
  const role = roles?.[0]?.role;
  
  return { role, isLoading, isArtist: role === 'artist', isOrganization: role === 'organization' };
};

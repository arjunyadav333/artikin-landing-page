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
    enabled: !!userId
  });
};

export const useCurrentProfile = () => {
  return useQuery({
    queryKey: ['currentProfile'],
    queryFn: async () => {
      // Get the current authenticated user first
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Auth error in useCurrentProfile:', authError);
        throw authError;
      }
      if (!user) {
        console.log('No user found in useCurrentProfile');
        return null;
      }

      console.log('User found in useCurrentProfile:', user.id);

      // Try using the RPC function first (works better with auth context)
      try {
        const { data: rpcData, error: rpcError } = await supabase.rpc('get_user_profile', {
          user_uuid: user.id
        });
        
        if (rpcError) {
          console.error('RPC error:', rpcError);
        } else if (rpcData && rpcData.length > 0) {
          console.log('Profile found via RPC:', rpcData[0]);
          return rpcData[0] as Profile;
        }
      } catch (rpcError) {
        console.error('RPC call failed:', rpcError);
      }

      // Fallback: Query profiles table directly using user ID with explicit session
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();
        
        if (error) {
          console.error('Direct query error:', error);
          // If it's just a missing profile, return null
          if (error.code === 'PGRST116') {
            console.log('Profile not found - needs to be created');
            return null;
          }
          throw error;
        }
        
        console.log('Profile found via direct query:', data);
        return data as Profile;
      } catch (queryError) {
        console.error('Profile query failed:', queryError);
        throw queryError;
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: (failureCount, error: any) => {
      // Retry up to 2 times for auth-related errors
      if (failureCount < 2 && (error?.message?.includes('auth') || error?.code === 'PGRST301')) {
        return true;
      }
      return false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
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
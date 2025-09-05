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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      return data as Profile;
    }
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
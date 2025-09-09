import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useTrackOpportunityView } from './useViewTracking';

export interface Opportunity {
  id: string;
  user_id: string;
  title: string;
  company?: string;
  description: string;
  location?: string;
  city?: string;
  state?: string;
  salary_min?: number;
  salary_max?: number;
  type: string;
  tags?: string[];
  applications_count: number;
  status?: string;
  deadline?: string;
  views_count?: number;
  created_at: string;
  updated_at: string;
  image_url?: string;
  organization_name?: string;
  art_forms?: string[];
  experience_level?: string;
  gender_preference?: string[];
  language_preference?: string[];
  profiles?: {
    user_id: string;
    username: string;
    display_name: string;
    avatar_url?: string;
    role?: string;
  };
  user_applied?: boolean;
}

export const useOpportunities = (searchQuery?: string) => {
  return useQuery({
    queryKey: ['opportunities', searchQuery],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Build query with optional search
      let query = supabase
        .from('opportunities')
        .select('*')
        .eq('status', 'active');

      // Add search if query provided
      if (searchQuery?.trim()) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,company.ilike.%${searchQuery}%`);
      }

      const { data: opportunities, error } = await query
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!opportunities?.length) return [];

      // Get unique user IDs for profile lookup
      const userIds = [...new Set(opportunities.map(o => o.user_id))];
      
      // Batch fetch profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url, role')
        .in('user_id', userIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Check applications if user is authenticated
      let appliedOpportunityIds = new Set();
      if (user) {
        const { data: applications } = await supabase
          .from('opportunity_applications')
          .select('opportunity_id')
          .eq('user_id', user.id);
        
        appliedOpportunityIds = new Set(applications?.map(a => a.opportunity_id) || []);
      }

      // Combine data efficiently
      return opportunities.map(opportunity => ({
        ...opportunity,
        profiles: profileMap.get(opportunity.user_id),
        user_applied: appliedOpportunityIds.has(opportunity.id)
      }));
    },
    // Advanced caching
    staleTime: 3 * 60 * 1000, // 3 minutes (opportunities change more frequently)
    gcTime: 8 * 60 * 1000, // 8 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

export const useCreateOpportunity = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (newOpportunity: {
      title: string;
      company?: string;
      description: string;
      location?: string;
      salary_min?: number;
      salary_max?: number;
      type: string;
      tags?: string[];
      deadline?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('opportunities')
        .insert({
          ...newOpportunity,
          user_id: user.id
        })
        .select('*')
        .single();

      if (error) throw error;
      
      // Get profile for the created opportunity
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url, role')
        .eq('user_id', user.id)
        .single();

      return {
        ...data,
        profiles: profile,
        user_applied: false
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast({
        title: "Opportunity posted",
        description: "Your opportunity has been successfully posted."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to post opportunity",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};

export const useApplyToOpportunity = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ opportunityId, coverLetter }: { opportunityId: string; coverLetter?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('opportunity_applications')
        .insert({
          opportunity_id: opportunityId,
          user_id: user.id,
          cover_letter: coverLetter
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    // Optimistic updates for better UX
    onMutate: async ({ opportunityId }) => {
      await queryClient.cancelQueries({ queryKey: ['opportunities'] });
      
      const previousOpportunities = queryClient.getQueryData(['opportunities']);
      
      queryClient.setQueryData(['opportunities'], (old: any) => {
        if (!old) return old;
        
        return old.map((opportunity: any) =>
          opportunity.id === opportunityId
            ? {
                ...opportunity,
                user_applied: true,
                applications_count: opportunity.applications_count + 1
              }
            : opportunity
        );
      });
      
      return { previousOpportunities };
    },
    onSuccess: () => {
      toast({
        title: "Application submitted",
        description: "Your application has been successfully submitted."
      });
    },
    onError: (error: any, variables, context) => {
      if (context?.previousOpportunities) {
        queryClient.setQueryData(['opportunities'], context.previousOpportunities);
      }
      toast({
        title: "Application failed",
        description: error.message,
        variant: "destructive"
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    }
  });
};
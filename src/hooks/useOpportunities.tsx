import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Opportunity {
  id: string;
  user_id: string;
  title: string;
  company?: string;
  description: string;
  location?: string;
  salary_min?: number;
  salary_max?: number;
  type: string;
  tags?: string[];
  applications_count: number;
  created_at: string;
  updated_at: string;
  profiles?: {
    id: string;
    username: string;
    display_name: string;
    avatar_url?: string;
  };
  user_applied?: boolean;
}

export const useOpportunities = () => {
  return useQuery({
    queryKey: ['opportunities'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: opportunities, error } = await supabase
        .from('opportunities')
        .select(`
          *,
          profiles!opportunities_user_id_fkey (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Check if user applied to each opportunity
      if (user && opportunities.length > 0) {
        const { data: applications } = await supabase
          .from('opportunity_applications')
          .select('opportunity_id')
          .eq('user_id', user.id)
          .in('opportunity_id', opportunities.map(o => o.id));

        const appliedOpportunityIds = new Set(applications?.map(a => a.opportunity_id));
        
        return opportunities.map(opportunity => ({
          ...opportunity,
          user_applied: appliedOpportunityIds.has(opportunity.id)
        })) as any;
      }

      return opportunities as any;
    }
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
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('opportunities')
        .insert({
          ...newOpportunity,
          user_id: user.id
        })
        .select(`
          *,
          profiles!opportunities_user_id_fkey (
            id,
            username,
            display_name,
            avatar_url
          )
        `)
        .single();

      if (error) throw error;
      return data;
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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast({
        title: "Application submitted",
        description: "Your application has been successfully submitted."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Application failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};
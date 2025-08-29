import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Opportunity } from './useOpportunities';

export const useOrganizationOpportunities = () => {
  return useQuery({
    queryKey: ['organization-opportunities'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      
      // Fetch only opportunities created by current user
      const { data: opportunities, error } = await supabase
        .from('opportunities')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!opportunities?.length) return [];

      // Get profile for the current user
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url, role')
        .eq('user_id', user.id)
        .single();

      // Return opportunities with profile data
      return opportunities.map(opportunity => ({
        ...opportunity,
        profiles: profile,
        user_applied: false // Not applicable for own opportunities
      }));
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 8 * 60 * 1000, // 8 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

export const useUpdateOpportunityStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ opportunityId, status }: { opportunityId: string; status: string }) => {
      const { data, error } = await supabase
        .from('opportunities')
        .update({ status })
        .eq('id', opportunityId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-opportunities'] });
      toast({
        title: "Status updated",
        description: "Opportunity status has been successfully updated."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update status",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};

export const useDeleteOpportunity = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (opportunityId: string) => {
      const { error } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', opportunityId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-opportunities'] });
      toast({
        title: "Opportunity deleted",
        description: "The opportunity has been successfully deleted."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete opportunity",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};
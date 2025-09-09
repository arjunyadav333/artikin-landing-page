import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Application {
  id: string;
  opportunity_id: string;
  user_id: string;
  cover_letter?: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  accepted_at?: string;
  accepted_by_org_id?: string;
  rejected_at?: string;
  rejected_by_org_id?: string;
  opportunities?: {
    id: string;
    title: string;
    company?: string;
    type: string;
    location?: string;
    profiles?: {
      display_name: string;
      avatar_url?: string;
    };
  };
  profiles?: {
    id: string;
    username: string;
    display_name: string;
    full_name?: string;
    avatar_url?: string;
    artform?: string;
    location?: string;
    bio?: string;
  };
}

export const useUserApplications = () => {
  return useQuery({
    queryKey: ['userApplications'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('opportunity_applications')
        .select(`
          *,
          opportunities (
            id,
            title,
            company,
            type,
            location,
            image_url,
            status,
            profiles (
              display_name,
              avatar_url
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as any;
    }
  });
};

export const useOpportunityApplications = (opportunityId: string) => {
  return useQuery({
    queryKey: ['opportunityApplications', opportunityId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('opportunity_applications')
        .select(`
          *,
          profiles (
            id,
            username,
            display_name,
            full_name,
            avatar_url,
            artform,
            location,
            bio
          )
        `)
        .eq('opportunity_id', opportunityId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Application[];
    },
    enabled: !!opportunityId
  });
};

export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: string; status: 'pending' | 'accepted' | 'rejected' }) => {
      const { data, error } = await supabase
        .from('opportunity_applications')
        .update({ status })
        .eq('id', applicationId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['opportunityApplications'] });
      toast({
        title: `Application ${status}`,
        description: `The application has been ${status}.`
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

export const useDeleteApplication = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (applicationId: string) => {
      const { error } = await supabase
        .from('opportunity_applications')
        .delete()
        .eq('id', applicationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userApplications'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast({
        title: "Application removed",
        description: "Your application has been successfully removed."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Removal failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};
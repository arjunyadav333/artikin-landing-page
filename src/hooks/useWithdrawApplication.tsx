import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useWithdrawApplication = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (opportunityId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Find the application to delete
      const { data: application, error: findError } = await supabase
        .from('opportunity_applications')
        .select('id')
        .eq('opportunity_id', opportunityId)
        .eq('user_id', user.id)
        .single();

      if (findError) throw findError;
      if (!application) throw new Error('Application not found');

      // Delete the application
      const { error } = await supabase
        .from('opportunity_applications')
        .delete()
        .eq('id', application.id);

      if (error) throw error;
      return application;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['userApplications'] });
      toast({
        title: "Application withdrawn",
        description: "Your application has been successfully withdrawn."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Withdrawal failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};
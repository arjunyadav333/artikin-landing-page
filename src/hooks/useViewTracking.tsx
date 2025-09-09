import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useTrackOpportunityView = () => {
  return useMutation({
    mutationFn: async (opportunityId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Use the database function for deduped view tracking
        const { error } = await supabase
          .rpc('track_opportunity_view', {
            opportunity_id_param: opportunityId,
            viewer_id_param: user.id
          });

        if (error) throw error;
      }
    },
    // Silent mutation - no error handling needed for view tracking
  });
};
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useTrackOpportunityView = () => {
  return useMutation({
    mutationFn: async (opportunityId: string) => {
      // First get current views count
      const { data, error: fetchError } = await supabase
        .from('opportunities')
        .select('views_count')
        .eq('id', opportunityId)
        .single();

      if (fetchError) throw fetchError;

      const currentViews = data?.views_count || 0;

      // Then update with incremented count
      const { error: updateError } = await supabase
        .from('opportunities')
        .update({ views_count: currentViews + 1 })
        .eq('id', opportunityId);

      if (updateError) throw updateError;
    },
    // Silent mutation - no error handling needed for view tracking
  });
};
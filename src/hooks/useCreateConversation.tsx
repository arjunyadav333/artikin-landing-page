import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useCreateConversation = () => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async ({ artistId, organizationId, opportunityId }: { 
      artistId: string; 
      organizationId: string;
      opportunityId?: string;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Check if conversation already exists
      const { data: existingConversation } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant_a.eq.${artistId},participant_b.eq.${organizationId}),and(participant_a.eq.${organizationId},participant_b.eq.${artistId})`)
        .single();

      if (existingConversation) {
        return existingConversation;
      }

      // Create new conversation
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          participant_a: artistId < organizationId ? artistId : organizationId,
          participant_b: artistId < organizationId ? organizationId : artistId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Conversation created",
        description: "You can now message about this opportunity."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create conversation",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};
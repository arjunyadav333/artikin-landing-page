import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface EditOpportunityData {
  title: string;
  company?: string;
  description: string;
  type: string;
  location?: string;
  city?: string;
  state?: string;
  salary_min?: number;
  salary_max?: number;
  deadline?: string;
  tags?: string[];
  status: string;
  image_url?: string;
  art_forms?: string[];
  experience_level?: string;
  gender_preference?: string[];
  language_preference?: string[];
  organization_name?: string;
}

export const useEditOpportunity = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ 
      opportunityId, 
      data 
    }: { 
      opportunityId: string; 
      data: EditOpportunityData 
    }) => {
      const { data: result, error } = await supabase
        .from('opportunities')
        .update({
          title: data.title,
          company: data.company,
          description: data.description,
          type: data.type,
          location: data.location,
          city: data.city,
          state: data.state,
          salary_min: data.salary_min,
          salary_max: data.salary_max,
          deadline: data.deadline ? new Date(data.deadline).toISOString() : null,
          tags: data.tags,
          status: data.status,
          image_url: data.image_url,
          art_forms: data.art_forms,
          experience_level: data.experience_level,
          gender_preference: data.gender_preference,
          language_preference: data.language_preference,
          organization_name: data.organization_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', opportunityId)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization-opportunities'] });
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
      toast({
        title: "Opportunity updated",
        description: "The opportunity has been successfully updated."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update opportunity",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Portfolio {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  media_urls: string[];
  media_meta: Record<string, any>;
  tags: string[];
  likes_count: number;
  views_count: number;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export const useUserPortfolios = (userId?: string) => {
  return useQuery({
    queryKey: ['portfolios', userId],
    queryFn: async () => {
      // Return empty array for now until portfolios table is properly created
      return [] as Portfolio[];
    },
    enabled: !!userId
  });
};

export const usePortfolio = (portfolioId?: string) => {
  return useQuery({
    queryKey: ['portfolio', portfolioId],
    queryFn: async () => {
      // Return null for now until portfolios table is properly created
      return null as Portfolio | null;
    },
    enabled: !!portfolioId
  });
};

export const useCreatePortfolio = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (portfolio: Omit<Portfolio, 'id' | 'created_at' | 'updated_at' | 'likes_count' | 'views_count'>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('portfolios')
        .insert({ ...portfolio, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['portfolios', data.user_id] });
      toast({
        title: "Portfolio item created",
        description: "Your portfolio item has been successfully created."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Creation failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};

export const useUpdatePortfolio = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Portfolio> }) => {
      const { data, error } = await supabase
        .from('portfolios')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['portfolios', data.user_id] });
      queryClient.invalidateQueries({ queryKey: ['portfolio', data.id] });
      toast({
        title: "Portfolio updated",
        description: "Your portfolio item has been successfully updated."
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

export const useDeletePortfolio = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (portfolioId: string) => {
      const { error } = await supabase
        .from('portfolios')
        .delete()
        .eq('id', portfolioId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      toast({
        title: "Portfolio item deleted",
        description: "Your portfolio item has been successfully deleted."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Deletion failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};
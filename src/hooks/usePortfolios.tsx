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

// Simplify hooks to avoid database calls until tables are created
export const useUserPortfolios = (userId?: string) => {
  return {
    data: [],
    isLoading: false,
    error: null
  };
};

export const usePortfolio = (portfolioId?: string) => {
  return {
    data: null,
    isLoading: false,
    error: null
  };
};

export const useCreatePortfolio = () => {
  const { toast } = useToast();
  return {
    mutate: () => {
      toast({
        title: "Coming soon",
        description: "Portfolio creation will be available soon."
      });
    },
    mutateAsync: async () => {},
    isPending: false
  };
};

export const useUpdatePortfolio = () => {
  const { toast } = useToast();
  return {
    mutate: () => {
      toast({
        title: "Coming soon", 
        description: "Portfolio updates will be available soon."
      });
    },
    mutateAsync: async () => {},
    isPending: false
  };
};

export const useDeletePortfolio = () => {
  const { toast } = useToast();
  return {
    mutate: () => {
      toast({
        title: "Coming soon",
        description: "Portfolio deletion will be available soon."
      });
    },
    mutateAsync: async () => {},
    isPending: false
  };
};
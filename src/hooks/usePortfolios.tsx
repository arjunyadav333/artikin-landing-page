import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Portfolio {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  media_urls: string[];
  media_types: string[];
  media_meta: Record<string, any>;
  tags: string[];
  likes_count: number;
  views_count: number;
  featured: boolean;
  visibility: string;
  created_at: string;
  updated_at: string;
}

export const useUserPortfolios = (userId?: string) => {
  return useQuery({
    queryKey: ['portfolios', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await (supabase as any)
        .from('portfolios')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as Portfolio[];
    },
    enabled: !!userId
  });
};

export const usePortfolio = (portfolioId?: string) => {
  return useQuery({
    queryKey: ['portfolio', portfolioId],
    queryFn: async () => {
      if (!portfolioId) return null;
      
      const { data, error } = await (supabase as any)
        .from('portfolios')
        .select('*')
        .eq('id', portfolioId)
        .single();
      
      if (error) throw error;
      return data as Portfolio;
    },
    enabled: !!portfolioId
  });
};

export const useCreatePortfolio = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newPortfolio: {
      title: string;
      description?: string;
      media_files: File[];
      tags?: string[];
      visibility?: string;
      featured?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Upload files to storage
      const uploadPromises = newPortfolio.media_files.map(async (file, index) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}_${index}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('portfolios')
          .upload(fileName, file);
        
        if (error) throw error;
        
        const { data: { publicUrl } } = supabase.storage
          .from('portfolios')
          .getPublicUrl(fileName);
        
        return publicUrl;
      });

      const media_urls = await Promise.all(uploadPromises);
      const media_types = newPortfolio.media_files.map(file => 
        file.type.startsWith('video/') ? 'video' : 'image'
      );

      // Insert portfolio record
      const { data, error } = await (supabase as any)
        .from('portfolios')
        .insert({
          user_id: user.id,
          title: newPortfolio.title,
          description: newPortfolio.description,
          media_urls,
          media_types,
          tags: newPortfolio.tags || [],
          visibility: newPortfolio.visibility || 'public',
          featured: newPortfolio.featured || false
        })
        .select()
        .single();

      if (error) throw error;
      return data as Portfolio;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      toast({
        title: "Portfolio created",
        description: "Your portfolio item has been successfully added."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create portfolio",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};

export const useUpdatePortfolio = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      portfolioId,
      updates
    }: {
      portfolioId: string;
      updates: Partial<Portfolio>;
    }) => {
      const { data, error } = await (supabase as any)
        .from('portfolios')
        .update(updates)
        .eq('id', portfolioId)
        .select()
        .single();

      if (error) throw error;
      return data as Portfolio;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio', data.id] });
      toast({
        title: "Portfolio updated",
        description: "Your changes have been saved."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update portfolio",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};

export const useDeletePortfolio = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (portfolioId: string) => {
      // First get the portfolio to get media URLs
      const { data: portfolio, error: fetchError } = await (supabase as any)
        .from('portfolios')
        .select('media_urls, user_id')
        .eq('id', portfolioId)
        .single();

      if (fetchError) throw fetchError;

      // Delete files from storage
      if (portfolio?.media_urls && Array.isArray(portfolio.media_urls) && portfolio.media_urls.length > 0) {
        const filePaths = portfolio.media_urls.map((url: string) => {
          const urlParts = url.split('/portfolios/');
          return urlParts[1];
        }).filter(Boolean);

        if (filePaths.length > 0) {
          const { error: storageError } = await supabase.storage
            .from('portfolios')
            .remove(filePaths);

          if (storageError) console.error('Storage deletion error:', storageError);
        }
      }

      // Delete database record
      const { error: deleteError } = await (supabase as any)
        .from('portfolios')
        .delete()
        .eq('id', portfolioId);

      if (deleteError) throw deleteError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      toast({
        title: "Portfolio deleted",
        description: "The portfolio item has been removed."
      });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to delete portfolio",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};

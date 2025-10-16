import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Portfolio {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  media_urls: string[];
  media_types: string[]; // 'image', 'video', 'document'
  media_meta: Record<string, any>;
  tags: string[];
  likes_count: number;
  views_count: number;
  featured: boolean;
  visibility: 'public' | 'private';
  created_at: string;
  updated_at: string;
}

/**
 * Fetch portfolios for a specific user
 */
export const useUserPortfolios = (userId?: string) => {
  return useQuery({
    queryKey: ['portfolios', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('user_id', userId!)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Portfolio[];
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

/**
 * Fetch a single portfolio by ID
 */
export const usePortfolio = (portfolioId?: string) => {
  return useQuery({
    queryKey: ['portfolio', portfolioId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('portfolios')
        .select('*')
        .eq('id', portfolioId!)
        .single();
      
      if (error) throw error;
      return data as Portfolio;
    },
    enabled: !!portfolioId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Create a new portfolio item
 */
export const useCreatePortfolio = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (portfolio: {
      title: string;
      description?: string;
      media_urls: string[];
      media_types: string[];
      media_meta?: Record<string, any>;
      tags?: string[];
      visibility?: 'public' | 'private';
      featured?: boolean;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('portfolios')
        .insert({
          ...portfolio,
          user_id: user.id,
          media_meta: portfolio.media_meta || {},
          tags: portfolio.tags || [],
          visibility: portfolio.visibility || 'public',
          featured: portfolio.featured || false
        })
        .select()
        .single();

      if (error) throw error;
      return data as Portfolio;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['portfolios', data.user_id] });
      toast({
        title: "Portfolio item created",
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

/**
 * Update an existing portfolio item
 */
export const useUpdatePortfolio = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Portfolio> }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('portfolios')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id) // Ensure user owns this portfolio
        .select()
        .single();

      if (error) throw error;
      return data as Portfolio;
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
        title: "Failed to update portfolio", 
        description: error.message,
        variant: "destructive"
      });
    }
  });
};

/**
 * Delete a portfolio item
 */
export const useDeletePortfolio = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (portfolioId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // First get the portfolio to access media URLs for cleanup
      const { data: portfolio } = await supabase
        .from('portfolios')
        .select('*')
        .eq('id', portfolioId)
        .eq('user_id', user.id)
        .single();

      if (!portfolio) throw new Error('Portfolio not found');

      // Delete associated files from storage
      if (portfolio.media_urls && portfolio.media_urls.length > 0) {
        const filePaths = portfolio.media_urls.map(url => {
          const urlObj = new URL(url);
          return urlObj.pathname.split('/storage/v1/object/public/portfolios/')[1];
        }).filter(Boolean);

        if (filePaths.length > 0) {
          await supabase.storage
            .from('portfolios')
            .remove(filePaths);
        }
      }

      // Delete the portfolio record
      const { error } = await supabase
        .from('portfolios')
        .delete()
        .eq('id', portfolioId)
        .eq('user_id', user.id);

      if (error) throw error;
      return { portfolioId, userId: user.id };
    },
    onSuccess: ({ userId }) => {
      queryClient.invalidateQueries({ queryKey: ['portfolios', userId] });
      toast({
        title: "Portfolio deleted",
        description: "Your portfolio item has been successfully removed."
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

/**
 * Upload portfolio media file to Supabase Storage
 */
export const uploadPortfolioMedia = async (
  file: File, 
  userId: string
): Promise<{ url: string; type: string }> => {
  const fileExt = file.name.split('.').pop();
  const mediaType = file.type.startsWith('image/') ? 'image' 
                  : file.type.startsWith('video/') ? 'video' 
                  : 'document';
  
  // Include user ID in path for RLS and prevent collisions
  const fileName = `${userId}/${mediaType}s/${Date.now()}_${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
  
  const { data, error } = await supabase.storage
    .from('portfolios')
    .upload(fileName, file);

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from('portfolios')
    .getPublicUrl(fileName);

  return {
    url: urlData.publicUrl,
    type: mediaType
  };
};

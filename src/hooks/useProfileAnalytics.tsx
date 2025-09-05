import { useToast } from '@/hooks/use-toast';

// Simplify analytics hooks to avoid database calls until tables are created
export const useProfileViews = (profileId?: string) => {
  return {
    data: [],
    isLoading: false,
    error: null
  };
};

export const useProfileBookmarks = () => {
  return {
    data: [],
    isLoading: false,
    error: null
  };
};

export const useBookmarkProfile = () => {
  const { toast } = useToast();
  return {
    mutate: () => {
      toast({
        title: "Coming soon",
        description: "Profile bookmarking will be available soon."
      });
    },
    mutateAsync: async () => {},
    isPending: false
  };
};

export const useTrackProfileView = () => {
  return {
    mutate: () => {
      // Silently do nothing for now
    },
    mutateAsync: async () => {},
    isPending: false
  };
};
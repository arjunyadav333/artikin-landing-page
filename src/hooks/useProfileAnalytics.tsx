import { useToast } from '@/hooks/use-toast';

// Placeholder implementations until database tables are created
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
        title: "Feature not ready",
        description: "Profile bookmarking is being developed. Database tables need to be created first.",
        variant: "destructive"
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
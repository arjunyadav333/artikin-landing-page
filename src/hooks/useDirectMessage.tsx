import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export const useDirectMessage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const createOrGetConversationMutation = useMutation({
    mutationFn: async (targetUserId: string) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase.rpc('create_or_get_conversation', {
        user_a: user.id,
        user_b: targetUserId
      });

      if (error) throw error;
      
      return data[0]; // RPC returns table, get first row
    },
    onSuccess: (result, targetUserId) => {
      setLoadingStates(prev => ({ ...prev, [targetUserId]: false }));
      
      if (result?.conversation_id) {
        navigate(`/messages/${result.conversation_id}`);
      }
    },
    onError: (error: any, targetUserId) => {
      setLoadingStates(prev => ({ ...prev, [targetUserId]: false }));
      
      console.error('Failed to create conversation:', error);
      
      // Handle specific error cases
      if (error.message?.includes('yourself')) {
        toast({
          title: "Error",
          description: "You cannot message yourself.",
          variant: "destructive"
        });
      } else if (error.message?.includes('blocked') || error.message?.includes('privacy')) {
        toast({
          title: "Cannot send message",
          description: "You cannot message this user.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to start conversation. Please try again.",
          variant: "destructive"
        });
      }
    }
  });

  const startDirectMessage = (targetUserId: string) => {
    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to send messages.",
        variant: "destructive"
      });
      return;
    }

    if (user.id === targetUserId) {
      toast({
        title: "Error",
        description: "You cannot message yourself.",
        variant: "destructive"
      });
      return;
    }

    // Set loading state for this specific user
    setLoadingStates(prev => ({ ...prev, [targetUserId]: true }));
    
    createOrGetConversationMutation.mutate(targetUserId);
  };

  const isLoading = (targetUserId: string) => {
    return loadingStates[targetUserId] || false;
  };

  return {
    startDirectMessage,
    isLoading,
    isPending: createOrGetConversationMutation.isPending
  };
};
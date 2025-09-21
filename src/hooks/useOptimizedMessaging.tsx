import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useCallback, useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';

// Optimized interfaces
export interface OptimizedMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  kind: string;
  body: string | null;
  meta: any; // Changed from Record<string, any> to any for compatibility
  reply_to: string | null;
  edited_at: string | null;
  deleted_for_everyone: boolean;
  created_at: string;
  deleted: boolean;
  client_id: string | null;
  pending: boolean;
  message_type: string;
  link_preview: any | null; // Changed from Record<string, any> to any
  media_url: string | null;
  replied_to_message_id: string | null;
  delivered_at: string | null;
  seen_at: string | null;
  edited: boolean;
  sender_username: string;
  sender_display_name: string;
  sender_avatar_url: string | null;
  reactions: Array<{
    id: string;
    user_id: string;
    emoji: string;
    created_at: string;
  }>;
}

export interface OptimizedConversation {
  id: string;
  participant_a: string;
  participant_b: string;
  last_message_id: string | null;
  updated_at: string;
  created_at: string;
  other_participant: {
    user_id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
    role: string | null;
  };
  last_message: OptimizedMessage | null;
  unread_count: number;
}

// Optimized conversations hook with better caching
export const useOptimizedConversations = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['optimized-conversations', user?.id],
    queryFn: async (): Promise<OptimizedConversation[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`participant_a.eq.${user.id},participant_b.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      if (!data?.length) return [];

      // Get participant info in batch
      const participantIds = new Set<string>();
      data.forEach(conv => {
        participantIds.add(conv.participant_a);
        participantIds.add(conv.participant_b);
      });
      participantIds.delete(user.id); // Remove current user

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url, role')
        .in('user_id', Array.from(participantIds));

      // Get last messages in batch
      const messageIds = data
        .filter(conv => conv.last_message_id)
        .map(conv => conv.last_message_id);

      const { data: lastMessages } = messageIds.length > 0 ? await supabase
        .from('messages')
        .select('*')
        .in('id', messageIds) : { data: [] };

      return data.map(conv => {
        const otherParticipantId = conv.participant_a === user.id 
          ? conv.participant_b 
          : conv.participant_a;
        
        const otherParticipant = profiles?.find(p => p.user_id === otherParticipantId) || {
          user_id: otherParticipantId,
          username: `user_${otherParticipantId.slice(0, 8)}`,
          display_name: 'Unknown User',
          avatar_url: null,
          role: null
        };

        const lastMessage = lastMessages?.find(m => m.id === conv.last_message_id);

        return {
          ...conv,
          other_participant: otherParticipant,
          last_message: lastMessage ? {
            ...lastMessage,
            sender_username: otherParticipant.username,
            sender_display_name: otherParticipant.display_name,
            sender_avatar_url: otherParticipant.avatar_url,
            reactions: []
          } : null,
          unread_count: 0 // TODO: Calculate actual unread count
        };
      });
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

// Optimized messages hook using database function
export const useOptimizedMessages = (conversationId?: string) => {
  return useQuery({
    queryKey: ['optimized-messages', conversationId],
    queryFn: async (): Promise<OptimizedMessage[]> => {
      if (!conversationId) return [];

      const { data, error } = await supabase
        .rpc('get_conversation_messages', { 
          conversation_id_param: conversationId 
        });

      if (error) throw error;
      
      // Transform the data to match our interface
      return (data || []).map((msg: any) => ({
        ...msg,
        reactions: Array.isArray(msg.reactions) ? msg.reactions : []
      }));
    },
    enabled: !!conversationId,
    staleTime: 30 * 1000, // 30 seconds for messages
    gcTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
};

// Debounced mark as seen hook to prevent duplicate calls
export const useDebouncedMarkSeen = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const markSeenTimeouts = useMemo(() => new Map<string, NodeJS.Timeout>(), []);

  return useMutation({
    mutationFn: async (messageId: string) => {
      const { data, error } = await supabase
        .rpc('mark_message_seen_debounced', { 
          message_id_param: messageId 
        });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, messageId) => {
      // Clear any pending timeout for this message
      const timeoutId = markSeenTimeouts.get(messageId);
      if (timeoutId) {
        clearTimeout(timeoutId);
        markSeenTimeouts.delete(messageId);
      }
      
      // Selectively invalidate only the specific conversation
      queryClient.invalidateQueries({ 
        queryKey: ['optimized-messages'],
        exact: false 
      });
    },
    onError: (error: any) => {
      console.error('Failed to mark message as seen:', error);
    }
  });
};

// Optimized real-time messages hook with selective updates
export const useOptimizedRealtimeMessages = (conversationId?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversationId) return;

    const messageChannel = supabase
      .channel(`optimized-messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          // Add new message to cache optimistically
          queryClient.setQueryData(
            ['optimized-messages', conversationId],
            (old: OptimizedMessage[] | undefined) => {
              if (!old) return old;
              const newMessage = payload.new as any;
              return [...old, {
                ...newMessage,
                sender_username: 'Loading...',
                sender_display_name: 'Loading...',
                sender_avatar_url: null,
                reactions: []
              }];
            }
          );
          
          // Also update conversations list
          queryClient.invalidateQueries({ 
            queryKey: ['optimized-conversations'],
            exact: false 
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        () => {
          // Only invalidate the specific conversation messages
          queryClient.invalidateQueries({ 
            queryKey: ['optimized-messages', conversationId] 
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
    };
  }, [conversationId, queryClient]);
};

// Optimized send message hook
export const useOptimizedSendMessage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ conversationId, body, kind = 'text' }: {
      conversationId: string;
      body: string;
      kind?: string;
    }) => {
      if (!user) throw new Error('Not authenticated');

      const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const { data, error } = await supabase
        .rpc('create_message_with_client_id', {
          conversation_id_param: conversationId,
          sender_id_param: user.id,
          client_id_param: clientId,
          kind_param: kind,
          body_param: body
        });

      if (error) throw error;
      return data;
    },
    onMutate: async ({ conversationId, body }) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ 
        queryKey: ['optimized-messages', conversationId] 
      });

      // Snapshot previous value
      const previousMessages = queryClient.getQueryData<OptimizedMessage[]>([
        'optimized-messages',
        conversationId
      ]);

        // Optimistically add message
        const optimisticMessage: OptimizedMessage = {
          id: `temp_${Date.now()}`,
          conversation_id: conversationId,
          sender_id: user?.id || '',
          kind: 'text',
          body,
          meta: {},
          reply_to: null,
          edited_at: null,
          deleted_for_everyone: false,
          created_at: new Date().toISOString(),
          deleted: false,
          client_id: `client_${Date.now()}`,
          pending: true,
          message_type: 'text',
          link_preview: null,
          media_url: null,
          replied_to_message_id: null,
          delivered_at: null,
          seen_at: null,
          edited: false,
          sender_username: 'You',
          sender_display_name: 'You',
          sender_avatar_url: null,
          reactions: []
        };

      queryClient.setQueryData(
        ['optimized-messages', conversationId],
        (old: OptimizedMessage[] | undefined) => 
          old ? [...old, optimisticMessage] : [optimisticMessage]
      );

      return { previousMessages };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousMessages) {
        queryClient.setQueryData(
          ['optimized-messages', variables.conversationId],
          context.previousMessages
        );
      }
      toast({
        title: "Failed to send message",
        description: "Please try again",
        variant: "destructive"
      });
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ 
        queryKey: ['optimized-messages', variables.conversationId] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['optimized-conversations'] 
      });
    }
  });
};
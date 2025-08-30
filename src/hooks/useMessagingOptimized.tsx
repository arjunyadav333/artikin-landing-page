import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { authSingleton } from '@/lib/auth-singleton';
import { useToast } from '@/hooks/use-toast';
import { usePerformanceMonitoring } from '@/hooks/usePerformanceMonitoring';
import { Message, Conversation } from '@/hooks/useMessaging';

/**
 * Ultra-fast conversations hook using optimized database view
 * Single query execution with all data pre-joined
 */
export const useConversationsOptimized = () => {
  const { trackQueryPerformance } = usePerformanceMonitoring('useConversationsOptimized');
  
  return useQuery({
    queryKey: ['conversations-optimized'],
    queryFn: async () => {
      const startTime = Date.now();
      const user = authSingleton.getUser();
      
      if (!user) {
        trackQueryPerformance('conversations-no-user', startTime);
        return [];
      }

      // Single ultra-fast query using optimized view
      const { data, error } = await supabase
        .from('conversations_optimized' as any)
        .select('*')
        .or(`participant_a.eq.${user.id},participant_b.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('useConversationsOptimized: Error:', error);
        throw error;
      }

      if (!data?.length) {
        trackQueryPerformance('conversations-empty', startTime);
        return [];
      }

      // Transform to conversation format with O(1) processing
      const conversations = data.map((conv: any) => {
        const isUserParticipantA = conv.participant_a === user.id;
        
        return {
          id: conv.id,
          participant_a: conv.participant_a,
          participant_b: conv.participant_b,
          last_message_id: conv.last_message_id,
          created_at: conv.created_at,
          updated_at: conv.updated_at,
          other_participant: {
            id: isUserParticipantA ? conv.participant_b : conv.participant_a,
            username: isUserParticipantA ? conv.participant_b_username : conv.participant_a_username,
            display_name: isUserParticipantA ? conv.participant_b_name : conv.participant_a_name,
            avatar_url: isUserParticipantA ? conv.participant_b_avatar : conv.participant_a_avatar
          },
          last_message: conv.last_message_body ? {
            id: conv.last_message_id,
            body: conv.last_message_body,
            kind: conv.last_message_kind,
            sender_id: conv.last_message_sender_id,
            created_at: conv.last_message_created_at,
            deleted_for_everyone: conv.last_message_deleted
          } : null,
          unread_count: 0 // Will be calculated separately if needed
        };
      });

      trackQueryPerformance('conversations-complete', startTime);
      return conversations as Conversation[];
    },
    staleTime: 1 * 60 * 1000, // 1 minute - real-time feel
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2
  });
};

/**
 * Ultra-fast messages hook with optimized queries
 */
export const useMessagesOptimized = (conversationId?: string) => {
  const { trackQueryPerformance } = usePerformanceMonitoring('useMessagesOptimized');

  return useQuery({
    queryKey: ['messages-optimized', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];
      
      const startTime = Date.now();

      // Single optimized query with all required data
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          attachments:message_attachments(*),
          receipts:message_receipts(*)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (!data?.length) {
        trackQueryPerformance('messages-empty', startTime);
        return [];
      }

      // Get all sender profiles in single batch query
      const senderIds = [...new Set(data.map(m => m.sender_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url')
        .in('user_id', senderIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      // Process messages with O(1) lookups
      const processedMessages = data.map(message => ({
        ...message,
        sender: {
          id: message.sender_id,
          ...profileMap.get(message.sender_id)
        }
      }));

      trackQueryPerformance('messages-complete', startTime);
      return processedMessages as Message[];
    },
    enabled: !!conversationId,
    staleTime: 30 * 1000, // 30 seconds for real-time messaging
    gcTime: 2 * 60 * 1000,
    refetchOnWindowFocus: false,
    retry: 2
  });
};

/**
 * Optimized send message mutation with instant UI updates
 */
export const useSendMessageOptimized = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { trackQueryPerformance } = usePerformanceMonitoring('useSendMessageOptimized');

  return useMutation({
    mutationFn: async ({
      conversationId,
      kind,
      body,
      meta,
      replyTo
    }: {
      conversationId: string;
      kind: Message['kind'];
      body?: string;
      meta?: any;
      replyTo?: string;
    }) => {
      const startTime = Date.now();
      const user = authSingleton.getUser();
      if (!user) throw new Error('User not authenticated');

      // Single optimized insert with minimal data
      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          kind,
          body: body || '',
          meta: meta || {},
          reply_to: replyTo
        })
        .select('*')
        .single();

      if (error) throw error;

      // Update conversation timestamp in parallel
      supabase
        .from('conversations')
        .update({
          last_message_id: message.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId)
        .then(); // Fire and forget

      trackQueryPerformance('send-message-complete', startTime);
      return message;
    },
    // Optimistic updates for instant messaging feel
    onMutate: async ({ conversationId, body, kind }) => {
      const user = authSingleton.getUser();
      if (!user) return;

      await queryClient.cancelQueries({ queryKey: ['messages-optimized', conversationId] });
      
      const previousMessages = queryClient.getQueryData(['messages-optimized', conversationId]);
      
      // Add optimistic message
      const optimisticMessage = {
        id: `optimistic-${Date.now()}`,
        conversation_id: conversationId,
        sender_id: user.id,
        kind,
        body: body || '',
        created_at: new Date().toISOString(),
        sender: {
          user_id: user.id,
          display_name: 'You'
        },
        attachments: [],
        receipts: []
      };

      queryClient.setQueryData(['messages-optimized', conversationId], (old: any) => {
        return old ? [...old, optimisticMessage] : [optimisticMessage];
      });

      return { previousMessages };
    },
    onSuccess: (data) => {
      // Replace optimistic message with real message
      queryClient.setQueryData(['messages-optimized', data.conversation_id], (old: any) => {
        if (!old) return old;
        return old.map((msg: any) => 
          msg.id.toString().startsWith('optimistic-') ? data : msg
        );
      });
      
      queryClient.invalidateQueries({ queryKey: ['conversations-optimized'] });
    },
    onError: (error, variables, context) => {
      if (context?.previousMessages) {
        queryClient.setQueryData(['messages-optimized', variables.conversationId], context.previousMessages);
      }
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  });
};
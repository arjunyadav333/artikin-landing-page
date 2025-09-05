import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import { useQueryPerformance } from '@/hooks/usePerformanceMonitoring';

// Simple types that work with the current database schema
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  kind: string;
  body?: string;  // matches database field
  media_url?: string;
  media_type?: string;
  deleted: boolean;
  deleted_for_everyone: boolean;  // matches database field
  created_at: string;
  client_id?: string;  // for optimistic UI reconciliation
  pending?: boolean;   // for optimistic UI status
  sender?: {
    user_id: string;
    username?: string;
    display_name?: string;
    avatar_url?: string;
  };
  attachments?: MessageAttachment[];
  receipts?: MessageReceipt[];
}

export interface MessageAttachment {
  id: string;
  message_id: string;
  file_url: string;
  mime_type: string;
  file_size?: number;
  width?: number;
  height?: number;
  duration?: number;
}

export interface MessageReceipt {
  message_id: string;
  user_id: string;
  status: 'sent' | 'delivered' | 'seen';
  updated_at: string;
}

export interface Conversation {
  id: string;
  created_at: string;
  updated_at: string;
  other_participant?: {
    user_id: string;
    username?: string;
    display_name?: string;
    avatar_url?: string;
    bio?: string;
    role?: string;
  };
  last_message?: any;
  unread_count?: number;
  participant_settings?: {
    muted: boolean;
    pinned: boolean;
    archived: boolean;
    deleted: boolean;
  };
}

// Simplified hook to fetch conversations
export const useConversations = () => {
  const { user } = useAuth();
  const { markQueryComplete } = useQueryPerformance(['conversations']);
  
  return useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user) return [];

      try {
        // Direct approach: Get conversations where user is a participant
        const { data: conversations, error: conversationsError } = await supabase
          .from('conversations')
          .select('*')
          .or(`participant_a.eq.${user.id},participant_b.eq.${user.id}`)
          .order('updated_at', { ascending: false });

        if (conversationsError) {
          console.error('Error fetching conversations:', conversationsError);
          return [];
        }

        if (!conversations?.length) return [];

        // Get participant settings for each conversation
        const conversationIds = conversations.map(c => c.id);
        const { data: participantData } = await supabase
          .from('conversation_participants')
          .select('conversation_id, pinned, deleted, muted, archived')
          .eq('user_id', user.id)
          .in('conversation_id', conversationIds);

        // Build conversation objects with other participant info
        const result = await Promise.all(
          conversations
            .filter(conv => {
              // Only show non-deleted conversations
              const settings = participantData?.find(p => p.conversation_id === conv.id);
              return !settings?.deleted;
            })
            .map(async (conv) => {
              const participantSettings = participantData?.find(p => p.conversation_id === conv.id);

              // Get other participant ID
              const otherParticipantId = conv.participant_a === user.id 
                ? conv.participant_b 
                : conv.participant_a;

              // Get other participant profile
              const { data: profile } = await supabase
                .from('profiles')
                .select('user_id, username, display_name, avatar_url, bio, role')
                .eq('user_id', otherParticipantId)
                .single();

              return {
                id: conv.id,
                created_at: conv.created_at,
                updated_at: conv.updated_at,
                other_participant: profile ? {
                  id: profile.user_id,
                  user_id: profile.user_id,
                  username: profile.username,
                  display_name: profile.display_name,
                  avatar_url: profile.avatar_url,
                  bio: profile.bio,
                  role: profile.role
                } : null,
                last_message: null,
                unread_count: 0,
                participant_settings: participantSettings || {
                  pinned: false,
                  deleted: false,
                  muted: false,
                  archived: false
                }
              };
            })
        );

        markQueryComplete();
        return result.filter(conv => conv.other_participant);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        return [];
      }
    },
    enabled: !!user
  });
};

// Hook to fetch messages for a conversation
export const useMessages = (conversationId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];

      try {
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (error) throw error;

        // Get sender info for each message
        const messagesWithSenders = await Promise.all(
          (data || []).map(async (msg) => {
            const { data: sender } = await supabase
              .from('profiles')
              .select('user_id, username, display_name, avatar_url')
              .eq('user_id', msg.sender_id)
              .single();

            return {
              ...msg,
              deleted_for_everyone: msg.deleted_for_everyone || false,
              sender,
              attachments: [],
              receipts: []
            };
          })
        );

        return messagesWithSenders as Message[];
      } catch (error) {
        console.error('Error fetching messages:', error);
        return [];
      }
    },
    enabled: !!conversationId && !!user
  });
};

// Hook to send a message
export const useSendMessage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      conversationId,
      kind = 'text',
      body
    }: {
      conversationId: string;
      kind?: string;
      body?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          kind,
          body
        })
        .select()
        .single();

      if (error) throw error;

      // Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      return message;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages', data.conversation_id] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  });
};

// Create or get conversation using edge function
export const useCreateOrGetConversation = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (otherUserId: string) => {
      if (!user) throw new Error('User not authenticated');

      // Use the edge function for reliable conversation creation
      const { data, error } = await supabase.functions.invoke('create-or-get-conversation', {
        body: { otherUserId }
      });

      if (error) throw error;
      
      return data.conversationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error) => {
      console.error('Error creating conversation:', error);
      toast({
        title: "Error",
        description: "Failed to start conversation. Please try again.",
        variant: "destructive"
      });
    }
  });
};

// Simplified mark messages as read
export const useMarkMessagesAsRead = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      conversationId,
      messageId
    }: {
      conversationId: string;
      messageId: string;
    }) => {
      // Simple implementation
      await supabase
        .from('conversation_participants')
        .update({ last_read_message_id: messageId })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
    }
  });
};

// Real-time updates (simplified)
export const useRealtimeMessages = (conversationId?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);
};

// Typing indicators (simplified)
export const useTypingIndicator = (conversationId?: string) => {
  const [typingUsers] = useState<string[]>([]);

  const sendTypingStatus = useCallback(() => {
    // Placeholder for now
  }, []);

  return { typingUsers, sendTypingStatus };
};
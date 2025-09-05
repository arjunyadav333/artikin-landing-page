import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import { useQueryPerformance } from '@/hooks/usePerformanceMonitoring';

// Types for the updated messaging system
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  kind: 'text' | 'image' | 'video' | 'document';
  content?: string;
  media_url?: string;
  media_type?: string;
  deleted: boolean;
  deleted_for_all: boolean;
  deleted_by?: string;
  deleted_at?: string;
  created_at: string;
  sender?: {
    id: string;
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
    id: string;
    username?: string;
    display_name?: string;
    avatar_url?: string;
    bio?: string;
    role?: string;
  };
  last_message?: Message;
  unread_count?: number;
  participant_settings?: {
    muted: boolean;
    pinned: boolean;
    archived: boolean;
    deleted: boolean;
    last_read_message_id?: string;
    drafted_text?: string;
  };
}

export interface ConversationParticipant {
  conversation_id: string;
  user_id: string;
  muted: boolean;
  pinned: boolean;
  archived: boolean;
  last_read_message_id?: string;
  drafted_text?: string;
}

// Hook to fetch conversations for current user
export const useConversations = () => {
  const { user } = useAuth();
  const { markQueryComplete } = useQueryPerformance(['conversations']);
  
  return useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get conversations where user is a participant and not deleted
      const { data: participants, error: participantsError } = await supabase
        .from('conversation_participants')
        .select(`
          conversation_id,
          pinned,
          deleted,
          muted,
          archived,
          last_read_message_id,
          drafted_text,
          conversations!inner(
            id,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id)
        .eq('deleted', false)
        .order('pinned', { ascending: false });

      if (participantsError) throw participantsError;
      if (!participants || participants.length === 0) return [];

      // Enrich conversations with other participant info and last message
      const enrichedConversations = await Promise.all(
        participants.map(async (p: any) => {
          const conv = p.conversations;
          
          // Get other participant
          const { data: otherParticipants, error: otherError } = await supabase
            .from('conversation_participants')
            .select(`
              user_id,
              profiles!inner(
                user_id,
                username,
                display_name,
                avatar_url,
                bio,
                role
              )
            `)
            .eq('conversation_id', conv.id)
            .neq('user_id', user.id)
            .single();

          if (otherError) {
            console.error('Error fetching other participant:', otherError);
            return null;
          }

          // Get last message
          const { data: lastMessage } = await supabase
            .from('messages')
            .select('id, content, media_type, created_at, sender_id, deleted, deleted_for_all')
            .eq('conversation_id', conv.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();

          // Get unread count
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .neq('sender_id', user.id);

          return {
            id: conv.id,
            created_at: conv.created_at,
            updated_at: conv.updated_at,
            other_participant: otherParticipants?.profiles,
            last_message: lastMessage,
            unread_count: unreadCount || 0,
            participant_settings: {
              pinned: p.pinned,
              deleted: p.deleted,
              muted: p.muted,
              archived: p.archived,
              last_read_message_id: p.last_read_message_id,
              drafted_text: p.drafted_text
            }
          };
        })
      );

      const validConversations = enrichedConversations
        .filter(Boolean)
        .sort((a, b) => {
          // Pinned conversations first
          if (a.participant_settings?.pinned !== b.participant_settings?.pinned) {
            return (b.participant_settings?.pinned ? 1 : 0) - (a.participant_settings?.pinned ? 1 : 0);
          }
          // Then by updated_at
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        });

      markQueryComplete();
      return validConversations as Conversation[];
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

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          attachments:message_attachments(*),
          receipts:message_receipts(*),
          sender:profiles!messages_sender_id_fkey(
            user_id,
            username,
            display_name,
            avatar_url
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(30);

      if (error) throw error;

      return data as Message[];
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
      kind,
      content,
      mediaUrl,
      mediaType,
      attachments
    }: {
      conversationId: string;
      kind: Message['kind'];
      content?: string;
      mediaUrl?: string;
      mediaType?: string;
      attachments?: Omit<MessageAttachment, 'id' | 'message_id'>[];
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Insert message
      const { data: message, error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          kind,
          content,
          media_url: mediaUrl,
          media_type: mediaType
        })
        .select()
        .single();

      if (messageError) throw messageError;

      // Insert attachments if any
      if (attachments && attachments.length > 0) {
        const { error: attachmentError } = await supabase
          .from('message_attachments')
          .insert(
            attachments.map(att => ({
              ...att,
              message_id: message.id
            }))
          );

        if (attachmentError) throw attachmentError;
      }

      // Create receipt for sender
      await supabase
        .from('message_receipts')
        .insert({
          message_id: message.id,
          user_id: user.id,
          status: 'sent'
        });

      // Update conversation updated_at
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', conversationId);

      return message;
    },
    onSuccess: (data) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages', data.conversation_id] });
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  });
};

// Hook to create or get conversation using RPC
export const useCreateOrGetConversation = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (otherUserId: string) => {
      if (!user) throw new Error('User not authenticated');

      // Check if conversation exists
      const { data: existing, error: checkError } = await supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('user_id', user.id)
        .in('conversation_id', 
          supabase.from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', otherUserId)
        )
        .maybeSingle();

      if (checkError) throw checkError;
      
      if (existing) {
        return existing.conversation_id;
      }

      // Create new conversation
      const { data: newConv, error } = await supabase
        .from('conversations')
        .insert({})
        .select('id')
        .single();

      if (error) throw error;

      // Add participants
      await supabase
        .from('conversation_participants')
        .insert([
          { conversation_id: newConv.id, user_id: user.id },
          { conversation_id: newConv.id, user_id: otherUserId }
        ]);

      return newConv.id;

      if (error) throw error;
      return conversationId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });
};

// Hook to mark messages as read using the new database function
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
      if (!user) throw new Error('User not authenticated');

      // Use the new database function for efficient read marking
      // Mark messages as seen manually
      const { error } = await supabase
        .from('message_receipts')
        .upsert({
          message_id: messageId,
          user_id: user.id,
          status: 'seen'
        });
      
      const { data } = await supabase
        .from('conversation_participants')
        .update({ last_read_message_id: messageId })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      queryClient.invalidateQueries({ queryKey: ['messages', variables.conversationId] });
    }
  });
};

// Hook for real-time message updates
export const useRealtimeMessages = (conversationId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversationId || !user) return;

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
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'message_receipts'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user, queryClient]);
};

// Hook for typing indicators
export const useTypingIndicator = (conversationId?: string) => {
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<string[]>([]);

  const sendTypingStatus = useCallback((isTyping: boolean) => {
    if (!conversationId || !user) return;

    const channel = supabase.channel(`typing:${conversationId}`);
    
    if (isTyping) {
      channel.track({ user_id: user.id, typing: true });
    } else {
      channel.untrack();
    }
  }, [conversationId, user]);

  useEffect(() => {
    if (!conversationId || !user) return;

    const channel = supabase
      .channel(`typing:${conversationId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const typing = Object.values(state)
          .flat()
          .filter((presence: any) => presence.user_id !== user.id && presence.typing)
          .map((presence: any) => presence.user_id);
        
        setTypingUsers(typing);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user]);

  return { typingUsers, sendTypingStatus };
};
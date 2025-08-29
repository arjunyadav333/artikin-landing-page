import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

// Types for the new messaging system
export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  kind: 'text' | 'image' | 'video' | 'document' | 'audio' | 'voice' | 'link' | 'sticker';
  body?: string;
  meta?: any;
  reply_to?: string;
  edited_at?: string;
  deleted_for_everyone: boolean;
  created_at: string;
  sender?: {
    id: string;
    username?: string;
    display_name?: string;
    avatar_url?: string;
  };
  attachments?: MessageAttachment[];
  receipts?: MessageReceipt[];
  reply_message?: Message;
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
  status: 'sent' | 'delivered' | 'read';
  updated_at: string;
}

export interface Conversation {
  id: string;
  participant_a: string;
  participant_b: string;
  last_message_id?: string;
  updated_at: string;
  created_at: string;
  other_participant?: {
    id: string;
    username?: string;
    display_name?: string;
    avatar_url?: string;
    bio?: string;
  };
  last_message?: Message;
  unread_count?: number;
  participant_settings?: {
    muted: boolean;
    pinned: boolean;
    archived: boolean;
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
  
  return useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          last_message:messages!conversations_last_message_id_fkey(
            id,
            body,
            kind,
            created_at,
            sender_id,
            deleted_for_everyone
          )
        `)
        .or(`participant_a.eq.${user.id},participant_b.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      // Enrich conversations with other participant info and settings
      const enrichedConversations = await Promise.all(
        data.map(async (conv: any) => {
          const otherParticipantId = conv.participant_a === user.id 
            ? conv.participant_b 
            : conv.participant_a;

          // Get other participant profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, user_id, username, display_name, avatar_url, bio')
            .eq('user_id', otherParticipantId)
            .maybeSingle();

          // Get participant settings
          const { data: settings } = await supabase
            .from('conversation_participants')
            .select('muted, pinned, archived, last_read_message_id, drafted_text')
            .eq('conversation_id', conv.id)
            .eq('user_id', user.id)
            .maybeSingle();

          // Get unread count
          const { count: unreadCount } = await supabase
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('conversation_id', conv.id)
            .neq('sender_id', user.id);

          return {
            ...conv,
            other_participant: profile,
            unread_count: unreadCount || 0,
            participant_settings: settings
          };
        })
      );

      return enrichedConversations as Conversation[];
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
          reply_message:messages!messages_reply_to_fkey(
            id,
            body,
            kind,
            sender_id,
            created_at
          )
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Enrich with sender profiles
      const enrichedMessages = await Promise.all(
        data.map(async (message: any) => {
          const { data: sender } = await supabase
            .from('profiles')
            .select('id, user_id, username, display_name, avatar_url')
            .eq('user_id', message.sender_id)
            .maybeSingle();

          return {
            ...message,
            sender
          };
        })
      );

      return enrichedMessages as Message[];
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
      body,
      meta,
      replyTo,
      attachments
    }: {
      conversationId: string;
      kind: Message['kind'];
      body?: string;
      meta?: any;
      replyTo?: string;
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
          body,
          meta: meta || {},
          reply_to: replyTo
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

      // Update conversation's last_message_id and updated_at
      await supabase
        .from('conversations')
        .update({
          last_message_id: message.id,
          updated_at: new Date().toISOString()
        })
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

// Hook to create or get conversation
export const useCreateOrGetConversation = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (otherUserId: string) => {
      if (!user) throw new Error('User not authenticated');

      // Check if conversation already exists
      const { data: existing, error: checkError } = await supabase
        .from('conversations')
        .select('id')
        .or(`and(participant_a.eq.${user.id},participant_b.eq.${otherUserId}),and(participant_a.eq.${otherUserId},participant_b.eq.${user.id})`)
        .maybeSingle();

      if (checkError) throw checkError;

      if (existing) {
        return existing.id;
      }

      // Create new conversation
      const { data: newConv, error: createError } = await supabase
        .from('conversations')
        .insert({
          participant_a: user.id,
          participant_b: otherUserId
        })
        .select('id')
        .single();

      if (createError) throw createError;

      // Create participant records
      await supabase
        .from('conversation_participants')
        .insert([
          {
            conversation_id: newConv.id,
            user_id: user.id
          },
          {
            conversation_id: newConv.id,
            user_id: otherUserId
          }
        ]);

      return newConv.id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });
};

// Hook to mark messages as read
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

      // Update conversation participant's last_read_message_id
      await supabase
        .from('conversation_participants')
        .update({ last_read_message_id: messageId })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);

      // Mark messages as read up to this message
      await supabase
        .from('message_receipts')
        .upsert({
          message_id: messageId,
          user_id: user.id,
          status: 'read'
        });
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
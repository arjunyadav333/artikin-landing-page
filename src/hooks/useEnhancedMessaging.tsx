import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';

export interface EnhancedMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  message_type?: string;
  kind?: string;
  content?: string;
  body?: string;
  link_preview?: {
    title?: string;
    description?: string;
    image_url?: string;
    url?: string;
  };
  media_url?: string;
  replied_to_message_id?: string;
  delivered_at?: string;
  seen_at?: string;
  edited: boolean;
  deleted: boolean;
  deleted_for_everyone: boolean;
  created_at: string;
  client_id?: string;
  sender?: {
    user_id: string;
    username?: string;
    display_name?: string;
    avatar_url?: string;
  };
  reactions?: MessageReaction[];
  replied_to_message?: EnhancedMessage;
}

export interface MessageReaction {
  id: string;
  message_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
  user?: {
    display_name?: string;
    username?: string;
  };
}

export interface EnhancedConversation {
  id: string;
  participant_a: string;
  participant_b: string;
  opportunity_id?: string;
  last_message_type?: string;
  last_message_at?: string;
  unread_count_user1?: number;
  unread_count_user2?: number;
  created_at: string;
  updated_at: string;
  other_participant?: {
    user_id: string;
    username?: string;
    display_name?: string;
    avatar_url?: string;
    role?: string;
  };
  last_message?: EnhancedMessage;
  unread_count?: number;
  participant_settings?: {
    muted: boolean;
    pinned: boolean;
    archived: boolean;
    deleted: boolean;
  };
}

// Enhanced hook to fetch conversations with full message details
export const useEnhancedConversations = () => {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['enhanced-conversations', user?.id],
    queryFn: async () => {
      if (!user) return [];

      // Get conversations where user is a participant
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

      // Build enhanced conversation objects
      const result = await Promise.all(
        conversations
          .filter(conv => {
            const settings = participantData?.find(p => p.conversation_id === conv.id);
            return !settings?.deleted;
          })
          .map(async (conv) => {
            const participantSettings = participantData?.find(p => p.conversation_id === conv.id);

            // Get other participant ID and info
            const otherParticipantId = conv.participant_a === user.id 
              ? conv.participant_b 
              : conv.participant_a;

            const { data: profile } = await supabase
              .from('profiles')
              .select('user_id, username, display_name, avatar_url, role')
              .eq('user_id', otherParticipantId)
              .single();

            // Get last message with full details
            let lastMessage = null;
            if (conv.last_message_id) {
              const { data: msgData } = await supabase
                .from('messages')
                .select('*')
                .eq('id', conv.last_message_id)
                .single();
              
              if (msgData) {
                // Get sender info for last message
                const { data: senderData } = await supabase
                  .from('profiles')
                  .select('user_id, username, display_name, avatar_url')
                  .eq('user_id', msgData.sender_id)
                  .single();

                lastMessage = {
                  ...msgData,
                  content: msgData.body,
                  sender: senderData
                };
              }
            }

            // Calculate unread count for current user
            const unreadCount = conv.participant_a === user.id 
              ? conv.unread_count_user1 || 0
              : conv.unread_count_user2 || 0;

            return {
              ...conv,
              other_participant: profile,
              last_message: lastMessage,
              unread_count: unreadCount,
              participant_settings: participantSettings || {
                pinned: false,
                deleted: false,
                muted: false,
                archived: false
              }
            } as EnhancedConversation;
          })
      );

      return result.filter(conv => conv.other_participant);
    },
    enabled: !!user
  });
};

// Enhanced hook to fetch messages with reactions and replies
export const useEnhancedMessages = (conversationId?: string) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['enhanced-messages', conversationId],
    queryFn: async () => {
      if (!conversationId) return [];

      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (!data?.length) return [];

      // Get sender info for all messages
      const senderIds = [...new Set(data.map(m => m.sender_id))];
      const { data: senders } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url')
        .in('user_id', senderIds);

      // Get reactions for all messages
      const messageIds = data.map(m => m.id);
      const { data: reactions } = await supabase
        .from('message_reactions')
        .select('id, message_id, user_id, emoji, created_at')
        .in('message_id', messageIds);

      return data.map(msg => ({
        ...msg,
        content: msg.body,
        sender: senders?.find(s => s.user_id === msg.sender_id),
        reactions: reactions?.filter(r => r.message_id === msg.id) || [],
        replied_to_message: null // Will be implemented later with a separate query
      })) as EnhancedMessage[];
    },
    enabled: !!conversationId && !!user
  });
};

// Hook to send enhanced messages with optimistic updates
export const useSendEnhancedMessage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({
      conversationId,
      messageType = 'text',
      content,
      mediaUrl,
      linkPreview,
      replyToMessageId
    }: {
      conversationId: string;
      messageType?: string;
      content?: string;
      mediaUrl?: string;
      linkPreview?: any;
      replyToMessageId?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Use RPC for faster message creation
      const { data, error } = await supabase.rpc('create_message_with_client_id', {
        conversation_id_param: conversationId,
        sender_id_param: user.id,
        client_id_param: `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        kind_param: messageType,
        body_param: content
      });

      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Failed to create message');
      }

      return data[0];
    },
    onSuccess: (data, variables) => {
      // Update conversation query to move it to top
      queryClient.invalidateQueries({ queryKey: ['enhanced-conversations'] });
      
      // Optimistically add message to the messages query
      const queryKey = ['enhanced-messages', variables.conversationId];
      queryClient.setQueryData(queryKey, (oldData: any) => {
        if (!oldData) return oldData;
        
        const newMessage = {
          id: data.id,
          conversation_id: variables.conversationId,
          sender_id: user!.id,
          kind: variables.messageType || 'text',
          body: variables.content,
          media_url: variables.mediaUrl,
          link_preview: variables.linkPreview,
          replied_to_message_id: variables.replyToMessageId,
          created_at: data.created_at || new Date().toISOString(),
          updated_at: data.created_at || new Date().toISOString(),
          content: variables.content,
          sender: {
            user_id: user!.id,
            username: user!.user_metadata?.username || 'You',
            display_name: user!.user_metadata?.display_name || 'You',
            avatar_url: user!.user_metadata?.avatar_url
          },
          reactions: []
        };
        
        return [...oldData, newMessage];
      });
    },
    onError: (error: any) => {
      console.error('Message send error:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  });
};

// Hook to add/remove reactions
export const useMessageReactions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const addReaction = useMutation({
    mutationFn: async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('message_reactions')
        .insert({
          message_id: messageId,
          user_id: user.id,
          emoji
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-messages'] });
    }
  });

  const removeReaction = useMutation({
    mutationFn: async ({ messageId, emoji }: { messageId: string; emoji: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('message_reactions')
        .delete()
        .eq('message_id', messageId)
        .eq('user_id', user.id)
        .eq('emoji', emoji);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-messages'] });
    }
  });

  return { addReaction, removeReaction };
};

// Hook to mark messages as seen
export const useMarkMessageSeen = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ messageId }: { messageId: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('messages')
        .update({ seen_at: new Date().toISOString() })
        .eq('id', messageId)
        .neq('sender_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-messages'] });
      queryClient.invalidateQueries({ queryKey: ['enhanced-conversations'] });
    }
  });
};

// Hook to edit messages
export const useEditMessage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ messageId, content }: { messageId: string; content: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('messages')
        .update({
          body: content,
          edited: true
        })
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-messages'] });
    }
  });
};

// Hook to delete messages
export const useDeleteMessage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ messageId }: { messageId: string }) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('messages')
        .update({
          deleted_for_everyone: true,
          body: null
        })
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-messages'] });
      queryClient.invalidateQueries({ queryKey: ['enhanced-conversations'] });
    }
  });
};

// Real-time updates for enhanced messages
export const useEnhancedRealtimeMessages = (conversationId?: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!conversationId) return;

    const messageChannel = supabase
      .channel(`enhanced-messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['enhanced-messages', conversationId] });
          queryClient.invalidateQueries({ queryKey: ['enhanced-conversations'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_reactions'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['enhanced-messages', conversationId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
    };
  }, [conversationId, queryClient]);
};

// Typing indicators
export const useTypingIndicators = (conversationId?: string) => {
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const { user } = useAuth();

  const sendTypingStatus = useCallback(() => {
    if (!conversationId || !user) return;
    
    // Send typing status via realtime
    const channel = supabase.channel(`typing:${conversationId}`);
    channel.send({
      type: 'broadcast',
      event: 'typing',
      payload: { user_id: user.id }
    });
  }, [conversationId, user]);

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`typing:${conversationId}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.user_id !== user?.id) {
          setTypingUsers(prev => [...prev.filter(id => id !== payload.payload.user_id), payload.payload.user_id]);
          
          // Remove typing indicator after 3 seconds
          setTimeout(() => {
            setTypingUsers(prev => prev.filter(id => id !== payload.payload.user_id));
          }, 3000);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, user?.id]);

  return { typingUsers, sendTypingStatus };
};
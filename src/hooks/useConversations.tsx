import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Conversation {
  id: string;
  participant_one: string;
  participant_two: string;
  created_at: string;
  updated_at: string;
  other_participant?: {
    user_id: string;
    username: string;
    display_name: string;
    avatar_url?: string;
    role?: string;
  };
  last_message?: {
    content: string;
    created_at: string;
    sender_id: string;
  };
  unread_count: number;
}

export const useConversations = () => {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Get conversations where user is a participant
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select(`
          id,
          participant_one,
          participant_two,
          created_at,
          updated_at
        `)
        .or(`participant_one.eq.${user.id},participant_two.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      if (!conversations?.length) return [];

      // Get profiles for other participants
      const otherParticipantIds = conversations.map(conv => 
        conv.participant_one === user.id ? conv.participant_two : conv.participant_one
      );

      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, username, display_name, avatar_url, role')
        .in('user_id', otherParticipantIds);

      // Get latest message for each conversation
      const conversationIds = conversations.map(conv => conv.id);
      const { data: latestMessages } = await supabase
        .from('messages')
        .select('conversation_id, content, created_at, sender_id')
        .in('conversation_id', conversationIds)
        .order('created_at', { ascending: false });

      // Get unread counts
      const { data: unreadCounts } = await supabase
        .from('messages')
        .select('conversation_id, sender_id')
        .in('conversation_id', conversationIds)
        .neq('sender_id', user.id)
        .is('read_at', null);

      // Combine data
      return conversations.map(conv => {
        const otherParticipantId = conv.participant_one === user.id 
          ? conv.participant_two 
          : conv.participant_one;
        
        const otherParticipant = profiles?.find(p => p.user_id === otherParticipantId);
        const lastMessage = latestMessages?.find(m => m.conversation_id === conv.id);
        const unreadCount = unreadCounts?.filter(m => m.conversation_id === conv.id).length || 0;

        return {
          ...conv,
          other_participant: otherParticipant,
          last_message: lastMessage,
          unread_count: unreadCount
        };
      });
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: true,
  });
};

export const useCreateConversation = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (otherUserId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Use the get_or_create_conversation function
      const { data, error } = await supabase
        .rpc('get_or_create_conversation', {
          user1_id: user.id,
          user2_id: otherUserId
        });

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to create conversation",
        description: error.message,
        variant: "destructive"
      });
    }
  });
};
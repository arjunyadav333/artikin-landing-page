import { useState, useCallback, useRef, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from '@/hooks/use-toast';
import { fastSendManager, type OptimisticMessage } from '@/lib/FastSendManager';
import type { Message } from './useMessaging';

export const useFastMessaging = (conversationId: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [optimisticMessages, setOptimisticMessages] = useState<OptimisticMessage[]>([]);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  // Clean up optimistic messages when component unmounts
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  // Handle real-time message reconciliation
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
        (payload) => {
          const serverMessage = payload.new as Message;
          console.log('Received server message:', serverMessage);
          
          // Reconcile with optimistic message
          if (serverMessage.client_id) {
            setOptimisticMessages(prev => 
              prev.filter(msg => msg.client_id !== serverMessage.client_id)
            );
          }
          
          // Invalidate queries to refresh UI with server data
          queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId, queryClient]);

  const sendMessage = useCallback(async (content: string, kind: string = 'text') => {
    if (!user || !conversationId) {
      throw new Error('User not authenticated or conversation not found');
    }

    try {
      const { optimisticMessage, promise } = await fastSendManager.sendMessage(
        conversationId,
        content,
        user.id,
        kind
      );

      // Add optimistic message to local state
      setOptimisticMessages(prev => [...prev, optimisticMessage]);

      try {
        // Wait for server response
        const { serverId, serverTimestamp } = await promise;
        
        console.log('Message sent successfully:', { serverId, serverTimestamp });
        
        // Update optimistic message status
        setOptimisticMessages(prev => 
          prev.map(msg => 
            msg.client_id === optimisticMessage.client_id 
              ? { ...msg, status: 'sent', pending: false }
              : msg
          )
        );
        
      } catch (sendError) {
        console.error('Message send failed:', sendError);
        
        // Mark message as failed
        setOptimisticMessages(prev => 
          prev.map(msg => 
            msg.client_id === optimisticMessage.client_id 
              ? { ...msg, status: 'failed', pending: false }
              : msg
          )
        );

        // Show error toast but don't throw - let user retry
        toast({
          title: "Message failed to send",
          description: "Tap the message to retry",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Failed to initiate message send:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  }, [user, conversationId, toast]);

  const retryMessage = useCallback(async (optimisticMessage: OptimisticMessage) => {
    if (!user) return;

    try {
      // Update status to sending
      setOptimisticMessages(prev => 
        prev.map(msg => 
          msg.client_id === optimisticMessage.client_id 
            ? { ...msg, status: 'sending', pending: true }
            : msg
        )
      );

      const { serverId, serverTimestamp } = await fastSendManager.retryMessage(optimisticMessage);
      
      // Update to sent status
      setOptimisticMessages(prev => 
        prev.map(msg => 
          msg.client_id === optimisticMessage.client_id 
            ? { ...msg, status: 'sent', pending: false }
            : msg
        )
      );

      console.log('Message retry successful:', { serverId, serverTimestamp });
      
    } catch (error) {
      console.error('Message retry failed:', error);
      
      // Mark as failed again
      setOptimisticMessages(prev => 
        prev.map(msg => 
          msg.client_id === optimisticMessage.client_id 
            ? { ...msg, status: 'failed', pending: false }
            : msg
        )
      );

      toast({
        title: "Retry failed",
        description: "Message could not be sent",
        variant: "destructive"
      });
    }
  }, [user, toast]);

  const deleteOptimisticMessage = useCallback((clientId: string) => {
    setOptimisticMessages(prev => prev.filter(msg => msg.client_id !== clientId));
  }, []);

  const deleteMessage = useCallback(async (messageId: string) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.rpc('delete_message_for_everyone', {
        message_id_param: messageId
      });

      if (error) throw error;

      if (data) {
        toast({
          title: "Message deleted",
          description: "The message has been deleted for everyone"
        });
        
        // Invalidate queries to refresh UI
        queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      } else {
        throw new Error('Failed to delete message');
      }

    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: "Error",
        description: "Failed to delete message. Please try again.",
        variant: "destructive"
      });
    }
  }, [user, conversationId, toast, queryClient]);

  return {
    optimisticMessages,
    sendMessage,
    retryMessage,
    deleteOptimisticMessage,
    deleteMessage
  };
};
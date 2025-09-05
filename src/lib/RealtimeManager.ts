import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface TypingUser {
  user_id: string;
  username?: string;
  display_name?: string;
}

interface RealtimeCallbacks {
  onMessageInsert?: (message: any) => void;
  onMessageUpdate?: (message: any) => void;
  onTypingUpdate?: (typingUsers: TypingUser[]) => void;
  onReceiptUpdate?: (receipt: any) => void;
}

/**
 * RealtimeManager - Centralized real-time subscription management
 * 
 * Features:
 * - Message subscriptions with automatic reconnection
 * - Typing indicators with auto-cleanup
 * - Message receipts (delivered/seen status)
 * - Connection health monitoring
 * - Subscription lifecycle management
 */
export class RealtimeManager {
  private static instance: RealtimeManager;
  private channels = new Map<string, RealtimeChannel>();
  private callbacks = new Map<string, RealtimeCallbacks>();
  private reconnectTimeouts = new Map<string, NodeJS.Timeout>();
  private isConnected = true;

  private constructor() {
    this.setupConnectionMonitoring();
  }

  static getInstance(): RealtimeManager {
    if (!RealtimeManager.instance) {
      RealtimeManager.instance = new RealtimeManager();
    }
    return RealtimeManager.instance;
  }

  /**
   * Subscribe to real-time updates for a conversation
   */
  subscribeToConversation(
    conversationId: string,
    callbacks: RealtimeCallbacks
  ): () => void {
    console.log('🔔 Subscribing to conversation:', conversationId);

    // Store callbacks
    this.callbacks.set(conversationId, callbacks);

    // Create channel for this conversation
    const channel = supabase.channel(`conversation:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          console.log('📨 New message received:', payload.new);
          callbacks.onMessageInsert?.(payload.new);
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
        (payload) => {
          console.log('✏️ Message updated:', payload.new);
          callbacks.onMessageUpdate?.(payload.new);
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'message_receipts'
        },
        (payload) => {
          console.log('📋 Receipt updated:', payload.new);
          callbacks.onReceiptUpdate?.(payload.new);
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status for', conversationId, ':', status);
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Successfully subscribed to conversation:', conversationId);
        } else if (status === 'CHANNEL_ERROR') {
          console.error('❌ Subscription error for conversation:', conversationId);
          this.handleReconnect(conversationId, callbacks);
        }
      });

    this.channels.set(conversationId, channel);

    // Return unsubscribe function
    return () => this.unsubscribeFromConversation(conversationId);
  }

  /**
   * Subscribe to typing indicators for a conversation
   */
  subscribeToTyping(
    conversationId: string,
    onTypingUpdate: (typingUsers: TypingUser[]) => void
  ): () => void {
    console.log('⌨️ Subscribing to typing for:', conversationId);

    // For now, we'll implement typing through direct state management
    // since typing_status table may not exist yet
    
    const typingChannelName = `typing:${conversationId}`;
    const typingChannel = supabase.channel(typingChannelName)
      .on('presence', { event: 'sync' }, () => {
        const presences = typingChannel.presenceState();
        const typingUsers: TypingUser[] = [];
        
        Object.values(presences).forEach((presence: any) => {
          if (Array.isArray(presence)) {
            presence.forEach((p: any) => {
              if (p.typing) {
                typingUsers.push({
                  user_id: p.user_id,
                  username: p.username,
                  display_name: p.display_name
                });
              }
            });
          }
        });
        
        onTypingUpdate(typingUsers);
      })
      .subscribe();

    this.channels.set(typingChannelName, typingChannel);

    return () => {
      this.channels.get(typingChannelName)?.unsubscribe();
      this.channels.delete(typingChannelName);
    };
  }

  /**
   * Send typing status using presence
   */
  async sendTypingStatus(conversationId: string, isTyping: boolean = true, userInfo?: { username?: string; display_name?: string }) {
    try {
      const typingChannelName = `typing:${conversationId}`;
      const channel = this.channels.get(typingChannelName);
      
      if (channel) {
        const user = (await supabase.auth.getUser()).data.user;
        if (user) {
          if (isTyping) {
            await channel.track({
              user_id: user.id,
              username: userInfo?.username || user.user_metadata?.username,
              display_name: userInfo?.display_name || user.user_metadata?.display_name,
              typing: true,
              timestamp: Date.now()
            });
          } else {
            await channel.untrack();
          }
        }
      }
    } catch (error) {
      console.error('❌ Typing status error:', error);
    }
  }

  /**
   * Create delivery receipt when message is received
   */
  async markMessageDelivered(messageId: string) {
    try {
      const { error } = await supabase
        .from('message_receipts')
        .upsert({
          message_id: messageId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          status: 'delivered'
        }, {
          onConflict: 'message_id,user_id'
        });

      if (error) {
        console.error('❌ Failed to mark message delivered:', error);
      }
    } catch (error) {
      console.error('❌ Delivery receipt error:', error);
    }
  }

  /**
   * Mark messages as seen/read
   */
  async markMessagesAsSeen(conversationId: string, upToMessageId: string) {
    try {
      const { error } = await supabase.rpc('mark_conversation_messages_read', {
        conversation_id_param: conversationId,
        user_id_param: (await supabase.auth.getUser()).data.user?.id,
        up_to_message_id: upToMessageId
      });

      if (error) {
        console.error('❌ Failed to mark messages as seen:', error);
      }
    } catch (error) {
      console.error('❌ Mark seen error:', error);
    }
  }

  /**
   * Unsubscribe from conversation
   */
  private unsubscribeFromConversation(conversationId: string) {
    console.log('🔕 Unsubscribing from conversation:', conversationId);
    
    const channel = this.channels.get(conversationId);
    if (channel) {
      channel.unsubscribe();
      this.channels.delete(conversationId);
    }

    this.callbacks.delete(conversationId);

    // Clear any pending reconnect timeout
    const timeout = this.reconnectTimeouts.get(conversationId);
    if (timeout) {
      clearTimeout(timeout);
      this.reconnectTimeouts.delete(conversationId);
    }
  }

  /**
   * Handle reconnection for failed subscriptions
   */
  private handleReconnect(conversationId: string, callbacks: RealtimeCallbacks) {
    console.log('🔄 Scheduling reconnect for:', conversationId);
    
    // Clear existing timeout
    const existingTimeout = this.reconnectTimeouts.get(conversationId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }

    // Schedule reconnect
    const timeout = setTimeout(() => {
      console.log('🔄 Reconnecting to conversation:', conversationId);
      this.unsubscribeFromConversation(conversationId);
      this.subscribeToConversation(conversationId, callbacks);
    }, 3000);

    this.reconnectTimeouts.set(conversationId, timeout);
  }

  /**
   * Monitor connection health
   */
  private setupConnectionMonitoring() {
    // Monitor online/offline status
    window.addEventListener('online', () => {
      console.log('🌐 Back online - checking subscriptions');
      this.isConnected = true;
      this.reconnectAllChannels();
    });

    window.addEventListener('offline', () => {
      console.log('📴 Gone offline');
      this.isConnected = false;
    });

    // Monitor Supabase connection
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        this.cleanup();
      }
    });
  }

  /**
   * Reconnect all active channels
   */
  private reconnectAllChannels() {
    if (!this.isConnected) return;

    this.callbacks.forEach((callbacks, conversationId) => {
      if (conversationId.startsWith('typing:')) return;
      
      console.log('🔄 Reconnecting channel:', conversationId);
      this.unsubscribeFromConversation(conversationId);
      setTimeout(() => {
        this.subscribeToConversation(conversationId, callbacks);
      }, 1000);
    });
  }

  /**
   * Clean up all resources
   */
  cleanup() {
    console.log('🧹 Cleaning up RealtimeManager');
    
    // Unsubscribe all channels
    this.channels.forEach((channel) => {
      channel.unsubscribe();
    });

    // Clear all maps
    this.channels.clear();
    this.callbacks.clear();
    
    // Clear timeouts
    this.reconnectTimeouts.forEach(timeout => clearTimeout(timeout));
    this.reconnectTimeouts.clear();
  }
}

// Export singleton instance
export const realtimeManager = RealtimeManager.getInstance();
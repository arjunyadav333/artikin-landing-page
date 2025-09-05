import { supabase } from '@/integrations/supabase/client';
import type { Message } from '@/hooks/useMessaging';

// Generate UUID without external dependency
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export interface OptimisticMessage extends Omit<Message, 'id'> {
  client_id: string;
  id: string;
  pending: boolean;
  created_at: string;
  status?: 'sending' | 'sent' | 'failed';
  retry_count?: number;
}

export interface FastSendConfig {
  maxRetries: number;
  ackTimeout: number;
  retryDelay: number;
}

const DEFAULT_CONFIG: FastSendConfig = {
  maxRetries: 3,
  ackTimeout: 800, // 800ms timeout for ACK
  retryDelay: 1000, // 1s base retry delay
};

export class FastSendManager {
  private static instance: FastSendManager;
  private websocket: WebSocket | null = null;
  private messageCallbacks: Map<string, {
    onAck: (ack: any) => void;
    onError: (error: any) => void;
    timeout: NodeJS.Timeout;
  }> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private isConnecting = false;
  private config: FastSendConfig;

  private constructor(config: Partial<FastSendConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.initWebSocket();
  }

  public static getInstance(config?: Partial<FastSendConfig>): FastSendManager {
    if (!FastSendManager.instance) {
      FastSendManager.instance = new FastSendManager(config);
    }
    return FastSendManager.instance;
  }

  private async initWebSocket() {
    if (this.isConnecting || this.websocket?.readyState === WebSocket.OPEN) {
      return;
    }

    this.isConnecting = true;

    try {
      // Use Supabase project URL for WebSocket connection to our edge function
      const wsUrl = `wss://uyhgnqrtirnwaxqemacw.functions.supabase.co/functions/v1/fast-message-ack`;
      
      this.websocket = new WebSocket(wsUrl);

      this.websocket.onopen = () => {
        console.log('FastSend WebSocket connected');
        this.reconnectAttempts = 0;
        this.isConnecting = false;
      };

      this.websocket.onmessage = (event) => {
        this.handleWebSocketMessage(event);
      };

      this.websocket.onclose = () => {
        console.log('FastSend WebSocket disconnected');
        this.isConnecting = false;
        this.scheduleReconnect();
      };

      this.websocket.onerror = (error) => {
        console.error('FastSend WebSocket error:', error);
        this.isConnecting = false;
      };

    } catch (error) {
      console.error('Failed to initialize WebSocket:', error);
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  private handleWebSocketMessage(event: MessageEvent) {
    try {
      const data = JSON.parse(event.data);
      
      if (data.type === 'ack' && data.client_id) {
        const callback = this.messageCallbacks.get(data.client_id);
        if (callback) {
          clearTimeout(callback.timeout);
          callback.onAck(data);
          this.messageCallbacks.delete(data.client_id);
        }
      }
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    setTimeout(() => {
      this.reconnectAttempts++;
      console.log(`Reconnecting WebSocket (attempt ${this.reconnectAttempts})`);
      this.initWebSocket();
    }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
  }

  public async sendMessage(
    conversationId: string,
    content: string,
    senderId: string,
    kind: string = 'text'
  ): Promise<{
    optimisticMessage: OptimisticMessage;
    promise: Promise<{ serverId: string; serverTimestamp: string }>;
  }> {
    const clientId = `client_${generateUUID()}`;
    
    // Create optimistic message for immediate UI update
    const optimisticMessage: OptimisticMessage = {
      client_id: clientId,
      id: clientId, // Use client_id as temporary id
      conversation_id: conversationId,
      sender_id: senderId,
      kind,
      body: content,
      deleted: false,
      deleted_for_everyone: false,
      created_at: new Date().toISOString(),
      pending: true,
      status: 'sending',
      retry_count: 0,
      sender: undefined, // Will be populated by UI
      attachments: [],
      receipts: []
    };

    // Create promise for server response
    const sendPromise = new Promise<{ serverId: string; serverTimestamp: string }>((resolve, reject) => {
      // Set up timeout and callbacks
      const timeout = setTimeout(() => {
        this.messageCallbacks.delete(clientId);
        reject(new Error('Message send timeout'));
      }, this.config.ackTimeout);

      this.messageCallbacks.set(clientId, {
        onAck: (ack) => {
          resolve({
            serverId: ack.server_id,
            serverTimestamp: ack.server_timestamp
          });
        },
        onError: (error) => {
          reject(error);
        },
        timeout
      });

      // Send via WebSocket if available, otherwise fallback to direct HTTP
      this.sendViaWebSocket(clientId, conversationId, content, senderId, kind)
        .catch((wsError) => {
          console.log('WebSocket send failed, falling back to HTTP:', wsError);
          this.sendViaHTTP(clientId, conversationId, content, senderId, kind)
            .then((result) => {
              clearTimeout(timeout);
              this.messageCallbacks.delete(clientId);
              resolve(result);
            })
            .catch((httpError) => {
              clearTimeout(timeout);
              this.messageCallbacks.delete(clientId);
              reject(httpError);
            });
        });
    });

    return {
      optimisticMessage,
      promise: sendPromise
    };
  }

  private async sendViaWebSocket(
    clientId: string,
    conversationId: string,
    content: string,
    senderId: string,
    kind: string
  ): Promise<void> {
    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not available');
    }

    const payload = {
      type: 'fast_message',
      client_id: clientId,
      conversation_id: conversationId,
      content,
      sender_id: senderId,
      kind
    };

    this.websocket.send(JSON.stringify(payload));
  }

  private async sendViaHTTP(
    clientId: string,
    conversationId: string,
    content: string,
    senderId: string,
    kind: string
  ): Promise<{ serverId: string; serverTimestamp: string }> {
    const { data, error } = await supabase.rpc('create_message_with_client_id', {
      conversation_id_param: conversationId,
      sender_id_param: senderId,
      client_id_param: clientId,
      kind_param: kind,
      body_param: content
    });

    if (error) throw error;

    return {
      serverId: data[0].id,
      serverTimestamp: data[0].server_timestamp
    };
  }

  public async retryMessage(
    optimisticMessage: OptimisticMessage
  ): Promise<{ serverId: string; serverTimestamp: string }> {
    const retryCount = (optimisticMessage.retry_count || 0) + 1;
    
    if (retryCount > this.config.maxRetries) {
      throw new Error('Max retries exceeded');
    }

    // Add exponential backoff
    const delay = this.config.retryDelay * Math.pow(2, retryCount - 1);
    await new Promise(resolve => setTimeout(resolve, delay));

    const { promise } = await this.sendMessage(
      optimisticMessage.conversation_id,
      optimisticMessage.body || '',
      optimisticMessage.sender_id,
      optimisticMessage.kind
    );

    return promise;
  }

  public destroy() {
    // Clear all pending callbacks
    this.messageCallbacks.forEach(callback => {
      clearTimeout(callback.timeout);
    });
    this.messageCallbacks.clear();

    // Close WebSocket
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }

    // Reset instance
    FastSendManager.instance = null as any;
  }
}

// Export singleton instance
export const fastSendManager = FastSendManager.getInstance();
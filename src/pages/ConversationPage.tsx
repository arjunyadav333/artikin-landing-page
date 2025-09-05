import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Send } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { 
  useMessages, 
  useSendMessage, 
  useRealtimeMessages, 
  useTypingIndicator, 
  useMarkMessagesAsRead,
  useConversations
} from "@/hooks/useMessaging";
import { ConversationActions } from "@/components/messaging/ConversationActions";
import { MessageItem } from "@/components/messaging/MessageItem";
import { MessageListSkeleton } from "@/components/ui/message-skeleton";
import { FileUpload } from "@/components/messaging/file-upload";
import { useDraftMessage } from "@/hooks/useDraftMessage";
import { useState, useEffect, useCallback, useRef } from "react";
import { cn } from "@/lib/utils";

const ConversationPage = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [optimisticMessages, setOptimisticMessages] = useState<Array<{
    id: string;
    body?: string;
    attachments?: Array<{
      file_url: string;
      mime_type: string;
      file_size?: number;
      width?: number;
      height?: number;
      duration?: number;
    }>;
    status: 'sending' | 'failed';
    retry?: () => void;
  }>>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect if no chatId
  if (!chatId) {
    navigate('/messages');
    return null;
  }

  const { data: conversations = [] } = useConversations();
  const { data: messages = [], isLoading: messagesLoading } = useMessages(chatId);
  const sendMessageMutation = useSendMessage();
  const markAsReadMutation = useMarkMessagesAsRead();
  const { draftText, updateDraft, clearDraft } = useDraftMessage(chatId);
  const { typingUsers, sendTypingStatus } = useTypingIndicator(chatId);
  
  // Enable real-time updates
  useRealtimeMessages(chatId);

  // Find current conversation
  const conversation = conversations.find(c => c.id === chatId);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mark messages as read when conversation is opened
  useEffect(() => {
    if (chatId && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.sender_id !== user?.id) {
        markAsReadMutation.mutate({
          conversationId: chatId,
          messageId: lastMessage.id
        });
      }
    }
  }, [chatId, messages, user?.id, markAsReadMutation]);

  const handleSendMessage = async (attachments: Array<{
    file_url: string;
    mime_type: string;
    file_size?: number;
    width?: number;
    height?: number;
    duration?: number;
  }> = []) => {
    if ((!draftText.trim() && attachments.length === 0) || !chatId || !user) return;

    const optimisticId = `optimistic_${Date.now()}`;
    const messageBody = draftText.trim();

    // Add optimistic message for immediate UI feedback
    const optimisticMessage = {
      id: optimisticId,
      body: messageBody || undefined,
      attachments: attachments.length > 0 ? attachments : undefined,
      status: 'sending' as const,
    };

    setOptimisticMessages(prev => [...prev, optimisticMessage]);
    clearDraft();
    sendTypingStatus(false);

    try {
      await sendMessageMutation.mutateAsync({
        conversationId: chatId,
        kind: attachments.length > 0 ? attachments[0].mime_type.split('/')[0] as any : 'text',
        content: messageBody || undefined,
        mediaUrl: attachments.length > 0 ? attachments[0].file_url : undefined,
        mediaType: attachments.length > 0 ? attachments[0].mime_type : undefined,
        attachments: attachments.map(att => ({
          file_url: att.file_url,
          mime_type: att.mime_type,
          file_size: att.file_size,
          width: att.width,
          height: att.height,
          duration: att.duration
        }))
      });
      
      // Remove optimistic message on success
      setOptimisticMessages(prev => prev.filter(m => m.id !== optimisticId));
    } catch (error) {
      console.error('Failed to send message:', error);
      
      // Mark optimistic message as failed with retry
      setOptimisticMessages(prev => 
        prev.map(m => m.id === optimisticId 
          ? { 
              ...m, 
              status: 'failed' as const,
              retry: () => {
                setOptimisticMessages(p => p.filter(msg => msg.id !== optimisticId));
                updateDraft(messageBody);
                handleSendMessage(attachments);
              }
            }
          : m
        )
      );
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleTyping = useCallback((value: string) => {
    updateDraft(value);
    
    // Send typing indicator
    if (value.trim()) {
      sendTypingStatus(true);
      
      // Clear existing timeout
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
      
      // Set new timeout to stop typing
      const timeout = setTimeout(() => {
        sendTypingStatus(false);
      }, 1500);
      
      setTypingTimeout(timeout);
    } else {
      sendTypingStatus(false);
      if (typingTimeout) {
        clearTimeout(typingTimeout);
        setTypingTimeout(null);
      }
    }
  }, [updateDraft, sendTypingStatus, typingTimeout]);

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!conversation) {
    return (
      <AppLayout>
        <div className="h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Conversation not found</h2>
            <p className="text-muted-foreground mb-4">
              This conversation may have been deleted or you don't have access to it.
            </p>
            <Button onClick={() => navigate('/messages')}>
              Back to Messages
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="h-screen bg-background flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b bg-card">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/messages')}
                className="lg:hidden"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Avatar className="h-10 w-10">
                <AvatarImage 
                  src={conversation.other_participant?.avatar_url} 
                  alt={conversation.other_participant?.display_name} 
                />
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {getInitials(conversation.other_participant?.display_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold">
                  {conversation.other_participant?.display_name || 'Unknown User'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {typingUsers.length > 0 ? 'typing...' : `@${conversation.other_participant?.username || 'unknown'}`}
                </p>
              </div>
            </div>

            <ConversationActions
              conversationId={conversation.id}
              isPinned={conversation.participant_settings?.pinned || false}
              otherParticipant={conversation.other_participant}
              onClose={() => navigate('/messages')}
            />
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          {messagesLoading ? (
            <MessageListSkeleton count={8} />
          ) : messages.length === 0 ? (
            <div className="text-center text-muted-foreground">
              <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="h-6 w-6" />
              </div>
              <h4 className="font-medium mb-2">No messages yet</h4>
              <p className="text-sm">Start the conversation with your first message</p>
            </div>
          ) : (
            <>
              {messages.map((message, index) => {
                const isOwn = message.sender_id === user?.id;
                const showSender = !isOwn && (
                  index === 0 || 
                  messages[index - 1].sender_id !== message.sender_id
                );
                
                return (
                  <MessageItem
                    key={message.id}
                    message={message}
                    isOwn={isOwn}
                    showSender={showSender}
                  />
                );
              })}

              {/* Optimistic messages */}
              {optimisticMessages.map((message) => (
                <MessageItem
                  key={message.id}
                  message={{
                    id: message.id,
                    conversation_id: chatId,
                    sender_id: user?.id!,
                    kind: 'text',
                    content: message.body,
                    deleted: false,
                    deleted_for_all: false,
                    created_at: new Date().toISOString(),
                    attachments: message.attachments as any
                  }}
                  isOwn={true}
                  isOptimistic={true}
                  status={message.status}
                  onRetry={message.retry}
                />
              ))}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t bg-card">
          <div className="flex items-end gap-2">
            <FileUpload
              onFileUploaded={(fileData) => {
                handleSendMessage([fileData]);
              }}
              disabled={sendMessageMutation.isPending}
            />
            
            <div className="flex-1 relative">
              <Input
                value={draftText}
                onChange={(e) => handleTyping(e.target.value)}
                placeholder="Type a message..."
                className="pr-12 resize-none min-h-[40px] max-h-32"
                onKeyPress={handleKeyPress}
                disabled={sendMessageMutation.isPending}
              />
              <Button
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => handleSendMessage()}
                disabled={!draftText.trim() || sendMessageMutation.isPending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ConversationPage;
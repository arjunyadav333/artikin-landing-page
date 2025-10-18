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
  useRealtimeMessages, 
  useTypingIndicator, 
  useMarkMessagesAsRead,
  useConversations
} from "@/hooks/useMessaging";
import { useFastMessaging } from "@/hooks/useFastMessaging";
import { useVisualViewport } from "@/hooks/useVisualViewport";
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const composerRef = useRef<HTMLDivElement>(null);
  const viewportInfo = useVisualViewport();

  // Redirect if no chatId
  if (!chatId) {
    navigate('/messages');
    return null;
  }

  const { data: conversations = [] } = useConversations();
  const { data: messages = [], isLoading: messagesLoading } = useMessages(chatId);
  const markAsReadMutation = useMarkMessagesAsRead();
  const { draftText, updateDraft, clearDraft } = useDraftMessage(chatId);
  const { typingUsers, sendTypingStatus } = useTypingIndicator(chatId);
  
  // Use fast messaging hook for instant send
  const { 
    optimisticMessages, 
    sendMessage: fastSendMessage, 
    retryMessage,
    deleteMessage 
  } = useFastMessaging(chatId);
  
  // Enable real-time updates
  useRealtimeMessages(chatId);

  // Find current conversation
  const conversation = conversations.find(c => c.id === chatId);

  // Merge server messages and optimistic messages for display
  const allMessages = [
    ...messages,
    ...optimisticMessages.map(opt => ({
      ...opt,
      sender: user ? {
        user_id: user.id,
        username: user.user_metadata?.username,
        display_name: user.user_metadata?.display_name || user.email,
        avatar_url: user.user_metadata?.avatar_url
      } : undefined,
      attachments: opt.attachments || [],
      receipts: []
    }))
  ].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  // Auto-scroll to bottom instantly when messages change
  useEffect(() => {
    if (allMessages.length > 0) {
      requestAnimationFrame(() => {
        messagesEndRef.current?.scrollIntoView({ 
          behavior: 'instant',
          block: 'end' 
        });
      });
    }
  }, [allMessages.length]);

  // Initial scroll to bottom when conversation first loads
  useEffect(() => {
    if (chatId && allMessages.length > 0) {
      const timeoutId = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ 
          behavior: 'instant',
          block: 'end' 
        });
      }, 50);
      
      return () => clearTimeout(timeoutId);
    }
  }, [chatId, allMessages.length]);

  // Handle keyboard visibility changes
  useEffect(() => {
    if (viewportInfo.isKeyboardOpen && composerRef.current) {
      // Adjust composer position for keyboard
      composerRef.current.style.bottom = `${viewportInfo.keyboardHeight}px`;
      
      // Scroll to bottom when keyboard opens
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 100);
    } else if (composerRef.current) {
      // Reset composer position when keyboard closes
      composerRef.current.style.bottom = '0px';
    }
  }, [viewportInfo.isKeyboardOpen, viewportInfo.keyboardHeight]);

  // Focus input for new conversations or when conversation loads
  useEffect(() => {
    if (conversation && messages.length === 0 && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [conversation, messages.length]);

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

    const messageText = draftText.trim();
    
    // Clear draft immediately and wait for it to complete
    await clearDraft();
    sendTypingStatus();

    try {
      // Use fast send for instant UI response
      await fastSendMessage(messageText, 'text');
      
      // Auto-scroll to show new message
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 50);
      
    } catch (error) {
      console.error('Failed to send message:', error);
      // Error handling is managed by the fast messaging hook
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
    sendTypingStatus();
  }, [updateDraft, sendTypingStatus]);

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
      <div className="mobile-vh bg-background flex flex-col md:h-auto">
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
              <button 
                onClick={() => navigate(`/profile/${conversation.other_participant?.username}`)}
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer"
              >
                <Avatar className="h-10 w-10 ring-2 ring-transparent hover:ring-primary/20 transition-all">
                  <AvatarImage 
                    src={conversation.other_participant?.avatar_url} 
                    alt={conversation.other_participant?.display_name} 
                  />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {getInitials(conversation.other_participant?.display_name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold hover:underline cursor-pointer">
                    {conversation.other_participant?.display_name || 'Unknown User'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {typingUsers.length > 0 ? 'typing...' : `@${conversation.other_participant?.username || 'unknown'}`}
                  </p>
                </div>
              </button>
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
          ) : allMessages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="h-6 w-6" />
              </div>
              <h4 className="font-medium mb-2">Start the conversation</h4>
              <p className="text-sm">Send your first message to {conversation.other_participant?.display_name}</p>
            </div>
          ) : (
            <>
              {allMessages.map((message, index) => {
                const isOwn = message.sender_id === user?.id;
                const showSender = !isOwn && (
                  index === 0 || 
                  allMessages[index - 1].sender_id !== message.sender_id
                );
                
                const isOptimisticMessage = optimisticMessages.some(opt => opt.client_id === message.client_id);
                const optimisticMsg = optimisticMessages.find(opt => opt.client_id === message.client_id);
                
                return (
                  <MessageItem
                    key={message.client_id || message.id}
                    message={message}
                    isOwn={isOwn}
                    showSender={showSender}
                    isOptimistic={isOptimisticMessage}
                    status={optimisticMsg?.status}
                    onRetry={() => {
                      if (optimisticMsg) {
                        retryMessage(optimisticMsg);
                      }
                    }}
                    onDelete={(messageId) => deleteMessage(messageId)}
                  />
                );
              })}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </ScrollArea>

        {/* Message Input */}
        <div 
          ref={composerRef}
          className="sticky bottom-0 p-4 border-t bg-card/95 backdrop-blur-sm md:relative md:bg-card md:backdrop-blur-none"
          style={{ paddingBottom: `max(1rem, calc(1rem + env(safe-area-inset-bottom)))` }}
        >
          <div className="flex items-end gap-2">
            <FileUpload
              onFileUploaded={(fileData) => {
                handleSendMessage([fileData]);
              }}
              disabled={false}
            />
            
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                value={draftText}
                onChange={(e) => handleTyping(e.target.value)}
                placeholder="Type a message..."
                className="pr-12 resize-none min-h-[40px] max-h-32"
                onKeyPress={handleKeyPress}
                disabled={false}
              />
              <Button
                size="sm"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => handleSendMessage()}
                disabled={!draftText.trim()}
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
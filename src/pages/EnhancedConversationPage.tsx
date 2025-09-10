import { useParams, useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { 
  useEnhancedConversations,
  useEnhancedMessages,
  useEnhancedRealtimeMessages,
  useTypingIndicators,
  useSendEnhancedMessage,
  useMessageReactions,
  useEditMessage,
  useDeleteMessage,
  useMarkMessageSeen
} from "@/hooks/useEnhancedMessaging";
import { useDraftMessage } from "@/hooks/useDraftMessage";
import { EnhancedMessageItem } from "@/components/messaging/EnhancedMessageItem";
import { EnhancedMessageInput } from "@/components/messaging/EnhancedMessageInput";
import { ConversationActions } from "@/components/messaging/ConversationActions";
import { MessageListSkeleton } from "@/components/ui/message-skeleton";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useVisualViewport } from "@/hooks/useVisualViewport";

const EnhancedConversationPage = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [replyingTo, setReplyingTo] = useState(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { height: viewportHeight, isKeyboardOpen } = useVisualViewport();

  // Redirect if no chatId
  if (!chatId) {
    navigate('/messages');
    return null;
  }

  const { data: conversations = [] } = useEnhancedConversations();
  const { data: messages = [], isLoading: messagesLoading } = useEnhancedMessages(chatId);
  const { draftText, updateDraft, clearDraft } = useDraftMessage(chatId);
  const { typingUsers, sendTypingStatus } = useTypingIndicators(chatId);
  
  // Mutations
  const sendMessage = useSendEnhancedMessage();
  const { addReaction, removeReaction } = useMessageReactions();
  const editMessage = useEditMessage();
  const deleteMessage = useDeleteMessage();
  const markMessageSeen = useMarkMessageSeen();
  
  // Enable real-time updates
  useEnhancedRealtimeMessages(chatId);

  // Find current conversation
  const conversation = conversations.find(c => c.id === chatId);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
    };
    scrollToBottom();
  }, [messages]);

  // Mark messages as seen when conversation is opened
  useEffect(() => {
    if (chatId && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.sender_id !== user?.id && !lastMessage.seen_at) {
        markMessageSeen.mutate({ messageId: lastMessage.id });
      }
    }
  }, [chatId, messages, user?.id, markMessageSeen]);

  const handleSendMessage = async (options?: { 
    replyTo?: string;
    attachments?: File[];
  }) => {
    if ((!draftText.trim() && (!options?.attachments?.length)) || !chatId || !user) return;

    const messageText = draftText.trim();
    
    // Clear draft immediately
    await clearDraft();
    setReplyingTo(null);
    sendTypingStatus();

    try {
      await sendMessage.mutateAsync({
        conversationId: chatId,
        content: messageText,
        replyToMessageId: options?.replyTo || replyingTo?.id
      });
      
      // Keep input focused to prevent keyboard from closing
      setTimeout(() => {
        inputRef.current?.focus();
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 50);
      
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleReact = (messageId: string, emoji: string) => {
    addReaction.mutate({ messageId, emoji });
  };

  const handleRemoveReaction = (messageId: string, emoji: string) => {
    removeReaction.mutate({ messageId, emoji });
  };

  const handleEdit = (messageId: string, content: string) => {
    editMessage.mutate({ messageId, content });
  };

  const handleDelete = (messageId: string) => {
    deleteMessage.mutate({ messageId });
  };

  const handleReply = (message: any) => {
    setReplyingTo(message);
    inputRef.current?.focus();
  };

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
    <div 
      className="bg-background flex flex-col overflow-hidden"
      style={{ height: `${viewportHeight}px` }}
    >
      {/* Mobile Chat Header - Fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-50 flex-shrink-0 p-4 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 shadow-sm safe-area-inset-top">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/messages')}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <Avatar className="h-9 w-9">
              <AvatarImage 
                src={conversation.other_participant?.avatar_url} 
                alt={conversation.other_participant?.display_name} 
              />
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {getInitials(conversation.other_participant?.display_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold text-sm">
                {conversation.other_participant?.display_name || 'Unknown User'}
              </p>
              <p className="text-xs text-muted-foreground">
                {typingUsers.length > 0 ? 'typing...' : `@${conversation.other_participant?.username || 'unknown'}`}
              </p>
            </div>
          </div>

          <ConversationActions
            conversationId={conversation.id}
            isPinned={conversation.participant_settings?.pinned || false}
            otherParticipant={{
              ...conversation.other_participant,
              id: conversation.other_participant?.user_id || ''
            }}
            onClose={() => navigate('/messages')}
          />
        </div>
      </div>

      {/* Messages Area - Scrollable middle section */}
      <div 
        className="flex-1 overflow-hidden"
        style={{ 
          marginTop: '80px', // Account for fixed header
          marginBottom: isKeyboardOpen ? '140px' : '140px' // Account for fixed input
        }}
      >
        <ScrollArea className="h-full px-4 py-2">
          {messagesLoading ? (
            <MessageListSkeleton count={8} />
          ) : messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <ArrowLeft className="h-6 w-6" />
              </div>
              <h4 className="font-medium mb-2">Start the conversation</h4>
              <p className="text-sm">Send your first message to {conversation.other_participant?.display_name}</p>
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
                  <EnhancedMessageItem
                    key={message.id}
                    message={message}
                    isOwn={isOwn}
                    showSender={showSender}
                    onReply={handleReply}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onReact={handleReact}
                    onRemoveReaction={handleRemoveReaction}
                  />
                );
              })}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </ScrollArea>
      </div>

      {/* Message Input - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-50 flex-shrink-0 p-4 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 shadow-sm safe-area-inset-bottom">
        <EnhancedMessageInput
          ref={inputRef}
          value={draftText}
          onChange={updateDraft}
          onSend={handleSendMessage}
          onTyping={sendTypingStatus}
          replyingTo={replyingTo}
          onCancelReply={() => setReplyingTo(null)}
          disabled={sendMessage.isPending}
          placeholder={`Message ${conversation.other_participant?.display_name || 'someone'}...`}
        />
      </div>
    </div>
  );
};

export default EnhancedConversationPage;
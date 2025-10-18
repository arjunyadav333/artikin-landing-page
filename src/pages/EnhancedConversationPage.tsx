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
  useMarkMessageSeen,
  useConversationById
} from "@/hooks/useEnhancedMessaging";
import { useDraftMessage } from "@/hooks/useDraftMessage";
import { EnhancedMessageItem } from "@/components/messaging/EnhancedMessageItem";
import { EnhancedMessageInput } from "@/components/messaging/EnhancedMessageInput";
import { ConversationActions } from "@/components/messaging/ConversationActions";
import { MessageListSkeleton } from "@/components/ui/message-skeleton";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";


const EnhancedConversationPage = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [replyingTo, setReplyingTo] = useState(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  

  // Redirect if no chatId
  if (!chatId) {
    navigate('/messages');
    return null;
  }

  const { data: conversations = [] } = useEnhancedConversations();
  const { data: messages = [], isLoading: messagesLoading } = useEnhancedMessages(chatId);
  const { data: currentConversation, isLoading: conversationLoading, error: conversationError } = useConversationById(chatId);
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

  // Find current conversation (first try cache, then fallback to direct fetch)
  const conversation = conversations.find(c => c.id === chatId) || currentConversation;

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
    // Capture message text BEFORE any state changes
    const messageText = draftText.trim();
    
    console.log('🚀 handleSendMessage called', {
      messageText,
      messageLength: messageText.length,
      hasAttachments: options?.attachments?.length,
      chatId,
      userId: user?.id,
      userRole: user?.user_metadata?.role
    });
    
    if (!messageText && !options?.attachments?.length) {
      console.log('❌ Blocked: No content to send');
      return;
    }
    
    if (!chatId || !user) {
      console.log('❌ Blocked: No chatId or user');
      return;
    }

    console.log('✅ Proceeding to send message...');
    
    try {
      // Send message with captured text
      await sendMessage.mutateAsync({
        conversationId: chatId,
        content: messageText,
        replyToMessageId: options?.replyTo || replyingTo?.id
      });
      
      console.log('✅ Message sent successfully, clearing draft...');
      
      // Clear draft and UI only AFTER successful send
      clearDraft(); // Don't await
      setReplyingTo(null);
      sendTypingStatus();
      
      // Keep input focused
      setTimeout(() => {
        inputRef.current?.focus();
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 50);
      
    } catch (error) {
      console.error('❌ Failed to send message:', error);
      // Don't clear draft on error so user can retry
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

  if (conversationLoading) {
    return (
      <div className="mobile-conversation-layout bg-background flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Auto-redirect to messages if conversation doesn't exist
  useEffect(() => {
    if (!conversationLoading && !conversation && conversationError?.message === 'CONVERSATION_NOT_FOUND') {
      navigate('/messages', { replace: true });
    }
  }, [conversationLoading, conversation, conversationError, navigate]);

  if (!conversation) {
    return (
      <div className="mobile-conversation-layout bg-background flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">
            {conversationError?.message === 'ACCESS_DENIED' 
              ? 'Access Denied'
              : 'Loading conversation...'
            }
          </h2>
          <p className="text-muted-foreground mb-4">
            {conversationError?.message === 'ACCESS_DENIED'
              ? 'You don\'t have permission to view this conversation.'
              : 'Redirecting to your conversations...'
            }
          </p>
          <Button onClick={() => navigate('/messages')}>
            Back to Messages
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-conversation-layout bg-background">
      {/* Chat Header - Sticky at top */}
      <div className="conversation-header flex-shrink-0 p-4 pt-9 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 shadow-sm">
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
      <div className="conversation-messages flex-1 overflow-hidden">
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

      {/* Message Input - Sticky at bottom */}
      <div className="conversation-input flex-shrink-0 p-4 pb-9 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 shadow-sm">
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
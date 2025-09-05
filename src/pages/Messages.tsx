import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Send, 
  Plus,
  Filter,
  ArrowLeft
} from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { 
  useConversations,
  useMessages,
  useSendMessage,
  useRealtimeMessages,
  useTypingIndicator,
  useMarkMessagesAsRead,
  type Message,
  type Conversation,
  type MessageAttachment
} from "@/hooks/useMessaging";
import { NewMessageModal } from "@/components/messaging/NewMessageModal";
import { ConversationActions } from "@/components/messaging/ConversationActions";
import { MessageItem } from "@/components/messaging/MessageItem";
import { OptimisticMessageComponent } from "@/components/messaging/optimistic-message";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/messaging/file-upload";
import { ConversationListSkeleton } from "@/components/ui/conversation-skeleton";
import { MessageListSkeleton } from "@/components/ui/message-skeleton";
import { useDraftMessage } from "@/hooks/useDraftMessage";

const Messages = () => {
  const { chatId } = useParams();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(chatId || null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
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

  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Handle URL param changes
  useEffect(() => {
    if (chatId && chatId !== selectedConversationId) {
      setSelectedConversationId(chatId);
    }
  }, [chatId]);

  // Handle window resize for responsive layout
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show loading while checking auth
  if (loading) {
    return (
      <AppLayout>
        <div className="h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  // If no user, return early (redirect will happen via useEffect)
  if (!user) {
    return null;
  }

  const { data: conversations = [], isLoading: conversationsLoading, error: conversationsError } = useConversations();
  const { data: messages = [], isLoading: messagesLoading } = useMessages(selectedConversationId);
  const sendMessageMutation = useSendMessage();
  const markAsReadMutation = useMarkMessagesAsRead();
  const { draftText, updateDraft, clearDraft } = useDraftMessage(selectedConversationId);
  
  const { typingUsers, sendTypingStatus } = useTypingIndicator(selectedConversationId);
  
  // Enable real-time updates
  useRealtimeMessages(selectedConversationId);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conversation =>
    !searchTerm || 
    conversation.other_participant?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.other_participant?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.last_message?.body?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mark messages as read when conversation is opened
  useEffect(() => {
    if (selectedConversationId && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage && lastMessage.sender_id !== user?.id) {
        markAsReadMutation.mutate({
          conversationId: selectedConversationId,
          messageId: lastMessage.id
        });
      }
    }
  }, [selectedConversationId, messages, user?.id, markAsReadMutation]);

  const handleSendMessage = async (attachments: Array<{
    file_url: string;
    mime_type: string;
    file_size?: number;
    width?: number;
    height?: number;
    duration?: number;
  }> = []) => {
    if ((!draftText.trim() && attachments.length === 0) || !selectedConversationId || !user) return;

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
      // Convert to MessageAttachment format for the API
      const messageAttachments: Omit<MessageAttachment, 'id' | 'message_id'>[] = attachments.map(att => ({
        file_url: att.file_url,
        mime_type: att.mime_type,
        file_size: att.file_size,
        width: att.width,
        height: att.height,
        duration: att.duration
      }));

      await sendMessageMutation.mutateAsync({
        conversationId: selectedConversationId,
        kind: attachments.length > 0 ? attachments[0].mime_type.split('/')[0] as Message['kind'] : 'text',
        body: messageBody || undefined,
        attachments: messageAttachments
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
      
      toast({
        title: "Message failed",
        description: "Tap the error icon to retry sending.",
        variant: "destructive"
      });
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

  if (conversationsError) {
    console.error('Conversations error:', conversationsError);
    return (
      <AppLayout>
        <div className="h-screen bg-background flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <Card className="w-96">
              <CardContent className="p-6 text-center">
                <div className="h-12 w-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="h-6 w-6 text-destructive" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-destructive">Connection Error</h3>
                <p className="text-muted-foreground mb-4">
                  Unable to load conversations. Please check your internet connection and try again.
                </p>
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline"
                  className="w-full"
                >
                  Retry
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="h-screen bg-background flex flex-col">
        <div className="flex-1 flex overflow-hidden">
          {/* Conversations List */}
          <div className={cn(
            "border-r bg-card flex flex-col transition-all duration-300",
            isMobile ? (selectedConversationId ? "hidden" : "flex w-full") : "w-80 flex"
          )}>
            <div className="p-4 border-b">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Messages</h3>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowNewMessageModal(true)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-2 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1">
              {conversationsLoading ? (
                <ConversationListSkeleton count={6} />
              ) : filteredConversations.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">
                  <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="h-6 w-6" />
                  </div>
                  <h4 className="font-medium mb-2">No conversations yet</h4>
                  <p className="text-sm">
                    {searchTerm 
                      ? 'No conversations match your search' 
                      : 'Start a conversation with someone to begin messaging'
                    }
                  </p>
                </div>
              ) : (
                filteredConversations.map((conversation, index) => (
                  <div key={conversation.id}>
                    <div
                      className={cn(
                        "flex items-center space-x-3 p-4 cursor-pointer hover:bg-muted transition-colors",
                        selectedConversationId === conversation.id && "bg-muted",
                        conversation.participant_settings?.pinned && "bg-primary/5 border-l-2 border-l-primary"
                      )}
                      onClick={() => {
                        setSelectedConversationId(conversation.id);
                        navigate(`/messages/${conversation.id}`);
                      }}
                    >
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage 
                            src={conversation.other_participant?.avatar_url} 
                            alt={conversation.other_participant?.display_name} 
                          />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {getInitials(conversation.other_participant?.display_name)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-sm truncate">
                              {conversation.other_participant?.display_name || 'Unknown User'}
                            </p>
                            {conversation.participant_settings?.pinned && (
                              <Badge variant="secondary" className="text-xs px-1 py-0">
                                Pinned
                              </Badge>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {conversation.last_message?.created_at && 
                              formatDistanceToNow(new Date(conversation.last_message.created_at), { addSuffix: true })
                            }
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.last_message?.body || 'No messages yet'}
                        </p>
                      </div>

                      {(conversation.unread_count ?? 0) > 0 && (
                        <Badge className="bg-primary text-primary-foreground h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                          {conversation.unread_count}
                        </Badge>
                      )}
                    </div>
                    {index < filteredConversations.length - 1 && <Separator />}
                  </div>
                ))
              )}
            </ScrollArea>
          </div>

          {/* Chat Area */}
          <div className={cn(
            "flex-1 flex flex-col bg-background transition-all duration-300",
            isMobile && !selectedConversationId ? "hidden" : "flex"
          )}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b bg-card">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="lg:hidden"
                        onClick={() => setSelectedConversationId(null)}
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                      <Avatar className="h-10 w-10">
                        <AvatarImage 
                          src={selectedConversation.other_participant?.avatar_url} 
                          alt={selectedConversation.other_participant?.display_name} 
                        />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {getInitials(selectedConversation.other_participant?.display_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">
                          {selectedConversation.other_participant?.display_name || 'Unknown User'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {typingUsers.length > 0 ? 'typing...' : `@${selectedConversation.other_participant?.username || 'unknown'}`}
                        </p>
                      </div>
                    </div>

                    <ConversationActions
                      conversationId={selectedConversation.id}
                      isPinned={selectedConversation.participant_settings?.pinned || false}
                      otherParticipant={selectedConversation.other_participant}
                      onClose={() => {
                        setSelectedConversationId(null);
                        navigate('/messages');
                      }}
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
                            conversation_id: selectedConversationId!,
                            sender_id: user?.id!,
                            kind: 'text',
                            body: message.body,
                            attachments: message.attachments as any,
                            deleted_for_everyone: false,
                            created_at: new Date().toISOString()
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
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <h2 className="text-xl font-semibold mb-2">Select a conversation</h2>
                  <p className="text-muted-foreground">Choose a conversation from the sidebar to start messaging</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* New Message Modal */}
        <NewMessageModal
          open={showNewMessageModal}
          onOpenChange={setShowNewMessageModal}
        />
      </div>
    </AppLayout>
  );
};

export default Messages;
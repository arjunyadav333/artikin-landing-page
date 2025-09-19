import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Send, Plus, Filter, MoreVertical, Pin, Trash2, ArrowLeft } from "lucide-react";
import { useEnhancedConversations, useEnhancedMessages, useEnhancedRealtimeMessages, useTypingIndicators, useSendEnhancedMessage, useMessageReactions, useEditMessage, useDeleteMessage, useMarkMessageSeen } from "@/hooks/useEnhancedMessaging";
import { NewMessageModal } from "@/components/messaging/NewMessageModal";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { ConversationListSkeleton } from "@/components/ui/conversation-skeleton";
import { MessageListSkeleton } from "@/components/ui/message-skeleton";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useDraftMessage } from "@/hooks/useDraftMessage";
import { EnhancedMessageItem } from "@/components/messaging/EnhancedMessageItem";
import { EnhancedMessageInput } from "@/components/messaging/EnhancedMessageInput";
import { ConversationActions } from "@/components/messaging/ConversationActions";

const MessagesLayout = () => {
  const { chatId } = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If no user, return early (redirect will happen via useEffect)
  if (!user) {
    return null;
  }

  const { data: conversations = [], isLoading: conversationsLoading, error: conversationsError } = useEnhancedConversations();
  const { data: messages = [], isLoading: messagesLoading } = useEnhancedMessages(chatId);
  const { draftText, updateDraft, clearDraft } = useDraftMessage(chatId);
  const { typingUsers, sendTypingStatus } = useTypingIndicators(chatId);
  
  // Mutations for chat list
  const pinMutation = useMutation({
    mutationFn: async ({ conversationId, pinned }: { conversationId: string; pinned: boolean }) => {
      const { error } = await supabase
        .from('conversation_participants')
        .update({ pinned })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-conversations'] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      const { error } = await supabase
        .from('conversation_participants')
        .update({ 
          deleted: true
        })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-conversations'] });
    }
  });

  // Mutations for conversation
  const sendMessage = useSendEnhancedMessage();
  const { addReaction, removeReaction } = useMessageReactions();
  const editMessage = useEditMessage();
  const deleteMessage = useDeleteMessage();
  const markMessageSeen = useMarkMessageSeen();
  
  // Enable real-time updates for selected conversation
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

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conversation =>
    !searchTerm || 
    conversation.other_participant?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.other_participant?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.last_message?.body?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleConversationClick = (conversationId: string) => {
    navigate(`/messages/${conversationId}`);
  };

  const getRoleDisplay = (participant: any) => {
    if (participant?.role === 'artist') return 'Artist';
    if (participant?.role === 'organization') return 'Organization';
    return 'User';
  };

  const getLastMessagePreview = (message: any) => {
    if (!message) return 'No messages yet';
    if (message.deleted || message.deleted_for_everyone) return 'This message was deleted';
    if (message.body || message.content) return message.body || message.content;
    if (message.kind !== 'text' || message.message_type !== 'text') {
      if (message.kind === 'image' || message.message_type === 'image') return '📷 Photo';
      if (message.kind === 'video' || message.message_type === 'video') return '🎥 Video';
      if (message.kind === 'document') return '📄 Document';
    }
    return 'Attachment';
  };

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

  if (conversationsError) {
    console.error('Conversations error:', conversationsError);
    return (
      <div className="h-screen bg-background flex items-center justify-center">
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
    );
  }

  return (
    <div className="h-screen bg-background flex">
      {/* Left Sidebar - Chat List */}
      <div className="w-80 border-r bg-card flex flex-col">
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
            filteredConversations.map((conv, index) => (
              <div key={conv.id}>
                <div 
                  className={cn(
                    "flex items-center space-x-3 p-4 cursor-pointer hover:bg-muted transition-colors group",
                    chatId === conv.id && "bg-muted"
                  )}
                  onClick={() => handleConversationClick(conv.id)}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12">
                      <AvatarImage 
                        src={conv.other_participant?.avatar_url} 
                        alt={conv.other_participant?.display_name} 
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(conv.other_participant?.display_name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm truncate">
                          {conv.other_participant?.display_name || 'Unknown User'}
                        </p>
                        {conv.participant_settings?.pinned && (
                          <Pin className="h-3 w-3 text-primary" />
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {conv.last_message_at && 
                            formatDistanceToNow(new Date(conv.last_message_at), { addSuffix: true })
                          }
                        </span>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                pinMutation.mutate({
                                  conversationId: conv.id,
                                  pinned: !conv.participant_settings?.pinned
                                });
                              }}
                            >
                              <Pin className="h-4 w-4 mr-2" />
                              {conv.participant_settings?.pinned ? 'Unpin' : 'Pin'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteMutation.mutate(conv.id);
                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete conversation
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="text-xs px-1 py-0">
                        {getRoleDisplay(conv.other_participant)}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground truncate">
                      {getLastMessagePreview(conv.last_message)}
                    </p>
                  </div>

                  {(conv.unread_count ?? 0) > 0 && (
                    <Badge className="bg-primary text-primary-foreground h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                      {conv.unread_count}
                    </Badge>
                  )}
                </div>
                {index < filteredConversations.length - 1 && <Separator />}
              </div>
            ))
          )}
        </ScrollArea>
      </div>

      {/* Right Side - Conversation View */}
      <div className="flex-1 flex flex-col">
        {!chatId ? (
          // No conversation selected
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Send className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
              <p className="text-sm">Choose a conversation from the list to start messaging</p>
            </div>
          </div>
        ) : !conversation ? (
          // Conversation not found
          <div className="flex-1 flex items-center justify-center">
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
        ) : (
          // Active conversation
          <>
            {/* Chat Header */}
            <div className="flex-shrink-0 p-4 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
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

            {/* Messages Area */}
            <div className="flex-1 overflow-hidden">
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

            {/* Message Input */}
            <div className="flex-shrink-0 p-4 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 shadow-sm">
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
          </>
        )}
      </div>

      <NewMessageModal
        open={showNewMessageModal}
        onOpenChange={setShowNewMessageModal}
      />
    </div>
  );
};

export default MessagesLayout;

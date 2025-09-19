import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Send, Plus, Filter, MoreVertical, Pin, Trash2, ArrowLeft, Phone, Video, Info } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { useEnhancedConversations, useEnhancedMessages, useEnhancedRealtimeMessages, useTypingIndicators, useSendEnhancedMessage, useMessageReactions, useEditMessage, useDeleteMessage, useMarkMessageSeen } from "@/hooks/useEnhancedMessaging";
import { useFastMessaging } from "@/hooks/useFastMessaging";
import { useAuth } from "@/hooks/useAuth";
import { NewMessageModal } from "@/components/messaging/NewMessageModal";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { ConversationListSkeleton } from "@/components/ui/conversation-skeleton";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { EnhancedMessageInput } from "@/components/messaging/EnhancedMessageInput";
import { EnhancedMessageItem } from "@/components/messaging/EnhancedMessageItem";
import { Loader2 } from "lucide-react";
import { useDraftMessage } from "@/hooks/useDraftMessage";
import { useRef } from "react";
import { ConversationActions } from "@/components/messaging/ConversationActions";

const MessagesLayout = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  const [replyingTo, setReplyingTo] = useState<any>(null);
  
  const { chatId } = useParams<{ chatId: string }>();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

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

  const { data: conversations = [], isLoading: conversationsLoading } = useEnhancedConversations();
  
  // Message-related hooks (only if chatId exists)
  const { 
    data: messages = [], 
    isLoading: messagesLoading 
  } = useEnhancedMessages(chatId);
  
  const { optimisticMessages, sendMessage: sendOptimisticMessage } = useFastMessaging(chatId || '');
  
  useEnhancedRealtimeMessages(chatId);
  
  const { 
    typingUsers, 
    sendTypingStatus 
  } = useTypingIndicators(chatId);
  
  const sendEnhancedMessage = useSendEnhancedMessage();
  const { addReaction, removeReaction } = useMessageReactions();
  const editMessage = useEditMessage();
  const deleteMessage = useDeleteMessage();
  const markMessageSeen = useMarkMessageSeen();
  
  const { draftText, updateDraft, clearDraft } = useDraftMessage(chatId || '');

  // Pin and delete conversation mutations
  const pinMutation = useMutation({
    mutationFn: async ({ conversationId, pinned }: { conversationId: string; pinned: boolean }) => {
      const { error } = await supabase
        .from('conversation_participants')
        .update({ pinned })
        .eq('conversation_id', conversationId)
        .eq('user_id', user?.id);
      
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
        .update({ deleted: true })
        .eq('conversation_id', conversationId)
        .eq('user_id', user?.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['enhanced-conversations'] });
    }
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, optimisticMessages]);

  // Mark messages as seen when entering conversation
  useEffect(() => {
    if (chatId && messages.length > 0 && user) {
      const unreadMessages = messages.filter(msg => 
        msg.sender_id !== user.id
      );
      
      if (unreadMessages.length > 0) {
        markMessageSeen.mutate({
          messageId: unreadMessages[unreadMessages.length - 1].id
        });
      }
    }
  }, [chatId, messages, user, markMessageSeen]);

  const filteredConversations = conversations.filter(conversation => {
    if (!searchTerm.trim()) return true;
    const participantName = conversation.other_participant?.display_name?.toLowerCase() || '';
    const lastMessage = conversation.last_message?.content?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return participantName.includes(search) || lastMessage.includes(search);
  });

  const getInitials = (name?: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleConversationClick = (conversationId: string) => {
    navigate(`/messages/${conversationId}`);
  };

  const getRoleDisplay = (participant: any) => {
    if (!participant) return 'User';
    return participant.role === 'artist' ? 'Artist' : 
           participant.role === 'organization' ? 'Organization' : 'User';
  };

  const getLastMessagePreview = (lastMessage: any) => {
    if (!lastMessage) return 'No messages yet';
    if (lastMessage.deleted_at) return 'Message deleted';
    if (lastMessage.kind === 'image') return '📷 Photo';
    if (lastMessage.kind === 'file') return '📎 File';
    return lastMessage.content || 'No content';
  };

  const selectedConversation = chatId ? conversations.find(c => c.id === chatId) : null;
  const allMessages = [...messages, ...optimisticMessages].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const handleSendMessage = async (content: string, kind: string = 'text') => {
    if (!chatId || !content.trim()) return;
    
    await sendOptimisticMessage(content, kind);
    clearDraft();
    setReplyingTo(null);
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    const existingReaction = messages
      .find(m => m.id === messageId)?.reactions
      ?.find(r => r.user_id === user?.id && r.emoji === emoji);

    if (existingReaction) {
      await removeReaction.mutateAsync({ messageId, emoji });
    } else {
      await addReaction.mutateAsync({ messageId, emoji });
    }
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    await editMessage.mutateAsync({ messageId, content: newContent });
  };

  const handleDeleteMessage = async (messageId: string) => {
    await deleteMessage.mutateAsync({ messageId });
  };

  const handleReply = (message: any) => {
    setReplyingTo(message);
    inputRef.current?.focus();
  };

  return (
    <AppLayout>
      <div className="h-screen bg-background flex">
        {/* Left Sidebar - Conversations List */}
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
              filteredConversations.map((conversation, index) => (
                <div key={conversation.id}>
                  <div 
                    className={cn(
                      "flex items-center space-x-3 p-4 cursor-pointer hover:bg-muted transition-colors group",
                      chatId === conversation.id && "bg-muted"
                    )}
                    onClick={() => handleConversationClick(conversation.id)}
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
                            <Pin className="h-3 w-3 text-primary" />
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            {conversation.last_message_at && 
                              formatDistanceToNow(new Date(conversation.last_message_at), { addSuffix: true })
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
                                    conversationId: conversation.id,
                                    pinned: !conversation.participant_settings?.pinned
                                  });
                                }}
                              >
                                <Pin className="h-4 w-4 mr-2" />
                                {conversation.participant_settings?.pinned ? 'Unpin' : 'Pin'}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteMutation.mutate(conversation.id);
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
                          {getRoleDisplay(conversation.other_participant)}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground truncate">
                        {getLastMessagePreview(conversation.last_message)}
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

        {/* Right Side - Conversation View */}
        <div className="flex-1 flex flex-col">
          {chatId && selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="flex items-center justify-between p-4 pt-9 border-b bg-card">
                <div className="flex items-center space-x-3">
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
                    <h3 className="font-semibold">
                      {selectedConversation.other_participant?.display_name || 'Unknown User'}
                    </h3>
                    {typingUsers.length > 0 && (
                      <p className="text-sm text-muted-foreground">
                        {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Info className="h-4 w-4" />
                  </Button>
                  <ConversationActions 
                    conversationId={chatId} 
                    isPinned={selectedConversation.participant_settings?.pinned || false}
                  />
                </div>
              </div>

              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                {messagesLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : allMessages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                    <div>
                      <h4 className="font-medium mb-2">No messages yet</h4>
                      <p className="text-sm">Start the conversation by sending a message.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {allMessages.map((message, index) => (
                      <EnhancedMessageItem
                        key={message.id || (message as any).client_id}
                        message={message as any}
                        isOwn={message.sender_id === user?.id || (message as any).isCurrentUser}
                        onReact={handleReaction}
                        onEdit={handleEditMessage}
                        onDelete={handleDeleteMessage}
                        onReply={handleReply}
                        showSender={
                          index === 0 || 
                          allMessages[index - 1]?.sender_id !== message.sender_id
                        }
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 pb-9 border-t bg-card">
                <EnhancedMessageInput
                  value={draftText}
                  onChange={updateDraft}
                  onSend={(options = {}) => {
                    if (draftText.trim()) {
                      handleSendMessage(draftText);
                    }
                  }}
                  onTyping={sendTypingStatus}
                  replyingTo={replyingTo}
                  onCancelReply={() => setReplyingTo(null)}
                />
              </div>
            </>
          ) : (
            // No conversation selected
            <div className="flex-1 flex items-center justify-center text-center text-muted-foreground">
              <div>
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Send className="h-8 w-8" />
                </div>
                <h4 className="font-medium mb-2">Select a conversation</h4>
                <p className="text-sm">Choose a conversation from the list to start messaging.</p>
              </div>
            </div>
          )}
        </div>

        <NewMessageModal
          open={showNewMessageModal}
          onOpenChange={setShowNewMessageModal}
        />
      </div>
    </AppLayout>
  );
};

export default MessagesLayout;
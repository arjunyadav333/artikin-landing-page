import { useState, useEffect, useCallback, useRef } from "react";
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
  Phone, 
  Video, 
  MoreHorizontal, 
  Paperclip,
  Smile,
  Image,
  Plus,
  Filter,
  Check,
  CheckCheck,
  ArrowLeft
} from "lucide-react";
import { 
  useConversations,
  useMessages,
  useSendMessage,
  useRealtimeMessages,
  useTypingIndicator,
  useMarkMessagesAsRead,
  type Message,
  type Conversation
} from "@/hooks/useMessaging";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const Messages = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { user } = useAuth();
  const { toast } = useToast();
  const { data: conversations = [], isLoading: conversationsLoading, error: conversationsError } = useConversations();
  const { data: messages = [], isLoading: messagesLoading } = useMessages(selectedConversationId);
  const sendMessageMutation = useSendMessage();
  const markAsReadMutation = useMarkMessagesAsRead();
  
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

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversationId || !user) return;

    try {
      await sendMessageMutation.mutateAsync({
        conversationId: selectedConversationId,
        kind: 'text',
        body: newMessage.trim()
      });
      setNewMessage("");
      
      // Stop typing indicator
      sendTypingStatus(false);
    } catch (error) {
      console.error('Failed to send message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
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
    setNewMessage(value);
    
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
  }, [sendTypingStatus, typingTimeout]);

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getMessageStatus = (message: Message) => {
    if (message.sender_id !== user?.id) return null;
    
    // Check receipts for status
    const receipts = message.receipts || [];
    const hasDelivered = receipts.some(r => r.status === 'delivered' || r.status === 'read');
    const hasRead = receipts.some(r => r.status === 'read');
    
    if (hasRead) {
      return <CheckCheck className="h-3 w-3 text-blue-500" />;
    } else if (hasDelivered) {
      return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
    } else {
      return <Check className="h-3 w-3 text-muted-foreground" />;
    }
  };

  if (conversationsError) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-8">
        <div className="container max-w-6xl mx-auto px-4 py-6">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-destructive">Failed to load conversations</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="container max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Conversations</h3>
                <Button variant="ghost" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex gap-4 items-center">
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
            </CardHeader>

            <ScrollArea className="h-[500px]">
              <CardContent className="p-0">
                {conversationsLoading ? (
                  <div className="p-4 text-center text-muted-foreground">
                    Loading conversations...
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    {searchTerm ? 'No conversations found' : 'No conversations yet'}
                  </div>
                ) : (
                  filteredConversations.map((conversation, index) => (
                    <div key={conversation.id}>
                      <div
                        className={cn(
                          "flex items-center space-x-3 p-4 cursor-pointer hover:bg-muted transition-colors",
                          selectedConversationId === conversation.id && "bg-muted"
                        )}
                        onClick={() => setSelectedConversationId(conversation.id)}
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
                            <p className="font-semibold text-sm truncate">
                              {conversation.other_participant?.display_name || 'Unknown User'}
                            </p>
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
              </CardContent>
            </ScrollArea>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <CardHeader className="pb-4">
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

                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Video className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <Separator />

                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  {messagesLoading ? (
                    <div className="text-center text-muted-foreground">
                      Loading messages...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center text-muted-foreground">
                      No messages yet. Start the conversation!
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => {
                        const isMe = message.sender_id === user?.id;
                        return (
                          <div
                            key={message.id}
                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                          >
                            <div className={`flex space-x-2 max-w-[70%] ${isMe ? 'flex-row-reverse space-x-reverse' : ''}`}>
                              {!isMe && (
                                <Avatar className="h-8 w-8">
                                  <AvatarImage 
                                    src={message.sender?.avatar_url} 
                                    alt={message.sender?.display_name} 
                                  />
                                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                    {getInitials(message.sender?.display_name)}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <div className={cn(
                                "rounded-lg px-3 py-2",
                                isMe 
                                  ? "bg-primary text-primary-foreground" 
                                  : "bg-muted"
                              )}>
                                {message.reply_to && (
                                  <div className={cn(
                                    "text-xs opacity-70 mb-1 p-1 rounded border-l-2",
                                    isMe ? "border-primary-foreground/30" : "border-primary/30"
                                  )}>
                                    Replying to previous message
                                  </div>
                                )}
                                <p className="text-sm whitespace-pre-wrap break-words">
                                  {message.body}
                                </p>
                                <div className={cn(
                                  "flex items-center justify-between gap-2 mt-1",
                                  isMe ? "flex-row-reverse" : ""
                                )}>
                                  <span className={cn(
                                    "text-xs",
                                    isMe 
                                      ? "text-primary-foreground/70" 
                                      : "text-muted-foreground"
                                  )}>
                                    {formatMessageTime(message.created_at)}
                                  </span>
                                  {getMessageStatus(message)}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>

                <Separator />

                {/* Message Input */}
                <CardContent className="p-4">
                  <div className="flex items-end space-x-2">
                    <div className="flex space-x-1">
                      <Button variant="ghost" size="sm">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Image className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex-1 relative">
                      <Input
                        placeholder="Type a message..."
                        value={newMessage}
                        onChange={(e) => handleTyping(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="pr-12 resize-none"
                        disabled={sendMessageMutation.isPending}
                      />
                      <Button variant="ghost" size="sm" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <Smile className="h-4 w-4" />
                      </Button>
                    </div>

                    <Button 
                      size="sm" 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sendMessageMutation.isPending}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Select a conversation</h3>
                  <p className="text-muted-foreground">Choose a conversation from the sidebar to start messaging</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Messages;
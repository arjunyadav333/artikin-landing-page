import { useState, useEffect } from "react";
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
  Filter
} from "lucide-react";
import { useConversations } from "@/hooks/useConversations";
import { useMessages, useSendMessage, useMarkMessagesAsRead, useRealtimeMessages } from "@/hooks/useMessages";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";

const Messages = () => {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { user } = useAuth();
  const { data: conversations = [], isLoading: conversationsLoading } = useConversations();
  const { data: messages = [], isLoading: messagesLoading } = useMessages(selectedConversationId);
  const sendMessage = useSendMessage();
  const markAsRead = useMarkMessagesAsRead();
  
  // Enable real-time updates for the selected conversation
  useRealtimeMessages(selectedConversationId);

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conversation =>
    !searchTerm || 
    conversation.other_participant?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.other_participant?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.last_message?.content?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedConversationId) {
      markAsRead.mutate(selectedConversationId);
    }
  }, [selectedConversationId, markAsRead]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversationId) return;

    try {
      await sendMessage.mutateAsync({
        conversationId: selectedConversationId,
        content: newMessage.trim()
      });
      setNewMessage("");
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const mockConversations = [
    {
      id: 1,
      name: "Sarah Chen",
      username: "@sarahartist",
      avatar: "",
      lastMessage: "Thanks for the feedback on my latest piece!",
      lastTime: "2m",
      unread: 2,
      online: true
    },
    {
      id: 2,
      name: "Marcus Rodriguez", 
      username: "@marcusmusic",
      avatar: "",
      lastMessage: "Would love to collaborate on that project",
      lastTime: "1h",
      unread: 0,
      online: true
    },
    {
      id: 3,
      name: "Elena Kowalski",
      username: "@elenadesign", 
      avatar: "",
      lastMessage: "The brand guidelines look amazing!",
      lastTime: "3h",
      unread: 1,
      online: false
    },
    {
      id: 4,
      name: "David Park",
      username: "@davidphoto",
      avatar: "",
      lastMessage: "Hey, saw your recent work. Really impressed!",
      lastTime: "1d",
      unread: 0,
      online: false
    }
  ];

  const mockMessages = [
    {
      id: 1,
      senderId: 1,
      senderName: "Sarah Chen",
      content: "Hey! I saw your latest UI design work and I'm really impressed. The color palette is so cohesive!",
      time: "10:30 AM",
      isMe: false
    },
    {
      id: 2,
      senderId: "me",
      senderName: "You",
      content: "Thank you so much! I spent a lot of time getting the colors just right. Really appreciate the feedback 😊",
      time: "10:32 AM",
      isMe: true
    },
    {
      id: 3,
      senderId: 1,
      senderName: "Sarah Chen", 
      content: "I'd love to learn more about your design process. Do you have any resources you'd recommend?",
      time: "10:35 AM",
      isMe: false
    },
    {
      id: 4,
      senderId: "me",
      senderName: "You",
      content: "Absolutely! I have a few books and articles that really helped me. Let me send you a list.",
      time: "10:37 AM",
      isMe: true
    },
    {
      id: 5,
      senderId: 1,
      senderName: "Sarah Chen",
      content: "Thanks for the feedback on my latest piece!",
      time: "10:45 AM",
      isMe: false
    }
  ];

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
                <Button variant="outline" size="icon" className="sm:w-auto">
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
                        className={`flex items-center space-x-3 p-4 cursor-pointer hover:bg-muted transition-colors ${
                          selectedConversationId === conversation.id ? 'bg-muted' : ''
                        }`}
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
                            {conversation.last_message?.content || 'No messages yet'}
                          </p>
                        </div>

                        {conversation.unread_count > 0 && (
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
                          @{selectedConversation.other_participant?.username || 'unknown'}
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
                              <div className={`rounded-lg px-3 py-2 ${
                                isMe 
                                  ? 'bg-primary text-primary-foreground' 
                                  : 'bg-muted'
                              }`}>
                                <p className="text-sm">{message.content}</p>
                                <p className={`text-xs mt-1 ${
                                  isMe 
                                    ? 'text-primary-foreground/70' 
                                    : 'text-muted-foreground'
                                }`}>
                                  {formatMessageTime(message.created_at)}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
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
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="pr-12"
                      />
                      <Button variant="ghost" size="sm" className="absolute right-2 top-1/2 transform -translate-y-1/2">
                        <Smile className="h-4 w-4" />
                      </Button>
                    </div>

                    <Button 
                      size="sm" 
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sendMessage.isPending}
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
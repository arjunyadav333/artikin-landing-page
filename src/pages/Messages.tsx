import { useState } from "react";
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
  Plus
} from "lucide-react";

const Messages = () => {
  const [selectedChat, setSelectedChat] = useState(1);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

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

  const selectedConversation = mockConversations.find(c => c.id === selectedChat);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // Handle sending message
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="container max-w-6xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Messages</h1>
          <p className="text-muted-foreground">Connect with artists and collaborators</p>
        </div>

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
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>

            <ScrollArea className="h-[500px]">
              <CardContent className="p-0">
                {mockConversations.map((conversation, index) => (
                  <div key={conversation.id}>
                    <div
                      className={`flex items-center space-x-3 p-4 cursor-pointer hover:bg-muted transition-colors ${
                        selectedChat === conversation.id ? 'bg-muted' : ''
                      }`}
                      onClick={() => setSelectedChat(conversation.id)}
                    >
                      <div className="relative">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={conversation.avatar} alt={conversation.name} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {conversation.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        {conversation.online && (
                          <div className="absolute -bottom-1 -right-1 h-4 w-4 bg-green-500 border-2 border-background rounded-full" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-semibold text-sm truncate">{conversation.name}</p>
                          <span className="text-xs text-muted-foreground">{conversation.lastTime}</span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                      </div>

                      {conversation.unread > 0 && (
                        <Badge className="bg-primary text-primary-foreground h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                          {conversation.unread}
                        </Badge>
                      )}
                    </div>
                    {index < mockConversations.length - 1 && <Separator />}
                  </div>
                ))}
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
                      <div className="relative">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={selectedConversation.avatar} alt={selectedConversation.name} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {selectedConversation.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        {selectedConversation.online && (
                          <div className="absolute -bottom-1 -right-1 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{selectedConversation.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {selectedConversation.online ? 'Online' : 'Last seen 2h ago'}
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
                  <div className="space-y-4">
                    {mockMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex space-x-2 max-w-[70%] ${message.isMe ? 'flex-row-reverse space-x-reverse' : ''}`}>
                          {!message.isMe && (
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={selectedConversation.avatar} alt={selectedConversation.name} />
                              <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                {selectedConversation.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                          )}
                          <div className={`rounded-lg px-3 py-2 ${
                            message.isMe 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted'
                          }`}>
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${
                              message.isMe 
                                ? 'text-primary-foreground/70' 
                                : 'text-muted-foreground'
                            }`}>
                              {message.time}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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
                      disabled={!newMessage.trim()}
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
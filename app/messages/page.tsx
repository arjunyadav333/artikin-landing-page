'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Search, Send, MoreVertical, Phone, Video, Info } from 'lucide-react'

export default function MessagesPage() {
  const [selectedChat, setSelectedChat] = useState(1)
  const [newMessage, setNewMessage] = useState('')

  const mockConversations = [
    {
      id: 1,
      name: "Sarah Johnson",
      username: "@sarahjohnson",
      avatar: "/placeholder.svg",
      lastMessage: "Hey! I saw your latest design work, it's amazing!",
      timestamp: "2 min ago",
      unread: 2,
      online: true
    },
    {
      id: 2,
      name: "Mike Chen",
      username: "@mikechen",
      avatar: "/placeholder.svg",
      lastMessage: "Thanks for the feedback on the project",
      timestamp: "1h ago",
      unread: 0,
      online: false
    },
    {
      id: 3,
      name: "Creative Team",
      username: "Group",
      avatar: "/placeholder.svg",
      lastMessage: "Lisa: The new mockups look great!",
      timestamp: "3h ago",
      unread: 5,
      online: true,
      isGroup: true
    }
  ]

  const mockMessages = [
    {
      id: 1,
      senderId: 2,
      content: "Hey! I saw your latest design work, it's amazing!",
      timestamp: "10:30 AM",
      isCurrentUser: false
    },
    {
      id: 2,
      senderId: 1,
      content: "Thank you so much! I really appreciate the feedback 😊",
      timestamp: "10:32 AM",
      isCurrentUser: true
    },
    {
      id: 3,
      senderId: 2,
      content: "I'd love to collaborate on something similar. Do you have time for a quick call this week?",
      timestamp: "10:35 AM",
      isCurrentUser: false
    },
    {
      id: 4,
      senderId: 1,
      content: "Absolutely! I'm free Thursday afternoon or Friday morning. What works best for you?",
      timestamp: "10:37 AM",
      isCurrentUser: true
    }
  ]

  const currentChat = mockConversations.find(c => c.id === selectedChat)

  const handleSendMessage = () => {
    if (!newMessage.trim()) return
    // Handle sending message
    setNewMessage('')
  }

  return (
    <div className="h-screen bg-background flex">
      {/* Sidebar - Conversations List */}
      <div className="w-80 border-r border-border bg-background">
        <div className="p-4 border-b border-border">
          <h1 className="text-2xl font-bold text-foreground mb-4">Messages</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              className="pl-10 bg-muted/50 border-muted focus:border-primary"
            />
          </div>
        </div>

        <div className="overflow-y-auto">
          {mockConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => setSelectedChat(conversation.id)}
              className={`p-4 border-b border-border cursor-pointer hover:bg-muted/50 transition-colors ${
                selectedChat === conversation.id ? 'bg-muted' : ''
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={conversation.avatar} alt={conversation.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {conversation.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {conversation.online && (
                    <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 bg-green-500 border-2 border-background rounded-full" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground truncate">
                        {conversation.name}
                      </h3>
                      {conversation.isGroup && (
                        <Badge variant="secondary" className="text-xs">Group</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {conversation.timestamp}
                      </span>
                      {conversation.unread > 0 && (
                        <Badge className="h-5 w-5 p-0 flex items-center justify-center text-xs bg-primary">
                          {conversation.unread}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground truncate mt-1">
                    {conversation.lastMessage}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-background">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={currentChat.avatar} alt={currentChat.name} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {currentChat.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {currentChat.online && (
                      <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-green-500 border-2 border-background rounded-full" />
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold text-foreground">{currentChat.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {currentChat.online ? 'Active now' : 'Last seen 1h ago'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Info className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {mockMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[70%] ${message.isCurrentUser ? 'flex-row-reverse' : ''}`}>
                    {!message.isCurrentUser && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={currentChat.avatar} alt={currentChat.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {currentChat.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        message.isCurrentUser
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-foreground'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
                      }`}>
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-border bg-background">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="pr-12 bg-muted/50 border-muted focus:border-primary"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
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
              <h2 className="text-xl font-semibold text-foreground mb-2">Select a conversation</h2>
              <p className="text-muted-foreground">Choose a conversation from the sidebar to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Send } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { 
  useOptimizedMessages,
  useOptimizedSendMessage,
  useDebouncedMarkSeen,
  OptimizedMessage
} from "@/hooks/useOptimizedMessaging";
import { useState, useEffect, useRef, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const OptimizedConversationPage = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messageText, setMessageText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { data: messages = [], isLoading } = useOptimizedMessages(chatId);
  const sendMessage = useOptimizedSendMessage();
  const markSeen = useDebouncedMarkSeen();

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  // Mark messages as seen when they come into view
  useEffect(() => {
    if (messages.length > 0 && user) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.sender_id !== user.id && !lastMessage.seen_at) {
        markSeen.mutate(lastMessage.id);
      }
    }
  }, [messages, user, markSeen]);

  // Memoize message rendering for performance
  const renderedMessages = useMemo(() => {
    return messages.map((message: OptimizedMessage) => (
      <MessageItem 
        key={message.id} 
        message={message} 
        isOwn={message.sender_id === user?.id}
      />
    ));
  }, [messages, user?.id]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !chatId) return;

    try {
      await sendMessage.mutateAsync({
        conversationId: chatId,
        body: messageText.trim(),
      });
      setMessageText("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  if (!chatId) {
    return <div>No conversation selected</div>;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b bg-background/95 backdrop-blur sticky top-0 z-40">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate('/messages')}
          className="md:hidden"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" alt="User" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">Conversation</p>
            <p className="text-sm text-muted-foreground">Online</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {renderedMessages}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} className="flex gap-2 p-4 border-t bg-background">
        <Input
          value={messageText}
          onChange={(e) => setMessageText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1"
          disabled={sendMessage.isPending}
        />
        <Button 
          type="submit" 
          size="sm" 
          disabled={!messageText.trim() || sendMessage.isPending}
        >
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

// Optimized message item component
const MessageItem = ({ message, isOwn }: { 
  message: OptimizedMessage; 
  isOwn: boolean;
}) => {
  return (
    <div className={cn(
      "flex gap-3 max-w-[80%]",
      isOwn ? "ml-auto flex-row-reverse" : ""
    )}>
      {!isOwn && (
        <Avatar className="h-6 w-6 mt-1">
          <AvatarImage src={message.sender_avatar_url || ""} alt={message.sender_display_name} />
          <AvatarFallback className="text-xs">
            {message.sender_display_name?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
      )}
      <div className={cn(
        "rounded-lg px-3 py-2 text-sm",
        isOwn 
          ? "bg-primary text-primary-foreground" 
          : "bg-muted"
      )}>
        <p>{message.body}</p>
        <p className={cn(
          "text-xs mt-1 opacity-60",
          isOwn ? "text-right" : "text-left"
        )}>
          {new Date(message.created_at).toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
          {message.pending && " • Sending..."}
        </p>
      </div>
    </div>
  );
};

export default OptimizedConversationPage;
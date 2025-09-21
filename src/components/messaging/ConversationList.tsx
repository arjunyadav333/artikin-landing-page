import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { MessageSquare, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import type { OptimizedConversation } from "@/hooks/useOptimizedMessaging";

interface ConversationListProps {
  conversations: OptimizedConversation[];
  isLoading: boolean;
  currentChatId?: string;
}

const ConversationList = ({ conversations, isLoading, currentChatId }: ConversationListProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const filteredConversations = conversations.filter(conv =>
    conv.other_participant.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.other_participant.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold mb-3">Messages</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Conversations */}
      <ScrollArea className="flex-1">
        {filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <MessageSquare className="h-8 w-8 mb-2" />
            <p>No conversations found</p>
          </div>
        ) : (
          <div className="space-y-1 p-2">
            {filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isActive={conversation.id === currentChatId}
                onClick={() => navigate(`/messages/${conversation.id}`)}
              />
            ))}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

interface ConversationItemProps {
  conversation: OptimizedConversation;
  isActive: boolean;
  onClick: () => void;
}

const ConversationItem = ({ conversation, isActive, onClick }: ConversationItemProps) => {
  const { other_participant, last_message, unread_count } = conversation;

  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start h-auto p-3 text-left",
        isActive && "bg-accent"
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 w-full">
        <Avatar className="h-10 w-10">
          <AvatarImage src={other_participant.avatar_url || ""} alt={other_participant.display_name} />
          <AvatarFallback>
            {other_participant.display_name?.charAt(0) || "U"}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="font-medium truncate">
              {other_participant.display_name}
            </p>
            {last_message && (
              <span className="text-xs text-muted-foreground">
                {new Date(last_message.created_at).toLocaleDateString()}
              </span>
            )}
            {unread_count > 0 && (
              <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                {unread_count}
              </span>
            )}
          </div>
          
          <p className="text-sm text-muted-foreground truncate">
            @{other_participant.username}
          </p>
          
          {last_message && (
            <p className="text-sm text-muted-foreground truncate mt-1">
              {last_message.body || "Media"}
            </p>
          )}
        </div>
      </div>
    </Button>
  );
};

export default ConversationList;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useConversations } from "@/hooks/useMessaging";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ConversationListSkeleton } from "@/components/ui/conversation-skeleton";
import { Search, MessageSquare, Users } from "lucide-react";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";

const Messages = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: conversations = [], isLoading, error } = useConversations();

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conv =>
    conv.other_participant?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.other_participant?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return formatDistanceToNow(date, { addSuffix: true });
    }
  };

  const handleConversationClick = (conversationId: string) => {
    navigate(`/messages/${conversationId}`);
  };

  if (!user) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-foreground">Messages</h1>
          <MessageSquare className="h-6 w-6 text-muted-foreground" />
        </div>
        
        {/* Search */}
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

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <ConversationListSkeleton count={8} />
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-6">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">Unable to load conversations</h3>
            <p className="text-muted-foreground text-sm">There was an error loading your messages. Please try again.</p>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center px-6">
            {searchQuery ? (
              <>
                <Search className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No conversations found</h3>
                <p className="text-muted-foreground text-sm">Try adjusting your search terms</p>
              </>
            ) : (
              <>
                <Users className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No conversations yet</h3>
                <p className="text-muted-foreground text-sm">Start a conversation by visiting someone's profile</p>
              </>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleConversationClick(conversation.id)}
                className="flex items-center space-x-3 p-4 hover:bg-accent cursor-pointer transition-colors"
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <Avatar className="h-12 w-12">
                    <AvatarImage 
                      src={conversation.other_participant?.avatar_url} 
                      alt={conversation.other_participant?.display_name || 'User'}
                    />
                    <AvatarFallback className="bg-primary/10 text-primary font-medium">
                      {conversation.other_participant?.display_name?.[0]?.toUpperCase() || 
                       conversation.other_participant?.username?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Conversation Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-foreground truncate">
                      {conversation.other_participant?.display_name || conversation.other_participant?.username}
                    </h3>
                    <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                      {conversation.participant_settings?.pinned && (
                        <div className="w-1 h-1 bg-primary rounded-full"></div>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(conversation.updated_at)}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.other_participant?.bio ? (
                        <span className="italic">{conversation.other_participant.bio}</span>
                      ) : (
                        <span>No recent messages</span>
                      )}
                    </p>
                    
                    {conversation.unread_count > 0 && (
                      <Badge variant="secondary" className="ml-2 bg-primary text-primary-foreground">
                        {conversation.unread_count}
                      </Badge>
                    )}
                  </div>
                  
                  {conversation.other_participant?.role && (
                    <div className="mt-1">
                      <Badge variant="outline" className="text-xs capitalize">
                        {conversation.other_participant.role}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
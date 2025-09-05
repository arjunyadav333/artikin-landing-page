import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Send, Plus, Filter, MoreVertical, Pin, Trash2 } from "lucide-react";
import { AppLayout } from "@/components/layout/app-layout";
import { useConversations, type Conversation } from "@/hooks/useMessaging";
import { NewMessageModal } from "@/components/messaging/NewMessageModal";
import { useAuth } from "@/hooks/useAuth";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { ConversationListSkeleton } from "@/components/ui/conversation-skeleton";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const Messages = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewMessageModal, setShowNewMessageModal] = useState(false);
  
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

  // Mutation for pinning/unpinning conversations
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
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });

  // Mutation for deleting conversations
  const deleteMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      const { error } = await supabase
        .from('conversation_participants')
        .update({ 
          deleted: true, 
          deleted_at: new Date().toISOString() 
        })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  });

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conversation =>
    !searchTerm || 
    conversation.other_participant?.display_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.other_participant?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conversation.last_message?.content?.toLowerCase().includes(searchTerm.toLowerCase())
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
    if (message.deleted || message.deleted_for_all) return 'This message was deleted';
    if (message.content) return message.content;
    if (message.media_type) {
      if (message.media_type.startsWith('image/')) return '📷 Photo';
      if (message.media_type.startsWith('video/')) return '🎥 Video';
      if (message.media_type.includes('pdf')) return '📄 Document';
    }
    return 'Attachment';
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
          <div className="w-full max-w-4xl mx-auto border-r bg-card flex flex-col">
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
                        conversation.participant_settings?.pinned && "bg-primary/5 border-l-2 border-l-primary"
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
                              {conversation.last_message?.created_at && 
                                formatDistanceToNow(new Date(conversation.last_message.created_at), { addSuffix: true })
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
        </div>

        <NewMessageModal
          open={showNewMessageModal}
          onOpenChange={setShowNewMessageModal}
        />
      </div>
    </AppLayout>
  );
};

export default Messages;
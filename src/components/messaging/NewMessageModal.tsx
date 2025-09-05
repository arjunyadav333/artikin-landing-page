import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, User } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCreateOrGetConversation } from "@/hooks/useMessaging";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface NewMessageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface UserProfile {
  id: string;
  user_id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  bio?: string;
  role?: 'artist' | 'organization';
  artform?: string;
  organization_type?: string;
}

export const NewMessageModal = ({ open, onOpenChange }: NewMessageModalProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  const createConversationMutation = useCreateOrGetConversation();

  // Fetch all users except current user
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['users-for-messaging', searchTerm],
    queryFn: async () => {
      if (!user) return [];

      let query = supabase
        .from('profiles')
        .select(`
          id,
          user_id,
          username,
          display_name,
          avatar_url,
          bio,
          role,
          artform,
          organization_type
        `)
        .neq('user_id', user.id);

      if (searchTerm.trim()) {
        query = query.or(`display_name.ilike.%${searchTerm}%,username.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query
        .order('display_name', { ascending: true })
        .limit(50);

      if (error) throw error;
      return data as UserProfile[];
    },
    enabled: !!user && open
  });

  const handleUserSelect = async (selectedUser: UserProfile) => {
    try {
      const conversationId = await createConversationMutation.mutateAsync(selectedUser.user_id);
      onOpenChange(false);
      navigate(`/messages/${conversationId}`);
      setSearchTerm("");
    } catch (error) {
      console.error('Error creating conversation:', error);
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRoleDisplay = (user: UserProfile) => {
    if (user.role === 'artist') return user.artform || 'Artist';
    if (user.role === 'organization') return user.organization_type || 'Organization';
    return 'User';
  };

  // Reset search when modal closes
  useEffect(() => {
    if (!open) {
      setSearchTerm("");
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New Message</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <ScrollArea className="h-80">
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-3 p-3 animate-pulse">
                    <div className="h-10 w-10 bg-muted rounded-full" />
                    <div className="flex-1 space-y-1">
                      <div className="h-4 bg-muted rounded w-1/2" />
                      <div className="h-3 bg-muted rounded w-1/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {searchTerm.trim() 
                    ? 'No users match your search'
                    : 'No users found'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {users.map((selectedUser) => (
                  <div
                    key={selectedUser.id}
                    className={cn(
                      "flex items-center space-x-3 p-3 rounded-lg cursor-pointer",
                      "hover:bg-muted transition-colors",
                      createConversationMutation.isPending && "opacity-50 pointer-events-none"
                    )}
                    onClick={() => handleUserSelect(selectedUser)}
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage 
                        src={selectedUser.avatar_url} 
                        alt={selectedUser.display_name} 
                      />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(selectedUser.display_name)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-sm truncate">
                          {selectedUser.display_name}
                        </p>
                        <Badge 
                          variant="secondary" 
                          className="text-xs bg-muted"
                        >
                          {getRoleDisplay(selectedUser)}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        @{selectedUser.username}
                        {selectedUser.bio && ` • ${selectedUser.bio}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {createConversationMutation.isPending && (
            <div className="text-center py-2">
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                Starting conversation...
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
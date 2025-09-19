import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserPlus, UserCheck, MoreHorizontal, MessageCircle, Eye, UserX, Flag, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFollowUser, useConnectionStatus } from "@/hooks/useConnections";
import { useToast } from "@/hooks/use-toast";
import { useDirectMessage } from "@/hooks/useDirectMessage";
import { useUserId } from "@/hooks/useOptimizedAuth";

interface UserCardProps {
  user: {
    id: string;
    user_id: string;
    username: string;
    display_name: string;
    avatar_url?: string;
    bio?: string;
    location?: string;
    role?: 'artist' | 'organization';
    artform?: string;
    organization_type?: string;
  };
  showFollowButton?: boolean;
  isFollower?: boolean;
  isFollowing?: boolean;
  onRemoveFollower?: (userId: string) => void;
}

export function UserCard({ 
  user, 
  showFollowButton = true, 
  isFollower = false,
  isFollowing = false,
  onRemoveFollower 
}: UserCardProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const followUser = useFollowUser();
  const { data: connectionStatus } = useConnectionStatus(user.user_id);
  const { startDirectMessage, isLoading: isMessageLoading } = useDirectMessage();
  const currentUserId = useUserId();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleViewProfile = () => {
    navigate(`/profile/${user.user_id}`);
  };

  const handleMessage = () => {
    startDirectMessage(user.user_id);
  };

  const handleFollow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    followUser.mutate({
      targetUserId: user.user_id,
      isCurrentlyFollowing: connectionStatus?.isFollowing || false
    });
  };

  const handleRemoveFollower = () => {
    if (onRemoveFollower) {
      onRemoveFollower(user.user_id);
    }
  };

  const handleBlock = () => {
    toast({
      title: "User blocked",
      description: `You have blocked ${user.display_name}`,
    });
  };

  const handleReport = () => {
    toast({
      title: "User reported",
      description: "Thank you for your report. We'll review it shortly.",
    });
  };

  const getUserType = () => {
    if (user.role === 'artist' && user.artform) {
      return user.artform.charAt(0).toUpperCase() + user.artform.slice(1);
    }
    if (user.role === 'organization') {
      return 'Organization';
    }
    return 'User';
  };

  const getFollowButtonState = () => {
    if (connectionStatus?.isFollowing) {
      return { text: 'Following', variant: 'secondary' as const, icon: UserCheck };
    }
    if (connectionStatus?.isFollowedBy && !connectionStatus?.isFollowing) {
      return { text: 'Follow Back', variant: 'default' as const, icon: UserPlus };
    }
    return { text: 'Follow', variant: 'default' as const, icon: UserPlus };
  };

  const followButtonState = getFollowButtonState();

  return (
    <div className="bg-card border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Profile Picture */}
        <Avatar className="h-12 w-12 cursor-pointer" onClick={handleViewProfile}>
          <AvatarImage src={user.avatar_url} alt={user.display_name} />
          <AvatarFallback className="bg-primary text-primary-foreground">
            {user.display_name.split(' ').map(n => n[0]).join('').toUpperCase()}
          </AvatarFallback>
        </Avatar>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <button
              onClick={handleViewProfile}
              className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer truncate"
            >
              {user.display_name}
            </button>
          </div>
          
          <p className="text-sm text-muted-foreground mb-1">
            {getUserType()}
          </p>
          
          {user.bio && (
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
              {user.bio}
            </p>
          )}
          
          {user.location && (
            <p className="text-xs text-muted-foreground">
              {user.location}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Message Button - visible for non-self users */}
          {currentUserId !== user.user_id && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={handleMessage}
              disabled={isMessageLoading(user.user_id)}
              className="border-primary text-primary hover:bg-primary/10"
            >
              {isMessageLoading(user.user_id) ? (
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
              ) : (
                <MessageCircle className="h-4 w-4 mr-1" />
              )}
              Message
            </Button>
          )}

          {showFollowButton && currentUserId !== user.user_id && (
            <Button 
              size="sm" 
              variant={followButtonState.variant}
              onClick={handleFollow}
              disabled={followUser.isPending}
              className={followButtonState.variant === 'default' ? 'bg-connection hover:bg-connection/90 text-white border-0' : ''}
            >
              <followButtonState.icon className="h-4 w-4 mr-1" />
              {followButtonState.text}
            </Button>
          )}

          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleViewProfile}>
                <Eye className="h-4 w-4 mr-2" />
                View Profile
              </DropdownMenuItem>
              {currentUserId !== user.user_id && (
                <DropdownMenuItem onClick={handleMessage} disabled={isMessageLoading(user.user_id)}>
                  {isMessageLoading(user.user_id) ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <MessageCircle className="h-4 w-4 mr-2" />
                  )}
                  Message
                </DropdownMenuItem>
              )}
              {isFollower && onRemoveFollower && (
                <DropdownMenuItem onClick={handleRemoveFollower} className="text-destructive">
                  <UserX className="h-4 w-4 mr-2" />
                  Remove Follower
                </DropdownMenuItem>
              )}
              {currentUserId !== user.user_id && (
                <>
                  <DropdownMenuItem onClick={handleBlock} className="text-destructive">
                    <UserX className="h-4 w-4 mr-2" />
                    Block User
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleReport} className="text-destructive">
                    <Flag className="h-4 w-4 mr-2" />
                    Report
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserPlus, UserCheck, MoreVertical, MessageCircle, Eye, UserX, Flag, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFollowUser, useConnectionStatus } from "@/hooks/useConnections";
import { useToast } from "@/hooks/use-toast";
import { useDirectMessage } from "@/hooks/useDirectMessage";
import { useUserId } from "@/hooks/useOptimizedAuth";

interface ConnectionRowProps {
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
  relation?: "follow" | "follow_back" | "mutual" | "none";
  onRemoveFollower?: (userId: string) => void;
}

export function ConnectionRow({ user, relation = "none", onRemoveFollower }: ConnectionRowProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const followUser = useFollowUser();
  const { data: connectionStatus } = useConnectionStatus(user.user_id);
  const { startDirectMessage, isLoading: isMessageLoading } = useDirectMessage();
  const currentUserId = useUserId();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleProfileClick = () => {
    navigate(`/profile/${user.username}`);
  };

  const handleMessage = () => {
    startDirectMessage(user.user_id);
  };

  const handleFollow = () => {
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

  const getFollowButtonState = () => {
    if (connectionStatus?.isFollowing) {
      return { 
        text: 'Following', 
        variant: 'secondary' as const, 
        icon: UserCheck,
        loading: followUser.isPending
      };
    }
    if (relation === "follow_back" || (connectionStatus?.isFollowedBy && !connectionStatus?.isFollowing)) {
      return { 
        text: 'Follow back', 
        variant: 'default' as const, 
        icon: UserPlus,
        loading: followUser.isPending
      };
    }
    return { 
      text: 'Follow', 
      variant: 'default' as const, 
      icon: UserPlus,
      loading: followUser.isPending
    };
  };

  const followButtonState = getFollowButtonState();
  const isOwnProfile = currentUserId === user.user_id;

  return (
    <div className="w-full bg-card border-0 border-b border-border last:border-b-0">
      {/* Full-width horizontal row */}
      <div className="flex items-center gap-3 px-4 py-3 md:px-6 md:py-4 hover:bg-muted/50 transition-colors group">
        {/* Left: Avatar - 48px circle */}
        <div 
          className="flex-shrink-0 cursor-pointer" 
          onClick={handleProfileClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleProfileClick()}
          aria-label={`View ${user.display_name}'s profile`}
        >
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatar_url} alt={user.display_name} />
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {user.display_name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Middle: Name and username info */}
        <div 
          className="flex-1 min-w-0 cursor-pointer" 
          onClick={handleProfileClick}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && handleProfileClick()}
        >
          {/* Full name - bold, 16-18px */}
          <div className="text-base font-semibold text-foreground truncate leading-tight">
            {user.display_name}
          </div>
          {/* Username - muted, 12-14px */}
          <div className="text-sm text-muted-foreground truncate">
            @{user.username}
          </div>
        </div>

        {/* Right: Two controls aligned right */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Primary action button - min 44x44 tappable area */}
          {!isOwnProfile && (
            <Button
              size="sm"
              variant={followButtonState.variant}
              onClick={handleFollow}
              disabled={followButtonState.loading}
              className={`min-w-[88px] min-h-[44px] ${
                followButtonState.variant === 'default' 
                  ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
                  : 'hover:bg-secondary/80'
              }`}
              aria-label={`${followButtonState.text} ${user.display_name}`}
              aria-pressed={connectionStatus?.isFollowing}
            >
              {followButtonState.loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <followButtonState.icon className="h-4 w-4 mr-1" />
              )}
              {followButtonState.text}
            </Button>
          )}

          {/* Three-dot overflow menu - min 44x44 tappable area */}
          <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-11 w-11 p-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label={`More options for ${user.display_name}`}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={handleProfileClick}>
                <Eye className="h-4 w-4 mr-2" />
                View Profile
              </DropdownMenuItem>
              
              {!isOwnProfile && (
                <DropdownMenuItem 
                  onClick={handleMessage} 
                  disabled={isMessageLoading(user.user_id)}
                >
                  {isMessageLoading(user.user_id) ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <MessageCircle className="h-4 w-4 mr-2" />
                  )}
                  Message
                </DropdownMenuItem>
              )}
              
              {onRemoveFollower && (
                <DropdownMenuItem 
                  onClick={handleRemoveFollower} 
                  className="text-destructive focus:text-destructive"
                >
                  <UserX className="h-4 w-4 mr-2" />
                  Remove Follower
                </DropdownMenuItem>
              )}
              
              {!isOwnProfile && (
                <>
                  <DropdownMenuItem 
                    onClick={handleBlock} 
                    className="text-destructive focus:text-destructive"
                  >
                    <UserX className="h-4 w-4 mr-2" />
                    Block
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleReport} 
                    className="text-destructive focus:text-destructive"
                  >
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
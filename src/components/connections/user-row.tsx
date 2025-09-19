import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MoreHorizontal, MessageCircle, UserX, Flag, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useFollowUser, useConnectionStatus } from "@/hooks/useConnections";
import { useDirectMessage } from "@/hooks/useDirectMessage";
import { useUserId } from "@/hooks/useOptimizedAuth";

interface UserRowProps {
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
  isFollower?: boolean;
  isFollowing?: boolean;
  showOptionsMenu?: boolean;
  onRemoveFollower?: (userId: string) => void;
}

export function UserRow({ 
  user, 
  isFollower = false,
  isFollowing = false,
  showOptionsMenu = false,
  onRemoveFollower 
}: UserRowProps) {
  const navigate = useNavigate();
  const followUser = useFollowUser();
  const { data: connectionStatus } = useConnectionStatus(user.user_id);
  const { startDirectMessage, isLoading: isMessageLoading } = useDirectMessage();
  const currentUserId = useUserId();
  
  const [showUnfollowDialog, setShowUnfollowDialog] = useState(false);

  const handleViewProfile = () => {
    navigate(`/profile/${user.user_id}`);
  };

  const handleMessage = () => {
    startDirectMessage(user.user_id);
  };

  const handleFollowClick = () => {
    const currentFollowingState = connectionStatus?.isFollowing ?? isFollowing ?? false;
    
    if (currentFollowingState) {
      // Show unfollow confirmation
      setShowUnfollowDialog(true);
    } else {
      // Follow directly
      followUser.mutate({
        targetUserId: user.user_id,
        isCurrentlyFollowing: false
      });
    }
  };

  const handleUnfollowConfirm = () => {
    followUser.mutate({
      targetUserId: user.user_id,
      isCurrentlyFollowing: true
    });
    setShowUnfollowDialog(false);
  };

  const handleRemoveFollower = () => {
    if (onRemoveFollower) {
      onRemoveFollower(user.user_id);
    }
  };

  const handleBlock = () => {
    console.log('Block user:', user.user_id);
  };

  const handleReport = () => {
    console.log('Report user:', user.user_id);
  };

  const getUserTypeDisplay = () => {
    if (user.role === 'artist' && user.artform) {
      return user.artform.charAt(0).toUpperCase() + user.artform.slice(1);
    }
    if (user.role === 'organization') {
      return 'Organization';
    }
    return 'User';
  };

  const getFollowButtonState = () => {
    const currentlyFollowing = connectionStatus?.isFollowing ?? isFollowing;
    const isRequestPending = false; // TODO: Implement pending request logic for private accounts
    
    if (isRequestPending) {
      return { 
        text: 'Requested', 
        variant: 'outline' as const, 
        className: 'border-border text-muted-foreground bg-muted' 
      };
    }
    
    if (currentlyFollowing) {
      return { 
        text: 'Following', 
        variant: 'outline' as const, 
        className: 'border-border text-foreground bg-background hover:bg-muted' 
      };
    }
    
    return { 
      text: 'Follow', 
      variant: 'default' as const, 
      className: 'bg-primary text-primary-foreground hover:bg-primary/90' 
    };
  };

  const followButtonState = getFollowButtonState();
  const isOwnProfile = currentUserId === user.user_id;

  return (
    <>
      <div className="flex items-center px-6 py-4 hover:bg-muted/50 transition-colors">
        {/* Avatar */}
        <div 
          className="cursor-pointer mr-4"
          onClick={handleViewProfile}
        >
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.avatar_url} alt={user.display_name} />
            <AvatarFallback className="bg-muted text-muted-foreground text-sm font-medium">
              {user.display_name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div 
            className="font-semibold text-foreground text-sm truncate cursor-pointer hover:text-primary transition-colors"
            onClick={handleViewProfile}
          >
            {user.display_name}
          </div>
          <div className="text-xs text-muted-foreground truncate">
            @{user.username} • {getUserTypeDisplay()}
          </div>
        </div>

        {/* Action Buttons */}
        {!isOwnProfile && (
          <div className="flex items-center gap-3 ml-4">
            {/* Follow Button */}
            <Button
              size="sm"
              variant={followButtonState.variant}
              onClick={handleFollowClick}
              disabled={followUser.isPending}
              className={`px-4 py-2 text-sm font-medium rounded-xl min-w-[85px] h-9 transition-all duration-200 ${followButtonState.className}`}
            >
              {followUser.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                followButtonState.text
              )}
            </Button>

            {/* Options Menu */}
            {showOptionsMenu && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-9 w-9 p-0 hover:bg-muted rounded-xl">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-popover border shadow-lg rounded-xl">
                  <DropdownMenuItem onClick={handleMessage} className="flex items-center">
                    {isMessageLoading(user.user_id) ? (
                      <Loader2 className="h-4 w-4 mr-3 animate-spin" />
                    ) : (
                      <MessageCircle className="h-4 w-4 mr-3" />
                    )}
                    Message
                  </DropdownMenuItem>
                  {isFollower && onRemoveFollower && (
                    <DropdownMenuItem 
                      onClick={handleRemoveFollower} 
                      className="text-destructive focus:text-destructive"
                    >
                      <UserX className="h-4 w-4 mr-3" />
                      Remove Follower
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={handleBlock} 
                    className="text-destructive focus:text-destructive"
                  >
                    <UserX className="h-4 w-4 mr-3" />
                    Block
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleReport} 
                    className="text-destructive focus:text-destructive"
                  >
                    <Flag className="h-4 w-4 mr-3" />
                    Report
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        )}
      </div>

      {/* Unfollow Confirmation Dialog */}
      <AlertDialog open={showUnfollowDialog} onOpenChange={setShowUnfollowDialog}>
        <AlertDialogContent className="max-w-sm rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">
              Unfollow {user.display_name}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-muted-foreground">
              Their posts will no longer appear in your feed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-3">
            <AlertDialogAction
              onClick={handleUnfollowConfirm}
              className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground rounded-xl"
              disabled={followUser.isPending}
            >
              {followUser.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Unfollow'
              )}
            </AlertDialogAction>
            <AlertDialogCancel className="w-full rounded-xl" disabled={followUser.isPending}>
              Cancel
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
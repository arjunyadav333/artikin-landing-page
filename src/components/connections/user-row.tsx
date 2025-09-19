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
        className: 'border-gray-300 text-gray-600 bg-gray-50' 
      };
    }
    
    if (currentlyFollowing) {
      return { 
        text: 'Following', 
        variant: 'outline' as const, 
        className: 'border-gray-300 text-gray-900 bg-white hover:bg-gray-50' 
      };
    }
    
    return { 
      text: 'Follow', 
      variant: 'default' as const, 
      className: 'bg-accent text-white hover:bg-accent/90' 
    };
  };

  const followButtonState = getFollowButtonState();
  const isOwnProfile = currentUserId === user.user_id;

  return (
    <>
      <div className="flex items-center h-16 px-4 border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
        {/* Avatar */}
        <div 
          className="cursor-pointer mr-3"
          onClick={handleViewProfile}
        >
          <Avatar className="h-12 w-12 md:h-12 md:w-12">
            <AvatarImage src={user.avatar_url} alt={user.display_name} />
            <AvatarFallback className="bg-gray-200 text-gray-600 text-sm font-medium">
              {user.display_name.split(' ').map(n => n[0]).join('').toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div 
            className="font-semibold text-gray-900 text-15px truncate cursor-pointer hover:text-accent transition-colors"
            onClick={handleViewProfile}
          >
            {user.display_name}
          </div>
          <div className="text-13px text-gray-600 truncate">
            @{user.username} • {getUserTypeDisplay()}
          </div>
        </div>

        {/* Action Buttons */}
        {!isOwnProfile && (
          <div className="flex items-center gap-2 ml-3">
            {/* Follow Button */}
            <Button
              size="sm"
              variant={followButtonState.variant}
              onClick={handleFollowClick}
              disabled={followUser.isPending}
              className={`px-4 py-1.5 text-14px font-medium rounded-full min-w-[80px] h-8 ${followButtonState.className}`}
            >
              {followUser.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                followButtonState.text
              )}
            </Button>

            {/* Options Menu */}
            {showOptionsMenu && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-gray-100">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-white border shadow-lg">
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
                      className="text-red-600 focus:text-red-600"
                    >
                      <UserX className="h-4 w-4 mr-3" />
                      Remove Follower
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem 
                    onClick={handleBlock} 
                    className="text-red-600 focus:text-red-600"
                  >
                    <UserX className="h-4 w-4 mr-3" />
                    Block
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={handleReport} 
                    className="text-red-600 focus:text-red-600"
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
        <AlertDialogContent className="max-w-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-center">
              Unfollow {user.display_name}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center text-gray-600">
              Their posts will no longer appear in your feed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2">
            <AlertDialogAction
              onClick={handleUnfollowConfirm}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
              disabled={followUser.isPending}
            >
              {followUser.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Unfollow'
              )}
            </AlertDialogAction>
            <AlertDialogCancel className="w-full" disabled={followUser.isPending}>
              Cancel
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
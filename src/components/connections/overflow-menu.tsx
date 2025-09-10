import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Eye, MessageCircle, UserX, Flag, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useDirectMessage } from "@/hooks/useDirectMessage";
import { useUserId } from "@/hooks/useOptimizedAuth";

interface OverflowMenuProps {
  user: {
    user_id: string;
    username: string;
    display_name: string;
  };
  showRemoveFollower?: boolean;
  onRemoveFollower?: (userId: string) => void;
}

export function OverflowMenu({ user, showRemoveFollower = false, onRemoveFollower }: OverflowMenuProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { startDirectMessage, isLoading: isMessageLoading } = useDirectMessage();
  const currentUserId = useUserId();
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleViewProfile = () => {
    navigate(`/profile/${user.username}`);
    setIsDropdownOpen(false);
  };

  const handleMessage = () => {
    startDirectMessage(user.user_id);
    setIsDropdownOpen(false);
  };

  const handleRemoveFollower = () => {
    if (onRemoveFollower) {
      onRemoveFollower(user.user_id);
    }
    setIsDropdownOpen(false);
  };

  const handleBlock = () => {
    toast({
      title: "User blocked",
      description: `You have blocked ${user.display_name}`,
    });
    setIsDropdownOpen(false);
  };

  const handleReport = () => {
    toast({
      title: "User reported",
      description: "Thank you for your report. We'll review it shortly.",
    });
    setIsDropdownOpen(false);
  };

  const isOwnProfile = currentUserId === user.user_id;

  return (
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
        <DropdownMenuItem onClick={handleViewProfile}>
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
        
        {showRemoveFollower && onRemoveFollower && (
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
  );
}
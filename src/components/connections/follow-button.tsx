import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPlus, UserCheck, Loader2 } from "lucide-react";
import { useFollowUser, useConnectionStatus } from "@/hooks/useConnections";
import { useToast } from "@/hooks/use-toast";
import { useUserId } from "@/hooks/useOptimizedAuth";

interface FollowButtonProps {
  targetUserId: string;
  targetUsername: string;
  size?: "sm" | "default" | "lg";
  variant?: "default" | "secondary" | "outline";
  className?: string;
}

export function FollowButton({ 
  targetUserId, 
  targetUsername,
  size = "sm",
  variant,
  className = ""
}: FollowButtonProps) {
  const { toast } = useToast();
  const followUser = useFollowUser();
  const { data: connectionStatus } = useConnectionStatus(targetUserId);
  const currentUserId = useUserId();
  
  const [showUnfollowConfirm, setShowUnfollowConfirm] = useState(false);

  const handleFollow = () => {
    const isCurrentlyFollowing = connectionStatus?.isFollowing || false;
    
    if (isCurrentlyFollowing && !showUnfollowConfirm) {
      setShowUnfollowConfirm(true);
      return;
    }
    
    followUser.mutate({
      targetUserId,
      isCurrentlyFollowing
    });
    
    setShowUnfollowConfirm(false);
  };

  const getButtonState = () => {
    if (connectionStatus?.isFollowing) {
      return { 
        text: showUnfollowConfirm ? 'Unfollow?' : 'Following', 
        displayVariant: showUnfollowConfirm ? 'destructive' as const : (variant || 'secondary' as const),
        icon: UserCheck,
        loading: followUser.isPending
      };
    }
    if (connectionStatus?.isFollowedBy && !connectionStatus?.isFollowing) {
      return { 
        text: 'Follow back', 
        displayVariant: variant || 'default' as const, 
        icon: UserPlus,
        loading: followUser.isPending
      };
    }
    return { 
      text: 'Follow', 
      displayVariant: variant || 'default' as const, 
      icon: UserPlus,
      loading: followUser.isPending
    };
  };

  // Don't render for own profile
  if (currentUserId === targetUserId) {
    return null;
  }

  const buttonState = getButtonState();

  return (
    <Button
      size={size}
      variant={buttonState.displayVariant}
      onClick={handleFollow}
      disabled={buttonState.loading}
      onBlur={() => setShowUnfollowConfirm(false)}
      className={`min-h-[44px] transition-all duration-200 ${
        buttonState.displayVariant === 'default' 
          ? 'bg-primary hover:bg-primary/90 text-primary-foreground' 
          : buttonState.displayVariant === 'destructive'
          ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
          : 'hover:bg-secondary/80'
      } ${className}`}
      aria-label={`${buttonState.text} ${targetUsername}`}
      aria-pressed={connectionStatus?.isFollowing}
    >
      {buttonState.loading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-1" />
      ) : (
        <buttonState.icon className="h-4 w-4 mr-1" />
      )}
      {buttonState.text}
    </Button>
  );
}
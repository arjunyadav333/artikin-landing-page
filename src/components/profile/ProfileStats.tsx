import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Edit, 
  Share, 
  MoreHorizontal,
  UserPlus,
  MessageSquare,
  Mail,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useConnections } from '@/hooks/useConnections';
import { Profile } from '@/hooks/useProfiles';
import { useDirectMessage } from '@/hooks/useDirectMessage';
import { ShareModal } from './ShareModal';
import { EditProfileModal } from './EditProfileModal';

interface ProfileStatsProps {
  profile: Profile;
  postsCount?: number;
  followers?: any[];
  following?: any[];
  isOwnProfile: boolean;
  connectionStatus?: any;
  onFollow?: () => void;
  followMutation?: any;
}

export function ProfileStats({ profile, postsCount = 0, followers = [], following = [], isOwnProfile, connectionStatus, onFollow, followMutation }: ProfileStatsProps) {
  const { startDirectMessage, isLoading: isMessageLoading } = useDirectMessage();

  return (
    <div className="bg-white border-b border-[#E5E7EB]">
      <div className="w-full px-4 md:px-6 lg:px-8 py-4">
        {/* Action Buttons for non-own profiles */}
        {!isOwnProfile && (
          <div className="flex gap-3 justify-center md:justify-start">
            <Button 
              variant={connectionStatus?.isFollowing ? "outline" : "default"}
              className={connectionStatus?.isFollowing 
                ? "border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold px-6 py-2 rounded-lg" 
                : "bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-2 rounded-lg shadow-sm"
              }
              onClick={onFollow}
              disabled={followMutation?.isPending}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              {connectionStatus?.isFollowing ? "Following" : "Follow"}
            </Button>
            <Button 
              variant="outline" 
              className="border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold px-6 py-2 rounded-lg"
              onClick={() => startDirectMessage(profile.user_id)}
              disabled={isMessageLoading(profile.user_id)}
            >
              {isMessageLoading(profile.user_id) ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <MessageSquare className="h-4 w-4 mr-2" />
              )}
              Message
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
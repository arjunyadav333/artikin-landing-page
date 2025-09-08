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
    <div className="w-full px-4 md:px-6 lg:px-8 -mt-2">
      {/* Action Buttons Row for Non-Own Profile */}
      {!isOwnProfile && (
        <div className="flex gap-3 justify-center md:justify-start mb-4">
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

      {/* Inline Stats Bar - Under Username */}
      <div className="flex items-center gap-8 md:gap-12 justify-center md:justify-start mb-4">
        {/* Posts */}
        <div className="text-center md:text-left group cursor-pointer">
          <div className="space-y-1">
            <div className="text-lg md:text-xl font-bold text-[#111827] group-hover:text-primary transition-colors duration-200">
              {postsCount}
            </div>
            <div className="text-xs md:text-sm text-gray-500 font-medium group-hover:text-primary transition-colors duration-200">
              Posts
            </div>
          </div>
        </div>
        
        {/* Followers */}
        <Dialog>
          <DialogTrigger asChild>
            <div className="text-center md:text-left group cursor-pointer">
              <div className="space-y-1">
                <div className="text-lg md:text-xl font-bold text-[#111827] group-hover:text-primary transition-colors duration-200">
                  {followers.length}
                </div>
                <div className="text-xs md:text-sm text-gray-500 font-medium group-hover:text-primary transition-colors duration-200">
                  Followers
                </div>
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white border-[#E5E7EB] shadow-xl rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-[#111827] font-bold">Followers</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {followers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <div className="text-2xl text-gray-400">👥</div>
                  </div>
                  <p className="text-gray-500">No followers yet</p>
                </div>
              ) : (
                followers.map((connection: any) => (
                  <div key={connection.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <Avatar className="h-12 w-12 border-2 border-gray-100">
                      <AvatarImage src={connection.follower_profile?.avatar_url} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {connection.follower_profile?.display_name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate text-[#111827]">
                        {connection.follower_profile?.display_name}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        @{connection.follower_profile?.username}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Following */}
        <Dialog>
          <DialogTrigger asChild>
            <div className="text-center md:text-left group cursor-pointer">
              <div className="space-y-1">
                <div className="text-lg md:text-xl font-bold text-[#111827] group-hover:text-primary transition-colors duration-200">
                  {following.length}
                </div>
                <div className="text-xs md:text-sm text-gray-500 font-medium group-hover:text-primary transition-colors duration-200">
                  Following
                </div>
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-white border-[#E5E7EB] shadow-xl rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-[#111827] font-bold">Following</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {following.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <div className="text-2xl text-gray-400">➕</div>
                  </div>
                  <p className="text-gray-500">Not following anyone yet</p>
                </div>
              ) : (
                following.map((connection: any) => (
                  <div key={connection.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <Avatar className="h-12 w-12 border-2 border-gray-100">
                      <AvatarImage src={connection.following_profile?.avatar_url} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {connection.following_profile?.display_name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate text-[#111827]">
                        {connection.following_profile?.display_name}
                      </div>
                      <div className="text-sm text-gray-500 truncate">
                        @{connection.following_profile?.username}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useConnections } from '@/hooks/useConnections';
import { Profile } from '@/hooks/useProfiles';

interface ProfileStatsProps {
  profile: Profile;
  postsCount?: number;
  followers?: any[];
  following?: any[];
}

export function ProfileStats({ profile, postsCount = 0, followers = [], following = [] }: ProfileStatsProps) {
  return (
    <div className="bg-white border-b border-[#E5E7EB]">
      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 py-6">
        {/* Stats Bar - 3 Equal Columns */}
        <div className="grid grid-cols-3 gap-8 md:gap-12">
          {/* Posts */}
          <div className="text-center group cursor-pointer">
            <div className="space-y-1">
              <div className="text-xl md:text-2xl font-bold text-[#111827] group-hover:text-primary transition-colors duration-200">
                {postsCount}
              </div>
              <div className="text-sm md:text-base text-gray-500 font-medium group-hover:text-primary transition-colors duration-200">
                Posts
              </div>
            </div>
            <div className="h-0.5 bg-transparent group-hover:bg-primary transition-colors duration-200 mt-2 rounded-full" />
          </div>
          
          {/* Followers */}
          <Dialog>
            <DialogTrigger asChild>
              <div className="text-center group cursor-pointer">
                <div className="space-y-1">
                  <div className="text-xl md:text-2xl font-bold text-[#111827] group-hover:text-primary transition-colors duration-200">
                    {followers.length}
                  </div>
                  <div className="text-sm md:text-base text-gray-500 font-medium group-hover:text-primary transition-colors duration-200">
                    Followers
                  </div>
                </div>
                <div className="h-0.5 bg-transparent group-hover:bg-primary transition-colors duration-200 mt-2 rounded-full" />
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
              <div className="text-center group cursor-pointer">
                <div className="space-y-1">
                  <div className="text-xl md:text-2xl font-bold text-[#111827] group-hover:text-primary transition-colors duration-200">
                    {following.length}
                  </div>
                  <div className="text-sm md:text-base text-gray-500 font-medium group-hover:text-primary transition-colors duration-200">
                    Following
                  </div>
                </div>
                <div className="h-0.5 bg-transparent group-hover:bg-primary transition-colors duration-200 mt-2 rounded-full" />
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
    </div>
  );
}
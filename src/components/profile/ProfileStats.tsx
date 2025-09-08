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
    <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 pb-8">
      <div className="grid grid-cols-3 gap-4 md:gap-6">
        {/* Posts Stats Card */}
        <div className="bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-4 md:p-6 text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
          <div className="space-y-2">
            <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              {postsCount}
            </div>
            <div className="text-sm font-medium text-muted-foreground">Posts</div>
          </div>
        </div>
        
        {/* Followers Stats Card */}
        <Dialog>
          <DialogTrigger asChild>
            <div className="bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-4 md:p-6 text-center hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group">
              <div className="space-y-2">
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-secondary to-secondary/80 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary/80 transition-all duration-300">
                  {followers.length}
                </div>
                <div className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                  Followers
                </div>
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-card/95 backdrop-blur-sm border-border/50">
            <DialogHeader>
              <DialogTitle className="text-foreground">Followers</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {followers.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-muted/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <div className="text-2xl text-muted-foreground">👥</div>
                  </div>
                  <p className="text-muted-foreground">No followers yet</p>
                </div>
              ) : (
                followers.map((connection: any) => (
                  <div key={connection.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                      <AvatarImage src={connection.follower_profile?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20">
                        {connection.follower_profile?.display_name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate text-foreground">
                        {connection.follower_profile?.display_name}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        @{connection.follower_profile?.username}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Following Stats Card */}
        <Dialog>
          <DialogTrigger asChild>
            <div className="bg-gradient-to-br from-card to-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-4 md:p-6 text-center hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group">
              <div className="space-y-2">
                <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent group-hover:from-primary group-hover:to-primary/80 transition-all duration-300">
                  {following.length}
                </div>
                <div className="text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors">
                  Following
                </div>
              </div>
            </div>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-card/95 backdrop-blur-sm border-border/50">
            <DialogHeader>
              <DialogTitle className="text-foreground">Following</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {following.length === 0 ? (
                <div className="text-center py-12">
                  <div className="bg-muted/50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <div className="text-2xl text-muted-foreground">➕</div>
                  </div>
                  <p className="text-muted-foreground">Not following anyone yet</p>
                </div>
              ) : (
                following.map((connection: any) => (
                  <div key={connection.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                    <Avatar className="h-12 w-12 border-2 border-primary/20">
                      <AvatarImage src={connection.following_profile?.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-secondary/20">
                        {connection.following_profile?.display_name?.[0] || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate text-foreground">
                        {connection.following_profile?.display_name}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
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

      {/* Portfolio/Projects Stats - Full Width Card */}
      <div className="mt-6">
        <div className="bg-gradient-to-r from-card/80 via-card to-card/80 backdrop-blur-sm border border-border/50 rounded-xl p-4 md:p-6 text-center hover:shadow-lg transition-all duration-300">
          <div className="space-y-2">
            <div className="text-xl md:text-2xl font-bold bg-gradient-to-r from-creative to-creative/80 bg-clip-text text-transparent">
              {profile.portfolio_count || 0}
            </div>
            <div className="text-sm font-medium text-muted-foreground">
              {profile.role === 'artist' ? 'Portfolio Items' : 'Projects'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
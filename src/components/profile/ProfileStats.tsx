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
    <div className="flex justify-center md:justify-start gap-6 md:gap-8 py-4 md:py-6 border-b border-border">
      <div className="text-center">
        <div className="text-[var(--fs-profile-stats)] font-bold text-foreground">{postsCount}</div>
        <div className="text-xs md:text-sm text-muted-foreground">Posts</div>
      </div>
      
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" className="text-center p-0 h-auto hover:text-primary transition-colors">
            <div>
              <div className="text-[var(--fs-profile-stats)] font-bold text-foreground">{followers.length}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Followers</div>
            </div>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Followers</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {followers.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No followers yet</p>
            ) : (
              followers.map((connection: any) => (
                <div key={connection.id} className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={connection.follower_profile?.avatar_url} />
                    <AvatarFallback>
                      {connection.follower_profile?.display_name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
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

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" className="text-center p-0 h-auto hover:text-primary transition-colors">
            <div>
              <div className="text-[var(--fs-profile-stats)] font-bold text-foreground">{following.length}</div>
              <div className="text-xs md:text-sm text-muted-foreground">Following</div>
            </div>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Following</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {following.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">Not following anyone yet</p>
            ) : (
              following.map((connection: any) => (
                <div key={connection.id} className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={connection.following_profile?.avatar_url} />
                    <AvatarFallback>
                      {connection.following_profile?.display_name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">
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

      <div className="text-center">
        <div className="text-[var(--fs-profile-stats)] font-bold text-foreground">{profile.portfolio_count || 0}</div>
        <div className="text-xs md:text-sm text-muted-foreground">
          {profile.role === 'artist' ? 'Portfolio' : 'Projects'}
        </div>
      </div>
    </div>
  );
}
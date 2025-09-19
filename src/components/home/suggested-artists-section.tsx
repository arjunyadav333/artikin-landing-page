import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { UserPlus, ExternalLink } from 'lucide-react';
import { useSuggestedArtists, SuggestedArtist } from '@/hooks/useSuggestedArtists';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

const FollowButton = memo(({ artist, isFollowing, onToggleFollow }: {
  artist: SuggestedArtist;
  isFollowing: boolean;
  onToggleFollow: (artistId: string, isFollowing: boolean) => void;
}) => {
  return (
    <Button
      variant={isFollowing ? "secondary" : "outline"}
      size="sm"
      onClick={() => onToggleFollow(artist.user_id, isFollowing)}
      className="h-8 px-3 text-xs rounded-full hover:scale-105 transition-all duration-200"
    >
      {isFollowing ? (
        "Following"
      ) : (
        <>
          <UserPlus className="w-3 h-3 mr-1" />
          Follow
        </>
      )}
    </Button>
  );
});

FollowButton.displayName = "FollowButton";

const ArtistCard = memo(({ artist, onToggleFollow }: {
  artist: SuggestedArtist;
  onToggleFollow: (artistId: string, isFollowing: boolean) => void;
}) => {
  const getArtformDisplay = (artform: string | null) => {
    if (!artform) return null;
    return artform.charAt(0).toUpperCase() + artform.slice(1).replace('_', ' ');
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/30 transition-colors duration-200">
      <Link to={`/profile/${artist.username}`} className="flex-shrink-0">
        <Avatar className="h-12 w-12 ring-2 ring-background shadow-sm hover:ring-primary/20 transition-all duration-200">
          <AvatarImage src={artist.avatar_url || undefined} alt={artist.display_name} />
          <AvatarFallback className="bg-gradient-to-br from-primary/10 to-secondary/10 text-foreground font-medium">
            {artist.display_name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Link>
      
      <div className="flex-1 min-w-0">
        <Link to={`/profile/${artist.username}`} className="block hover:text-primary transition-colors">
          <p className="font-semibold text-sm truncate">{artist.display_name}</p>
          <p className="text-xs text-muted-foreground truncate">@{artist.username}</p>
        </Link>
        
        <div className="flex items-center gap-2 mt-1">
          {artist.artform && (
            <Badge variant="secondary" className="text-xs px-2 py-0 h-5">
              {getArtformDisplay(artist.artform)}
            </Badge>
          )}
          {artist.follower_count > 0 && (
            <span className="text-xs text-muted-foreground">
              {artist.follower_count} followers
            </span>
          )}
        </div>
      </div>
      
      <FollowButton 
        artist={artist} 
        isFollowing={artist.isFollowing || false}
        onToggleFollow={onToggleFollow}
      />
    </div>
  );
});

ArtistCard.displayName = "ArtistCard";

const SuggestedArtistsSkeleton = memo(() => (
  <div className="space-y-3">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-24 mb-1" />
          <Skeleton className="h-3 w-16 mb-2" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="h-8 w-16 rounded-full" />
      </div>
    ))}
  </div>
));

SuggestedArtistsSkeleton.displayName = "SuggestedArtistsSkeleton";

export const SuggestedArtistsSection = memo(() => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: suggestedArtists, isLoading, error } = useSuggestedArtists(6);

  const followMutation = useMutation({
    mutationFn: async ({ artistId, shouldFollow }: { artistId: string; shouldFollow: boolean }) => {
      if (shouldFollow) {
        const { error } = await supabase
          .from('connections')
          .insert([{ follower_id: user!.id, following_id: artistId }]);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('connections')
          .delete()
          .eq('follower_id', user!.id)
          .eq('following_id', artistId);
        if (error) throw error;
      }
    },
    onSuccess: (_, { shouldFollow }) => {
      queryClient.invalidateQueries({ queryKey: ['suggested-artists'] });
      toast({
        description: shouldFollow ? "Successfully followed!" : "Successfully unfollowed!",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "Something went wrong. Please try again.",
      });
    },
  });

  const handleToggleFollow = (artistId: string, isCurrentlyFollowing: boolean) => {
    followMutation.mutate({
      artistId,
      shouldFollow: !isCurrentlyFollowing
    });
  };

  if (error) {
    return null; // Fail silently for better UX
  }

  return (
    <div className="bg-card/50 rounded-2xl border border-border/50 p-6 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg text-foreground">Suggested Artists</h3>
        <Link to="/connections">
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary">
            See all <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </div>
      
      {isLoading ? (
        <SuggestedArtistsSkeleton />
      ) : suggestedArtists && suggestedArtists.length > 0 ? (
        <div className="space-y-1">
          {suggestedArtists.slice(0, 4).map((artist) => (
            <ArtistCard 
              key={artist.id} 
              artist={artist} 
              onToggleFollow={handleToggleFollow}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm">No artist suggestions available</p>
          <Link to="/connections">
            <Button variant="outline" size="sm" className="mt-3">
              Discover Artists
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
});

SuggestedArtistsSection.displayName = "SuggestedArtistsSection";
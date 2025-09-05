import { useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useProfile } from "@/hooks/useProfiles";
import { useUserPosts } from "@/hooks/usePosts";
import { useUserPortfolios } from "@/hooks/usePortfolios";
import { useAuth } from "@/hooks/useAuth";
import { useConnectionStatus, useFollowUser, useConnections } from "@/hooks/useConnections";
import { useTrackProfileView } from "@/hooks/useProfileAnalytics";
import { ProfileHero } from "@/components/profile/ProfileHero";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { useDirectMessage } from "@/hooks/useDirectMessage";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Lock, MapPin } from "lucide-react";

export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine if viewing own profile or another user's
  // Check if we're on /profile/me route or if userId matches current user
  const isOnProfileMeRoute = location.pathname === "/profile/me";
  const isOwnProfile = isOnProfileMeRoute || userId === "me" || userId === user?.id;
  
  // Set target user ID: use current user's ID for own profile, otherwise use userId param
  const targetUserId = isOwnProfile ? user?.id : userId;
  
  // Debug authentication and routing state
  console.log('UserProfile Debug:', {
    pathname: location.pathname,
    userId,
    user: user ? { id: user.id, email: user.email } : null,
    isOnProfileMeRoute,
    isOwnProfile,
    targetUserId,
    authLoading
  });
  
  // Fetch profile data
  const { data: profile, isLoading: profileLoading } = useProfile(targetUserId);
  const { data: posts, isLoading: postsLoading } = useUserPosts(targetUserId!);
  const { data: portfolios, isLoading: portfoliosLoading } = useUserPortfolios();
  
  // Connection status and follow functionality
  const { data: connectionStatus } = useConnectionStatus(targetUserId);
  const { data: followers } = useConnections(targetUserId, 'followers');
  const { data: following } = useConnections(targetUserId, 'following');
  const followMutation = useFollowUser();
  const trackViewMutation = useTrackProfileView();
  const { startDirectMessage } = useDirectMessage();

  // Track profile view
  useEffect(() => {
    if (targetUserId && !isOwnProfile) {
      trackViewMutation.mutate();
    }
  }, [targetUserId, isOwnProfile, trackViewMutation]);
  
  const handleFollow = () => {
    if (!targetUserId) return;
    followMutation.mutate({
      targetUserId,
      isCurrentlyFollowing: connectionStatus?.isFollowing || false
    });
  };

  const handleMessage = async () => {
    if (!targetUserId || !user) return;
    
    startDirectMessage(targetUserId);
  };

  // Handle authentication loading
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated and trying to access own profile
  if (isOwnProfile && !user) {
    navigate('/auth');
    return null;
  }

  // Handle profile loading
  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Handle profile not found
  if (!profile) {
    if (isOwnProfile && user) {
      // User is authenticated but no profile exists - create one
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Setting up your profile...</h2>
            <p className="text-muted-foreground mb-4">We're creating your profile for the first time.</p>
            <button 
              onClick={() => navigate('/profile/edit')}
              className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
            >
              Complete Profile Setup
            </button>
          </div>
        </div>
      );
    } else {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-2">Profile not found</h2>
            <p className="text-muted-foreground">This user doesn't exist or has been deactivated.</p>
          </div>
        </div>
      );
    }
  }

  // Check if this is a private account and viewer doesn't have access
  if (profile.privacy === 'private' && !profile.can_view_full && !isOwnProfile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="text-4xl font-bold">
                  {profile.display_name?.charAt(0)?.toUpperCase() || profile.username?.charAt(0)?.toUpperCase() || '?'}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">@{profile.username}</h1>
              
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                {profile.artform && (
                  <span className="capitalize">
                    {profile.artform.replace('_', ' ')}
                  </span>
                )}
                {profile.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {profile.location}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Lock className="h-4 w-4" />
                <p>This account is private — follow to view posts and portfolio.</p>
              </div>
              
              <Button 
                onClick={handleFollow}
                disabled={followMutation.isPending}
                size="lg"
                className="px-8"
              >
                {followMutation.isPending ? 'Following...' : 'Follow'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ProfileHero
        profile={profile}
        isOwnProfile={isOwnProfile}
        connectionStatus={connectionStatus}
        onFollow={handleFollow}
        followMutation={followMutation}
      />

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <ProfileStats
          profile={profile}
          postsCount={posts?.length}
          followers={followers}
          following={following}
        />

        <ProfileTabs
          profile={profile}
          isOwnProfile={isOwnProfile}
          posts={posts}
          postsLoading={postsLoading}
          portfolios={portfolios}
          portfoliosLoading={portfoliosLoading}
        />
      </div>
    </div>
  );
}
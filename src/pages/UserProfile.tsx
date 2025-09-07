import { useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { ProfileHero } from '../components/profile/ProfileHero';
import { ProfileStats } from '../components/profile/ProfileStats';
import { ProfileTabs } from '../components/profile/ProfileTabs';
import { useAuth } from '../hooks/useAuth';
import { useCurrentProfile } from '../hooks/useProfiles';
import { useProfileByUsername, useUserPosts, useUserPortfolios } from '../hooks/useProfileByUsername';
import { useConnectionStatus, useConnections, useFollowUser } from '../hooks/useConnections';
import { useDirectMessage } from '../hooks/useDirectMessage';
import { useTrackProfileView } from '../hooks/useViewTracking';

export default function UserProfile() {
  const { username } = useParams<{ username: string }>();
  const { user, loading: authLoading } = useAuth();
  
  // Get current user profile for comparison
  const { data: currentUserProfile } = useCurrentProfile();
  
  // Determine if this is the current user's profile or get by username
  const isOwnProfile = username === 'me' || username === currentUserProfile?.username;
  const actualUsername = isOwnProfile ? currentUserProfile?.username : username;

  // Data fetching
  const { data: profile, isLoading: profileLoading, error: profileError } = useProfileByUsername(actualUsername);
  const { data: posts, isLoading: postsLoading } = useUserPosts(profile?.user_id);
  const { data: portfolios, isLoading: portfoliosLoading } = useUserPortfolios(profile?.user_id);

  // Connection and messaging hooks
  const { data: connectionStatus } = useConnectionStatus(profile?.user_id);
  const { data: connectionsData } = useConnections(profile?.user_id);
  const followMutation = useFollowUser();
  const { trackProfileView } = useTrackProfileView();
  const { startDirectMessage } = useDirectMessage();

  // Track profile view for non-own profiles
  useEffect(() => {
    if (profile && !isOwnProfile && user) {
      trackProfileView(profile.id);
    }
  }, [profile, isOwnProfile, user, trackProfileView]);

  const handleFollow = async () => {
    if (!profile) return;
    
    try {
      await followMutation.mutateAsync({
        followingId: profile.user_id,
        action: connectionStatus?.isFollowing ? 'unfollow' : 'follow'
      });
    } catch (error) {
      console.error('Follow action failed:', error);
    }
  };

  const handleMessage = async () => {
    if (!profile) return;
    
    try {
      await startDirectMessage(profile.user_id);
    } catch (error) {
      console.error('Failed to start message:', error);
    }
  };

  // Show loading state for authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to auth if trying to access own profile without being authenticated
  if (isOwnProfile && !user) {
    return <Navigate to="/auth" replace />;
  }

  // Show loading state for profile data
  if (profileLoading || (isOwnProfile && !currentUserProfile)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Handle profile not found or error states
  if (profileError || !profile) {
    if (isOwnProfile) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Complete Your Profile</h2>
            <p className="text-muted-foreground">
              It looks like you haven't set up your profile yet.
            </p>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
              Set Up Profile
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold">Profile Not Found</h2>
          <p className="text-muted-foreground">
            The profile you're looking for doesn't exist or may have been deleted.
          </p>
        </div>
      </div>
    );
  }

  // Render the profile page
  return (
    <div className="min-h-screen bg-background">
      <ProfileHero
        profile={profile}
        isOwnProfile={isOwnProfile}
        connectionStatus={connectionStatus}
        onFollow={handleFollow}
        followMutation={followMutation}
      />
      
      <ProfileStats
        profile={profile}
        followers={connectionsData?.followers || []}
        following={connectionsData?.following || []}
      />
      
      <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 py-6 md:py-8">
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
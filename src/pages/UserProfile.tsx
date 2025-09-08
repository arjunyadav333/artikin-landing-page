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
  
  // Determine if this is the current user's profile
  const isOwnProfile = username === 'me';
  
  // Get current user profile if viewing own profile
  const { data: currentUserProfile, isLoading: currentProfileLoading, error: currentProfileError } = useCurrentProfile();
  
  // For public profiles, get profile by username  
  const { data: publicProfile, isLoading: publicProfileLoading, error: publicProfileError } = useProfileByUsername(
    !isOwnProfile ? username : undefined
  );

  // Use the appropriate profile data based on the route
  const profile = isOwnProfile ? currentUserProfile : publicProfile;
  const profileLoading = isOwnProfile ? currentProfileLoading : publicProfileLoading;
  const profileError = isOwnProfile ? currentProfileError : publicProfileError;
  const { data: posts, isLoading: postsLoading } = useUserPosts(profile?.user_id);
  const { data: portfolios, isLoading: portfoliosLoading } = useUserPortfolios(profile?.user_id);

  // Connection and messaging hooks
  const { data: connectionStatus } = useConnectionStatus(profile?.user_id);
  const { data: followersData } = useConnections(profile?.user_id, 'followers');
  const { data: followingData } = useConnections(profile?.user_id, 'following');
  const followMutation = useFollowUser();
  const trackProfileViewMutation = useTrackProfileView();
  const { startDirectMessage } = useDirectMessage();

  // Track profile view for non-own profiles
  useEffect(() => {
    if (profile && !isOwnProfile && user) {
      trackProfileViewMutation.mutate(profile.id);
    }
  }, [profile, isOwnProfile, user, trackProfileViewMutation]);

  const handleFollow = async () => {
    if (!profile) return;
    
    try {
      await followMutation.mutateAsync({
        targetUserId: profile.user_id,
        isCurrentlyFollowing: connectionStatus?.isFollowing || false
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
    console.error('Profile error or missing:', { profileError, profile, isOwnProfile, user });
    
    if (isOwnProfile) {
      // For own profile, show profile creation screen
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="text-center space-y-4 max-w-md">
            <h2 className="text-2xl font-bold">Welcome to Your Profile</h2>
            <p className="text-muted-foreground">
              Let's set up your profile to get started. You'll be able to customize it later.
            </p>
            {profileError && (
              <p className="text-sm text-red-600">
                Debug: {JSON.stringify(profileError, null, 2)}
              </p>
            )}
            <button 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              onClick={() => {
                // For now, just refresh to retry
                window.location.reload();
              }}
            >
              Retry Loading Profile
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
          {profileError && (
            <p className="text-sm text-red-600">
              Debug: {JSON.stringify(profileError, null, 2)}
            </p>
          )}
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
        followers={followersData || []}
        following={followingData || []}
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
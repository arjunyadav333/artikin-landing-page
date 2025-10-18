import { useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useProfile, useProfileByUsername } from "@/hooks/useProfiles";
import { useUserPosts } from "@/hooks/usePosts";
import { useUserPortfolios } from "@/hooks/usePortfolios";
import { useAuth } from "@/hooks/useAuth";
import { useConnectionStatus, useFollowUser, useConnections } from "@/hooks/useConnections";
import { useTrackProfileView } from "@/hooks/useProfileAnalytics";
import { ProfileHero } from "@/components/profile/ProfileHero";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { useDirectMessage } from "@/hooks/useDirectMessage";

export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine if viewing own profile or another user's
  // Check if we're on /profile/me route or if userId matches current user
  const isOnProfileMeRoute = location.pathname === "/profile/me";
  const isOwnProfile = isOnProfileMeRoute || userId === "me" || userId === user?.id;
  
  // Check if userId is a UUID (user_id) or username
  const isUUID = userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
  
  // Set target user ID: use current user's ID for own profile, otherwise use userId param if it's a UUID
  const targetUserId = isOwnProfile ? user?.id : (isUUID ? userId : undefined);
  
  // Debug authentication and routing state (development only)
  if (import.meta.env.DEV) {
    console.log('UserProfile Debug:', {
      pathname: location.pathname,
      userId,
      user: user ? { id: user.id, email: user.email } : null,
      isOnProfileMeRoute,
      isOwnProfile,
      targetUserId,
      authLoading
    });
  }
  
  // Fetch profile data - use username or user_id based on what we have
  const { data: profileByUsername, isLoading: profileByUsernameLoading } = useProfileByUsername(
    !isOwnProfile && !isUUID ? userId : undefined
  );
  const { data: profileByUserId, isLoading: profileByUserIdLoading } = useProfile(targetUserId);
  
  // Use whichever profile query returned data
  const profile = profileByUsername || profileByUserId;
  const profileLoading = profileByUsernameLoading || profileByUserIdLoading;
  
  // If we loaded by username, get the user_id for other queries
  const actualUserId = profile?.user_id || targetUserId;
  const { data: posts, isLoading: postsLoading } = useUserPosts(actualUserId!);
  const { data: portfolios, isLoading: portfoliosLoading } = useUserPortfolios();
  
  // Connection status and follow functionality
  const { data: connectionStatus } = useConnectionStatus(actualUserId);
  const { data: followers } = useConnections(actualUserId, 'followers');
  const { data: following } = useConnections(actualUserId, 'following');
  const followMutation = useFollowUser();
  const trackViewMutation = useTrackProfileView();
  const { startDirectMessage } = useDirectMessage();

  // Track profile view
  useEffect(() => {
    if (actualUserId && !isOwnProfile) {
      trackViewMutation.mutate();
    }
  }, [actualUserId, isOwnProfile]);
  
  const handleFollow = () => {
    if (!actualUserId) return;
    followMutation.mutate({
      targetUserId: actualUserId,
      isCurrentlyFollowing: connectionStatus?.isFollowing || false
    });
  };

  const handleMessage = async () => {
    if (!actualUserId || !user) return;
    
    startDirectMessage(actualUserId);
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

  return (
    <div className="min-h-screen bg-background">
      <ProfileHero
        profile={profile}
        isOwnProfile={isOwnProfile}
        connectionStatus={connectionStatus}
        onFollow={handleFollow}
        followMutation={followMutation}
        postsCount={posts?.length}
        followers={followers}
        following={following}
      />

      <ProfileStats
        profile={profile}
        postsCount={posts?.length}
        followers={followers}
        following={following}
        isOwnProfile={isOwnProfile}
        connectionStatus={connectionStatus}
        onFollow={handleFollow}
        followMutation={followMutation}
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
  );
}
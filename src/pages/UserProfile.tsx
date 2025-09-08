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
  }, [targetUserId, isOwnProfile]);
  
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
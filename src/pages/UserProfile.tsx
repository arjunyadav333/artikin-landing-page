import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProfile } from "@/hooks/useProfiles";
import { useUserPosts } from "@/hooks/usePosts";
import { useUserPortfolios } from "@/hooks/usePortfolios";
import { useAuth } from "@/hooks/useAuth";
import { useConnectionStatus, useFollowUser, useConnections } from "@/hooks/useConnections";
import { useTrackProfileView } from "@/hooks/useProfileAnalytics";
import { ProfileHero } from "@/components/profile/ProfileHero";
import { ProfileStats } from "@/components/profile/ProfileStats";
import { ProfileTabs } from "@/components/profile/ProfileTabs";
import { supabase } from "@/integrations/supabase/client";

export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Determine if viewing own profile or another user's
  const isOwnProfile = userId === "me" || userId === user?.id;
  const targetUserId = isOwnProfile ? user?.id : userId;
  
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
    
    try {
      const { data, error } = await supabase.functions.invoke('create-or-get-conversation', {
        body: { user1_id: user.id, user2_id: targetUserId }
      });
      
      if (error) throw error;
      
      navigate(`/messages?conversation=${data.conversation_id}`);
    } catch (error) {
      console.error('Failed to create conversation:', error);
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Profile not found</h2>
          <p className="text-muted-foreground">This user doesn't exist or has been deactivated.</p>
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
        onMessage={handleMessage}
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
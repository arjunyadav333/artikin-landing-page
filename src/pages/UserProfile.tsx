import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Calendar, 
  Globe, 
  Edit, 
  Share, 
  MoreHorizontal,
  UserPlus,
  MessageSquare
} from "lucide-react";
import { useProfile, useCurrentProfile } from "@/hooks/useProfiles";
import { useUserPosts } from "@/hooks/usePosts";
import { useAuth } from "@/hooks/useAuth";
import { useConnectionStatus, useFollowUser, useConnections } from "@/hooks/useConnections";
import { PostsGrid } from "@/components/profile/posts-grid";
import { PortfolioGrid } from "@/components/profile/portfolio-grid";

export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("posts");
  
  // Determine if viewing own profile or another user's
  const isOwnProfile = userId === "me" || userId === user?.id;
  const targetUserId = isOwnProfile ? user?.id : userId;
  
  // Fetch profile data
  const { data: profile, isLoading: profileLoading } = useProfile(targetUserId);
  const { data: currentProfile } = useCurrentProfile();
  const { data: posts, isLoading: postsLoading } = useUserPosts(targetUserId!);
  
  // Connection status and follow functionality
  const { data: connectionStatus } = useConnectionStatus(targetUserId);
  const { data: followers } = useConnections(targetUserId, 'followers');
  const { data: following } = useConnections(targetUserId, 'following');
  const followMutation = useFollowUser();
  
  const handleFollow = () => {
    if (!targetUserId) return;
    followMutation.mutate({
      targetUserId,
      isCurrentlyFollowing: connectionStatus?.isFollowing || false
    });
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
      {/* Cover Image */}
      <div className="relative h-64 md:h-80 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        {isOwnProfile && (
          <Button 
            variant="secondary" 
            size="sm" 
            className="absolute top-4 right-4 bg-background/80 backdrop-blur hover:bg-background"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Cover
          </Button>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-10">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
              <AvatarImage src={profile.avatar_url || ""} alt={profile.display_name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-4xl font-bold">
                {profile.display_name?.[0]?.toUpperCase() || profile.username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Profile Info */}
          <div className="flex-1 pt-0 md:pt-16">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground mb-1">
                  {profile.display_name || profile.username}
                </h1>
                <div className="flex items-center gap-3 mb-2">
                  <p className="text-lg text-muted-foreground">
                    {profile.role === 'artist' ? (profile.artform || 'Artist') : (profile.organization_type || 'Organization')}
                  </p>
                  {profile.role && (
                    <Badge variant="secondary" className="capitalize">
                      {profile.role}
                    </Badge>
                  )}
                </div>
                {profile.bio && (
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {profile.bio}
                  </p>
                )}

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4 flex-wrap">
                  {profile.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {profile.location}
                    </div>
                  )}
                  {profile.website && (
                    <div className="flex items-center gap-1">
                      <Globe className="h-4 w-4" />
                      <a 
                        href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} 
                        className="text-primary hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {profile.website.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </div>
                </div>

                {/* Additional Details */}
                {(profile.full_name || profile.phone_number) && (
                  <div className="space-y-2 mb-4">
                    {profile.full_name && profile.full_name !== profile.display_name && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Full name: </span>
                        <span className="text-foreground">{profile.full_name}</span>
                      </div>
                    )}
                    {profile.phone_number && isOwnProfile && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Phone: </span>
                        <span className="text-foreground">{profile.phone_number}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                {isOwnProfile ? (
                  <Button variant="outline">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <>
                    <Button 
                      variant={connectionStatus?.isFollowing ? "outline" : "default"}
                      className={connectionStatus?.isFollowing 
                        ? "border-primary text-primary hover:bg-primary/10" 
                        : "bg-primary hover:bg-primary/90 text-primary-foreground"
                      }
                      onClick={handleFollow}
                      disabled={followMutation.isPending}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      {connectionStatus?.isFollowing ? "Following" : "Follow"}
                    </Button>
                    <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                      <MessageSquare className="h-4 w-4 mr-2" />
                      Message
                    </Button>
                  </>
                )}
                <Button variant="outline" size="icon">
                  <Share className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="flex gap-8 mb-8 pb-6 border-b border-border">
          <div className="text-center">
            <div className="text-2xl font-bold text-foreground">{posts?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Posts</div>
          </div>
          <button className="text-center hover:text-primary transition-colors">
            <div className="text-2xl font-bold text-foreground">{followers?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Followers</div>
          </button>
          <button className="text-center hover:text-primary transition-colors">
            <div className="text-2xl font-bold text-foreground">{following?.length || 0}</div>
            <div className="text-sm text-muted-foreground">Following</div>
          </button>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="pb-20">
            <PostsGrid posts={(posts || []) as any} isLoading={postsLoading} />
          </TabsContent>

          <TabsContent value="portfolio" className="pb-20">
            <PortfolioGrid isOwnProfile={isOwnProfile} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
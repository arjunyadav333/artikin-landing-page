import { useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useProfile } from "@/hooks/useProfiles";
import { useAuth } from "@/hooks/useAuth";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileContent } from "@/components/profile/ProfileContent";

export default function UserProfile() {
  const { userId } = useParams<{ userId: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine if viewing own profile or another user's
  const isOnProfileMeRoute = location.pathname === "/profile/me";
  const isOwnProfile = isOnProfileMeRoute || userId === "me" || userId === user?.id;
  
  // Set target user ID
  const targetUserId = isOwnProfile ? user?.id : userId;
  
  // Fetch profile data
  const { data: profile, isLoading: profileLoading } = useProfile(targetUserId);
  
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
    <div className="min-h-screen bg-gray-50">
      {/* Desktop: 12-column grid layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Profile Header Card - Left column on desktop, full width on mobile */}
          <div className="lg:col-span-3">
            <ProfileHeader 
              profile={profile}
              isOwnProfile={isOwnProfile}
            />
          </div>
          
          {/* Main Content - Right column on desktop, full width on mobile */}
          <div className="lg:col-span-9">
            <ProfileContent 
              profile={profile}
              isOwnProfile={isOwnProfile}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
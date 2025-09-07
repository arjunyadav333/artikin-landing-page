import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Share2, 
  MessageCircle, 
  UserPlus, 
  UserMinus, 
  MapPin, 
  Link as LinkIcon, 
  Calendar,
  Download
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ShareModal } from './ShareModal';
import { EditProfileModal } from './EditProfileModal';
import type { ProfileWithStats } from '@/hooks/useProfileByUsername';

interface ProfileHeroProps {
  profile: ProfileWithStats;
  isOwnProfile: boolean;
  connectionStatus?: any;
  onFollow?: () => void;
  followMutation?: any;
}

export function ProfileHero({ 
  profile, 
  isOwnProfile, 
  connectionStatus, 
  onFollow, 
  followMutation 
}: ProfileHeroProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showShareModal, setShowShareModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleShareProfile = () => {
    setShowShareModal(true);
  };

  const handleExportContact = () => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${profile.display_name}
END:VCARD`;

    const blob = new Blob([vcard], { type: 'text/vcard' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${profile.display_name.replace(/\s+/g, '_')}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const profileUrl = `${window.location.origin}/profile/${profile.username}`;

  return (
    <>
      <div className="relative">
        {/* Cover Image */}
        <div className="h-48 md:h-64 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20 relative overflow-hidden">
          {profile.cover_url && (
            <img
              src={profile.cover_url}
              alt="Cover"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Profile Header */}
        <div className="max-w-5xl mx-auto px-4 md:px-6 lg:px-8 pb-6">
          <div className="relative -mt-16 md:-mt-20">
            <div className="flex flex-col md:flex-row md:items-end gap-4 md:gap-6">
              {/* Avatar */}
              <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-background shadow-lg">
                <AvatarImage src={profile.avatar_url} alt={profile.display_name} />
                <AvatarFallback className="text-lg md:text-xl font-semibold bg-primary/10 text-primary">
                  {profile.display_name?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>

              {/* Profile Info */}
              <div className="flex-1 md:mb-4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  {/* Left Side - Profile Info */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <h1 className="text-xl md:text-3xl font-bold text-foreground leading-tight">
                        {profile.display_name}
                      </h1>
                      <p className="text-base text-muted-foreground">@{profile.username}</p>
                    </div>

                    {/* Headline */}
                    {profile.headline && (
                      <p className="text-sm md:text-base font-medium text-foreground/80">
                        {profile.headline}
                      </p>
                    )}

                    {/* Role-specific field */}
                    {profile.role && (
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs md:text-sm font-medium">
                          {profile.role === 'artist' ? (
                            profile.artform ? profile.artform.charAt(0).toUpperCase() + profile.artform.slice(1) : 'Artist'
                          ) : (
                            profile.organization_type ? 
                              profile.organization_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : 
                              'Organization'
                          )}
                        </Badge>
                      </div>
                    )}

                    {/* Bio */}
                    {profile.bio && (
                      <p className="text-sm md:text-base text-foreground/90 max-w-2xl leading-relaxed">
                        {profile.bio}
                      </p>
                    )}

                    {/* Meta Info */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      {profile.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" />
                          <span>{profile.location}</span>
                        </div>
                      )}
                      {profile.website && (
                        <a
                          href={profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 hover:text-primary transition-colors"
                        >
                          <LinkIcon className="w-4 h-4" />
                          <span>Website</span>
                        </a>
                      )}
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>Joined {format(new Date(profile.created_at), 'MMM yyyy')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Action Buttons */}
                  <div className="flex gap-2 md:flex-shrink-0 flex-wrap md:flex-nowrap">
                    {isOwnProfile ? (
                      <Button 
                        variant="outline" 
                        className="flex-1 md:flex-initial"
                        onClick={() => setShowEditModal(true)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                    ) : (
                      <>
                        <Button
                          variant={connectionStatus?.isFollowing ? "outline" : "default"}
                          onClick={onFollow}
                          disabled={followMutation?.isPending}
                          className="flex-1 md:flex-initial min-w-[100px]"
                        >
                          {connectionStatus?.isFollowing ? (
                            <>
                              <UserMinus className="w-4 h-4 mr-2" />
                              Unfollow
                            </>
                          ) : (
                            <>
                              <UserPlus className="w-4 h-4 mr-2" />
                              Follow
                            </>
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => navigate(`/messages`)}
                          className="flex-1 md:flex-initial"
                        >
                          <MessageCircle className="w-4 h-4 mr-2" />
                          <span className="hidden sm:inline">Message</span>
                        </Button>
                      </>
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleShareProfile}
                      className="flex-shrink-0"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    {!isOwnProfile && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={handleExportContact}
                        className="flex-shrink-0"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        profileUrl={profileUrl}
        profileName={profile.display_name}
      />
      
      {isOwnProfile && (
        <EditProfileModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          profile={profile}
        />
      )}
    </>
  );
}
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Calendar, 
  Globe, 
  Edit, 
  Share, 
  MoreHorizontal,
  UserPlus,
  MessageSquare,
  Shield,
  Mail,
  ExternalLink,
  Loader2
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Profile } from '@/hooks/useProfiles';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useDirectMessage } from '@/hooks/useDirectMessage';
import { ShareModal } from './ShareModal';
import { EditProfileModal } from './EditProfileModal';

interface ProfileHeroProps {
  profile: Profile;
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
  const { startDirectMessage, isLoading: isMessageLoading } = useDirectMessage();

  const handleExportContact = () => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${profile.display_name}
ORG:${profile.role === 'organization' ? profile.organization_type : profile.artform}
EMAIL:${profile.contact_email || ''}
URL:${profile.website || ''}
NOTE:${profile.bio || ''}
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

  return (
    <div className="relative">
      {/* Cover Image with Modern Gradient */}
      <div className="relative h-56 md:h-80 lg:h-96 bg-gradient-to-br from-primary/30 via-accent/20 to-secondary/25 overflow-hidden">
        {profile.cover_url && (
          <img 
            src={profile.cover_url} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-background/40 to-transparent" />
        
        {/* Floating Profile Card */}
        <div className="absolute bottom-0 left-0 right-0 transform translate-y-1/2">
          <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
            <div className="bg-card backdrop-blur-sm border border-border/50 shadow-2xl rounded-2xl p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
                {/* Avatar with Glow Effect */}
                <div className="relative flex-shrink-0">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl scale-110"></div>
                  <Avatar className="relative h-28 w-28 md:h-32 md:w-32 border-4 border-primary/20 shadow-xl ring-2 ring-primary/10">
                    <AvatarImage src={profile.avatar_url || ""} alt={profile.display_name} />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-primary-foreground text-3xl font-bold">
                      {profile.display_name?.[0]?.toUpperCase() || profile.username?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      {/* Name and Verification */}
                      <div className="flex items-center justify-center md:justify-start gap-3">
                        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                          {profile.display_name || profile.username}
                        </h1>
                        {profile.verified && (
                          <div className="relative">
                            <Shield className="h-6 w-6 text-primary fill-primary drop-shadow-sm" />
                            <div className="absolute inset-0 bg-primary/20 rounded-full blur-sm"></div>
                          </div>
                        )}
                      </div>

                      {/* Username and Role Badge */}
                      <div className="flex items-center justify-center md:justify-start gap-3 flex-wrap">
                        <p className="text-muted-foreground font-medium">
                          @{profile.username}
                        </p>
                        {profile.role && (
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 font-medium">
                            {profile.role}
                          </Badge>
                        )}
                      </div>

                      {/* Role Description */}
                      <div className="flex items-center justify-center md:justify-start">
                        <p className="text-lg font-medium text-foreground/90">
                          {profile.role === 'artist' 
                            ? (profile.artform ? profile.artform.charAt(0).toUpperCase() + profile.artform.slice(1) : 'Artist')
                            : (profile.organization_type ? profile.organization_type.replace('_', ' ').charAt(0).toUpperCase() + profile.organization_type.replace('_', ' ').slice(1) : 'Organization')
                          }
                        </p>
                      </div>

                      {/* Bio Section */}
                      {profile.bio && (
                        <div className="bg-muted/30 rounded-lg p-4 border border-border/50">
                          <p className="text-foreground/90 leading-relaxed max-w-2xl">
                            {profile.bio}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */} 
                    <div className="flex gap-2 flex-shrink-0 justify-center md:justify-start">
                      {isOwnProfile ? (
                        <EditProfileModal profile={profile}>
                          <Button variant="outline" className="bg-background/50 backdrop-blur-sm border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Profile
                          </Button>
                        </EditProfileModal>
                      ) : (
                        <>
                          <Button 
                            variant={connectionStatus?.isFollowing ? "outline" : "default"}
                            className={connectionStatus?.isFollowing 
                              ? "bg-background/50 backdrop-blur-sm border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 transition-all duration-200" 
                              : "bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
                            }
                            onClick={onFollow}
                            disabled={followMutation?.isPending}
                          >
                            <UserPlus className="h-4 w-4 mr-2" />
                            {connectionStatus?.isFollowing ? "Following" : "Follow"}
                          </Button>
                          <Button 
                            variant="outline" 
                            className="bg-background/50 backdrop-blur-sm border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
                            onClick={() => startDirectMessage(profile.user_id)}
                            disabled={isMessageLoading(profile.user_id)}
                          >
                            {isMessageLoading(profile.user_id) ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <MessageSquare className="h-4 w-4 mr-2" />
                            )}
                            Message
                          </Button>
                        </>
                      )}
                      
                      <ShareModal profile={profile}>
                        <Button variant="outline" className="bg-background/50 backdrop-blur-sm border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200">
                          <Share className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                      </ShareModal>

                      {!isOwnProfile && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className="bg-background/50 backdrop-blur-sm border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-200">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card/95 backdrop-blur-sm border-border/50">
                            <DropdownMenuItem onClick={handleExportContact}>
                              <Mail className="h-4 w-4 mr-2" />
                              Export Contact
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              Report User
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                              Block User
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Meta Information Section */}
      <div className="pt-20 pb-8">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Contact & Location Info */}
            {(profile.location || profile.website || profile.contact_email) && (
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 space-y-3">
                <h3 className="font-semibold text-foreground/90 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Location & Contact
                </h3>
                <div className="space-y-2 text-sm">
                  {profile.location && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {profile.location}
                    </div>
                  )}
                  {profile.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-3 w-3 text-muted-foreground" />
                      <a 
                        href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} 
                        className="text-primary hover:underline flex items-center gap-1 transition-colors"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {profile.website.replace(/^https?:\/\//, '')}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                  {profile.contact_email && !isOwnProfile && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <a href={`mailto:${profile.contact_email}`} className="text-primary hover:underline transition-colors">
                        Contact Email
                      </a>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Join Date & Additional Info */}
            <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 space-y-3">
              <h3 className="font-semibold text-foreground/90 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary" />
                Member Since
              </h3>
              <div className="text-sm text-muted-foreground">
                Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </div>
              {profile.pronouns && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Pronouns: </span>
                  <span className="text-foreground font-medium">{profile.pronouns}</span>
                </div>
              )}
            </div>

            {/* Social Links */}
            {profile.social_links && Object.keys(profile.social_links).length > 0 && (
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-xl p-4 space-y-3">
                <h3 className="font-semibold text-foreground/90 flex items-center gap-2">
                  <ExternalLink className="h-4 w-4 text-primary" />
                  Social Links
                </h3>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(profile.social_links).map(([platform, url]) => (
                    <Button
                      key={platform}
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 bg-background/50 border-primary/30 text-primary hover:bg-primary/10 hover:border-primary/50 transition-all duration-200"
                      onClick={() => window.open(url as string, '_blank')}
                    >
                      {platform}
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
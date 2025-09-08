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
      {/* Cover Image */}
      <div className="relative h-48 md:h-64 lg:h-72 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 overflow-hidden">
        {profile.cover_url && (
          <img 
            src={profile.cover_url} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Profile Header */}
      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8 -mt-16 relative z-10">
        <div className="flex flex-col md:flex-row gap-6 mb-6">
          {/* Avatar */}
          <div className="relative flex-shrink-0 self-center md:self-start">
            <Avatar className="h-32 w-32 md:h-36 md:w-36 border-4 border-background shadow-xl">
              <AvatarImage src={profile.avatar_url || ""} alt={profile.display_name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-4xl font-bold">
                {profile.display_name?.[0]?.toUpperCase() || profile.username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Profile Info */}
          <div className="flex-1 pt-4 md:pt-8 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                {/* Name and Role */}
                <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                  <h1 className="text-[var(--fs-profile-name)] font-bold text-foreground">
                    {profile.display_name || profile.username}
                  </h1>
                  {profile.verified && (
                    <Shield className="h-5 w-5 text-primary fill-primary" />
                  )}
                </div>

                <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                  <p className="text-[var(--fs-profile-username)] text-muted-foreground">
                    @{profile.username}
                  </p>
                  {profile.role && (
                    <Badge variant="secondary" className="capitalize text-xs">
                      {profile.role}
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-center md:justify-start mb-3">
                  <p className="text-[var(--fs-profile-role)] text-muted-foreground">
                    {profile.role === 'artist' 
                      ? (profile.artform ? profile.artform.charAt(0).toUpperCase() + profile.artform.slice(1) : 'Artist')
                      : (profile.organization_type ? profile.organization_type.replace('_', ' ').charAt(0).toUpperCase() + profile.organization_type.replace('_', ' ').slice(1) : 'Organization')
                    }
                  </p>
                </div>

                {/* Headline */}
                {profile.headline && (
                  <p className="text-[var(--fs-profile-bio)] font-medium text-foreground mb-3 text-center md:text-left">
                    {profile.headline}
                  </p>
                )}

                {/* Bio */}
                {profile.bio && (
                  <p className="text-[var(--fs-profile-bio)] text-muted-foreground mb-4 leading-relaxed max-w-2xl text-center md:text-left">
                    {profile.bio}
                  </p>
                )}

                {/* Meta Info */}
                <div className="flex items-center justify-center md:justify-start gap-4 text-[var(--fs-profile-meta)] text-muted-foreground mb-4 flex-wrap">
                  {profile.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {profile.location}
                    </div>
                  )}
                  {profile.pronouns && (
                    <div className="flex items-center gap-1">
                      <span className="text-xs">{profile.pronouns}</span>
                    </div>
                  )}
                  {profile.website && (
                    <div className="flex items-center gap-1">
                      <Globe className="h-4 w-4" />
                      <a 
                        href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} 
                        className="text-primary hover:underline flex items-center gap-1"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {profile.website.replace(/^https?:\/\//, '')}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                  {profile.contact_email && !isOwnProfile && (
                    <div className="flex items-center gap-1">
                      <Mail className="h-4 w-4" />
                      <a href={`mailto:${profile.contact_email}`} className="text-primary hover:underline">
                        Contact
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </div>
                </div>

                {/* Social Links */}
                {profile.social_links && Object.keys(profile.social_links).length > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    {Object.entries(profile.social_links).map(([platform, url]) => (
                      <Button
                        key={platform}
                        variant="outline"
                        size="sm"
                        className="h-8 px-3"
                        onClick={() => window.open(url as string, '_blank')}
                      >
                        {platform}
                        <ExternalLink className="h-3 w-3 ml-1" />
                      </Button>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */} 
              <div className="flex gap-2 flex-shrink-0 justify-center md:justify-start">
                {isOwnProfile ? (
                  <EditProfileModal profile={profile}>
                    <Button variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </EditProfileModal>
                ) : (
                  <>
                    <Button 
                      variant={connectionStatus?.isFollowing ? "outline" : "default"}
                      className={connectionStatus?.isFollowing 
                        ? "border-primary text-primary hover:bg-primary/10" 
                        : "bg-primary hover:bg-primary/90 text-primary-foreground"
                      }
                      onClick={onFollow}
                      disabled={followMutation?.isPending}
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      {connectionStatus?.isFollowing ? "Following" : "Follow"}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-primary text-primary hover:bg-primary/10"
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
                  <Button variant="outline">
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </ShareModal>

                {!isOwnProfile && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
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
  );
}
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
  const navigate = useNavigate();
  const { toast } = useToast();
  const { startDirectMessage, isLoading: isMessageLoading } = useDirectMessage();

  const handleShareProfile = async () => {
    const url = `${window.location.origin}/profile/${profile.user_id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${profile.display_name} - Artikin Profile`,
          text: profile.bio || `Check out ${profile.display_name}'s profile on Artikin`,
          url
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast({
        title: "Link copied",
        description: "Profile link has been copied to clipboard."
      });
    }
  };

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
      <div className="relative h-48 md:h-64 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 overflow-hidden">
        {profile.cover_url && (
          <img 
            src={profile.cover_url} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        {isOwnProfile && (
          <Button 
            variant="secondary" 
            size="sm" 
            className="absolute top-4 right-4 bg-background/80 backdrop-blur hover:bg-background"
            onClick={() => navigate('/profile/edit')}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Cover
          </Button>
        )}
      </div>

      {/* Profile Header */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 -mt-16 relative z-10">
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-background shadow-xl">
              <AvatarImage src={profile.avatar_url || ""} alt={profile.display_name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-4xl font-bold">
                {profile.display_name?.[0]?.toUpperCase() || profile.username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            {isOwnProfile && (
              <Button
                size="sm"
                variant="secondary"
                className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-background border shadow-md"
                onClick={() => navigate('/profile/edit')}
              >
                <Edit className="h-3 w-3" />
              </Button>
            )}
          </div>

          {/* Profile Info */}
          <div className="flex-1 pt-0 lg:pt-16">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
              <div className="flex-1">
                {/* Name and Role */}
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-[var(--fs-profile-name)] font-bold text-foreground">
                    {profile.display_name || profile.username}
                  </h1>
                  {profile.verified && (
                    <Shield className="h-5 w-5 text-primary fill-primary" />
                  )}
                </div>

                <div className="flex items-center gap-3 mb-3">
                  <p className="text-[var(--fs-profile-role)] text-muted-foreground">
                    {profile.role === 'artist' 
                      ? (profile.artform || 'Artist') 
                      : (profile.organization_type || 'Organization')
                    }
                  </p>
                  {profile.role && (
                    <Badge variant="secondary" className="capitalize text-xs">
                      {profile.role}
                    </Badge>
                  )}
                </div>

                {/* Headline */}
                {profile.headline && (
                  <p className="text-[var(--fs-profile-bio)] font-medium text-foreground mb-3">
                    {profile.headline}
                  </p>
                )}

                {/* Bio */}
                {profile.bio && (
                  <p className="text-[var(--fs-profile-bio)] text-muted-foreground mb-4 leading-relaxed max-w-2xl">
                    {profile.bio}
                  </p>
                )}

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-[var(--fs-profile-meta)] text-muted-foreground mb-4 flex-wrap">
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
              <div className="flex gap-2 flex-shrink-0">
                {isOwnProfile ? (
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/profile/edit')}
                  >
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
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleShareProfile}>
                      <Share className="h-4 w-4 mr-2" />
                      Share Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleExportContact}>
                      <Mail className="h-4 w-4 mr-2" />
                      Export Contact
                    </DropdownMenuItem>
                    {!isOwnProfile && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          Report User
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Block User
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
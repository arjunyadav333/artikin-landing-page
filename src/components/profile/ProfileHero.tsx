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
    <div className="relative bg-[#F9FAFB]">
      {/* Full-width Hero Section with 16:9 Cover */}
      <div className="relative w-full aspect-video bg-gradient-to-br from-primary/10 to-primary/5 overflow-hidden">
        {profile.cover_url && (
          <img 
            src={profile.cover_url} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        )}
        {/* Editable Cover Overlay */}
        {isOwnProfile && (
          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-200 group cursor-pointer">
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <Button variant="secondary" size="sm" className="bg-white/90 text-gray-900 shadow-lg">
                <Edit className="h-4 w-4 mr-2" />
                Change Cover
              </Button>
            </div>
          </div>
        )}
      </div>

          {/* Profile Section */}
      <div className="relative bg-white">
        <div className="w-full px-4 md:px-6 lg:px-8">
          {/* Profile Picture & Basic Info */}
          <div className="relative -mt-16 md:-mt-20 pb-6">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              {/* Left Side - Profile Info */}
              <div className="flex flex-col md:flex-row md:items-start gap-6 flex-1">
                {/* Profile Picture */}
                <div className="relative self-center md:self-start group">
                  <Avatar className="h-32 w-32 md:h-40 md:w-40 border-4 border-white shadow-lg ring-4 ring-white/50">
                    <AvatarImage src={profile.avatar_url || ""} alt={profile.display_name} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-4xl font-bold">
                      {profile.display_name?.[0]?.toUpperCase() || profile.username?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {/* Editable Profile Picture Overlay */}
                  {isOwnProfile && (
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-200 rounded-full group-hover:bg-black/20 cursor-pointer">
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <Edit className="h-5 w-5 text-white" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Info Section */}
                <div className="text-center md:text-left space-y-3 md:pt-4 flex-1">
                  {/* Full Name */}
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <h1 className="text-lg md:text-xl font-bold text-[#111827] tracking-tight">
                      {profile.display_name || profile.username}
                    </h1>
                    {profile.verified && (
                      <Shield className="h-5 w-5 text-primary fill-primary" />
                    )}
                  </div>

                  {/* Username */}
                  <p className="text-sm md:text-base text-gray-500 font-medium">
                    @{profile.username}
                  </p>

                  {/* Role & Location - Side by Side */}
                  <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 justify-center md:justify-start">
                    {/* Role */}
                    {profile.role && (
                      <div className="flex items-center gap-1 text-xs md:text-sm text-gray-600">
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 rounded-full px-2 py-0.5 text-xs font-medium">
                          {profile.role === 'artist' 
                            ? (profile.artform ? profile.artform.charAt(0).toUpperCase() + profile.artform.slice(1) : 'Artist')
                            : (profile.organization_type ? profile.organization_type.replace('_', ' ').charAt(0).toUpperCase() + profile.organization_type.replace('_', ' ').slice(1) : 'Organization')
                          }
                        </Badge>
                      </div>
                    )}

                    {/* Location */}
                    {profile.location && (
                      <div className="flex items-center gap-1 text-xs md:text-sm text-gray-500">
                        <MapPin className="h-3 w-3" />
                        <span>{profile.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Bio */}
                  {profile.bio && (
                    <div className="mt-3">
                      <p className="text-sm md:text-base text-[#111827] leading-relaxed max-w-2xl">
                        {profile.bio}
                      </p>
                    </div>
                  )}

                  {/* Website Link */}
                  {profile.website && (
                    <div className="mt-2">
                      <a 
                        href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} 
                        className="text-primary hover:underline flex items-center justify-center md:justify-start gap-1 text-sm font-medium"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Globe className="h-4 w-4" />
                        {profile.website.replace(/^https?:\/\//, '')}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side - 3-Dots Menu */}
              <div className="absolute top-0 right-0 md:relative md:top-auto md:right-auto">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-gray-600 hover:bg-gray-100 rounded-full">
                      <MoreHorizontal className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white border-gray-200 shadow-lg rounded-lg z-50">
                    {isOwnProfile ? (
                      <>
                        <DropdownMenuItem asChild>
                          <EditProfileModal profile={profile}>
                            <div className="flex items-center gap-2 cursor-pointer w-full">
                              <Edit className="h-4 w-4" />
                              Edit Profile
                            </div>
                          </EditProfileModal>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <ShareModal profile={profile}>
                            <div className="flex items-center gap-2 cursor-pointer w-full">
                              <Share className="h-4 w-4" />
                              Share Profile
                            </div>
                          </ShareModal>
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
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
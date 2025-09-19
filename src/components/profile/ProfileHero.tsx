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
  postsCount?: number;
  followers?: any[];
  following?: any[];
}

export function ProfileHero({ 
  profile, 
  isOwnProfile, 
  connectionStatus, 
  onFollow, 
  followMutation,
  postsCount = 0,
  followers = [],
  following = []
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
    <div className="relative w-full">
      {/* Modern Hero Background with Gradient */}
      <div className="relative h-48 md:h-64 lg:h-72 bg-gradient-to-br from-primary via-primary/90 to-primary/80 overflow-hidden">
        {profile.cover_url && (
          <>
            <img 
              src={profile.cover_url} 
              alt="Cover" 
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-primary/10" />
          </>
        )}
        {/* Floating Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 rounded-full border border-white/20"></div>
          <div className="absolute top-20 right-16 w-24 h-24 rounded-full border border-white/15"></div>
          <div className="absolute bottom-10 left-1/3 w-20 h-20 rounded-full border border-white/10"></div>
        </div>
        
        {/* Actions Menu */}
        <div className="absolute top-4 right-4 z-20">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="bg-white/90 backdrop-blur-sm border-white/50 text-gray-700 hover:bg-white shadow-lg rounded-xl">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border-gray-200 shadow-xl rounded-xl">
              {isOwnProfile && (
                <>
                  <EditProfileModal profile={profile}>
                    <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </DropdownMenuItem>
                  </EditProfileModal>
                  <DropdownMenuSeparator />
                </>
              )}
              <ShareModal profile={profile}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Share className="h-4 w-4 mr-2" />
                  Share Profile
                </DropdownMenuItem>
              </ShareModal>
              {!isOwnProfile && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleExportContact}>
                    <Mail className="h-4 w-4 mr-2" />
                    Export Contact
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Edit Cover Overlay for Own Profile */}
        {isOwnProfile && (
          <div className="absolute inset-0 bg-black/0 hover:bg-black/10 transition-all duration-300 group cursor-pointer">
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button variant="secondary" size="sm" className="bg-white/95 backdrop-blur-sm text-gray-900 shadow-xl rounded-xl border-white/50">
                <Edit className="h-4 w-4 mr-2" />
                Change Cover
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div className="relative -mt-20 md:-mt-24 mx-4 md:mx-6 lg:mx-8 mb-8">
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 md:p-8">
          {/* Profile Avatar & Main Info */}
          <div className="flex flex-col items-center text-center space-y-6">
            {/* Avatar */}
            <div className="relative group">
              <Avatar className="h-28 w-28 md:h-32 md:w-32 ring-4 ring-white shadow-2xl">
                <AvatarImage src={profile.avatar_url || ""} alt={profile.display_name} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-white text-3xl md:text-4xl font-bold">
                  {profile.display_name?.[0]?.toUpperCase() || profile.username?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              {isOwnProfile && (
                <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all duration-200 rounded-full group-hover:bg-black/20 cursor-pointer">
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <Edit className="h-5 w-5 text-white drop-shadow-lg" />
                  </div>
                </div>
              )}
            </div>

            {/* Name & Verification */}
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                  {profile.display_name || profile.username}
                </h1>
                {profile.verified && (
                  <Shield className="h-6 w-6 text-primary fill-primary" />
                )}
              </div>
              <p className="text-base md:text-lg text-gray-500 font-medium">
                @{profile.username}
              </p>
            </div>

            {/* Role Badge */}
            {profile.role && (
              <Badge variant="secondary" className="bg-gradient-to-r from-primary/10 to-primary/20 text-primary border-primary/30 rounded-full px-4 py-2 text-sm font-semibold shadow-sm">
                {profile.role === 'artist' 
                  ? (profile.artform ? profile.artform.charAt(0).toUpperCase() + profile.artform.slice(1) : 'Artist')
                  : (profile.organization_type ? profile.organization_type.replace('_', ' ').charAt(0).toUpperCase() + profile.organization_type.replace('_', ' ').slice(1) : 'Organization')
                }
              </Badge>
            )}
          </div>

          {/* Stats Row */}
          <div className="flex items-center justify-center gap-8 md:gap-12 mt-8 py-6 border-t border-gray-100">
            <div className="text-center cursor-pointer hover:text-primary transition-colors group">
              <div className="text-2xl md:text-3xl font-bold text-gray-900 group-hover:text-primary">{postsCount}</div>
              <div className="text-sm text-gray-500 font-medium">Posts</div>
            </div>
            <div className="text-center cursor-pointer hover:text-primary transition-colors group">
              <div className="text-2xl md:text-3xl font-bold text-gray-900 group-hover:text-primary">{followers.length}</div>
              <div className="text-sm text-gray-500 font-medium">Followers</div>
            </div>
            <div className="text-center cursor-pointer hover:text-primary transition-colors group">
              <div className="text-2xl md:text-3xl font-bold text-gray-900 group-hover:text-primary">{following.length}</div>
              <div className="text-sm text-gray-500 font-medium">Following</div>
            </div>
          </div>

          {/* Bio & Details */}
          <div className="space-y-4 pt-6 border-t border-gray-100">
            {/* Bio */}
            {profile.bio && (
              <div className="text-center">
                <p className="text-base md:text-lg text-gray-700 leading-relaxed max-w-2xl mx-auto">
                  {profile.bio}
                </p>
              </div>
            )}

            {/* Location & Website */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-6 text-sm">
              {/* Location */}
              {profile.location && (
                <div className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors">
                  <MapPin className="h-4 w-4" />
                  <span className="font-medium">{profile.location}</span>
                </div>
              )}

              {/* Website Link */}
              {profile.website && (
                <a 
                  href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} 
                  className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium group"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Globe className="h-4 w-4" />
                  <span>{profile.website.replace(/^https?:\/\//, '')}</span>
                  <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
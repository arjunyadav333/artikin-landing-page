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
    <div className="relative w-full bg-white">
      {/* Simple Cover Section */}
      <div className="relative h-48 md:h-56 bg-gray-50 overflow-hidden">
        {profile.cover_url ? (
          <img 
            src={profile.cover_url} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-gray-100 to-gray-200"></div>
        )}
        
        {/* Actions Menu */}
        <div className="absolute top-4 right-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="bg-white/95 backdrop-blur-sm border-gray-200 shadow-sm rounded-lg">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white border-gray-200 shadow-lg rounded-lg">
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

        {/* Edit Cover for Own Profile */}
        {isOwnProfile && (
          <div className="absolute inset-0 bg-black/0 hover:bg-black/5 transition-colors cursor-pointer group">
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="secondary" size="sm" className="bg-white shadow-md rounded-lg">
                <Edit className="h-4 w-4 mr-2" />
                Change Cover
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Profile Content */}
      <div className="px-4 md:px-6 lg:px-8 pb-8">
        <div className="flex flex-col items-center -mt-16">
          {/* Avatar */}
          <div className="relative group mb-4">
            <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
              <AvatarImage src={profile.avatar_url || ""} alt={profile.display_name} />
              <AvatarFallback className="bg-primary text-white text-3xl font-semibold">
                {profile.display_name?.[0]?.toUpperCase() || profile.username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            {isOwnProfile && (
              <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors rounded-full cursor-pointer group-hover:bg-black/20">
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Edit className="h-5 w-5 text-white" />
                </div>
              </div>
            )}
          </div>

          {/* Name & Info */}
          <div className="text-center space-y-3 max-w-2xl">
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {profile.display_name || profile.username}
              </h1>
              {profile.verified && (
                <Shield className="h-5 w-5 text-primary fill-primary" />
              )}
            </div>
            
            <p className="text-gray-500 text-lg">@{profile.username}</p>

            {/* Role Badge */}
            {profile.role && (
              <Badge variant="secondary" className="bg-gray-100 text-gray-700 rounded-full px-3 py-1">
                {profile.role === 'artist' 
                  ? (profile.artform ? profile.artform.charAt(0).toUpperCase() + profile.artform.slice(1) : 'Artist')
                  : (profile.organization_type ? profile.organization_type.replace('_', ' ').charAt(0).toUpperCase() + profile.organization_type.replace('_', ' ').slice(1) : 'Organization')
                }
              </Badge>
            )}

            {/* Bio */}
            {profile.bio && (
              <p className="text-gray-600 leading-relaxed mt-4">
                {profile.bio}
              </p>
            )}

            {/* Location & Website */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500 mt-4">
              {profile.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {profile.location}
                </div>
              )}
              {profile.website && (
                <a 
                  href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} 
                  className="flex items-center gap-1 text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Globe className="h-4 w-4" />
                  {profile.website.replace(/^https?:\/\//, '')}
                </a>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 pt-6 mt-6 border-t border-gray-100">
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">{postsCount}</div>
                <div className="text-sm text-gray-500">Posts</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">{followers.length}</div>
                <div className="text-sm text-gray-500">Followers</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-gray-900">{following.length}</div>
                <div className="text-sm text-gray-500">Following</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
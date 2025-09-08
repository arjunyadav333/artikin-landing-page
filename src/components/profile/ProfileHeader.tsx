import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Globe, 
  Edit, 
  Share, 
  MoreHorizontal,
  MessageSquare,
  Shield,
  Mail,
  ExternalLink,
  Flag,
  UserX
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Profile } from '@/hooks/useProfiles';
import { useToast } from '@/hooks/use-toast';

interface ProfileHeaderProps {
  profile: Profile;
  isOwnProfile: boolean;
}

export function ProfileHeader({ profile, isOwnProfile }: ProfileHeaderProps) {
  const { toast } = useToast();
  const [postsCount] = useState(12); // Mock data
  const [followersCount] = useState(1234);
  const [followingCount] = useState(567);

  const handleShareProfile = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Profile link copied",
      description: "The profile link has been copied to your clipboard."
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "Profile link copied to clipboard."
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-8">
      {/* Three dots menu */}
      <div className="flex justify-end mb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            {isOwnProfile ? (
              <>
                <DropdownMenuItem>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            ) : (
              <>
                <DropdownMenuItem>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}
            <DropdownMenuItem onClick={handleShareProfile}>
              <Share className="h-4 w-4 mr-2" />
              Share Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleCopyLink}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Copy Link
            </DropdownMenuItem>
            {!isOwnProfile && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Mail className="h-4 w-4 mr-2" />
                  Export Contact
                </DropdownMenuItem>
                <DropdownMenuItem className="text-orange-600">
                  <Flag className="h-4 w-4 mr-2" />
                  Report
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  <UserX className="h-4 w-4 mr-2" />
                  Block
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Avatar */}
      <div className="flex justify-center mb-4">
        <div className="relative group cursor-pointer">
          <Avatar className="w-24 h-24 ring-4 ring-white shadow-lg">
            <AvatarImage src={profile.avatar_url || ""} alt={profile.display_name} />
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold">
              {profile.display_name?.[0]?.toUpperCase() || profile.username?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          {isOwnProfile && (
            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors duration-200 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100">
              <Edit className="h-5 w-5 text-white" />
            </div>
          )}
        </div>
      </div>

      {/* Name & Verification */}
      <div className="text-center mb-2">
        <div className="flex items-center justify-center gap-2 mb-1">
          <h1 className="text-xl font-semibold text-gray-800">
            {profile.display_name || profile.username}
          </h1>
          {profile.verified && (
            <Shield className="h-5 w-5 text-primary fill-primary" />
          )}
        </div>
        <p className="text-sm text-gray-500 font-medium">
          @{profile.username}
        </p>
      </div>

      {/* Stats - Posts | Followers | Following */}
      <div className="flex justify-center gap-6 mb-4 text-sm">
        <div className="text-center cursor-pointer hover:text-primary transition-colors">
          <div className="font-bold text-gray-800">{postsCount}</div>
          <div className="text-gray-500">Posts</div>
        </div>
        <div className="text-center cursor-pointer hover:text-primary transition-colors">
          <div className="font-bold text-gray-800">{followersCount}</div>
          <div className="text-gray-500">Followers</div>
        </div>
        <div className="text-center cursor-pointer hover:text-primary transition-colors">
          <div className="font-bold text-gray-800">{followingCount}</div>
          <div className="text-gray-500">Following</div>
        </div>
      </div>

      {/* Role and Location side by side */}
      <div className="flex items-center justify-center gap-3 mb-4">
        {profile.role && (
          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs">
            {profile.role === 'artist' 
              ? (profile.artform ? profile.artform.charAt(0).toUpperCase() + profile.artform.slice(1) : 'Artist')
              : (profile.organization_type ? profile.organization_type.replace('_', ' ').charAt(0).toUpperCase() + profile.organization_type.replace('_', ' ').slice(1) : 'Organization')
            }
          </Badge>
        )}
        {profile.location && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <MapPin className="h-3 w-3" />
            {profile.location}
          </div>
        )}
      </div>

      {/* Bio */}
      {profile.bio && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 text-center leading-relaxed">
            {profile.bio}
          </p>
        </div>
      )}

      {/* Website Link */}
      {profile.website && (
        <div className="flex justify-center mb-4">
          <a 
            href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} 
            className="text-primary hover:underline flex items-center gap-1 text-sm font-medium"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Globe className="h-4 w-4" />
            {profile.website.replace(/^https?:\/\//, '')}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      )}

      {/* Edit Profile Button for owner */}
      {isOwnProfile && (
        <Button className="w-full rounded-2xl" variant="outline">
          <Edit className="h-4 w-4 mr-2" />
          Edit Profile
        </Button>
      )}
    </div>
  );
}
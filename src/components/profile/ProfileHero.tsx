import { useState, useRef } from 'react';
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
  Loader2,
  ArrowLeft,
  Pencil
} from 'lucide-react';
import { ImageCropModal } from './ImageCropModal';
import { useImageUpload } from '@/hooks/useImageUpload';
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
  const navigate = useNavigate();
  const { startDirectMessage, isLoading: isMessageLoading } = useDirectMessage();
  const { toast } = useToast();
  const { user } = useAuth();
  const { uploadImage, isUploading } = useImageUpload();
  
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  const [avatarCropModalOpen, setAvatarCropModalOpen] = useState(false);
  const [coverCropModalOpen, setCoverCropModalOpen] = useState(false);
  const [selectedAvatarImage, setSelectedAvatarImage] = useState<string>('');
  const [selectedCoverImage, setSelectedCoverImage] = useState<string>('');

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setSelectedAvatarImage(imageUrl);
    setAvatarCropModalOpen(true);
  };

  const handleCoverChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setSelectedCoverImage(imageUrl);
    setCoverCropModalOpen(true);
  };

  const handleAvatarCropComplete = async (croppedImage: Blob) => {
    if (!user) return;

    try {
      await uploadImage(croppedImage, {
        bucket: 'profile-pictures',
        userId: user.id,
        type: 'avatar',
        maxWidth: 800,
        maxHeight: 800,
      });
      setAvatarCropModalOpen(false);
      URL.revokeObjectURL(selectedAvatarImage);
    } catch (error) {
      console.error('Avatar upload error:', error);
    }
  };

  const handleCoverCropComplete = async (croppedImage: Blob) => {
    if (!user) return;

    try {
      await uploadImage(croppedImage, {
        bucket: 'cover-pictures',
        userId: user.id,
        type: 'cover',
        maxWidth: 1920,
        maxHeight: 640,
      });
      setCoverCropModalOpen(false);
      URL.revokeObjectURL(selectedCoverImage);
    } catch (error) {
      console.error('Cover upload error:', error);
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
        
        {/* Back Button */}
        <div className="absolute top-4 left-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={() => navigate(-1)}
            className="bg-white/95 backdrop-blur-sm border-gray-200 shadow-sm rounded-lg hover:bg-white"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>

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
                  <DropdownMenuItem 
                    onClick={() => startDirectMessage(profile.user_id)}
                    disabled={isMessageLoading(profile.user_id)}
                  >
                    {isMessageLoading(profile.user_id) ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <MessageSquare className="h-4 w-4 mr-2" />
                    )}
                    Message
                  </DropdownMenuItem>
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
          <>
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverChange}
            />
            <Button
              variant="secondary"
              size="icon"
              className="absolute bottom-4 right-4 h-10 w-10 rounded-full bg-white/95 backdrop-blur-sm shadow-lg hover:bg-white border-0"
              onClick={() => coverInputRef.current?.click()}
            >
              <Pencil className="h-4 w-4 text-gray-700" />
            </Button>
          </>
        )}
      </div>

      {/* Profile Content */}
      <div className="px-4 md:px-6 lg:px-8 pb-8">
        <div className="flex flex-col items-center -mt-16">
          {/* Avatar */}
          <div className="relative mb-4">
            <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
              <AvatarImage src={profile.avatar_url || ""} alt={profile.display_name} />
              <AvatarFallback className="bg-primary text-white text-3xl font-semibold">
                {profile.display_name?.[0]?.toUpperCase() || profile.username?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            {isOwnProfile && (
              <>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute bottom-1 right-1 h-8 w-8 rounded-full bg-white shadow-lg hover:bg-white border-0"
                  onClick={() => avatarInputRef.current?.click()}
                >
                  <Pencil className="h-3.5 w-3.5 text-gray-700" />
                </Button>
              </>
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
              <button 
                onClick={() => {
                  if (isOwnProfile) {
                    navigate('/connections?tab=followers');
                  }
                }}
                type="button"
                className={`text-center ${
                  isOwnProfile 
                    ? 'cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors' 
                    : 'cursor-default pointer-events-none'
                }`}
              >
                <div className="text-xl font-bold text-gray-900">{followers.length}</div>
                <div className="text-sm text-gray-500">Followers</div>
              </button>
              <button 
                onClick={() => {
                  if (isOwnProfile) {
                    navigate('/connections?tab=following');
                  }
                }}
                type="button"
                className={`text-center ${
                  isOwnProfile 
                    ? 'cursor-pointer hover:bg-gray-50 rounded-lg p-2 -m-2 transition-colors' 
                    : 'cursor-default pointer-events-none'
                }`}
              >
                <div className="text-xl font-bold text-gray-900">{following.length}</div>
                <div className="text-sm text-gray-500">Following</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Image Crop Modals */}
      <ImageCropModal
        open={avatarCropModalOpen}
        onClose={() => {
          setAvatarCropModalOpen(false);
          URL.revokeObjectURL(selectedAvatarImage);
        }}
        imageSrc={selectedAvatarImage}
        onCropComplete={handleAvatarCropComplete}
        aspectRatio={1}
        title="Crop Profile Picture"
        isUploading={isUploading}
      />

      <ImageCropModal
        open={coverCropModalOpen}
        onClose={() => {
          setCoverCropModalOpen(false);
          URL.revokeObjectURL(selectedCoverImage);
        }}
        imageSrc={selectedCoverImage}
        onCropComplete={handleCoverCropComplete}
        aspectRatio={3}
        title="Crop Cover Image"
        isUploading={isUploading}
      />
    </div>
  );
}
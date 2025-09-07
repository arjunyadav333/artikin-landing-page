import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { useUpdateProfile } from '@/hooks/useProfiles';
import { supabase } from '@/integrations/supabase/client';
import { Camera, X } from 'lucide-react';
import type { ProfileWithStats } from '@/hooks/useProfileByUsername';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileWithStats;
}

export function EditProfileModal({ isOpen, onClose, profile }: EditProfileModalProps) {
  const { toast } = useToast();
  const updateProfile = useUpdateProfile();
  const [isUploading, setIsUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    display_name: profile.display_name || '',
    full_name: profile.full_name || '',
    bio: profile.bio || '',
    location: profile.location || '',
    website: profile.website || '',
    headline: profile.headline || '',
    privacy: profile.privacy || 'public',
    avatar_url: profile.avatar_url || '',
    cover_url: profile.cover_url || ''
  });

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const artformOptions = [
    'actor', 'dancer', 'model', 'photographer', 'videographer', 
    'instrumentalist', 'singer', 'drawing', 'painting'
  ];

  const orgTypeOptions = [
    'director', 'producer', 'production_house', 'casting_agency', 
    'casting_director', 'event_management', 'individual_hirer', 
    'institution', 'others'
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const uploadFile = async (file: File, bucket: string): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${profile.user_id}/${Date.now()}.${fileExt}`;

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { upsert: true });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return publicUrl;
  };

  const handleFileUpload = async (file: File, type: 'avatar' | 'cover') => {
    if (file.size > (type === 'avatar' ? 5 : 10) * 1024 * 1024) {
      toast({
        title: "File too large",
        description: `${type === 'avatar' ? 'Profile' : 'Cover'} image must be less than ${type === 'avatar' ? '5MB' : '10MB'}`,
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      const bucket = type === 'avatar' ? 'profile-pictures' : 'cover-pictures';
      const url = await uploadFile(file, bucket);
      
      setFormData(prev => ({
        ...prev,
        [type === 'avatar' ? 'avatar_url' : 'cover_url']: url
      }));

      toast({
        title: "Image uploaded",
        description: `${type === 'avatar' ? 'Profile' : 'Cover'} image updated successfully`
      });
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateProfile.mutateAsync({
        ...formData,
        social_links: profile.social_links || {}
      });
      onClose();
    } catch (error) {
      console.error('Update error:', error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Cover Image */}
          <div className="space-y-2">
            <Label>Cover Image</Label>
            <div className="relative">
              <div className="w-full h-32 bg-muted rounded-lg overflow-hidden">
                {formData.cover_url ? (
                  <img
                    src={formData.cover_url}
                    alt="Cover"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-primary/10 to-primary/20" />
                )}
              </div>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="absolute bottom-2 right-2"
                onClick={() => coverInputRef.current?.click()}
                disabled={isUploading}
              >
                <Camera className="w-4 h-4 mr-1" />
                Change
              </Button>
              <input
                ref={coverInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'cover');
                }}
              />
            </div>
          </div>

          {/* Profile Image */}
          <div className="space-y-2">
            <Label>Profile Image</Label>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-20 h-20">
                  <AvatarImage src={formData.avatar_url} />
                  <AvatarFallback>
                    {formData.display_name?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="absolute -bottom-1 -right-1 w-8 h-8 p-0"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(file, 'avatar');
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name *</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => handleInputChange('display_name', e.target.value)}
                placeholder="Your display name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => handleInputChange('full_name', e.target.value)}
                placeholder="Your full name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="headline">Headline</Label>
            <Input
              id="headline"
              value={formData.headline}
              onChange={(e) => handleInputChange('headline', e.target.value)}
              placeholder="A brief headline about yourself"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              placeholder="Tell us about yourself..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="City, Country"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://yourwebsite.com"
                type="url"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="privacy">Privacy</Label>
            <Select value={formData.privacy} onValueChange={(value) => handleInputChange('privacy', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">Public Profile</SelectItem>
                <SelectItem value="private">Private Profile</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Private profiles are only visible to followers
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={updateProfile.isPending || isUploading}
            >
              {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
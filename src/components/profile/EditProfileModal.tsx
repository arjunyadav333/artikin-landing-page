import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Edit, 
  FileUp, 
  User, 
  MapPin, 
  Globe, 
  Phone, 
  Mail
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Profile, useUpdateProfile } from '@/hooks/useProfiles';
import { supabase } from '@/integrations/supabase/client';

interface EditProfileModalProps {
  profile: Profile;
  children?: React.ReactNode;
}

export function EditProfileModal({ profile, children }: EditProfileModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    display_name: profile.display_name || '',
    full_name: profile.full_name || '',
    username: profile.username || '',
    bio: profile.bio || '',
    headline: profile.headline || '',
    location: profile.location || '',
    website: profile.website || '',
    phone_number: profile.phone_number || '',
    contact_email: profile.contact_email || '',
    pronouns: profile.pronouns || '',
    role: profile.role || 'artist',
    artform: profile.artform || '',
    organization_type: profile.organization_type || ''
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { toast } = useToast();
  const updateProfile = useUpdateProfile();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const uploadImage = async (file: File, bucket: string, oldUrl?: string) => {
    // Validate file size (5MB for avatar, 10MB for cover)
    const maxSize = bucket === 'profile-pictures' ? 5 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error(`File size exceeds ${bucket === 'profile-pictures' ? '5MB' : '10MB'} limit`);
    }

    // Delete old file if exists
    if (oldUrl) {
      try {
        const oldPath = oldUrl.split('/').pop();
        if (oldPath) {
          await supabase.storage.from(bucket).remove([`${profile.user_id}/${oldPath}`]);
        }
      } catch (error) {
        console.error('Failed to delete old file:', error);
      }
    }

    // Upload new file with timestamp to prevent caching
    const fileExt = file.name.split('.').pop();
    const fileName = `${profile.user_id}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);
    
    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);
    
    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    try {
      let avatarUrl = profile.avatar_url;
      let coverUrl = profile.cover_url;

      // Upload avatar if changed
      if (avatarFile) {
        avatarUrl = await uploadImage(avatarFile, 'profile-pictures', profile.avatar_url);
      }

      // Upload cover if changed
      if (coverFile) {
        coverUrl = await uploadImage(coverFile, 'cover-pictures', profile.cover_url);
      }

      // Update profile
      await updateProfile.mutateAsync({
        ...formData,
        avatar_url: avatarUrl,
        cover_url: coverUrl,
        artform: formData.artform as any,
        organization_type: formData.organization_type as any
      });

      setIsOpen(false);
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated."
      });
    } catch (error: any) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const artforms = [
    'actor', 'dancer', 'model', 'photographer', 'videographer',
    'instrumentalist', 'singer', 'drawing', 'painting'
  ];

  const organizationTypes = [
    'director', 'producer', 'production_house', 'casting_agency',
    'casting_director', 'event_management', 'individual_hirer',
    'institution', 'others'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Upload */}
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage 
                src={avatarFile ? URL.createObjectURL(avatarFile) : profile.avatar_url || ""} 
                alt="Profile picture" 
              />
              <AvatarFallback className="text-lg">
                {formData.display_name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <Label htmlFor="avatar-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 text-sm text-primary hover:underline">
                  <FileUp className="h-4 w-4" />
                  Change Profile Picture
                </div>
              </Label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 5 * 1024 * 1024) {
                      toast({
                        title: "File too large",
                        description: "Avatar must be less than 5MB",
                        variant: "destructive"
                      });
                      return;
                    }
                    setAvatarFile(file);
                  }
                }}
              />
              <p className="text-xs text-muted-foreground mt-1">JPG, PNG up to 5MB</p>
            </div>
          </div>

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name *</Label>
              <Input
                id="display_name"
                value={formData.display_name}
                onChange={(e) => handleInputChange('display_name', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="@username"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Full Name</Label>
            <Input
              id="full_name"
              value={formData.full_name}
              onChange={(e) => handleInputChange('full_name', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="headline">Headline</Label>
            <Input
              id="headline"
              value={formData.headline}
              onChange={(e) => handleInputChange('headline', e.target.value)}
              placeholder="Professional headline"
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

          {/* Role Selection */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value) => handleInputChange('role', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="artist">Artist</SelectItem>
                  <SelectItem value="organization">Organization</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.role === 'artist' && (
              <div className="space-y-2">
                <Label htmlFor="artform">Art Form</Label>
                <Select 
                  value={formData.artform} 
                  onValueChange={(value) => handleInputChange('artform', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your art form" />
                  </SelectTrigger>
                  <SelectContent>
                    {artforms.map((artform) => (
                      <SelectItem key={artform} value={artform}>
                        {artform.charAt(0).toUpperCase() + artform.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.role === 'organization' && (
              <div className="space-y-2">
                <Label htmlFor="organization_type">Organization Type</Label>
                <Select 
                  value={formData.organization_type} 
                  onValueChange={(value) => handleInputChange('organization_type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization type" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizationTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="City, Country"
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pronouns">Pronouns</Label>
              <Input
                id="pronouns"
                value={formData.pronouns}
                onChange={(e) => handleInputChange('pronouns', e.target.value)}
                placeholder="they/them, she/her, he/him"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_email">Contact Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="contact_email"
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => handleInputChange('contact_email', e.target.value)}
                  placeholder="contact@email.com"
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone_number">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone_number"
                value={formData.phone_number}
                onChange={(e) => handleInputChange('phone_number', e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="pl-10"
              />
            </div>
          </div>

          {/* Cover Image Upload */}
          <div className="space-y-2">
            <Label htmlFor="cover-upload">Cover Image</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
              {coverFile || profile.cover_url ? (
                <div className="space-y-2">
                  {coverFile && (
                    <img 
                      src={URL.createObjectURL(coverFile)} 
                      alt="Cover preview" 
                      className="w-full h-32 object-cover rounded-md mx-auto"
                    />
                  )}
                  {profile.cover_url && !coverFile && (
                    <img 
                      src={profile.cover_url} 
                      alt="Current cover" 
                      className="w-full h-32 object-cover rounded-md mx-auto"
                    />
                  )}
                  <Label htmlFor="cover-upload" className="cursor-pointer text-sm text-primary hover:underline">
                    Change Cover Image
                  </Label>
                </div>
              ) : (
                <Label htmlFor="cover-upload" className="cursor-pointer">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <FileUp className="h-8 w-8" />
                    <div className="text-sm">
                      <span className="text-primary hover:underline">Click to upload</span> cover image
                    </div>
                    <p className="text-xs">Max 10MB</p>
                  </div>
                </Label>
              )}
              <input
                id="cover-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 10 * 1024 * 1024) {
                      toast({
                        title: "File too large",
                        description: "Cover image must be less than 10MB",
                        variant: "destructive"
                      });
                      return;
                    }
                    setCoverFile(file);
                  }
                }}
              />
            </div>
          </div>

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={uploading || updateProfile.isPending}
            >
              {uploading || updateProfile.isPending ? 'Updating...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
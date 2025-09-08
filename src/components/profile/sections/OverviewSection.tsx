import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Plus, 
  Edit, 
  Calendar, 
  MapPin, 
  Mail, 
  Globe, 
  Languages,
  User,
  Building,
  X,
  ExternalLink
} from 'lucide-react';
import { Profile } from '@/hooks/useProfiles';

import { AddButton } from '../ui/AddButton';
import { SocialLinksManager } from '../ui/SocialLinksManager';
import { LanguagesManager } from '../ui/LanguagesManager';
import { BodyFeaturesSection } from './BodyFeaturesSection';

interface OverviewSectionProps {
  profile: Profile;
  isOwnProfile: boolean;
}

export function OverviewSection({ profile, isOwnProfile }: OverviewSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile.full_name || profile.display_name || '',
    username: profile.username || '',
    location: profile.location || '',
    artform: profile.artform || '',
    organization_type: profile.organization_type || '',
    bio: profile.bio || '',
    contact_email: profile.contact_email || '',
    website: profile.website || '',
    dob: '', // Will be handled separately
    languages: [] as string[],
    social_links: profile.social_links || {}
  });

  const artforms = [
    'actor', 'dancer', 'model', 'photographer', 'videographer', 
    'instrumentalist', 'singer', 'drawing', 'painting'
  ];

  const organizationTypes = [
    'director', 'producer', 'production_house', 'casting_agency', 
    'casting_director', 'event_management', 'individual_hirer', 
    'institution', 'others'
  ];

  // Mock age calculation
  const age = 25; // This would be calculated from DOB

  const handleSave = () => {
    // Save logic here
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Basic Information Card */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold">Basic Information</CardTitle>
          {isOwnProfile && (
            <AddButton 
              onClick={() => setIsEditing(!isEditing)}
              icon={isEditing ? X : Edit}
              size="sm"
            />
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Full Name */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <User className="h-4 w-4" />
              Full Name
            </Label>
            {isEditing ? (
              <Input
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                placeholder="Enter your full name"
                className="rounded-2xl"
              />
            ) : (
              <p className="text-base text-gray-800">{profile.full_name || profile.display_name}</p>
            )}
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600">Username</Label>
            {isEditing ? (
              <Input
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                placeholder="Enter username"
                className="rounded-2xl"
              />
            ) : (
              <p className="text-base text-gray-800">@{profile.username}</p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location
            </Label>
            {isEditing ? (
              <Input
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="Enter your location"
                className="rounded-2xl"
              />
            ) : (
              <p className="text-base text-gray-800">{profile.location || 'Not specified'}</p>
            )}
          </div>

          {/* Role-specific field */}
          {profile.role === 'artist' && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Artform</Label>
              {isEditing ? (
                <select
                  value={formData.artform}
                  onChange={(e) => setFormData({...formData, artform: e.target.value})}
                  className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select an artform</option>
                  {artforms.map((artform) => (
                    <option key={artform} value={artform}>
                      {artform.charAt(0).toUpperCase() + artform.slice(1)}
                    </option>
                  ))}
                </select>
              ) : (
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {profile.artform ? profile.artform.charAt(0).toUpperCase() + profile.artform.slice(1) : 'Not specified'}
                </Badge>
              )}
            </div>
          )}

          {profile.role === 'organization' && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Building className="h-4 w-4" />
                Organization Type
              </Label>
              {isEditing ? (
                <select
                  value={formData.organization_type}
                  onChange={(e) => setFormData({...formData, organization_type: e.target.value})}
                  className="w-full rounded-2xl border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select organization type</option>
                  {organizationTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1)}
                    </option>
                  ))}
                </select>
              ) : (
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {profile.organization_type ? profile.organization_type.replace('_', ' ').charAt(0).toUpperCase() + profile.organization_type.replace('_', ' ').slice(1) : 'Not specified'}
                </Badge>
              )}
            </div>
          )}

          {/* Age */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Age
            </Label>
            {isEditing ? (
              <Input
                type="date"
                className="rounded-2xl"
                placeholder="Select date of birth"
              />
            ) : (
              <p className="text-base text-gray-800">{age} years old</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email
            </Label>
            {isEditing ? (
              <Input
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                placeholder="Enter your email"
                className="rounded-2xl"
              />
            ) : (
              <p className="text-base text-gray-800">{profile.contact_email || 'Not specified'}</p>
            )}
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600">Bio</Label>
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({...formData, bio: e.target.value})}
                  placeholder="Tell us about yourself..."
                  className="min-h-[100px] rounded-2xl"
                  maxLength={1000}
                />
                <div className="text-xs text-gray-500 text-right">
                  {formData.bio.length}/1000 characters
                </div>
              </div>
            ) : (
              <p className="text-base text-gray-800 leading-relaxed">
                {profile.bio || 'No bio added yet.'}
              </p>
            )}
          </div>

          {isEditing && (
            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} className="rounded-2xl">
                Save Changes
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(false)}
                className="rounded-2xl"
              >
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Languages Card */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Languages className="h-5 w-5" />
            Languages Known
          </CardTitle>
          {isOwnProfile && (
            <AddButton onClick={() => {}} />
          )}
        </CardHeader>
        <CardContent>
          <LanguagesManager isOwnProfile={isOwnProfile} />
        </CardContent>
      </Card>

      {/* Social Links Card */}
      <Card className="rounded-2xl shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Social Links
          </CardTitle>
          {isOwnProfile && (
            <AddButton onClick={() => {}} />
          )}
        </CardHeader>
        <CardContent>
          <SocialLinksManager 
            socialLinks={profile.social_links || {}}
            isOwnProfile={isOwnProfile}
          />
        </CardContent>
      </Card>

      {/* Body Features for Actors and Models */}
      {profile.role === 'artist' && (profile.artform === 'actor' || profile.artform === 'model') && (
        <BodyFeaturesSection profile={profile} isOwnProfile={isOwnProfile} />
      )}
    </div>
  );
}
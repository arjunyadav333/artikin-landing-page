import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, Edit, Plus, X, Instagram, Facebook, Twitter, Youtube, Globe, Linkedin } from 'lucide-react';
import { Profile } from '@/hooks/useProfiles';
import { format, differenceInYears } from 'date-fns';
import { cn } from '@/lib/utils';

interface OverviewSectionProps {
  profile: Profile;
  isOwnProfile: boolean;
}

interface SocialLink {
  id: string;
  type: string;
  url: string;
}

const ARTFORMS = [
  'actor', 'dancer', 'model', 'photographer', 'videographer', 
  'instrumentalist', 'singer', 'drawing', 'painting'
];

const ORGANIZATION_TYPES = [
  'director', 'producer', 'production_house', 'casting_agency', 
  'casting_director', 'event_management', 'individual_hirer', 'institution', 'others'
];

const LANGUAGES = [
  'Telugu', 'Hindi', 'English', 'Tamil', 'Kannada', 
  'Malayalam', 'Marathi', 'Punjabi'
];

const SOCIAL_TYPES = [
  { value: 'instagram', label: 'Instagram', icon: Instagram },
  { value: 'facebook', label: 'Facebook', icon: Facebook },
  { value: 'twitter', label: 'Twitter', icon: Twitter },
  { value: 'youtube', label: 'YouTube', icon: Youtube },
  { value: 'linkedin', label: 'LinkedIn', icon: Linkedin },
  { value: 'website', label: 'Website', icon: Globe },
  { value: 'custom', label: 'Custom', icon: Globe }
];

export function OverviewSection({ profile, isOwnProfile }: OverviewSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    full_name: profile.full_name || '',
    username: profile.username || '',
    location: profile.location || '',
    artform: profile.artform || '',
    organization_type: profile.organization_type || '',
    bio: profile.bio || '',
    contact_email: profile.contact_email || '',
    dob: null as Date | null,
    languages: [] as string[],
    custom_language: '',
    social_links: [] as SocialLink[]
  });
  const [showCalendar, setShowCalendar] = useState(false);

  const calculateAge = (dob: Date) => {
    return differenceInYears(new Date(), dob);
  };

  const addSocialLink = () => {
    const newLink: SocialLink = {
      id: Date.now().toString(),
      type: 'instagram',
      url: ''
    };
    setEditData(prev => ({
      ...prev,
      social_links: [...prev.social_links, newLink]
    }));
  };

  const removeSocialLink = (id: string) => {
    setEditData(prev => ({
      ...prev,
      social_links: prev.social_links.filter(link => link.id !== id)
    }));
  };

  const updateSocialLink = (id: string, field: 'type' | 'url', value: string) => {
    setEditData(prev => ({
      ...prev,
      social_links: prev.social_links.map(link =>
        link.id === id ? { ...link, [field]: value } : link
      )
    }));
  };

  const toggleLanguage = (language: string) => {
    setEditData(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
  };

  const addCustomLanguage = () => {
    if (editData.custom_language.trim()) {
      setEditData(prev => ({
        ...prev,
        languages: [...prev.languages, prev.custom_language.trim()],
        custom_language: ''
      }));
    }
  };

  const getSocialIcon = (type: string) => {
    const socialType = SOCIAL_TYPES.find(s => s.value === type);
    return socialType?.icon || Globe;
  };

  return (
    <div className="space-y-6">
      {/* Basic Information Card */}
      <Card className="rounded-2xl shadow-sm p-6 bg-white border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
          {isOwnProfile && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="gap-2"
            >
              <Edit className="h-4 w-4" />
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Full Name */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600">Full Name</Label>
            {isEditing ? (
              <Input
                value={editData.full_name}
                onChange={(e) => setEditData(prev => ({ ...prev, full_name: e.target.value }))}
                className="rounded-2xl"
                placeholder="Enter your full name"
              />
            ) : (
              <p className="text-base text-gray-800 font-medium">
                {profile.full_name || profile.display_name || 'Not specified'}
              </p>
            )}
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600">Username</Label>
            {isEditing ? (
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">@</span>
                <Input
                  value={editData.username}
                  onChange={(e) => setEditData(prev => ({ ...prev, username: e.target.value }))}
                  className="rounded-2xl pl-8"
                  placeholder="username"
                />
              </div>
            ) : (
              <p className="text-base text-gray-800">@{profile.username}</p>
            )}
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600">Location</Label>
            {isEditing ? (
              <Input
                value={editData.location}
                onChange={(e) => setEditData(prev => ({ ...prev, location: e.target.value }))}
                className="rounded-2xl"
                placeholder="Enter your location"
              />
            ) : (
              <p className="text-base text-gray-800">{profile.location || 'Not specified'}</p>
            )}
          </div>

          {/* Age & DOB */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600">Age</Label>
            {isEditing ? (
              <Popover open={showCalendar} onOpenChange={setShowCalendar}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal rounded-2xl",
                      !editData.dob && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {editData.dob ? format(editData.dob, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={editData.dob}
                    onSelect={(date) => {
                      setEditData(prev => ({ ...prev, dob: date }));
                      setShowCalendar(false);
                    }}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            ) : (
            <p className="text-base text-gray-800">
                Not specified
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2 md:col-span-2">
            <Label className="text-sm font-medium text-gray-600">Contact Email</Label>
            {isEditing ? (
              <Input
                type="email"
                value={editData.contact_email}
                onChange={(e) => setEditData(prev => ({ ...prev, contact_email: e.target.value }))}
                className="rounded-2xl"
                placeholder="Enter your email"
              />
            ) : (
              <p className="text-base text-gray-800">{profile.contact_email || 'Not specified'}</p>
            )}
          </div>
        </div>
      </Card>

      {/* Role & Artform Card */}
      <Card className="rounded-2xl shadow-sm p-6 bg-white border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Professional Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {profile.role === 'artist' ? (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Art Form</Label>
              {isEditing ? (
                <Select 
                  value={editData.artform} 
                  onValueChange={(value) => setEditData(prev => ({ ...prev, artform: value }))}
                >
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue placeholder="Select your artform" />
                  </SelectTrigger>
                  <SelectContent>
                    {ARTFORMS.map((artform) => (
                      <SelectItem key={artform} value={artform}>
                        {artform.charAt(0).toUpperCase() + artform.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-base text-gray-800">
                  {profile.artform ? profile.artform.charAt(0).toUpperCase() + profile.artform.slice(1) : 'Not specified'}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-600">Organization Type</Label>
              {isEditing ? (
                <Select 
                  value={editData.organization_type} 
                  onValueChange={(value) => setEditData(prev => ({ ...prev, organization_type: value }))}
                >
                  <SelectTrigger className="rounded-2xl">
                    <SelectValue placeholder="Select organization type" />
                  </SelectTrigger>
                  <SelectContent>
                    {ORGANIZATION_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-base text-gray-800">
                  {profile.organization_type ? 
                    profile.organization_type.replace('_', ' ').charAt(0).toUpperCase() + 
                    profile.organization_type.replace('_', ' ').slice(1) : 
                    'Not specified'
                  }
                </p>
              )}
            </div>
          )}

          {/* Languages */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600">Languages Known</Label>
            {isEditing ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  {LANGUAGES.map((language) => (
                    <div key={language} className="flex items-center space-x-2">
                      <Checkbox
                        id={language}
                        checked={editData.languages.includes(language)}
                        onCheckedChange={() => toggleLanguage(language)}
                      />
                      <Label htmlFor={language} className="text-sm">{language}</Label>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={editData.custom_language}
                    onChange={(e) => setEditData(prev => ({ ...prev, custom_language: e.target.value }))}
                    placeholder="Add other language"
                    className="rounded-2xl flex-1"
                    onKeyDown={(e) => e.key === 'Enter' && addCustomLanguage()}
                  />
                  <Button 
                    type="button" 
                    onClick={addCustomLanguage}
                    className="rounded-2xl px-4"
                    disabled={!editData.custom_language.trim()}
                  >
                    Add
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                <p className="text-base text-gray-800">Not specified</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Bio Card */}
      <Card className="rounded-2xl shadow-sm p-6 bg-white border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Bio</h2>
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editData.bio}
              onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
              className="rounded-2xl min-h-[120px] resize-none"
              placeholder="Tell us about yourself..."
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 text-right">
              {editData.bio.length}/1000 characters
            </p>
          </div>
        ) : (
          <p className="text-base text-gray-800 leading-relaxed">
            {profile.bio || 'No bio added yet'}
          </p>
        )}
      </Card>

      {/* Social Links Card */}
      <Card className="rounded-2xl shadow-sm p-6 bg-white border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Social Links</h2>
          {isOwnProfile && isEditing && (
            <Button
              onClick={addSocialLink}
              className="gap-2 rounded-2xl"
              size="sm"
            >
              <Plus className="h-4 w-4" />
              Add Link
            </Button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4">
            {editData.social_links.map((link) => (
              <div key={link.id} className="flex gap-3 items-end">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Select value={link.type} onValueChange={(value) => updateSocialLink(link.id, 'type', value)}>
                    <SelectTrigger className="rounded-2xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SOCIAL_TYPES.map((type) => {
                        const Icon = type.icon;
                        return (
                          <SelectItem key={type.value} value={type.value}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-4 w-4" />
                              {type.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <div className="md:col-span-2">
                    <Input
                      value={link.url}
                      onChange={(e) => updateSocialLink(link.id, 'url', e.target.value)}
                      placeholder="Enter URL"
                      className="rounded-2xl"
                    />
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removeSocialLink(link.id)}
                  className="rounded-2xl"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            {editData.social_links.length === 0 && (
              <p className="text-gray-500 text-center py-4">No social links added yet</p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {profile.social_links && Object.keys(profile.social_links).length > 0 ? (
              Object.entries(profile.social_links).map(([type, url], index) => {
                const Icon = getSocialIcon(type);
                return (
                  <div key={index} className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-gray-600" />
                    <a 
                      href={url as string} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {url as string}
                    </a>
                  </div>
                );
              })
            ) : (
              <p className="text-gray-500 text-center py-4">No social links added yet</p>
            )}
          </div>
        )}
      </Card>

      {isEditing && (
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setIsEditing(false)} className="rounded-2xl">
            Cancel
          </Button>
          <Button className="rounded-2xl">
            Save Changes
          </Button>
        </div>
      )}
    </div>
  );
}
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Edit2, Save, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Profile } from '@/hooks/useProfiles';

interface BasicInfoCardProps {
  profile: Profile;
  isOwnProfile: boolean;
}

// Mock artforms - replace with actual data from auth
const artforms = [
  'actor', 'dancer', 'model', 'photographer', 'videographer', 
  'instrumentalist', 'singer', 'drawing', 'painting'
];

const organizationTypes = [
  'director', 'producer', 'production_house', 'casting_agency', 
  'casting_director', 'event_management', 'individual_hirer', 
  'institution', 'others'
];

const languages = [
  'Telugu', 'Hindi', 'English', 'Tamil', 'Kannada', 
  'Malayalam', 'Marathi', 'Punjabi'
];

export function BasicInfoCard({ profile, isOwnProfile }: BasicInfoCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile.full_name || '',
    username: profile.username || '',
    location: profile.location || '',
    bio: profile.bio || '',
    contact_email: profile.contact_email || '',
    artform: profile.artform || '',
    organization_type: profile.organization_type || '',
    // Mock DOB - replace with actual
    dob: new Date('1990-01-01'),
    languages: ['English', 'Hindi'] // Mock data
  });

  const handleSave = () => {
    // TODO: Implement save logic
    console.log('Saving basic info:', formData);
    setIsEditing(false);
  };

  const calculateAge = (birthDate: Date) => {
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  return (
    <Card className="bg-white rounded-2xl shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-xl font-semibold">Basic Information</CardTitle>
        {isOwnProfile && (
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button size="sm" onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </Button>
                <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button size="sm" variant="outline" onClick={() => setIsEditing(true)}>
                <Edit2 className="h-4 w-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="space-y-6 p-6 pt-0">
        {isEditing ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="full_name" className="text-sm text-gray-600">Full Name</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                className="border rounded-lg"
              />
            </div>

            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm text-gray-600">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                className="border rounded-lg"
                placeholder="@username"
              />
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm text-gray-600">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="border rounded-lg"
                placeholder="City, State"
              />
            </div>

            {/* Age/DOB */}
            <div className="space-y-2">
              <Label className="text-sm text-gray-600">Date of Birth</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal border rounded-lg",
                      !formData.dob && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dob ? format(formData.dob, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.dob}
                    onSelect={(date) => date && setFormData(prev => ({ ...prev, dob: date }))}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-gray-600">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.contact_email}
                onChange={(e) => setFormData(prev => ({ ...prev, contact_email: e.target.value }))}
                className="border rounded-lg"
                placeholder="your@email.com"
              />
            </div>

            {/* Artform (Artists) or Organization Type */}
            <div className="space-y-2">
              <Label className="text-sm text-gray-600">
                {profile.role === 'artist' ? 'Artform' : 'Organization Type'}
              </Label>
              <Select 
                value={profile.role === 'artist' ? formData.artform : formData.organization_type}
                onValueChange={(value) => {
                  if (profile.role === 'artist') {
                    setFormData(prev => ({ ...prev, artform: value }));
                  } else {
                    setFormData(prev => ({ ...prev, organization_type: value }));
                  }
                }}
              >
                <SelectTrigger className="border rounded-lg">
                  <SelectValue placeholder={
                    profile.role === 'artist' 
                      ? "Select artform" 
                      : "Select organization type"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {(profile.role === 'artist' ? artforms : organizationTypes).map((option) => (
                    <SelectItem key={option} value={option}>
                      {option.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bio */}
            <div className="md:col-span-2 space-y-2">
              <Label htmlFor="bio" className="text-sm text-gray-600">Bio (max 1000 characters)</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                className="border rounded-lg resize-none"
                rows={4}
                maxLength={1000}
                placeholder="Tell us about yourself..."
              />
              <div className="text-xs text-gray-400 text-right">
                {formData.bio.length}/1000
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Display Mode */}
            <div>
              <h4 className="text-sm text-gray-600 font-medium mb-1">Full Name</h4>
              <p className="text-base text-gray-800">{profile.full_name || 'Not provided'}</p>
            </div>

            <div>
              <h4 className="text-sm text-gray-600 font-medium mb-1">Username</h4>
              <p className="text-base text-gray-800">@{profile.username}</p>
            </div>

            <div>
              <h4 className="text-sm text-gray-600 font-medium mb-1">Location</h4>
              <p className="text-base text-gray-800">{profile.location || 'Not provided'}</p>
            </div>

            <div>
              <h4 className="text-sm text-gray-600 font-medium mb-1">Age</h4>
              <p className="text-base text-gray-800">{calculateAge(formData.dob)} years old</p>
            </div>

            <div>
              <h4 className="text-sm text-gray-600 font-medium mb-1">Email</h4>
              <p className="text-base text-gray-800">{profile.contact_email || 'Not provided'}</p>
            </div>

            <div>
              <h4 className="text-sm text-gray-600 font-medium mb-1">
                {profile.role === 'artist' ? 'Artform' : 'Organization Type'}
              </h4>
              <p className="text-base text-gray-800 capitalize">
                {profile.role === 'artist' 
                  ? (profile.artform || 'Not specified')
                  : (profile.organization_type || 'Not specified')
                }
              </p>
            </div>

            {profile.bio && (
              <div className="md:col-span-2">
                <h4 className="text-sm text-gray-600 font-medium mb-1">Bio</h4>
                <p className="text-base text-gray-800 leading-relaxed">{profile.bio}</p>
              </div>
            )}

            <div className="md:col-span-2">
              <h4 className="text-sm text-gray-600 font-medium mb-2">Languages</h4>
              <div className="flex flex-wrap gap-2">
                {formData.languages.map((lang) => (
                  <span 
                    key={lang}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {lang}
                  </span>
                ))}
              </div>
            </div>

            {/* Body Features - Only for Actors & Models */}
            {profile.role === 'artist' && (profile.artform === 'actor' || profile.artform === 'model') && (
              <div className="md:col-span-2 space-y-4">
                <div className="border-t pt-6">
                  <h4 className="text-sm text-gray-600 font-medium mb-4">Body Features</h4>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Eyes</div>
                      <div className="font-medium text-gray-800">Brown</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Hair</div>
                      <div className="font-medium text-gray-800">Black</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Skin</div>
                      <div className="font-medium text-gray-800">Medium</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Height</div>
                      <div className="font-medium text-gray-800">175 cm</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600 mb-1">Weight</div>
                      <div className="font-medium text-gray-800">68 kg</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
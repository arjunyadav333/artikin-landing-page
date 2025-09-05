import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MapPin, 
  Globe, 
  Calendar, 
  Mail, 
  Phone,
  ExternalLink,
  Edit
} from 'lucide-react';
import { Profile } from '@/hooks/useProfiles';
import { useNavigate } from 'react-router-dom';

interface AboutSectionProps {
  profile: Profile;
  isOwnProfile: boolean;
}

export function AboutSection({ profile, isOwnProfile }: AboutSectionProps) {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Bio */}
      {profile.bio && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
          </CardContent>
        </Card>
      )}

      {/* Contact Information */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Contact Information</CardTitle>
          {isOwnProfile && (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => navigate('/profile/edit')}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {profile.location && (
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{profile.location}</span>
            </div>
          )}
          
          {profile.website && (
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <a 
                href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline flex items-center gap-1"
              >
                {profile.website.replace(/^https?:\/\//, '')}
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          {profile.contact_email && (isOwnProfile || !profile.contact_email.includes('@')) && (
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a href={`mailto:${profile.contact_email}`} className="text-primary hover:underline">
                {profile.contact_email}
              </a>
            </div>
          )}

          {profile.phone_number && isOwnProfile && (
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{profile.phone_number}</span>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>Joined {new Date(profile.created_at).toLocaleDateString('en-US', { 
              month: 'long', 
              year: 'numeric' 
            })}</span>
          </div>
        </CardContent>
      </Card>

      {/* Professional Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Professional Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Role</h4>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="capitalize">
                {profile.role}
              </Badge>
              {profile.role === 'artist' && profile.artform && (
                <Badge variant="outline">{profile.artform}</Badge>
              )}
              {profile.role === 'organization' && profile.organization_type && (
                <Badge variant="outline">{profile.organization_type}</Badge>
              )}
            </div>
          </div>

          {profile.headline && (
            <div>
              <h4 className="font-medium mb-2">Headline</h4>
              <p className="text-muted-foreground">{profile.headline}</p>
            </div>
          )}

          {profile.pronouns && (
            <div>
              <h4 className="font-medium mb-2">Pronouns</h4>
              <p className="text-muted-foreground">{profile.pronouns}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Social Links */}
      {profile.social_links && Object.keys(profile.social_links).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Social Links</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {Object.entries(profile.social_links).map(([platform, url]) => (
                <Button
                  key={platform}
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(url as string, '_blank')}
                  className="flex items-center gap-2"
                >
                  {platform}
                  <ExternalLink className="h-3 w-3" />
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
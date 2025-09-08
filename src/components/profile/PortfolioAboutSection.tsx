import { Profile } from '@/hooks/useProfiles';
import { BasicInfoCard } from './cards/BasicInfoCard';
import { ContactSocialCard } from './cards/ContactSocialCard';
import { PortfolioMediaCard } from './cards/PortfolioMediaCard';
import { CertificatesCard } from './cards/CertificatesCard';
import { AwardsCard } from './cards/AwardsCard';
import { ProjectsCard } from './cards/ProjectsCard';
import { BodyFeaturesCard } from './cards/BodyFeaturesCard';

interface PortfolioAboutSectionProps {
  profile: Profile;
  isOwnProfile: boolean;
  portfolios?: any[];
  portfoliosLoading?: boolean;
}

export function PortfolioAboutSection({ 
  profile, 
  isOwnProfile, 
  portfolios = [],
  portfoliosLoading = false 
}: PortfolioAboutSectionProps) {
  // Check if user is actor or model for Body Features section
  const showBodyFeatures = profile.role === 'artist' && 
    (profile.artform === 'actor' || profile.artform === 'model');

  return (
    <div className="space-y-6">
      {/* Basic Information Card */}
      <BasicInfoCard profile={profile} isOwnProfile={isOwnProfile} />
      
      {/* Contact & Social Card */}
      <ContactSocialCard profile={profile} isOwnProfile={isOwnProfile} />
      
      {/* Portfolio & Media Card */}
      <PortfolioMediaCard 
        profile={profile}
        isOwnProfile={isOwnProfile}
        portfolios={portfolios}
        portfoliosLoading={portfoliosLoading}
      />
      
      {/* Certificates Card */}
      <CertificatesCard profile={profile} isOwnProfile={isOwnProfile} />
      
      {/* Awards Card */}
      <AwardsCard profile={profile} isOwnProfile={isOwnProfile} />
      
      {/* Past Projects Card */}
      <ProjectsCard profile={profile} isOwnProfile={isOwnProfile} />
      
      {/* Body Features Card - Only for Actors & Models */}
      {showBodyFeatures && (
        <BodyFeaturesCard profile={profile} isOwnProfile={isOwnProfile} />
      )}
    </div>
  );
}
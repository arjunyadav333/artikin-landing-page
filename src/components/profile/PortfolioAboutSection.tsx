import { Profile } from '@/hooks/useProfiles';
import { BasicInfoCard } from './cards/BasicInfoCard';
import { ContactSocialCard } from './cards/ContactSocialCard';
import { CertificatesCard } from './cards/CertificatesCard';
import { AwardsCard } from './cards/AwardsCard';
import { ProjectsCard } from './cards/ProjectsCard';
import { MediaGallery } from './components/MediaGallery';

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
  return (
    <div className="space-y-6">
      {/* Basic Information Card (includes Body Features for actors/models) */}
      <BasicInfoCard profile={profile} isOwnProfile={isOwnProfile} />
      
      {/* Contact & Social Card */}
      <ContactSocialCard profile={profile} isOwnProfile={isOwnProfile} />
      
      {/* Certificates Card */}
      <CertificatesCard profile={profile} isOwnProfile={isOwnProfile} />
      
      {/* Awards Card */}
      <AwardsCard profile={profile} isOwnProfile={isOwnProfile} />
      
      {/* Past Projects Card */}
      <ProjectsCard profile={profile} isOwnProfile={isOwnProfile} />
      
      {/* Portfolio & Media Gallery (thumbnail grid under Past Projects) */}
      <MediaGallery 
        profile={profile}
        isOwnProfile={isOwnProfile}
        portfolios={portfolios}
        portfoliosLoading={portfoliosLoading}
      />
    </div>
  );
}
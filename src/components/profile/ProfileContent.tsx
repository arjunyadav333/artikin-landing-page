import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Profile } from '@/hooks/useProfiles';
import { OverviewSection } from './sections/OverviewSection';
import { PortfolioSection } from './sections/PortfolioSection';
import { ProjectsSection } from './sections/ProjectsSection';
import { CertificatesSection } from './sections/CertificatesSection';
import { AwardsSection } from './sections/AwardsSection';
import { MediaSection } from './sections/MediaSection';

interface ProfileContentProps {
  profile: Profile;
  isOwnProfile: boolean;
}

export function ProfileContent({ profile, isOwnProfile }: ProfileContentProps) {
  const [activeTab, setActiveTab] = useState('overview');

  // Define tabs based on role
  const tabs = profile.role === 'artist' 
    ? [
        { value: 'overview', label: 'Overview' },
        { value: 'portfolio', label: 'Portfolio' },
        { value: 'projects', label: 'Projects' },
        { value: 'certificates', label: 'Certificates' },
        { value: 'awards', label: 'Awards' },
        { value: 'media', label: 'Media' }
      ]
    : [
        { value: 'overview', label: 'Overview' },
        { value: 'about', label: 'About' },
        { value: 'projects', label: 'Projects' },
        { value: 'certificates', label: 'Certificates' },
        { value: 'awards', label: 'Awards' },
        { value: 'media', label: 'Media' }
      ];

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Responsive scrollable tab list */}
        <div className="bg-white rounded-2xl shadow-sm p-1 mb-6 overflow-x-auto">
          <TabsList className="grid w-full grid-cols-6 bg-transparent h-auto p-0 gap-1">
            {tabs.map((tab) => (
              <TabsTrigger 
                key={tab.value} 
                value={tab.value} 
                className="py-3 px-4 text-sm font-medium rounded-xl transition-all data-[state=active]:bg-primary data-[state=active]:text-white data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:bg-gray-50 whitespace-nowrap"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Tab Content */}
        <TabsContent value="overview" className="space-y-6 m-0">
          <OverviewSection profile={profile} isOwnProfile={isOwnProfile} />
        </TabsContent>

        {profile.role === 'artist' && (
          <TabsContent value="portfolio" className="space-y-6 m-0">
            <PortfolioSection profile={profile} isOwnProfile={isOwnProfile} />
          </TabsContent>
        )}

        {profile.role === 'organization' && (
          <TabsContent value="about" className="space-y-6 m-0">
            <OverviewSection profile={profile} isOwnProfile={isOwnProfile} />
          </TabsContent>
        )}

        <TabsContent value="projects" className="space-y-6 m-0">
          <ProjectsSection profile={profile} isOwnProfile={isOwnProfile} />
        </TabsContent>

        <TabsContent value="certificates" className="space-y-6 m-0">
          <CertificatesSection profile={profile} isOwnProfile={isOwnProfile} />
        </TabsContent>

        <TabsContent value="awards" className="space-y-6 m-0">
          <AwardsSection profile={profile} isOwnProfile={isOwnProfile} />
        </TabsContent>

        <TabsContent value="media" className="space-y-6 m-0">
          <MediaSection profile={profile} isOwnProfile={isOwnProfile} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Profile } from '@/hooks/useProfiles';
import { useSearchParams } from 'react-router-dom';
import { OverviewSection } from './sections/OverviewSection';
import { PortfolioSection } from './sections/PortfolioSection';
import { ProjectsSection } from './sections/ProjectsSection';
import { CertificatesSection } from './sections/CertificatesSection';
import { AwardsSection } from './sections/AwardsSection';
import { MediaSection } from './sections/MediaSection';

interface ProfileTabsProps {
  profile: Profile;
  isOwnProfile: boolean;
  posts?: any[];
  postsLoading?: boolean;
  portfolios?: any[];
  portfoliosLoading?: boolean;
}

export function ProfileTabs({ 
  profile, 
  isOwnProfile, 
  posts = [], 
  postsLoading = false,
  portfolios = [],
  portfoliosLoading = false
}: ProfileTabsProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  const handleTabChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'overview') {
      newParams.delete('tab');
    } else {
      newParams.set('tab', value);
    }
    setSearchParams(newParams);
  };

  // Tab configuration for both artists and organizations
  const tabsConfig = [
    { value: 'overview', label: 'Overview' },
    { value: 'portfolio', label: profile.role === 'artist' ? 'Portfolio' : 'About' },
    { value: 'projects', label: 'Projects' },
    { value: 'certificates', label: 'Certificates' },
    { value: 'awards', label: 'Awards' },
    { value: 'media', label: 'Media' }
  ];

  return (
    <div className="bg-white">
      <div className="w-full px-4 md:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          {/* Clean Tab Navigation */}
          <div className="border-b border-gray-200 mb-6 overflow-x-auto">
            <TabsList className="inline-flex w-full min-w-max bg-transparent h-auto p-0 gap-0">
              {tabsConfig.map((tab) => (
                <TabsTrigger 
                  key={tab.value} 
                  value={tab.value} 
                  className="relative py-4 px-6 text-sm font-semibold rounded-none border-b-2 border-transparent transition-all duration-200 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-gray-900 hover:bg-gray-50/50 whitespace-nowrap"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Tab Content */}
          <div className="pb-8">
            <TabsContent value="overview" className="space-y-6 m-0">
              <OverviewSection profile={profile} isOwnProfile={isOwnProfile} />
            </TabsContent>

            <TabsContent value="portfolio" className="space-y-6 m-0">
              <PortfolioSection profile={profile} isOwnProfile={isOwnProfile} />
            </TabsContent>

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
          </div>
        </Tabs>
      </div>
    </div>
  );
}
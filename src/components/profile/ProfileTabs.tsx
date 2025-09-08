import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PostsGrid } from '@/components/profile/posts-grid';
import { PortfolioGrid } from '@/components/profile/portfolio-grid';
import { AboutSection } from '@/components/profile/AboutSection';
import { Profile } from '@/hooks/useProfiles';
import { useSearchParams } from 'react-router-dom';

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
  const activeTab = searchParams.get('tab') || 'posts';

  const handleTabChange = (value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value === 'posts') {
      newParams.delete('tab');
    } else {
      newParams.set('tab', value);
    }
    setSearchParams(newParams);
  };

  // Role-based tab configuration
  const tabsConfig = profile.role === 'artist' 
    ? [
        { value: 'posts', label: 'Posts' },
        { value: 'portfolio', label: 'Portfolio' }
      ]
    : [
        { value: 'posts', label: 'Posts' },
        { value: 'about', label: 'About' }
      ];

  return (
    <div className="bg-white">
      <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          {/* Clean Tab Navigation */}
          <div className="border-b border-[#E5E7EB] mb-6">
            <TabsList className="grid w-full grid-cols-2 bg-transparent h-auto p-0 gap-0">
              {tabsConfig.map((tab) => (
                <TabsTrigger 
                  key={tab.value} 
                  value={tab.value} 
                  className="relative py-4 px-6 text-sm font-semibold rounded-none border-b-2 border-transparent transition-all duration-200 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-[#111827] hover:bg-gray-50/50"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* Tab Content */}
          <div className="pb-8">
            <TabsContent value="posts" className="space-y-6 m-0">
              <PostsGrid posts={posts} isLoading={postsLoading} />
            </TabsContent>

            {profile.role === 'artist' && (
              <TabsContent value="portfolio" className="space-y-6 m-0">
                <PortfolioGrid 
                  portfolios={portfolios}
                  isLoading={portfoliosLoading}
                  isOwnProfile={isOwnProfile}
                />
              </TabsContent>
            )}

            {profile.role === 'organization' && (
              <TabsContent value="about" className="space-y-6 m-0">
                <AboutSection profile={profile} isOwnProfile={isOwnProfile} />
              </TabsContent>
            )}
          </div>
        </Tabs>
      </div>
    </div>
  );
}
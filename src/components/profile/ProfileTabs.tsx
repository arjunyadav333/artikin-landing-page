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
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-6 md:mb-8">
        {tabsConfig.map((tab) => (
          <TabsTrigger 
            key={tab.value} 
            value={tab.value} 
            className="text-sm font-medium"
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="posts" className="space-y-4 md:space-y-6">
        <PostsGrid posts={posts} isLoading={postsLoading} />
      </TabsContent>

      {profile.role === 'artist' && (
        <TabsContent value="portfolio" className="space-y-4 md:space-y-6">
          <PortfolioGrid 
            portfolios={portfolios}
            isLoading={portfoliosLoading}
            isOwnProfile={isOwnProfile}
          />
        </TabsContent>
      )}

      {profile.role === 'organization' && (
        <TabsContent value="about" className="space-y-4 md:space-y-6">
          <AboutSection profile={profile} isOwnProfile={isOwnProfile} />
        </TabsContent>
      )}
    </Tabs>
  );
}
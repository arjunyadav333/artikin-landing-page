import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PostsGrid } from '@/components/profile/posts-grid';
import { PortfolioGrid } from '@/components/profile/portfolio-grid';
import { AboutSection } from '@/components/profile/AboutSection';
import type { ProfileWithStats } from '@/hooks/useProfileByUsername';
import { useSearchParams } from 'react-router-dom';

interface ProfileTabsProps {
  profile: ProfileWithStats;
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

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
      <TabsList className="grid w-full grid-cols-4 mb-8">
        <TabsTrigger value="posts" className="text-sm font-medium">
          All Posts
        </TabsTrigger>
        <TabsTrigger value="portfolio" className="text-sm font-medium">
          Portfolio
        </TabsTrigger>
        <TabsTrigger value="about" className="text-sm font-medium">
          About
        </TabsTrigger>
        <TabsTrigger value="activity" className="text-sm font-medium">
          Activity
        </TabsTrigger>
      </TabsList>

      <TabsContent value="posts" className="space-y-6">
        <PostsGrid posts={posts} isLoading={postsLoading} />
      </TabsContent>

      <TabsContent value="portfolio" className="space-y-6">
        <PortfolioGrid 
          portfolios={portfolios}
          isLoading={portfoliosLoading}
          isOwnProfile={isOwnProfile}
        />
      </TabsContent>

      <TabsContent value="about" className="space-y-6">
        <AboutSection profile={profile} isOwnProfile={isOwnProfile} />
      </TabsContent>

      <TabsContent value="activity" className="space-y-6">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-foreground mb-2">Activity Feed</h3>
          <p className="text-muted-foreground">Recent activity will appear here</p>
        </div>
      </TabsContent>
    </Tabs>
  );
}
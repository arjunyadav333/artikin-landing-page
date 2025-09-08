import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PostsGrid } from '@/components/profile/posts-grid';
import { PortfolioAboutSection } from '@/components/profile/PortfolioAboutSection';
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

  // Two-tab configuration: Posts and Portfolio/About
  const secondTabLabel = profile.role === 'artist' ? 'Portfolio' : 'About';
  const secondTabValue = profile.role === 'artist' ? 'portfolio' : 'about';

  return (
    <div className="bg-white">
      <div className="w-full px-4 md:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          {/* Two-Tab Navigation */}
          <div className="border-b border-[#E5E7EB] mb-6">
            <TabsList className="grid w-full grid-cols-2 bg-transparent h-auto p-0 gap-0">
              <TabsTrigger 
                value="posts" 
                className="relative py-4 px-6 text-sm font-semibold rounded-none border-b-2 border-transparent transition-all duration-200 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-[#111827] hover:bg-gray-50/50"
              >
                Posts
              </TabsTrigger>
              <TabsTrigger 
                value={secondTabValue}
                className="relative py-4 px-6 text-sm font-semibold rounded-none border-b-2 border-transparent transition-all duration-200 data-[state=active]:border-primary data-[state=active]:text-primary data-[state=inactive]:text-gray-500 data-[state=inactive]:hover:text-[#111827] hover:bg-gray-50/50"
              >
                {secondTabLabel}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content */}
          <div className="pb-8">
            <TabsContent value="posts" className="space-y-6 m-0">
              <PostsGrid posts={posts} isLoading={postsLoading} />
            </TabsContent>

            <TabsContent value={secondTabValue} className="space-y-6 m-0">
              <PortfolioAboutSection 
                profile={profile}
                isOwnProfile={isOwnProfile}
                portfolios={portfolios}
                portfoliosLoading={portfoliosLoading}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
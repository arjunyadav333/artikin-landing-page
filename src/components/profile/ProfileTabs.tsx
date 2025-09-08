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
    <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        {/* Modern Tab Navigation */}
        <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-2 mb-8">
          <TabsList className="grid w-full grid-cols-2 bg-transparent gap-2 h-auto p-0">
            {tabsConfig.map((tab) => (
              <TabsTrigger 
                key={tab.value} 
                value={tab.value} 
                className="relative rounded-xl py-3 px-6 text-sm font-semibold transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-primary data-[state=active]:to-primary/90 data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg hover:bg-muted/50 data-[state=inactive]:text-muted-foreground data-[state=inactive]:hover:text-foreground"
              >
                <span className="relative z-10">{tab.label}</span>
                {/* Active indicator glow */}
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-primary/20 to-primary/10 opacity-0 data-[state=active]:opacity-100 transition-opacity duration-300" />
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* Tab Content with Modern Styling */}
        <div className="bg-card/30 backdrop-blur-sm border border-border/30 rounded-2xl p-6 md:p-8">
          <TabsContent value="posts" className="space-y-6 m-0">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-1 bg-gradient-to-b from-primary to-primary/60 rounded-full" />
              <h2 className="text-xl font-bold text-foreground">Posts</h2>
            </div>
            <PostsGrid posts={posts} isLoading={postsLoading} />
          </TabsContent>

          {profile.role === 'artist' && (
            <TabsContent value="portfolio" className="space-y-6 m-0">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-1 bg-gradient-to-b from-creative to-creative/60 rounded-full" />
                <h2 className="text-xl font-bold text-foreground">Portfolio</h2>
              </div>
              <PortfolioGrid 
                portfolios={portfolios}
                isLoading={portfoliosLoading}
                isOwnProfile={isOwnProfile}
              />
            </TabsContent>
          )}

          {profile.role === 'organization' && (
            <TabsContent value="about" className="space-y-6 m-0">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-1 bg-gradient-to-b from-opportunity to-opportunity/60 rounded-full" />
                <h2 className="text-xl font-bold text-foreground">About</h2>
              </div>
              <AboutSection profile={profile} isOwnProfile={isOwnProfile} />
            </TabsContent>
          )}
        </div>
      </Tabs>
    </div>
  );
}
import { useHomeFeed } from "@/hooks/useHomeFeed";
import { useAuth } from "@/hooks/useAuth";
import { PostRowWide } from "@/components/feed/PostRowWide";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Home as HomeIcon } from "lucide-react";
import { LoadingSpinner, ContentSpinner } from "@/components/ui/loading-spinner";
import { SuggestedArtistsSection } from "@/components/home/suggested-artists-section";
import { PersonalizedOpportunitiesSection } from "@/components/home/personalized-opportunities-section";

const Home = () => {
  const { user } = useAuth();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useHomeFeed();
  
  const posts = data?.pages?.flat() || [];

  if (isLoading && posts.length === 0) {
    return (
      <div className="w-full min-h-screen bg-background">
        <div className="mx-auto" style={{ maxWidth: 'var(--feed-max-width)' }}>
          <ContentSpinner />
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="w-full min-h-screen bg-background">
        <div className="mx-auto px-4 py-12" style={{ maxWidth: 'var(--feed-max-width)' }}>
          <div className="text-center bg-card rounded-2xl border border-border/50 shadow-sm p-12">
            <div className="mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <HomeIcon className="w-8 h-8 text-primary" />
              </div>
              <h1 className="text-2xl font-bold mb-3 text-foreground">Welcome to Artikin</h1>
              <p className="text-muted-foreground text-base mb-8 max-w-md mx-auto leading-relaxed">
                Your personalized feed will appear here. Connect with artists and organizations to see their latest posts!
              </p>
            </div>
            <div className="space-y-4">
              <Link to="/create">
                <Button size="lg" className="rounded-full px-8 shadow-sm hover:shadow-md transition-all duration-200">
                  Create Your First Post
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground">
                or <Link to="/connections" className="text-primary hover:underline font-medium">discover artists to follow</Link>
              </p>
            </div>
          </div>

          {/* Mobile: Show personalized sections even when feed is empty */}
          <div className="xl:hidden space-y-6 mt-8 pb-20">
            <SuggestedArtistsSection />
            <PersonalizedOpportunitiesSection />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background">
      {/* Desktop: Main feed in center column, personalized sections in right sidebar */}
      <div className="hidden xl:block">
        <main className="mx-auto px-4" style={{ maxWidth: 'var(--feed-max-width)' }}>
          <div className="divide-y divide-border bg-card rounded-2xl shadow-sm border border-border/50 overflow-hidden">
            {posts.map((post) => (
              <PostRowWide key={post.id} post={post} />
            ))}
          </div>
          
          {hasNextPage && (
            <div className="text-center py-6 px-4">
              <Button 
                onClick={() => fetchNextPage()}
                variant="outline"
                disabled={isFetchingNextPage}
                className="min-w-[120px] rounded-full shadow-sm hover:shadow-md transition-all duration-200"
              >
                {isFetchingNextPage ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Loading...
                  </>
                ) : (
                  'Load More Posts'
                )}
              </Button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile: Stacked layout with feed, then suggested artists, then opportunities */}
      <div className="xl:hidden">
        <main className="mx-auto px-4" style={{ maxWidth: 'var(--feed-max-width)' }}>
          {/* Feed */}
          <div className="divide-y divide-border bg-card rounded-2xl shadow-sm border border-border/50 overflow-hidden mb-6">
            {posts.map((post) => (
              <PostRowWide key={post.id} post={post} />
            ))}
          </div>
          
          {hasNextPage && (
            <div className="text-center py-4 mb-6">
              <Button 
                onClick={() => fetchNextPage()}
                variant="outline"
                disabled={isFetchingNextPage}
                className="min-w-[120px] rounded-full shadow-sm hover:shadow-md transition-all duration-200"
              >
                {isFetchingNextPage ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Loading...
                  </>
                ) : (
                  'Load More Posts'
                )}
              </Button>
            </div>
          )}

          {/* Mobile Personalized Sections */}
          <div className="space-y-6 pb-20"> {/* pb-20 for bottom nav */}
            <SuggestedArtistsSection />
            <PersonalizedOpportunitiesSection />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Home;
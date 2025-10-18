import { useHomeFeed } from "@/hooks/useHomeFeed";
import { useAuth } from "@/hooks/useAuth";
import { PostRowWide } from "@/components/feed/PostRowWide";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Home as HomeIcon } from "lucide-react";
import { LoadingSpinner, ContentSpinner } from "@/components/ui/loading-spinner";

const Home = () => {
  const { user } = useAuth();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useHomeFeed();
  
  const posts = data?.pages?.flat() || [];

  if (isLoading && posts.length === 0) {
    return (
      <div className="w-full min-h-screen bg-background">
        <ContentSpinner />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="w-full min-h-screen bg-background">
        <div className="mx-auto py-12 max-w-2xl px-4">
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
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background">
      <main className="w-full pt-4">
        {/* Desktop & Mobile: Optimized feed with React.memo components */}
        <div className="bg-card rounded-2xl shadow-sm border border-border/50 overflow-hidden mb-6">
          {/* Step 3 & 5: Each PostRowWide is now memoized and uses lazy loading */}
          <div className="divide-y divide-border">
            {posts.map((post) => (
              <PostRowWide key={post.id} post={post} />
            ))}
          </div>
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
      </main>
    </div>
  );
};

export default Home;

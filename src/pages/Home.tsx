import { useHomeFeed } from "@/hooks/useHomeFeed";
import { useAuth } from "@/hooks/useAuth";
import { PostRowWide } from "@/components/feed/PostRowWide";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";

const Home = () => {
  const { user } = useAuth();
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useHomeFeed();
  
  const posts = data?.pages?.flat() || [];

  if (isLoading && posts.length === 0) {
    return (
      <div className="w-full min-h-screen bg-background">
        <div className="mx-auto" style={{ maxWidth: 'var(--feed-max-width)' }}>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="w-full min-h-screen bg-background">
        <div className="mx-auto px-4" style={{ maxWidth: 'var(--feed-max-width)' }}>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Welcome to Artikin</h1>
            <p className="text-muted-foreground text-base mb-6">
              Your personalized feed will appear here. Connect with artists and organizations to see their latest posts!
            </p>
            <Link to="/create">
              <Button size="lg" className="rounded-full px-8">
                Create Your First Post
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background">
      <main className="mx-auto" style={{ maxWidth: 'var(--feed-max-width)' }}>
        <div className="divide-y divide-border">
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
              className="min-w-[120px]"
            >
              {isFetchingNextPage ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
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
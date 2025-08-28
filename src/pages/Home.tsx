import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { usePosts } from "@/hooks/usePosts";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { PostListSkeleton } from "@/components/ui/post-skeleton";
import { FullWidthPost } from "@/components/feed/full-width-post";
import { createSampleData } from "@/utils/sampleData";

const Home = () => {
  const [showNewPostsBanner, setShowNewPostsBanner] = useState(false);
  const { user } = useAuth();
  const { data: postsData, isLoading, fetchNextPage, hasNextPage, isError } = usePosts();

  const posts = postsData?.pages.flat() || [];

  // Create sample data if user is authenticated and no posts exist
  useEffect(() => {
    if (user && !isLoading && posts.length === 0 && !isError) {
      createSampleData();
    }
  }, [user, posts.length, isLoading, isError]);

  // Simulate new posts available banner (in real app, this would be based on real-time updates)
  useEffect(() => {
    if (posts.length > 0) {
      const timer = setTimeout(() => {
        setShowNewPostsBanner(true);
      }, 30000); // Show after 30 seconds
      
      return () => clearTimeout(timer);
    }
  }, [posts.length]);

  return (
    <div className="w-full min-h-screen bg-background">
      {/* New Posts Banner */}
      {showNewPostsBanner && (
        <div className="sticky top-16 z-40 bg-primary/10 border-b border-primary/20 backdrop-blur-sm">
          <div className="max-w-md mx-auto px-4 py-2">
            <button
              className="w-full text-primary text-sm font-medium hover:text-primary/80 transition-colors"
              onClick={() => {
                setShowNewPostsBanner(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              New posts available • Tap to refresh
            </button>
          </div>
        </div>
      )}

      {/* Feed Container - Full Width Mobile-First */}
      <div className="w-full max-w-none sm:max-w-2xl sm:mx-auto lg:max-w-3xl xl:max-w-4xl">
        {isLoading ? (
          <PostListSkeleton count={3} />
        ) : isError ? (
          <div className="text-center p-8">
            <p className="text-muted-foreground mb-4">Failed to load posts</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center p-8">
            <div className="mb-6">
              <div className="h-20 w-20 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
                <Plus className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Share your first post</h3>
              <p className="text-muted-foreground text-sm">
                Connect with artists and organizations by sharing your work
              </p>
            </div>
            <Link to="/create">
              <Button className="rounded-full px-8">Create Post</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-0">
            {posts.map((post) => (
              <FullWidthPost key={post.id} post={post} />
            ))}
          </div>
        )}

        {/* Infinite Scroll Trigger */}
        {hasNextPage && (
          <div className="p-6 text-center">
            <Button 
              variant="ghost" 
              className="text-muted-foreground hover:text-foreground"
              onClick={() => fetchNextPage()}
              disabled={isLoading}
            >
              {isLoading ? 'Loading more posts...' : 'Load more'}
            </Button>
          </div>
        )}

        {/* End of Feed */}
        {!hasNextPage && posts.length > 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">You're all caught up!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
import { useState, useEffect } from "react";
import { usePostsOptimized, useLikePostOptimized, PostItem } from '@/hooks/usePostsOptimized';
import { authSingleton } from '@/lib/auth-singleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { PostSkeleton } from '@/components/ui/optimized-skeleton';
import { memo, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Link } from "react-router-dom";

// Ultra-fast Home component with optimized rendering
const Home = memo(() => {
  const [showNewPostsBanner, setShowNewPostsBanner] = useState(false);
  const user = authSingleton.getUser();
  const isMobile = useIsMobile();
  
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error
  } = usePostsOptimized();

  const likeMutation = useLikePostOptimized();
  const posts = data?.pages.flat() || [];

  // Memoized like handler for performance
  const handleLike = useCallback((postId: string, isLiked: boolean) => {
    likeMutation.mutate({ postId, isLiked });
  }, [likeMutation]);

  useEffect(() => {
    // Simulate new posts available after 10 seconds
    const timer = setTimeout(() => {
      setShowNewPostsBanner(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="w-full min-h-screen bg-background">
      {/* New Posts Banner - Hidden on Mobile */}
      {showNewPostsBanner && !isMobile && (
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

      {/* Feed Container - Ultra-fast rendering */}
      <div className="w-full max-w-none sm:max-w-2xl sm:mx-auto lg:max-w-3xl xl:max-w-4xl">
        {isLoading ? (
          <PostSkeleton />
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
          <div className="space-y-4 p-4">
            {posts.map((post) => (
              <PostItem 
                key={post.id} 
                post={post}
                onLike={handleLike}
              />
            ))}
            
            {/* Infinite scroll trigger */}
            <div 
              ref={(el) => {
                if (el && hasNextPage && !isFetchingNextPage) {
                  const observer = new IntersectionObserver(
                    (entries) => {
                      if (entries[0].isIntersecting) {
                        fetchNextPage();
                      }
                    },
                    { threshold: 0.1 }
                  );
                  observer.observe(el);
                  return () => observer.disconnect();
                }
              }}
              className="h-20 flex items-center justify-center"
            >
              {isFetchingNextPage && (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              )}
            </div>
            
            {!hasNextPage && posts.length > 0 && (
              <div className="text-center py-8 text-muted-foreground">
                🎉 You're all caught up!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

Home.displayName = 'Home';

export default Home;
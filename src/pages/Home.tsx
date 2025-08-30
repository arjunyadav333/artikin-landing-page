import { FullWidthPost } from "@/components/feed/full-width-post";
import { Button } from "@/components/ui/button";
import { PostListSkeleton } from "@/components/ui/post-skeleton";
import { usePostsOptimized } from "@/hooks/usePostsOptimized";

const Home = () => {
  const { 
    data: postsData, 
    isLoading, 
    isError, 
    fetchNextPage, 
    hasNextPage,
    refetch
  } = usePostsOptimized();

  const posts = postsData?.pages.flat() || [];

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="w-full max-w-none sm:max-w-2xl sm:mx-auto lg:max-w-3xl xl:max-w-4xl">
        {isLoading ? (
          <PostListSkeleton count={3} />
        ) : isError ? (
          <div className="text-center p-8">
            <p className="text-muted-foreground mb-4">Failed to load posts</p>
            <Button onClick={() => refetch()}>Try Again</Button>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center p-8">
            <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
            <p className="text-muted-foreground text-sm">
              Be the first to share something amazing!
            </p>
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
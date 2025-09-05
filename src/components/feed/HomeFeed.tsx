import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, RefreshCw, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PostRowWide } from './PostRowWide';
import { useHomeFeed, useLikePost, useFollowUser, useSharePost } from '@/hooks/useHomeFeed';
import { useAuth } from '@/hooks/useAuth';

export const HomeFeed = () => {
  const { user } = useAuth();
  const {
    posts,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    newPostsAvailable,
    loadNewPosts,
  } = useHomeFeed();

  const likePost = useLikePost();
  const followUser = useFollowUser();
  const sharePost = useSharePost();

  // Infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 1000
      ) {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleLike = (postId: string, isLiked: boolean) => {
    likePost.mutate({ postId, isLiked });
  };

  const handleFollow = (userId: string, isFollowing: boolean) => {
    followUser.mutate({ userId, isFollowing });
  };

  const handleShare = (postId: string) => {
    sharePost.mutate(postId);
  };

  const handleComment = (postId: string) => {
    // Navigate to post detail or open comment modal
    window.open(`/post/${postId}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-[920px] mx-auto px-3 sm:px-4">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-[920px] mx-auto px-3 sm:px-4">
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
            <p className="text-muted-foreground mb-4">Failed to load your feed</p>
            <Button onClick={() => window.location.reload()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-[920px] mx-auto px-3 sm:px-4">
        {/* New posts banner */}
        {newPostsAvailable && (
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-[hsl(var(--divider))] py-2">
            <Button
              onClick={loadNewPosts}
              variant="outline"
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              New posts available
            </Button>
          </div>
        )}

        {/* Create post prompt */}
        <div className="border-b border-[hsl(var(--divider))] bg-background">
          <div className="px-[var(--sp-lg)] py-[var(--sp-md)]">
            <div className="flex items-center gap-[var(--sp-sm)]">
              <div className="h-12 w-12 bg-muted rounded-full flex items-center justify-center">
                <Plus className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <Link to="/create">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start text-muted-foreground hover:text-foreground"
                  >
                    What's on your mind, {user?.email?.split('@')[0]}?
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Posts feed */}
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-20 w-20 bg-muted rounded-full mx-auto mb-6 flex items-center justify-center">
              <Plus className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Welcome to Artikin</h3>
            <p className="text-muted-foreground text-sm mb-6 max-w-md">
              Your feed is empty. Start following other users and creating posts to see content here.
            </p>
            <Link to="/create">
              <Button className="rounded-full px-8">
                Create Your First Post
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <PostRowWide
                key={post.id}
                post={post}
                onLike={handleLike}
                onFollow={handleFollow}
                onShare={handleShare}
                onComment={handleComment}
              />
            ))}

            {/* Load more indicator */}
            {isFetchingNextPage && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}

            {/* End of feed */}
            {!hasNextPage && posts.length > 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p style={{ fontSize: 'var(--text-action)' }}>
                  You've reached the end of your feed
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
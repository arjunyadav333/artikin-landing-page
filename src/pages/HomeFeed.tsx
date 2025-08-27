import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { usePosts, useLikePost } from "@/hooks/usePosts";
import { useSavePost } from "@/hooks/useSavePost";
import { useAuth } from "@/hooks/useAuth";
import { PostListSkeleton } from "@/components/ui/post-skeleton";
import { EnhancedPostCard } from "@/components/post/enhanced-post-card";
import { createSampleData } from "@/utils/sampleData";
import { CommentDrawer } from "@/components/post/comment-drawer";
import { useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";

const HomeFeed = () => {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const { user } = useAuth();
  const { data: postsData, isLoading, fetchNextPage, hasNextPage, isError } = usePosts();
  const likePostMutation = useLikePost();
  const savePostMutation = useSavePost();

  const posts = postsData?.pages.flat() || [];

  // Create sample data if user is authenticated and no posts exist
  useEffect(() => {
    if (user && !isLoading && posts.length === 0 && !isError) {
      createSampleData();
    }
  }, [user, posts.length, isLoading, isError]);

  const handleLike = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      likePostMutation.mutate({ 
        postId, 
        isLiked: post.user_liked || false 
      });
    }
  };

  const handleBookmark = (postId: string) => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      savePostMutation.mutate({
        postId,
        isSaved: post.user_saved || false
      });
    }
  };

  const handleComment = (postId: string) => {
    setSelectedPostId(postId);
  };

  const handleShare = (postId: string) => {
    if (navigator.share) {
      navigator.share({
        title: 'Check out this post',
        url: `${window.location.origin}/post/${postId}`,
      });
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
    }
  };

  return (
    <AppLayout>
      <div className="w-full min-h-screen bg-background">
        <div className="max-w-2xl mx-auto">
          {/* Clean Feed */}
          <div className="pb-20 md:pb-8">
            {isLoading ? (
              <PostListSkeleton count={3} />
            ) : isError ? (
              <div className="text-center p-8">
                <p className="text-muted-foreground mb-4">Failed to load posts</p>
                <Button onClick={() => window.location.reload()}>Try Again</Button>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center p-8">
                <p className="text-muted-foreground">No posts yet in your feed!</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {posts.map((post) => (
                  <EnhancedPostCard
                    key={post.id}
                    post={post}
                    onLike={handleLike}
                    onBookmark={handleBookmark}
                    onComment={handleComment}
                    onShare={handleShare}
                    isLikeLoading={likePostMutation.isPending}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Load More */}
          {hasNextPage && (
            <div className="p-4 text-center border-t border-border">
              <Button 
                variant="outline" 
                className="w-full max-w-sm rounded-full"
                onClick={() => fetchNextPage()}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Load More Posts'}
              </Button>
            </div>
          )}

          {/* Instagram-style Comment Drawer */}
          <CommentDrawer
            postId={selectedPostId}
            isOpen={!!selectedPostId}
            onClose={() => setSelectedPostId(null)}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default HomeFeed;
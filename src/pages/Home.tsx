import React, { useState, useEffect } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Plus
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePosts, useLikePost } from "@/hooks/usePosts";
import { useSavePost } from "@/hooks/useSavePost";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { PostListSkeleton } from "@/components/ui/post-skeleton";
import { EnhancedPostCard } from "@/components/post/enhanced-post-card";
import { createSampleData } from "@/utils/sampleData";

const Home = () => {
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set());
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
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

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleComment = (postId: string) => {
    toggleComments(postId);
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

  const formatText = (text: string) => {
    return text.split(' ').map((word, index) => {
      if (word.startsWith('#')) {
        return (
          <span key={index} className="text-primary font-medium cursor-pointer hover:underline">
            {word}{' '}
          </span>
        );
      }
      if (word.startsWith('http')) {
        return (
          <a key={index} href={word} target="_blank" rel="noopener noreferrer" 
             className="text-primary hover:underline">
            {word}{' '}
          </a>
        );
      }
      return word + ' ';
    });
  };

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="max-w-2xl mx-auto">
        {/* Create Post Prompt */}
        {user && (
          <div className="border-b border-border bg-card p-4 sticky top-16 z-10 backdrop-blur-sm bg-card/95">
            <Link to="/create">
              <Button 
                variant="outline" 
                className="w-full justify-start text-muted-foreground hover:text-foreground transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                What's happening in your creative world?
              </Button>
            </Link>
          </div>
        )}

        {/* Feed */}
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
              <p className="text-muted-foreground mb-4">No posts yet!</p>
              <Link to="/create">
                <Button>Create your first post</Button>
              </Link>
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
      </div>
    </div>
  );
};

export default Home;
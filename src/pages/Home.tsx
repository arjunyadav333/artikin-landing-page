import { useState } from "react";
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
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { PostListSkeleton } from "@/components/ui/post-skeleton";
import { createSampleData } from "@/utils/sampleData";
import { useEffect } from "react";

const Home = () => {
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set());
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const { user } = useAuth();
  const { data: postsData, isLoading, fetchNextPage, hasNextPage, isError } = usePosts();
  const likePostMutation = useLikePost();

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
    setBookmarkedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
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
    <div className="w-full">
      <div className="max-w-2xl mx-auto md:max-w-none">

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
            posts.map((post) => (
              <article key={post.id} className="border-b border-border">
                {/* Post Header */}
                <div className="flex items-center justify-between p-4 pb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10 cursor-pointer">
                      <AvatarImage src={post.profiles?.avatar_url} alt={post.profiles?.display_name} />
                      <AvatarFallback className="bg-muted text-foreground">
                        {post.profiles?.display_name?.split(' ').map(n => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm cursor-pointer hover:text-primary transition-colors">
                          {post.profiles?.display_name}
                        </span>
                        <span className="text-muted-foreground text-sm">@{post.profiles?.username}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>{post.profiles?.role || 'Creator'}</span>
                        <span>•</span>
                        <span>{new Date(post.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Report</DropdownMenuItem>
                      <DropdownMenuItem>Mute</DropdownMenuItem>
                      <DropdownMenuItem>Copy Link</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Post Content */}
                <div className="px-4 pb-3">
                  {post.title && (
                    <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                  )}
                  <p className="text-sm leading-relaxed">
                    {formatText(post.content)}
                  </p>
                </div>

                {/* Post Media */}
                {post.media_urls && post.media_urls.length > 0 && (
                  <div className="relative bg-muted">
                    <div className="aspect-square bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center">
                      <span className="text-muted-foreground text-sm">Media Preview</span>
                    </div>
                  </div>
                )}

                {/* Action Bar */}
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-foreground hover:text-red-500 transition-colors"
                      onClick={() => handleLike(post.id)}
                      disabled={likePostMutation.isPending}
                    >
                      <Heart 
                        className={`h-6 w-6 mr-1 transition-all ${
                          post.user_liked ? 'fill-red-500 text-red-500' : ''
                        }`} 
                      />
                      <span className="text-sm font-medium">{post.likes_count}</span>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-foreground hover:text-primary transition-colors"
                      onClick={() => toggleComments(post.id)}
                    >
                      <MessageCircle className="h-6 w-6 mr-1" />
                      <span className="text-sm font-medium">{post.comments_count}</span>
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-foreground hover:text-primary transition-colors"
                    >
                      <Share2 className="h-6 w-6 mr-1" />
                      <span className="text-sm font-medium">{post.shares_count}</span>
                    </Button>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-foreground hover:text-primary transition-colors"
                    onClick={() => handleBookmark(post.id)}
                  >
                    <Bookmark 
                      className={`h-6 w-6 transition-all ${
                        bookmarkedPosts.has(post.id) ? 'fill-primary text-primary' : ''
                      }`} 
                    />
                  </Button>
                </div>

                {/* Expanded Comments */}
                {expandedComments.has(post.id) && (
                  <div className="px-4 pb-4 mt-4 space-y-3 border-t border-border pt-4">
                    <div className="flex space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user?.user_metadata?.avatar_url} />
                        <AvatarFallback className="bg-muted text-foreground text-xs">
                          {user?.email?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Add a comment..."
                          className="w-full bg-transparent text-sm border-none outline-none placeholder:text-muted-foreground"
                        />
                      </div>
                      <Button size="sm" variant="ghost" className="text-primary hover:text-primary/80 text-sm font-medium">
                        Post
                      </Button>
                    </div>
                  </div>
                )}
              </article>
            ))
          )}
        </div>

        {/* Load More */}
        {hasNextPage && (
          <div className="p-4 text-center">
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
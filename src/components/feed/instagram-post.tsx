import { useState, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreHorizontal,
  UserPlus,
  Play,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Post } from "@/hooks/usePosts";
import { Link } from "react-router-dom";
import { CommentModal } from "@/components/feed/comment-modal";
import { useLikePost } from "@/hooks/usePosts";

import { useFollowUser } from "@/hooks/useConnections";
import { useAuth } from "@/hooks/useAuth";

interface InstagramPostProps {
  post: Post;
}

export function InstagramPost({ post }: InstagramPostProps) {
  const [showComments, setShowComments] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isDoubleTapping, setIsDoubleTapping] = useState(false);
  const lastTapRef = useRef<number>(0);
  
  const { user } = useAuth();
  const likePostMutation = useLikePost();
  
  const followUserMutation = useFollowUser();

  const isOwnPost = user?.id === post.user_id;
  const timeAgo = getTimeAgo(post.created_at);

  const handleLike = () => {
    likePostMutation.mutate({ 
      postId: post.id, 
      isLiked: post.user_liked || false 
    });
  };


  const handleFollow = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOwnPost) {
      followUserMutation.mutate({ 
        targetUserId: post.user_id, 
        isCurrentlyFollowing: post.is_following || false 
      });
    }
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    const timeSince = now - lastTapRef.current;
    
    if (timeSince < 300 && timeSince > 0) {
      // Double tap detected
      if (!post.user_liked) {
        handleLike();
        setIsDoubleTapping(true);
        setTimeout(() => setIsDoubleTapping(false), 1000);
      }
    }
    
    lastTapRef.current = now;
  };

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/post/${post.id}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title || 'Check out this post',
          text: post.content,
          url: postUrl,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      // Fallback: copy to clipboard
      await navigator.clipboard.writeText(postUrl);
    }
  };

  const formatText = (text: string) => {
    return text.split(' ').map((word, index) => {
      if (word.startsWith('#')) {
        return (
          <Link 
            key={index} 
            to={`/tags/${word.slice(1)}`}
            className="text-primary font-medium hover:underline"
          >
            {word}{' '}
          </Link>
        );
      }
      if (word.startsWith('@')) {
        return (
          <Link 
            key={index} 
            to={`/profile/${word.slice(1)}`}
            className="text-primary font-medium hover:underline"
          >
            {word}{' '}
          </Link>
        );
      }
      if (word.startsWith('http')) {
        return (
          <a 
            key={index} 
            href={word} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-primary hover:underline"
          >
            {word}{' '}
          </a>
        );
      }
      return word + ' ';
    });
  };

  const nextMedia = () => {
    if (post.media_urls && currentMediaIndex < post.media_urls.length - 1) {
      setCurrentMediaIndex(currentMediaIndex + 1);
    }
  };

  const prevMedia = () => {
    if (currentMediaIndex > 0) {
      setCurrentMediaIndex(currentMediaIndex - 1);
    }
  };

  return (
    <>
      <article className="w-full bg-card border-b border-border">
        {/* Post Header */}
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center space-x-3">
            <Link to={`/profile/${post.profiles?.username || post.user_id}`}>
              <Avatar className="h-8 w-8 cursor-pointer">
                <AvatarImage src={post.profiles?.avatar_url} alt={post.profiles?.display_name} />
                <AvatarFallback className="bg-muted text-foreground text-xs">
                  {post.profiles?.display_name?.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
            </Link>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <Link 
                  to={`/profile/${post.profiles?.username || post.user_id}`}
                  className="font-semibold text-sm hover:text-primary transition-colors"
                >
                  {post.profiles?.display_name}
                </Link>
                
                {post.profiles?.role === 'artist' && post.profiles?.artform && (
                  <span className="text-xs text-muted-foreground">
                    • {post.profiles.artform}
                  </span>
                )}
                
                {post.profiles?.role === 'organization' && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                    Organization
                  </span>
                )}
                
                <span className="text-xs text-muted-foreground">• {timeAgo}</span>
              </div>
              
              {post.profiles?.location && (
                <p className="text-xs text-muted-foreground">{post.profiles.location}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {!isOwnPost && !post.is_following && (
              <Button
                variant="outline"
                size="sm"
                className="h-6 px-2 text-xs"
                onClick={handleFollow}
                disabled={followUserMutation.isPending}
              >
                <UserPlus className="h-3 w-3 mr-1" />
                Follow
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleShare}>
                  Copy Link
                </DropdownMenuItem>
                {!isOwnPost && (
                  <>
                    <DropdownMenuItem>Hide Post</DropdownMenuItem>
                    <DropdownMenuItem>Report Post</DropdownMenuItem>
                    <DropdownMenuItem>Block User</DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Post Media */}
        {post.media_urls && post.media_urls.length > 0 && (
          <div className="relative bg-black">
            <div 
              className="aspect-square w-full overflow-hidden cursor-pointer relative"
              onClick={handleDoubleTap}
            >
              {post.media_type === "video" ? (
                <video 
                  src={post.media_urls[currentMediaIndex]} 
                  className="w-full h-full object-cover"
                  controls
                  muted
                  playsInline
                />
              ) : (
                <img 
                  src={post.media_urls[currentMediaIndex]} 
                  alt="Post media"
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              )}
              
              {/* Double-tap heart animation */}
              {isDoubleTapping && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <Heart className="h-20 w-20 text-red-500 fill-red-500 animate-ping" />
                </div>
              )}
              
              {/* Media navigation */}
              {post.media_urls.length > 1 && (
                <>
                  {currentMediaIndex > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        prevMedia();
                      }}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {currentMediaIndex < post.media_urls.length - 1 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-black/50 hover:bg-black/70 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        nextMedia();
                      }}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {/* Media indicators */}
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                    {post.media_urls.map((_, index) => (
                      <div
                        key={index}
                        className={`h-1.5 w-1.5 rounded-full transition-all ${
                          index === currentMediaIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Action Bar */}
        <div className="flex items-center justify-between px-3 py-2">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-foreground hover:text-red-500 transition-colors"
              onClick={handleLike}
              disabled={likePostMutation.isPending}
            >
              <Heart 
                className={`h-6 w-6 transition-all ${
                  post.user_liked ? 'fill-red-500 text-red-500' : ''
                }`} 
              />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-foreground hover:text-primary transition-colors"
              onClick={() => setShowComments(true)}
            >
              <MessageCircle className="h-6 w-6" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-foreground hover:text-primary transition-colors"
              onClick={handleShare}
            >
              <Share2 className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Like Count & Comments Preview */}
        <div className="px-3 pb-2">
          {post.likes_count > 0 && (
            <p className="text-sm font-semibold mb-1">
              {post.likes_count} {post.likes_count === 1 ? 'like' : 'likes'}
            </p>
          )}
          
          {/* Post Content */}
          <div className="text-sm">
            <span className="font-semibold mr-2">{post.profiles?.display_name}</span>
            <span>{formatText(post.content)}</span>
          </div>
          
          {post.comments_count > 0 && (
            <button
              className="text-sm text-muted-foreground mt-1 hover:text-foreground transition-colors"
              onClick={() => setShowComments(true)}
            >
              View all {post.comments_count} comments
            </button>
          )}
        </div>
      </article>

      {/* Comment Modal */}
      <CommentModal
        post={post}
        isOpen={showComments}
        onClose={() => setShowComments(false)}
      />
    </>
  );
}

function getTimeAgo(dateString: string): string {
  const now = new Date();
  const postDate = new Date(dateString);
  const diffInSeconds = Math.floor((now.getTime() - postDate.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
  
  return postDate.toLocaleDateString();
}
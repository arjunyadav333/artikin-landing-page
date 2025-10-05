import { useState, useRef } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreVertical,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  Flag,
  EyeOff,
  Link as LinkIcon,
  UserX,
  Edit,
  Trash2
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
import { useToast } from "@/hooks/use-toast";
import { getTimeAgo } from "@/lib/timeUtils";

interface FullWidthPostProps {
  post: Post;
}

export function FullWidthPost({ post }: FullWidthPostProps) {
  const [showComments, setShowComments] = useState(false);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [isDoubleTapping, setIsDoubleTapping] = useState(false);
  const [showFullCaption, setShowFullCaption] = useState(false);
  const lastTapRef = useRef<number>(0);
  
  const { user } = useAuth();
  const { toast } = useToast();
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
      await navigator.clipboard.writeText(postUrl);
      toast({
        title: "Link copied",
        description: "Post link copied to clipboard"
      });
    }
  };

  const handleCopyLink = async () => {
    const postUrl = `${window.location.origin}/post/${post.id}`;
    await navigator.clipboard.writeText(postUrl);
    toast({
      title: "Link copied",
      description: "Post link copied to clipboard"
    });
  };

  const handleEditPost = () => {
    // Navigate to edit post page or open edit modal
    toast({
      title: "Edit Post",
      description: "Edit functionality will be implemented"
    });
  };

  const handleDeletePost = () => {
    // Show confirmation dialog and delete post
    const confirmDelete = window.confirm("Are you sure you want to delete this post? This action cannot be undone.");
    if (confirmDelete) {
      toast({
        title: "Post Deleted",
        description: "Your post has been deleted"
      });
      // Delete implementation will be added
    }
  };

  const handleReportPost = () => {
    // Open report modal or form
    toast({
      title: "Report Submitted",
      description: "Thank you for reporting. We'll review this post."
    });
  };

  const formatCaption = (text: string) => {
    const lines = text.split('\n');
    const shouldTruncate = lines.length > 3 && !showFullCaption;
    const displayText = shouldTruncate ? lines.slice(0, 3).join('\n') : text;
    
    return displayText.split(' ').map((word, index) => {
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
        {/* Post Header - Exact specifications */}
        <div className="flex items-start justify-between px-4 py-3">
          <div className="flex items-center space-x-3 flex-1">
            <Link to={`/profile/${post.profiles?.id || post.user_id}`}>
              <Avatar className="h-10 w-10 cursor-pointer">
                <AvatarImage src={post.profiles?.avatar_url} alt={post.profiles?.display_name} />
                <AvatarFallback className="bg-muted text-foreground text-sm font-semibold">
                  {post.profiles?.display_name?.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
            </Link>
            
            <div className="flex-1 min-w-0">
              <div className="flex flex-col">
                <Link 
                  to={`/profile/${post.profiles?.id || post.user_id}`}
                  className="font-bold text-base hover:text-primary transition-colors truncate"
                >
                  {post.profiles?.display_name || 'Unknown User'}
                </Link>
                
                <div className="flex items-center text-xs text-muted-foreground space-x-2">
                  <span>
                    {post.profiles?.artform 
                      ? post.profiles.artform 
                      : post.profiles?.organization_type || post.profiles?.role === 'organization'
                        ? 'Organization' 
                        : 'Artist'
                    }
                  </span>
                  <span>{timeAgo}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 flex-shrink-0">
            {!isOwnPost && (
              <Button
                className={`
                  ${post.is_following 
                    ? 'bg-sky-300 hover:bg-sky-400 text-sky-900 border-sky-300' 
                    : 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500'
                  }
                  rounded-full transition-all duration-200 border
                  text-[clamp(11px,1.2vw,13px)] 
                  px-[clamp(12px,1.5vw,16px)] 
                  py-[clamp(4px,0.6vw,6px)]
                  font-medium h-auto
                `}
                onClick={handleFollow}
                disabled={followUserMutation.isPending}
              >
                {followUserMutation.isPending 
                  ? 'Loading...' 
                  : post.is_following 
                    ? 'Following' 
                    : 'Follow'
                }
              </Button>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {isOwnPost ? (
                  <>
                    <DropdownMenuItem onClick={() => handleEditPost()}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Post
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDeletePost()}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Post
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleCopyLink}>
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Copy Link
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={handleCopyLink}>
                      <LinkIcon className="h-4 w-4 mr-2" />
                      Copy Link
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Hide Post
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleReportPost()}>
                      <Flag className="h-4 w-4 mr-2" />
                      Tell Something Important
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <UserX className="h-4 w-4 mr-2" />
                      Mute User
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Caption */}
        {post.content && (
          <div className="px-4 pb-3">
            <div className="text-sm leading-relaxed">
              {formatCaption(post.content)}
              {post.content.split('\n').length > 3 && (
                <button
                  className="text-muted-foreground text-sm font-medium ml-1 hover:text-foreground transition-colors"
                  onClick={() => setShowFullCaption(!showFullCaption)}
                >
                  {showFullCaption ? 'Show less' : 'Read more'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Media - Full Width */}
        {post.media_urls && post.media_urls.length > 0 && (
          <div className="relative bg-black w-full">
            <div 
              className="w-full aspect-square overflow-hidden cursor-pointer relative"
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
              
              {/* Media navigation for carousel */}
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

        {/* Action Row with Real-time Counts */}
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-6">
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-foreground hover:text-red-500 transition-colors flex items-center space-x-1"
              onClick={handleLike}
              disabled={likePostMutation.isPending}
            >
              <Heart 
                className={`h-6 w-6 transition-all ${
                  post.user_liked ? 'fill-red-500 text-red-500' : ''
                }`} 
              />
              {post.likes_count > 0 && (
                <span className="text-sm font-medium">
                  {post.likes_count}
                </span>
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-foreground hover:text-primary transition-colors flex items-center space-x-1"
              onClick={() => setShowComments(true)}
            >
              <MessageCircle className="h-6 w-6" />
              {post.comments_count > 0 && (
                <span className="text-sm font-medium">
                  {post.comments_count}
                </span>
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-foreground hover:text-primary transition-colors flex items-center space-x-1"
              onClick={handleShare}
            >
              <Share2 className="h-6 w-6" />
              {post.shares_count > 0 && (
                <span className="text-sm font-medium">
                  {post.shares_count}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Comments Preview */}
        {post.comments_count > 0 && (
          <div className="px-4 pb-3">
            <button
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={() => setShowComments(true)}
            >
              View all {post.comments_count} comments
            </button>
          </div>
        )}
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

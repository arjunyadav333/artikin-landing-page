import React, { useState, memo } from "react";
import { Link } from "react-router-dom";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreHorizontal,
  UserPlus,
  UserCheck
} from "lucide-react";
import { ProfilePictureModal } from "@/components/profile/profile-picture-modal";
import { CustomVideoPlayer } from "@/components/media/custom-video-player";
import { formatDistanceToNow } from "date-fns";
import { useConnectionStatus, useFollowUser } from "@/hooks/useConnections";
import { useAuth } from "@/hooks/useAuth";

interface PostCardProps {
  post: {
    id: string;
    content: string;
    title?: string;
    media_urls?: string[];
    media_type?: string;
    likes_count: number;
    comments_count: number;
    shares_count: number;
    saves_count: number;
    created_at: string;
    user_liked?: boolean;
    user_saved?: boolean;
    profiles?: {
      id: string;
      user_id: string;
      display_name: string;
      username: string;
      avatar_url?: string;
      role?: string;
      artform?: string;
    };
  };
  onLike: (postId: string) => void;
  onBookmark: (postId: string) => void;
  onComment: (postId: string) => void;
  onShare: (postId: string) => void;
  isLikeLoading?: boolean;
}

export const EnhancedPostCard = memo(({ 
  post, 
  onLike, 
  onBookmark, 
  onComment,
  onShare,
  isLikeLoading = false
}: PostCardProps) => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { user } = useAuth();
  const { data: connectionStatus } = useConnectionStatus(post.profiles?.user_id);
  const followMutation = useFollowUser();
  
  const isOwnPost = user?.id === post.profiles?.user_id;

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

  const getUserRole = () => {
    if (post.profiles?.role === 'artist' && post.profiles?.artform) {
      return post.profiles.artform.charAt(0).toUpperCase() + post.profiles.artform.slice(1);
    }
    if (post.profiles?.role === 'organization') {
      return 'Organization';
    }
    return null;
  };

  const timeAgo = formatDistanceToNow(new Date(post.created_at), { addSuffix: true });

  const handleFollowClick = () => {
    if (!post.profiles?.user_id || isOwnPost) return;
    
    followMutation.mutate({
      targetUserId: post.profiles.user_id,
      isCurrentlyFollowing: connectionStatus?.isFollowing || false,
    });
  };

  return (
    <article className="border-b border-border bg-card">
      {/* Post Header */}
      <div className="flex items-center justify-between p-4 pb-3">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <Avatar 
            className="h-10 w-10 cursor-pointer hover:ring-2 hover:ring-primary transition-all" 
            onClick={() => setShowProfileModal(true)}
          >
            <AvatarImage src={post.profiles?.avatar_url} alt={post.profiles?.display_name} />
            <AvatarFallback className="bg-muted text-foreground text-sm font-semibold">
              {post.profiles?.display_name?.split(' ').map(n => n[0]).join('') || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <Link 
                to={`/profile/${post.profiles?.id}`}
                className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer text-sm md:text-base truncate"
              >
                {post.profiles?.display_name}
              </Link>
              <span className="text-muted-foreground text-xs md:text-sm">
                @{post.profiles?.username}
              </span>
            </div>
            
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              {getUserRole() && (
                <>
                  <Badge 
                    variant="secondary" 
                    className="text-xs px-2 py-0 bg-primary/10 text-primary"
                  >
                    {getUserRole()}
                  </Badge>
                  <span>•</span>
                </>
              )}
              <span>{timeAgo}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!isOwnPost && (
            <Button
              variant={connectionStatus?.isFollowing ? "secondary" : "default"}
              size="sm"
              className={`text-xs px-3 py-1 h-8 font-medium transition-all ${
                connectionStatus?.isFollowing 
                  ? "bg-sky-100 text-sky-600 hover:bg-sky-200 border-sky-200" 
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
              onClick={handleFollowClick}
              disabled={followMutation.isPending}
            >
              {connectionStatus?.isFollowing ? (
                <>
                  <UserCheck className="h-3 w-3 mr-1" />
                  Following
                </>
              ) : (
                <>
                  <UserPlus className="h-3 w-3 mr-1" />
                  Follow
                </>
              )}
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 bg-background border border-border">
              <DropdownMenuItem onClick={() => onBookmark(post.id)}>
                {post.user_saved ? 'Remove from Saved' : 'Save Post'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => {
                const postUrl = `${window.location.origin}/post/${post.id}`;
                navigator.clipboard.writeText(postUrl);
              }}>
                Copy Link
              </DropdownMenuItem>
              <DropdownMenuItem>Report Post</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3">
        {post.title && (
          <h3 className="font-semibold text-lg md:text-xl mb-2 text-foreground leading-tight">
            {post.title}
          </h3>
        )}
        <p className="text-sm md:text-base leading-relaxed text-foreground">
          {formatText(post.content)}
        </p>
      </div>

      {/* Post Media */}
      {post.media_urls && post.media_urls.length > 0 && (
        <div className="mb-0">
          {post.media_type === 'video' ? (
            <CustomVideoPlayer 
              src={post.media_urls[0]} 
              poster={post.media_urls[1]} // Optional poster/thumbnail
            />
          ) : (
            <div className="relative">
              {post.media_urls.length === 1 ? (
                <img
                  src={post.media_urls[0]}
                  alt="Post media"
                  className="w-full max-h-96 object-cover"
                />
              ) : (
                <div className="grid grid-cols-2 gap-1">
                  {post.media_urls.slice(0, 4).map((url, index) => (
                    <div key={index} className="relative">
                      <img
                        src={url}
                        alt={`Post media ${index + 1}`}
                        className="w-full aspect-square object-cover"
                      />
                      {index === 3 && post.media_urls!.length > 4 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <span className="text-white font-semibold">
                            +{post.media_urls!.length - 4}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Engagement Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-border/50">
        <div className="flex items-center space-x-4 md:space-x-6">
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 text-foreground hover:text-red-500 transition-colors group"
            onClick={() => onLike(post.id)}
            disabled={isLikeLoading}
          >
            <Heart 
              className={`h-5 w-5 md:h-6 md:w-6 mr-1 transition-all ${
                post.user_liked 
                  ? 'fill-red-500 text-red-500 scale-105' 
                  : 'group-hover:scale-110'
              }`} 
            />
            <span className="text-sm font-medium">{post.likes_count}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 text-foreground hover:text-primary transition-colors group"
            onClick={() => onComment(post.id)}
          >
            <MessageCircle className="h-5 w-5 md:h-6 md:w-6 mr-1 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">{post.comments_count}</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-0 text-foreground hover:text-primary transition-colors group"
            onClick={() => onShare(post.id)}
          >
            <Share2 className="h-5 w-5 md:h-6 md:w-6 mr-1 group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium">{post.shares_count}</span>
          </Button>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 text-foreground hover:text-primary transition-colors group"
          onClick={() => onBookmark(post.id)}
        >
          <Bookmark 
            className={`h-5 w-5 md:h-6 md:w-6 transition-all ${
              post.user_saved 
                ? 'fill-primary text-primary scale-105' 
                : 'group-hover:scale-110'
            }`} 
          />
        </Button>
      </div>

      {/* Profile Picture Modal */}
      <ProfilePictureModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        imageUrl={post.profiles?.avatar_url}
        userName={post.profiles?.display_name}
      />
    </article>
  );
});

EnhancedPostCard.displayName = "EnhancedPostCard";
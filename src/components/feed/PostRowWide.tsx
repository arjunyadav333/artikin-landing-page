import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MoreVertical, Heart, MessageCircle, Share2, Copy, Flag, EyeOff, Edit, Trash2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatText } from '@/lib/utils';
import { FeedPost } from '@/hooks/useHomeFeed';
import { useAuth } from '@/hooks/useAuth';

interface PostRowWideProps {
  post: FeedPost;
  onLike: (postId: string, isLiked: boolean) => void;
  onFollow: (userId: string, isFollowing: boolean) => void;
  onShare: (postId: string) => void;
  onComment: (postId: string) => void;
}

export const PostRowWide: React.FC<PostRowWideProps> = ({
  post,
  onLike,
  onFollow,
  onShare,
  onComment,
}) => {
  const { user } = useAuth();
  const [contentExpanded, setContentExpanded] = useState(false);
  
  const isOwnPost = user?.id === post.user_id;
  
  // Format role display
  const getRoleDisplay = () => {
    if (post.profile.role === 'artist' && post.profile.artform) {
      return post.profile.artform;
    }
    if (post.profile.role === 'organization' && post.profile.organization_type) {
      return post.profile.organization_type;
    }
    return 'Organization';
  };

  // Handle copy link
  const handleCopyLink = () => {
    const url = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(url);
  };

  // Check if content should be collapsed
  const shouldCollapseContent = post.content.length > 200 || post.content.split('\n').length > 3;
  const displayContent = shouldCollapseContent && !contentExpanded 
    ? post.content.slice(0, 200) + '...'
    : post.content;

  return (
    <article className="w-full border-b border-[hsl(var(--divider))] bg-background">
      <div className="px-[var(--sp-lg)] py-[var(--sp-md)]">
        {/* Header */}
        <div className="flex items-start justify-between mb-[var(--sp-sm)]">
          <div className="flex items-center gap-[var(--sp-sm)] flex-1">
            {/* Avatar */}
            <Link to={`/profile/${post.user_id}`} className="flex-shrink-0">
              <Avatar className="h-12 w-12 ring-2 ring-background hover:ring-primary/20 transition-all">
                <AvatarImage 
                  src={post.profile.avatar_url} 
                  alt={post.profile.display_name}
                />
                <AvatarFallback>
                  {post.profile.display_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Link>
            
            {/* Text stack */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <Link 
                  to={`/profile/${post.user_id}`}
                  className="font-semibold text-foreground hover:text-primary transition-colors"
                  style={{ fontSize: 'var(--text-name)' }}
                >
                  {post.profile.display_name}
                </Link>
                <span 
                  className="text-muted-foreground"
                  style={{ fontSize: 'var(--text-meta)' }}
                >
                  @{post.profile.username}
                </span>
              </div>
              <div 
                className="text-muted-foreground"
                style={{ fontSize: 'var(--text-meta)' }}
              >
                {getRoleDisplay()}
              </div>
            </div>
          </div>
          
          {/* Right side actions */}
          <div className="flex items-center gap-[var(--sp-sm)]">
            {/* Follow button */}
            {!isOwnPost && (
              <Button
                variant={post.is_following ? "secondary" : "default"}
                size="sm"
                onClick={() => onFollow(post.user_id, post.is_following || false)}
                className={
                  post.is_following
                    ? "bg-[hsl(var(--artikin-blue-light))] text-[hsl(var(--artikin-blue))] hover:bg-[hsl(var(--artikin-blue-light))]/80"
                    : "bg-[hsl(var(--artikin-blue))] text-white hover:bg-[hsl(var(--artikin-blue))]/90"
                }
                style={{ fontSize: 'var(--text-action)' }}
              >
                {post.is_following ? 'Following' : 'Follow'}
              </Button>
            )}
            
            {/* Three-dots menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isOwnPost ? (
                  <>
                    <DropdownMenuItem>
                      <Edit className="h-4 w-4" />
                      Edit Post
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                      Delete Post
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleCopyLink}>
                      <Copy className="h-4 w-4" />
                      Copy Link
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem>
                      <Flag className="h-4 w-4" />
                      Report Post
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <EyeOff className="h-4 w-4" />
                      Hide Post
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleCopyLink}>
                      <Copy className="h-4 w-4" />
                      Copy Link
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Post content */}
        <div className="mb-[var(--sp-sm)]">
          {post.title && (
            <h2 className="font-semibold mb-2 text-foreground" style={{ fontSize: 'var(--text-content)' }}>
              {post.title}
            </h2>
          )}
          <div 
            className="text-foreground leading-relaxed"
            style={{ fontSize: 'var(--text-content)', lineHeight: '1.4' }}
            dangerouslySetInnerHTML={{ __html: formatText(displayContent) }}
          />
          {shouldCollapseContent && (
            <button
              onClick={() => setContentExpanded(!contentExpanded)}
              className="text-primary hover:underline mt-1"
              style={{ fontSize: 'var(--text-action)' }}
            >
              {contentExpanded ? 'Read less' : 'Read more'}
            </button>
          )}
        </div>

        {/* Media */}
        {post.media_urls && post.media_urls.length > 0 && (
          <div className="mb-[var(--sp-sm)]">
            <div className="grid gap-2 rounded-lg overflow-hidden">
              {post.media_urls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`Post media ${index + 1}`}
                  className="w-full h-auto object-cover cursor-pointer hover:opacity-95 transition-opacity"
                  loading="lazy"
                />
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mb-[var(--sp-sm)] flex flex-wrap gap-[var(--sp-xs)]">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="text-primary hover:underline cursor-pointer"
                style={{ fontSize: 'var(--text-action)' }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Action row */}
        <div className="flex items-center gap-[var(--sp-lg)] pt-[var(--sp-xs)]">
          {/* Like */}
          <button
            onClick={() => onLike(post.id, post.is_liked || false)}
            className={`flex items-center gap-[var(--sp-xs)] hover:text-red-500 transition-colors min-h-[44px] px-2 ${
              post.is_liked ? 'text-red-500' : 'text-muted-foreground'
            }`}
          >
            <Heart className={`h-5 w-5 ${post.is_liked ? 'fill-current' : ''}`} />
            <span style={{ fontSize: 'var(--text-action)' }}>
              {post.likes_count || 0}
            </span>
          </button>

          {/* Comment */}
          <button
            onClick={() => onComment(post.id)}
            className="flex items-center gap-[var(--sp-xs)] text-muted-foreground hover:text-blue-500 transition-colors min-h-[44px] px-2"
          >
            <MessageCircle className="h-5 w-5" />
            <span style={{ fontSize: 'var(--text-action)' }}>
              {post.comments_count || 0}
            </span>
          </button>

          {/* Share */}
          <button
            onClick={() => onShare(post.id)}
            className="flex items-center gap-[var(--sp-xs)] text-muted-foreground hover:text-green-500 transition-colors min-h-[44px] px-2"
          >
            <Share2 className="h-5 w-5" />
            <span style={{ fontSize: 'var(--text-action)' }}>
              {post.shares_count || 0}
            </span>
          </button>
        </div>
      </div>
    </article>
  );
};
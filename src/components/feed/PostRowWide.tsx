import { useState, memo, useCallback, lazy, Suspense } from 'react';
import { Heart, MessageCircle, Share2, MoreVertical, Edit, Trash2, Copy, Share } from 'lucide-react';
import { Link } from 'react-router-dom';
import { HomeFeedPost, useLikePost } from '@/hooks/useHomeFeed';
import { useFollowUser, useConnectionStatus } from '@/hooks/useConnections';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useDeletePost } from '@/hooks/useDeletePost';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

// Phase 5: Lazy load heavy components
const MediaCarousel = lazy(() => import('./MediaCarousel').then(m => ({ default: m.MediaCarousel })));
const InstagramCommentModal = lazy(() => import('./InstagramCommentModal').then(m => ({ default: m.InstagramCommentModal })));
const EditPostModal = lazy(() => import('./EditPostModal').then(m => ({ default: m.EditPostModal })));
const SocialShareModal = lazy(() => import('./SocialShareModal').then(m => ({ default: m.SocialShareModal })));

interface PostRowWideProps {
  post: HomeFeedPost;
}

export const PostRowWide = memo(({ post }: PostRowWideProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isOwner = user?.id === post.user_id;
  const [menuOpen, setMenuOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [commentSheetOpen, setCommentSheetOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [socialShareModalOpen, setSocialShareModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  
  const likeMutation = useLikePost(20);
  const followMutation = useFollowUser();
  const deletePostMutation = useDeletePost();
  const connectionStatus = useConnectionStatus(post.user_id);

  const handleFollow = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      return;
    }
    
    // Use connection status query first, then fallback to post data
    const currentFollowingState = connectionStatus.data?.isFollowing ?? post.is_following ?? false;
    console.log('Follow button clicked for user:', post.user_id, 'Current following state:', currentFollowingState);
    
    followMutation.mutate({ 
      targetUserId: post.user_id, 
      isCurrentlyFollowing: currentFollowingState 
    });
  }, [user, post.user_id, connectionStatus.data?.isFollowing, post.is_following, followMutation]);

  const handleLike = useCallback(() => {
    if (!user) {
      return;
    }
    
    console.log('Like button clicked for post:', post.id, 'Current liked state:', post.user_liked);
    likeMutation.mutate({ 
      postId: post.id, 
      isLiked: post.user_liked || false 
    });
  }, [user, post.id, post.user_liked, likeMutation]);

  const handleComment = useCallback(() => {
    setCommentSheetOpen(true);
  }, []);

  const handleShare = useCallback(() => {
    setSocialShareModalOpen(true);
  }, []);

  const handleMenuAction = useCallback((action: string) => {
    setMenuOpen(false);
    
    switch (action) {
      case 'copy-link':
        navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
        break;
      case 'edit':
        setEditModalOpen(true);
        break;
      case 'delete':
        setDeleteDialogOpen(true);
        break;
      case 'share':
        setSocialShareModalOpen(true);
        break;
    }
  }, [post.id]);

  const handleDeletePost = useCallback(() => {
    deletePostMutation.mutate(post.id);
  }, [post.id, deletePostMutation]);

  const formatText = useCallback((text: string) => {
    return text.split(' ').map((word, index) => {
      if (word.startsWith('#')) {
        return (
          <span key={index} className="text-primary hover:underline cursor-pointer">
            {word}{' '}
          </span>
        );
      }
      if (word.startsWith('@')) {
        return (
          <span key={index} className="text-primary hover:underline cursor-pointer">
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
  }, []);

  const shouldTruncate = (post.content || '').length > 200;
  const displayText = shouldTruncate && !isExpanded 
    ? (post.content || '').slice(0, 200) + '...' 
    : (post.content || '');

  const getDisplayRole = () => {
    if (!post.profiles) return 'User';
    return post.profiles.account_type === 'artist' ? 'Artist' : 'Organization';
  };

  return (
    <article 
      className="post w-full border-b border-border bg-background"
      data-post-id={post.id}
      data-author-id={post.user_id}
      style={{
        '--avatar-size': '44px',
        '--header-gap': '12px'
      } as React.CSSProperties}
    >
      {/* Header */}
      <header className="post__header flex items-start gap-3 p-4">
        <Link to={`/profile/${post.user_id}`} className="post__avatar-link flex-shrink-0">
          <img
            className="post__avatar w-11 h-11 rounded-full object-cover"
            src={post.profiles?.avatar_url || post.profiles?.profile_pic || ''}
            alt={`${post.profiles?.display_name || post.profiles?.full_name || 'User'} avatar`}
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(post.profiles?.display_name || 'User')}&background=random`;
            }}
          />
        </Link>

        <div className="post__meta min-w-0 flex-1">
          <Link 
            to={`/profile/${post.user_id}`}
            className="post__fullname block font-semibold hover:underline truncate"
          >
            {post.profiles?.display_name || post.profiles?.full_name || 'Unknown User'}
          </Link>
          <div className="post__role text-muted-foreground text-sm">
            {getDisplayRole()}
          </div>
        </div>

        <div className="post__actions-header flex items-center gap-2">
          {!isOwner && user && (
            <button
              className={`btn btn--follow px-3 py-1 text-sm rounded-full border transition-colors ${
                (connectionStatus.data?.isFollowing ?? post.is_following)
                  ? 'bg-secondary text-secondary-foreground' 
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
              data-follow-user-id={post.user_id}
              aria-pressed={connectionStatus.data?.isFollowing ?? post.is_following}
              onClick={handleFollow}
              disabled={followMutation.isPending}
            >
              {(connectionStatus.data?.isFollowing ?? post.is_following) ? 'Following' : 'Follow'}
            </button>
          )}

          <div className="relative">
            <button
              className="btn btn--menu p-2 hover:bg-muted rounded-full transition-colors"
              aria-haspopup="true"
              aria-expanded={menuOpen}
              aria-label="Post options"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div 
                className="post__menu absolute right-0 top-full mt-1 bg-popover border rounded-md shadow-lg z-50 min-w-[160px]"
                role="menu"
                aria-hidden="false"
              >
                {isOwner ? (
                  <>
                    <button
                      role="menuitem"
                      className="flex items-center w-full px-3 py-2 text-sm hover:bg-muted transition-colors"
                      data-menu-action="edit"
                      onClick={() => handleMenuAction('edit')}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </button>
                    <button
                      role="menuitem"
                      className="flex items-center w-full px-3 py-2 text-sm text-destructive hover:bg-muted transition-colors"
                      data-menu-action="delete"
                      onClick={() => handleMenuAction('delete')}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      role="menuitem"
                      className="flex items-center w-full px-3 py-2 text-sm hover:bg-muted transition-colors"
                      data-menu-action="copy-link"
                      onClick={() => handleMenuAction('copy-link')}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Link
                    </button>
                    <button
                      role="menuitem"
                      className="flex items-center w-full px-3 py-2 text-sm hover:bg-muted transition-colors"
                      data-menu-action="share"
                      onClick={() => handleMenuAction('share')}
                    >
                      <Share className="w-4 h-4 mr-2" />
                      Share
                    </button>
                  </>
                )}
              </div>
            )}

            {menuOpen && (
              <div 
                className="fixed inset-0 z-40"
                onClick={() => setMenuOpen(false)}
              />
            )}
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="post__body pb-3">
        <div className="post__content" style={{ marginLeft: 'calc(44px + 12px)' }}>
          {post.title && (
            <h3 className="font-semibold mb-2">{post.title}</h3>
          )}
          
          <div className="post__text mb-2">
            <div className={!isExpanded && shouldTruncate ? 'line-clamp-3' : ''}>
              {formatText(displayText)}
            </div>
            
            {shouldTruncate && (
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-muted-foreground hover:text-foreground text-sm mt-1"
              >
                {isExpanded ? 'Show less' : 'Read more'}
              </button>
            )}
          </div>

          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {post.tags.map((tag, index) => (
                <span 
                  key={index}
                  className="text-primary hover:underline cursor-pointer text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {post.media_urls && post.media_urls.length > 0 && (
          <div className="post__media w-full">
            <Suspense fallback={<div className="w-full h-64 bg-muted animate-pulse rounded-lg" />}>
              <MediaCarousel 
                mediaUrls={post.media_urls} 
                mediaTypes={post.media_types}
                postId={post.id}
              />
            </Suspense>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="post__footer px-4 pb-4">
        <div className="post__actions flex items-center gap-5">
          <button
            className="action action--like flex items-center gap-2 min-w-[44px] min-h-[44px] px-2 py-2 rounded-full hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors group"
            data-action="like"
            aria-pressed={post.user_liked}
            aria-label={post.user_liked ? 'Unlike post' : 'Like post'}
            onClick={handleLike}
            disabled={likeMutation.isPending}
          >
            <Heart 
              className={`icon w-5 h-5 transition-all group-hover:scale-110 ${
                post.user_liked 
                  ? 'fill-red-500 text-red-500' 
                  : 'text-muted-foreground group-hover:text-red-500'
              }`} 
            />
            <span 
              className="count text-sm text-muted-foreground group-hover:text-red-500"
              data-count-type="likes"
            >
              {post.likes_count}
            </span>
          </button>

          <button
            className="action action--comment flex items-center gap-2 min-w-[44px] min-h-[44px] px-2 py-2 rounded-full hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors group"
            data-action="comment"
            aria-label="View comments"
            onClick={handleComment}
          >
            <MessageCircle className="icon w-5 h-5 text-muted-foreground group-hover:text-blue-500 transition-all group-hover:scale-110" />
            <span 
              className="count text-sm text-muted-foreground group-hover:text-blue-500"
              data-count-type="comments"
            >
              {post.comments_count}
            </span>
          </button>

          <button
            className="action action--share flex items-center gap-2 min-w-[44px] min-h-[44px] px-2 py-2 rounded-full hover:bg-green-50 dark:hover:bg-green-950/20 transition-colors group"
            data-action="share"
            aria-label="Share post"
            onClick={handleShare}
          >
            <Share2 className="icon w-5 h-5 text-muted-foreground group-hover:text-green-500 transition-all group-hover:scale-110" />
            <span 
              className="count text-sm text-muted-foreground group-hover:text-green-500"
              data-count-type="shares"
            >
              {post.shares_count}
            </span>
          </button>
        </div>
      </footer>

      {/* Instagram Comment Modal */}
      {commentSheetOpen && (
        <Suspense fallback={null}>
          <InstagramCommentModal
            post={post}
            isOpen={commentSheetOpen}
            onClose={() => setCommentSheetOpen(false)}
          />
        </Suspense>
      )}

      {/* Edit Post Modal */}
      {editModalOpen && (
        <Suspense fallback={null}>
          <EditPostModal
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            post={post}
          />
        </Suspense>
      )}

      {/* Social Share Modal */}
      {socialShareModalOpen && (
        <Suspense fallback={null}>
          <SocialShareModal
            isOpen={socialShareModalOpen}
            onClose={() => setSocialShareModalOpen(false)}
            post={post}
          />
        </Suspense>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePost}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deletePostMutation.isPending}
            >
              {deletePostMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  );
}, (prevProps, nextProps) => {
  // Phase 1: Comprehensive comparison for memoization
  const prev = prevProps.post;
  const next = nextProps.post;
  
  return (
    prev.id === next.id &&
    prev.likes_count === next.likes_count &&
    prev.comments_count === next.comments_count &&
    prev.shares_count === next.shares_count &&
    prev.user_liked === next.user_liked &&
    prev.is_following === next.is_following &&
    prev.content === next.content &&
    prev.title === next.title &&
    prev.updated_at === next.updated_at &&
    JSON.stringify(prev.media_urls) === JSON.stringify(next.media_urls) &&
    JSON.stringify(prev.tags) === JSON.stringify(next.tags) &&
    prev.profiles?.avatar_url === next.profiles?.avatar_url &&
    prev.profiles?.display_name === next.profiles?.display_name
  );
});

PostRowWide.displayName = 'PostRowWide';
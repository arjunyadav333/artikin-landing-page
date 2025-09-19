import { useState, useEffect, useRef } from 'react';
import { X, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { HomeFeedPost } from '@/hooks/useHomeFeed';
import { useAuth } from '@/hooks/useAuth';
import { useComments, useCreateComment, Comment } from '@/hooks/useComments';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface InstagramCommentModalProps {
  post: HomeFeedPost;
  isOpen: boolean;
  onClose: () => void;
}

export function InstagramCommentModal({ post, isOpen, onClose }: InstagramCommentModalProps) {
  const [commentText, setCommentText] = useState("");
  const [showNewBadge, setShowNewBadge] = useState(false);
  const [pendingComments, setPendingComments] = useState<Comment[]>([]);
  const { user } = useAuth();
  const { toast } = useToast();
  const { data: comments = [], isLoading } = useComments(post.id);
  const createCommentMutation = useCreateComment();
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Body scroll lock effect
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Auto-focus input
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Show new comment badge when comments arrive
  useEffect(() => {
    if (comments.length > 0 && isOpen) {
      setShowNewBadge(true);
      const timer = setTimeout(() => setShowNewBadge(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [comments.length, isOpen]);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !user) return;

    const tempId = `temp-${Date.now()}`;
    const optimisticComment: Comment = {
      id: tempId,
      post_id: post.id,
      user_id: user.id,
      content: commentText.trim(),
      likes_count: 0,
      user_liked: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profiles: {
        id: user.id,
        display_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'You',
        username: user.user_metadata?.username || user.email?.split('@')[0] || 'you',
        avatar_url: user.user_metadata?.avatar_url,
        role: user.user_metadata?.role as 'artist' | 'organization' | undefined,
        artform: user.user_metadata?.artform
      }
    };

    // Optimistic update - add to pending
    setPendingComments(prev => [optimisticComment, ...prev]);
    setCommentText("");

    try {
      await createCommentMutation.mutateAsync({
        postId: post.id,
        content: optimisticComment.content
      });
      
      // Remove from pending after successful submission
      setPendingComments(prev => prev.filter(c => c.id !== tempId));
    } catch (error) {
      // Remove failed comment and show error
      setPendingComments(prev => prev.filter(c => c.id !== tempId));
      toast({
        title: "Failed to post comment",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmitComment(e as any);
    }
  };

  const getInstagramTimeAgo = (dateString: string): string => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)}w`;
    
    return `${Math.floor(diffInSeconds / 2592000)}mo`;
  };

  // Combine pending and real comments, most recent first
  const allComments = [...pendingComments, ...comments].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/45 backdrop-blur-sm animate-in fade-in duration-150" 
        onClick={onClose}
      />
      
      {/* Modal - Desktop centered, Mobile bottom sheet */}
      <div className={cn(
        "relative bg-background rounded-t-2xl md:rounded-2xl flex flex-col",
        "w-full max-w-lg mx-auto mt-auto md:mt-0 md:my-auto",
        "max-h-[95vh] md:max-h-[80vh]",
        "animate-in slide-in-from-bottom-8 md:slide-in-from-bottom-2 fade-in duration-220",
        "md:animate-in md:fade-in md:zoom-in-95 md:duration-160"
      )}>
        
        {/* Sticky Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-background sticky top-0 z-10">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Link to={`/profile/${post.user_id}`} className="flex-shrink-0">
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={post.profiles?.avatar_url || post.profiles?.profile_pic} 
                  alt={post.profiles?.display_name}
                />
                <AvatarFallback className="bg-muted text-foreground text-xs">
                  {post.profiles?.display_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm truncate">
                {post.profiles?.display_name || 'Unknown User'}
              </h3>
              <p className="text-xs text-muted-foreground">
                Comments • {(allComments.length || 0)}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* New Comment Badge */}
        {showNewBadge && (
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-20">
            <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs animate-in fade-in slide-in-from-top-2 duration-200">
              New
            </div>
          </div>
        )}

        {/* Comments List - Scrollable */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 min-h-0"
          style={{ 
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain'
          }}
        >
          {isLoading ? (
            <div className="space-y-4 py-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <div className="h-8 w-8 bg-muted rounded-full flex-shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-muted rounded w-1/3"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : allComments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No comments yet</p>
              <p className="text-muted-foreground text-sm mt-1">Be the first to comment!</p>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {allComments.map((comment, index) => (
                <div 
                  key={comment.id} 
                  className={cn(
                    "flex gap-3 py-3",
                    comment.id.startsWith('temp-') && "animate-in fade-in zoom-in-95 duration-180"
                  )}
                >
                  <Link to={`/profile/${comment.user_id}`} className="flex-shrink-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage 
                        src={comment.profiles?.avatar_url} 
                        alt={comment.profiles?.display_name}
                      />
                      <AvatarFallback className="bg-muted text-foreground text-xs">
                        {comment.profiles?.display_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Link 
                        to={`/profile/${comment.user_id}`}
                        className="font-semibold text-sm hover:text-primary transition-colors"
                      >
                        {comment.profiles?.display_name || comment.profiles?.username}
                      </Link>
                      <span className="text-muted-foreground text-sm">
                        {getInstagramTimeAgo(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-sm break-words leading-5">
                      {comment.content}
                    </p>
                  </div>
                  {comment.user_id === user?.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity self-start"
                    >
                      <MoreVertical className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sticky Composer */}
        {user && (
          <div className="px-4 py-3 border-t border-border bg-background sticky bottom-0">
            <form onSubmit={handleSubmitComment} className="flex gap-3 items-center">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarImage src={user.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-muted text-foreground text-xs">
                  {user.user_metadata?.full_name?.charAt(0) || user.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Add a comment..."
                  className="flex-1 bg-transparent text-sm border-none outline-none placeholder:text-muted-foreground py-2"
                  disabled={createCommentMutation.isPending}
                />
                {commentText.trim() && (
                  <Button
                    type="submit"
                    size="sm"
                    variant="ghost"
                    className="text-primary hover:text-primary/80 px-2 py-1 h-auto text-sm font-semibold"
                    disabled={createCommentMutation.isPending}
                  >
                    {createCommentMutation.isPending ? 'Posting...' : 'Post'}
                  </Button>
                )}
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
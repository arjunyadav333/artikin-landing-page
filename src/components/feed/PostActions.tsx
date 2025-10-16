import { useState } from 'react';
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { HomeFeedPost, useLikePost, useSharePost } from '@/hooks/useHomeFeed';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { useToggleSave, useIsPostSaved } from '@/hooks/useSaves';

interface PostActionsProps {
  post: HomeFeedPost;
}

export const PostActions = ({ post }: PostActionsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const likeMutation = useLikePost(20);
  const shareMutation = useSharePost();
  const toggleSave = useToggleSave();
  const { data: isSaved = false } = useIsPostSaved(post.id);
  const [showComments, setShowComments] = useState(false);

  const handleLike = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to like posts",
        variant: "destructive"
      });
      return;
    }
    
    likeMutation.mutate({ 
      postId: post.id, 
      isLiked: post.user_liked || false 
    });
  };

  const handleComment = () => {
    setShowComments(!showComments);
  };

  const handleShare = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to share posts",
        variant: "destructive"
      });
      return;
    }

    // For now, just copy link to clipboard
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
    toast({
      title: "Link copied",
      description: "Post link copied to clipboard"
    });
  };

  const handleSave = () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to save posts",
        variant: "destructive"
      });
      return;
    }
    
    toggleSave.mutate({ 
      postId: post.id, 
      isSaved: isSaved 
    });
  };

  return (
    <div className="post__actions border-t border-border pt-[var(--sp-sm)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {/* Like Button */}
          <button
            onClick={handleLike}
            disabled={likeMutation.isPending}
            className="flex items-center space-x-2 group hover:text-red-500 transition-colors min-h-[44px] min-w-[44px]"
            data-action="like"
            aria-label={post.user_liked ? 'Unlike post' : 'Like post'}
            aria-pressed={post.user_liked}
          >
            <Heart 
              className={`h-5 w-5 transition-all group-hover:scale-110 ${
                post.user_liked 
                  ? 'fill-red-500 text-red-500' 
                  : 'text-muted-foreground group-hover:text-red-500'
              }`} 
            />
            <span 
              className="text-muted-foreground group-hover:text-red-500"
              style={{ fontSize: 'var(--fs-action)' }}
              data-count-type="likes"
            >
              {post.likes_count}
            </span>
          </button>

          {/* Comment Button */}
          <button
            onClick={handleComment}
            className="flex items-center space-x-2 group hover:text-blue-500 transition-colors min-h-[44px] min-w-[44px]"
            data-action="comment"
            aria-label="View comments"
          >
            <MessageCircle className="h-5 w-5 text-muted-foreground group-hover:text-blue-500 transition-all group-hover:scale-110" />
            <span 
              className="text-muted-foreground group-hover:text-blue-500"
              style={{ fontSize: 'var(--fs-action)' }}
              data-count-type="comments"
            >
              {post.comments_count}
            </span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            disabled={shareMutation.isPending}
            className="flex items-center space-x-2 group hover:text-green-500 transition-colors min-h-[44px] min-w-[44px]"
            data-action="share"
            aria-label="Share post"
          >
            <Share2 className="h-5 w-5 text-muted-foreground group-hover:text-green-500 transition-all group-hover:scale-110" />
            <span 
              className="text-muted-foreground group-hover:text-green-500"
              style={{ fontSize: 'var(--fs-action)' }}
              data-count-type="shares"
            >
              {post.shares_count}
            </span>
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={toggleSave.isPending}
            className="flex items-center space-x-2 group hover:text-yellow-500 transition-colors min-h-[44px] min-w-[44px]"
            data-action="save"
            aria-label={isSaved ? 'Unsave post' : 'Save post'}
            aria-pressed={isSaved}
          >
            <Bookmark 
              className={`h-5 w-5 transition-all group-hover:scale-110 ${
                isSaved 
                  ? 'fill-yellow-500 text-yellow-500' 
                  : 'text-muted-foreground group-hover:text-yellow-500'
              }`} 
            />
            <span 
              className="text-muted-foreground group-hover:text-yellow-500"
              style={{ fontSize: 'var(--fs-action)' }}
              data-count-type="saves"
            >
              {post.saves_count || 0}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
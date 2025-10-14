import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Heart, Send } from "lucide-react";
import { Post } from "@/hooks/usePosts";
import { useAuth } from "@/hooks/useAuth";
import { useComments, useCreateComment, useLikeComment } from "@/hooks/useComments";
import { Link } from "react-router-dom";
import { getTimeAgo } from "@/lib/timeUtils";

interface CommentModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
}

export function CommentModal({ post, isOpen, onClose }: CommentModalProps) {
  const [commentText, setCommentText] = useState("");
  const { user } = useAuth();
  const { data: comments, isLoading } = useComments(post.id);
  const createCommentMutation = useCreateComment();
  const likeCommentMutation = useLikeComment();

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      await createCommentMutation.mutateAsync({
        postId: post.id,
        content: commentText.trim()
      });
      setCommentText("");
    } catch (error) {
      console.error('Failed to create comment:', error);
    }
  };

  const handleLikeComment = (commentId: string, isLiked: boolean) => {
    likeCommentMutation.mutate({ commentId, isLiked });
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
      return word + ' ';
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full max-h-[80vh] flex flex-col p-0">
        <DialogHeader className="px-4 py-3 border-b border-border">
          <DialogTitle className="text-base font-semibold">Comments</DialogTitle>
        </DialogHeader>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto px-4 py-2">
          {/* Original Post */}
          <div className="flex space-x-3 pb-4 border-b border-border mb-4">
            <Link to={`/profile/${post.profiles?.username || post.user_id}`}>
              <Avatar className="h-8 w-8">
                <AvatarImage src={post.profiles?.avatar_url} alt={post.profiles?.display_name} />
                <AvatarFallback className="bg-muted text-foreground text-xs">
                  {post.profiles?.display_name?.split(' ').map(n => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
            </Link>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <Link 
                  to={`/profile/${post.profiles?.username || post.user_id}`}
                  className="font-semibold text-sm hover:text-primary transition-colors"
                >
                  {post.profiles?.display_name}
                </Link>
                <span className="text-xs text-muted-foreground">
                  {getTimeAgo(post.created_at)}
                </span>
              </div>
              <p className="text-sm">{formatText(post.content)}</p>
            </div>
          </div>

          {/* Comments */}
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex space-x-3 animate-pulse">
                  <div className="h-8 w-8 bg-muted rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-1/3"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : comments && comments.length > 0 ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <Link to={`/profile/${comment.profiles?.username || comment.user_id}`}>
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={comment.profiles?.avatar_url} alt={comment.profiles?.display_name} />
                      <AvatarFallback className="bg-muted text-foreground text-xs">
                        {comment.profiles?.display_name?.split(' ').map(n => n[0]).join('') || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Link 
                        to={`/profile/${comment.profiles?.username || comment.user_id}`}
                        className="font-semibold text-sm hover:text-primary transition-colors"
                      >
                        {comment.profiles?.display_name}
                      </Link>
                      <span className="text-xs text-muted-foreground">
                        {getTimeAgo(comment.created_at)}
                      </span>
                    </div>
                    <p className="text-sm mb-2">{formatText(comment.content)}</p>
                    <div className="flex items-center space-x-4">
                      <button
                        className="flex items-center space-x-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => handleLikeComment(comment.id, comment.user_liked || false)}
                      >
                        <Heart 
                          className={`h-3 w-3 ${
                            comment.user_liked ? 'fill-red-500 text-red-500' : ''
                          }`} 
                        />
                        {comment.likes_count > 0 && <span>{comment.likes_count}</span>}
                      </button>
                      <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                        Reply
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground text-sm">No comments yet</p>
              <p className="text-muted-foreground text-xs mt-1">Be the first to comment!</p>
            </div>
          )}
        </div>

        {/* Comment Input */}
        <div className="border-t border-border p-4">
          <form onSubmit={handleSubmitComment} className="flex space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="bg-muted text-foreground text-xs">
                {user?.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 flex space-x-2">
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 bg-transparent text-sm border-none outline-none placeholder:text-muted-foreground"
                disabled={createCommentMutation.isPending}
              />
              <Button
                type="submit"
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 text-primary hover:text-primary/80"
                disabled={!commentText.trim() || createCommentMutation.isPending}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}

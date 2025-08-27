import React, { useState, useEffect, useRef } from "react";
import { X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { useComments, useAddComment } from "@/hooks/useComments";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

interface CommentDrawerProps {
  postId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CommentDrawer: React.FC<CommentDrawerProps> = ({
  postId,
  isOpen,
  onClose,
}) => {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();
  const { data: comments, isLoading } = useComments(postId);
  const { mutate: addComment } = useAddComment();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      // Small delay to ensure drawer is fully opened
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || !postId || isSubmitting) return;

    setIsSubmitting(true);
    try {
      addComment({
        postId,
        content: comment.trim(),
      });
      setComment("");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 md:hidden"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className={`
        fixed bottom-0 left-0 right-0 bg-background border-t border-border z-50
        transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-y-0' : 'translate-y-full'}
        h-[85vh] rounded-t-2xl shadow-2xl
        md:max-w-md md:mx-auto md:left-auto md:right-4 md:bottom-4 md:top-auto
        md:h-[600px] md:rounded-2xl md:border
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-lg">Comments</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 pb-20">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex space-x-3">
                  <div className="w-8 h-8 bg-muted rounded-full animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse w-1/4" />
                    <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : comments?.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No comments yet</p>
              <p className="text-sm text-muted-foreground">Be the first to comment!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {comments?.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <Link to={`/profile/${comment.profiles?.id}`}>
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={comment.profiles?.avatar_url} />
                      <AvatarFallback className="text-xs">
                        {comment.profiles?.display_name?.[0]?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <Link 
                        to={`/profile/${comment.profiles?.id}`}
                        className="font-medium text-sm hover:text-primary transition-colors"
                      >
                        {comment.profiles?.display_name}
                      </Link>
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-sm text-foreground mt-1 leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Comment Input */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-border bg-background">
          <form onSubmit={handleSubmit} className="flex space-x-3">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="text-xs">
                {user?.user_metadata?.display_name?.[0]?.toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 flex space-x-2">
              <Input
                ref={inputRef}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Add a comment..."
                className="rounded-full border-border/50 focus:border-primary"
                disabled={isSubmitting}
              />
              <Button
                type="submit"
                size="sm"
                disabled={!comment.trim() || isSubmitting}
                className="rounded-full px-4"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
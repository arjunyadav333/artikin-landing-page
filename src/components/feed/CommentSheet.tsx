import React, { useState, useEffect } from 'react';
import { X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { HomeFeedPost } from '@/hooks/useHomeFeed';

interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: {
    display_name: string;
    username: string;
    avatar_url?: string;
  };
}

interface CommentSheetProps {
  post: HomeFeedPost;
  isOpen: boolean;
  onClose: () => void;
  onCommentAdded: () => void;
}

export const CommentSheet: React.FC<CommentSheetProps> = ({
  post,
  isOpen,
  onClose,
  onCommentAdded
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load comments when sheet opens
  useEffect(() => {
    if (isOpen && post?.id) {
      loadComments();
      
      // Subscribe to new comments for this post
      const channel = supabase
        .channel(`comments-${post.id}`)
        .on('postgres_changes', {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
          filter: `post_id=eq.${post.id}`
        }, (payload) => {
          const newComment = payload.new as any;
          // Fetch the comment with profile data
          fetchCommentWithProfile(newComment.id);
        })
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [isOpen, post?.id]);

  const loadComments = async () => {
    if (!post?.id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          post_id,
          user_id,
          content,
          created_at
        `)
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Fetch profiles separately for each comment
      const commentsWithProfiles = await Promise.all(
        (data || []).map(async (comment) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('display_name, username, avatar_url')
            .eq('user_id', comment.user_id)
            .single();

          return {
            ...comment,
            profiles: profile || {
              display_name: 'Unknown User',
              username: 'unknown',
              avatar_url: null
            }
          };
        })
      );

      setComments(commentsWithProfiles);
    } catch (error) {
      console.error('Failed to load comments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCommentWithProfile = async (commentId: string) => {
    try {
      const { data: comment, error } = await supabase
        .from('comments')
        .select('id, post_id, user_id, content, created_at')
        .eq('id', commentId)
        .single();

      if (error) throw error;
      if (comment) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, username, avatar_url')
          .eq('user_id', comment.user_id)
          .single();

        const commentWithProfile = {
          ...comment,
          profiles: profile || {
            display_name: 'Unknown User',
            username: 'unknown',
            avatar_url: null
          }
        };

        setComments(prev => [...prev, commentWithProfile]);
      }
    } catch (error) {
      console.error('Failed to fetch comment:', error);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert({
          post_id: post.id,
          user_id: user.id,
          content: newComment.trim()
        });

      if (error) throw error;

      setNewComment('');
      onCommentAdded();
    } catch (error) {
      console.error('Failed to post comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Sheet */}
      <div className="relative w-full max-w-lg bg-background rounded-t-2xl sm:rounded-2xl max-h-[85vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <img 
                src={post.profiles.avatar_url || '/placeholder.svg'} 
                alt={post.profiles.display_name}
                className="h-full w-full object-cover"
              />
            </Avatar>
            <div>
              <h3 className="font-semibold text-sm">{post.profiles.display_name}</h3>
              <p className="text-xs text-muted-foreground line-clamp-1">
                {post.content}
              </p>
            </div>
          </div>
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
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="flex gap-3">
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <img 
                    src={comment.profiles.avatar_url || '/placeholder.svg'} 
                    alt={comment.profiles.display_name}
                    className="h-full w-full object-cover"
                  />
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="bg-muted rounded-2xl px-3 py-2">
                    <p className="font-semibold text-sm">{comment.profiles.display_name}</p>
                    <p className="text-sm text-foreground">{comment.content}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 ml-3">
                    {new Date(comment.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Comment Input */}
        {user && (
          <form onSubmit={handleSubmitComment} className="p-4 border-t border-border">
            <div className="flex gap-3">
              <Avatar className="h-8 w-8 flex-shrink-0">
                <img 
                  src={user.user_metadata?.avatar_url || '/placeholder.svg'} 
                  alt="Your avatar"
                  className="h-full w-full object-cover"
                />
              </Avatar>
              <div className="flex-1 flex gap-2">
                <Textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  className="min-h-[38px] max-h-24 resize-none text-sm"
                  rows={1}
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={!newComment.trim() || isSubmitting}
                  className="flex-shrink-0 h-[38px] w-[38px] p-0"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
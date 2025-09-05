import { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';

interface Comment {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles?: {
    username: string;
    display_name: string;
    avatar_url?: string;
  };
}

interface CommentsPreviewProps {
  postId: string;
  maxComments?: number;
}

export const CommentsPreview = ({ postId, maxComments = 2 }: CommentsPreviewProps) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [totalComments, setTotalComments] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      // Get total count
      const { count } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId);

      setTotalComments(count || 0);

      if (count && count > 0) {
        // Get latest comments
        const { data: commentsData, error } = await supabase
          .from('comments')
          .select('id, content, created_at, user_id')
          .eq('post_id', postId)
          .order('created_at', { ascending: true })
          .limit(maxComments);

        if (error) throw error;
        
        if (commentsData && commentsData.length > 0) {
          // Get profiles for comment authors
          const userIds = [...new Set(commentsData.map(c => c.user_id))];
          const { data: profiles } = await supabase
            .from('profiles')
            .select('user_id, username, display_name, avatar_url')
            .in('user_id', userIds);

          const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);
          
          const commentsWithProfiles = commentsData.map(comment => ({
            ...comment,
            profiles: profileMap.get(comment.user_id)
          }));
          
          setComments(commentsWithProfiles);
        }
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="mt-2 space-y-2">
        <div className="h-4 bg-muted rounded animate-pulse" />
        <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
      </div>
    );
  }

  if (totalComments === 0) {
    return null;
  }

  return (
    <div className="space-y-2" style={{ fontSize: 'var(--fs-meta)' }}>
      {totalComments > maxComments && (
        <Link
          to={`/post/${postId}`}
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          View all {totalComments} comments
        </Link>
      )}

      {comments.map((comment) => (
        <div key={comment.id} className="flex items-start space-x-2">
          <Avatar className="h-6 w-6 flex-shrink-0">
            <AvatarImage 
              src={comment.profiles?.avatar_url} 
              alt={comment.profiles?.display_name} 
            />
            <AvatarFallback className="text-xs">
              {comment.profiles?.display_name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="bg-muted rounded-lg px-3 py-2">
              <Link
                to={`/profile/${comment.user_id}`}
                className="font-medium hover:underline"
              >
                {comment.profiles?.display_name || 'Unknown User'}
              </Link>
              <p className="text-foreground mt-1">{comment.content}</p>
            </div>
          </div>
        </div>
      ))}

      {totalComments > comments.length && (
        <Link
          to={`/post/${postId}`}
          className="text-primary hover:underline text-sm"
        >
          View more comments
        </Link>
      )}
    </div>
  );
};
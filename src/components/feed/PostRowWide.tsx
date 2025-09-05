import { useState } from 'react';
import { Heart, MessageCircle, Share2, UserPlus, UserCheck, MoreVertical } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';
import { HomeFeedPost, useLikePost, useFollowUser, useSharePost } from '@/hooks/useHomeFeed';
import { useAuth } from '@/hooks/useAuth';
import { PostHeader } from './PostHeader';
import { PostBody } from './PostBody';
import { PostActions } from './PostActions';
import { CommentsPreview } from './CommentsPreview';

interface PostRowWideProps {
  post: HomeFeedPost;
}

export const PostRowWide = ({ post }: PostRowWideProps) => {
  const { user } = useAuth();
  const isOwner = user?.id === post.user_id;

  return (
    <article 
      className="post w-full border-b border-border bg-background animate-fade-in"
      data-post-id={post.id}
      data-author-id={post.user_id}
    >
      <div className="px-[var(--sp-lg)] py-[var(--sp-md)] sm:px-[var(--sp-lg)] space-y-[var(--sp-sm)]">
        <PostHeader post={post} isOwner={isOwner} />
        <PostBody post={post} />
        <PostActions post={post} />
        <CommentsPreview postId={post.id} />
      </div>
    </article>
  );
};
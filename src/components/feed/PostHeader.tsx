import { UserPlus, UserCheck, MoreVertical, Edit, Trash2, Copy, Flag, EyeOff } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';
import { HomeFeedPost, useFollowUser } from '@/hooks/useHomeFeed';
import { useAuth } from '@/hooks/useAuth';

interface PostHeaderProps {
  post: HomeFeedPost;
  isOwner: boolean;
}

export const PostHeader = ({ post, isOwner }: PostHeaderProps) => {
  const { user } = useAuth();
  const followMutation = useFollowUser();

  const handleFollow = () => {
    if (!user) return;
    followMutation.mutate({ 
      userId: post.user_id, 
      isFollowing: post.is_following || false 
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`);
  };

  const getDisplayRole = () => {
    if (post.profiles.account_type === 'artist' && post.profiles.art_form) {
      return post.profiles.art_form;
    }
    return post.profiles.organization_type || 'Organization';
  };

  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center space-x-[var(--sp-sm)]">
        <Link to={`/profile/${post.user_id}`} className="flex-shrink-0">
          <Avatar className="h-10 w-10 hover:opacity-80 transition-opacity">
            <AvatarImage 
              src={post.profiles.avatar_url || post.profiles.profile_pic} 
              alt={post.profiles.display_name || post.profiles.full_name} 
            />
            <AvatarFallback>
              {(post.profiles.display_name || post.profiles.full_name || 'U').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Link>
        
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-2">
            <Link 
              to={`/profile/${post.user_id}`}
              className="post_fullname font-semibold hover:underline truncate"
              style={{ fontSize: 'var(--fs-name)' }}
            >
              {post.profiles.display_name || post.profiles.full_name || 'Unknown User'}
            </Link>
          </div>
          
          <div className="flex items-center space-x-1 text-muted-foreground" style={{ fontSize: 'var(--fs-meta)' }}>
            <span className="posthandle">
              @{post.profiles.handle || post.profiles.username || 'user'}
            </span>
            <span>•</span>
            <span className="post_role">
              {getDisplayRole()}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {!isOwner && user && (
          <Button
            variant={post.is_following ? "secondary" : "default"}
            size="sm"
            onClick={handleFollow}
            disabled={followMutation.isPending}
            className={`btn--follow min-w-[80px] h-8 ${
              post.is_following 
                ? 'bg-sky-100 text-sky-700 hover:bg-sky-200 dark:bg-sky-900 dark:text-sky-300' 
                : ''
            }`}
            data-follow-user-id={post.user_id}
            aria-pressed={post.is_following}
            aria-label={post.is_following ? 'Unfollow user' : 'Follow user'}
          >
            {post.is_following ? (
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
            <Button
              variant="ghost"
              size="sm"
              className="btn--menu h-8 w-8 p-0"
              aria-haspopup="true"
              aria-label="Post options"
            >
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-popover z-50">
            {isOwner ? (
              <>
                <DropdownMenuItem className="cursor-pointer">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Post
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Post
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem className="cursor-pointer">
                  <Flag className="h-4 w-4 mr-2" />
                  Report Post
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <EyeOff className="h-4 w-4 mr-2" />
                  Hide Post
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};
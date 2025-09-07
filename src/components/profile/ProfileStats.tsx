import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import type { ProfileWithStats } from '@/hooks/useProfileByUsername';

interface ProfileStatsProps {
  profile: ProfileWithStats;
  followers?: any[];
  following?: any[];
}

export function ProfileStats({ profile, followers = [], following = [] }: ProfileStatsProps) {
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);
  const navigate = useNavigate();
  const handleStatsClick = (type: 'posts' | 'followers' | 'following') => {
    if (type === 'posts') {
      navigate(`/profile/${profile.username}/posts`);
    } else if (type === 'followers') {
      if (followers.length > 0) {
        setShowFollowers(true);
      } else {
        navigate(`/profile/${profile.username}/followers`);
      }
    } else if (type === 'following') {
      if (following.length > 0) {
        setShowFollowing(true);
      } else {
        navigate(`/profile/${profile.username}/following`);
      }
    }
  };

  return (
    <>
      <div className="grid grid-cols-3 md:grid-cols-4 gap-4 md:gap-8 py-4 md:py-6 border-b max-w-5xl mx-auto px-4 md:px-6 lg:px-8">
        <div 
          className="text-center cursor-pointer hover:bg-muted/50 rounded-lg p-2 md:p-3 transition-colors"
          onClick={() => handleStatsClick('posts')}
        >
          <div className="text-lg md:text-2xl font-bold text-foreground">{profile.posts_count || 0}</div>
          <div className="text-xs md:text-sm text-muted-foreground">Posts</div>
        </div>
        
        <div 
          className="text-center cursor-pointer hover:bg-muted/50 rounded-lg p-2 md:p-3 transition-colors"
          onClick={() => handleStatsClick('followers')}
        >
          <div className="text-lg md:text-2xl font-bold text-foreground">{profile.follower_count || 0}</div>
          <div className="text-xs md:text-sm text-muted-foreground">Followers</div>
        </div>
        
        <div 
          className="text-center cursor-pointer hover:bg-muted/50 rounded-lg p-2 md:p-3 transition-colors"
          onClick={() => handleStatsClick('following')}
        >
          <div className="text-lg md:text-2xl font-bold text-foreground">{profile.following_count || 0}</div>
          <div className="text-xs md:text-sm text-muted-foreground">Following</div>
        </div>

        <div className="text-center hidden md:block">
          {profile.role === 'organization' ? (
            <div className="p-2 md:p-3">
              <div className="text-lg md:text-2xl font-bold text-foreground">0</div>
              <div className="text-xs md:text-sm text-muted-foreground">Opportunities</div>
            </div>
          ) : (
            <div className="p-2 md:p-3">
              <div className="text-lg md:text-2xl font-bold text-foreground">0</div>
              <div className="text-xs md:text-sm text-muted-foreground">Portfolio</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
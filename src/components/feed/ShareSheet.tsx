import React, { useState } from 'react';
import { X, Link, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { HomeFeedPost } from '@/hooks/useHomeFeed';

interface ShareSheetProps {
  post: HomeFeedPost;
  isOpen: boolean;
  onClose: () => void;
  onShareRecorded: () => void;
}

interface SharePlatform {
  id: string;
  name: string;
  icon: string;
  color: string;
  action: (postUrl: string) => void;
}

export const ShareSheet: React.FC<ShareSheetProps> = ({
  post,
  isOpen,
  onClose,
  onShareRecorded
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);

  const postUrl = `${window.location.origin}/post/${post.id}`;

  const recordShare = async (platform: string) => {
    if (!user || isRecording) return;

    setIsRecording(true);
    try {
      const { error } = await supabase
        .from('shares')
        .insert({
          post_id: post.id,
          user_id: user.id,
          platform
        });

      if (error) throw error;
      onShareRecorded();
    } catch (error) {
      console.error('Failed to record share:', error);
      toast({
        title: "Failed to record share",
        description: "Share was completed but not recorded",
        variant: "destructive"
      });
    } finally {
      setIsRecording(false);
    }
  };

  const platforms: SharePlatform[] = [
    {
      id: 'facebook',
      name: 'Facebook',
      icon: '📘',
      color: 'bg-blue-600',
      action: (url) => {
        recordShare('facebook');
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
      }
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: '🐦',
      color: 'bg-sky-500',
      action: (url) => {
        recordShare('twitter');
        const text = `Check out this post from ${post.profiles.display_name}`;
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
      }
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: '💬',
      color: 'bg-green-600',
      action: (url) => {
        recordShare('whatsapp');
        const text = `Check out this post: ${url}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
      }
    },
    {
      id: 'instagram',
      name: 'Instagram',
      icon: '📷',
      color: 'bg-gradient-to-br from-purple-600 to-pink-600',
      action: (url) => {
        recordShare('instagram');
        // Instagram doesn't support direct URL sharing, so copy to clipboard
        copyToClipboard(url);
        toast({
          title: "Link copied for Instagram",
          description: "Paste the link in your Instagram story or post"
        });
      }
    }
  ];

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      recordShare('copy');
      toast({
        title: "Link copied",
        description: "Post link has been copied to your clipboard"
      });
      onClose();
    } catch (error) {
      console.error('Failed to copy:', error);
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive"
      });
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
      <div className="relative w-full max-w-sm bg-background rounded-t-2xl sm:rounded-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            <h3 className="font-semibold">Share Post</h3>
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

        {/* Post Preview */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-8 w-8 rounded-full bg-muted flex-shrink-0">
              <img 
                src={post.profiles.avatar_url || '/placeholder.svg'} 
                alt={post.profiles.display_name}
                className="h-full w-full object-cover rounded-full"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-sm">{post.profiles.display_name}</p>
              <p className="text-xs text-muted-foreground">
                {post.profiles.account_type === 'artist' ? 'Artist' : 'Organization'}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {post.content}
          </p>
        </div>

        {/* Share Options */}
        <div className="p-4 space-y-3">
          {/* Platform Grid */}
          <div className="grid grid-cols-2 gap-3">
            {platforms.map((platform) => (
              <button
                key={platform.id}
                onClick={() => platform.action(postUrl)}
                disabled={isRecording}
                className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors disabled:opacity-50"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${platform.color}`}>
                  <span className="text-sm">{platform.icon}</span>
                </div>
                <span className="font-medium text-sm">{platform.name}</span>
              </button>
            ))}
          </div>

          {/* Copy Link Button */}
          <Button
            onClick={() => copyToClipboard(postUrl)}
            variant="outline"
            className="w-full justify-start"
            disabled={isRecording}
          >
            <Link className="h-4 w-4 mr-2" />
            Copy Link
          </Button>
        </div>
      </div>
    </div>
  );
};
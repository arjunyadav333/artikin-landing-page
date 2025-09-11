import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Facebook, Twitter, Linkedin, MessageCircle, Copy, Share } from 'lucide-react';

interface SocialShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: {
    id: string;
    content: string;
    profiles: {
      display_name: string;
    };
  };
}

export const SocialShareModal = ({ isOpen, onClose, post }: SocialShareModalProps) => {
  const { toast } = useToast();
  const postUrl = `${window.location.origin}/post/${post.id}`;
  const shareText = `Check out this post by ${post.profiles.display_name}: ${post.content.slice(0, 100)}${post.content.length > 100 ? '...' : ''}`;

  const shareOptions = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`,
      color: 'text-blue-600'
    },
    {
      name: 'Twitter/X',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(postUrl)}`,
      color: 'text-black'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`,
      color: 'text-blue-700'
    },
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      url: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + postUrl)}`,
      color: 'text-green-500'
    }
  ];

  const handleShare = (url: string) => {
    window.open(url, '_blank', 'width=600,height=400');
    onClose();
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(postUrl);
    toast({
      title: "Link copied",
      description: "Post link copied to clipboard"
    });
    onClose();
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Post by ${post.profiles.display_name}`,
          text: shareText,
          url: postUrl,
        });
        onClose();
      } catch (error) {
        // User cancelled or error occurred
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Share Post</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-2 gap-3">
          {shareOptions.map((option) => (
            <Button
              key={option.name}
              variant="outline"
              className="flex items-center gap-2 h-12"
              onClick={() => handleShare(option.url)}
            >
              <option.icon className={`w-5 h-5 ${option.color}`} />
              {option.name}
            </Button>
          ))}
          
          <Button
            variant="outline"
            className="flex items-center gap-2 h-12"
            onClick={handleCopyLink}
          >
            <Copy className="w-5 h-5 text-gray-600" />
            Copy Link
          </Button>

          {navigator.share && (
            <Button
              variant="outline"
              className="flex items-center gap-2 h-12"
              onClick={handleNativeShare}
            >
              <Share className="w-5 h-5 text-gray-600" />
              More
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
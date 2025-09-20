import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Share, Copy, MessageCircle, Mail, Twitter, Facebook, Linkedin } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShareBottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'opportunity' | 'post' | 'profile';
  data: {
    url: string;
    title?: string;
    company?: string;
    description?: string;
  };
}

export const ShareBottomSheet: React.FC<ShareBottomSheetProps> = ({
  open,
  onOpenChange,
  type,
  data
}) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const shareText = data.company 
    ? `Check out this ${type}: ${data.title} at ${data.company}` 
    : `Check out this ${type}: ${data.title}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(data.url);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "The link has been copied to your clipboard."
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(data.url);
    const encodedText = encodeURIComponent(shareText);
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${encodeURIComponent(data.title || '')}&body=${encodedText}%0A%0A${encodedUrl}`;
        break;
      case 'sms':
        shareUrl = `sms:?body=${encodedText}%20${encodedUrl}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const shareOptions = [
    { id: 'copy', label: 'Copy Link', icon: Copy, action: handleCopyLink },
    { id: 'twitter', label: 'Twitter', icon: Twitter, action: () => handleShare('twitter') },
    { id: 'facebook', label: 'Facebook', icon: Facebook, action: () => handleShare('facebook') },
    { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, action: () => handleShare('linkedin') },
    { id: 'email', label: 'Email', icon: Mail, action: () => handleShare('email') },
    { id: 'sms', label: 'SMS', icon: MessageCircle, action: () => handleShare('sms') },
  ];

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Share className="w-5 h-5" />
            Share {type}
          </SheetTitle>
        </SheetHeader>
        
        <div className="grid grid-cols-3 gap-4 mt-6 mb-4">
          {shareOptions.map((option) => {
            const Icon = option.icon;
            return (
              <Button
                key={option.id}
                variant="outline"
                className="flex flex-col gap-2 h-auto py-4"
                onClick={option.action}
              >
                <Icon className={cn("w-6 h-6", option.id === 'copy' && copied && "text-green-500")} />
                <span className="text-xs">{option.id === 'copy' && copied ? 'Copied!' : option.label}</span>
              </Button>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
};
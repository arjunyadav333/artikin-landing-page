import { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Share2, Copy, Facebook, Twitter, Linkedin, MessageCircle, Mail } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  profileUrl: string;
  profileName: string;
}

export function ShareModal({ isOpen, onClose, profileUrl, profileName }: ShareModalProps) {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [isCopying, setIsCopying] = useState(false);

  const shareOptions = [
    {
      label: 'Copy Link',
      icon: Copy,
      action: async () => {
        setIsCopying(true);
        try {
          if (navigator.share && isMobile) {
            await navigator.share({
              title: `${profileName}'s Profile`,
              url: profileUrl,
            });
          } else {
            await navigator.clipboard.writeText(profileUrl);
            toast({
              title: "Link copied!",
              description: "Profile link has been copied to clipboard."
            });
          }
        } catch (error) {
          console.error('Error sharing:', error);
        } finally {
          setIsCopying(false);
          onClose();
        }
      },
      primary: true
    },
    {
      label: 'Facebook',
      icon: Facebook,
      action: () => {
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`,
          '_blank',
          'width=600,height=400'
        );
        onClose();
      }
    },
    {
      label: 'Twitter',
      icon: Twitter,
      action: () => {
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out ${profileName}'s profile`)}&url=${encodeURIComponent(profileUrl)}`,
          '_blank',
          'width=600,height=400'
        );
        onClose();
      }
    },
    {
      label: 'LinkedIn',
      icon: Linkedin,
      action: () => {
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`,
          '_blank',
          'width=600,height=400'
        );
        onClose();
      }
    },
    {
      label: 'WhatsApp',
      icon: MessageCircle,
      action: () => {
        window.open(
          `https://wa.me/?text=${encodeURIComponent(`Check out ${profileName}'s profile: ${profileUrl}`)}`,
          '_blank'
        );
        onClose();
      }
    },
    {
      label: 'Email',
      icon: Mail,
      action: () => {
        window.location.href = `mailto:?subject=${encodeURIComponent(`${profileName}'s Profile`)}&body=${encodeURIComponent(`Check out ${profileName}'s profile: ${profileUrl}`)}`;
        onClose();
      }
    }
  ];

  const ShareContent = () => (
    <div className="space-y-4 p-4 md:p-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Share2 className="w-6 h-6 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">Share Profile</h3>
        <p className="text-sm text-muted-foreground">
          Share {profileName}'s profile with others
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {shareOptions.map((option) => {
          const IconComponent = option.icon;
          return (
            <Button
              key={option.label}
              variant={option.primary ? "default" : "outline"}
              onClick={option.action}
              disabled={option.label === 'Copy Link' && isCopying}
              className="h-auto flex-col gap-2 p-4 md:p-3"
            >
              <IconComponent className="w-5 h-5 md:w-4 md:h-4" />
              <span className="text-xs md:text-sm">
                {option.label === 'Copy Link' && isCopying ? 'Copying...' : option.label}
              </span>
            </Button>
          );
        })}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={onClose}>
        <DrawerContent className="h-[90vh] max-h-[500px]">
          <DrawerHeader className="sr-only">
            <DrawerTitle>Share Profile</DrawerTitle>
          </DrawerHeader>
          <ShareContent />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <ShareContent />
      </DialogContent>
    </Dialog>
  );
}
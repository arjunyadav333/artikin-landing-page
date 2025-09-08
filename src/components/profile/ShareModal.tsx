import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { 
  Share, 
  Copy, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram,
  Mail,
  Check
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { Profile } from '@/hooks/useProfiles';

interface ShareModalProps {
  profile: Profile;
  children?: React.ReactNode;
}

export function ShareModal({ profile, children }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const profileUrl = `${window.location.origin}/profile/${profile.username || profile.user_id}`;
  const shareText = `Check out ${profile.display_name}'s profile on Artikin`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      setCopied(true);
      toast({
        title: "Link copied",
        description: "Profile link has been copied to clipboard."
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy link to clipboard.",
        variant: "destructive"
      });
    }
  };

  const shareLinks = [
    {
      name: 'Facebook',
      icon: Facebook,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(profileUrl)}`,
      color: 'text-blue-600'
    },
    {
      name: 'Twitter',
      icon: Twitter,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(profileUrl)}`,
      color: 'text-sky-500'
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(profileUrl)}`,
      color: 'text-blue-700'
    },
    {
      name: 'Instagram',
      icon: Instagram,
      url: `https://www.instagram.com/`,
      color: 'text-pink-600'
    },
    {
      name: 'Email',
      icon: Mail,
      url: `mailto:?subject=${encodeURIComponent(shareText)}&body=${encodeURIComponent(`${shareText}\n\n${profileUrl}`)}`,
      color: 'text-gray-600'
    }
  ];

  const ShareContent = () => (
    <div className="space-y-6">
      {/* Copy Link Section */}
      <div className="space-y-3">
        <h3 className="font-semibold text-[#111827]">Share Profile</h3>
        <div className="flex gap-2">
          <div className="flex-1 p-3 bg-gray-50 rounded-lg text-sm text-gray-600 truncate border border-[#E5E7EB]">
            {profileUrl}
          </div>
          <Button
            onClick={handleCopyLink}
            variant="outline"
            size="sm"
            className="flex-shrink-0 border-[#E5E7EB] hover:bg-gray-50"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Social Share Buttons */}
      <div className="space-y-4">
        <h3 className="font-semibold text-[#111827]">Share to Social Media</h3>
        <div className={`grid ${isMobile ? 'grid-cols-2 gap-4' : 'grid-cols-3 gap-3'}`}>
          {shareLinks.map((link) => (
            <Button
              key={link.name}
              variant="outline"
              className={`${isMobile ? 'p-6 h-auto' : 'p-4'} flex ${isMobile ? 'flex-col' : 'flex-row'} items-center gap-3 hover:bg-gray-50 border-[#E5E7EB] rounded-xl transition-all duration-200`}
              onClick={() => window.open(link.url, '_blank')}
            >
              <link.icon className={`${isMobile ? 'h-8 w-8' : 'h-5 w-5'} ${link.color}`} />
              <span className={`${isMobile ? 'text-sm' : 'text-sm'} font-semibold text-[#111827]`}>
                {link.name}
              </span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer>
        <DrawerTrigger asChild>
          {children || (
            <Button variant="outline" size="sm">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
          )}
        </DrawerTrigger>
        <DrawerContent className="px-4 pb-6 bg-white rounded-t-2xl">
          <DrawerHeader className="text-left pb-4">
            <DrawerTitle className="text-[#111827] font-bold text-lg">Share {profile.display_name}'s Profile</DrawerTitle>
          </DrawerHeader>
          <ShareContent />
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm">
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-md bg-white border-[#E5E7EB] shadow-2xl rounded-xl">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-[#111827] font-bold text-lg">Share {profile.display_name}'s Profile</DialogTitle>
        </DialogHeader>
        <ShareContent />
      </DialogContent>
    </Dialog>
  );
}
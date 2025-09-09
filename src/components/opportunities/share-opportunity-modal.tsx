import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { 
  Share2, 
  Copy, 
  Facebook, 
  Twitter, 
  Linkedin, 
  Mail,
  MessageCircle,
  Check,
  Send
} from "lucide-react";

interface ShareOpportunityModalProps {
  opportunity: {
    id: string;
    title: string;
    organization?: { name: string };
    company?: string;
    organization_name?: string;
    location?: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareOpportunityModal({
  opportunity,
  open,
  onOpenChange
}: ShareOpportunityModalProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const shareUrl = `${window.location.origin}/opportunities/${opportunity.id}`;
  const shareText = `Check out this opportunity: ${opportunity.title} at ${opportunity.company || opportunity.organization_name}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: "The opportunity link has been copied to your clipboard."
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
        variant: "destructive"
      });
    }
  };

  const shareOptions = [
    {
      name: "WhatsApp",
      icon: MessageCircle,
      color: "bg-green-500 hover:bg-green-600",
      url: `https://wa.me/?text=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`
    },
    {
      name: "Facebook",
      icon: Facebook,
      color: "bg-blue-600 hover:bg-blue-700",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    },
    {
      name: "Twitter",
      icon: Twitter,
      color: "bg-sky-500 hover:bg-sky-600",
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: "LinkedIn",
      icon: Linkedin,
      color: "bg-blue-700 hover:bg-blue-800",
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: "Telegram",
      icon: Send,
      color: "bg-blue-500 hover:bg-blue-600",
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
    },
    {
      name: "Email",
      icon: Mail,
      color: "bg-gray-600 hover:bg-gray-700",
      url: `mailto:?subject=${encodeURIComponent(opportunity.title)}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`
    }
  ];

  const handleSocialShare = (url: string) => {
    window.open(url, '_blank', 'width=600,height=400');
  };

  const content = (
    <div className="space-y-6">
      {/* Opportunity Preview */}
      <div className="p-4 bg-muted/30 rounded-lg">
        <h4 className="font-semibold text-sm mb-1">{opportunity.title}</h4>
        <p className="text-sm text-muted-foreground">
          {opportunity.company || opportunity.organization_name}
        </p>
        {opportunity.location && (
          <p className="text-xs text-muted-foreground mt-1">
            {opportunity.location}
          </p>
        )}
      </div>

      {/* Copy Link */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium">Share Link</h4>
        <div className="flex gap-2">
          <Input
            value={shareUrl}
            readOnly
            className="text-sm"
          />
          <Button
            onClick={handleCopyLink}
            variant="outline"
            size="sm"
            className="px-3 shrink-0"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Social Share */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium">Share on Social Media</h4>
        <div className="grid grid-cols-3 gap-2">
          {shareOptions.map((option) => (
            <Button
              key={option.name}
              onClick={() => handleSocialShare(option.url)}
              className={`${option.color} text-white flex items-center gap-2 h-12 text-xs px-2`}
            >
              <option.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{option.name}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Mobile-specific share */}
      {isMobile && 'share' in navigator && (
        <div className="pt-2 border-t">
          <Button
            onClick={() => {
              navigator.share({
                title: opportunity.title,
                text: shareText,
                url: shareUrl
              });
            }}
            variant="outline"
            className="w-full flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            More sharing options
          </Button>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[90%]">
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Share Opportunity
            </SheetTitle>
          </SheetHeader>
          {content}
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Share Opportunity
          </DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
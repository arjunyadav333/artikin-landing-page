import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, X } from "lucide-react";
import { Application } from "@/hooks/useApplications";

interface ApplicantDetailsModalProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
  onViewProfile: (userId: string) => void;
}

export function ApplicantDetailsModal({ 
  application, 
  isOpen, 
  onClose, 
  onViewProfile 
}: ApplicantDetailsModalProps) {
  if (!application) return null;

  const profile = application.profiles;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-lg font-semibold">Application Details</DialogTitle>
        </DialogHeader>
        
        {/* Profile Section */}
        <div className="flex items-start gap-4 mb-6">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile?.avatar_url} />
            <AvatarFallback className="bg-primary/10 text-primary font-medium text-lg">
              {(profile?.display_name || profile?.username || 'U')
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg mb-1">
              {profile?.display_name || profile?.username || 'Unknown User'}
            </h3>
            <p className="text-muted-foreground mb-2">@{profile?.username || 'unknown'}</p>
            
            {/* Metadata badges */}
            <div className="flex flex-wrap gap-2 mb-3">
              {profile?.artform && (
                <Badge variant="secondary" className="text-xs">
                  {profile.artform}
                </Badge>
              )}
              {profile?.location && (
                <Badge variant="outline" className="text-xs">
                  {profile.location}
                </Badge>
              )}
              <Badge 
                variant={
                  application.status === 'accepted' ? 'default' :
                  application.status === 'rejected' ? 'destructive' :
                  'secondary'
                }
                className="text-xs"
              >
                {application.status}
              </Badge>
            </div>
            
            {profile?.bio && (
              <p className="text-sm text-muted-foreground line-clamp-3">
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        <Separator />

        {/* Application Message */}
        {application.cover_letter && (
          <div className="my-6">
            <h4 className="font-medium mb-3">Cover Letter</h4>
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm whitespace-pre-wrap leading-relaxed">
                {application.cover_letter}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => profile?.id && onViewProfile(profile.id)}
            className="flex items-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            Open Full Profile
          </Button>
          
          <Button onClick={onClose} variant="ghost">
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
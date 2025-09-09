import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  MoreVertical, 
  User, 
  MessageSquare, 
  Check, 
  X, 
  Star,
  Trash2 
} from "lucide-react";
import { Application } from "@/hooks/useApplications";

interface ApplicantActionsMenuProps {
  application: Application;
  onViewProfile: (userId: string) => void;
  onMessage: (userId: string) => void;
  onAccept: (applicationId: string) => void;
  onReject: (applicationId: string) => void;
  onRevoke: (applicationId: string) => void;
  onRemove: (applicationId: string) => void;
  disabled?: boolean;
}

export function ApplicantActionsMenu({
  application,
  onViewProfile,
  onMessage,
  onAccept,
  onReject,
  onRevoke,
  onRemove,
  disabled = false
}: ApplicantActionsMenuProps) {
  const profile = application.profiles;
  const status = application.status;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0"
          disabled={disabled}
          aria-label="More actions"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => profile?.id && onViewProfile(profile.id)}>
          <User className="h-4 w-4 mr-3" />
          View Profile
        </DropdownMenuItem>
        
        <DropdownMenuItem onClick={() => profile?.id && onMessage(profile.id)}>
          <MessageSquare className="h-4 w-4 mr-3" />
          Message
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        {status === 'pending' && (
          <>
            <DropdownMenuItem 
              onClick={() => onAccept(application.id)}
              className="text-green-600 focus:text-green-600"
            >
              <Check className="h-4 w-4 mr-3" />
              Accept
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onReject(application.id)}
              className="text-red-600 focus:text-red-600"
            >
              <X className="h-4 w-4 mr-3" />
              Reject
            </DropdownMenuItem>
          </>
        )}
        
        {status === 'accepted' && (
          <DropdownMenuItem 
            onClick={() => onRevoke(application.id)}
            className="text-orange-600 focus:text-orange-600"
          >
            <X className="h-4 w-4 mr-3" />
            Revoke Accept
          </DropdownMenuItem>
        )}
        
        {status === 'rejected' && (
          <DropdownMenuItem 
            onClick={() => onRevoke(application.id)}
            className="text-orange-600 focus:text-orange-600"
          >
            <Check className="h-4 w-4 mr-3" />
            Revoke Reject
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem>
          <Star className="h-4 w-4 mr-3" />
          Shortlist
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => onRemove(application.id)}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="h-4 w-4 mr-3" />
          Remove
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
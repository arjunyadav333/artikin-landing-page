import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Check, CheckCheck, MoreVertical, Trash2, AlertCircle, RotateCcw, Copy } from "lucide-react";
import { MessageAttachments } from "@/components/messaging/message-attachments";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useLongPress } from "@/hooks/useLongPress";
import { useToast } from "@/hooks/use-toast";
import type { Message } from "@/hooks/useMessaging";
import type { OptimisticMessage } from "@/lib/FastSendManager";

interface MessageItemProps {
  message: Message | OptimisticMessage;
  isOwn: boolean;
  showSender?: boolean;
  isOptimistic?: boolean;
  status?: 'sending' | 'sent' | 'failed';
  onRetry?: () => void;
  onDelete?: (messageId: string) => void;
}

export const MessageItem = ({
  message,
  isOwn,
  showSender = false,
  isOptimistic = false,
  status,
  onRetry,
  onDelete
}: MessageItemProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showLongPressMenu, setShowLongPressMenu] = useState(false);

  // Check if user can delete this message (any participant can delete)
  const canDelete = !isOptimistic && !message.deleted_for_everyone;

  // Long press handler for mobile
  const longPressHandlers = useLongPress(
    () => {
      if (canDelete) {
        setShowLongPressMenu(true);
      }
    },
    {
      threshold: 400,
      onStart: () => {
        // Add haptic feedback on supported devices
        if ('vibrate' in navigator) {
          navigator.vibrate(50);
        }
      }
    }
  );

  const handleDelete = () => {
    if (onDelete && !isOptimistic) {
      onDelete(message.id);
    }
    setShowMenu(false);
    setShowDeleteDialog(false);
    setShowLongPressMenu(false);
  };

  const handleCopyText = () => {
    if (message.body) {
      navigator.clipboard.writeText(message.body);
      toast({
        title: "Copied",
        description: "Message text copied to clipboard"
      });
    }
    setShowMenu(false);
    setShowLongPressMenu(false);
  };

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const getMessageStatus = () => {
    if (!isOwn || isOptimistic) return null;
    
    // Check receipts for status
    const receipts = message.receipts || [];
    const hasDelivered = receipts.some(r => r.status === 'delivered' || r.status === 'seen');
    const hasSeen = receipts.some(r => r.status === 'seen');
    
    if (hasSeen) {
      return <CheckCheck className="h-3 w-3 text-blue-500" />;
    } else if (hasDelivered) {
      return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
    } else {
      return <Check className="h-3 w-3 text-muted-foreground" />;
    }
  };

  // Show deleted message placeholder
  if (message.deleted_for_everyone) {
    return (
      <div className={cn(
        "flex mb-4",
        isOwn ? "justify-end" : "justify-start"
      )}>
        <div className={cn(
          "flex gap-2 max-w-[70%]",
          isOwn ? "flex-row-reverse" : ""
        )}>
          {!isOwn && showSender && (
            <Avatar className="h-8 w-8">
              <AvatarImage 
                src={message.sender?.avatar_url} 
                alt={message.sender?.display_name} 
              />
              <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                {getInitials(message.sender?.display_name)}
              </AvatarFallback>
            </Avatar>
          )}
          
          <div className={cn(
            "px-4 py-2 rounded-2xl bg-muted/50 border-dashed border",
            "text-muted-foreground italic text-sm"
          )}>
            This message was deleted
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex mb-4",
      isOwn ? "justify-end" : "justify-start"
    )}>
      <div className={cn(
        "flex gap-2 max-w-[70%] items-end",
        isOwn ? "flex-row-reverse" : ""
      )}>
        {/* Three-dots menu BEFORE message bubble (as per requirements) */}
        {canDelete && (
          <div className={cn(
            "flex-shrink-0 mb-1",
            isOwn ? "order-2" : "order-1"
          )}>
            <DropdownMenu open={showMenu} onOpenChange={setShowMenu}>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className={cn(
                    "h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity",
                    "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align={isOwn ? "end" : "start"} className="w-32">
                <DropdownMenuItem onClick={handleCopyText}>
                  <Copy className="h-3 w-3 mr-2" />
                  Copy
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => setShowDeleteDialog(true)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-3 w-3 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Avatar for other user's messages */}
        {!isOwn && showSender && (
          <Avatar className={cn(
            "h-8 w-8 flex-shrink-0",
            canDelete ? "order-3" : "order-2"
          )}>
            <AvatarImage 
              src={message.sender?.avatar_url} 
              alt={message.sender?.display_name} 
            />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {getInitials(message.sender?.display_name)}
            </AvatarFallback>
          </Avatar>
        )}
        
        {/* Message bubble */}
        <div 
          className={cn(
            "px-4 py-2 rounded-2xl relative group flex-1 min-w-0",
            isOwn 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted text-foreground",
            isOptimistic && "opacity-70",
            status === 'failed' && "bg-destructive/10 border border-destructive/20",
            canDelete ? (isOwn ? "order-1" : "order-2") : (isOwn ? "order-1" : "order-1")
          )}
          {...longPressHandlers}
        >
          {/* Message content */}
          {message.body && (
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.body}
            </p>
          )}
          
          {/* Message attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className={cn(message.body && "mt-2")}>
              <MessageAttachments attachments={message.attachments} />
            </div>
          )}
          
          {/* Message footer */}
          <div className={cn(
            "flex items-center justify-between gap-2 mt-1",
            message.body || message.attachments?.length ? "mt-1" : ""
          )}>
            <span className={cn(
              "text-xs",
              isOwn 
                ? "text-primary-foreground/70" 
                : "text-muted-foreground"
            )}>
              {isOptimistic ? 'Sending...' : formatMessageTime(message.created_at)}
            </span>
            
            <div className="flex items-center gap-1">
              {/* Status indicators */}
              {status === 'failed' && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 text-destructive hover:text-destructive/80"
                  onClick={onRetry}
                  title="Retry sending message"
                >
                  <AlertCircle className="h-3 w-3" />
                </Button>
              )}
              
              {status === 'sending' && (
                <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
              )}
              
              {status === 'sent' && isOwn && (
                <Check className="h-3 w-3 text-muted-foreground" />
              )}
              
              {!status && getMessageStatus()}
            </div>
          </div>
          
          {/* Three-dots menu is now positioned BEFORE the message bubble */}
        </div>

        {/* Mobile long-press action sheet */}
        {canDelete && (
          <AlertDialog open={showLongPressMenu} onOpenChange={setShowLongPressMenu}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Message Options</AlertDialogTitle>
              </AlertDialogHeader>
              <div className="flex flex-col gap-2">
                <Button variant="outline" onClick={handleCopyText} className="justify-start">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Text
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    setShowLongPressMenu(false);
                    setShowDeleteDialog(true);
                  }}
                  className="justify-start"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete for Everyone  
                </Button>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}

        {/* Delete confirmation dialog */}
        {canDelete && (
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete Message</AlertDialogTitle>
                <AlertDialogDescription>
                  Delete this message for everyone? This will replace the message with "This message was deleted."
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
};
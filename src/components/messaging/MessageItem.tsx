import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Check, CheckCheck, MoreVertical, Trash2, AlertCircle, RotateCcw } from "lucide-react";
import { MessageAttachments } from "@/components/messaging/message-attachments";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Message } from "@/hooks/useMessaging";

interface MessageItemProps {
  message: Message;
  isOwn: boolean;
  showSender?: boolean;
  isOptimistic?: boolean;
  status?: 'sending' | 'failed';
  onRetry?: () => void;
}

export const MessageItem = ({
  message,
  isOwn,
  showSender = false,
  isOptimistic = false,
  status,
  onRetry
}: MessageItemProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showMenu, setShowMenu] = useState(false);

  const deleteMessageMutation = useMutation({
    mutationFn: async () => {
      if (!user || !isOwn) throw new Error('Cannot delete this message');

      const { error } = await supabase
        .from('messages')
        .update({ 
          deleted: true,
          deleted_for_all: true,
          deleted_by: user.id,
          deleted_at: new Date().toISOString()
        })
        .eq('id', message.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', message.conversation_id] });
      toast({
        title: "Message deleted",
        description: "The message has been deleted for everyone"
      });
      setShowMenu(false);
    },
    onError: (error) => {
      console.error('Error deleting message:', error);
      toast({
        title: "Error",
        description: "Failed to delete message. Please try again.",
        variant: "destructive"
      });
    }
  });

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

  const handleDelete = () => {
    deleteMessageMutation.mutate();
  };

  // Show deleted message placeholder
  if (message.deleted_for_all) {
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
        "flex gap-2 max-w-[70%]",
        isOwn ? "flex-row-reverse" : ""
      )}>
        {!isOwn && showSender && (
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={message.sender?.avatar_url} 
              alt={message.sender?.display_name} 
            />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
              {getInitials(message.sender?.display_name)}
            </AvatarFallback>
          </Avatar>
        )}
        
        <div className={cn(
          "px-4 py-2 rounded-2xl relative group",
          isOwn 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted text-foreground",
          isOptimistic && "opacity-70",
          status === 'failed' && "bg-destructive/10 border border-destructive/20"
        )}>
          {/* Message content */}
          {message.content && (
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </p>
          )}
          
          {/* Message attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className={cn(message.content && "mt-2")}>
              <MessageAttachments attachments={message.attachments} />
            </div>
          )}
          
          {/* Message footer */}
          <div className={cn(
            "flex items-center justify-between gap-2 mt-1",
            message.content || message.attachments?.length ? "mt-1" : ""
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
                >
                  <AlertCircle className="h-3 w-3" />
                </Button>
              )}
              
              {status === 'sending' && (
                <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
              )}
              
              {getMessageStatus()}
            </div>
          </div>
          
          {/* Message menu - only for own messages */}
          {isOwn && !isOptimistic && !message.deleted_for_all && (
            <div className="absolute -right-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu open={showMenu} onOpenChange={setShowMenu}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32">
                  <DropdownMenuItem 
                    onClick={handleDelete}
                    disabled={deleteMessageMutation.isPending}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-3 w-3 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
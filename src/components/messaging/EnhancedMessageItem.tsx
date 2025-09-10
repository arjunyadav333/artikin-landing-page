import React, { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  Check, 
  CheckCheck, 
  Clock, 
  MoreVertical, 
  Copy, 
  Trash2,
  Edit3,
  Reply,
  Smile,
  Heart,
  ThumbsUp,
  Laugh
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { EnhancedMessage } from '@/hooks/useEnhancedMessaging';
import { useAuth } from '@/hooks/useAuth';

interface EnhancedMessageItemProps {
  message: EnhancedMessage;
  isOwn: boolean;
  showSender?: boolean;
  onReply?: (message: EnhancedMessage) => void;
  onEdit?: (messageId: string, content: string) => void;
  onDelete?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onRemoveReaction?: (messageId: string, emoji: string) => void;
}

const REACTION_EMOJIS = ['❤️', '👍', '😂', '😮', '😢', '😡'];

export const EnhancedMessageItem: React.FC<EnhancedMessageItemProps> = ({
  message,
  isOwn,
  showSender,
  onReply,
  onEdit,
  onDelete,
  onReact,
  onRemoveReaction
}) => {
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content || message.body || '');

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return format(date, 'HH:mm');
    } else {
      return format(date, 'MMM d, HH:mm');
    }
  };

  const getDeliveryStatus = () => {
    if (!isOwn) return null;
    
    if (message.seen_at) {
      return <CheckCheck className="h-3 w-3 text-blue-500" />;
    } else if (message.delivered_at) {
      return <CheckCheck className="h-3 w-3 text-muted-foreground" />;
    } else {
      return <Check className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const handleCopyText = () => {
    navigator.clipboard.writeText(message.content || message.body || '');
    setShowMenu(false);
  };

  const handleDelete = () => {
    onDelete?.(message.id);
    setShowDeleteDialog(false);
  };

  const handleReaction = (emoji: string) => {
    const existingReaction = message.reactions?.find(
      r => r.user_id === user?.id && r.emoji === emoji
    );
    
    if (existingReaction) {
      onRemoveReaction?.(message.id, emoji);
    } else {
      onReact?.(message.id, emoji);
    }
    setShowReactions(false);
  };

  const handleEditSubmit = () => {
    if (editContent.trim() !== message.content) {
      onEdit?.(message.id, editContent.trim());
    }
    setIsEditing(false);
  };

  const renderMessageContent = () => {
    if (message.deleted_for_everyone) {
      return (
        <div className="text-muted-foreground italic text-sm">
          This message was deleted
        </div>
      );
    }

    if (isEditing) {
      return (
        <div className="space-y-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full p-2 border rounded resize-none"
            rows={2}
            autoFocus
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={handleEditSubmit}>
              Save
            </Button>
            <Button 
              size="sm" 
              variant="ghost" 
              onClick={() => {
                setIsEditing(false);
                setEditContent(message.content || message.body || '');
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {/* Reply preview */}
        {message.replied_to_message && (
          <div className="text-xs text-muted-foreground border-l-2 border-muted pl-2 py-1">
            <div className="font-medium">
              {message.replied_to_message.sender?.display_name}
            </div>
            <div className="truncate">
              {message.replied_to_message.body || 'Message'}
            </div>
          </div>
        )}

        {/* Message content */}
        <div className="text-sm break-words">
          {message.content || message.body || 'Message'}
          {message.edited && (
            <span className="text-xs opacity-70 ml-2">(edited)</span>
          )}
        </div>

        {/* Media content */}
        {message.message_type === 'image' && message.media_url && (
          <div className="max-w-xs">
            <img 
              src={message.media_url} 
              alt="Shared image"
              className="rounded-lg max-w-full h-auto"
            />
            {(message.content || message.body) && (
              <div className="text-sm mt-2">{message.content || message.body}</div>
            )}
          </div>
        )}

        {/* Link preview */}
        {message.message_type === 'link' && message.link_preview && (
          <div className="border rounded-lg overflow-hidden max-w-xs">
            {message.link_preview.image_url && (
              <img 
                src={message.link_preview.image_url} 
                alt="Link preview"
                className="w-full h-32 object-cover"
              />
            )}
            <div className="p-3">
              <div className="font-medium text-sm truncate">
                {message.link_preview.title}
              </div>
              {message.link_preview.description && (
                <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {message.link_preview.description}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderReactions = () => {
    if (!message.reactions?.length) return null;

    const reactionGroups = message.reactions.reduce((acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = [];
      }
      acc[reaction.emoji].push(reaction);
      return acc;
    }, {} as Record<string, typeof message.reactions>);

    return (
      <div className="flex flex-wrap gap-1 mt-1">
        {Object.entries(reactionGroups).map(([emoji, reactions]) => {
          const hasUserReaction = reactions.some(r => r.user_id === user?.id);
          return (
            <Button
              key={emoji}
              variant="ghost"
              size="sm"
              className={cn(
                "h-6 px-2 text-xs rounded-full",
                hasUserReaction && "bg-blue-100 text-blue-600"
              )}
              onClick={() => handleReaction(emoji)}
            >
              {emoji} {reactions.length}
            </Button>
          );
        })}
      </div>
    );
  };

  return (
    <div className={cn(
      "flex gap-3 group hover:bg-muted/30 px-2 py-1 rounded-lg transition-colors",
      isOwn ? "flex-row-reverse" : "flex-row"
    )}>
      {/* Avatar */}
      {showSender && !isOwn && (
        <Avatar className="h-8 w-8 mt-1">
          <AvatarImage 
            src={message.sender?.avatar_url} 
            alt={message.sender?.display_name} 
          />
          <AvatarFallback className="text-xs">
            {getInitials(message.sender?.display_name)}
          </AvatarFallback>
        </Avatar>
      )}
      
      {/* Message bubble */}
      <div className={cn("flex flex-col max-w-sm lg:max-w-md", isOwn ? "items-end" : "items-start")}>
        {/* Sender name */}
        {showSender && !isOwn && (
          <div className="text-xs font-medium text-muted-foreground mb-1">
            {message.sender?.display_name}
          </div>
        )}
        
        {/* Message content */}
        <div className="relative group/message">
          <div className={cn(
            "rounded-2xl px-3 py-2 max-w-full break-words",
            isOwn 
              ? "bg-primary text-white ml-auto" 
              : "bg-muted text-foreground"
          )}>
            {renderMessageContent()}
          </div>

          {/* Quick reactions on hover */}
          <div className="absolute top-0 right-full mr-2 opacity-0 group-hover/message:opacity-100 transition-opacity flex gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 rounded-full bg-background shadow-md"
              onClick={() => setShowReactions(true)}
            >
              <Smile className="h-3 w-3" />
            </Button>
            {!isOwn && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 w-7 p-0 rounded-full bg-background shadow-md"
                onClick={() => onReply?.(message)}
              >
                <Reply className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Reactions */}
        {renderReactions()}

        {/* Message info */}
        <div className={cn(
          "flex items-center gap-1 mt-1",
          isOwn ? "flex-row-reverse" : "flex-row"
        )}>
          <span className="text-xs text-muted-foreground">
            {formatMessageTime(message.created_at)}
          </span>
          
          {isOwn && (
            <div className="flex items-center gap-1">
              {getDeliveryStatus()}
              
              {/* Message options */}
              <DropdownMenu open={showMenu} onOpenChange={setShowMenu}>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                  >
                    <MoreVertical className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onReply?.(message)}>
                    <Reply className="h-4 w-4 mr-2" />
                    Reply
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setIsEditing(true)}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleCopyText}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy text
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setShowDeleteDialog(true)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>

      {/* Reaction picker */}
      {showReactions && (
        <div className="fixed inset-0 z-50" onClick={() => setShowReactions(false)}>
          <div 
            className="absolute bg-background border rounded-lg p-2 shadow-lg flex gap-2"
            style={{ 
              top: '50%', 
              left: '50%', 
              transform: 'translate(-50%, -50%)' 
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {REACTION_EMOJIS.map(emoji => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-10 w-10 text-lg p-0 hover:scale-110 transition-transform"
                onClick={() => handleReaction(emoji)}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete message?</AlertDialogTitle>
            <AlertDialogDescription>
              This message will be deleted for everyone in this conversation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
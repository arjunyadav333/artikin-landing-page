import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pin, PinOff, Trash2, User } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface ConversationActionsProps {
  conversationId: string;
  isPinned: boolean;
  otherParticipant?: {
    id: string;
    user_id?: string;
    display_name?: string;
    username?: string;
  };
  onClose?: () => void;
}

export const ConversationActions = ({ 
  conversationId, 
  isPinned, 
  otherParticipant,
  onClose 
}: ConversationActionsProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const pinConversationMutation = useMutation({
    mutationFn: async (pinned: boolean) => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('conversation_participants')
        .upsert({
          conversation_id: conversationId,
          user_id: user.id,
          pinned,
          muted: false,
          archived: false,
          deleted: false
        }, { 
          onConflict: 'conversation_id,user_id'
        });

      if (error) throw error;
    },
    onSuccess: (_, pinned) => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast({
        title: pinned ? "Conversation pinned" : "Conversation unpinned",
        description: pinned 
          ? "This conversation will appear at the top of your list"
          : "This conversation has been unpinned"
      });
      setOpen(false);
    },
    onError: (error) => {
      console.error('Error updating pin status:', error);
      toast({
        title: "Error",
        description: "Failed to update conversation. Please try again.",
        variant: "destructive"
      });
    }
  });

  const deleteConversationMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('conversation_participants')
        .upsert({
          conversation_id: conversationId,
          user_id: user.id,
          deleted: true,
          muted: false,
          archived: false,
          pinned: false
        }, { 
          onConflict: 'conversation_id,user_id'
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast({
        title: "Conversation deleted",
        description: "The conversation has been removed from your list"
      });
      setOpen(false);
      if (onClose) {
        onClose();
      } else {
        navigate('/messages');
      }
    },
    onError: (error) => {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to delete conversation. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleViewProfile = () => {
    if (otherParticipant) {
      navigate(`/profile/${otherParticipant.user_id || otherParticipant.id}`);
      setOpen(false);
    }
  };

  const handlePinToggle = () => {
    pinConversationMutation.mutate(!isPinned);
  };

  const handleDelete = () => {
    deleteConversationMutation.mutate();
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {otherParticipant && (
          <DropdownMenuItem onClick={handleViewProfile}>
            <User className="h-4 w-4 mr-2" />
            View Profile
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem 
          onClick={handlePinToggle}
          disabled={pinConversationMutation.isPending}
        >
          {isPinned ? (
            <>
              <PinOff className="h-4 w-4 mr-2" />
              Unpin Conversation
            </>
          ) : (
            <>
              <Pin className="h-4 w-4 mr-2" />
              Pin Conversation
            </>
          )}
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={handleDelete}
          disabled={deleteConversationMutation.isPending}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete Conversation
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
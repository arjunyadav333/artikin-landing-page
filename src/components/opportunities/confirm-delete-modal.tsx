import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

interface ConfirmDeleteModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  opportunityTitle: string;
  isLoading?: boolean;
}

export function ConfirmDeleteModal({
  open,
  onOpenChange,
  onConfirm,
  opportunityTitle,
  isLoading = false
}: ConfirmDeleteModalProps) {
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);

  const handleFirstConfirm = () => {
    setShowFinalConfirm(true);
  };

  const handleFinalConfirm = () => {
    onConfirm();
    setShowFinalConfirm(false);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setShowFinalConfirm(false);
    onOpenChange(false);
  };

  // First confirmation dialog
  if (!showFinalConfirm) {
    return (
      <AlertDialog open={open} onOpenChange={onOpenChange}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-destructive/10">
                <AlertTriangle className="h-5 w-5 text-destructive" />
              </div>
              <div>
                <AlertDialogTitle>Delete opportunity?</AlertDialogTitle>
                <AlertDialogDescription className="mt-1">
                  Are you sure you want to permanently delete this opportunity?
                </AlertDialogDescription>
              </div>
            </div>
          </AlertDialogHeader>
          
          <div className="p-4 bg-muted/30 rounded-lg">
            <p className="font-medium text-sm truncate">"{opportunityTitle}"</p>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleFirstConfirm}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // Second confirmation dialog
  return (
    <AlertDialog open={showFinalConfirm} onOpenChange={setShowFinalConfirm}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-destructive/20">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <AlertDialogTitle>Final confirmation</AlertDialogTitle>
              <AlertDialogDescription className="mt-1">
                This action cannot be undone. The opportunity will be permanently deleted.
              </AlertDialogDescription>
            </div>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleFinalConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? 'Deleting...' : 'Confirm Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
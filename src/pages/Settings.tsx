import { useState } from "react";
import { useCurrentProfile, useUpdateProfile } from "@/hooks/useProfiles";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader2, LogOut, Trash2, Undo2 } from "lucide-react";

export default function Settings() {
  const { data: profile, isLoading } = useCurrentProfile();
  const updateProfileMutation = useUpdateProfile();
  const { signOut } = useAuth();
  const { toast } = useToast();
  
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteStep, setDeleteStep] = useState<'confirm' | 'verify'>('confirm');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showUndo, setShowUndo] = useState(false);
  const [previousPrivacy, setPreviousPrivacy] = useState<'public' | 'private'>('public');

  const handlePrivacyChange = async (newPrivacy: 'public' | 'private') => {
    if (!profile) return;
    
    // Store previous value for undo
    setPreviousPrivacy(profile.privacy || 'public');
    
    try {
      await updateProfileMutation.mutateAsync({ privacy: newPrivacy });
      
      // Show undo option
      setShowUndo(true);
      setTimeout(() => setShowUndo(false), 5000);
      
    } catch (error) {
      console.error('Failed to update privacy:', error);
    }
  };

  const handleUndoPrivacy = async () => {
    if (!profile) return;
    
    try {
      await updateProfileMutation.mutateAsync({ privacy: previousPrivacy });
      setShowUndo(false);
      toast({
        title: "Privacy setting restored",
        description: `Account privacy changed back to ${previousPrivacy}.`
      });
    } catch (error) {
      console.error('Failed to undo privacy change:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out."
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteStep === 'confirm') {
      setDeleteStep('verify');
      return;
    }
    
    if (deleteConfirmText !== 'DELETE') {
      toast({
        title: "Confirmation required",
        description: "Please type 'DELETE' to confirm account deletion.",
        variant: "destructive"
      });
      return;
    }
    
    setIsDeleting(true);
    
    try {
      // Call delete account edge function
      const response = await fetch('/api/delete_account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await import('@/integrations/supabase/client').then(m => m.supabase.auth.getSession())).data.session?.access_token}`
        }
      });
      
      if (!response.ok) throw new Error('Delete failed');
      
      await signOut();
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted."
      });
    } catch (error) {
      setIsDeleting(false);
      setDeleteStep('confirm');
      setDeleteConfirmText('');
      toast({
        title: "Delete failed",
        description: "Failed to delete account. Please try again.",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Profile not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-2">Manage your account preferences and privacy</p>
        </div>

        {/* Privacy Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Account Privacy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label htmlFor="privacy">Who can see your posts and portfolio?</Label>
              <RadioGroup
                value={profile.privacy || 'public'}
                onValueChange={(value: 'public' | 'private') => handlePrivacyChange(value)}
                className="grid gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="public" id="public" />
                  <Label htmlFor="public" className="flex-1">
                    <div>
                      <p className="font-medium">Public</p>
                      <p className="text-sm text-muted-foreground">
                        Anyone can view your full profile, posts, and portfolio
                      </p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="private" id="private" />
                  <Label htmlFor="private" className="flex-1">
                    <div>
                      <p className="font-medium">Private (Followers only)</p>
                      <p className="text-sm text-muted-foreground">
                        Only your followers can see your posts and portfolio. Others see minimal profile info.
                      </p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            {showUndo && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <p className="text-sm">Privacy setting saved</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleUndoPrivacy}
                  className="flex items-center gap-2"
                >
                  <Undo2 className="h-3 w-3" />
                  Undo
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="w-full flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    {deleteStep === 'confirm' ? 'Delete Account?' : 'Confirm Account Deletion'}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {deleteStep === 'confirm' ? (
                      "This action cannot be undone. This will permanently delete your account and remove all your data from our servers."
                    ) : (
                      <>
                        <p className="mb-4">
                          Are you absolutely sure? This will permanently delete your account and all associated data.
                        </p>
                        <div className="space-y-2">
                          <Label htmlFor="deleteConfirm">
                            Type <strong>DELETE</strong> to confirm:
                          </Label>
                          <input
                            id="deleteConfirm"
                            type="text"
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            className="w-full px-3 py-2 border rounded-md"
                            placeholder="Type DELETE here"
                          />
                        </div>
                      </>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    onClick={() => {
                      setDeleteStep('confirm');
                      setDeleteConfirmText('');
                    }}
                  >
                    Cancel
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={isDeleting || (deleteStep === 'verify' && deleteConfirmText !== 'DELETE')}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Deleting...
                      </>
                    ) : deleteStep === 'confirm' ? (
                      'Continue'
                    ) : (
                      'Delete Account'
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
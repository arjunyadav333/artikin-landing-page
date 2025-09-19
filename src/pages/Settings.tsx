import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useCurrentProfile, useUpdateProfile } from "@/hooks/useProfiles";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { ArrowLeft, Shield, LogOut, Trash2, Undo2 } from "lucide-react";

export default function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { data: profile, isLoading: profileLoading } = useCurrentProfile();
  const updateProfileMutation = useUpdateProfile();
  const { toast } = useToast();
  
  const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
  const [originalPrivacy, setOriginalPrivacy] = useState<'public' | 'private'>('public');
  const [showUndoToast, setShowUndoToast] = useState(false);
  const [deleteStep, setDeleteStep] = useState<'confirm' | 'verify' | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  // Initialize privacy setting from profile
  useEffect(() => {
    if (profile?.privacy) {
      const currentPrivacy = profile.privacy as 'public' | 'private';
      setPrivacy(currentPrivacy);
      setOriginalPrivacy(currentPrivacy);
    }
  }, [profile?.privacy]);

  const handlePrivacyChange = async (newPrivacy: 'public' | 'private') => {
    const oldPrivacy = privacy;
    setPrivacy(newPrivacy);
    
    try {
      await updateProfileMutation.mutateAsync({ privacy: newPrivacy });
      
      // Show success toast with undo option
      setShowUndoToast(true);
      toast({
        title: "Privacy updated",
        description: `Your account is now ${newPrivacy}`,
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleUndoPrivacy(oldPrivacy)}
            className="ml-2"
          >
            <Undo2 className="h-4 w-4 mr-1" />
            Undo
          </Button>
        ),
      });
      
      setOriginalPrivacy(newPrivacy);
      
      // Hide undo option after 5 seconds
      setTimeout(() => {
        setShowUndoToast(false);
      }, 5000);
      
    } catch (error: any) {
      // Rollback on error
      setPrivacy(oldPrivacy);
      toast({
        title: "Failed to update privacy",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleUndoPrivacy = async (previousPrivacy: 'public' | 'private') => {
    setShowUndoToast(false);
    setPrivacy(previousPrivacy);
    
    try {
      await updateProfileMutation.mutateAsync({ privacy: previousPrivacy });
      setOriginalPrivacy(previousPrivacy);
      toast({
        title: "Changes undone",
        description: `Privacy reverted to ${previousPrivacy}`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to undo changes",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error: any) {
      toast({
        title: "Logout failed",
        description: error.message || "Please try again",
        variant: "destructive",
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteStep === 'confirm') {
      setDeleteStep('verify');
      return;
    }
    
    if (deleteStep === 'verify') {
      if (deleteConfirmText.toLowerCase() !== 'delete my account') {
        toast({
          title: "Verification failed",
          description: "Please type exactly: delete my account",
          variant: "destructive",
        });
        return;
      }
      
      try {
        // Call delete account edge function
        const { error } = await supabase.functions.invoke('delete-account', {
          body: { userId: user?.id }
        });
        
        if (error) throw error;
        
        toast({
          title: "Account deletion initiated",
          description: "Your account will be permanently deleted within 24 hours.",
        });
        
        // Log out after initiating deletion
        await signOut();
        navigate('/auth');
        
      } catch (error: any) {
        toast({
          title: "Account deletion failed",
          description: error.message || "Please try again or contact support",
          variant: "destructive",
        });
      } finally {
        setDeleteStep(null);
        setDeleteConfirmText('');
      }
    }
  };

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3 pb-6 border-b border-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="h-9 w-9"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-xl font-bold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground">Manage your account preferences and privacy</p>
          </div>
        </div>

        {/* Privacy Control */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Account Privacy
            </CardTitle>
            <CardDescription>
              Control who can see your posts, portfolio, and profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <RadioGroup
              value={privacy}
              onValueChange={(value: 'public' | 'private') => handlePrivacyChange(value)}
              className="space-y-4"
            >
              <div className="flex items-start space-x-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="public" id="public" className="mt-1" />
                <div className="flex-1 space-y-1">
                  <Label htmlFor="public" className="text-base font-medium cursor-pointer">
                    Public
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Anyone can view your profile, posts, and portfolio
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-4 rounded-lg border border-border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="private" id="private" className="mt-1" />
                <div className="flex-1 space-y-1">
                  <Label htmlFor="private" className="text-base font-medium cursor-pointer">
                    Private (Followers only)
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Only your followers can see your posts and portfolio. Others will see a minimal public card.
                  </p>
                </div>
              </div>
            </RadioGroup>
            
            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Set your account to private so only your followers can see your posts and portfolio.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Account Actions</CardTitle>
            <CardDescription>
              Manage your account and session
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Logout */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-border">
              <div className="flex items-center gap-3">
                <LogOut className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Sign Out</p>
                  <p className="text-sm text-muted-foreground">Sign out of your account</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="hover:bg-muted"
              >
                Sign Out
              </Button>
            </div>

            {/* Delete Account */}
            <div className="flex items-center justify-between p-4 rounded-lg border border-destructive/20 bg-destructive/5">
              <div className="flex items-center gap-3">
                <Trash2 className="h-10 w-10 text-destructive" />
                <div>
                  <p className="font-medium text-destructive">Delete</p>
                  <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                </div>
              </div>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button 
                    variant="destructive" 
                    onClick={() => setDeleteStep('confirm')}
                  >
                    Delete 
                  </Button>
                </AlertDialogTrigger>
                
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      {deleteStep === 'confirm' ? 'Delete Account?' : 'Confirm Account Deletion'}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="space-y-4">
                      {deleteStep === 'confirm' ? (
                        <>
                          <p>This action cannot be undone. This will permanently delete your account and remove all your data from our servers.</p>
                          <p className="font-medium text-foreground">This includes:</p>
                          <ul className="list-disc list-inside space-y-1 text-sm">
                            <li>Your profile and all personal information</li>
                            <li>All posts, comments, and interactions</li>
                            <li>Your portfolio and uploaded media</li>
                            <li>All messages and conversations</li>
                            <li>All connections and followers</li>
                          </ul>
                        </>
                      ) : (
                        <div className="space-y-4">
                          <p>To confirm account deletion, please type the following phrase exactly:</p>
                          <p className="font-mono font-bold text-center p-2 bg-muted rounded">delete my account</p>
                          <input
                            type="text"
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            placeholder="Type here..."
                            className="w-full p-2 border border-border rounded focus:ring-2 focus:ring-destructive focus:border-transparent"
                          />
                        </div>
                      )}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => {
                      setDeleteStep(null);
                      setDeleteConfirmText('');
                    }}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDeleteAccount}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {deleteStep === 'confirm' ? 'Continue' : 'Delete Account'}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
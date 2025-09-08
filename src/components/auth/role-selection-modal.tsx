import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Building2, Loader2 } from "lucide-react";
import { useUpdateProfile } from "@/hooks/useProfiles";
import { useToast } from "@/hooks/use-toast";

interface RoleSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const RoleSelectionModal = ({ open, onOpenChange }: RoleSelectionModalProps) => {
  const [selectedRole, setSelectedRole] = useState<'artist' | 'organization' | null>(null);
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();

  const handleRoleSelection = async () => {
    if (!selectedRole) return;

    try {
      await updateProfile.mutateAsync({ role: selectedRole });
      onOpenChange(false);
      toast({
        title: "Role selected",
        description: `You've been set up as ${selectedRole === 'artist' ? 'an artist' : 'an organization'}.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update your role. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Choose your role</DialogTitle>
          <DialogDescription>
            Please select your role to continue. This will determine how you use the platform.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 gap-4"
            >
              <Card 
                className={`cursor-pointer transition-all duration-200 ${
                  selectedRole === 'artist' 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedRole('artist')}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Palette className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Artist</CardTitle>
                      <CardDescription className="text-sm">
                        Looking for opportunities to showcase your talent
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              <Card 
                className={`cursor-pointer transition-all duration-200 ${
                  selectedRole === 'organization' 
                    ? 'ring-2 ring-primary bg-primary/5' 
                    : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedRole('organization')}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-accent/10">
                      <Building2 className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Organization</CardTitle>
                      <CardDescription className="text-sm">
                        Posting opportunities and hiring talent
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              onClick={handleRoleSelection}
              disabled={!selectedRole || updateProfile.isPending}
              className="min-w-[100px]"
            >
              {updateProfile.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Continue'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
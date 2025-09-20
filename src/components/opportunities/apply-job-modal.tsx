import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useApplyToOpportunity } from '@/hooks/useOpportunities';
import { useToast } from '@/hooks/use-toast';
import { Opportunity } from '@/hooks/useOpportunities';

interface ApplyJobModalProps {
  opportunity: Opportunity;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ApplyJobModal: React.FC<ApplyJobModalProps> = ({
  opportunity,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [coverLetter, setCoverLetter] = useState('');
  const applyToOpportunity = useApplyToOpportunity();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await applyToOpportunity.mutateAsync({
        opportunityId: opportunity.id,
        coverLetter: coverLetter.trim() || undefined
      });
      
      toast({
        title: "Application submitted!",
        description: "Your application has been sent successfully."
      });
      
      onSuccess();
    } catch (error) {
      toast({
        title: "Application failed",
        description: "There was an error submitting your application. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Apply to {opportunity.title}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="coverLetter">Cover Letter (Optional)</Label>
            <Textarea
              id="coverLetter"
              placeholder="Tell them why you're interested in this opportunity..."
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={4}
              className="mt-1"
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={applyToOpportunity.isPending}
            >
              {applyToOpportunity.isPending ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
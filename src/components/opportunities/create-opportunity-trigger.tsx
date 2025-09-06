import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CreateOpportunityFlow } from './create-opportunity-flow';

export const CreateOpportunityTrigger = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button 
        onClick={() => setOpen(true)}
        size="lg"
        className="bg-primary text-primary-foreground hover:bg-primary/90"
      >
        <Plus className="h-5 w-5 mr-2" />
        Post New Job Opportunity
      </Button>

      <CreateOpportunityFlow
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
};
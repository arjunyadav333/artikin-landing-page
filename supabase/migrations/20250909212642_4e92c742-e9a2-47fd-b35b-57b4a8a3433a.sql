-- Add audit fields to opportunity_applications table
ALTER TABLE public.opportunity_applications 
ADD COLUMN accepted_at timestamp with time zone,
ADD COLUMN accepted_by_org_id uuid,
ADD COLUMN rejected_at timestamp with time zone,
ADD COLUMN rejected_by_org_id uuid;

-- Create applicant_history table for audit trail
CREATE TABLE public.applicant_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  application_id uuid NOT NULL,
  old_status text,
  new_status text NOT NULL,
  changed_by_user_id uuid NOT NULL,
  reason text,
  changed_at timestamp with time zone NOT NULL DEFAULT now(),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on applicant_history
ALTER TABLE public.applicant_history ENABLE ROW LEVEL SECURITY;

-- Create policy for applicant_history - organizations can view history for their opportunities
CREATE POLICY "Organizations can view applicant history for their opportunities"
ON public.applicant_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.opportunity_applications oa
    JOIN public.opportunities o ON o.id = oa.opportunity_id
    WHERE oa.id = applicant_history.application_id
    AND o.user_id = auth.uid()
  )
);

-- Create policy for inserting audit records (system/trigger use)
CREATE POLICY "Enable insert for audit records"
ON public.applicant_history
FOR INSERT
WITH CHECK (true);

-- Create function to automatically create audit records when status changes
CREATE OR REPLACE FUNCTION public.track_application_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create audit record if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.applicant_history (
      application_id,
      old_status,
      new_status,
      changed_by_user_id
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      auth.uid()
    );
    
    -- Update accepted_at/rejected_at timestamps and org_id
    IF NEW.status = 'accepted' THEN
      NEW.accepted_at = now();
      NEW.accepted_by_org_id = auth.uid();
    ELSIF NEW.status = 'rejected' THEN
      NEW.rejected_at = now();
      NEW.rejected_by_org_id = auth.uid();
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically track status changes
CREATE TRIGGER track_application_status_changes
  BEFORE UPDATE ON public.opportunity_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.track_application_status_change();

-- Create indexes for better performance
CREATE INDEX idx_applicant_history_application_id ON public.applicant_history(application_id);
CREATE INDEX idx_applicant_history_changed_at ON public.applicant_history(changed_at);
CREATE INDEX idx_opportunity_applications_status ON public.opportunity_applications(status);
CREATE INDEX idx_opportunity_applications_accepted_at ON public.opportunity_applications(accepted_at);
CREATE INDEX idx_opportunity_applications_rejected_at ON public.opportunity_applications(rejected_at);
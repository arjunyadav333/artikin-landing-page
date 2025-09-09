-- Fix the search path for the function to address security warning
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
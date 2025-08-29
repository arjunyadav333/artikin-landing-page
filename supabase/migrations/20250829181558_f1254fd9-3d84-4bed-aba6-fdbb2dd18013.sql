-- Create automatic application count trigger
CREATE OR REPLACE FUNCTION public.handle_application_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.opportunities 
    SET applications_count = applications_count + 1 
    WHERE id = NEW.opportunity_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.opportunities 
    SET applications_count = applications_count - 1 
    WHERE id = OLD.opportunity_id;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$;

-- Create trigger for application count
CREATE TRIGGER application_count_trigger
AFTER INSERT OR DELETE ON public.opportunity_applications
FOR EACH ROW
EXECUTE FUNCTION public.handle_application_count();

-- Add foreign key constraints
ALTER TABLE public.opportunity_applications 
ADD CONSTRAINT fk_opportunity_applications_opportunity_id 
FOREIGN KEY (opportunity_id) REFERENCES public.opportunities(id) ON DELETE CASCADE;

ALTER TABLE public.opportunity_applications 
ADD CONSTRAINT fk_opportunity_applications_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

ALTER TABLE public.opportunities 
ADD CONSTRAINT fk_opportunities_user_id 
FOREIGN KEY (user_id) REFERENCES public.profiles(user_id) ON DELETE CASCADE;

-- Add validation constraints
ALTER TABLE public.opportunities 
ADD CONSTRAINT chk_deadline_future 
CHECK (deadline IS NULL OR deadline > created_at);

ALTER TABLE public.opportunities 
ADD CONSTRAINT chk_salary_range 
CHECK (salary_min IS NULL OR salary_max IS NULL OR salary_min <= salary_max);

ALTER TABLE public.opportunities 
ADD CONSTRAINT chk_status_valid 
CHECK (status IN ('active', 'closed', 'draft', 'expired'));

ALTER TABLE public.opportunity_applications 
ADD CONSTRAINT chk_application_status_valid 
CHECK (status IN ('pending', 'accepted', 'rejected'));

-- Add full-text search indices
CREATE INDEX idx_opportunities_search 
ON public.opportunities 
USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(company, '')));

CREATE INDEX idx_opportunities_tags 
ON public.opportunities 
USING gin(tags);

-- Add index for better performance
CREATE INDEX idx_opportunity_applications_opportunity_id 
ON public.opportunity_applications(opportunity_id);

CREATE INDEX idx_opportunity_applications_user_id 
ON public.opportunity_applications(user_id);
-- Create opportunity_views table for deduped view tracking
CREATE TABLE IF NOT EXISTS public.opportunity_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  opportunity_id uuid NOT NULL,
  viewer_id uuid NOT NULL,
  viewed_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(opportunity_id, viewer_id)
);

-- Enable RLS on opportunity_views
ALTER TABLE public.opportunity_views ENABLE ROW LEVEL SECURITY;

-- Create policies for opportunity_views
CREATE POLICY "Users can create their own views" 
ON public.opportunity_views 
FOR INSERT 
WITH CHECK (auth.uid() = viewer_id);

CREATE POLICY "Users can view public opportunity views" 
ON public.opportunity_views 
FOR SELECT 
USING (true);

-- Create function to track views with deduplication
CREATE OR REPLACE FUNCTION public.track_opportunity_view(opportunity_id_param uuid, viewer_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  view_exists boolean := false;
BEGIN
  -- Check if this user has already viewed this opportunity
  SELECT EXISTS (
    SELECT 1 FROM public.opportunity_views 
    WHERE opportunity_id = opportunity_id_param AND viewer_id = viewer_id_param
  ) INTO view_exists;
  
  -- Only insert and increment if this is a new view
  IF NOT view_exists THEN
    -- Insert the view record
    INSERT INTO public.opportunity_views (opportunity_id, viewer_id)
    VALUES (opportunity_id_param, viewer_id_param);
    
    -- Increment the views count
    UPDATE public.opportunities 
    SET views_count = views_count + 1 
    WHERE id = opportunity_id_param;
    
    RETURN true;
  END IF;
  
  RETURN false;
END;
$function$;
-- Fix artform_type comparison in notify_matching_opportunity function
CREATE OR REPLACE FUNCTION public.notify_matching_opportunity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Notify artists whose artform matches the opportunity
  IF NEW.art_forms IS NOT NULL AND array_length(NEW.art_forms, 1) > 0 THEN
    INSERT INTO public.notifications (user_id, type, title, message, link, opportunity_id)
    SELECT 
      p.user_id,
      'opportunity',
      'New Opportunity',
      'New ' || NEW.title || ' opportunity in ' || COALESCE(NEW.location, 'your area'),
      '/opportunities/' || NEW.id,
      NEW.id
    FROM public.profiles p
    WHERE p.role = 'artist'
      AND p.artform::text = ANY(NEW.art_forms)
      AND p.user_id != NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$function$;
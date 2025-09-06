-- Fix search path for username_available function
CREATE OR REPLACE FUNCTION public.username_available(candidate text)
RETURNS jsonb 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = 'public'
AS $$
DECLARE
  taken boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE lower(username) = lower(candidate)
  ) INTO taken;

  RETURN jsonb_build_object('exists', taken);
END;
$$;
-- Add case-insensitive unique index for usernames
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_username_lower 
ON public.profiles(lower(username));

-- Create RPC function to check username availability
CREATE OR REPLACE FUNCTION public.username_available(candidate text)
RETURNS jsonb 
LANGUAGE plpgsql 
SECURITY DEFINER 
SET search_path = public
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
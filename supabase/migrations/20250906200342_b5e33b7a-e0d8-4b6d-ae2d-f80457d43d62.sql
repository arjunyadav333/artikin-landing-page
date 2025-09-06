-- Fix all remaining functions with mutable search paths

-- Fix all functions that don't have SET search_path defined
CREATE OR REPLACE FUNCTION public.create_conversation_participants()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Insert participant records for both users
  INSERT INTO public.conversation_participants (conversation_id, user_id)
  VALUES 
    (NEW.id, NEW.participant_a),
    (NEW.id, NEW.participant_b);
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_share_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts 
    SET shares_count = shares_count + 1 
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts 
    SET shares_count = shares_count - 1 
    WHERE id = OLD.post_id;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_application_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.handle_save_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts 
    SET saves_count = saves_count + 1 
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts 
    SET saves_count = saves_count - 1 
    WHERE id = OLD.post_id;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_comment_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts 
    SET comments_count = comments_count + 1 
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts 
    SET comments_count = comments_count - 1 
    WHERE id = OLD.post_id;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_post_like()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.post_id IS NOT NULL THEN
    UPDATE public.posts 
    SET likes_count = likes_count + 1 
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' AND OLD.post_id IS NOT NULL THEN
    UPDATE public.posts 
    SET likes_count = likes_count - 1 
    WHERE id = OLD.post_id;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.validate_file_upload()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Validate file size (50MB max)
  IF NEW.file_size > 52428800 THEN
    RAISE EXCEPTION 'File size exceeds maximum allowed (50MB)';
  END IF;
  
  -- Validate mime type (whitelist approach)
  IF NEW.mime_type NOT IN (
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'video/mp4', 'video/webm', 'video/quicktime',
    'application/pdf', 'text/plain', 
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) THEN
    RAISE EXCEPTION 'File type not allowed: %', NEW.mime_type;
  END IF;
  
  RETURN NEW;
END;
$function$;
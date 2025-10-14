-- Fix security warnings by setting search_path for trigger functions

CREATE OR REPLACE FUNCTION notify_new_follower()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, link, actor_id)
  SELECT 
    NEW.following_id,
    'follow',
    'New Follower',
    p.display_name || ' started following you',
    '/profile/' || NEW.follower_id,
    NEW.follower_id
  FROM public.profiles p
  WHERE p.user_id = NEW.follower_id;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION notify_post_like()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only notify if someone else liked your post
  IF NEW.user_id != (SELECT user_id FROM public.posts WHERE id = NEW.post_id) THEN
    INSERT INTO public.notifications (user_id, type, title, message, link, actor_id, post_id)
    SELECT 
      p.user_id,
      'like',
      'New Like',
      prof.display_name || ' liked your post',
      '/posts/' || NEW.post_id,
      NEW.user_id,
      NEW.post_id
    FROM public.posts p
    JOIN public.profiles prof ON prof.user_id = NEW.user_id
    WHERE p.id = NEW.post_id;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION notify_comment()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only notify if someone else commented on your post
  IF NEW.user_id != (SELECT user_id FROM public.posts WHERE id = NEW.post_id) THEN
    INSERT INTO public.notifications (user_id, type, title, message, link, actor_id, post_id)
    SELECT 
      p.user_id,
      'comment',
      'New Comment',
      prof.display_name || ' commented on your post',
      '/posts/' || NEW.post_id,
      NEW.user_id,
      NEW.post_id
    FROM public.posts p
    JOIN public.profiles prof ON prof.user_id = NEW.user_id
    WHERE p.id = NEW.post_id;
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION notify_matching_opportunity()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
      AND p.artform = ANY(NEW.art_forms)
      AND p.user_id != NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;
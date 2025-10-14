-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('follow', 'like', 'comment', 'opportunity', 'application')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT false,
  actor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  opportunity_id UUID REFERENCES public.opportunities(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_read ON public.notifications(read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Trigger for new followers
CREATE OR REPLACE FUNCTION notify_new_follower()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_new_follower
  AFTER INSERT ON public.connections
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_follower();

-- Trigger for post likes
CREATE OR REPLACE FUNCTION notify_post_like()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_post_like
  AFTER INSERT ON public.likes
  FOR EACH ROW
  WHEN (NEW.post_id IS NOT NULL)
  EXECUTE FUNCTION notify_post_like();

-- Trigger for comments
CREATE OR REPLACE FUNCTION notify_comment()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_comment
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION notify_comment();

-- Trigger for new opportunities matching user's artform
CREATE OR REPLACE FUNCTION notify_matching_opportunity()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_notify_matching_opportunity
  AFTER INSERT ON public.opportunities
  FOR EACH ROW
  WHEN (NEW.status = 'active')
  EXECUTE FUNCTION notify_matching_opportunity();

-- Add updated_at trigger
CREATE TRIGGER handle_notifications_updated_at
  BEFORE UPDATE ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
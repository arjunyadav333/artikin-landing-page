-- Create saves table for bookmarking posts
CREATE TABLE public.saves (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  post_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, post_id)
);

-- Enable RLS
ALTER TABLE public.saves ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own saves" 
ON public.saves 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own saves" 
ON public.saves 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saves" 
ON public.saves 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to handle saves count
CREATE OR REPLACE FUNCTION public.handle_save_count()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;

-- Create trigger
CREATE TRIGGER saves_count_trigger
  AFTER INSERT OR DELETE ON public.saves
  FOR EACH ROW EXECUTE FUNCTION public.handle_save_count();
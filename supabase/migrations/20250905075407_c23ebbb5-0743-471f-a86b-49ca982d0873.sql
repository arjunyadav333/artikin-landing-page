-- Add new profile fields to existing profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS headline text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS social_links jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS portfolio_count integer DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS verified boolean DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS stats jsonb DEFAULT '{}'::jsonb;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pronouns text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS contact_email text;

-- Create portfolios table
CREATE TABLE IF NOT EXISTS public.portfolios (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  media_urls text[] DEFAULT '{}',
  media_meta jsonb DEFAULT '{}'::jsonb,
  tags text[] DEFAULT '{}',
  likes_count integer DEFAULT 0,
  views_count integer DEFAULT 0,
  featured boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create profile_views table for analytics
CREATE TABLE IF NOT EXISTS public.profile_views (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  viewer_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  profile_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  viewed_at timestamp with time zone DEFAULT now(),
  session_id text
);

-- Create unique index for profile views (one per user per profile per day)
CREATE UNIQUE INDEX IF NOT EXISTS idx_profile_views_unique_daily 
ON public.profile_views (viewer_id, profile_id, date(viewed_at));

-- Create profile_bookmarks table
CREATE TABLE IF NOT EXISTS public.profile_bookmarks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  UNIQUE(user_id, profile_id)
);

-- Enable RLS
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_bookmarks ENABLE ROW LEVEL SECURITY;

-- RLS Policies for portfolios
CREATE POLICY "Portfolios are viewable by everyone" ON public.portfolios
  FOR SELECT USING (true);

CREATE POLICY "Users can create their own portfolios" ON public.portfolios
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own portfolios" ON public.portfolios
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own portfolios" ON public.portfolios
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for profile_views
CREATE POLICY "Users can view their own profile views" ON public.profile_views
  FOR SELECT USING (auth.uid() = profile_id OR auth.uid() = viewer_id);

CREATE POLICY "Anyone can create profile views" ON public.profile_views
  FOR INSERT WITH CHECK (true);

-- RLS Policies for profile_bookmarks
CREATE POLICY "Users can view their own bookmarks" ON public.profile_bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bookmarks" ON public.profile_bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bookmarks" ON public.profile_bookmarks
  FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_portfolios_user_id ON public.portfolios(user_id);
CREATE INDEX IF NOT EXISTS idx_portfolios_featured ON public.portfolios(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_profile_views_profile_id ON public.profile_views(profile_id);
CREATE INDEX IF NOT EXISTS idx_profile_views_viewed_at ON public.profile_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_profile_bookmarks_user_id ON public.profile_bookmarks(user_id);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-pictures', 'profile-pictures', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('portfolio', 'portfolio', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-docs', 'profile-docs', false) ON CONFLICT DO NOTHING;

-- Storage policies for profile-pictures
CREATE POLICY "Profile pictures are publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-pictures');

CREATE POLICY "Users can upload their own profile pictures" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own profile pictures" ON storage.objects
  FOR UPDATE USING (bucket_id = 'profile-pictures' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for portfolio
CREATE POLICY "Portfolio media is publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'portfolio');

CREATE POLICY "Users can upload their own portfolio media" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own portfolio media" ON storage.objects
  FOR UPDATE USING (bucket_id = 'portfolio' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies for profile-docs
CREATE POLICY "Users can view their own documents" ON storage.objects
  FOR SELECT USING (bucket_id = 'profile-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can upload their own documents" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'profile-docs' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Trigger to update portfolio_count
CREATE OR REPLACE FUNCTION public.update_portfolio_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.profiles 
    SET portfolio_count = portfolio_count + 1 
    WHERE user_id = NEW.user_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.profiles 
    SET portfolio_count = portfolio_count - 1 
    WHERE user_id = OLD.user_id;
  END IF;
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for portfolio count updates
CREATE TRIGGER update_portfolio_count_trigger
AFTER INSERT OR DELETE ON public.portfolios
FOR EACH ROW EXECUTE FUNCTION public.update_portfolio_count();
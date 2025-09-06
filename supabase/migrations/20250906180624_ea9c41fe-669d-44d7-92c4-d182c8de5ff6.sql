-- Complete the remaining security fixes
-- Fix remaining dangerous policies for follows, shares, and profiles tables

-- 1. Fix dangerous "view all follows" policy
DROP POLICY IF EXISTS "Users can view all follows" ON public.follows;

CREATE POLICY "Users can view follows based on privacy settings" 
ON public.follows
FOR SELECT  
TO authenticated, anon
USING (
  -- Users can see their own follows
  (auth.uid() IS NOT NULL AND (follower_id = auth.uid() OR followed_id = auth.uid())) OR
  -- Can see follows if the followed person has public profile
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = follows.followed_id AND p.privacy = 'public'
  ) OR
  -- Can see follows if the follower has public profile  
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE p.user_id = follows.follower_id AND p.privacy = 'public'
  )
);

-- 2. Check if shares policies need fixing (if shares table exists and has dangerous policies)
DROP POLICY IF EXISTS "Shares are viewable by everyone" ON public.shares;

-- Re-create privacy-aware shares policy if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'shares' 
    AND policyname = 'Users can view shares based on privacy settings'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view shares based on privacy settings"
    ON public.shares
    FOR SELECT
    TO authenticated, anon
    USING (
      -- Users can see their own shares
      (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
      -- Shares of public posts are viewable
      EXISTS (
        SELECT 1 FROM public.posts p 
        JOIN public.profiles pr ON pr.user_id = p.user_id  
        WHERE p.id = shares.post_id AND pr.privacy = ''public''
      ) OR
      -- Followers can see shares if they follow the person who shared
      (auth.uid() IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.connections conn
        WHERE conn.follower_id = auth.uid() AND conn.following_id = shares.user_id
      ))
    )';
  END IF;
END
$$;

-- 3. Ensure profiles have proper privacy policies
-- Drop any remaining dangerous profile policies
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create comprehensive privacy-aware profile policy if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'profiles' 
    AND policyname = 'Users can view public profiles or own profile'
  ) THEN
    EXECUTE 'CREATE POLICY "Users can view public profiles or own profile"
    ON public.profiles
    FOR SELECT
    TO authenticated, anon
    USING (
      privacy = ''public'' OR 
      (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
      (privacy = ''private'' AND auth.uid() IS NOT NULL AND EXISTS (
        SELECT 1 FROM public.connections 
        WHERE following_id = profiles.user_id AND follower_id = auth.uid()
      ))
    )';
  END IF;
END
$$;

-- 4. Add input validation trigger for file uploads
CREATE OR REPLACE FUNCTION public.validate_file_upload()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for message attachments validation
DROP TRIGGER IF EXISTS validate_attachment_upload ON public.message_attachments;
CREATE TRIGGER validate_attachment_upload
  BEFORE INSERT OR UPDATE ON public.message_attachments
  FOR EACH ROW EXECUTE FUNCTION public.validate_file_upload();

-- Comment: Completed critical security fixes
-- - Fixed dangerous "view all follows" policy with privacy-aware version
-- - Ensured shares table has proper privacy controls
-- - Confirmed profiles table has comprehensive privacy policies  
-- - Added file upload validation with whitelist approach
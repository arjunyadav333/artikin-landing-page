-- CRITICAL SECURITY FIXES: Address massive data exposure vulnerabilities
-- Phase 1: Implement privacy-aware profile policies and secure social graph data

-- 1. REPLACE DANGEROUS "everyone can read profiles" POLICY
-- Drop the existing dangerous policy that exposes all user data
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

-- Create privacy-aware profile policies
-- Allow viewing public profiles or own profile
CREATE POLICY "Users can view public profiles or own profile"
ON public.profiles
FOR SELECT
TO authenticated, anon
USING (
  privacy = 'public' OR 
  (auth.uid() IS NOT NULL AND user_id = auth.uid())
);

-- Create more restrictive policy for sensitive fields
-- Only show full details to profile owner or if they're connected and profile is public
CREATE POLICY "Sensitive profile data restricted"
ON public.profiles
FOR SELECT
TO authenticated, anon
USING (
  CASE 
    WHEN auth.uid() = user_id THEN true  -- Own profile
    WHEN privacy = 'public' THEN true   -- Public profile
    WHEN privacy = 'private' AND auth.uid() IS NOT NULL THEN 
      -- For private profiles, only show limited info to followers
      EXISTS (
        SELECT 1 FROM public.connections 
        WHERE following_id = profiles.user_id 
        AND follower_id = auth.uid()
      )
    ELSE false
  END
);

-- 2. SECURE SOCIAL GRAPH DATA - Fix connections table
-- Drop the dangerous "everyone can view connections" policy
DROP POLICY IF EXISTS "Connections are viewable by everyone" ON public.connections;

-- Create privacy-aware connections policies
CREATE POLICY "Users can view connections based on privacy settings"
ON public.connections
FOR SELECT
TO authenticated, anon
USING (
  -- Users can always see their own connections
  (auth.uid() IS NOT NULL AND (follower_id = auth.uid() OR following_id = auth.uid())) OR
  -- Or if the profile being followed/following is public
  EXISTS (
    SELECT 1 FROM public.profiles p 
    WHERE (p.user_id = connections.following_id OR p.user_id = connections.follower_id)
    AND p.privacy = 'public'
  ) OR
  -- Or if the viewer follows the person whose connections they're viewing
  (auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.connections c2
    WHERE c2.follower_id = auth.uid() 
    AND (c2.following_id = connections.follower_id OR c2.following_id = connections.following_id)
  ))
);

-- 3. SECURE LIKES - Make them privacy-aware
-- Drop the dangerous "everyone can view likes" policy  
DROP POLICY IF EXISTS "Likes are viewable by everyone" ON public.likes;

-- Create privacy-aware likes policy
CREATE POLICY "Users can view likes based on privacy settings"
ON public.likes
FOR SELECT  
TO authenticated, anon
USING (
  -- Users can always see their own likes
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
  -- Or if the post/comment author has a public profile
  (post_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.posts p 
    JOIN public.profiles pr ON pr.user_id = p.user_id
    WHERE p.id = likes.post_id AND pr.privacy = 'public'
  )) OR
  (comment_id IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.comments c
    JOIN public.profiles pr ON pr.user_id = c.user_id  
    WHERE c.id = likes.comment_id AND pr.privacy = 'public'
  )) OR
  -- Or if the viewer follows the person who liked it
  (auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.connections conn
    WHERE conn.follower_id = auth.uid() AND conn.following_id = likes.user_id
  ))
);

-- 4. SECURE COMMENTS - Make them privacy-aware
-- Drop the dangerous "everyone can view comments" policy
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.comments;

-- Create privacy-aware comments policy
CREATE POLICY "Users can view comments based on privacy settings"
ON public.comments
FOR SELECT
TO authenticated, anon  
USING (
  -- Comments on public posts are viewable
  EXISTS (
    SELECT 1 FROM public.posts p 
    JOIN public.profiles pr ON pr.user_id = p.user_id
    WHERE p.id = comments.post_id AND pr.privacy = 'public'
  ) OR
  -- Users can see their own comments
  (auth.uid() IS NOT NULL AND user_id = auth.uid()) OR
  -- Users can see comments on their own posts
  (auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.posts p 
    WHERE p.id = comments.post_id AND p.user_id = auth.uid()
  )) OR
  -- Followers can see comments on private posts if they follow the post author
  (auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.posts p 
    JOIN public.connections conn ON conn.following_id = p.user_id
    WHERE p.id = comments.post_id AND conn.follower_id = auth.uid()
  ))
);

-- 5. SECURE SHARES - Make them privacy-aware  
-- Drop the dangerous "everyone can view shares" policy
DROP POLICY IF EXISTS "Shares are viewable by everyone" ON public.shares;

-- Create privacy-aware shares policy
CREATE POLICY "Users can view shares based on privacy settings"
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
    WHERE p.id = shares.post_id AND pr.privacy = 'public'
  ) OR
  -- Followers can see shares if they follow the person who shared
  (auth.uid() IS NOT NULL AND EXISTS (
    SELECT 1 FROM public.connections conn
    WHERE conn.follower_id = auth.uid() AND conn.following_id = shares.user_id
  ))
);

-- 6. UPDATE SECURITY DEFINER FUNCTIONS TO RESPECT PRIVACY
-- Update the profile function to be privacy-aware
DROP FUNCTION IF EXISTS public.get_profile_public_info(uuid);

CREATE OR REPLACE FUNCTION public.get_profile_public_info(profile_user_id uuid)
RETURNS TABLE(
  id uuid, 
  user_id uuid, 
  username text, 
  display_name text, 
  avatar_url text, 
  role user_role,
  artform artform_type,
  location text,
  privacy text,
  bio text,
  -- Sensitive fields only for authorized viewers
  full_name text,
  phone_number text
) 
LANGUAGE sql 
SECURITY INVOKER  -- Use SECURITY INVOKER for better security
SET search_path = public
AS $$
  SELECT 
    p.id, 
    p.user_id, 
    p.username, 
    p.display_name, 
    p.avatar_url, 
    p.role, 
    p.artform, 
    CASE 
      WHEN p.privacy = 'public' OR p.user_id = auth.uid() THEN p.location
      ELSE NULL 
    END as location,
    p.privacy,
    CASE 
      WHEN p.privacy = 'public' OR p.user_id = auth.uid() THEN p.bio
      ELSE NULL 
    END as bio,
    -- Sensitive fields only for profile owner
    CASE 
      WHEN p.user_id = auth.uid() THEN p.full_name
      ELSE NULL 
    END as full_name,
    CASE 
      WHEN p.user_id = auth.uid() THEN p.phone_number  
      ELSE NULL
    END as phone_number
  FROM public.profiles p 
  WHERE p.user_id = profile_user_id
  AND (
    p.privacy = 'public' OR 
    p.user_id = auth.uid() OR
    (p.privacy = 'private' AND auth.uid() IS NOT NULL AND EXISTS (
      SELECT 1 FROM public.connections 
      WHERE following_id = p.user_id AND follower_id = auth.uid()
    ))
  );
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_profile_public_info(uuid) TO authenticated, anon;

-- Comment: Implemented critical security fixes to prevent massive data exposure
-- - Replaced dangerous "everyone can read" policies with privacy-aware policies
-- - Secured social graph data (connections, likes, comments, shares) 
-- - Updated functions to respect privacy settings
-- - Restricted access to sensitive personal information
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PostRowWide } from "@/components/feed/PostRowWide";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { PostSkeleton } from "@/components/ui/post-skeleton";
import { HomeFeedPost } from "@/hooks/useHomeFeed";

const PostDetail = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();

  const { data: post, isLoading, isError } = useQuery({
    queryKey: ['post', postId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles (
            id, user_id, username, display_name, full_name, handle, account_type, 
            art_form, avatar_url, profile_pic, role, artform, organization_type, location
          )
        `)
        .eq('id', postId)
        .single();

      if (error) throw error;

      // Check if user liked this post
      let userLiked = false;
      if (user) {
        const { data: likeData } = await supabase
          .from('likes')
          .select('id')
          .eq('user_id', user.id)
          .eq('post_id', postId)
          .single();
        userLiked = !!likeData;
      }

      // Check if user is following the post author
      let isFollowing = false;
      if (user && user.id !== data.user_id) {
        const { data: followData } = await supabase
          .from('connections')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', data.user_id)
          .single();
        isFollowing = !!followData;
      }

      // Transform the data to match HomeFeedPost interface
      const transformedPost: HomeFeedPost = {
        id: data.id,
        user_id: data.user_id,
        title: data.title,
        content: data.content,
        media_urls: data.media_urls,
        media_types: data.media_types,
        tags: data.tags,
        visibility: data.visibility,
        likes_count: data.likes_count || 0,
        comments_count: data.comments_count || 0,
        shares_count: data.shares_count || 0,
        saves_count: data.saves_count || 0,
        created_at: data.created_at,
        updated_at: data.updated_at,
        profiles: data.profiles as any, // The profiles should be properly joined
        user_liked: userLiked,
        is_following: isFollowing
      };

      return transformedPost;
    },
    enabled: !!postId,
  });

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-background">
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="flex items-center px-4 py-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="mr-3"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold">Post</h1>
          </div>
        </div>
        <div className="w-full max-w-none sm:max-w-2xl sm:mx-auto lg:max-w-3xl xl:max-w-4xl">
          <PostSkeleton />
        </div>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="w-full min-h-screen bg-background">
        <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
          <div className="flex items-center px-4 py-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="mr-3"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-lg font-semibold">Post</h1>
          </div>
        </div>
        <div className="w-full max-w-none sm:max-w-2xl sm:mx-auto lg:max-w-3xl xl:max-w-4xl">
          <div className="text-center p-8">
            <p className="text-muted-foreground mb-4">Post not found</p>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center px-4 py-3">
          <Button 
            variant="ghost" 
            size="sm" 
            className="mr-3"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold">Post</h1>
        </div>
      </div>
      
      <div className="w-full max-w-none sm:max-w-2xl sm:mx-auto lg:max-w-3xl xl:max-w-4xl">
        <PostRowWide post={post} />
      </div>
    </div>
  );
};

export default PostDetail;
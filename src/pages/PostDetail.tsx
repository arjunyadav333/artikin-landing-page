import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { FullWidthPost } from "@/components/feed/full-width-post";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { PostSkeleton } from "@/components/ui/post-skeleton";

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
            id, user_id, username, display_name, avatar_url, role, artform, location
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

      // Check if user saved this post
      let userSaved = false;
      // For now, we'll skip checking saves until the saves table is properly configured

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

      return {
        ...data,
        user_liked: userLiked,
        user_saved: userSaved,
        is_following: isFollowing
      } as any; // Type assertion to bypass strict typing for now
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
        <FullWidthPost post={post} />
      </div>
    </div>
  );
};

export default PostDetail;
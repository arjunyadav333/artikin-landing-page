import { useNavigate } from "react-router-dom";
import { FullWidthPost } from "@/components/feed/full-width-post";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Bookmark } from "lucide-react";
import { PostListSkeleton } from "@/components/ui/post-skeleton";
import { useAuth } from "@/hooks/useAuth";
import { useSavedPosts } from "@/hooks/useSaves";

const SavedPosts = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: savedPosts, isLoading, isError } = useSavedPosts();

  if (!user) {
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
            <h1 className="text-lg font-semibold">Saved Posts</h1>
          </div>
        </div>
        <div className="text-center p-8">
          <p className="text-muted-foreground">Please log in to view saved posts</p>
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
          <div className="flex items-center space-x-2">
            <Bookmark className="h-5 w-5 text-primary" />
            <h1 className="text-lg font-semibold">Saved Posts</h1>
          </div>
        </div>
      </div>
      
      <div className="w-full max-w-none sm:max-w-2xl sm:mx-auto lg:max-w-3xl xl:max-w-4xl">
        {isLoading ? (
          <PostListSkeleton count={3} />
        ) : isError ? (
          <div className="text-center p-8">
            <p className="text-muted-foreground mb-4">Failed to load saved posts</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : !savedPosts || savedPosts.length === 0 ? (
          <div className="text-center p-8">
            <div className="text-6xl mb-4">📌</div>
            <h3 className="text-lg font-semibold mb-2">No saved posts yet</h3>
            <p className="text-muted-foreground text-sm mb-6">
              Posts you save will appear here. Start exploring and save posts you love!
            </p>
            <Button 
              onClick={() => navigate('/home')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Explore Posts
            </Button>
          </div>
        ) : (
          <div className="space-y-0">
            {savedPosts.map((post: any) => (
              <FullWidthPost key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedPosts;
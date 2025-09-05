import { usePosts } from "@/hooks/usePosts";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { Link } from "react-router-dom";

const Home = () => {
  const { user } = useAuth();
  const { data, isLoading, fetchNextPage, hasNextPage } = usePosts();
  
  const posts = data?.pages?.flat() || [];

  if (isLoading && posts.length === 0) {
    return (
      <div className="w-full min-h-screen bg-background">
        <div className="w-full max-w-none sm:max-w-2xl sm:mx-auto lg:max-w-3xl xl:max-w-4xl p-4">
          <div className="text-center p-8">Loading posts...</div>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="w-full min-h-screen bg-background">
        <div className="w-full max-w-none sm:max-w-2xl sm:mx-auto lg:max-w-3xl xl:max-w-4xl p-4">
          <div className="text-center p-8">
            <h3 className="text-lg font-semibold mb-2">Welcome to the Home Feed</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Your feed will appear here. Let's start by creating your first post!
            </p>
            <Link to="/create">
              <Button className="rounded-full px-8">Create Post</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-background">
      <div className="w-full max-w-none sm:max-w-2xl sm:mx-auto lg:max-w-3xl xl:max-w-4xl">
        <div className="space-y-4 p-4">
          {posts.map((post) => (
            <Card key={post.id} className="w-full">
              <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.profiles?.avatar_url} alt={post.profiles?.display_name} />
                      <AvatarFallback>
                        {post.profiles?.display_name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <Link 
                        to={`/profile/${post.user_id}`}
                        className="font-semibold text-sm hover:underline"
                      >
                        {post.profiles?.display_name || 'Unknown User'}
                      </Link>
                      <div className="text-xs text-muted-foreground">
                        @{post.profiles?.username} • {post.profiles?.role}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="mb-4">
                  {post.title && (
                    <h3 className="font-semibold mb-2">{post.title}</h3>
                  )}
                  <p className="text-sm leading-relaxed">{post.content}</p>
                </div>

                {/* Media */}
                {post.media_urls && post.media_urls.length > 0 && (
                  <div className="mb-4">
                    <div className="grid grid-cols-1 gap-2">
                      {post.media_urls.map((url, index) => (
                        <img
                          key={index}
                          src={url}
                          alt="Post media"
                          className="w-full rounded-lg object-cover max-h-96"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center space-x-6 pt-2 border-t">
                  <button className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-red-500">
                    <Heart className="h-4 w-4" />
                    <span>{post.likes_count}</span>
                  </button>
                  <button className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-blue-500">
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.comments_count}</span>
                  </button>
                  <button className="flex items-center space-x-1 text-sm text-muted-foreground hover:text-green-500">
                    <Share2 className="h-4 w-4" />
                    <span>{post.shares_count}</span>
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
          
          {hasNextPage && (
            <div className="text-center py-4">
              <Button 
                onClick={() => fetchNextPage()}
                variant="outline"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
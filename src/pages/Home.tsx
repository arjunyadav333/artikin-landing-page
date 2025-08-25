import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react";

const Home = () => {
  const mockPosts = [
    {
      id: 1,
      author: "Sarah Chen",
      username: "@sarahartist",
      avatar: "",
      time: "2h",
      content: "Just finished this watercolor piece inspired by urban landscapes. The interplay of light and shadow in city spaces never fails to amaze me.",
      image: "/placeholder.svg",
      likes: 24,
      comments: 8,
      shares: 3
    },
    {
      id: 2,
      author: "Marcus Rodriguez",
      username: "@marcusmusic",
      avatar: "",
      time: "4h",
      content: "Excited to share my latest composition. This piece explores the intersection of jazz and electronic music.",
      likes: 18,
      comments: 12,
      shares: 5
    },
    {
      id: 3,
      author: "Elena Kowalski",
      username: "@elenadesign",
      avatar: "",
      time: "6h",
      content: "Working on a new brand identity for a sustainable fashion startup. Love how creative projects can drive positive change!",
      image: "/placeholder.svg",
      likes: 31,
      comments: 15,
      shares: 8
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="container max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Your Feed</h1>
          <p className="text-muted-foreground">Discover amazing work from artists in your network</p>
        </div>

        <div className="space-y-6">
          {mockPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={post.avatar} alt={post.author} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {post.author.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-sm">{post.author}</h3>
                      <span className="text-muted-foreground text-sm">{post.username}</span>
                      <span className="text-muted-foreground text-sm">·</span>
                      <span className="text-muted-foreground text-sm">{post.time}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Bookmark className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <p className="text-sm mb-4 leading-relaxed">{post.content}</p>
                
                {post.image && (
                  <div className="mb-4 rounded-lg overflow-hidden bg-muted">
                    <div className="aspect-video bg-gradient-to-br from-primary/20 to-creative/20 flex items-center justify-center">
                      <span className="text-muted-foreground">Artwork Preview</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center space-x-6">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-500">
                      <Heart className="h-4 w-4 mr-1" />
                      {post.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                      <MessageCircle className="h-4 w-4 mr-1" />
                      {post.comments}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                      <Share2 className="h-4 w-4 mr-1" />
                      {post.shares}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button variant="outline" className="w-full max-w-sm">
            Load More Posts
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
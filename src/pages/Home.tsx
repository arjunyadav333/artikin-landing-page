import { useState } from "react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  MoreHorizontal,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Home = () => {
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<number>>(new Set());
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());

  const mockPosts = [
    {
      id: 1,
      author: "Sarah Chen",
      username: "@sarahartist",
      avatar: "",
      role: "Visual Artist",
      time: "2h",
      content: "Just finished this watercolor piece inspired by urban landscapes. The interplay of light and shadow in city spaces never fails to amaze me. #UrbanArt #Watercolor #CityLife",
      images: ["/placeholder.svg", "/placeholder.svg"],
      likes: 24,
      comments: 8,
      shares: 3,
      isFollowing: false,
      likedBy: ["Alex Rivera", "Marcus"],
      topComments: [
        { author: "Alex Rivera", content: "Absolutely stunning work! The depth is incredible.", avatar: "" },
        { author: "Maria Lopez", content: "This captures the essence of city life beautifully", avatar: "" }
      ]
    },
    {
      id: 2,
      author: "Marcus Rodriguez",
      username: "@marcusmusic",
      avatar: "",
      role: "Music Producer",
      time: "4h",
      content: "Excited to share my latest composition. This piece explores the intersection of jazz and electronic music. What do you think about this fusion? #Jazz #Electronic #MusicProduction",
      likes: 18,
      comments: 12,
      shares: 5,
      isFollowing: true,
      likedBy: ["Sarah Chen", "Elena"],
      topComments: [
        { author: "DJ Nova", content: "This fusion is exactly what the industry needs!", avatar: "" }
      ]
    },
    {
      id: 3,
      author: "Elena Kowalski",
      username: "@elenadesign",
      avatar: "",
      role: "Brand Designer",
      time: "6h",
      content: "Working on a new brand identity for a sustainable fashion startup. Love how creative projects can drive positive change! Check out the full case study on my portfolio. #BrandDesign #Sustainability #Fashion",
      images: ["/placeholder.svg"],
      likes: 31,
      comments: 15,
      shares: 8,
      isFollowing: false,
      likedBy: ["Sarah Chen", "Marcus", "David Kim"],
      topComments: [
        { author: "Green Studio", content: "Sustainability meets beautiful design ✨", avatar: "" },
        { author: "Fashion Forward", content: "Would love to collaborate on similar projects!", avatar: "" }
      ]
    }
  ];

  const handleLike = (postId: number) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleBookmark = (postId: number) => {
    setBookmarkedPosts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const toggleComments = (postId: number) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const formatText = (text: string) => {
    return text.split(' ').map((word, index) => {
      if (word.startsWith('#')) {
        return (
          <span key={index} className="text-primary font-medium cursor-pointer hover:underline">
            {word}{' '}
          </span>
        );
      }
      if (word.startsWith('http')) {
        return (
          <a key={index} href={word} target="_blank" rel="noopener noreferrer" 
             className="text-primary hover:underline">
            {word}{' '}
          </a>
        );
      }
      return word + ' ';
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 bg-background/80 backdrop-blur-md border-b border-border z-10 px-4 py-3">
          <h1 className="text-xl font-bold">Home</h1>
        </div>

        {/* Feed */}
        <div className="pb-20 md:pb-8">
          {mockPosts.map((post) => (
            <article key={post.id} className="border-b border-border">
              {/* Post Header */}
              <div className="flex items-center justify-between p-4 pb-3">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10 cursor-pointer">
                    <AvatarImage src={post.avatar} alt={post.author} />
                    <AvatarFallback className="bg-muted text-foreground">
                      {post.author.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm cursor-pointer hover:text-primary transition-colors">
                        {post.author}
                      </span>
                      <span className="text-muted-foreground text-sm">{post.username}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span>{post.role}</span>
                      <span>•</span>
                      <span>{post.time}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button 
                    size="sm" 
                    variant={post.isFollowing ? "secondary" : "default"}
                    className="h-8 px-4 rounded-full text-xs font-medium"
                  >
                    {post.isFollowing ? "Following" : "Follow"}
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Report</DropdownMenuItem>
                      <DropdownMenuItem>Mute</DropdownMenuItem>
                      <DropdownMenuItem>Copy Link</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {/* Post Content */}
              <div className="px-4 pb-3">
                <p className="text-sm leading-relaxed">
                  {formatText(post.content)}
                </p>
              </div>

              {/* Post Media */}
              {post.images && (
                <div className="relative bg-muted">
                  {post.images.length === 1 ? (
                    <div className="aspect-square bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center">
                      <span className="text-muted-foreground text-sm">Artwork Preview</span>
                    </div>
                  ) : (
                    <div className="relative">
                      <div className="aspect-square bg-gradient-to-br from-muted to-muted/60 flex items-center justify-center">
                        <span className="text-muted-foreground text-sm">Gallery Preview 1/{post.images.length}</span>
                      </div>
                      <Button variant="ghost" size="sm" className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-black/20 hover:bg-black/40 text-white">
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 p-0 bg-black/20 hover:bg-black/40 text-white">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Action Bar */}
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-foreground hover:text-red-500 transition-colors"
                    onClick={() => handleLike(post.id)}
                  >
                    <Heart 
                      className={`h-6 w-6 mr-1 transition-all ${
                        likedPosts.has(post.id) ? 'fill-red-500 text-red-500' : ''
                      }`} 
                    />
                    <span className="text-sm font-medium">{post.likes + (likedPosts.has(post.id) ? 1 : 0)}</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-foreground hover:text-primary transition-colors"
                    onClick={() => toggleComments(post.id)}
                  >
                    <MessageCircle className="h-6 w-6 mr-1" />
                    <span className="text-sm font-medium">{post.comments}</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 text-foreground hover:text-primary transition-colors"
                  >
                    <Share2 className="h-6 w-6 mr-1" />
                    <span className="text-sm font-medium">{post.shares}</span>
                  </Button>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-foreground hover:text-primary transition-colors"
                  onClick={() => handleBookmark(post.id)}
                >
                  <Bookmark 
                    className={`h-6 w-6 transition-all ${
                      bookmarkedPosts.has(post.id) ? 'fill-primary text-primary' : ''
                    }`} 
                  />
                </Button>
              </div>

              {/* Post Footer */}
              <div className="px-4 pb-4 space-y-2">
                {/* Like Summary */}
                <div className="text-sm">
                  <span className="font-medium">Liked by </span>
                  <span className="font-bold cursor-pointer hover:text-primary transition-colors">
                    {post.likedBy[0]}
                  </span>
                  {post.likedBy.length > 1 && (
                    <>
                      <span> and </span>
                      <span className="font-bold cursor-pointer hover:text-primary transition-colors">
                        {post.likes - 1} others
                      </span>
                    </>
                  )}
                </div>

                {/* Comments Preview */}
                <div className="space-y-1">
                  {post.topComments.slice(0, 2).map((comment, index) => (
                    <div key={index} className="text-sm">
                      <span className="font-bold cursor-pointer hover:text-primary transition-colors mr-2">
                        {comment.author}
                      </span>
                      <span>{comment.content}</span>
                    </div>
                  ))}
                  
                  {post.comments > 2 && (
                    <button 
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      onClick={() => toggleComments(post.id)}
                    >
                      View all {post.comments} comments
                    </button>
                  )}
                </div>

                {/* Expanded Comments */}
                {expandedComments.has(post.id) && (
                  <div className="mt-4 space-y-3 border-t border-border pt-4">
                    <div className="flex space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-muted text-foreground text-xs">
                          SC
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Add a comment..."
                          className="w-full bg-transparent text-sm border-none outline-none placeholder:text-muted-foreground"
                        />
                      </div>
                      <Button size="sm" variant="ghost" className="text-primary hover:text-primary/80 text-sm font-medium">
                        Post
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        {/* Load More */}
        <div className="p-4 text-center">
          <Button variant="outline" className="w-full max-w-sm rounded-full">
            Load More Posts
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
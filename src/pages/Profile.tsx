import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { 
  MapPin, 
  Calendar, 
  Globe, 
  Mail, 
  Edit, 
  Share, 
  MoreHorizontal,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  UserPlus,
  MessageSquare,
  ChevronDown,
  ExternalLink,
  X,
  Play
} from "lucide-react";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("posts");
  const [showFullBio, setShowFullBio] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set([2]));
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<number>>(new Set([2]));
  const [scrollPosition, setScrollPosition] = useState(0);

  const userProfile = {
    name: "Sarah Chen",
    username: "@sarahchen",
    role: "Digital Artist & UI Designer",
    bio: "Digital artist & UI/UX designer passionate about creating meaningful experiences through art and technology. Currently exploring the intersection of AI and creative design.",
    location: "San Francisco, CA",
    website: "sarahchen.com",
    email: "hello@sarahchen.com",
    joinDate: "March 2023",
    followers: 1234,
    following: 567,
    posts: 89,
    avatar: "",
    cover: "",
    isFollowing: false
  };

  const skillTags = ["Digital Art", "UI/UX Design", "Illustration", "Branding", "Motion Graphics", "Adobe Creative Suite"];

  const mockPosts = [
    {
      id: 1,
      author: {
        name: "Sarah Chen",
        username: "@sarahchen",
        avatar: "",
        role: "Digital Artist"
      },
      content: "Just finished this UI design for a sustainable fashion app. Really excited about the clean aesthetic and eco-friendly color palette! #UIDesign #SustainableFashion",
      media: ["/placeholder.svg"],
      mediaType: "image",
      likes: 124,
      comments: 18,
      shares: 12,
      timestamp: "2h",
      topComments: [
        { id: 1, author: "Alex Kim", content: "Love the color scheme! 🎨", likes: 3 },
        { id: 2, author: "Maria Santos", content: "This is incredible work Sarah!", likes: 5 }
      ]
    },
    {
      id: 2,
      author: {
        name: "Sarah Chen",
        username: "@sarahchen",
        avatar: "",
        role: "Digital Artist"
      },
      content: "Working on a series of illustrations inspired by urban landscapes. Each piece captures a different mood of city life. What do you think about this direction?",
      media: ["/placeholder.svg", "/placeholder.svg"],
      mediaType: "image",
      likes: 89,
      comments: 12,
      shares: 7,
      timestamp: "1d",
      topComments: [
        { id: 3, author: "David Park", content: "The mood in this series is amazing!", likes: 8 }
      ]
    },
    {
      id: 3,
      author: {
        name: "Sarah Chen",
        username: "@sarahchen",
        avatar: "",
        role: "Digital Artist"
      },
      content: "Experimenting with typography in motion graphics. Here's a sneak peek of my latest project! ✨",
      media: ["/placeholder.svg"],
      mediaType: "video",
      likes: 156,
      comments: 24,
      shares: 18,
      timestamp: "3d",
      topComments: [
        { id: 4, author: "Lisa Wang", content: "This is so smooth! 🔥", likes: 12 },
        { id: 5, author: "Tom Rodriguez", content: "What software did you use?", likes: 6 }
      ]
    },
    {
      id: 4,
      author: {
        name: "Sarah Chen",
        username: "@sarahchen",
        avatar: "",
        role: "Digital Artist"
      },
      content: "Color study for an upcoming brand identity project. Exploring warm vs cool palettes.",
      media: ["/placeholder.svg"],
      mediaType: "image",
      likes: 92,
      comments: 8,
      shares: 5,
      timestamp: "5d",
      topComments: [
        { id: 6, author: "Emma Stone", content: "Beautiful color harmony!", likes: 4 }
      ]
    },
    {
      id: 5,
      author: {
        name: "Sarah Chen",
        username: "@sarahchen",
        avatar: "",
        role: "Digital Artist"
      },
      content: "Behind the scenes of my creative process. From sketch to final design! 🎨",
      media: ["/placeholder.svg"],
      mediaType: "image",
      likes: 78,
      comments: 15,
      shares: 9,
      timestamp: "1w",
      topComments: [
        { id: 7, author: "Mike Chen", content: "Love seeing the process!", likes: 7 }
      ]
    },
    {
      id: 6,
      author: {
        name: "Sarah Chen",
        username: "@sarahchen",
        avatar: "",
        role: "Digital Artist"
      },
      content: "Quick logo animation for a tech startup. What do you think? 💫",
      media: ["/placeholder.svg"],
      mediaType: "video",
      likes: 203,
      comments: 31,
      shares: 22,
      timestamp: "1w",
      topComments: [
        { id: 8, author: "Anna Davis", content: "So clean! Love the animation timing", likes: 15 }
      ]
    }
  ];

  const portfolioPieces = [
    {
      id: 1,
      title: "Sustainable Fashion App",
      category: "UI/UX Design",
      image: "/placeholder.svg",
      likes: 145,
      description: "Complete mobile app design for sustainable fashion marketplace"
    },
    {
      id: 2,
      title: "Urban Landscapes Series",
      category: "Digital Art",
      image: "/placeholder.svg",
      likes: 203,
      description: "Digital illustration series exploring city moods"
    },
    {
      id: 3,
      title: "Brand Identity - Tech Startup",
      category: "Branding",
      image: "/placeholder.svg",
      likes: 178,
      description: "Complete brand identity including logo, colors, and guidelines"
    }
  ];

  const toggleComments = (postId: number) => {
    const newExpanded = new Set(expandedComments);
    if (newExpanded.has(postId)) {
      newExpanded.delete(postId);
    } else {
      newExpanded.add(postId);
    }
    setExpandedComments(newExpanded);
  };

  const toggleLike = (postId: number) => {
    const newLiked = new Set(likedPosts);
    if (newLiked.has(postId)) {
      newLiked.delete(postId);
    } else {
      newLiked.add(postId);
    }
    setLikedPosts(newLiked);
  };

  const toggleBookmark = (postId: number) => {
    const newBookmarked = new Set(bookmarkedPosts);
    if (newBookmarked.has(postId)) {
      newBookmarked.delete(postId);
    } else {
      newBookmarked.add(postId);
    }
    setBookmarkedPosts(newBookmarked);
  };

  const openPostDetail = (post: any) => {
    setScrollPosition(window.scrollY);
    setSelectedPost(post);
  };

  const closePostDetail = () => {
    setSelectedPost(null);
    setTimeout(() => {
      window.scrollTo(0, scrollPosition);
    }, 100);
  };

  useEffect(() => {
    if (selectedPost) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedPost]);

  return (
    <div className="min-h-screen bg-background">
      {/* Cover Image */}
      <div className="relative h-64 md:h-80 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <Button 
          variant="secondary" 
          size="sm" 
          className="absolute top-4 right-4 bg-background/80 backdrop-blur hover:bg-background"
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit Cover
        </Button>
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-16 relative z-10">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
              <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-4xl font-bold">
                SC
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Profile Info */}
          <div className="flex-1 pt-0 md:pt-16">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground mb-1 cursor-pointer hover:text-primary transition-colors">
                  {userProfile.name}
                </h1>
                <p className="text-lg text-muted-foreground mb-2">{userProfile.role}</p>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {showFullBio ? userProfile.bio : `${userProfile.bio.substring(0, 100)}...`}
                  <button 
                    onClick={() => setShowFullBio(!showFullBio)}
                    className="text-primary hover:underline ml-1"
                  >
                    {showFullBio ? 'see less' : 'see more'}
                  </button>
                </p>

                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {userProfile.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Globe className="h-4 w-4" />
                    <a 
                      href={`https://${userProfile.website}`} 
                      className="text-primary hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {userProfile.website}
                    </a>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {userProfile.joinDate}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  variant={userProfile.isFollowing ? "outline" : "default"}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  {userProfile.isFollowing ? "Following" : "Follow"}
                </Button>
                <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
                <Button variant="outline" size="icon">
                  <Share className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="flex gap-8 mb-8 pb-6 border-b border-border">
          <button className="text-center hover:text-primary transition-colors">
            <div className="text-2xl font-bold text-foreground">{userProfile.posts}</div>
            <div className="text-sm text-muted-foreground">Posts</div>
          </button>
          <button className="text-center hover:text-primary transition-colors">
            <div className="text-2xl font-bold text-foreground">{userProfile.followers.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Followers</div>
          </button>
          <button className="text-center hover:text-primary transition-colors">
            <div className="text-2xl font-bold text-foreground">{userProfile.following.toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">Following</div>
          </button>
        </div>

        {/* Skills Tags */}
        <div className="flex flex-wrap gap-2 mb-8">
          {skillTags.map((tag) => (
            <Badge 
              key={tag} 
              variant="secondary" 
              className="text-xs bg-primary/10 text-primary border-primary/20 hover:bg-primary/20 cursor-pointer transition-colors"
            >
              {tag}
            </Badge>
          ))}
        </div>

        {/* Content Tabs */}
        <div className="mb-6">
          <div className="flex border-b border-border">
            {["posts", "portfolio", "about"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors capitalize ${
                  activeTab === tab
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Posts Tab - Grid Layout */}
        {activeTab === "posts" && (
          <div className="pb-20">
            <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-1 md:gap-4">
              {mockPosts.map((post) => (
                <div
                  key={post.id}
                  className="aspect-square bg-gradient-to-br from-primary/10 to-primary/5 cursor-pointer group relative overflow-hidden"
                  onClick={() => openPostDetail(post)}
                >
                  {/* Media Preview */}
                  <div className="w-full h-full flex items-center justify-center">
                    {post.mediaType === "video" && (
                      <Play className="h-6 w-6 text-white absolute z-10" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    <span className="text-muted-foreground text-xs opacity-50">Preview</span>
                  </div>
                  
                  {/* Hover overlay with stats */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <div className="flex items-center gap-4 text-white text-sm">
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4 fill-current" />
                        {post.likes}
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-4 w-4 fill-current" />
                        {post.comments}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Detailed Post Modal */}
            {selectedPost && (
              <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                <div className="bg-background max-w-4xl w-full max-h-[90vh] overflow-y-auto rounded-lg relative">
                  {/* Close Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 z-10 bg-background/80 backdrop-blur hover:bg-background"
                    onClick={closePostDetail}
                  >
                    <X className="h-4 w-4" />
                  </Button>

                  {/* Post Header */}
                  <div className="p-6 border-b border-border">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={selectedPost.author.avatar} alt={selectedPost.author.name} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {selectedPost.author.name.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-foreground hover:text-primary cursor-pointer">
                            {selectedPost.author.name}
                          </p>
                          <p className="text-sm text-muted-foreground">{selectedPost.author.role} • {selectedPost.timestamp}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="default" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Follow
                        </Button>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Post Media */}
                  <div className="relative">
                    <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      {selectedPost.mediaType === "video" ? (
                        <div className="flex flex-col items-center gap-2">
                          <Play className="h-12 w-12 text-primary" />
                          <span className="text-muted-foreground">Video Content</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Image Content</span>
                      )}
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="px-6 py-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-6">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className={`text-muted-foreground hover:text-red-500 transition-colors ${likedPosts.has(selectedPost.id) ? 'text-red-500' : ''}`}
                          onClick={() => toggleLike(selectedPost.id)}
                        >
                          <Heart className={`h-6 w-6 mr-2 transition-all ${likedPosts.has(selectedPost.id) ? 'fill-current scale-110' : ''}`} />
                          {selectedPost.likes + (likedPosts.has(selectedPost.id) ? 1 : 0)}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-muted-foreground hover:text-primary transition-colors"
                          onClick={() => toggleComments(selectedPost.id)}
                        >
                          <MessageCircle className="h-6 w-6 mr-2" />
                          {selectedPost.comments}
                        </Button>
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary transition-colors">
                          <Share2 className="h-6 w-6 mr-2" />
                          {selectedPost.shares}
                        </Button>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`text-muted-foreground hover:text-primary transition-colors ${bookmarkedPosts.has(selectedPost.id) ? 'text-primary' : ''}`}
                        onClick={() => toggleBookmark(selectedPost.id)}
                      >
                        <Bookmark className={`h-6 w-6 transition-all ${bookmarkedPosts.has(selectedPost.id) ? 'fill-current scale-110' : ''}`} />
                      </Button>
                    </div>

                    {/* Like Summary */}
                    <div className="text-sm text-muted-foreground mb-4">
                      Liked by <span className="font-semibold text-foreground cursor-pointer hover:text-primary">alex_kim</span> and{' '}
                      <span className="font-semibold text-foreground">{selectedPost.likes + (likedPosts.has(selectedPost.id) ? 1 : 0) - 1} others</span>
                    </div>

                    {/* Post Caption */}
                    <div className="mb-4">
                      <p className="text-sm leading-relaxed text-foreground">
                        <span className="font-semibold cursor-pointer hover:text-primary mr-2">{selectedPost.author.name}</span>
                        {selectedPost.content.split(' ').map((word: string, i: number) => (
                          <span key={i}>
                            {word.startsWith('#') ? (
                              <span className="text-primary hover:underline cursor-pointer transition-colors">{word}</span>
                            ) : word.startsWith('@') ? (
                              <span className="text-primary hover:underline cursor-pointer transition-colors">{word}</span>
                            ) : (
                              word
                            )}
                            {i < selectedPost.content.split(' ').length - 1 ? ' ' : ''}
                          </span>
                        ))}
                      </p>
                    </div>

                    {/* Comments Section */}
                    <div className="space-y-4 mb-6">
                      {selectedPost.topComments.map((comment: any) => (
                        <div key={comment.id} className="flex items-start gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {comment.author.split(' ').map((n: string) => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <p className="text-sm">
                              <span className="font-semibold cursor-pointer hover:text-primary mr-2">{comment.author}</span>
                              <span className="text-foreground">{comment.content}</span>
                            </p>
                            <div className="flex items-center gap-4 mt-1">
                              <span className="text-xs text-muted-foreground">2h</span>
                              <button className="text-xs text-muted-foreground hover:text-primary transition-colors">
                                {comment.likes} likes
                              </button>
                              <button className="text-xs text-muted-foreground hover:text-primary transition-colors">
                                Reply
                              </button>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-500 p-1">
                            <Heart className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      
                      {selectedPost.comments > selectedPost.topComments.length && (
                        <button className="text-sm text-primary hover:underline transition-colors">
                          View all {selectedPost.comments} comments
                        </button>
                      )}
                    </div>

                    {/* Add Comment */}
                    <div className="border-t border-border pt-4">
                      <div className="flex gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">SC</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <input
                            type="text"
                            placeholder="Add a comment..."
                            className="w-full bg-transparent border-b border-border pb-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
                          />
                        </div>
                        <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/10">
                          Post
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Portfolio Tab */}
        {activeTab === "portfolio" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
            {portfolioPieces.map((piece) => (
              <div key={piece.id} className="group cursor-pointer">
                <div className="aspect-square bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg overflow-hidden relative mb-4">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <h3 className="font-semibold mb-1">{piece.title}</h3>
                    <p className="text-sm text-white/80">{piece.category}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-white/20"
                  >
                    <Bookmark className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm mb-1 text-foreground">{piece.title}</h3>
                    <p className="text-xs text-muted-foreground">{piece.category}</p>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Heart className="h-3 w-3 mr-1" />
                    {piece.likes}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* About Tab */}
        {activeTab === "about" && (
          <div className="space-y-8 pb-20">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-foreground">About</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {userProfile.bio} I believe in the power of design to solve real-world problems and create positive impact. 
                When I'm not designing, you can find me exploring local art galleries or experimenting with new creative techniques.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-foreground">Skills & Expertise</h4>
              <div className="flex flex-wrap gap-3">
                {skillTags.map((tag) => (
                  <Badge 
                    key={tag} 
                    variant="outline" 
                    className="text-xs border-primary/30 text-primary hover:bg-primary/10 cursor-pointer transition-colors"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold mb-4 text-foreground">Education</h4>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-foreground">Master of Fine Arts</p>
                    <p className="text-sm text-muted-foreground">Art Institute of California, 2021</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Bachelor of Design</p>
                    <p className="text-sm text-muted-foreground">UC Berkeley, 2019</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-4 text-foreground">Experience</h4>
                <div className="space-y-4">
                  <div>
                    <p className="font-medium text-foreground">Senior UI/UX Designer</p>
                    <p className="text-sm text-muted-foreground">Tech Startup Inc., 2022-Present</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Freelance Designer</p>
                    <p className="text-sm text-muted-foreground">Various Clients, 2019-2022</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-foreground">Contact & Links</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a href={`mailto:${userProfile.email}`} className="text-primary hover:underline">
                    {userProfile.email}
                  </a>
                </div>
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a 
                    href={`https://${userProfile.website}`} 
                    className="text-primary hover:underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {userProfile.website}
                    <ExternalLink className="h-3 w-3 inline ml-1" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  ExternalLink
} from "lucide-react";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("posts");
  const [showFullBio, setShowFullBio] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());

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
      likes: 124,
      comments: 18,
      shares: 12,
      bookmarked: false,
      liked: false,
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
      likes: 89,
      comments: 12,
      shares: 7,
      bookmarked: true,
      liked: true,
      timestamp: "1d",
      topComments: [
        { id: 3, author: "David Park", content: "The mood in this series is amazing!", likes: 8 }
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

        {/* Posts Tab */}
        {activeTab === "posts" && (
          <div className="space-y-8 pb-20">
            {mockPosts.map((post) => (
              <article key={post.id} className="bg-background">
                {/* Post Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={post.author.avatar} alt={post.author.name} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {post.author.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-semibold text-sm text-foreground hover:text-primary cursor-pointer">
                        {post.author.name}
                      </p>
                      <p className="text-xs text-muted-foreground">{post.author.role} • {post.timestamp}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-muted-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>

                {/* Post Content */}
                <div className="mb-4">
                  <p className="text-sm leading-relaxed text-foreground mb-4">
                    {post.content.split(' ').map((word, i) => (
                      <span key={i}>
                        {word.startsWith('#') ? (
                          <span className="text-primary hover:underline cursor-pointer">{word}</span>
                        ) : word.startsWith('@') ? (
                          <span className="text-primary hover:underline cursor-pointer">{word}</span>
                        ) : (
                          word
                        )}
                        {i < post.content.split(' ').length - 1 ? ' ' : ''}
                      </span>
                    ))}
                  </p>

                  {/* Media */}
                  {post.media && post.media.length > 0 && (
                    <div className="rounded-lg overflow-hidden bg-muted mb-4">
                      <div className="aspect-square bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                        <span className="text-muted-foreground text-sm">Artwork Preview</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Bar */}
                <div className="flex items-center justify-between mb-4 py-2">
                  <div className="flex items-center gap-6">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className={`text-muted-foreground hover:text-red-500 ${post.liked ? 'text-red-500' : ''}`}
                    >
                      <Heart className={`h-5 w-5 mr-2 ${post.liked ? 'fill-current' : ''}`} />
                      {post.likes}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-muted-foreground hover:text-primary"
                      onClick={() => toggleComments(post.id)}
                    >
                      <MessageCircle className="h-5 w-5 mr-2" />
                      {post.comments}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                      <Share2 className="h-5 w-5 mr-2" />
                      {post.shares}
                    </Button>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`text-muted-foreground hover:text-primary ${post.bookmarked ? 'text-primary' : ''}`}
                  >
                    <Bookmark className={`h-5 w-5 ${post.bookmarked ? 'fill-current' : ''}`} />
                  </Button>
                </div>

                {/* Like Summary */}
                <div className="text-sm text-muted-foreground mb-3">
                  Liked by <span className="font-semibold text-foreground">alex_kim</span> and{' '}
                  <span className="font-semibold text-foreground">{post.likes - 1} others</span>
                </div>

                {/* Comments Preview */}
                <div className="space-y-2 mb-4">
                  {post.topComments.slice(0, 2).map((comment) => (
                    <div key={comment.id} className="text-sm">
                      <span className="font-semibold text-foreground mr-2">{comment.author}</span>
                      <span className="text-foreground">{comment.content}</span>
                    </div>
                  ))}
                  {post.comments > 2 && (
                    <button 
                      onClick={() => toggleComments(post.id)}
                      className="text-sm text-primary hover:underline"
                    >
                      View all {post.comments} comments
                    </button>
                  )}
                </div>

                {/* Expanded Comments */}
                {expandedComments.has(post.id) && (
                  <div className="border-t border-border pt-4 space-y-4">
                    {/* Comment Input */}
                    <div className="flex gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">SC</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Add a comment..."
                          className="w-full bg-transparent border-b border-border pb-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary"
                        />
                      </div>
                    </div>
                  </div>
                )}

                <Separator className="mt-8" />
              </article>
            ))}
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
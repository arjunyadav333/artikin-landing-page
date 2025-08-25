import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
  Grid3X3,
  List
} from "lucide-react";

const Profile = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const userProfile = {
    name: "Your Name",
    username: "@yourusername",
    bio: "Digital artist & UI/UX designer passionate about creating meaningful experiences through art and technology.",
    location: "San Francisco, CA",
    website: "yourportfolio.com",
    email: "hello@yourportfolio.com",
    joinDate: "March 2023",
    followers: 1234,
    following: 567,
    posts: 89,
    avatar: "",
    cover: ""
  };

  const skillTags = ["Digital Art", "UI/UX Design", "Illustration", "Branding", "Motion Graphics", "Adobe Creative Suite"];

  const mockPosts = [
    {
      id: 1,
      content: "Just finished this UI design for a sustainable fashion app. Really excited about the clean aesthetic and eco-friendly color palette!",
      image: "/placeholder.svg",
      likes: 24,
      comments: 8,
      shares: 3,
      time: "2h"
    },
    {
      id: 2,
      content: "Working on a series of illustrations inspired by urban landscapes. Each piece captures a different mood of city life.",
      image: "/placeholder.svg",
      likes: 31,
      comments: 12,
      shares: 5,
      time: "1d"
    },
    {
      id: 3,
      content: "Behind the scenes of my creative process. Sometimes the best ideas come from the most unexpected places.",
      likes: 18,
      comments: 6,
      shares: 2,
      time: "3d"
    }
  ];

  const portfolioPieces = [
    {
      id: 1,
      title: "Sustainable Fashion App",
      category: "UI/UX Design",
      image: "/placeholder.svg",
      likes: 45
    },
    {
      id: 2,
      title: "Urban Landscapes Series",
      category: "Digital Art",
      image: "/placeholder.svg",
      likes: 62
    },
    {
      id: 3,
      title: "Brand Identity - Tech Startup",
      category: "Branding",
      image: "/placeholder.svg",
      likes: 38
    },
    {
      id: 4,
      title: "Motion Graphics Reel",
      category: "Motion Graphics",
      image: "/placeholder.svg",
      likes: 71
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="container max-w-4xl mx-auto px-4 py-6">
        {/* Cover & Profile Header */}
        <Card className="mb-6 overflow-hidden">
          <div className="h-48 bg-gradient-to-r from-primary/20 via-creative/20 to-accent/20 relative">
            <Button variant="secondary" size="sm" className="absolute top-4 right-4">
              <Edit className="h-4 w-4 mr-2" />
              Edit Cover
            </Button>
          </div>
          
          <CardContent className="relative -mt-16 pb-6">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-6">
              <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-6">
                <Avatar className="h-32 w-32 border-4 border-background">
                  <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
                  <AvatarFallback className="bg-primary text-primary-foreground text-3xl">U</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <h1 className="text-2xl font-bold mb-1">{userProfile.name}</h1>
                  <p className="text-muted-foreground mb-2">{userProfile.username}</p>
                  <p className="text-sm leading-relaxed mb-4">{userProfile.bio}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-2" />
                      {userProfile.location}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      Joined {userProfile.joinDate}
                    </div>
                    <div className="flex items-center">
                      <Globe className="h-4 w-4 mr-2" />
                      <a href={`https://${userProfile.website}`} className="text-primary hover:underline">
                        {userProfile.website}
                      </a>
                    </div>
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      {userProfile.email}
                    </div>
                  </div>

                  <div className="flex space-x-6 text-sm">
                    <span><strong>{userProfile.posts}</strong> posts</span>
                    <span><strong>{userProfile.followers.toLocaleString()}</strong> followers</span>
                    <span><strong>{userProfile.following.toLocaleString()}</strong> following</span>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2 mt-4 md:mt-0">
                <Button variant="outline" size="sm">
                  <Share className="h-4 w-4 mr-2" />
                  Share
                </Button>
                <Button size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {skillTags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <div className="flex items-center justify-between mb-6">
            <TabsList>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>

            <div className="flex space-x-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <TabsContent value="posts">
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-6"}>
              {mockPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
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
                      <span className="text-xs text-muted-foreground">{post.time}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="portfolio">
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-6"}>
              {portfolioPieces.map((piece) => (
                <Card key={piece.id} className="group hover:shadow-lg transition-shadow overflow-hidden">
                  <div className="aspect-square bg-gradient-to-br from-primary/10 to-creative/10 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                      <h3 className="font-semibold mb-1">{piece.title}</h3>
                      <p className="text-sm text-white/80">{piece.category}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Bookmark className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-sm mb-1">{piece.title}</h3>
                        <p className="text-xs text-muted-foreground">{piece.category}</p>
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Heart className="h-3 w-3 mr-1" />
                        {piece.likes}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="about">
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold">About Me</h3>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Bio</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {userProfile.bio} I believe in the power of design to solve real-world problems and create positive impact. 
                    When I'm not designing, you can find me exploring local art galleries or experimenting with new creative techniques.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Skills & Expertise</h4>
                  <div className="flex flex-wrap gap-2">
                    {skillTags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Education</h4>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="font-medium">Master of Fine Arts</p>
                        <p className="text-muted-foreground">Art Institute of California, 2021</p>
                      </div>
                      <div>
                        <p className="font-medium">Bachelor of Design</p>
                        <p className="text-muted-foreground">UC Berkeley, 2019</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Experience</h4>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="font-medium">Senior UI/UX Designer</p>
                        <p className="text-muted-foreground">Tech Startup Inc., 2022-Present</p>
                      </div>
                      <div>
                        <p className="font-medium">Freelance Designer</p>
                        <p className="text-muted-foreground">Various Clients, 2019-2022</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
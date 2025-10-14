'use client'

import { useState } from 'react'
import { useAuth } from '@/components/providers/auth-provider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { MapPin, Link as LinkIcon, Calendar, Edit3, Plus, Heart, MessageCircle, Share2 } from 'lucide-react'

export default function ProfilePage() {
  const { user } = useAuth()
  const [isEditing, setIsEditing] = useState(false)

  const mockProfile = {
    displayName: "Alex Rivera",
    username: "@alexrivera",
    bio: "Digital Artist & UI/UX Designer passionate about creating meaningful experiences",
    location: "San Francisco, CA",
    website: "alexrivera.design",
    followers: 2847,
    following: 892,
    posts: 156,
    joinDate: "March 2022"
  }

  const mockPosts = [
    {
      id: 1,
      content: "Just finished a new UI design for a sustainability app! 🌱",
      image: "/placeholder.svg",
      likes: 42,
      comments: 8,
      shares: 3,
      timestamp: "2 hours ago"
    },
    {
      id: 2,
      content: "Working on some new illustration concepts. Love exploring different art styles!",
      likes: 38,
      comments: 12,
      shares: 5,
      timestamp: "1 day ago"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Cover Photo */}
      <div className="h-48 bg-gradient-blue relative">
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="max-w-4xl mx-auto px-4 -mt-24 relative z-10">
        {/* Profile Header */}
        <Card className="card-blue shadow-blue-glow mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar */}
              <div className="flex-shrink-0">
                <Avatar className="h-32 w-32 border-4 border-background shadow-blue">
                  <AvatarImage src="/placeholder.svg" alt={mockProfile.displayName} />
                  <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                    {mockProfile.displayName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Profile Info */}
              <div className="flex-1 space-y-4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">{mockProfile.displayName}</h1>
                    <p className="text-muted-foreground">{mockProfile.username}</p>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant={isEditing ? "secondary" : "default"}
                      onClick={() => setIsEditing(!isEditing)}
                      className="shadow-blue hover:shadow-blue-lg"
                    >
                      <Edit3 className="h-4 w-4 mr-2" />
                      {isEditing ? 'Cancel' : 'Edit Profile'}
                    </Button>
                  </div>
                </div>

                <p className="text-foreground">{mockProfile.bio}</p>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {mockProfile.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <LinkIcon className="h-4 w-4" />
                    <a href="#" className="text-primary hover:text-primary/80">
                      {mockProfile.website}
                    </a>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {mockProfile.joinDate}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-6">
                  <div className="text-center">
                    <div className="text-xl font-bold text-foreground">{mockProfile.posts}</div>
                    <div className="text-sm text-muted-foreground">Posts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-foreground">{mockProfile.followers}</div>
                    <div className="text-sm text-muted-foreground">Followers</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold text-foreground">{mockProfile.following}</div>
                    <div className="text-sm text-muted-foreground">Following</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Edit Form */}
            {isEditing && (
              <div className="mt-6 pt-6 border-t border-border space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input id="displayName" defaultValue={mockProfile.displayName} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input id="username" defaultValue={mockProfile.username} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input id="bio" defaultValue={mockProfile.bio} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input id="location" defaultValue={mockProfile.location} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input id="website" defaultValue={mockProfile.website} />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="shadow-blue hover:shadow-blue-lg">
                    Save Changes
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          <TabsContent value="posts" className="space-y-6">
            {mockPosts.map((post) => (
              <Card key={post.id} className="card-blue shadow-blue hover:shadow-blue-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/placeholder.svg" alt={mockProfile.displayName} />
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {mockProfile.displayName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">{mockProfile.displayName}</span>
                        <span className="text-muted-foreground">•</span>
                        <span className="text-sm text-muted-foreground">{post.timestamp}</span>
                      </div>
                      
                      <p className="text-foreground">{post.content}</p>
                      
                      {post.image && (
                        <div className="rounded-lg overflow-hidden">
                          <img 
                            src={post.image} 
                            alt="Post content" 
                            className="w-full h-64 object-cover"
                          />
                        </div>
                      )}
                      
                      <div className="flex items-center gap-6 pt-2">
                        <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                          <Heart className="h-4 w-4" />
                          <span className="text-sm">{post.likes}</span>
                        </button>
                        <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                          <MessageCircle className="h-4 w-4" />
                          <span className="text-sm">{post.comments}</span>
                        </button>
                        <button className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                          <Share2 className="h-4 w-4" />
                          <span className="text-sm">{post.shares}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            <Card className="card-blue shadow-blue-glow">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Portfolio
                  <Button size="sm" className="shadow-blue hover:shadow-blue-lg">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Project
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="group cursor-pointer">
                      <div className="aspect-square bg-muted rounded-lg overflow-hidden">
                        <img 
                          src="/placeholder.svg" 
                          alt={`Portfolio item ${item}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <h3 className="mt-2 font-medium text-foreground">Project {item}</h3>
                      <p className="text-sm text-muted-foreground">UI/UX Design</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about" className="space-y-6">
            <Card className="card-blue shadow-blue-glow">
              <CardHeader>
                <CardTitle>About</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground">
                  Passionate digital artist and UI/UX designer with over 5 years of experience creating 
                  meaningful digital experiences. I specialize in user-centered design and have worked 
                  with startups and established companies to bring their visions to life.
                </p>
                
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {['UI Design', 'UX Research', 'Prototyping', 'Illustration', 'Branding'].map((skill) => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-semibold text-foreground mb-2">Experience</h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium text-foreground">Senior UX Designer</h4>
                      <p className="text-sm text-muted-foreground">Tech Innovations Inc. • 2021 - Present</p>
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground">UI Designer</h4>
                      <p className="text-sm text-muted-foreground">Creative Studio • 2019 - 2021</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
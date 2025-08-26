import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, UserCheck, MessageCircle, MoreHorizontal } from "lucide-react";

const Connections = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const mockConnections = [
    {
      id: 1,
      name: "Sarah Chen",
      username: "@sarahartist",
      avatar: "",
      bio: "Watercolor artist & art therapist",
      location: "San Francisco, CA",
      followers: 1234,
      following: 567,
      tags: ["Watercolor", "Art Therapy", "Teaching"],
      isFollowing: true,
      mutualConnections: 8
    },
    {
      id: 2,
      name: "Marcus Rodriguez",
      username: "@marcusmusic",
      avatar: "",
      bio: "Electronic music producer & sound designer",
      location: "Austin, TX",
      followers: 2341,
      following: 432,
      tags: ["Electronic", "Sound Design", "Ableton"],
      isFollowing: true,
      mutualConnections: 12
    },
    {
      id: 3,
      name: "Elena Kowalski",
      username: "@elenadesign",
      avatar: "",
      bio: "Brand designer focusing on sustainable companies",
      location: "Portland, OR",
      followers: 987,
      following: 654,
      tags: ["Branding", "Sustainability", "UI/UX"],
      isFollowing: false,
      mutualConnections: 5
    }
  ];

  const mockSuggestions = [
    {
      id: 4,
      name: "David Park",
      username: "@davidphoto",
      avatar: "",
      bio: "Documentary photographer",
      location: "New York, NY",
      followers: 3456,
      tags: ["Photography", "Documentary", "Street Art"],
      mutualConnections: 15
    },
    {
      id: 5,
      name: "Maria Santos",
      username: "@mariasculpture",
      avatar: "",
      bio: "Contemporary sculptor & installation artist",
      location: "Los Angeles, CA",
      followers: 1876,
      tags: ["Sculpture", "Installation", "Contemporary"],
      mutualConnections: 3
    }
  ];

  const mockRequests = [
    {
      id: 6,
      name: "Alex Thompson",
      username: "@alexillustrator",
      avatar: "",
      bio: "Children's book illustrator",
      location: "Seattle, WA",
      followers: 892,
      tags: ["Illustration", "Children's Books", "Digital Art"],
      mutualConnections: 7
    }
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="container max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Connections</h1>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for artists, designers, musicians..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs defaultValue="following" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="following">Following ({mockConnections.filter(c => c.isFollowing).length})</TabsTrigger>
            <TabsTrigger value="followers">Followers (834)</TabsTrigger>
            <TabsTrigger value="suggestions">Discover</TabsTrigger>
            <TabsTrigger value="requests">Requests ({mockRequests.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="following" className="mt-6">
            <div className="grid gap-4">
              {mockConnections.filter(connection => connection.isFollowing).map((connection) => (
                <Card key={connection.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={connection.avatar} alt={connection.name} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                            {connection.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-lg">{connection.name}</h3>
                            <span className="text-muted-foreground">{connection.username}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{connection.bio}</p>
                          <p className="text-sm text-muted-foreground mb-3">{connection.location}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                            <span>{connection.followers.toLocaleString()} followers</span>
                            <span>{connection.following.toLocaleString()} following</span>
                            <span>{connection.mutualConnections} mutual</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {connection.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Message
                        </Button>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="followers" className="mt-6">
            <div className="grid gap-4">
              {mockConnections.map((connection) => (
                <Card key={connection.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={connection.avatar} alt={connection.name} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                            {connection.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-lg">{connection.name}</h3>
                            <span className="text-muted-foreground">{connection.username}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{connection.bio}</p>
                          <p className="text-sm text-muted-foreground mb-3">{connection.location}</p>
                          <div className="flex flex-wrap gap-2">
                            {connection.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant={connection.isFollowing ? "secondary" : "default"} 
                          size="sm"
                          className={connection.isFollowing ? "" : "bg-connection hover:bg-connection/90"}
                        >
                          {connection.isFollowing ? (
                            <>
                              <UserCheck className="h-4 w-4 mr-2" />
                              Following
                            </>
                          ) : (
                            <>
                              <UserPlus className="h-4 w-4 mr-2" />
                              Follow Back
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="suggestions" className="mt-6">
            <div className="grid gap-4">
              {mockSuggestions.map((suggestion) => (
                <Card key={suggestion.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={suggestion.avatar} alt={suggestion.name} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                            {suggestion.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-lg">{suggestion.name}</h3>
                            <span className="text-muted-foreground">{suggestion.username}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{suggestion.bio}</p>
                          <p className="text-sm text-muted-foreground mb-3">{suggestion.location}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                            <span>{suggestion.followers.toLocaleString()} followers</span>
                            <span>{suggestion.mutualConnections} mutual connections</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {suggestion.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button className="bg-connection hover:bg-connection/90" size="sm">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Follow
                        </Button>
                        <Button variant="outline" size="sm">
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="requests" className="mt-6">
            <div className="grid gap-4">
              {mockRequests.map((request) => (
                <Card key={request.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={request.avatar} alt={request.name} />
                          <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                            {request.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold text-lg">{request.name}</h3>
                            <span className="text-muted-foreground">{request.username}</span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{request.bio}</p>
                          <p className="text-sm text-muted-foreground mb-3">{request.location}</p>
                          <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-3">
                            <span>{request.followers.toLocaleString()} followers</span>
                            <span>{request.mutualConnections} mutual connections</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {request.tags.map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button className="bg-connection hover:bg-connection/90" size="sm">
                          Accept
                        </Button>
                        <Button variant="outline" size="sm">
                          Decline
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Connections;
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, UserPlus, MessageCircle, UserCheck, Users, Plus } from 'lucide-react'

export default function ConnectionsPage() {
  const [searchQuery, setSearchQuery] = useState('')

  const mockConnections = [
    {
      id: 1,
      name: "Sarah Johnson",
      username: "@sarahjohnson",
      avatar: "/placeholder.svg",
      role: "Senior UX Designer",
      company: "Tech Innovations Inc.",
      mutualConnections: 12,
      isConnected: true,
      location: "San Francisco, CA"
    },
    {
      id: 2,
      name: "Mike Chen",
      username: "@mikechen",
      avatar: "/placeholder.svg",
      role: "Frontend Developer",
      company: "Creative Studio",
      mutualConnections: 8,
      isConnected: true,
      location: "Remote"
    },
    {
      id: 3,
      name: "Lisa Garcia",
      username: "@lisagarcia",
      avatar: "/placeholder.svg",
      role: "Creative Director",
      company: "Brand Agency",
      mutualConnections: 15,
      isConnected: true,
      location: "New York, NY"
    }
  ]

  const mockSuggestions = [
    {
      id: 4,
      name: "Alex Rivera",
      username: "@alexrivera",
      avatar: "/placeholder.svg",
      role: "Graphic Designer",
      company: "Design Co.",
      mutualConnections: 5,
      isConnected: false,
      location: "Los Angeles, CA"
    },
    {
      id: 5,
      name: "Emma Thompson",
      username: "@emmathompson",
      avatar: "/placeholder.svg",
      role: "Product Manager",
      company: "Startup Inc.",
      mutualConnections: 3,
      isConnected: false,
      location: "Seattle, WA"
    },
    {
      id: 6,
      name: "David Park",
      username: "@davidpark",
      avatar: "/placeholder.svg",
      role: "UI Designer",
      company: "Tech Corp",
      mutualConnections: 7,
      isConnected: false,
      location: "Austin, TX"
    }
  ]

  const mockRequests = [
    {
      id: 7,
      name: "Jessica Wong",
      username: "@jessicawong",
      avatar: "/placeholder.svg",
      role: "Art Director",
      company: "Creative Agency",
      mutualConnections: 2,
      requestDate: "2 days ago",
      location: "Chicago, IL"
    },
    {
      id: 8,
      name: "Tom Rodriguez",
      username: "@tomrodriguez",
      avatar: "/placeholder.svg",
      role: "Motion Designer",
      company: "Animation Studio",
      mutualConnections: 4,
      requestDate: "1 week ago",
      location: "Miami, FL"
    }
  ]

  const handleConnect = (id: number) => {
    console.log('Connect with user:', id)
  }

  const handleMessage = (id: number) => {
    console.log('Message user:', id)
  }

  const handleAcceptRequest = (id: number) => {
    console.log('Accept request from:', id)
  }

  const handleDeclineRequest = (id: number) => {
    console.log('Decline request from:', id)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Connections</h1>
            <p className="text-muted-foreground">Build your professional network</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {mockConnections.length} connections
            </Badge>
          </div>
        </div>

        {/* Search */}
        <Card className="card-blue shadow-blue mb-6">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search connections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background border-muted focus:border-primary"
              />
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="connections" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="connections">My Connections</TabsTrigger>
            <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
            <TabsTrigger value="requests">
              Requests
              {mockRequests.length > 0 && (
                <Badge className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {mockRequests.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="connections" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockConnections.map((connection) => (
                <Card key={connection.id} className="card-blue shadow-blue hover:shadow-blue-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <Avatar className="h-20 w-20 mx-auto mb-4">
                        <AvatarImage src={connection.avatar} alt={connection.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                          {connection.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <h3 className="text-lg font-semibold text-foreground mb-1">{connection.name}</h3>
                      <p className="text-sm text-muted-foreground mb-1">{connection.username}</p>
                      <p className="text-sm font-medium text-primary mb-1">{connection.role}</p>
                      <p className="text-sm text-muted-foreground mb-2">{connection.company}</p>
                      <p className="text-xs text-muted-foreground mb-4">{connection.location}</p>
                      
                      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-4">
                        <Users className="h-3 w-3" />
                        {connection.mutualConnections} mutual connections
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleMessage(connection.id)}
                          className="flex-1 shadow-blue hover:shadow-blue-lg"
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="flex-1"
                        >
                          <UserCheck className="h-4 w-4 mr-1" />
                          Connected
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="suggestions" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockSuggestions.map((suggestion) => (
                <Card key={suggestion.id} className="card-blue shadow-blue hover:shadow-blue-lg transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="text-center">
                      <Avatar className="h-20 w-20 mx-auto mb-4">
                        <AvatarImage src={suggestion.avatar} alt={suggestion.name} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                          {suggestion.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      
                      <h3 className="text-lg font-semibold text-foreground mb-1">{suggestion.name}</h3>
                      <p className="text-sm text-muted-foreground mb-1">{suggestion.username}</p>
                      <p className="text-sm font-medium text-primary mb-1">{suggestion.role}</p>
                      <p className="text-sm text-muted-foreground mb-2">{suggestion.company}</p>
                      <p className="text-xs text-muted-foreground mb-4">{suggestion.location}</p>
                      
                      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-4">
                        <Users className="h-3 w-3" />
                        {suggestion.mutualConnections} mutual connections
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleConnect(suggestion.id)}
                          className="flex-1 shadow-blue hover:shadow-blue-lg"
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Connect
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleMessage(suggestion.id)}
                          className="flex-1"
                        >
                          <MessageCircle className="h-4 w-4 mr-1" />
                          Message
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            {mockRequests.length > 0 ? (
              <div className="space-y-4">
                {mockRequests.map((request) => (
                  <Card key={request.id} className="card-blue shadow-blue">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16">
                          <AvatarImage src={request.avatar} alt={request.name} />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            {request.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-foreground">{request.name}</h3>
                          <p className="text-sm text-muted-foreground">{request.username}</p>
                          <p className="text-sm font-medium text-primary">{request.role}</p>
                          <p className="text-sm text-muted-foreground">{request.company} • {request.location}</p>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Users className="h-3 w-3" />
                            {request.mutualConnections} mutual connections
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">Sent {request.requestDate}</p>
                        </div>

                        <div className="flex gap-2">
                          <Button 
                            size="sm"
                            onClick={() => handleAcceptRequest(request.id)}
                            className="shadow-blue hover:shadow-blue-lg"
                          >
                            Accept
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeclineRequest(request.id)}
                          >
                            Decline
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="card-blue shadow-blue">
                <CardContent className="p-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2">No pending requests</h3>
                  <p className="text-muted-foreground">You don't have any connection requests at the moment.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
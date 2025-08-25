'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Search, MapPin, DollarSign, Clock, Bookmark, Plus, Filter } from 'lucide-react'

export default function OpportunitiesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilters, setSelectedFilters] = useState<string[]>([])

  const mockOpportunities = [
    {
      id: 1,
      title: "Senior UI/UX Designer",
      company: "Tech Innovations Inc.",
      location: "San Francisco, CA",
      type: "Full-time",
      salary: "$120k - $150k",
      description: "We're looking for a creative and experienced UI/UX Designer to join our growing team...",
      tags: ["UI Design", "UX Research", "Figma", "Prototyping"],
      postedBy: {
        name: "Sarah Wilson",
        avatar: "/placeholder.svg",
        role: "HR Manager"
      },
      applicants: 23,
      posted: "2 days ago",
      bookmarked: false
    },
    {
      id: 2,
      title: "Frontend Developer",
      company: "Creative Studio",
      location: "Remote",
      type: "Contract",
      salary: "$80k - $100k",
      description: "Join our dynamic team as a Frontend Developer and help us build amazing digital experiences...",
      tags: ["React", "TypeScript", "Tailwind CSS", "Next.js"],
      postedBy: {
        name: "Mike Chen",
        avatar: "/placeholder.svg",
        role: "Tech Lead"
      },
      applicants: 45,
      posted: "1 week ago",
      bookmarked: true
    },
    {
      id: 3,
      title: "Graphic Designer",
      company: "Brand Agency",
      location: "New York, NY",
      type: "Part-time",
      salary: "$50k - $70k",
      description: "We're seeking a talented Graphic Designer to create compelling visual content...",
      tags: ["Graphic Design", "Adobe Creative Suite", "Branding", "Print Design"],
      postedBy: {
        name: "Lisa Garcia",
        avatar: "/placeholder.svg",
        role: "Creative Director"
      },
      applicants: 18,
      posted: "3 days ago",
      bookmarked: false
    }
  ]

  const mockApplications = [
    {
      id: 1,
      title: "Product Designer",
      company: "Startup Inc.",
      status: "Interview",
      appliedDate: "1 week ago",
      statusColor: "bg-yellow-500"
    },
    {
      id: 2,
      title: "UX Researcher",
      company: "Big Corp",
      status: "Applied",
      appliedDate: "3 days ago",
      statusColor: "bg-blue-500"
    },
    {
      id: 3,
      title: "Visual Designer",
      company: "Design Agency",
      status: "Rejected",
      appliedDate: "2 weeks ago",
      statusColor: "bg-red-500"
    }
  ]

  const handleBookmark = (id: number) => {
    // Handle bookmark toggle
    console.log('Bookmark opportunity:', id)
  }

  const handleApply = (id: number) => {
    // Handle job application
    console.log('Apply to opportunity:', id)
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Opportunities</h1>
            <p className="text-muted-foreground">Discover your next career move</p>
          </div>
          <Button className="shadow-blue hover:shadow-blue-lg">
            <Plus className="h-4 w-4 mr-2" />
            Post Opportunity
          </Button>
        </div>

        {/* Search and Filters */}
        <Card className="card-blue shadow-blue mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search opportunities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background border-muted focus:border-primary"
                />
              </div>
              <Button variant="outline" className="flex-shrink-0">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>

            {/* Filter Tags */}
            <div className="flex flex-wrap gap-2 mt-4">
              {['Remote', 'Full-time', 'Design', 'Engineering', '$100k+'].map((filter) => (
                <Badge
                  key={filter}
                  variant={selectedFilters.includes(filter) ? "default" : "secondary"}
                  className="cursor-pointer hover:opacity-80"
                  onClick={() => {
                    setSelectedFilters(prev =>
                      prev.includes(filter)
                        ? prev.filter(f => f !== filter)
                        : [...prev, filter]
                    )
                  }}
                >
                  {filter}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="browse">Browse Opportunities</TabsTrigger>
            <TabsTrigger value="applications">My Applications</TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-6">
            {mockOpportunities.map((opportunity) => (
              <Card key={opportunity.id} className="card-blue shadow-blue hover:shadow-blue-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-semibold text-foreground">{opportunity.title}</h3>
                        <Badge variant="secondary">{opportunity.type}</Badge>
                      </div>
                      <p className="text-lg text-primary font-medium mb-2">{opportunity.company}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-3">
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {opportunity.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {opportunity.salary}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {opportunity.posted}
                        </div>
                      </div>

                      <p className="text-foreground mb-4">{opportunity.description}</p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {opportunity.tags.map((tag) => (
                          <Badge key={tag} variant="outline">{tag}</Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={opportunity.postedBy.avatar} alt={opportunity.postedBy.name} />
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {opportunity.postedBy.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium text-foreground">{opportunity.postedBy.name}</p>
                            <p className="text-xs text-muted-foreground">{opportunity.postedBy.role}</p>
                          </div>
                        </div>
                        
                        <div className="text-sm text-muted-foreground">
                          {opportunity.applicants} applicants
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleBookmark(opportunity.id)}
                        className={opportunity.bookmarked ? 'text-primary' : ''}
                      >
                        <Bookmark className={`h-4 w-4 ${opportunity.bookmarked ? 'fill-primary' : ''}`} />
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={() => handleApply(opportunity.id)}
                      className="shadow-blue hover:shadow-blue-lg"
                    >
                      Apply Now
                    </Button>
                    <Button variant="outline">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="applications" className="space-y-6">
            <div className="grid gap-4">
              {mockApplications.map((application) => (
                <Card key={application.id} className="card-blue shadow-blue">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">{application.title}</h3>
                        <p className="text-muted-foreground">{application.company}</p>
                        <p className="text-sm text-muted-foreground mt-1">Applied {application.appliedDate}</p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div className={`h-2 w-2 rounded-full ${application.statusColor}`} />
                          <span className="text-sm font-medium text-foreground">{application.status}</span>
                        </div>
                        <Button variant="outline" size="sm">
                          View
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
  )
}
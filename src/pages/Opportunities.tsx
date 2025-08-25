import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Clock, DollarSign, Users } from "lucide-react";

const Opportunities = () => {
  const mockOpportunities = [
    {
      id: 1,
      title: "Lead Graphic Designer",
      company: "Creative Studio Inc.",
      companyAvatar: "",
      location: "New York, NY",
      type: "Full-time",
      salary: "$70,000 - $90,000",
      posted: "2 days ago",
      applicants: 12,
      tags: ["Design", "Branding", "Adobe Creative Suite"],
      description: "We're looking for a talented graphic designer to join our creative team and work on exciting brand projects for diverse clients."
    },
    {
      id: 2,
      title: "Music Producer - Electronic Album",
      company: "Indie Records",
      companyAvatar: "",
      location: "Los Angeles, CA",
      type: "Contract",
      salary: "$15,000 - $25,000",
      posted: "1 week ago",
      applicants: 8,
      tags: ["Music Production", "Electronic", "Mixing"],
      description: "Seeking an experienced electronic music producer for a 10-track album project. Must have expertise in Ableton Live and sound design."
    },
    {
      id: 3,
      title: "Theatre Set Designer",
      company: "Metropolitan Theatre",
      companyAvatar: "",
      location: "Chicago, IL",
      type: "Project-based",
      salary: "$8,000 - $12,000",
      posted: "3 days ago",
      applicants: 15,
      tags: ["Theatre", "Set Design", "3D Modeling"],
      description: "Design and oversee construction of sets for our upcoming production. Experience with large-scale theatrical productions preferred."
    },
    {
      id: 4,
      title: "Freelance Illustrator",
      company: "Publishing House",
      companyAvatar: "",
      location: "Remote",
      type: "Freelance",
      salary: "$2,000 - $5,000",
      posted: "5 days ago",
      applicants: 23,
      tags: ["Illustration", "Children's Books", "Digital Art"],
      description: "Create illustrations for a children's book series. Looking for a warm, engaging style that appeals to ages 5-10."
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Full-time": return "bg-opportunity text-opportunity-foreground";
      case "Contract": return "bg-primary text-primary-foreground";
      case "Project-based": return "bg-creative text-creative-foreground";
      case "Freelance": return "bg-connection text-connection-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="container max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Opportunities</h1>
          <p className="text-muted-foreground">Find your next creative project or full-time role</p>
        </div>

        <div className="space-y-6">
          {mockOpportunities.map((opportunity) => (
            <Card key={opportunity.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={opportunity.companyAvatar} alt={opportunity.company} />
                      <AvatarFallback className="bg-muted">
                        {opportunity.company.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-lg font-semibold mb-1">{opportunity.title}</h3>
                      <p className="text-muted-foreground font-medium">{opportunity.company}</p>
                    </div>
                  </div>
                  <Badge className={getTypeColor(opportunity.type)}>
                    {opportunity.type}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    {opportunity.location}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <DollarSign className="h-4 w-4 mr-2" />
                    {opportunity.salary}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    {opportunity.posted}
                  </div>
                </div>

                <p className="text-sm mb-4 leading-relaxed">{opportunity.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {opportunity.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Users className="h-4 w-4 mr-1" />
                    {opportunity.applicants} applicants
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      Save
                    </Button>
                    <Button size="sm" className="bg-opportunity hover:bg-opportunity/90">
                      Apply Now
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button variant="outline" className="w-full max-w-sm">
            Load More Opportunities
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Opportunities;
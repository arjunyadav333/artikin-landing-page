import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  Search, 
  MoreHorizontal, 
  Edit3, 
  Trash2, 
  Users, 
  Eye,
  Calendar,
  MapPin,
  DollarSign,
  Filter
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOpportunities } from "@/hooks/useOpportunities";
import { ApplicantManagement } from "./applicant-management";
import { formatDistanceToNow } from "date-fns";

export function OrganizationDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOpportunity, setSelectedOpportunity] = useState<string | null>(null);
  
  const { data: opportunities, isLoading } = useOpportunities();

  // Filter opportunities to show only those created by current organization
  const myOpportunities = opportunities?.filter(opp => 
    // In a real app, this would filter by current user's opportunities
    // For now, show all opportunities as demo
    !searchQuery || 
    opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    opp.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const getTypeColor = (type: string) => {
    const typeColors: Record<string, string> = {
      "Full-time": "bg-primary/10 text-primary border-primary/20",
      "Contract": "bg-orange-500/10 text-orange-600 border-orange-500/20", 
      "Project-based": "bg-purple-500/10 text-purple-600 border-purple-500/20",
      "Freelance": "bg-green-500/10 text-green-600 border-green-500/20",
      "Part-time": "bg-blue-500/10 text-blue-600 border-blue-500/20",
      "Internship": "bg-indigo-500/10 text-indigo-600 border-indigo-500/20"
    };
    return typeColors[type] || "bg-muted text-muted-foreground";
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return "Salary not specified";
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    if (max) return `Up to $${max.toLocaleString()}`;
    return "Salary not specified";
  };

  if (selectedOpportunity) {
    const opportunity = myOpportunities.find(opp => opp.id === selectedOpportunity);
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedOpportunity(null)}
            className="px-2"
          >
            ← Back
          </Button>
          <div>
            <h2 className="text-xl font-semibold">{opportunity?.title}</h2>
            <p className="text-sm text-muted-foreground">Manage applications</p>
          </div>
        </div>
        
        <ApplicantManagement 
          opportunityId={selectedOpportunity}
          opportunityTitle={opportunity?.title || "Unknown Opportunity"}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-end mb-6">
        <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white shadow-lg">
          <Plus className="h-4 w-4 mr-2" />
          Post
        </Button>
      </div>

      {/* Search and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-2">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search your opportunities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/40 border-border/50"
              />
            </div>
            <Button variant="outline" className="sm:w-auto">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>
        
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{myOpportunities.length}</div>
            <div className="text-sm text-muted-foreground">Active Posts</div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {myOpportunities.reduce((acc, opp) => acc + (opp.applications_count || 0), 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Applications</div>
          </div>
        </Card>
      </div>

      {/* Opportunities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-4">
                <div className="space-y-2">
                  <div className="h-5 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
                <div className="flex gap-2">
                  <div className="h-6 bg-muted rounded w-16"></div>
                  <div className="h-6 bg-muted rounded w-20"></div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          myOpportunities.map((opportunity, index) => (
            <motion.div
              key={opportunity.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.1 }}
            >
              <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {opportunity.title}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                        <Calendar className="h-4 w-4" />
                        <span>Posted {formatDistanceToNow(new Date(opportunity.created_at))} ago</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getTypeColor(opportunity.type)}>
                        {opportunity.type}
                      </Badge>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="h-4 w-4 mr-2" />
                            View Public Post
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit3 className="h-4 w-4 mr-2" />
                            Edit Opportunity
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Post
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Key Details */}
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex items-center text-muted-foreground">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{opportunity.location || "Location not specified"}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{formatSalary(opportunity.salary_min, opportunity.salary_max)}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {opportunity.description}
                  </p>

                  {/* Tags */}
                  {opportunity.tags && opportunity.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {opportunity.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {opportunity.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{opportunity.tags.length - 3} more
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span className="font-medium">{opportunity.applications_count || 0}</span>
                      <span>applications</span>
                    </div>
                    
                    <Button 
                      size="sm"
                      onClick={() => setSelectedOpportunity(opportunity.id)}
                      className="bg-primary hover:bg-primary/90 text-primary-foreground"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      View Applications
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {myOpportunities.length === 0 && !isLoading && (
        <Card className="p-8 text-center">
          <div className="max-w-md mx-auto space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              <Plus className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">No opportunities posted yet</h3>
              <p className="text-muted-foreground mb-4">
                Start attracting talent by posting your first opportunity.
              </p>
              <Button className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90">
                <Plus className="h-4 w-4 mr-2" />
                Post Your First Opportunity
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
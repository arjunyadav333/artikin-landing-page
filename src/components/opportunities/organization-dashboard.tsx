import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Users, 
  MapPin,
  Eye,
  Calendar,
  Edit,
  MoreHorizontal,
  Plus,
  Search,
  Filter
} from "lucide-react";
import { useOrganizationOpportunities } from "@/hooks/useOrganizationOpportunities";
import { ApplicantManagement } from "./applicant-management";
import { CreateOpportunityModal } from "./create-opportunity-modal";
import { EditOpportunityModal } from "./edit-opportunity-modal";
import { formatDistanceToNow } from "date-fns";

export function OrganizationDashboard() {
  const [activeTab, setActiveTab] = useState("active");
  const [selectedOpportunity, setSelectedOpportunity] = useState<string | null>(null);
  const [editingOpportunity, setEditingOpportunity] = useState<any | null>(null);
  
  const { data: opportunities, isLoading } = useOrganizationOpportunities();

  // Filter and organize opportunities
  const { activeOpportunities, closedOpportunities, allOpportunities } = useMemo(() => {
    const filtered = opportunities || [];
    const active = filtered.filter(opp => opp.status === 'active');
    const closed = filtered.filter(opp => opp.status === 'closed');

    return {
      activeOpportunities: active,
      closedOpportunities: closed,
      allOpportunities: filtered
    };
  }, [opportunities]);

  // Get current tab's opportunities
  const getCurrentOpportunities = () => {
    switch (activeTab) {
      case "active":
        return activeOpportunities;
      case "closed":
        return closedOpportunities;
      case "all":
        return allOpportunities;
      default:
        return activeOpportunities;
    }
  };

  const currentOpportunities = getCurrentOpportunities();

  if (selectedOpportunity) {
    const opportunity = allOpportunities.find(opp => opp.id === selectedOpportunity);
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
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by job title, company, or keywords..."
                className="pl-10 h-12 bg-background border-border"
              />
            </div>
            <Button variant="outline" size="icon" className="h-12 w-12 border-border">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Post New Job Opportunity Button */}
        <div className="mb-6">
          <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-lg">
            <Plus className="h-4 w-4 mr-2" />
            Post New Job Opportunity
          </Button>
        </div>

        {/* Tabs Section */}
        <div className="mb-6">
          <div className="flex gap-2">
            <Button
              variant={activeTab === "active" ? "default" : "outline"}
              onClick={() => setActiveTab("active")}
              className={`flex-1 h-12 font-medium rounded-lg ${
                activeTab === "active" 
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground" 
                  : "bg-background border-border text-foreground hover:bg-muted"
              }`}
            >
              Active ({activeOpportunities.length})
            </Button>
            <Button
              variant={activeTab === "closed" ? "default" : "outline"}
              onClick={() => setActiveTab("closed")}
              className={`flex-1 h-12 font-medium rounded-lg ${
                activeTab === "closed" 
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground" 
                  : "bg-background border-border text-foreground hover:bg-muted"
              }`}
            >
              Closed ({closedOpportunities.length})
            </Button>
            <Button
              variant={activeTab === "all" ? "default" : "outline"}
              onClick={() => setActiveTab("all")}
              className={`flex-1 h-12 font-medium rounded-lg ${
                activeTab === "all" 
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground" 
                  : "bg-background border-border text-foreground hover:bg-muted"
              }`}
            >
              All ({allOpportunities.length})
            </Button>
          </div>
        </div>

        {/* Job Cards List */}
        <div className="space-y-4">
          {isLoading ? (
            <>
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse p-6 border-border">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="h-6 bg-muted rounded w-1/3"></div>
                      <div className="h-6 bg-muted rounded w-16"></div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="h-5 bg-muted rounded w-20"></div>
                      <div className="h-5 bg-muted rounded w-32"></div>
                    </div>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-4 bg-muted rounded w-16"></div>
                        <div className="h-4 bg-muted rounded w-20"></div>
                      </div>
                      <div className="h-4 bg-muted rounded w-24"></div>
                    </div>
                  </div>
                </Card>
              ))}
            </>
          ) : (
            <>
              {currentOpportunities.map((opportunity) => (
                <Card key={opportunity.id} className="p-6 hover:shadow-md transition-all duration-200 relative bg-card border-border">
                  {/* More Options Menu */}
                  <div className="absolute top-6 right-6">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {/* Top Row: Title + Status Badge */}
                    <div className="flex items-start justify-between pr-10">
                      <h3 className="text-xl font-bold text-foreground leading-tight">
                        {opportunity.title}
                      </h3>
                      <Badge 
                        className={`px-3 py-1 text-xs font-medium rounded-md ${
                          opportunity.status === 'active' 
                            ? 'bg-green-500 text-white' 
                            : 'bg-red-500 text-white'
                        }`}
                      >
                        {opportunity.status === 'active' ? 'Active' : 'Closed'}
                      </Badge>
                    </div>

                    {/* Second Row: Category + Location */}
                    <div className="flex items-center gap-4">
                      <Badge variant="outline" className="px-3 py-1 text-sm bg-background text-foreground border-border rounded-full">
                        {opportunity.type || 'Acting'}
                      </Badge>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{opportunity.location || 'Location not specified'}</span>
                      </div>
                    </div>

                    {/* Description Preview */}
                    <p className="text-sm text-foreground leading-relaxed">
                      {opportunity.description}
                    </p>

                    {/* Footer Row */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground pt-2">
                      <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                          <Eye className="h-4 w-4" />
                          <span>{opportunity.views_count || 0} views</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {opportunity.deadline 
                              ? `Deadline: ${new Date(opportunity.deadline).toLocaleDateString('en-GB')}`
                              : 'Deadline: No deadline'
                            }
                          </span>
                        </div>
                      </div>
                      <span>
                        Posted {formatDistanceToNow(new Date(opportunity.created_at))} ago
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      <Button
                        onClick={() => setSelectedOpportunity(opportunity.id)}
                        variant="outline"
                        className="border-border text-foreground hover:bg-muted"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Manage Applicants ({opportunity.applications_count || 0})
                      </Button>
                      <Button 
                        variant="outline"
                        className="border-border text-foreground hover:bg-muted"
                        onClick={() => setEditingOpportunity(opportunity)}
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              {/* Empty State */}
              {currentOpportunities.length === 0 && (
                <Card className="p-12 text-center border-border">
                  <div className="max-w-md mx-auto space-y-4">
                    <div className="mx-auto w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center">
                      <Users className="h-10 w-10 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        No {activeTab} opportunities
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        {activeTab === 'active' 
                          ? "You don't have any active opportunities. Create one to start receiving applications."
                          : activeTab === 'closed'
                            ? "You don't have any closed opportunities yet."
                            : "You haven't posted any opportunities yet. Start attracting talent by posting your first job opportunity."
                        }
                      </p>
                      {activeTab !== 'closed' && (
                        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                          <Plus className="h-4 w-4 mr-2" />
                          Post New Job Opportunity
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editingOpportunity && (
        <EditOpportunityModal
          isOpen={!!editingOpportunity}
          onClose={() => setEditingOpportunity(null)}
          opportunity={editingOpportunity}
        />
      )}
    </div>
  );
}
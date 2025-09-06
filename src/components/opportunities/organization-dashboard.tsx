import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  MapPin,
  Eye,
  Calendar,
  Edit,
  MoreHorizontal,
  Plus
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
      {/* Post New Job Opportunity Section - Full Width Blue */}
      <div className="bg-primary py-8 px-4">
        <div className="container max-w-6xl mx-auto text-center">
          <Button 
            size="lg" 
            className="bg-white text-primary hover:bg-white/90 font-medium px-6 py-3 rounded-lg"
          >
            <Plus className="h-4 w-4 mr-2" />
            Post New Job Opportunity
          </Button>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 py-6">
        {/* Tabs Section */}
        <div className="mb-6">
          <div className="flex justify-start gap-0 bg-muted p-1 rounded-lg inline-flex">
            <Button
              variant="ghost"
              onClick={() => setActiveTab("active")}
              className={`px-4 py-2 rounded-md font-medium transition-all ${
                activeTab === "active" 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Active ({activeOpportunities.length})
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveTab("closed")}
              className={`px-4 py-2 rounded-md font-medium transition-all ${
                activeTab === "closed" 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Closed ({closedOpportunities.length})
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-md font-medium transition-all ${
                activeTab === "all" 
                  ? "bg-primary text-primary-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
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
                <Card key={i} className="animate-pulse p-6">
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
                <Card key={opportunity.id} className="p-4 hover:shadow-md transition-all duration-200 relative bg-card">
                  {/* More Options Menu */}
                  <div className="absolute top-4 right-4">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {/* Top Row: Title + Status Badge */}
                    <div className="flex items-start justify-between pr-8">
                      <h3 className="text-lg font-bold text-foreground leading-tight">
                        {opportunity.title}
                      </h3>
                      <Badge 
                        className={`px-2 py-1 text-xs font-medium rounded-md ${
                          opportunity.status === 'active' 
                            ? 'bg-green-500 text-white' 
                            : 'bg-red-500 text-white'
                        }`}
                      >
                        {opportunity.status === 'active' ? 'Active' : 'Closed'}
                      </Badge>
                    </div>

                    {/* Second Row: Category + Location */}
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="px-2 py-1 text-xs bg-background text-foreground border-border rounded-full">
                        {opportunity.type || 'Acting'}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{opportunity.location || 'Location not specified'}</span>
                      </div>
                    </div>

                    {/* Description Preview */}
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {opportunity.description}
                    </p>

                    {/* Footer Row */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          <span>{opportunity.views_count || 0} views</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {opportunity.deadline 
                              ? `Deadline: ${new Date(opportunity.deadline).toLocaleDateString('en-GB')}`
                              : 'No deadline'
                            }
                          </span>
                        </div>
                      </div>
                      <span>
                        Posted {formatDistanceToNow(new Date(opportunity.created_at))} ago
                      </span>
                    </div>

                    {/* Action Buttons Row */}
                    <div className="flex items-center justify-between pt-3 border-t border-border/50">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        >
                          Home
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50"
                          onClick={() => setSelectedOpportunity(opportunity.id)}
                        >
                          Opportunities
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        >
                          +
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        >
                          Connections
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-3 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        >
                          Messages
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {/* Empty State */}
              {currentOpportunities.length === 0 && (
                <Card className="p-12 text-center">
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
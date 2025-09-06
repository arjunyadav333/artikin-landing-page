import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Users, 
  TrendingUp,
  AlertCircle,
  Filter,
  Plus
} from "lucide-react";
import { useOrganizationOpportunities } from "@/hooks/useOrganizationOpportunities";
import { ApplicantManagement } from "./applicant-management";
import { CreateOpportunityModal } from "./create-opportunity-modal";
import { EditOpportunityModal } from "./edit-opportunity-modal";
import { formatDistanceToNow } from "date-fns";

export function OrganizationDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [selectedOpportunity, setSelectedOpportunity] = useState<string | null>(null);
  const [editingOpportunity, setEditingOpportunity] = useState<any | null>(null);
  
  const { data: opportunities, isLoading } = useOrganizationOpportunities();

  // Filter and organize opportunities
  const { activeOpportunities, closedOpportunities, allOpportunities } = useMemo(() => {
    const filtered = opportunities?.filter(opp => 
      !searchQuery || 
      opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      opp.company?.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

    const active = filtered.filter(opp => opp.status === 'active');
    const closed = filtered.filter(opp => opp.status === 'closed');

    return {
      activeOpportunities: active,
      closedOpportunities: closed,
      allOpportunities: filtered
    };
  }, [opportunities, searchQuery]);

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
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Opportunity Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage and track your job postings
          </p>
        </div>

        {/* Post New Job Section */}
        <div className="bg-primary rounded-lg p-6 mb-8">
          <CreateOpportunityModal />
        </div>

        {/* Search and Filter Section */}
        <div className="flex flex-col sm:flex-row gap-4 items-center mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search opportunities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold">{activeOpportunities.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Closed</p>
                <p className="text-2xl font-bold">{closedOpportunities.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Applications</p>
                <p className="text-2xl font-bold">
                  {allOpportunities.reduce((sum, opp) => sum + (opp.applications_count || 0), 0)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs Section */}
        <div className="mb-6">
          <div className="flex justify-start gap-2">
            <Button
              variant={activeTab === "active" ? "default" : "outline"}
              onClick={() => setActiveTab("active")}
              className={`${
                activeTab === "active" 
                  ? "bg-green-500 hover:bg-green-600 text-white" 
                  : "hover:bg-green-50"
              }`}
            >
              Active ({activeOpportunities.length})
            </Button>
            <Button
              variant={activeTab === "closed" ? "default" : "outline"}
              onClick={() => setActiveTab("closed")}
              className={`${
                activeTab === "closed" 
                  ? "bg-gray-500 hover:bg-gray-600 text-white" 
                  : "hover:bg-gray-50"
              }`}
            >
              Closed ({closedOpportunities.length})
            </Button>
            <Button
              variant={activeTab === "all" ? "default" : "outline"}
              onClick={() => setActiveTab("all")}
            >
              All ({allOpportunities.length})
            </Button>
          </div>
        </div>

        {/* Opportunities List */}
        <div className="space-y-4">
          {isLoading ? (
            <>
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="h-5 bg-muted rounded w-1/3"></div>
                      <div className="h-4 bg-muted rounded w-1/4"></div>
                    </div>
                    <div className="h-8 bg-muted rounded w-32"></div>
                  </div>
                </Card>
              ))}
            </>
          ) : (
            <>
              {currentOpportunities.map((opportunity) => (
                <Card key={opportunity.id} className="p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-foreground">
                          {opportunity.title}
                        </h3>
                        <Badge 
                          className={`px-3 py-1 text-xs font-medium ${
                            opportunity.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {opportunity.status === 'active' ? 'Active' : 'Closed'}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                        <span>Posted {formatDistanceToNow(new Date(opportunity.created_at))} ago</span>
                        <span>{opportunity.views_count || 0} views</span>
                        <span>{opportunity.applications_count || 0} applications</span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {opportunity.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => setSelectedOpportunity(opportunity.id)}
                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Manage ({opportunity.applications_count || 0})
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}

              {/* Empty State */}
              {currentOpportunities.length === 0 && (
                <Card className="p-12 text-center">
                  <div className="max-w-md mx-auto space-y-4">
                    <div className="mx-auto w-20 h-20 bg-muted/50 rounded-full flex items-center justify-center">
                      {activeTab === 'active' && <TrendingUp className="h-10 w-10 text-green-600" />}
                      {activeTab === 'closed' && <AlertCircle className="h-10 w-10 text-gray-600" />}
                      {activeTab === 'all' && <Users className="h-10 w-10 text-primary" />}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">
                        {searchQuery ? `No ${activeTab} opportunities found` : `No ${activeTab} opportunities`}
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        {searchQuery 
                          ? `No ${activeTab} opportunities match your search criteria.` 
                          : activeTab === 'active' 
                            ? "You don't have any active opportunities. Create one to start receiving applications."
                            : activeTab === 'closed'
                              ? "You don't have any closed opportunities yet."
                              : "You haven't posted any opportunities yet. Start attracting talent by posting your first job opportunity."
                        }
                      </p>
                      {!searchQuery && activeTab !== 'closed' && (
                        <CreateOpportunityModal />
                      )}
                      {searchQuery && (
                        <Button 
                          variant="outline" 
                          onClick={() => setSearchQuery("")}
                        >
                          Clear Search
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
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Briefcase } from "lucide-react";
import { useOrganizationOpportunities, useUpdateOpportunityStatus, useDeleteOpportunity } from "@/hooks/useOrganizationOpportunities";
import { ApplicantManagement } from "./applicant-management";
import { ComprehensivePostModal } from "./comprehensive-post-modal";
import { EditOpportunityModal } from "./edit-opportunity-modal";
import { OrganizationOpportunityCard } from "./organization-opportunity-card";
import { ShareOpportunityModal } from "./share-opportunity-modal";
import { formatDistanceToNow, format } from "date-fns";

export function OrganizationDashboard() {
  const navigate = useNavigate();
  const [selectedOpportunity, setSelectedOpportunity] = useState<string | null>(null);
  const [editingOpportunity, setEditingOpportunity] = useState<any | null>(null);
  const [shareOpportunity, setShareOpportunity] = useState<any | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [showPostModal, setShowPostModal] = useState(false);
  const {
    data: opportunities,
    isLoading
  } = useOrganizationOpportunities();
  const updateStatus = useUpdateOpportunityStatus();
  const deleteOpportunity = useDeleteOpportunity();

  // Filter opportunities based on status
  const filteredOpportunities = useMemo(() => {
    if (!opportunities) return [];
    let filtered = opportunities;

    // Filter by status
    if (activeFilter === "active") {
      filtered = filtered.filter(opp => opp.status === "active");
    } else if (activeFilter === "closed") {
      filtered = filtered.filter(opp => opp.status === "closed");
    }

    return filtered;
  }, [opportunities, activeFilter]);

  // Count opportunities by status
  const opportunityCounts = useMemo(() => {
    if (!opportunities) return {
      all: 0,
      active: 0,
      closed: 0
    };
    return {
      all: opportunities.length,
      active: opportunities.filter(opp => opp.status === "active").length,
      closed: opportunities.filter(opp => opp.status === "closed").length
    };
  }, [opportunities]);

  const handleStatusToggle = async (opportunityId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'closed' : 'active';
    await updateStatus.mutateAsync({
      opportunityId,
      status: newStatus
    });
  };

  const handleDeleteOpportunity = async (opportunityId: string) => {
    await deleteOpportunity.mutateAsync(opportunityId);
  };

  const handleManageApplicants = (opportunityId: string) => {
    setSelectedOpportunity(opportunityId);
  };

  const handleEdit = (opportunity: any) => {
    setEditingOpportunity(opportunity);
  };

  const handleShare = (opportunity: any) => {
    setShareOpportunity(opportunity);
  };

  const handleViewDetails = (opportunityId: string) => {
    navigate(`/opportunities/${opportunityId}`);
  };
  if (selectedOpportunity) {
    const opportunity = filteredOpportunities.find(opp => opp.id === selectedOpportunity);
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setSelectedOpportunity(null)} className="px-2">
            ← Back
          </Button>
          <div>
            <h2 className="text-xl font-semibold">{opportunity?.title}</h2>
            <p className="text-sm text-muted-foreground">Manage applications</p>
          </div>
        </div>
        
        <ApplicantManagement opportunityId={selectedOpportunity} opportunityTitle={opportunity?.title || "Unknown Opportunity"} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Centered container with max-width 1080px */}
      <div className="max-w-[1080px] mx-auto px-6 md:px-6 lg:px-6 py-8">
        {/* Post New Job Opportunity CTA */}
        <div className="mb-6 md:mb-8">
          <ComprehensivePostModal 
            open={showPostModal} 
            onOpenChange={setShowPostModal} 
            trigger={
              <Button 
                onClick={() => setShowPostModal(true)} 
                className="w-full md:w-auto h-14 md:h-12 px-5 md:px-6 text-base md:text-base font-medium rounded-3xl md:rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <Plus className="h-5 w-5 mr-3" />
                Post New Job Opportunity
              </Button>
            } 
          />
        </div>

        {/* Filter Tabs */}
        <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full">
          <div className="mb-8">
            <TabsList className="grid w-full grid-cols-3 bg-muted/30 p-1 rounded-2xl h-11 md:h-10 gap-1">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-semibold transition-all duration-200 text-sm md:text-sm py-2 px-4 rounded-xl font-medium"
              >
                All ({opportunityCounts.all})
              </TabsTrigger>
              <TabsTrigger 
                value="active" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-semibold transition-all duration-200 text-sm md:text-sm py-2 px-4 rounded-xl font-medium"
              >
                Active ({opportunityCounts.active})
              </TabsTrigger>
              <TabsTrigger 
                value="closed" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-semibold transition-all duration-200 text-sm md:text-sm py-2 px-4 rounded-xl font-medium"
              >
                Closed ({opportunityCounts.closed})
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Opportunities Content */}
          <TabsContent value={activeFilter} className="mt-0">
            <div className="space-y-4">
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 4 }).map((_, i) => (
                  <Card key={i} className="animate-pulse p-6 rounded-xl">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="h-5 bg-muted rounded w-1/3"></div>
                        <div className="h-4 bg-muted rounded w-1/4"></div>
                      </div>
                      <div className="flex gap-2">
                        <div className="h-6 bg-muted rounded w-20"></div>
                        <div className="h-8 bg-muted rounded w-32"></div>
                      </div>
                    </div>
                  </Card>
                ))
              ) : filteredOpportunities.length > 0 ? (
                // Opportunities list with new card design
                filteredOpportunities.map((opportunity, index) => (
                  <OrganizationOpportunityCard
                    key={opportunity.id}
                    opportunity={opportunity}
                    index={index}
                    onManageApplicants={handleManageApplicants}
                    onEdit={handleEdit}
                    onShare={handleShare}
                    onDelete={handleDeleteOpportunity}
                    onViewDetails={handleViewDetails}
                  />
                ))
              ) : (
                // No opportunities found card - exact layout match
                <Card className="p-8 md:p-12 text-center rounded-xl border-2 border-dashed border-muted">
                  <div className="max-w-md mx-auto space-y-6">
                    <div className="mx-auto w-16 h-16 md:w-20 md:h-20 bg-primary/10 rounded-full flex items-center justify-center">
                      <Briefcase className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                    </div>
                    <div className="space-y-3">
                      <h3 className="text-xl md:text-2xl font-semibold text-foreground">
                        {activeFilter === "all" ? "No opportunities found" : 
                         activeFilter === "active" ? "No active opportunities" : 
                         "No closed opportunities"}
                      </h3>
                      <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                        {activeFilter === "all" 
                          ? "You haven't posted any opportunities yet. Start attracting talent by posting your first job opportunity." 
                          : activeFilter === "active" 
                          ? "All your opportunities are currently closed. Post a new opportunity or reactivate an existing one." 
                          : "No opportunities have been closed yet."}
                      </p>
                      {activeFilter === "all" && (
                        <div className="pt-4">
                          <Button 
                            onClick={() => setShowPostModal(true)} 
                            className="bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-2 rounded-lg font-medium"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Post Your First Opportunity
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {editingOpportunity && (
          <EditOpportunityModal 
            isOpen={!!editingOpportunity} 
            onClose={() => setEditingOpportunity(null)} 
            opportunity={editingOpportunity} 
          />
        )}

        {shareOpportunity && (
          <ShareOpportunityModal
            opportunity={shareOpportunity}
            open={!!shareOpportunity}
            onOpenChange={(open) => !open && setShareOpportunity(null)}
          />
        )}
      </div>
    </div>
  );
}
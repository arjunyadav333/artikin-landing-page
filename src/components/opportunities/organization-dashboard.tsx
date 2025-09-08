import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  MoreHorizontal, 
  Edit3, 
  Trash2, 
  Users, 
  Eye,
  Calendar,
  Clock,
  Filter,
  ToggleLeft,
  ToggleRight,
  Plus
} from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOrganizationOpportunities, useUpdateOpportunityStatus, useDeleteOpportunity } from "@/hooks/useOrganizationOpportunities";
import { ApplicantManagement } from "./applicant-management";
import { ComprehensivePostModal } from "./comprehensive-post-modal";
import { EditOpportunityModal } from "./edit-opportunity-modal";
import { formatDistanceToNow, format } from "date-fns";

export function OrganizationDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOpportunity, setSelectedOpportunity] = useState<string | null>(null);
  const [editingOpportunity, setEditingOpportunity] = useState<any | null>(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [showPostModal, setShowPostModal] = useState(false);
  
  const { data: opportunities, isLoading } = useOrganizationOpportunities();
  const updateStatus = useUpdateOpportunityStatus();
  const deleteOpportunity = useDeleteOpportunity();

  // Filter opportunities based on status and search query
  const filteredOpportunities = useMemo(() => {
    if (!opportunities) return [];
    
    let filtered = opportunities;
    
    // Filter by status
    if (activeFilter === "active") {
      filtered = filtered.filter(opp => opp.status === "active");
    } else if (activeFilter === "closed") {
      filtered = filtered.filter(opp => opp.status === "closed");
    }
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(opp => 
        opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        opp.company?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [opportunities, activeFilter, searchQuery]);

  // Count opportunities by status
  const opportunityCounts = useMemo(() => {
    if (!opportunities) return { all: 0, active: 0, closed: 0 };
    
    return {
      all: opportunities.length,
      active: opportunities.filter(opp => opp.status === "active").length,
      closed: opportunities.filter(opp => opp.status === "closed").length,
    };
  }, [opportunities]);

  const handleStatusToggle = async (opportunityId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'closed' : 'active';
    await updateStatus.mutateAsync({ opportunityId, status: newStatus });
  };

  const handleDeleteOpportunity = async (opportunityId: string) => {
    if (window.confirm('Are you sure you want to delete this opportunity?')) {
      await deleteOpportunity.mutateAsync(opportunityId);
    }
  };

  if (selectedOpportunity) {
    const opportunity = filteredOpportunities.find(opp => opp.id === selectedOpportunity);
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
      {/* Post New Opportunity Button */}
      <ComprehensivePostModal
        open={showPostModal}
        onOpenChange={setShowPostModal}
        trigger={
          <Button 
            onClick={() => setShowPostModal(true)}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6 mb-6"
          >
            <Plus className="h-5 w-5 mr-3" />
            Post New Job Opportunity
          </Button>
        }
      />

      {/* Filter Tabs */}
      <Tabs value={activeFilter} onValueChange={setActiveFilter} className="w-full">
        <div className="flex justify-between items-center mb-6">
          <TabsList className="grid w-fit grid-cols-3 bg-muted/30 p-1 rounded-xl h-12">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-medium transition-all duration-200 px-6"
            >
              All ({opportunityCounts.all})
            </TabsTrigger>
            <TabsTrigger 
              value="active"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-medium transition-all duration-200 px-6"
            >
              Active ({opportunityCounts.active})
            </TabsTrigger>
            <TabsTrigger 
              value="closed"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-medium transition-all duration-200 px-6"
            >
              Closed ({opportunityCounts.closed})
            </TabsTrigger>
          </TabsList>

          {/* Search Bar */}
          <div className="flex gap-4 items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search opportunities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </div>

        {/* Opportunities Content */}
        <TabsContent value={activeFilter} className="mt-0">
          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="animate-pulse p-6">
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
            ) : (
              <>
                {filteredOpportunities.map((opportunity, index) => (
                  <motion.div
                    key={opportunity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                  >
                    <Card className="p-6 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold text-foreground">
                              {opportunity.title}
                            </h3>
                            <Badge 
                              className={`px-2 py-1 text-xs font-medium ${
                                opportunity.status === 'active' 
                                  ? 'bg-green-100 text-green-800 border-green-200' 
                                  : 'bg-gray-100 text-gray-800 border-gray-200'
                              }`}
                            >
                              {opportunity.status === 'active' ? 'Active' : 'Closed'}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>Posted {formatDistanceToNow(new Date(opportunity.created_at))} ago</span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <Eye className="h-4 w-4" />
                              <span>{opportunity.views_count || 0} views</span>
                            </div>
                            
                            <div className="flex items-center gap-1">
                              <Users className="h-4 w-4" />
                              <span>{opportunity.applications_count || 0} applications</span>
                            </div>
                            
                            {opportunity.deadline && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>Deadline: {format(new Date(opportunity.deadline), 'MMM d, yyyy')}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusToggle(opportunity.id, opportunity.status || 'active')}
                            className="flex items-center gap-2"
                          >
                            {opportunity.status === 'active' ? (
                              <>
                                <ToggleRight className="h-4 w-4 text-green-600" />
                                Active
                              </>
                            ) : (
                              <>
                                <ToggleLeft className="h-4 w-4 text-gray-400" />
                                Closed
                              </>
                            )}
                          </Button>
                          
                          <Button
                            onClick={() => setSelectedOpportunity(opportunity.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Manage Applicants
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => setEditingOpportunity(opportunity)}
                              >
                                <Edit3 className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDeleteOpportunity(opportunity.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}

                {filteredOpportunities.length === 0 && (
                  <Card className="p-12 text-center">
                    <div className="max-w-md mx-auto space-y-4">
                      <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                        <Users className="h-10 w-10 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold mb-2">
                          {activeFilter === "all" ? "No opportunities found" : 
                           activeFilter === "active" ? "No active opportunities" : 
                           "No closed opportunities"}
                        </h3>
                        <p className="text-muted-foreground mb-6">
                          {searchQuery 
                            ? "No opportunities match your search criteria." 
                            : activeFilter === "all" 
                              ? "You haven't posted any opportunities yet. Start attracting talent by posting your first job opportunity."
                              : activeFilter === "active"
                                ? "All your opportunities are currently closed. Post a new opportunity or reactivate an existing one."
                                : "No opportunities have been closed yet."
                          }
                        </p>
                        {!searchQuery && activeFilter === "all" && (
                          <Button 
                            onClick={() => setShowPostModal(true)}
                            className="bg-primary hover:bg-primary/90"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Post Your First Opportunity
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                )}
              </>
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
    </div>
  );
}
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  Plus,
  TrendingUp,
  AlertCircle
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
import { CreateOpportunityModal } from "./create-opportunity-modal";
import { EditOpportunityModal } from "./edit-opportunity-modal";
import { formatDistanceToNow, format } from "date-fns";

export function OrganizationDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [selectedOpportunity, setSelectedOpportunity] = useState<string | null>(null);
  const [editingOpportunity, setEditingOpportunity] = useState<any | null>(null);
  
  const { data: opportunities, isLoading } = useOrganizationOpportunities();
  const updateStatus = useUpdateOpportunityStatus();
  const deleteOpportunity = useDeleteOpportunity();

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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-background via-background/95 to-accent/5"
    >
      <div className="container max-w-7xl mx-auto px-4 py-6 lg:py-8">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Opportunity Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage and track your job postings
            </p>
          </div>
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
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">{activeOpportunities.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Closed</p>
                <p className="text-2xl font-bold text-gray-600">{closedOpportunities.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Applications</p>
                <p className="text-2xl font-bold text-blue-600">
                  {allOpportunities.reduce((sum, opp) => sum + (opp.applications_count || 0), 0)}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs Section */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex justify-center mb-6">
            <TabsList className="grid w-full max-w-md grid-cols-3 bg-muted/30 p-1 rounded-xl h-12">
              <TabsTrigger 
                value="active" 
                className="data-[state=active]:bg-green-500 data-[state=active]:text-white data-[state=active]:font-bold transition-all duration-200 hover:bg-green-100"
              >
                Active ({activeOpportunities.length})
              </TabsTrigger>
              <TabsTrigger 
                value="closed"
                className="data-[state=active]:bg-gray-500 data-[state=active]:text-white data-[state=active]:font-bold transition-all duration-200 hover:bg-gray-100"
              >
                Closed ({closedOpportunities.length})
              </TabsTrigger>
              <TabsTrigger 
                value="all"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-bold transition-all duration-200 hover:bg-primary/10"
              >
                All ({allOpportunities.length})
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <TabsContent value={activeTab} className="mt-0">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {Array.from({ length: 4 }).map((_, i) => (
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
                  ))}
                </motion.div>
              ) : (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-4"
                >
                  {currentOpportunities.map((opportunity, index) => (
                    <motion.div
                      key={opportunity.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: index * 0.05 }}
                    >
                      <Card className="p-6 hover:shadow-lg transition-all duration-200 border-l-4 border-l-transparent hover:border-l-primary">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3">
                              <h3 className="text-lg font-semibold text-foreground">
                                {opportunity.title}
                              </h3>
                              <Badge 
                                className={`px-3 py-1 text-xs font-medium ${
                                  opportunity.status === 'active' 
                                    ? 'bg-green-100 text-green-800 border-green-200' 
                                    : 'bg-gray-100 text-gray-800 border-gray-200'
                                }`}
                              >
                                {opportunity.status === 'active' ? 'Active' : 'Closed'}
                              </Badge>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
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
                              className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                              <Users className="h-4 w-4 mr-2" />
                              Manage ({opportunity.applications_count || 0})
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
                          {!searchQuery && activeTab !== 'closed' && <CreateOpportunityModal />}
                          {searchQuery && (
                            <Button 
                              variant="outline" 
                              onClick={() => setSearchQuery("")}
                              className="mt-2"
                            >
                              Clear Search
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  )}
                </motion.div>
              )}
            </TabsContent>
          </AnimatePresence>
        </Tabs>

        {editingOpportunity && (
          <EditOpportunityModal
            isOpen={!!editingOpportunity}
            onClose={() => setEditingOpportunity(null)}
            opportunity={editingOpportunity}
          />
        )}
      </div>
    </motion.div>
  );
}
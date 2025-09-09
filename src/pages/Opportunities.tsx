import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import { ApplicationCard } from "@/components/opportunities/application-card";
import { OrganizationDashboard } from "@/components/opportunities/organization-dashboard";
import { OpportunitySkeletonCard, ApplicationSkeletonCard } from "@/components/opportunities/skeleton-card";
import { RoleSelectionModal } from "@/components/auth/role-selection-modal";
import { useOpportunities, useApplyToOpportunity } from "@/hooks/useOpportunities";
import { useUserApplications, useDeleteApplication } from "@/hooks/useApplications";
import { useCurrentProfile } from "@/hooks/useProfiles";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";

const Opportunities = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("opportunities");
  const [sortBy, setSortBy] = useState("newest");
  const [showRoleModal, setShowRoleModal] = useState(false);
  
  const { data: currentProfile, isLoading: profileLoading } = useCurrentProfile();
  const { data: opportunities, isLoading: opportunitiesLoading } = useOpportunities();
  const { data: applications, isLoading: applicationsLoading } = useUserApplications();
  const applyToOpportunity = useApplyToOpportunity();
  const deleteApplication = useDeleteApplication();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  // Handle role determination with null/undefined role support
  const userRole = currentProfile?.role;
  const hasValidRole = userRole === 'artist' || userRole === 'organization';
  const isArtist = userRole === 'artist';
  const isOrganization = userRole === 'organization';

  // Show role selection modal if user doesn't have a valid role
  const shouldShowRoleModal = !profileLoading && currentProfile && !hasValidRole;

  // Filter and sort opportunities based on search query and sort preference
  const filteredOpportunities = useMemo(() => {
    if (!opportunities) return [];
    
    let filtered = opportunities;
    
    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(opp => 
        opp.title.toLowerCase().includes(query) ||
        opp.description.toLowerCase().includes(query) ||
        (opp.company && opp.company.toLowerCase().includes(query)) ||
        (opp.location && opp.location.toLowerCase().includes(query)) ||
        (opp.tags && opp.tags.some(tag => tag.toLowerCase().includes(query))) ||
        (opp.profiles?.display_name && opp.profiles.display_name.toLowerCase().includes(query))
      );
    }
    
    // Apply sorting
    switch (sortBy) {
      case "newest":
        return filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      case "oldest":
        return filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      case "salary-high":
        return filtered.sort((a, b) => (b.salary_max || 0) - (a.salary_max || 0));
      case "salary-low":
        return filtered.sort((a, b) => (a.salary_min || 0) - (b.salary_min || 0));
      case "applications":
        return filtered.sort((a, b) => (b.applications_count || 0) - (a.applications_count || 0));
      default:
        return filtered;
    }
  }, [opportunities, searchQuery, sortBy]);

  // Filter applications based on search query
  const filteredApplications = useMemo(() => {
    if (!applications) return [];
    if (!searchQuery.trim()) return applications;

    const query = searchQuery.toLowerCase();
    return applications.filter(app => 
      app.opportunities?.title?.toLowerCase().includes(query) ||
      app.opportunities?.company?.toLowerCase().includes(query)
    );
  }, [applications, searchQuery]);

  const handleApply = async (opportunityId: string) => {
    if (!isArtist) {
      toast({
        title: "Access denied",
        description: "Only artists can apply to opportunities.",
        variant: "destructive"
      });
      return;
    }

    try {
      await applyToOpportunity.mutateAsync({ opportunityId });
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleRemoveApplication = async (applicationId: string) => {
    try {
      await deleteApplication.mutateAsync(applicationId);
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleViewOpportunity = (opportunityId: string) => {
    navigate(`/opportunities/${opportunityId}`);
  };

  const handleManageApplicants = (opportunityId: string) => {
    navigate(`/opportunities/${opportunityId}/applicants`);
  };

  // Wait for profile to load before showing role-specific content
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-8 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Show role selection modal if user needs to select a role
  if (shouldShowRoleModal) {
    return (
      <>
        <div className="min-h-screen bg-background pb-20 md:pb-8 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="text-muted-foreground">Setting up your profile...</p>
          </div>
        </div>
        <RoleSelectionModal 
          open={true} 
          onOpenChange={setShowRoleModal} 
        />
      </>
    );
  }

  // Show organization dashboard for organizations
  if (isOrganization) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-background pb-20 md:pb-8"
      >
        <div className="container max-w-7xl mx-auto px-4 py-6">
          <OrganizationDashboard />
        </div>
      </motion.div>
    );
  }

  // Artist view with enhanced UI
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-20 md:pb-8"
    >
      <div className="container max-w-7xl mx-auto px-4 py-6 lg:py-8">
        {/* Mobile-only Search Bar - Desktop uses header search */}
        {isMobile && (
          <div className="mb-6">
            <div className="flex gap-2 items-center max-w-2xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search opportunities..."
                  className="pl-10 h-10 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" className="p-2 h-10 w-10">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Enhanced Tabs */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-center mb-4 md:mb-8">
              <TabsList className="grid w-full max-w-md grid-cols-2 bg-muted/30 p-1 rounded-xl h-10 md:h-12">
                <TabsTrigger 
                  value="opportunities" 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-bold data-[state=active]:shadow-md data-[state=active]:border-primary/50 transition-all duration-200 text-sm md:text-base hover:bg-primary/10 py-2 md:py-3 px-2 md:px-3"
                >
                  Browse
                </TabsTrigger>
                <TabsTrigger 
                  value="applications"
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-bold data-[state=active]:shadow-md data-[state=active]:border-primary/50 transition-all duration-200 text-sm md:text-base hover:bg-primary/10 py-2 md:py-3 px-2 md:px-3"
                >
                  Applied
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Enhanced Opportunities Tab */}
            <TabsContent value="opportunities" className="mt-0">
              <AnimatePresence mode="wait">
                {opportunitiesLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                     className="grid gap-3 md:gap-6 grid-cols-1"
                  >
                    {Array.from({ length: 6 }).map((_, i) => (
                      <OpportunitySkeletonCard key={i} />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    {/* Results Counter */}
                    <div className="mb-6 flex items-center justify-end">
                      {filteredOpportunities.length > 0 && (
                        <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                          {filteredOpportunities.filter(opp => !opp.user_applied).length} available
                        </Badge>
                      )}
                    </div>

                    <div className="grid gap-3 md:gap-6 mb-4 md:mb-8 grid-cols-1">
                      <AnimatePresence>
                        {filteredOpportunities.map((opportunity, index) => (
                           <OpportunityCard
                             key={opportunity.id}
                           opportunity={{
                             ...opportunity,
                             user_id: opportunity.user_id,
                             created_at: opportunity.created_at,
                             applications_count: opportunity.applications_count,
                             views_count: opportunity.views_count || 0
                           }}
                           currentUserRole={currentProfile?.role}
                           currentUserId={currentProfile?.user_id}
                           onApply={handleApply}
                           onManageApplicants={handleManageApplicants}
                           />
                        ))}
                      </AnimatePresence>
                    </div>

                    {filteredOpportunities.length === 0 && (
                      <Card className="p-4 md:p-8 text-center bg-card/50 backdrop-blur-sm">
                        <div className="max-w-md mx-auto space-y-3 md:space-y-4">
                          <div className="mx-auto w-12 h-12 md:w-16 md:h-16 bg-muted/50 rounded-full flex items-center justify-center">
                            <Search className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
                          </div>
                          <div>
                            <h3 className="text-lg md:text-xl font-semibold mb-2">No opportunities found</h3>
                            <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                              {searchQuery 
                                ? "Try adjusting your search terms or filters to find more opportunities" 
                                : "New opportunities are posted regularly. Check back soon!"
                              }
                            </p>
                            {searchQuery && (
                              <Button 
                                variant="outline" 
                                onClick={() => setSearchQuery("")}
                                className="mt-2 h-8 md:h-10 px-3 md:px-4 text-xs md:text-sm"
                              >
                                Clear Search
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    )}

                    {/* Enhanced Load More */}
                    {filteredOpportunities.length > 0 && filteredOpportunities.length >= 9 && (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                      >
                        <Button 
                          variant="outline" 
                          size="lg"
                          className="px-4 md:px-8 py-2 md:py-3 h-10 md:h-12 text-sm md:text-base bg-card/50 backdrop-blur-sm border-primary/20 hover:bg-primary/5"
                        >
                          Load More Opportunities
                        </Button>
                      </motion.div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>

            {/* Enhanced Applications Tab */}
            <TabsContent value="applications" className="mt-0">
              <AnimatePresence mode="wait">
                {applicationsLoading ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="grid grid-cols-1 gap-3 md:gap-6"
                  >
                    {Array.from({ length: 6 }).map((_, i) => (
                      <ApplicationSkeletonCard key={i} />
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <div className="mb-6">
                      <p className="text-muted-foreground">
                        <span className="font-semibold text-foreground">{filteredApplications.length}</span> applications
                        {searchQuery && (
                          <span> matching "<span className="font-semibold text-foreground">{searchQuery}</span>"</span>
                        )}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:gap-6 mb-4 md:mb-8">
                      <AnimatePresence>
                        {filteredApplications.map((application, index) => (
                          <motion.div
                            key={application.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                          >
                            <ApplicationCard
                              application={application}
                              onViewOpportunity={handleViewOpportunity}
                              onRemoveApplication={handleRemoveApplication}
                            />
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    {filteredApplications.length === 0 && (
                      <Card className="p-4 md:p-8 text-center bg-card/50 backdrop-blur-sm">
                        <div className="max-w-md mx-auto space-y-3 md:space-y-4">
                          <div className="mx-auto w-12 h-12 md:w-16 md:h-16 bg-muted/50 rounded-full flex items-center justify-center">
                            <Plus className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
                          </div>
                          <div>
                            <h3 className="text-lg md:text-xl font-semibold mb-2">
                              {searchQuery ? "No matching applications" : "No applications yet"}
                            </h3>
                            <p className="text-sm md:text-base text-muted-foreground mb-3 md:mb-4">
                              {searchQuery 
                                ? "Try adjusting your search terms" 
                                : "Start applying to opportunities to see them here"
                              }
                            </p>
                            {!searchQuery && (
                              <Button 
                                onClick={() => setActiveTab("opportunities")}
                                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 h-8 md:h-10 px-3 md:px-4 text-xs md:text-sm"
                              >
                                Browse Opportunities
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Opportunities;
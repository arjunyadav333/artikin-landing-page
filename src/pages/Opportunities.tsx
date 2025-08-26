import { useState, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Search, Filter, SortDesc } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import { ApplicationCard } from "@/components/opportunities/application-card";
import { OpportunitySkeletonCard, ApplicationSkeletonCard } from "@/components/opportunities/skeleton-card";
import { useOpportunities, useApplyToOpportunity } from "@/hooks/useOpportunities";
import { useUserApplications, useDeleteApplication } from "@/hooks/useApplications";
import { useCurrentProfile } from "@/hooks/useProfiles";
import { useToast } from "@/hooks/use-toast";

const Opportunities = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("opportunities");
  
  const { data: currentProfile } = useCurrentProfile();
  const { data: opportunities, isLoading: opportunitiesLoading } = useOpportunities();
  const { data: applications, isLoading: applicationsLoading } = useUserApplications();
  const applyToOpportunity = useApplyToOpportunity();
  const deleteApplication = useDeleteApplication();
  const { toast } = useToast();

  const isArtist = currentProfile?.role === 'artist';
  const isOrganization = currentProfile?.role === 'organization';

  // Filter opportunities based on search query
  const filteredOpportunities = useMemo(() => {
    if (!opportunities) return [];
    if (!searchQuery.trim()) return opportunities;

    const query = searchQuery.toLowerCase();
    return opportunities.filter(opp => 
      opp.title.toLowerCase().includes(query) ||
      opp.description.toLowerCase().includes(query) ||
      (opp.company && opp.company.toLowerCase().includes(query)) ||
      (opp.location && opp.location.toLowerCase().includes(query)) ||
      (opp.tags && opp.tags.some(tag => tag.toLowerCase().includes(query)))
    );
  }, [opportunities, searchQuery]);

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
    // TODO: Navigate to opportunity detail page
    console.log("View opportunity:", opportunityId);
  };

  // Show different layouts based on user role
  if (isOrganization) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-8">
        <div className="container max-w-7xl mx-auto px-4 py-6">
          {/* Organization Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-2">Manage Opportunities</h1>
              <p className="text-muted-foreground">Post and manage your job opportunities</p>
            </div>
            <Button className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70">
              <Plus className="h-4 w-4 mr-2" />
              Post Opportunity
            </Button>
          </div>

          {/* Organization content would go here */}
          <Card className="p-8 text-center">
            <h2 className="text-lg font-semibold mb-2">Organization Dashboard Coming Soon</h2>
            <p className="text-muted-foreground">
              Opportunity management features for organizations are currently in development.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  // Artist view with tabs
  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="container max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Opportunities</h1>
          <p className="text-muted-foreground">Discover and apply to creative opportunities</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search opportunities, companies, locations..."
              className="pl-10 bg-muted/40 border-border/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
            <Button variant="outline" size="sm">
              <SortDesc className="h-4 w-4 mr-2" />
              Sort
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mb-8 bg-muted/30">
            <TabsTrigger 
              value="opportunities" 
              className="data-[state=active]:bg-opportunities-active data-[state=active]:text-opportunities-active-foreground data-[state=active]:font-bold transition-all duration-200"
            >
              Opportunities
            </TabsTrigger>
            <TabsTrigger 
              value="applications"
              className="data-[state=active]:bg-opportunities-active data-[state=active]:text-opportunities-active-foreground data-[state=active]:font-bold transition-all duration-200"
            >
              My Applications
            </TabsTrigger>
          </TabsList>

          {/* Opportunities Tab */}
          <TabsContent value="opportunities" className="mt-0">
            {opportunitiesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <OpportunitySkeletonCard key={i} />
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                  {filteredOpportunities.map((opportunity) => (
                    <OpportunityCard
                      key={opportunity.id}
                      opportunity={opportunity}
                      onApply={handleApply}
                      onSave={(id) => {
                        toast({
                          title: "Feature coming soon",
                          description: "Save functionality will be available in the next update."
                        });
                      }}
                    />
                  ))}
                </div>

                {filteredOpportunities.length === 0 && !opportunitiesLoading && (
                  <Card className="p-8 text-center">
                    <h2 className="text-lg font-semibold mb-2">No opportunities found</h2>
                    <p className="text-muted-foreground">
                      {searchQuery ? "Try adjusting your search terms" : "Check back later for new opportunities"}
                    </p>
                  </Card>
                )}

                {/* Load More */}
                {filteredOpportunities.length > 0 && (
                  <div className="text-center">
                    <Button variant="outline" className="w-full max-w-sm">
                      Load More Opportunities
                    </Button>
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Applications Tab */}
          <TabsContent value="applications" className="mt-0">
            {applicationsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ApplicationSkeletonCard key={i} />
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                  {filteredApplications.map((application) => (
                    <ApplicationCard
                      key={application.id}
                      application={application}
                      onViewOpportunity={handleViewOpportunity}
                      onRemoveApplication={handleRemoveApplication}
                    />
                  ))}
                </div>

                {filteredApplications.length === 0 && !applicationsLoading && (
                  <Card className="p-8 text-center">
                    <h2 className="text-lg font-semibold mb-2">
                      {searchQuery ? "No matching applications" : "No applications yet"}
                    </h2>
                    <p className="text-muted-foreground">
                      {searchQuery 
                        ? "Try adjusting your search terms" 
                        : "Start applying to opportunities to see them here"
                      }
                    </p>
                  </Card>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Opportunities;
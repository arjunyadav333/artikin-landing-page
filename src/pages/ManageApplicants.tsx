import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Clock,
  Check,
  X,
  Users,
  Search,
  Info,
  MessageSquare,
  AlertCircle,
  Lock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useOpportunityApplications, useUpdateApplicationStatus, useDeleteApplication } from "@/hooks/useApplications";
import { useOrganizationOpportunities } from "@/hooks/useOrganizationOpportunities";
import { useCurrentProfile } from "@/hooks/useProfiles";
import { ApplicantDetailsModal } from "@/components/manage-applicants/applicant-details-modal";
import { ApplicantActionsMenu } from "@/components/manage-applicants/applicant-actions-menu";
import type { Application } from "@/hooks/useApplications";

export default function ManageApplicants() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [undoTimeout, setUndoTimeout] = useState<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const { data: currentProfile, isLoading: profileLoading } = useCurrentProfile();
  const { data: opportunities, isLoading: opportunitiesLoading } = useOrganizationOpportunities();
  const { data: applications = [], isLoading: applicationsLoading } = useOpportunityApplications(id || '');
  const updateStatus = useUpdateApplicationStatus();
  const deleteApplication = useDeleteApplication();

  const opportunity = opportunities?.find(opp => opp.id === id);
  const isLoading = profileLoading || opportunitiesLoading;

  // Authorization checks
  useEffect(() => {
    if (!isLoading && currentProfile) {
      // Check if user is an organization
      if (currentProfile.role !== 'organization') {
        toast({
          title: "Access Denied",
          description: "Only organizations can manage applicants.",
          variant: "destructive"
        });
        navigate("/opportunities");
        return;
      }

      // Check if opportunity exists and user owns it
      if (!opportunitiesLoading && opportunities !== undefined && !opportunity) {
        toast({
          title: "Access Denied", 
          description: "You don't have permission to manage applicants for this opportunity.",
          variant: "destructive"
        });
        navigate("/opportunities");
        return;
      }
    }
  }, [currentProfile, opportunity, opportunities, opportunitiesLoading, isLoading, navigate, toast]);

  const handleBack = () => {
    navigate("/opportunities");
  };

  const handleAccept = async (applicationId: string) => {
    try {
      await updateStatus.mutateAsync({ applicationId, status: 'accepted' });
      showUndoToast("Application accepted", () => handleRevoke(applicationId));
    } catch (error) {
      console.error('Failed to accept application:', error);
    }
  };

  const handleReject = async (applicationId: string) => {
    try {
      await updateStatus.mutateAsync({ applicationId, status: 'rejected' });
      showUndoToast("Application rejected", () => handleRevoke(applicationId));
    } catch (error) {
      console.error('Failed to reject application:', error);
    }
  };

  const handleRevoke = async (applicationId: string) => {
    try {
      await updateStatus.mutateAsync({ applicationId, status: 'pending' });
      toast({
        title: "Status reverted",
        description: "Application status has been reset to pending."
      });
    } catch (error) {
      console.error('Failed to revoke status:', error);
    }
  };

  const handleRemove = async (applicationId: string) => {
    try {
      await deleteApplication.mutateAsync(applicationId);
    } catch (error) {
      console.error('Failed to remove application:', error);
    }
  };

  const handleViewProfile = (userId: string) => {
    navigate(`/profile/${userId}`);
  };

  const handleMessage = (userId: string) => {
    // Navigate to messaging - implement based on your messaging routes
    navigate(`/messages?user=${userId}`);
  };

  const showUndoToast = (message: string, undoFn: () => void) => {
    if (undoTimeout) {
      clearTimeout(undoTimeout);
    }

    const { dismiss } = toast({
      title: message,
      description: "Undo within 5 seconds",
      action: (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            undoFn();
            dismiss();
            if (undoTimeout) clearTimeout(undoTimeout);
          }}
        >
          Undo
        </Button>
      ),
      duration: 5000
    });

    const timeout = setTimeout(() => {
      dismiss();
    }, 5000);
    
    setUndoTimeout(timeout);
  };

  const filteredApplications = applications.filter(app => {
    // Filter by tab
    const matchesTab = activeTab === "all" || app.status === activeTab;
    
    // Filter by search
    const matchesSearch = !searchQuery || 
      app.profiles?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.profiles?.username?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesTab && matchesSearch;
  });

  const stats = {
    total: applications.length,
    pending: applications.filter(app => app.status === 'pending').length,
    accepted: applications.filter(app => app.status === 'accepted').length,
    rejected: applications.filter(app => app.status === 'rejected').length,
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Authorization error state
  if (!currentProfile || currentProfile.role !== 'organization') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Lock className="h-12 w-12 text-muted-foreground mx-auto" />
          <h3 className="text-lg font-medium">Access Denied</h3>
          <p className="text-muted-foreground">Only organizations can manage applicants.</p>
          <Button onClick={() => navigate("/opportunities")}>
            Back to Opportunities
          </Button>
        </div>
      </div>
    );
  }

  // Opportunity not found error state
  if (!opportunity) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <h3 className="text-lg font-medium">Opportunity Not Found</h3>
          <p className="text-muted-foreground">
            You don't have permission to manage applicants for this opportunity.
          </p>
          <Button onClick={() => navigate("/opportunities")}>
            Back to Opportunities
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-screen bg-background w-full"
      >
        {/* Header */}
        <div className="w-full border-b bg-background/95 backdrop-blur sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
            <Button 
              variant="ghost" 
              onClick={handleBack}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Button>
            
            {opportunity && (
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <h1 className="text-lg font-semibold text-foreground truncate max-w-48 sm:max-w-none">
                    {opportunity.title}
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    {opportunity.organization_name} • {opportunity.location}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search applicants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="accepted">Accepted ({stats.accepted})</TabsTrigger>
              <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
            </TabsList>

            {/* Tab Content */}
            {['all', 'accepted', 'rejected'].map(tab => (
              <TabsContent key={tab} value={tab}>
                {filteredApplications.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      {tab === 'all' ? 'No applicants yet' : 
                       tab === 'accepted' ? 'No accepted applicants' : 
                       'No rejected applicants'}
                    </h3>
                    <p className="text-muted-foreground">
                      {tab === 'all' ? 'Applications will appear here when submitted.' : 
                       `No applicants have been ${tab} yet.`}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredApplications.map((application) => {
                      const profile = application.profiles;
                      return (
                        <div key={application.id} className="w-full p-4 border rounded-lg hover:shadow-sm transition-shadow bg-background">
                          <div className="flex items-center gap-4">
                            {/* Avatar */}
                            <Avatar 
                              className="h-12 w-12 sm:h-16 sm:w-16 cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => profile?.id && handleViewProfile(profile.id)}
                            >
                              <AvatarImage src={profile?.avatar_url} />
                              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                                {(profile?.display_name || profile?.username || 'U')
                                  .split(' ')
                                  .map(n => n[0])
                                  .join('')
                                  .toUpperCase()
                                  .slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                  {/* Name */}
                                  <button
                                    onClick={() => profile?.id && handleViewProfile(profile.id)}
                                    className="font-semibold text-foreground hover:text-primary transition-colors text-left"
                                  >
                                    {profile?.display_name || profile?.username || 'Unknown User'}
                                  </button>
                                  {/* Username */}
                                  <button
                                    onClick={() => profile?.id && handleViewProfile(profile.id)} 
                                    className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                                  >
                                    @{profile?.username || 'unknown'}
                                  </button>
                                  
                                  {/* Metadata badges */}
                                  <div className="flex flex-wrap items-center gap-2 mt-1">
                                    {profile?.artform && (
                                      <Badge variant="secondary" className="text-xs">
                                        {profile.artform}
                                      </Badge>
                                    )}
                                    {profile?.location && (
                                      <Badge variant="outline" className="text-xs">
                                        {profile.location}
                                      </Badge>
                                    )}
                                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <Clock className="h-3 w-3" />
                                      Applied {formatDistanceToNow(new Date(application.created_at), { addSuffix: true })}
                                    </div>
                                  </div>
                                </div>

                                {/* Desktop Actions */}
                                <div className="hidden sm:flex items-center gap-2">
                                  {application.status === 'pending' && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleAccept(application.id)}
                                      disabled={updateStatus.isPending}
                                      className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                      title="Accept"
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => setSelectedApplication(application)}
                                    className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                    title="View details"
                                  >
                                    <Info className="h-4 w-4" />
                                  </Button>
                                  <ApplicantActionsMenu
                                    application={application}
                                    onViewProfile={handleViewProfile}
                                    onMessage={handleMessage}
                                    onAccept={handleAccept}
                                    onReject={handleReject}
                                    onRevoke={handleRevoke}
                                    onRemove={handleRemove}
                                    disabled={updateStatus.isPending || deleteApplication.isPending}
                                  />
                                </div>
                              </div>

                              {/* Status for Accepted/Rejected */}
                              {application.status !== 'pending' && (
                                <div className="mt-2">
                                  <Badge 
                                    variant={application.status === 'accepted' ? 'default' : 'destructive'}
                                    className="text-xs"
                                  >
                                    {application.status === 'accepted' ? 'Accepted' : 'Rejected'}
                                  </Badge>
                                  {application.status === 'accepted' && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => profile?.id && handleMessage(profile.id)}
                                      className="ml-2 h-7 text-xs"
                                    >
                                      <MessageSquare className="h-3 w-3 mr-1" />
                                      Message
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Mobile Actions */}
                            <div className="sm:hidden flex flex-col gap-2">
                              {application.status === 'pending' && (
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleReject(application.id)}
                                    disabled={updateStatus.isPending}
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleAccept(application.id)}
                                    disabled={updateStatus.isPending}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                </div>
                              )}
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedApplication(application)}
                                  className="flex-1"
                                >
                                  <Info className="h-4 w-4" />
                                </Button>
                                <ApplicantActionsMenu
                                  application={application}
                                  onViewProfile={handleViewProfile}
                                  onMessage={handleMessage}
                                  onAccept={handleAccept}
                                  onReject={handleReject}
                                  onRevoke={handleRevoke}
                                  onRemove={handleRemove}
                                  disabled={updateStatus.isPending || deleteApplication.isPending}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </motion.div>

      {/* Application Details Modal */}
      <ApplicantDetailsModal
        application={selectedApplication}
        isOpen={!!selectedApplication}
        onClose={() => setSelectedApplication(null)}
        onViewProfile={handleViewProfile}
      />
    </>
  );
}
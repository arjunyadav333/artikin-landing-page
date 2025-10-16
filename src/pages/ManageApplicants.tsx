import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Users,
  Search,
  MessageSquare,
  AlertCircle,
  Lock,
  MoreVertical
} from "lucide-react";
import { useOpportunityApplications, useUpdateApplicationStatus, useDeleteApplication } from "@/hooks/useApplications";
import { useOrganizationOpportunities } from "@/hooks/useOrganizationOpportunities";
import { useCurrentProfile } from "@/hooks/useProfiles";
import { useHasRole } from "@/hooks/useUserRoles";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDirectMessage } from '@/hooks/useDirectMessage';
import { cn } from '@/lib/utils';
import type { Application } from "@/hooks/useApplications";

export default function ManageApplicants() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { startDirectMessage } = useDirectMessage();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: currentProfile, isLoading: profileLoading } = useCurrentProfile();
  const { hasRole: isOrganization, isLoading: roleLoading } = useHasRole('organization');
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
      // Remove toast messages as requested by user
    } catch (error) {
      console.error('Failed to accept application:', error);
      // Keep error toasts for actual failures
      toast({
        title: "Action failed",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleReject = async (applicationId: string) => {
    try {
      await updateStatus.mutateAsync({ applicationId, status: 'rejected' });
      // Remove toast messages as requested by user
    } catch (error) {
      console.error('Failed to reject application:', error);
      // Keep error toasts for actual failures
      toast({
        title: "Action failed",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRevoke = async (applicationId: string) => {
    try {
      await updateStatus.mutateAsync({ applicationId, status: 'pending' });
      // Remove toast messages as requested by user
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
    startDirectMessage(userId);
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
  if (!currentProfile || roleLoading || !isOrganization) {
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background w-full"
    >
      {/* Header */}
      <div className="w-full border-b bg-background/95 backdrop-blur sticky top-0 z-40">
        <div className="flex items-center gap-4 px-4 sm:px-6 lg:px-8 py-4">
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
              <div>
                <h1 className="text-lg font-semibold text-foreground">
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
                <div className="space-y-3" role="list">
                  {filteredApplications.map((application) => {
                    const profile = application.profiles;
                    const fullname = profile?.display_name || profile?.full_name || 'Unknown User';
                    const username = profile?.username || 'unknown';
                    const initials = fullname.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                    
                    return (
                      <div 
                        key={application.id} 
                        className="min-h-16 p-3 lg:p-4 border border-[#E6E9EE] rounded-[10px] bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)] flex items-center justify-between"
                        role="listitem"
                      >
                        {/* Left group - Avatar + Text */}
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 lg:h-12 lg:w-12">
                            <AvatarImage 
                              src={profile?.avatar_url} 
                              alt={`${fullname} avatar`}
                              className="object-cover"
                            />
                            <AvatarFallback className="bg-[#F3F4F6] text-[#374151] font-semibold text-sm">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          
                          <div>
                            <div 
                              className="text-[15px] font-semibold text-[#111827] leading-[1.2] cursor-pointer hover:text-[#2563EB] transition-colors"
                              onClick={() => application.user_id && handleViewProfile(application.user_id)}
                              tabIndex={0}
                              role="button"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  application.user_id && handleViewProfile(application.user_id);
                                }
                              }}
                              aria-label={`View profile of ${fullname}`}
                            >
                              {fullname}
                            </div>
                            <div 
                              className="text-[13px] font-medium text-[#6B7280] leading-[1.1] mt-1 cursor-pointer hover:text-[#2563EB] transition-colors"
                              onClick={() => application.user_id && handleViewProfile(application.user_id)}
                              tabIndex={0}
                              role="button"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                  e.preventDefault();
                                  application.user_id && handleViewProfile(application.user_id);
                                }
                              }}
                            >
                              @{username}
                            </div>
                          </div>
                        </div>

                        {/* Right group - Controls */}
                        <div className="flex items-center gap-2">
                          {/* All tab - Accept/Reject buttons */}
                          {tab === 'all' && application.status === 'pending' && (
                            <>
                              <Button
                                onClick={() => handleAccept(application.id)}
                                disabled={updateStatus.isPending}
                                className="h-8 px-2.5 text-xs font-medium bg-[#16A34A] hover:bg-[#15803D] text-white rounded-lg"
                                aria-label={`Accept ${fullname}`}
                              >
                                Accept
                              </Button>
                              <Button
                                onClick={() => handleReject(application.id)}
                                disabled={updateStatus.isPending}
                                variant="outline"
                                className="h-8 px-2.5 text-xs font-medium border border-[#FCA5A5] text-[#DC2626] hover:bg-[#FEF2F2] rounded-lg"
                                aria-label={`Reject ${fullname}`}
                              >
                                Reject
                              </Button>
                            </>
                          )}

                          {/* Accepted tab - Status pill + Message button */}
                          {(tab === 'accepted' || (tab === 'all' && application.status === 'accepted')) && application.status === 'accepted' && (
                            <>
                              <div className="inline-flex items-center h-7 px-2.5 bg-[#ECFDF5] text-[#16A34A] text-[13px] font-semibold rounded-full">
                                Accepted
                              </div>
                              <Button
                                onClick={() => application.user_id && handleMessage(application.user_id)}
                                variant="outline"
                                className="h-8 px-2.5 text-xs font-medium border border-[#E5E7EB] text-[#111827] hover:bg-[#F9FAFB] rounded-lg"
                                aria-label={`Message ${fullname}`}
                              >
                                Message
                              </Button>
                            </>
                          )}

                          {/* Rejected tab - Status pill + Message button */}
                          {(tab === 'rejected' || (tab === 'all' && application.status === 'rejected')) && application.status === 'rejected' && (
                            <>
                              <div className="inline-flex items-center h-7 px-2.5 bg-[#FEF2F2] text-[#DC2626] text-[13px] font-semibold rounded-full">
                                Rejected
                              </div>
                              <Button
                                onClick={() => application.user_id && handleMessage(application.user_id)}
                                variant="outline"
                                className="h-8 px-2.5 text-xs font-medium border border-[#E5E7EB] text-[#111827] hover:bg-[#F9FAFB] rounded-lg"
                                aria-label={`Message ${fullname}`}
                              >
                                Message
                              </Button>
                            </>
                          )}

                          {/* Three-dots menu */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-5 rounded-full"
                                aria-label={`More options for ${fullname}`}
                              >
                                <MoreVertical className="h-3.5 w-3.5" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" role="menu">
                              <DropdownMenuItem 
                                onClick={() => application.user_id && handleViewProfile(application.user_id)}
                              >
                                View Profile
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => application.user_id && handleMessage(application.user_id)}
                              >
                                Message
                              </DropdownMenuItem>
                              {application.status === 'accepted' && (
                                <DropdownMenuItem 
                                  onClick={() => handleRevoke(application.id)}
                                  disabled={updateStatus.isPending}
                                >
                                  Revoke Accept
                                </DropdownMenuItem>
                              )}
                              {application.status === 'rejected' && (
                                <DropdownMenuItem 
                                  onClick={() => handleRevoke(application.id)}
                                  disabled={updateStatus.isPending}
                                >
                                  Revoke Reject
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                onClick={() => handleRemove(application.id)}
                                disabled={deleteApplication.isPending}
                                className="text-red-600"
                              >
                                Remove
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
  );
}
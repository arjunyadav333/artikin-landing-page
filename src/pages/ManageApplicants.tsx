import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  User,
  Clock,
  Check,
  X,
  Users,
  Search,
  MoreVertical,
  MessageSquare,
  Download
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useOpportunityApplications, useUpdateApplicationStatus } from "@/hooks/useApplications";
import { useOrganizationOpportunities } from "@/hooks/useOrganizationOpportunities";

export default function ManageApplicants() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const { data: opportunities } = useOrganizationOpportunities();
  const { data: applications = [], isLoading } = useOpportunityApplications(id || '');
  const updateStatus = useUpdateApplicationStatus();

  const opportunity = opportunities?.find(opp => opp.id === id);

  const handleBack = () => {
    navigate("/opportunities");
  };

  const handleAccept = async (applicationId: string) => {
    try {
      await updateStatus.mutateAsync({ applicationId, status: 'accepted' });
      toast({
        title: "Application accepted",
        description: "The applicant has been notified of their acceptance."
      });
    } catch (error) {
      console.error('Failed to accept application:', error);
    }
  };

  const handleReject = async (applicationId: string) => {
    try {
      await updateStatus.mutateAsync({ applicationId, status: 'rejected' });
      toast({
        title: "Application rejected", 
        description: "The applicant has been notified of the decision."
      });
    } catch (error) {
      console.error('Failed to reject application:', error);
    }
  };

  const handleViewProfile = (userId: string) => {
    // Navigate to user profile - you can implement this route as needed
    navigate(`/profile/${userId}`);
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

  if (!opportunity) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">Loading opportunity...</p>
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
      {/* Full-width header */}
      <div className="w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
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
                <h1 className="text-sm font-medium text-foreground truncate max-w-48 sm:max-w-none">
                  {opportunity.title}
                </h1>
                <p className="text-xs text-muted-foreground">{opportunity.organization_name}</p>
              </div>
              {opportunity.image_url && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={opportunity.image_url} />
                  <AvatarFallback className="text-xs">
                    {opportunity.organization_name?.charAt(0) || 'O'}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Search bar */}
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

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 sm:grid-cols-3 max-w-md">
            <TabsTrigger value="all" className="text-xs sm:text-sm">All ({stats.total})</TabsTrigger>
            <TabsTrigger value="accepted" className="text-xs sm:text-sm">Accepted ({stats.accepted})</TabsTrigger>
            <TabsTrigger value="rejected" className="text-xs sm:text-sm">Rejected ({stats.rejected})</TabsTrigger>
          </TabsList>

          {['all', 'accepted', 'rejected'].map(tab => (
            <TabsContent key={tab} value={tab}>
              {filteredApplications.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No applications</h3>
                    <p className="text-muted-foreground">
                      {tab === 'all' ? 'No applications yet.' : `No ${tab} applications.`}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-3">
                  {filteredApplications.map((application) => (
                    <Card key={application.id} className="hover:shadow-md transition-all duration-200">
                      <CardContent className="p-4 sm:p-6">
                        <div className="flex items-start gap-3 sm:gap-4">
                          {/* Avatar */}
                          <Avatar 
                            className="h-10 w-10 sm:h-12 sm:w-12 cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => application.profiles?.id && handleViewProfile(application.profiles.id)}
                          >
                            <AvatarImage src={application.profiles?.avatar_url} />
                            <AvatarFallback className="bg-primary/10 text-primary font-medium">
                              {(application.profiles?.display_name || application.profiles?.username || 'U')
                                .split(' ')
                                .map(n => n[0])
                                .join('')
                                .toUpperCase()
                                .slice(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          
                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            {/* Name & Status Row */}
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="min-w-0 flex-1">
                                <button
                                  onClick={() => application.profiles?.id && handleViewProfile(application.profiles.id)}
                                  className="font-medium text-foreground hover:text-primary transition-colors text-left truncate block"
                                >
                                  {application.profiles?.display_name || application.profiles?.username || 'Unknown User'}
                                </button>
                                <p className="text-xs sm:text-sm text-muted-foreground">
                                  @{application.profiles?.username || 'unknown'}
                                </p>
                              </div>
                              
                              {/* Actions for desktop */}
                              <div className="hidden sm:flex items-center gap-2">
                                {(activeTab === 'all' || application.status === 'pending') && (
                                  <>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleAccept(application.id)}
                                      disabled={updateStatus.isPending || application.status !== 'pending'}
                                      className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                      aria-label="Accept application"
                                    >
                                      <Check className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleReject(application.id)}
                                      disabled={updateStatus.isPending || application.status !== 'pending'}
                                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                      aria-label="Reject application"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                  aria-label="More options"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            
                            {/* Status & Time */}
                            <div className="flex items-center gap-2 mb-2 text-xs sm:text-sm text-muted-foreground">
                              <Badge 
                                variant={
                                  application.status === 'accepted' ? 'default' :
                                  application.status === 'rejected' ? 'destructive' :
                                  'secondary'
                                }
                                className="text-xs"
                              >
                                {application.status}
                              </Badge>
                              <Clock className="h-3 w-3" />
                              <span>Applied {formatDistanceToNow(new Date(application.created_at), { addSuffix: true })}</span>
                            </div>
                            
                            {/* Cover Letter Preview */}
                            {application.cover_letter && (
                              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 bg-muted/50 p-2 rounded">
                                {application.cover_letter}
                              </p>
                            )}
                            
                            {/* Mobile Actions */}
                            <div className="sm:hidden flex items-center justify-end gap-2 mt-3">
                              {(activeTab === 'all' || application.status === 'pending') && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleReject(application.id)}
                                    disabled={updateStatus.isPending || application.status !== 'pending'}
                                    className="text-red-600 border-red-200 hover:bg-red-50 min-h-[44px]"
                                  >
                                    <X className="h-4 w-4 mr-1" />
                                    Reject
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleAccept(application.id)}
                                    disabled={updateStatus.isPending || application.status !== 'pending'}
                                    className="bg-green-600 hover:bg-green-700 min-h-[44px]"
                                  >
                                    <Check className="h-4 w-4 mr-1" />
                                    Accept
                                  </Button>
                                </>
                              )}
                              {application.status !== 'pending' && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="min-h-[44px]"
                                >
                                  <MessageSquare className="h-4 w-4 mr-1" />
                                  Message
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </motion.div>
  );
}
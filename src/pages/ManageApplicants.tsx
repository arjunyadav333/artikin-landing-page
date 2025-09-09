import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  User,
  Clock,
  Check,
  X,
  Users
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useOpportunityApplications, useUpdateApplicationStatus } from "@/hooks/useApplications";
import { useOrganizationOpportunities } from "@/hooks/useOrganizationOpportunities";

export default function ManageApplicants() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("all");

  const { data: opportunities } = useOrganizationOpportunities();
  const { data: applications = [], isLoading } = useOpportunityApplications(id || '');
  const updateStatus = useUpdateApplicationStatus();

  const opportunity = opportunities?.find(opp => opp.id === id);

  const handleBack = () => {
    navigate("/opportunities");
  };

  const handleAccept = async (applicationId: string) => {
    await updateStatus.mutateAsync({ applicationId, status: 'accepted' });
  };

  const handleReject = async (applicationId: string) => {
    await updateStatus.mutateAsync({ applicationId, status: 'rejected' });
  };

  const filteredApplications = applications.filter(app => {
    if (activeTab === "all") return true;
    return app.status === activeTab;
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
      className="min-h-screen bg-background pb-20 md:pb-8"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Opportunities</span>
          </Button>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">{opportunity.title}</CardTitle>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span>{stats.total} total applications</span>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
            <TabsTrigger value="accepted">Accepted ({stats.accepted})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({stats.rejected})</TabsTrigger>
          </TabsList>

          {['all', 'pending', 'accepted', 'rejected'].map(tab => (
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
                <div className="space-y-4">
                  {filteredApplications.map((application) => (
                    <Card key={application.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4 flex-1">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={application.profiles?.avatar_url} />
                              <AvatarFallback>
                                <User className="h-6 w-6" />
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-medium text-foreground">
                                  {application.profiles?.display_name || application.profiles?.username}
                                </h3>
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
                              </div>
                              
                              <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                                <Clock className="h-3 w-3" />
                                <span>Applied {formatDistanceToNow(new Date(application.created_at), { addSuffix: true })}</span>
                              </div>
                              
                              {application.cover_letter && (
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {application.cover_letter}
                                </p>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            {application.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleReject(application.id)}
                                  disabled={updateStatus.isPending}
                                  className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Reject
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleAccept(application.id)}
                                  disabled={updateStatus.isPending}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Check className="h-4 w-4 mr-1" />
                                  Accept
                                </Button>
                              </>
                            )}
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
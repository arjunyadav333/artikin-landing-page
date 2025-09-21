import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter 
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  Search, 
  Check, 
  X, 
  Eye, 
  MessageSquare, 
  Filter,
  Clock,
  Star,
  MapPin,
  Calendar
} from "lucide-react";
import { useOpportunityApplications, useUpdateApplicationStatus } from "@/hooks/useApplications";
import { Application } from "@/hooks/useApplications";
import { formatDistanceToNow } from "date-fns";
import { useDirectMessage } from "@/hooks/useDirectMessage";

interface ApplicantManagementProps {
  opportunityId: string;
  opportunityTitle: string;
}

export function ApplicantManagement({ opportunityId, opportunityTitle }: ApplicantManagementProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedApplicant, setSelectedApplicant] = useState<Application | null>(null);
  
  const { data: applications, isLoading } = useOpportunityApplications(opportunityId);
  const updateStatus = useUpdateApplicationStatus();
  const { startDirectMessage, isLoading: messageLoading } = useDirectMessage();

  const filteredApplications = applications?.filter(app => {
    const matchesSearch = !searchQuery || 
      app.profiles?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.profiles?.artform?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || app.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  const handleStatusUpdate = async (applicationId: string, status: 'accepted' | 'rejected') => {
    await updateStatus.mutateAsync({ applicationId, status });
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      accepted: "bg-green-500/10 text-green-600 border-green-500/20", 
      rejected: "bg-red-500/10 text-red-600 border-red-500/20"
    };
    return colors[status as keyof typeof colors] || "bg-muted text-muted-foreground";
  };

  const getArtformColor = (artform?: string) => {
    const colors = {
      actor: "bg-purple-100 text-purple-700",
      dancer: "bg-pink-100 text-pink-700",
      singer: "bg-blue-100 text-blue-700",
      model: "bg-green-100 text-green-700",
      photographer: "bg-orange-100 text-orange-700",
      videographer: "bg-indigo-100 text-indigo-700",
      instrumentalist: "bg-yellow-100 text-yellow-700",
      drawing: "bg-red-100 text-red-700",
      painting: "bg-teal-100 text-teal-700"
    };
    return colors[artform as keyof typeof colors] || "bg-gray-100 text-gray-700";
  };

  if (isLoading) {
    return (
      <Card className="h-96 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-48 mx-auto"></div>
            <div className="h-4 bg-muted rounded w-32 mx-auto"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-semibold text-lg">Applicants</h3>
              <p className="text-sm text-muted-foreground">{filteredApplications.length} total applications</p>
            </div>
          </div>
          <Badge variant="secondary" className="px-3 py-1">
            {opportunityTitle}
          </Badge>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-2 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search applicants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm bg-background"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3 max-h-96 overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {filteredApplications.map((application) => (
            <motion.div
              key={application.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <Avatar className="h-10 w-10 flex-shrink-0">
                      <AvatarImage 
                        src={application.profiles?.avatar_url || ""} 
                        alt={application.profiles?.display_name || "Applicant"} 
                      />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm font-medium">
                        {(application.profiles?.display_name || "UN")
                          .split(' ')
                          .map(n => n[0])
                          .join('')
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0 space-y-2">
                      <div>
                        <h4 className="font-semibold text-foreground truncate">
                          {application.profiles?.display_name || "Unknown Artist"}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          @{application.profiles?.username || "unknown"}
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        {application.profiles?.artform && (
                          <Badge 
                            variant="secondary" 
                            className={`${getArtformColor(application.profiles.artform)} border-0`}
                          >
                            {application.profiles.artform}
                          </Badge>
                        )}
                        <Badge 
                          variant="outline" 
                          className={`${getStatusColor(application.status)} font-medium`}
                        >
                          {application.status}
                        </Badge>
                        <div className="flex items-center text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDistanceToNow(new Date(application.created_at))} ago
                        </div>
                      </div>
                      
                      {application.cover_letter && (
                        <p className="text-xs text-muted-foreground line-clamp-2 bg-muted/50 p-2 rounded">
                          {application.cover_letter}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {application.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatusUpdate(application.id, 'accepted')}
                          className="text-green-600 hover:text-green-700 hover:bg-green-50 h-8 w-8 p-0"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleStatusUpdate(application.id, 'rejected')}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 w-8 p-0"
                          onClick={() => setSelectedApplicant(application)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Applicant Profile</DialogTitle>
                        </DialogHeader>
                        {selectedApplicant && (
                          <div className="space-y-4">
                            <div className="flex items-start gap-4">
                              <Avatar className="h-16 w-16">
                                <AvatarImage 
                                  src={selectedApplicant.profiles?.avatar_url || ""} 
                                  alt={selectedApplicant.profiles?.display_name || "Applicant"} 
                                />
                                <AvatarFallback className="bg-primary/10 text-primary text-lg font-medium">
                                  {(selectedApplicant.profiles?.display_name || "UN")
                                    .split(' ')
                                    .map(n => n[0])
                                    .join('')
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="space-y-2">
                                <h3 className="text-xl font-semibold">
                                  {selectedApplicant.profiles?.display_name || "Unknown Artist"}
                                </h3>
                                <p className="text-muted-foreground">
                                  @{selectedApplicant.profiles?.username || "unknown"}
                                </p>
                                <div className="flex gap-2">
                                  {selectedApplicant.profiles?.artform && (
                                    <Badge className={getArtformColor(selectedApplicant.profiles.artform)}>
                                      {selectedApplicant.profiles.artform}
                                    </Badge>
                                  )}
                                  <Badge 
                                    variant="outline" 
                                    className={getStatusColor(selectedApplicant.status)}
                                  >
                                    {selectedApplicant.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            
                            {selectedApplicant.cover_letter && (
                              <div className="bg-muted/50 p-4 rounded-lg">
                                <h4 className="font-medium mb-2">Cover Letter</h4>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                  {selectedApplicant.cover_letter}
                                </p>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              Applied {formatDistanceToNow(new Date(selectedApplicant.created_at))} ago
                            </div>
                          </div>
                        )}
                        <DialogFooter>
                          {selectedApplicant?.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  if (selectedApplicant) {
                                    handleStatusUpdate(selectedApplicant.id, 'rejected');
                                  }
                                }}
                                className="text-red-600 border-red-200 hover:bg-red-50"
                              >
                                <X className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                              <Button
                                onClick={() => {
                                  if (selectedApplicant) {
                                    handleStatusUpdate(selectedApplicant.id, 'accepted');
                                  }
                                }}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Accept
                              </Button>
                            </div>
                          )}
                          <Button 
                            variant="outline"
                            onClick={() => selectedApplicant?.user_id && startDirectMessage(selectedApplicant.user_id)}
                            disabled={!selectedApplicant?.user_id || messageLoading(selectedApplicant?.user_id || '')}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            {messageLoading(selectedApplicant?.user_id || '') ? 'Loading...' : 'Message Artist'}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredApplications.length === 0 && (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="font-medium mb-2">No applicants found</h4>
            <p className="text-sm text-muted-foreground">
              {searchQuery || statusFilter !== "all" 
                ? "Try adjusting your search or filter criteria" 
                : "Applications will appear here once artists start applying"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
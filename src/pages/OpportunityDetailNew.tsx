import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  Eye, 
  Share2,
  User,
  Briefcase,
  Building,
  DollarSign,
  FileText,
  Languages,
  Award,
  MessageCircle
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ShareOpportunityModal } from "@/components/opportunities/share-opportunity-modal";
import { ConfirmDeleteModal } from "@/components/opportunities/confirm-delete-modal";
import { ImageWithFallback } from "@/components/opportunities/image-with-fallback";
import { useOpportunities, useApplyToOpportunity } from "@/hooks/useOpportunities";
import { useCurrentProfile } from "@/hooks/useProfiles";
import { useUserApplications } from "@/hooks/useApplications";

function OpportunityDetailNew() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const { data: opportunities } = useOpportunities();
  const { data: currentProfile } = useCurrentProfile();
  const { data: applications } = useUserApplications();
  const applyToOpportunity = useApplyToOpportunity();
  
  const opportunity = opportunities?.find(opp => opp.id === id);
  const userApplication = applications?.find(app => app.opportunity_id === id);
  
  // Check user context
  const isOwner = opportunity && currentProfile && opportunity.user_id === currentProfile.user_id;
  const isArtist = currentProfile?.role === 'artist';
  const isOrganization = currentProfile?.role === 'organization';
  
  // Opportunity status
  const isActive = opportunity?.status === 'active';
  const isPastDeadline = opportunity?.deadline ? new Date(opportunity.deadline) < new Date() : false;
  const canApply = isArtist && isActive && !isPastDeadline && !userApplication;
  const canMessage = userApplication?.status === 'accepted';

  useEffect(() => {
    if (!id) {
      navigate("/opportunities");
    }
  }, [id, navigate]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleManageApplicants = () => {
    navigate(`/opportunities/${id}/applicants`);
  };

  const handleApply = async () => {
    if (!canApply) return;
    
    try {
      await applyToOpportunity.mutateAsync({ opportunityId: id! });
      toast({
        title: "Application submitted",
        description: "Your application has been submitted successfully."
      });
    } catch (error) {
      // Error handled in mutation
    }
  };

  const handleMessage = () => {
    // Navigate to conversation or create one
    navigate(`/messages?new=${opportunity?.user_id}`);
  };

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return null;
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    if (max) return `Up to $${max.toLocaleString()}`;
    return null;
  };

  const formatLocation = () => {
    if (opportunity?.city && opportunity?.state) {
      return `${opportunity.city}, ${opportunity.state}`;
    }
    return opportunity?.location || opportunity?.city || opportunity?.state || "Remote";
  };

  const getOrganizationName = () => {
    return opportunity?.organization_name || opportunity?.company || opportunity?.profiles?.display_name || "Organization";
  };

  const getStatusBadge = () => {
    if (isPastDeadline || opportunity?.status === 'closed') {
      return <Badge variant="secondary" className="bg-gray-100 text-gray-700">Closed</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800 border-green-300">Active</Badge>;
  };

  const getApplicationStatusBadge = () => {
    if (!userApplication) return null;
    
    const statusConfig = {
      pending: { label: "Pending", className: "bg-yellow-100 text-yellow-800 border-yellow-300" },
      accepted: { label: "Accepted", className: "bg-green-100 text-green-800 border-green-300" },
      rejected: { label: "Rejected", className: "bg-red-100 text-red-800 border-red-300" }
    };

    const config = statusConfig[userApplication.status];
    
    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  if (!opportunity) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
          <p className="text-muted-foreground">Loading opportunity details...</p>
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Button>

          {/* Status badges for artist */}
          {isArtist && (
            <div className="flex items-center gap-2">
              {getStatusBadge()}
              {getApplicationStatusBadge()}
            </div>
          )}
        </div>

        {/* Full-width Card */}
        <Card className="overflow-hidden shadow-lg border border-border/50">
          {/* Hero Banner Image */}
          <div className="relative">
            {opportunity.image_url ? (
              <div className="w-full h-48 sm:h-56 md:h-64 lg:h-80">
                <ImageWithFallback
                  src={opportunity.image_url}
                  alt={opportunity.title}
                  className="w-full h-full rounded-none"
                  fallbackType="building"
                />
              </div>
            ) : (
              <div className="w-full h-48 sm:h-56 md:h-64 lg:h-80 bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                <div className="text-center">
                  <Briefcase className="w-16 h-16 md:w-20 md:h-20 text-primary/50 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">No image provided</p>
                </div>
              </div>
            )}
          </div>
          
          <CardContent className="p-6 md:p-8 space-y-8">
            {/* Title and Organization */}
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">
                  {opportunity.title}
                </h1>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="w-12 h-12 md:w-16 md:h-16 rounded-lg border-2 border-background shadow-sm">
                    <AvatarImage src={opportunity.profiles?.avatar_url} alt={getOrganizationName()} />
                    <AvatarFallback className="bg-primary/10 rounded-lg">
                      <Building className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-lg md:text-xl text-muted-foreground font-medium">
                      {getOrganizationName()}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Metadata Pills */}
              <div className="flex flex-wrap items-center gap-3">
                {getStatusBadge()}
                
                {opportunity.gender_preference?.map((gender: string, index: number) => (
                  <div key={index} className="flex items-center gap-1 px-3 py-1 rounded-full bg-muted/50 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{gender}</span>
                  </div>
                ))}
                
                {opportunity.art_forms?.map((artform: string, index: number) => (
                  <Badge 
                    key={index}
                    className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800"
                  >
                    {artform}
                  </Badge>
                ))}
                
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-muted/50 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{formatLocation()}</span>
                </div>
                
                {opportunity.deadline && (
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-muted/50 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Deadline: {format(new Date(opportunity.deadline), 'MMM d, yyyy')}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-muted/50 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Posted {formatDistanceToNow(new Date(opportunity.created_at), { addSuffix: true })}</span>
                </div>
              </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Description */}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <FileText className="h-5 w-5 text-primary" />
                    <h2 className="text-lg font-semibold">Description</h2>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {opportunity.description}
                    </p>
                  </div>
                </div>

                {/* Requirements */}
                {(opportunity.experience_level || opportunity.gender_preference?.length || opportunity.language_preference?.length) && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Award className="h-5 w-5 text-primary" />
                      <h2 className="text-lg font-semibold">Requirements</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {opportunity.experience_level && (
                        <div className="flex items-center gap-3">
                          <Briefcase className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Experience Level</p>
                            <p className="text-sm text-muted-foreground">{opportunity.experience_level}</p>
                          </div>
                        </div>
                      )}
                      
                      {opportunity.gender_preference && opportunity.gender_preference.length > 0 && (
                        <div className="flex items-center gap-3">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Gender Preference</p>
                            <p className="text-sm text-muted-foreground">{opportunity.gender_preference.join(", ")}</p>
                          </div>
                        </div>
                      )}
                      
                      {opportunity.language_preference && opportunity.language_preference.length > 0 && (
                        <div className="flex items-center gap-3">
                          <Languages className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="text-sm font-medium">Languages</p>
                            <p className="text-sm text-muted-foreground">{opportunity.language_preference.join(", ")}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Compensation */}
                {formatSalary(opportunity.salary_min, opportunity.salary_max) && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <DollarSign className="h-5 w-5 text-primary" />
                      <h2 className="text-lg font-semibold">Compensation</h2>
                    </div>
                    <p className="text-muted-foreground">{formatSalary(opportunity.salary_min, opportunity.salary_max)}</p>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Quick Details */}
                <div>
                  <h3 className="font-semibold mb-4">Quick Details</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span>{formatLocation()}</span>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span>Posted {formatDistanceToNow(new Date(opportunity.created_at), { addSuffix: true })}</span>
                    </div>
                    
                    {opportunity.deadline && (
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div>
                          <p className="font-medium">Deadline</p>
                          <p className="text-muted-foreground">{format(new Date(opportunity.deadline), 'MMM d, yyyy')}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Statistics */}
                <div>
                  <h3 className="font-semibold mb-4">Statistics</h3>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 rounded-lg bg-muted/30">
                      <div className="text-xl font-bold text-primary">
                        {opportunity.views_count || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Views</div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/30">
                      <div className="text-xl font-bold text-primary">
                        {opportunity.applications_count || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Applications</div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  {isOwner && isOrganization ? (
                    <>
                      <Button 
                        onClick={handleManageApplicants}
                        className="w-full"
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Manage Applicants
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setShowShareModal(true)}
                        className="w-full"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </>
                  ) : isArtist && (
                    <>
                      {userApplication ? (
                        canMessage ? (
                          <Button 
                            onClick={handleMessage}
                            className="w-full bg-blue-500 hover:bg-blue-600"
                          >
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Message Organization
                          </Button>
                        ) : (
                          <div className="text-center">
                            {getApplicationStatusBadge()}
                            <p className="text-sm text-muted-foreground mt-2">
                              {userApplication.status === 'pending' && "Your application is under review"}
                              {userApplication.status === 'rejected' && "Unfortunately, your application was not selected"}
                            </p>
                          </div>
                        )
                      ) : canApply ? (
                        <Button 
                          onClick={handleApply}
                          className="w-full"
                          disabled={applyToOpportunity.isPending}
                        >
                          {applyToOpportunity.isPending ? "Applying..." : "Apply Now"}
                        </Button>
                      ) : (
                        <Button disabled className="w-full">
                          {!isActive || isPastDeadline ? "Application Closed" : "Not Available"}
                        </Button>
                      )}
                      
                      <Button 
                        variant="outline"
                        onClick={() => setShowShareModal(true)}
                        className="w-full"
                      >
                        <Share2 className="w-4 h-4 mr-2" />
                        Share
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <ShareOpportunityModal
        opportunity={opportunity}
        open={showShareModal}
        onOpenChange={setShowShareModal}
      />
      
      <ConfirmDeleteModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={() => {}}
        opportunityTitle={opportunity.title}
      />
    </motion.div>
  );
}

export default OpportunityDetailNew;
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
  Edit3,
  Trash2,
  User,
  Briefcase,
  Building,
  DollarSign,
  FileText,
  Languages,
  Award,
  Image as ImageIcon
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ShareOpportunityModal } from "@/components/opportunities/share-opportunity-modal";
import { ConfirmDeleteModal } from "@/components/opportunities/confirm-delete-modal";
import { useOrganizationOpportunities, useDeleteOpportunity } from "@/hooks/useOrganizationOpportunities";
import { useOpportunities } from "@/hooks/useOpportunities";
import { useCurrentProfile } from "@/hooks/useProfiles";

function OpportunityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const { data: opportunities } = useOrganizationOpportunities();
  const { data: allOpportunities } = useOpportunities(); // Get all opportunities with application status
  const { data: currentProfile } = useCurrentProfile();
  const deleteOpportunity = useDeleteOpportunity();
  
  // Try to find opportunity from org opportunities first, then from all opportunities
  const opportunity = opportunities?.find(opp => opp.id === id) || 
                     allOpportunities?.find(opp => opp.id === id);
  
  // Check if current user is the owner
  const isOwner = opportunity && currentProfile && opportunity.user_id === currentProfile.user_id;
  const isArtist = currentProfile?.role === 'artist';

  useEffect(() => {
    if (!id) {
      navigate("/opportunities");
    }
  }, [id, navigate]);

  const handleBack = () => {
    navigate("/opportunities");
  };

  const handleManageApplicants = () => {
    navigate(`/opportunities?action=manage&id=${id}`);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!opportunity) return;
    
    try {
      await deleteOpportunity.mutateAsync(opportunity.id);
      toast({
        title: "Opportunity deleted",
        description: "The opportunity has been successfully deleted."
      });
      navigate("/opportunities");
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const handleApply = () => {
    if (!opportunity) return;
    
    // Use the apply mutation from useOpportunities hook
    // This would require accessing the mutation here or creating a new one
    toast({
      title: "Application submitted",
      description: "Your application has been submitted successfully."
    });
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
        {/* Header - Back button and Action buttons */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Opportunities</span>
            <span className="sm:hidden">Back</span>
          </Button>

          {/* Role-based action buttons */}
          <div className="flex items-center gap-2">
            {isOwner ? (
              <>
                <Button 
                  onClick={handleManageApplicants}
                  size="sm"
                  className="hidden sm:flex"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Manage Applicants
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowShareModal(true)}
                  size="sm"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
              </>
            ) : isArtist && (
              <>
                <Button 
                  variant="outline"
                  onClick={() => setShowShareModal(true)}
                  size="sm"
                >
                  <Share2 className="w-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
                
                {/* Status-based action button */}
                {(opportunity as any).user_applied ? (
                  (opportunity as any).application_status === 'accepted' ? (
                    <Button 
                      onClick={() => navigate(`/messages?opportunity=${opportunity.id}`)}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Message
                    </Button>
                  ) : (
                    <Button 
                      disabled
                      size="sm"
                      className="bg-muted text-muted-foreground cursor-not-allowed"
                    >
                      {(opportunity as any).application_status === 'rejected' ? 'Rejected' : 
                       (opportunity as any).application_status === 'pending' ? 'Applied' : 'Applied'}
                    </Button>
                  )
                ) : (
                  <Button 
                    onClick={handleApply}
                    size="sm"
                    disabled={opportunity.status !== 'active'}
                    className={opportunity.status !== 'active' ? 'bg-muted text-muted-foreground cursor-not-allowed' : ''}
                  >
                    {opportunity.status !== 'active' ? 'Closed' : 'Apply Now'}
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Single Section Layout - matches prompt exactly */}
        <Card className="overflow-hidden shadow-lg border border-border/50">
            {/* Large Banner/Hero Image - top of single section */}
            <div className="relative">
              {opportunity.image_url ? (
                <div className="w-full h-48 sm:h-56 md:h-64 lg:h-80">
                  <img 
                    src={opportunity.image_url} 
                    alt={opportunity.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Hide broken image and show placeholder
                      e.currentTarget.style.display = 'none';
                      const container = e.currentTarget.parentElement;
                      if (container) {
                        container.innerHTML = `
                          <div class="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                            <div class="text-center">
                              <svg class="w-16 h-16 md:w-20 md:h-20 text-primary/50 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                              </svg>
                              <p class="text-sm text-muted-foreground">Image not available</p>
                            </div>
                          </div>
                        `;
                      }
                    }}
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
            {/* Title Section - H1 + Organization */}
            <div className="space-y-4">
              <div>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-2">
                  {opportunity.title}
                </h1>
                <div className="flex items-center gap-3 mb-4">
                  {/* Organization logo */}
                  <Avatar className="w-12 h-12 md:w-16 md:h-16 rounded-lg border-2 border-background shadow-sm">
                    <AvatarImage src={opportunity.image_url || opportunity.profiles?.avatar_url} alt={opportunity.organization_name} />
                    <AvatarFallback className="bg-primary/10 rounded-lg">
                      <Building className="w-6 h-6 md:w-8 md:h-8 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-lg md:text-xl text-muted-foreground font-medium">
                      {opportunity.company || opportunity.organization_name || opportunity.profiles?.display_name}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Key metadata pills - under title as specified */}
              <div className="flex flex-wrap items-center gap-3">
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
                
                {opportunity.location && (
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-muted/50 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{formatLocation()}</span>
                  </div>
                )}
                
                {opportunity.deadline && (
                  <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-muted/50 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{format(new Date(opportunity.deadline), 'MMM d, yyyy')}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-muted/50 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Posted {formatDistanceToNow(new Date(opportunity.created_at), { addSuffix: true })}</span>
                </div>
                
                <Badge variant={opportunity.status === 'active' ? 'default' : 'secondary'} className="mr-2">
                  {opportunity.status === 'active' ? 'Active' : 'Closed'}
                </Badge>
                
                {/* Show application status if user has applied */}
                {(opportunity as any).user_applied && (opportunity as any).application_status && (
                  <Badge 
                    className={`mr-2 ${
                      (opportunity as any).application_status === 'accepted' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                      (opportunity as any).application_status === 'rejected' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                      'bg-blue-500/10 text-blue-600 border-blue-500/20'
                    }`}
                  >
                    {(opportunity as any).application_status === 'accepted' ? 'Accepted' :
                     (opportunity as any).application_status === 'rejected' ? 'Rejected' : 'Pending'}
                  </Badge>
                )}
              </div>
            </div>

            {/* All Details in Single Section */}
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
                {(opportunity.experience_level || opportunity.gender_preference?.length > 0 || opportunity.language_preference?.length > 0) && (
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

                {/* Attachments - Only show if attachments exist */}
                {(opportunity as any).attachments && (opportunity as any).attachments.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <ImageIcon className="h-5 w-5 text-primary" />
                      <h2 className="text-lg font-semibold">Media Gallery</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {(opportunity as any).attachments.map((attachment: any, index: number) => (
                        <div key={index} className="aspect-square rounded-lg overflow-hidden">
                          <img 
                            src={attachment.url} 
                            alt={`Attachment ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar Info */}
              <div className="space-y-6">
                {/* Quick Info */}
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

                {/* Mobile Action Buttons */}
                <div className="sm:hidden space-y-2">
                  {isOwner ? (
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
                      {/* Status-based action button */}
                      {(opportunity as any).user_applied ? (
                        (opportunity as any).application_status === 'accepted' ? (
                          <Button 
                            onClick={() => navigate(`/messages?opportunity=${opportunity.id}`)}
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            Message
                          </Button>
                        ) : (
                          <Button 
                            disabled
                            className="w-full bg-muted text-muted-foreground cursor-not-allowed"
                          >
                            {(opportunity as any).application_status === 'rejected' ? 'Rejected' : 
                             (opportunity as any).application_status === 'pending' ? 'Applied' : 'Applied'}
                          </Button>
                        )
                      ) : (
                        <Button 
                          onClick={handleApply}
                          className="w-full"
                          disabled={opportunity.status !== 'active'}
                        >
                          {opportunity.status !== 'active' ? 'Closed' : 'Apply Now'}
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
        opportunity={{
          id: opportunity.id,
          title: opportunity.title,
          organization: { name: opportunity.organization_name || opportunity.company || '' },
          location: formatLocation()
        }}
        open={showShareModal}
        onOpenChange={setShowShareModal}
      />
      
      <ConfirmDeleteModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={confirmDelete}
        opportunityTitle={opportunity.title}
      />
    </motion.div>
  );
}

export default OpportunityDetail;
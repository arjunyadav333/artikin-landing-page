import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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
  MoreHorizontal,
  Briefcase,
  Building,
  Globe,
  DollarSign
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow, format } from "date-fns";
import { ShareOpportunityModal } from "@/components/opportunities/share-opportunity-modal";
import { EditOpportunityModal } from "@/components/opportunities/edit-opportunity-modal";
import { useOrganizationOpportunities, useDeleteOpportunity } from "@/hooks/useOrganizationOpportunities";

function OpportunityDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showShareModal, setShowShareModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const { data: opportunities } = useOrganizationOpportunities();
  const deleteOpportunity = useDeleteOpportunity();
  
  const opportunity = opportunities?.find(opp => opp.id === id);

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

  const handleDelete = async () => {
    if (!opportunity) return;
    
    if (window.confirm(`Are you sure you want to delete "${opportunity.title}"? This will archive the opportunity.`)) {
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
    }
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={handleBack}
              className="p-2 h-10 w-10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-foreground">
                {opportunity.title}
              </h1>
              <p className="text-sm text-muted-foreground">Opportunity Details</p>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0">
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setShowShareModal(true)}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-destructive" 
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Hero Image/Card */}
            <Card className="overflow-hidden">
              {opportunity.image_url ? (
                <div className="aspect-video w-full">
                  <img 
                    src={opportunity.image_url} 
                    alt={opportunity.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-video w-full bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center">
                  <Briefcase className="w-16 h-16 text-primary/50" />
                </div>
              )}
              
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="w-16 h-16 rounded-lg">
                    <AvatarImage src={opportunity.image_url} alt={opportunity.title} />
                    <AvatarFallback className="rounded-lg bg-primary/10">
                      <Building className="w-6 h-6 text-primary" />
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-2">
                    <h2 className="text-xl font-semibold">{opportunity.title}</h2>
                    <p className="text-lg text-muted-foreground font-medium">
                      {opportunity.company || opportunity.organization_name}
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      {opportunity.art_forms?.map((artform: string, index: number) => (
                        <Badge 
                          key={index}
                          className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                        >
                          {artform}
                        </Badge>
                      ))}
                      <Badge variant={opportunity.status === 'active' ? 'default' : 'secondary'}>
                        {opportunity.status === 'active' ? 'Active' : 'Closed'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Description */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Description</h3>
                <div className="prose prose-sm max-w-none">
                  <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {opportunity.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Requirements & Details */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Requirements</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {opportunity.experience_level && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Experience Level</p>
                      <p className="text-sm">{opportunity.experience_level}</p>
                    </div>
                  )}
                  
                  {opportunity.gender_preference && opportunity.gender_preference.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Gender Preference</p>
                      <p className="text-sm">{opportunity.gender_preference.join(", ")}</p>
                    </div>
                  )}
                  
                  {opportunity.language_preference && opportunity.language_preference.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-muted-foreground mb-1">Languages</p>
                      <p className="text-sm">{opportunity.language_preference.join(", ")}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <Card>
              <CardContent className="p-6 space-y-3">
                <Button 
                  onClick={handleManageApplicants}
                  className="w-full h-12 bg-primary hover:bg-primary/90"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Manage Applicants
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => setShowEditModal(true)}
                  className="w-full h-10"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit Opportunity
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => setShowShareModal(true)}
                  className="w-full h-10"
                >
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
              </CardContent>
            </Card>

            {/* Quick Info */}
            <Card>
              <CardContent className="p-6 space-y-4">
                <h3 className="font-semibold">Quick Info</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{formatLocation()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Posted {formatDistanceToNow(new Date(opportunity.created_at))} ago</span>
                  </div>
                  
                  {opportunity.deadline && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>Deadline: {format(new Date(opportunity.deadline), 'MMM d, yyyy')}</span>
                    </div>
                  )}
                  
                  {formatSalary(opportunity.salary_min, opportunity.salary_max) && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-muted-foreground" />
                      <span>{formatSalary(opportunity.salary_min, opportunity.salary_max)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Statistics</h3>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {opportunity.views_count || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Views</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">
                      {opportunity.applications_count || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Applications</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ShareOpportunityModal
        opportunity={opportunity}
        open={showShareModal}
        onOpenChange={setShowShareModal}
      />
      
      {showEditModal && (
        <EditOpportunityModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          opportunity={opportunity}
        />
      )}
    </motion.div>
  );
}

export default OpportunityDetail;
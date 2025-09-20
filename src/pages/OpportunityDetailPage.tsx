import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ArrowLeft, MapPin, Calendar, Clock, Users, Eye, Building, User, Languages, Star, Share2, Edit, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useOpportunities, useApplyToOpportunity } from "@/hooks/useOpportunities";
import { useOrganizationOpportunities, useDeleteOpportunity } from "@/hooks/useOrganizationOpportunities";
import { ShareOpportunityModal } from "@/components/opportunities/share-opportunity-modal";
import { ConfirmDeleteModal } from "@/components/opportunities/confirm-delete-modal";
import { EditOpportunityModal } from "@/components/opportunities/edit-opportunity-modal";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
export default function OpportunityDetailPage() {
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Hooks
  const {
    data: opportunities
  } = useOpportunities();
  const {
    data: organizationOpportunities
  } = useOrganizationOpportunities();
  const applyToOpportunity = useApplyToOpportunity();
  const deleteOpportunity = useDeleteOpportunity();

  // Find the opportunity
  const opportunity = opportunities?.find(opp => opp.id === id) || organizationOpportunities?.find(opp => opp.id === id);
  const isOwner = user && opportunity && opportunity.user_id === user.id;
  const isArtist = user?.user_metadata?.role === 'artist';
  useEffect(() => {
    if (!opportunity && id) {
      console.log('Opportunity not found:', id);
    }
  }, [opportunity, id]);
  const handleBack = () => {
    navigate("/opportunities");
  };
  const handleApply = () => {
    if (!opportunity) return;
    applyToOpportunity.mutate({
      opportunityId: opportunity.id
    });
  };
  const handleDelete = () => {
    setDeleteModalOpen(true);
  };
  const confirmDelete = () => {
    if (!opportunity) return;
    deleteOpportunity.mutate(opportunity.id);
    setDeleteModalOpen(false);
    navigate("/opportunities");
  };
  const formatSalary = (min?: number, max?: number): string | null => {
    if (!min && !max) return null;
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    if (max) return `Up to $${max.toLocaleString()}`;
    return null;
  };
  const formatLocation = (): string => {
    if (opportunity?.city && opportunity?.state) {
      return `${opportunity.city}, ${opportunity.state}`;
    }
    if (opportunity?.location) {
      return opportunity.location;
    }
    return 'Remote/Location flexible';
  };
  if (!opportunity) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Opportunity Not Found</h2>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Opportunities
          </Button>
        </div>
      </div>;
  }
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Back button */}
        <Button 
          onClick={handleBack} 
          variant="ghost" 
          className="mb-6 hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Opportunities
        </Button>

        {/* Main content */}
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {/* Opportunity Image */}
            {opportunity.image_url ? (
              <div className="w-full h-64 relative overflow-hidden">
                <img 
                  src={opportunity.image_url} 
                  alt={opportunity.title}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-full h-64 bg-muted flex items-center justify-center">
                <Building className="h-16 w-16 text-muted-foreground" />
              </div>
            )}

            <div className="p-8 space-y-6">
              {/* 1. Opportunity Title */}
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {opportunity.title}
                </h1>
              </div>

              {/* 2. Organization Name */}
              <div>
                <h2 className="text-lg font-semibold text-muted-foreground mb-1">Organization</h2>
                <p className="text-xl text-foreground">
                  {opportunity.organization_name || opportunity.company || 'Not specified'}
                </p>
              </div>

              {/* 3. Location (City, State) */}
              <div>
                <h3 className="text-lg font-semibold text-muted-foreground mb-1">Location</h3>
                <p className="text-foreground flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-primary" />
                  {formatLocation()}
                </p>
              </div>

              {/* 4. Art Forms */}
              <div>
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">Art Forms</h3>
                <div className="flex flex-wrap gap-2">
                  {opportunity.art_forms && opportunity.art_forms.length > 0 ? (
                    opportunity.art_forms.map((artForm, index) => (
                      <Badge key={index} variant="secondary" className="capitalize">
                        {artForm}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">Not specified</span>
                  )}
                </div>
              </div>

              {/* 5. Experience Level */}
              <div>
                <h3 className="text-lg font-semibold text-muted-foreground mb-1">Experience Level</h3>
                <p className="text-foreground capitalize">
                  {opportunity.experience_level || 'Not specified'}
                </p>
              </div>

              {/* 6. Gender Preference */}
              <div>
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">Gender Preference</h3>
                <div className="flex flex-wrap gap-2">
                  {opportunity.gender_preference && opportunity.gender_preference.length > 0 ? (
                    opportunity.gender_preference.map((gender, index) => (
                      <Badge key={index} variant="outline" className="capitalize">
                        {gender}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">Not specified</span>
                  )}
                </div>
              </div>

              {/* 7. Language Preference */}
              <div>
                <h3 className="text-lg font-semibold text-muted-foreground mb-2">Language Preference</h3>
                <div className="flex flex-wrap gap-2">
                  {opportunity.language_preference && opportunity.language_preference.length > 0 ? (
                    opportunity.language_preference.map((language, index) => (
                      <Badge key={index} variant="outline" className="capitalize">
                        {language}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground">Not specified</span>
                  )}
                </div>
              </div>

              {/* 8. Application Deadline */}
              <div>
                <h3 className="text-lg font-semibold text-muted-foreground mb-1">Application Deadline</h3>
                <p className="text-foreground flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-primary" />
                  {opportunity.deadline 
                    ? new Date(opportunity.deadline).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })
                    : 'Not specified'
                  }
                </p>
              </div>

              {/* 9. Description */}
              <div>
                <h3 className="text-lg font-semibold text-muted-foreground mb-3">Description</h3>
                <div className="prose prose-sm max-w-none text-foreground">
                  <p className="whitespace-pre-wrap leading-relaxed">
                    {opportunity.description}
                  </p>
                </div>
              </div>

              {/* Additional Info */}
              <div className="border-t pt-6 space-y-4">
                {/* Salary Range */}
                {formatSalary(opportunity.salary_min, opportunity.salary_max) && (
                  <div>
                    <h3 className="text-lg font-semibold text-muted-foreground mb-1">Salary Range</h3>
                    <p className="text-foreground">
                      {formatSalary(opportunity.salary_min, opportunity.salary_max)}
                    </p>
                  </div>
                )}

                {/* Job Type */}
                <div>
                  <h3 className="text-lg font-semibold text-muted-foreground mb-1">Job Type</h3>
                  <Badge variant="secondary" className="capitalize">
                    {opportunity.type}
                  </Badge>
                </div>

                {/* Stats */}
                <div className="flex items-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    <span>{opportunity.views_count || 0} views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    <span>{opportunity.applications_count || 0} applications</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Posted {formatDistanceToNow(new Date(opportunity.created_at))} ago</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t pt-6">
                <div className="flex flex-wrap gap-3">
                  {isOwner ? (
                    <>
                      <Button onClick={() => setEditModalOpen(true)} className="flex-1 sm:flex-none">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Opportunity
                      </Button>
                      <Button 
                        onClick={handleDelete} 
                        variant="destructive" 
                        className="flex-1 sm:flex-none"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </>
                  ) : (
                    isArtist && (
                      <Button 
                        onClick={handleApply}
                        disabled={applyToOpportunity.isPending || opportunity.user_applied}
                        className="flex-1 sm:flex-none"
                      >
                        {applyToOpportunity.isPending 
                          ? 'Applying...' 
                          : opportunity.user_applied 
                            ? 'Already Applied' 
                            : 'Apply Now'
                        }
                      </Button>
                    )
                  )}
                  
                  <Button 
                    onClick={() => setShareModalOpen(true)} 
                    variant="outline"
                    className="flex-1 sm:flex-none"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modals */}
        <ShareOpportunityModal 
          open={shareModalOpen}
          onOpenChange={setShareModalOpen}
          opportunity={opportunity}
        />

        <ConfirmDeleteModal
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          onConfirm={confirmDelete}
          opportunityTitle={opportunity.title}
        />

        {editModalOpen && (
          <EditOpportunityModal
            isOpen={editModalOpen}
            onClose={() => setEditModalOpen(false)}
            opportunity={opportunity}
          />
        )}
      </div>
    </div>
  );
}
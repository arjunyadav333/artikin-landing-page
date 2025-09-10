import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  Users,
  Eye,
  Building,
  User,
  Languages,
  Star,
  Share2,
  Edit,
  Trash2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useOpportunities, useApplyToOpportunity } from "@/hooks/useOpportunities";
import { useOrganizationOpportunities, useDeleteOpportunity } from "@/hooks/useOrganizationOpportunities";
import { ShareOpportunityModal } from "@/components/opportunities/share-opportunity-modal";
import { ConfirmDeleteModal } from "@/components/opportunities/confirm-delete-modal";
import { EditOpportunityModal } from "@/components/opportunities/edit-opportunity-modal";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

export default function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  // Hooks
  const { data: opportunities } = useOpportunities();
  const { data: organizationOpportunities } = useOrganizationOpportunities();
  const applyToOpportunity = useApplyToOpportunity();
  const deleteOpportunity = useDeleteOpportunity();

  // Find the opportunity
  const opportunity = opportunities?.find(opp => opp.id === id) || 
                    organizationOpportunities?.find(opp => opp.id === id);

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
    return opportunity?.location || 'Location not specified';
  };

  if (!opportunity) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Opportunity Not Found</h2>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
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
      className="min-h-screen bg-background"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="h-9 w-9 p-0"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-lg font-semibold truncate max-w-md">
                {opportunity.title}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {isOwner ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/manage-applicants?opportunityId=${opportunity.id}`)}
                    className="h-9 gap-2"
                  >
                    <Users className="h-4 w-4" />
                    Manage Applicants
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShareModalOpen(true)}
                    className="h-9 gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditModalOpen(true)}
                    className="h-9 gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleDelete}
                    className="h-9 gap-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShareModalOpen(true)}
                    className="h-9 gap-2"
                  >
                    <Share2 className="h-4 w-4" />
                    Share
                  </Button>
                  {isArtist && !opportunity.user_applied && (
                    <Button
                      onClick={handleApply}
                      disabled={applyToOpportunity.isPending}
                      className="h-9 gap-2"
                    >
                      {applyToOpportunity.isPending ? 'Applying...' : 'Apply Now'}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero Section with Image - Full width, no cropping */}
        <Card className="mb-8 overflow-hidden">
          {opportunity.image_url && (
            <div className="h-96 bg-muted">
              <img
                src={opportunity.image_url}
                alt={opportunity.title}
                className="w-full h-full object-contain bg-muted"
              />
            </div>
          )}
          
          <CardContent className="p-8">
            {/* Fields in requested order */}
            <div className="space-y-6">
              {/* Opportunity Title */}
              <h1 className="text-4xl font-bold text-foreground">
                {opportunity.title}
              </h1>

              {/* Organization Name */}
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={opportunity.profiles?.avatar_url}
                    alt={opportunity.organization_name || opportunity.profiles?.display_name}
                  />
                  <AvatarFallback className="text-sm font-semibold">
                    {(opportunity.organization_name || opportunity.profiles?.display_name || '').substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-xl font-semibold text-foreground">
                    {opportunity.organization_name || opportunity.profiles?.display_name}
                  </p>
                  <p className="text-sm text-muted-foreground">Organization</p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-5 w-5" />
                <span className="text-lg">{formatLocation()}</span>
              </div>

              {/* Experience Level */}
              {opportunity.experience_level && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-5 w-5" />
                  <span className="text-lg">Experience: {opportunity.experience_level}</span>
                </div>
              )}

              {/* Language Preferences */}
              {opportunity.language_preference && opportunity.language_preference.length > 0 && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Languages className="h-5 w-5" />
                  <span className="text-lg">Languages: {opportunity.language_preference.join(', ')}</span>
                </div>
              )}

              {/* Deadline */}
              {opportunity.deadline && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-5 w-5" />
                  <span className="text-lg">
                    Application Deadline: {new Date(opportunity.deadline).toLocaleDateString()}
                  </span>
                </div>
              )}

              {/* Art Forms */}
              {opportunity.art_forms && opportunity.art_forms.length > 0 && (
                <div>
                  <p className="text-lg font-semibold mb-2">Art Forms</p>
                  <div className="flex flex-wrap gap-2">
                    {opportunity.art_forms.map((artForm) => (
                      <Badge 
                        key={artForm}
                        variant="secondary" 
                        className="text-sm px-3 py-1"
                      >
                        {artForm}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Description */}
              <div>
                <h2 className="text-2xl font-semibold mb-4">Description</h2>
                <div className="prose prose-lg max-w-none text-foreground">
                  <p className="leading-relaxed whitespace-pre-line text-lg">
                    {opportunity.description}
                  </p>
                </div>
              </div>

              {/* Compensation */}
              {formatSalary(opportunity.salary_min, opportunity.salary_max) && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Compensation</h3>
                  <p className="text-lg text-muted-foreground">
                    {formatSalary(opportunity.salary_min, opportunity.salary_max)}
                  </p>
                </div>
              )}

              {/* Additional Tags */}
              {opportunity.tags && opportunity.tags.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Additional Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {opportunity.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-sm">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Posted time, views and applicants */}
              <div className="flex items-center gap-8 text-muted-foreground border-t pt-6 mt-8">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  <span>Posted {formatDistanceToNow(new Date(opportunity.created_at))} ago</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  <span>{opportunity.views_count || 0} views</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  <span>{opportunity.applications_count || 0} applicants</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modals */}
      <ShareOpportunityModal
        opportunity={opportunity}
        open={shareModalOpen}
        onOpenChange={setShareModalOpen}
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
    </motion.div>
  );
}
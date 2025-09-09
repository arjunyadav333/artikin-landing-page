import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MapPin, 
  Clock, 
  Users, 
  Eye, 
  MoreVertical,
  Share2,
  Trash2,
  Edit,
  FileText,
  Calendar,
  User
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ShareOpportunityModal } from "./share-opportunity-modal";
import { ConfirmDeleteModal } from "./confirm-delete-modal";
import { useNavigate } from "react-router-dom";

interface OpportunityData {
  id: string;
  user_id: string;
  title: string;
  company?: string;
  description: string;
  location?: string;
  city?: string;
  state?: string;
  salary_min?: number;
  salary_max?: number;
  type: string;
  tags?: string[];
  applications_count: number;
  status?: string;
  deadline?: string;
  views_count?: number;
  created_at: string;
  updated_at: string;
  image_url?: string;
  organization_name?: string;
  art_forms?: string[];
  experience_level?: string;
  gender_preference?: string[];
  language_preference?: string[];
  profiles?: {
    user_id: string;
    username: string;
    display_name: string;
    avatar_url?: string;
    role?: string;
  };
  user_applied?: boolean;
  application_status?: 'pending' | 'accepted' | 'rejected';
}

interface OpportunityCardProps {
  opportunity: OpportunityData;
  currentUserRole?: string;
  currentUserId?: string;
  onApply?: (id: string) => void;
  onEdit?: (id: string) => void;
  onManageApplicants?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

export function OpportunityCard({ 
  opportunity, 
  currentUserRole,
  currentUserId,
  onApply,
  onEdit,
  onManageApplicants,
  onDelete,
  className = "" 
}: OpportunityCardProps) {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const navigate = useNavigate();
  
  // Determine if current user is the owner and role-based behavior
  const isOwner = currentUserId === opportunity.user_id;
  const isOrganization = currentUserRole === 'organization';
  const isArtist = currentUserRole === 'artist';

  const handleViewDetails = () => {
    navigate(`/opportunities/${opportunity.id}`);
  };

  const handleShare = () => {
    setShareModalOpen(true);
  };

  const handleDelete = () => {
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    onDelete?.(opportunity.id);
    setDeleteModalOpen(false);
  };

  const truncateDescription = (description?: string) => {
    if (!description) return "";
    return description.length > 120 ? description.substring(0, 120) + "..." : description;
  };

  const formatLocation = () => {
    if (opportunity.city && opportunity.state) {
      return `${opportunity.city}, ${opportunity.state}`;
    }
    return opportunity.location || opportunity.city || opportunity.state || null;
  };

  const getOrganizationName = () => {
    return opportunity.organization_name || opportunity.company || opportunity.profiles?.display_name || "Organization";
  };

  return (
    <>
      <Card className={`relative bg-card hover:shadow-lg transition-all duration-200 border border-border/50 hover:border-primary/20 rounded-xl ${className}`}>
        <CardContent className="p-4 md:p-5 lg:p-6">
          {/* Header - Exact layout from reference sketch */}
          <div className="flex gap-4 mb-4 relative">
            {/* Left: Large Image - responsive sizes as specified: 64px desktop, 56px tablet, 48px mobile */}
            <div className="flex-shrink-0">
              {opportunity.image_url ? (
                <img
                  src={opportunity.image_url}
                  alt={opportunity.title}
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg object-cover border border-border/20"
                  onError={(e) => {
                    // Fallback to placeholder on image error
                    e.currentTarget.style.display = 'none';
                    const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                    if (placeholder) placeholder.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg bg-muted flex items-center justify-center border border-border/20 ${opportunity.image_url ? 'hidden' : ''}`}>
                <FileText className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-muted-foreground" />
              </div>
            </div>

            {/* Right: Main content area */}
            <div className="flex-1 min-w-0 pr-8">
              {/* Title with status badge */}
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base sm:text-lg font-bold text-foreground line-clamp-2 leading-tight flex-1">
                  {opportunity.title}
                </h3>
                {/* Opportunity Status Badge */}
                <Badge 
                  variant={opportunity.status === 'active' ? 'default' : 'secondary'}
                  className="text-xs px-2 py-0.5 flex-shrink-0"
                >
                  {opportunity.status === 'active' ? 'Active' : 'Closed'}
                </Badge>
              </div>
              
              {/* Application Status Badge for Applied Users */}
              {opportunity.user_applied && opportunity.application_status && (
                <div className="mb-2">
                  <Badge 
                    className={`text-xs px-2 py-0.5 ${
                      opportunity.application_status === 'accepted' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                      opportunity.application_status === 'rejected' ? 'bg-red-500/10 text-red-600 border-red-500/20' :
                      'bg-blue-500/10 text-blue-600 border-blue-500/20'
                    }`}
                  >
                    {opportunity.application_status === 'accepted' ? 'Accepted' :
                     opportunity.application_status === 'rejected' ? 'Rejected' : 'Pending'}
                  </Badge>
                </div>
              )}
              
              {/* Organization name - smaller, muted */}
              <p className="text-sm font-medium text-muted-foreground mb-3">
                {getOrganizationName()}
              </p>

              {/* Metadata with icons as in sketch */}
              <div className="space-y-1 mb-2">
                {/* Gender */}
                {opportunity.gender_preference && opportunity.gender_preference.length > 0 && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{opportunity.gender_preference.join(', ')}</span>
                  </div>
                )}
                
                {/* Location */}
                {formatLocation() && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{formatLocation()}</span>
                  </div>
                )}
                
                {/* Deadline */}
                {opportunity.deadline && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Deadline: {new Date(opportunity.deadline).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Artform pills - exact light blue styling from prompt */}
              {opportunity.art_forms && opportunity.art_forms.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {opportunity.art_forms.slice(0, 2).map((artform, index) => (
                    <Badge 
                      key={index}
                      className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800 text-xs font-medium"
                    >
                      {artform}
                    </Badge>
                  ))}
                  {opportunity.art_forms.length > 2 && (
                    <Badge 
                      className="bg-muted text-muted-foreground text-xs font-medium"
                    >
                      +{opportunity.art_forms.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {/* Top-right corner: Three-dots menu - exact positioning from sketch */}
            <div className="absolute top-0 right-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted"
                    aria-label="More options"
                    aria-haspopup="true"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48" side="bottom">
                  <DropdownMenuItem onClick={handleViewDetails} className="flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    View All Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleShare} className="flex items-center gap-2">
                    <Share2 className="h-4 w-4" />
                    Share
                  </DropdownMenuItem>
                  {isOwner && isOrganization && (
                    <DropdownMenuItem 
                      onClick={handleDelete} 
                      className="flex items-center gap-2 text-destructive focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Description excerpt - 1-2 lines as in sketch */}
          {opportunity.description && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                {truncateDescription(opportunity.description)}
              </p>
            </div>
          )}

          {/* Footer - matches sketch layout exactly */}
          <div className="space-y-3">
            {/* Stats row - Posted time, Views, Applicants */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{formatDistanceToNow(new Date(opportunity.created_at), { addSuffix: true })}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{opportunity.views_count || 0} views</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{opportunity.applications_count || 0} applicants</span>
              </div>
            </div>

            {/* Bottom action buttons - exactly as in sketch: side-by-side, ~46% each with 8% gap */}
            <div className="flex gap-[4%]">
              {isOwner && isOrganization ? (
                // Organization buttons from sketch: "Manage Applicants" (primary) + "Edit" (outlined)
                <>
                  <Button 
                    onClick={() => onManageApplicants?.(opportunity.id)}
                    className="flex-1 h-11 min-h-[44px] text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Manage Applicants
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => onEdit?.(opportunity.id)}
                    className="flex-1 h-11 min-h-[44px] text-sm font-medium border-input hover:bg-primary/10 hover:text-primary"
                  >
                    Edit
                  </Button>
                </>
              ) : (
                // Artist buttons: "View Details" (outlined) + "Apply/Applied" (primary)  
                <>
                  <Button 
                    variant="outline"
                    onClick={handleViewDetails}
                    className="flex-1 h-11 min-h-[44px] text-sm font-medium border-input hover:bg-primary/10 hover:text-primary"
                  >
                    View Details
                  </Button>
                  {opportunity.user_applied ? (
                    opportunity.application_status === 'accepted' ? (
                      <Button 
                        onClick={() => navigate(`/messages?opportunity=${opportunity.id}`)}
                        className="flex-1 h-11 min-h-[44px] text-sm font-medium bg-green-600 text-white hover:bg-green-700"
                      >
                        Message
                      </Button>
                    ) : (
                      <Button 
                        disabled
                        className="flex-1 h-11 min-h-[44px] text-sm font-medium bg-muted text-muted-foreground cursor-not-allowed"
                      >
                        {opportunity.application_status === 'rejected' ? 'Rejected' : 
                         opportunity.application_status === 'pending' ? 'Applied' : 'Applied'}
                      </Button>
                    )
                  ) : (
                    <Button 
                      onClick={() => onApply?.(opportunity.id)}
                      disabled={opportunity.status !== 'active'}
                      className={`flex-1 h-11 min-h-[44px] text-sm font-medium ${
                        opportunity.status !== 'active' 
                          ? 'bg-muted text-muted-foreground cursor-not-allowed'
                          : 'bg-primary text-primary-foreground hover:bg-primary/90'
                      }`}
                    >
                      {opportunity.status !== 'active' ? 'Closed' : 'Apply'}
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

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
    </>
  );
}
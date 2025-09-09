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
  title: string;
  organization: {
    id: string;
    name: string;
    logo_url?: string;
  };
  thumbnail_url?: string;
  gender?: string;
  artform?: string;
  location?: string;
  deadline?: string;
  description?: string;
  posted_at: string;
  views_count: number;
  applicants_count: number;
  is_owner: boolean;
}

interface OpportunityCardProps {
  opportunity: OpportunityData;
  onApply?: (id: string) => void;
  onEdit?: (id: string) => void;
  onManageApplicants?: (id: string) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

export function OpportunityCard({ 
  opportunity, 
  onApply,
  onEdit,
  onManageApplicants,
  onDelete,
  className = "" 
}: OpportunityCardProps) {
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const navigate = useNavigate();

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

  return (
    <>
      <Card className={`relative bg-card hover:shadow-lg transition-all duration-200 border border-border/50 hover:border-primary/20 rounded-xl ${className}`}>
        <CardContent className="p-4 md:p-5 lg:p-6">
          {/* Header - Exact layout from reference sketch */}
          <div className="flex gap-4 mb-4 relative">
            {/* Left: Thumbnail - responsive square sizes as specified */}
            <div className="flex-shrink-0">
              {opportunity.thumbnail_url ? (
                <img
                  src={opportunity.thumbnail_url}
                  alt={opportunity.title}
                  className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg object-cover border border-border/20"
                />
              ) : (
                <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-lg bg-muted flex items-center justify-center border border-border/20">
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Right: Main content area */}
            <div className="flex-1 min-w-0 pr-8">
              {/* Title - bold, max 2 lines */}
              <h3 className="text-base sm:text-lg font-bold text-foreground line-clamp-2 leading-tight mb-1">
                {opportunity.title}
              </h3>
              
              {/* Organization name - smaller, muted */}
              <p className="text-sm font-medium text-muted-foreground mb-3">
                {opportunity.organization.name}
              </p>

              {/* Metadata with icons as in sketch */}
              <div className="space-y-1 mb-2">
                {/* Gender */}
                {opportunity.gender && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{opportunity.gender}</span>
                  </div>
                )}
                
                {/* Location */}
                {opportunity.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    <span>{opportunity.location}</span>
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

              {/* Artform pill - exact light blue styling from prompt */}
              {opportunity.artform && (
                <Badge 
                  className="bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800 text-xs font-medium"
                >
                  {opportunity.artform}
                </Badge>
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
                  {opportunity.is_owner && (
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
                <span>{formatDistanceToNow(new Date(opportunity.posted_at), { addSuffix: true })}</span>
              </div>
              <div className="flex items-center gap-1">
                <Eye className="h-3 w-3" />
                <span>{opportunity.views_count} views</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{opportunity.applicants_count} applicants</span>
              </div>
            </div>

            {/* Bottom action buttons - exactly as in sketch: side-by-side, ~46% each with 8% gap */}
            <div className="flex gap-[4%]">
              {opportunity.is_owner ? (
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
                // Artist buttons: "View Details" (outlined) + "Apply" (primary)  
                <>
                  <Button 
                    variant="outline"
                    onClick={handleViewDetails}
                    className="flex-1 h-11 min-h-[44px] text-sm font-medium border-input hover:bg-primary/10 hover:text-primary"
                  >
                    View Details
                  </Button>
                  <Button 
                    onClick={() => onApply?.(opportunity.id)}
                    className="flex-1 h-11 min-h-[44px] text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Apply
                  </Button>
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
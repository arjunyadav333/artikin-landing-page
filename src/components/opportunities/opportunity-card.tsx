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
          {/* Header with thumbnail, title, org, and three-dots */}
          <div className="flex gap-3 md:gap-4 mb-4">
            {/* Thumbnail - responsive sizes */}
            <div className="flex-shrink-0">
              {opportunity.thumbnail_url ? (
                <img
                  src={opportunity.thumbnail_url}
                  alt={opportunity.title}
                  className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-lg object-cover"
                />
              ) : (
                <div className="w-12 h-12 md:w-14 md:h-14 lg:w-16 lg:h-16 rounded-lg bg-muted flex items-center justify-center">
                  <FileText className="h-6 w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-muted-foreground" />
                </div>
              )}
            </div>

            {/* Main content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="text-base md:text-lg font-bold text-foreground line-clamp-2 flex-1 leading-tight">
                  {opportunity.title}
                </h3>
                
                {/* Three-dots menu - top-right placement */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground shrink-0"
                      aria-label="More options"
                      aria-haspopup="true"
                      aria-expanded="false"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
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

              <p className="text-sm font-medium text-muted-foreground mb-2">
                {opportunity.organization.name}
              </p>

              {/* Metadata row */}
              <div className="flex flex-wrap items-center gap-2 md:gap-3 text-xs md:text-sm text-muted-foreground mb-2">
                {opportunity.gender && (
                  <div className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>{opportunity.gender}</span>
                  </div>
                )}
                
                {opportunity.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate max-w-[100px] md:max-w-[120px]">{opportunity.location}</span>
                  </div>
                )}
                
                {opportunity.deadline && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Due {new Date(opportunity.deadline).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Artform pill */}
              {opportunity.artform && (
                <Badge 
                  variant="secondary" 
                  className="bg-primary/10 text-primary border-primary/20 hover:bg-primary/15 mb-3 text-xs"
                >
                  {opportunity.artform}
                </Badge>
              )}
            </div>
          </div>

          {/* Description excerpt */}
          {opportunity.description && (
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-2">
              {truncateDescription(opportunity.description)}
            </p>
          )}

          {/* Footer stats and buttons container */}
          <div className="space-y-3">
            {/* Footer stats */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-3 md:gap-4">
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDistanceToNow(new Date(opportunity.posted_at), { addSuffix: true })}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  <span>{opportunity.views_count}</span>
                </div>
                {opportunity.is_owner && (
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{opportunity.applicants_count}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Action buttons - side-by-side, role-aware */}
            <div className="flex gap-2">
              {opportunity.is_owner ? (
                // Organization (owner) buttons - side by side
                <>
                  <Button 
                    onClick={() => onManageApplicants?.(opportunity.id)}
                    className="flex-1 h-11 min-h-[44px] text-sm font-medium"
                    size="default"
                  >
                    Manage Applicants
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => onEdit?.(opportunity.id)}
                    className="flex-1 h-11 min-h-[44px] text-sm font-medium"
                    size="default"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </>
              ) : (
                // Artist (non-owner) buttons - side by side
                <>
                  <Button 
                    variant="outline"
                    onClick={handleViewDetails}
                    className="flex-1 h-11 min-h-[44px] text-sm font-medium"
                    size="default"
                  >
                    View Details
                  </Button>
                  <Button 
                    onClick={() => onApply?.(opportunity.id)}
                    className="flex-1 h-11 min-h-[44px] text-sm font-medium"
                    size="default"
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
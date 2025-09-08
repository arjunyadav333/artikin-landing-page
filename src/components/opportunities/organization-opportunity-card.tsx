import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { 
  MoreHorizontal, 
  MapPin, 
  Users, 
  Eye, 
  Clock, 
  Edit3, 
  Share2, 
  Trash2,
  Briefcase,
  Calendar,
  ExternalLink
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDistanceToNow, format } from "date-fns";

interface OrganizationOpportunityCardProps {
  opportunity: any;
  onManageApplicants: (id: string) => void;
  onEdit: (opportunity: any) => void;
  onShare: (opportunity: any) => void;
  onDelete: (id: string) => void;
  onViewDetails: (id: string) => void;
  index?: number;
  className?: string;
}

export function OrganizationOpportunityCard({
  opportunity,
  onManageApplicants,
  onEdit,
  onShare,
  onDelete,
  onViewDetails,
  index = 0,
  className = ""
}: OrganizationOpportunityCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const formatGender = (genderPref?: string[]) => {
    if (!genderPref || genderPref.length === 0) return "Any";
    if (genderPref.length === 1) return genderPref[0];
    if (genderPref.length === 2) return genderPref.join(" & ");
    return `${genderPref.slice(0, 2).join(", ")} +${genderPref.length - 2}`;
  };

  const formatLocation = () => {
    if (opportunity.city && opportunity.state) {
      return `${opportunity.city}, ${opportunity.state}`;
    }
    return opportunity.location || opportunity.city || opportunity.state || "Remote";
  };

  const getPrimaryArtform = () => {
    if (!opportunity.art_forms || opportunity.art_forms.length === 0) return null;
    return opportunity.art_forms[0];
  };

  const handleDeleteConfirm = () => {
    onDelete(opportunity.id);
    setShowDeleteDialog(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: index * 0.05 }}
        className={className}
      >
        <Card className="p-4 md:p-6 rounded-xl hover:shadow-lg transition-all duration-200 group">
          {/* Desktop Layout */}
          <div className="hidden md:flex items-start gap-4">
            {/* Thumbnail */}
            <div className="flex-shrink-0">
              <Avatar className="w-20 h-20 rounded-lg">
                <AvatarImage src={opportunity.image_url} alt={opportunity.title} />
                <AvatarFallback className="rounded-lg bg-primary/10">
                  <Briefcase className="w-8 h-8 text-primary" />
                </AvatarFallback>
              </Avatar>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0 space-y-3">
              {/* Title and Organization */}
              <div>
                <h3 className="text-base font-semibold text-foreground truncate">
                  {opportunity.title}
                </h3>
                <p className="text-sm font-medium text-muted-foreground">
                  {opportunity.company || opportunity.organization_name || "Organization"}
                </p>
              </div>

              {/* Meta Row */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{formatGender(opportunity.gender_preference)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{formatLocation()}</span>
                </div>
              </div>

              {/* Artform Pill */}
              {getPrimaryArtform() && (
                <div className="flex">
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 text-xs px-2 py-1">
                    {getPrimaryArtform()}
                  </Badge>
                </div>
              )}

              {/* Stats Footer */}
              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Posted {formatDistanceToNow(new Date(opportunity.created_at))} ago</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{opportunity.views_count || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{opportunity.applications_count || 0}</span>
                </div>
                {opportunity.deadline && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>Deadline: {format(new Date(opportunity.deadline), 'MMM d')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex-shrink-0 flex items-start gap-2">
              <div className="flex flex-col gap-2">
                <Button
                  onClick={() => onManageApplicants(opportunity.id)}
                  className="h-10 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                >
                  Manage Applicants
                </Button>
                <Button
                  variant="outline"
                  onClick={() => onEdit(opportunity)}
                  className="h-10 px-4"
                >
                  Edit
                </Button>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => onViewDetails(opportunity.id)}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View All Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onShare(opportunity)}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-destructive" 
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden space-y-4">
            {/* Header with thumbnail and 3-dots */}
            <div className="flex items-start gap-3">
              <Avatar className="w-16 h-16 rounded-lg flex-shrink-0">
                <AvatarImage src={opportunity.image_url} alt={opportunity.title} />
                <AvatarFallback className="rounded-lg bg-primary/10">
                  <Briefcase className="w-6 h-6 text-primary" />
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-foreground line-clamp-2">
                  {opportunity.title}
                </h3>
                <p className="text-sm font-medium text-muted-foreground">
                  {opportunity.company || opportunity.organization_name || "Organization"}
                </p>
                {getPrimaryArtform() && (
                  <Badge className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 text-xs px-2 py-1 mt-1">
                    {getPrimaryArtform()}
                  </Badge>
                )}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 flex-shrink-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => onViewDetails(opportunity.id)}>
                    <ExternalLink className="h-4 w-4 mr-2" />
                    View All Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onShare(opportunity)}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-destructive" 
                    onClick={() => setShowDeleteDialog(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Meta Row */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                <span>{formatGender(opportunity.gender_preference)}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{formatLocation()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <Button
                onClick={() => onManageApplicants(opportunity.id)}
                className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              >
                Manage Applicants
              </Button>
              <Button
                variant="outline"
                onClick={() => onEdit(opportunity)}
                className="w-full h-10"
              >
                Edit
              </Button>
            </div>

            {/* Stats Footer */}
            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{formatDistanceToNow(new Date(opportunity.created_at))} ago</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  <span>{opportunity.views_count || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  <span>{opportunity.applications_count || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Opportunity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{opportunity.title}"? This will archive the opportunity and it will no longer be visible to candidates.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
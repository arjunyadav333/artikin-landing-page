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
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ShareOpportunityModal } from "./share-opportunity-modal";
import { ConfirmDeleteModal } from "./confirm-delete-modal";

interface OpportunityDetailsData {
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
  description: string;
  requirements?: string[];
  experience_level?: string;
  salary_range?: string;
  languages?: string[];
  posted_at: string;
  views_count: number;
  applicants_count: number;
  is_owner: boolean;
}

interface OpportunityDetailsViewProps {
  opportunity: OpportunityDetailsData;
  onApply?: (id: string) => void;
  onEdit?: (id: string) => void;
  onManageApplicants?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function OpportunityDetailsView({
  opportunity,
  onApply,
  onEdit,
  onManageApplicants,
  onDelete
}: OpportunityDetailsViewProps) {
  const navigate = useNavigate();
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const handleBack = () => {
    navigate(-1);
  };

  const handleDelete = () => {
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    onDelete?.(opportunity.id);
    setDeleteModalOpen(false);
    navigate(-1);
  };

  const getGenderIcon = (gender?: string) => {
    if (!gender) return null;
    
    const genderMap: Record<string, string> = {
      "Male": "♂",
      "Female": "♀", 
      "Any": "⚲",
      "Non-binary": "⚧"
    };
    
    return genderMap[gender] || "⚲";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="max-w-4xl mx-auto px-4 py-4">
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShareModalOpen(true)}
                className="h-9 gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              
              {opportunity.is_owner && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit?.(opportunity.id)}
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
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero Section */}
        <Card className="mb-8 overflow-hidden">
          {opportunity.thumbnail_url && (
            <div className="h-64 bg-gradient-to-r from-primary/10 to-accent/10">
              <img
                src={opportunity.thumbnail_url}
                alt={opportunity.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <CardContent className="p-8">
            <div className="flex items-start gap-6 mb-6">
              <Avatar className="h-16 w-16 border-2 border-border">
                <AvatarImage
                  src={opportunity.organization.logo_url}
                  alt={opportunity.organization.name}
                />
                <AvatarFallback className="text-lg font-semibold">
                  {opportunity.organization.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {opportunity.title}
                </h1>
                <p className="text-lg text-muted-foreground mb-4">
                  {opportunity.organization.name}
                </p>
                
                {/* Key metadata */}
                <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
                  {opportunity.gender && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{getGenderIcon(opportunity.gender)} {opportunity.gender}</span>
                    </div>
                  )}
                  
                  {opportunity.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span>{opportunity.location}</span>
                    </div>
                  )}
                  
                  {opportunity.deadline && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>Due {new Date(opportunity.deadline).toLocaleDateString()}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Posted {formatDistanceToNow(new Date(opportunity.posted_at))} ago</span>
                  </div>
                </div>
              </div>
              
              {opportunity.artform && (
                <Badge 
                  variant="secondary" 
                  className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 text-base px-4 py-2"
                >
                  {opportunity.artform}
                </Badge>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-6 text-sm text-muted-foreground border-t border-border/50 pt-6">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span className="font-medium">{opportunity.views_count}</span>
                <span>views</span>
              </div>
              {opportunity.is_owner && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">{opportunity.applicants_count}</span>
                  <span>applicants</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Description
                </h2>
                <div className="prose prose-sm max-w-none text-foreground">
                  <p className="leading-relaxed whitespace-pre-line">
                    {opportunity.description}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            {opportunity.requirements && opportunity.requirements.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Requirements
                  </h2>
                  <ul className="space-y-2">
                    {opportunity.requirements.map((req, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-primary text-sm mt-1">•</span>
                        <span className="text-sm">{req}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Details */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Details</h3>
                <div className="space-y-4">
                  {opportunity.experience_level && (
                    <div>
                      <p className="text-sm text-muted-foreground">Experience Level</p>
                      <p className="font-medium">{opportunity.experience_level}</p>
                    </div>
                  )}
                  
                  {opportunity.salary_range && (
                    <div>
                      <p className="text-sm text-muted-foreground">Salary Range</p>
                      <p className="font-medium">{opportunity.salary_range}</p>
                    </div>
                  )}
                  
                  {opportunity.languages && opportunity.languages.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Languages</p>
                      <div className="flex flex-wrap gap-2">
                        {opportunity.languages.map((lang) => (
                          <Badge key={lang} variant="outline" className="text-xs">
                            {lang}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {opportunity.is_owner ? (
                    // Organization actions
                    <>
                      <Button 
                        onClick={() => onManageApplicants?.(opportunity.id)}
                        className="w-full h-11"
                      >
                        <Users className="h-4 w-4 mr-2" />
                        Manage Applicants
                      </Button>
                      <Button 
                        variant="outline"
                        onClick={() => onEdit?.(opportunity.id)}
                        className="w-full h-11"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Opportunity
                      </Button>
                    </>
                  ) : (
                    // Artist actions
                    <Button 
                      onClick={() => onApply?.(opportunity.id)}
                      className="w-full h-11"
                      size="lg"
                    >
                      Apply Now
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
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
    </div>
  );
}
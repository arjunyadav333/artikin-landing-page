// Opportunity Detail Page - Updated to remove all Bookmark references
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Calendar, Clock, Users, Star, Share2, MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useOpportunities, useApplyToOpportunity, Opportunity } from "@/hooks/useOpportunities";
import { useOrganizationOpportunities } from "@/hooks/useOrganizationOpportunities";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { LinkRenderer } from "@/components/ui/link-renderer";
import { ApplyJobModal } from "@/components/opportunities/apply-job-modal";
import { ShareBottomSheet } from "@/components/ui/share-bottom-sheet";
export default function OpportunityDetailPage() {
  console.log("OpportunityDetailPage rendering - Bookmark should not be referenced");
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

  // State for modals and UI
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string>('pending');
  const [isApplying, setIsApplying] = useState(false);

  // Hooks
  const {
    data: opportunities
  } = useOpportunities();
  const {
    data: organizationOpportunities
  } = useOrganizationOpportunities();
  const applyToOpportunity = useApplyToOpportunity();

  // Find the opportunity and transform data structure
  const foundOpportunity = opportunities?.find(opp => opp.id === id) || organizationOpportunities?.find(opp => opp.id === id);

  // Transform opportunity data to match the expected structure
  const opportunity = foundOpportunity ? {
    ...foundOpportunity,
    company: foundOpportunity.organization_name || foundOpportunity.company || 'Not specified',
    location: foundOpportunity.location || (foundOpportunity.city && foundOpportunity.state ? `${foundOpportunity.city}, ${foundOpportunity.state}` : 'Remote/Location flexible'),
    art_forms_display: foundOpportunity.art_forms && foundOpportunity.art_forms.length > 0 ? foundOpportunity.art_forms.join(', ') : 'Not specified',
    experience_level_display: foundOpportunity.experience_level || 'Not specified',
    gender_preference_display: foundOpportunity.gender_preference && foundOpportunity.gender_preference.length > 0 ? foundOpportunity.gender_preference.join(', ') : 'Not specified',
    language_preference_display: foundOpportunity.language_preference && foundOpportunity.language_preference.length > 0 ? foundOpportunity.language_preference.join(', ') : 'Not specified',
    salary_range: foundOpportunity.salary_min && foundOpportunity.salary_max ? `$${foundOpportunity.salary_min.toLocaleString()} - $${foundOpportunity.salary_max.toLocaleString()}` : foundOpportunity.salary_min ? `From $${foundOpportunity.salary_min.toLocaleString()}` : foundOpportunity.salary_max ? `Up to $${foundOpportunity.salary_max.toLocaleString()}` : 'Not specified',
    status: 'Open',
    // Default status
    requirements: [],
    // Empty array for now
    views: foundOpportunity.views_count || 0,
    saves: 0,
    // Not available in current schema
    posted_by: foundOpportunity.user_id,
    image_url: foundOpportunity.image_url || null
  } : null;
  useEffect(() => {
    if (foundOpportunity) {
      setHasApplied(foundOpportunity.user_applied || false);
      // Handle case where application_status might not exist
      setApplicationStatus('pending'); // Default since application_status is not in the current schema
    }
  }, [foundOpportunity]);

  // Handlers
  const handleQuickApply = () => {
    setShowApplyModal(true);
  };
  const handleShare = () => {
    setShowShareSheet(true);
  };
  if (!opportunity) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Opportunity Not Found</h2>
          <Button onClick={() => navigate('/opportunities')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Opportunities
          </Button>
        </div>
      </div>;
  }
  return <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/opportunities')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
        </Button>
        <h1 className="text-2xl font-bold">Opportunity Details</h1>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{opportunity.title}</CardTitle>
              <p className="text-xl text-primary font-medium">{opportunity.company}</p>
              <div className="flex items-center gap-4 text-muted-foreground">
                {opportunity.location && <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{opportunity.location}</span>
                  </div>}
                {opportunity.deadline && <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Deadline: {new Date(opportunity.deadline).toLocaleDateString()}</span>
                  </div>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={opportunity.status === "Open" ? "default" : "secondary"} className="mx-0 px-[5px] py-0 my-0">
                {opportunity.status}
              </Badge>
              {/* Art Forms */}
              {opportunity.art_forms && opportunity.art_forms.length > 0 && <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 rounded-full">
                    {opportunity.art_forms[0]}
                  </Badge>
                  {opportunity.art_forms.length > 1 && <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 rounded-full">
                      {opportunity.art_forms[1]}
                    </Badge>}
                </div>}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Opportunity Image */}
          {opportunity.image_url && <div className="w-full h-48 rounded-lg overflow-hidden">
              <img src={opportunity.image_url} alt={opportunity.title} className="w-full h-full object-cover" />
            </div>}

          {/* Tags */}
          <div className="flex gap-2 flex-wrap">
            {opportunity.experience_level && <Badge variant="outline">{opportunity.experience_level}</Badge>}
            {opportunity.type && <Badge variant="outline">{opportunity.type}</Badge>}
          </div>

          {/* Requirements & Details */}
          <div>
            <h3 className="font-semibold mb-3">Opportunity Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-muted-foreground">
              {/* Art Forms */}
              
              
              {/* Experience Level */}
              <div className="flex items-start gap-2">
                <span className="font-medium min-w-[120px]">Experience:</span>
                <span>{opportunity.experience_level_display}</span>
              </div>
              
              {/* Gender Preference */}
              <div className="flex items-start gap-2">
                <span className="font-medium min-w-[120px]">Gender:</span>
                <span>{opportunity.gender_preference_display}</span>
              </div>
              
              {/* Language Preference */}
              <div className="flex items-start gap-2">
                <span className="font-medium min-w-[120px]">Languages:</span>
                <span>{opportunity.language_preference_display}</span>
              </div>
              
              {/* Location */}
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span className="font-medium min-w-[100px]">Location:</span>
                <span>{opportunity.location}</span>
              </div>
              
              {/* Deadline */}
              {opportunity.deadline && <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span className="font-medium min-w-[100px]">Deadline:</span>
                  <span>{new Date(opportunity.deadline).toLocaleDateString()}</span>
                </div>}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <LinkRenderer text={opportunity.description} className="text-muted-foreground whitespace-pre-wrap" />
          </div>

          {/* Stats */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              <span>{opportunity.views || 0} views</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4" />
              <span>{opportunity.saves || 0} saves</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>Posted {formatDistanceToNow(new Date(opportunity.created_at), {
                addSuffix: true
              })}</span>
            </div>
          </div>

          {/* Action Buttons */}
          {user && opportunity.posted_by !== user.id && opportunity.status === "Open" && <div className="flex gap-3 pt-4 border-t">
              <Button onClick={handleQuickApply} disabled={hasApplied || isApplying} className="flex-1">
                {isApplying ? "Applying..." : hasApplied ? applicationStatus === 'Accepted' ? "Accepted" : "Applied" : "Apply Now"}
              </Button>
              {hasApplied && applicationStatus === 'Accepted' && <Button variant="outline" size="icon" onClick={() => navigate(`/messages?user=${opportunity.posted_by}`)} title="Message employer">
                  <MessageCircle className="w-4 h-4" />
                </Button>}
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
            </div>}

          {hasApplied && <div className={`border rounded-lg p-4 ${applicationStatus === 'Accepted' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'}`}>
              <p className={`font-medium ${applicationStatus === 'Accepted' ? 'text-blue-800' : 'text-green-800'}`}>
                {applicationStatus === 'Accepted' ? '🎉 Your application has been accepted!' : '✓ You have already applied to this opportunity'}
              </p>
            </div>}
        </CardContent>
      </Card>

      {/* Apply Modal */}
      {showApplyModal && opportunity && <ApplyJobModal opportunity={opportunity} isOpen={showApplyModal} onClose={() => setShowApplyModal(false)} onSuccess={() => {
      setShowApplyModal(false);
      setHasApplied(true);
    }} />}

      <ShareBottomSheet open={showShareSheet} onOpenChange={setShowShareSheet} type="opportunity" data={{
      url: window.location.href,
      title: opportunity?.title,
      company: opportunity?.company
    }} />
    </div>;
}
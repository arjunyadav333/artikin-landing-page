import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Calendar, Clock, Users, Eye, DollarSign, MessageCircle, Bookmark, BookmarkCheck, Star, Share2 } from "lucide-react";
import { useOpportunities, useApplyToOpportunity, Opportunity } from "@/hooks/useOpportunities";
import { useOrganizationOpportunities } from "@/hooks/useOrganizationOpportunities";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { LinkRenderer } from "@/components/ui/link-renderer";
import { ApplyJobModal } from "@/components/opportunities/apply-job-modal";
import { ShareBottomSheet } from "@/components/ui/share-bottom-sheet";
export default function OpportunityDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State for modals and UI
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showShareSheet, setShowShareSheet] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string>('pending');
  const [isSaved, setIsSaved] = useState(false);
  const [isApplying, setIsApplying] = useState(false);

  // Hooks
  const { data: opportunities } = useOpportunities();
  const { data: organizationOpportunities } = useOrganizationOpportunities();
  const applyToOpportunity = useApplyToOpportunity();

  // Find the opportunity and transform data structure
  const foundOpportunity = opportunities?.find(opp => opp.id === id) || organizationOpportunities?.find(opp => opp.id === id);
  
  // Transform opportunity data to match the expected structure
  const opportunity = foundOpportunity ? {
    ...foundOpportunity,
    company: foundOpportunity.organization_name || foundOpportunity.company || 'Not specified',
    location: foundOpportunity.location || (foundOpportunity.city && foundOpportunity.state ? `${foundOpportunity.city}, ${foundOpportunity.state}` : 'Remote/Location flexible'),
    art_form: foundOpportunity.art_forms?.[0] || 'Not specified',
    salary_range: foundOpportunity.salary_min && foundOpportunity.salary_max 
      ? `$${foundOpportunity.salary_min.toLocaleString()} - $${foundOpportunity.salary_max.toLocaleString()}`
      : foundOpportunity.salary_min 
        ? `From $${foundOpportunity.salary_min.toLocaleString()}`
        : foundOpportunity.salary_max 
          ? `Up to $${foundOpportunity.salary_max.toLocaleString()}`
          : null,
    status: 'Open', // Default status
    requirements: [], // Empty array for now
    views: foundOpportunity.views_count || 0,
    saves: 0, // Not available in current schema
    posted_by: foundOpportunity.user_id
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

  const handleSave = () => {
    setIsSaved(!isSaved);
    toast({
      title: isSaved ? "Removed from saved" : "Saved successfully",
      description: isSaved ? "Opportunity removed from your saved list" : "Opportunity added to your saved list"
    });
  };

  const handleShare = () => {
    setShowShareSheet(true);
  };
  if (!opportunity) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-4">Opportunity Not Found</h2>
          <Button onClick={() => navigate('/dashboard/opportunities')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Opportunities
          </Button>
        </div>
      </div>
    );
  }

  return <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate('/dashboard/opportunities')}>
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
                {opportunity.salary_range && <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    <span>{opportunity.salary_range}</span>
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
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Tags */}
          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline">{opportunity.art_form}</Badge>
            {opportunity.experience_level && <Badge variant="outline">{opportunity.experience_level}</Badge>}
            {opportunity.gender_preference && <Badge variant="outline">{opportunity.gender_preference}</Badge>}
          </div>

          {/* Requirements */}
          <div>
            <h3 className="font-semibold mb-3">Requirements</h3>
            <div className="space-y-2 text-muted-foreground">
              {/* Experience Level */}
              {opportunity.experience_level && <div className="flex items-center gap-2">
                  <span className="font-medium">Experience:</span>
                  <span>{opportunity.experience_level}</span>
                </div>}
              
              {/* Location */}
              {opportunity.location && <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span className="font-medium">Location:</span>
                  <span>{opportunity.location}</span>
                </div>}
              
              {/* Gender Preference */}
              {opportunity.gender_preference && <div className="flex items-center gap-2">
                  <span className="font-medium">Gender:</span>
                  <span>{opportunity.gender_preference}</span>
                </div>}
              
              {/* Salary Range */}
              {opportunity.salary_range && <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  <span className="font-medium">Salary:</span>
                  <span>{opportunity.salary_range}</span>
                </div>}
              
              {/* Deadline */}
              {opportunity.deadline && <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">Deadline:</span>
                  <span>{new Date(opportunity.deadline).toLocaleDateString()}</span>
                </div>}
              
              {/* Custom Requirements List */}
              {opportunity.requirements && opportunity.requirements.length > 0 && <div className="mt-3">
                  <ul className="list-disc list-inside space-y-1">
                    {opportunity.requirements.map((req, index) => <li key={index}>{req}</li>)}
                  </ul>
                </div>}
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2">Description</h3>
            <LinkRenderer 
              text={opportunity.description}
              className="text-muted-foreground whitespace-pre-wrap"
            />
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
              <span>Posted {new Date(opportunity.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Action Buttons */}
          {user && opportunity.posted_by !== user.id && opportunity.status === "Open" && <div className="flex gap-3 pt-4 border-t">
              <Button onClick={handleQuickApply} disabled={hasApplied || isApplying} className="flex-1">
                {isApplying ? "Applying..." : hasApplied ? (applicationStatus === 'Accepted' ? "Accepted" : "Applied") : "Apply Now"}
              </Button>
              {hasApplied && applicationStatus === 'Accepted' && (
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={() => navigate(`/dashboard/messages?user=${opportunity.posted_by}`)}
                  title="Message employer"
                >
                  <MessageCircle className="w-4 h-4" />
                </Button>
              )}
              <Button variant="outline" size="icon" onClick={handleSave}>
                {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
              </Button>
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
            </div>}

          {hasApplied && <div className={`border rounded-lg p-4 ${applicationStatus === 'Accepted' ? 'bg-blue-50 border-blue-200' : 'bg-green-50 border-green-200'}`}>
              <p className={`font-medium ${applicationStatus === 'Accepted' ? 'text-blue-800' : 'text-green-800'}`}>
                {applicationStatus === 'Accepted' 
                  ? '🎉 Your application has been accepted!' 
                  : '✓ You have already applied to this opportunity'
                }
              </p>
            </div>}
        </CardContent>
      </Card>

      {/* Apply Modal */}
      {showApplyModal && opportunity && <ApplyJobModal opportunity={opportunity} isOpen={showApplyModal} onClose={() => setShowApplyModal(false)} onSuccess={() => {
      setShowApplyModal(false);
      setHasApplied(true);
    }} />}

      <ShareBottomSheet
        open={showShareSheet}
        onOpenChange={setShowShareSheet}
        type="opportunity"
        data={{
          url: window.location.href,
          title: opportunity?.title,
          company: opportunity?.company
        }}
      />
    </div>;
}
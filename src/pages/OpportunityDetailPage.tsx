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
  return;
}
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Calendar, Eye, Trash2 } from "lucide-react";
import { Application } from "@/hooks/useApplications";
import { formatDistanceToNow } from "date-fns";

interface ApplicationCardProps {
  application: Application;
  onViewOpportunity: (opportunityId: string) => void;
  onRemoveApplication: (applicationId: string) => void;
  className?: string;
}

export function ApplicationCard({ 
  application, 
  onViewOpportunity, 
  onRemoveApplication, 
  className = "" 
}: ApplicationCardProps) {
  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      pending: "bg-blue-500/10 text-blue-600 border-blue-500/20",
      accepted: "bg-green-500/10 text-green-600 border-green-500/20",
      rejected: "bg-red-500/10 text-red-600 border-red-500/20"
    };
    return statusColors[status] || "bg-muted text-muted-foreground";
  };

  const getStatusText = (status: string) => {
    const statusText: Record<string, string> = {
      pending: "Pending",
      accepted: "Accepted",
      rejected: "Rejected"
    };
    return statusText[status] || status;
  };

  return (
    <Card className={`group hover:shadow-md transition-all duration-200 ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage 
                src={application.opportunities?.profiles?.avatar_url || ""} 
                alt={application.opportunities?.profiles?.display_name || application.opportunities?.company || "Organization"} 
              />
              <AvatarFallback className="bg-primary/10 text-primary text-sm">
                {(application.opportunities?.profiles?.display_name || application.opportunities?.company || "ORG")
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground mb-1 line-clamp-1 group-hover:text-primary transition-colors">
                {application.opportunities?.title || "Unknown Opportunity"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {application.opportunities?.profiles?.display_name || application.opportunities?.company || "Unknown Organization"}
              </p>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={`${getStatusColor(application.status)} flex-shrink-0 font-medium`}
          >
            {getStatusText(application.status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Opportunity Details */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{application.opportunities?.location || "Location not specified"}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Applied {formatDistanceToNow(new Date(application.created_at))} ago</span>
          </div>
        </div>

        {/* Cover Letter Preview */}
        {application.cover_letter && (
          <p className="text-sm text-muted-foreground line-clamp-2 bg-muted/50 p-3 rounded-md">
            <span className="font-medium">Cover Letter:</span> {application.cover_letter}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {application.opportunities?.type || "Unknown Type"}
            </Badge>
          </div>
          
          <div className="flex items-center gap-2">
            {application.status === 'accepted' && (
              <Button 
                variant="default"
                size="sm"
                onClick={() => {
                  // Navigate to messaging with opportunity context
                  window.location.href = `/messages?opportunity=${application.opportunity_id}`;
                }}
                className="text-xs bg-green-600 hover:bg-green-700"
              >
                Message
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onViewOpportunity(application.opportunity_id)}
              className="text-xs"
            >
              <Eye className="h-3 w-3 mr-1" />
              View Opportunity
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onRemoveApplication(application.id)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10 text-xs"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Remove
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
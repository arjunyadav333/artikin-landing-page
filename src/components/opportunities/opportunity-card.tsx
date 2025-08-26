import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Clock, DollarSign, Users, Eye, Bookmark } from "lucide-react";
import { Opportunity } from "@/hooks/useOpportunities";
import { formatDistanceToNow } from "date-fns";

interface OpportunityCardProps {
  opportunity: Opportunity;
  onApply: (id: string) => void;
  onSave?: (id: string) => void;
  className?: string;
}

export function OpportunityCard({ opportunity, onApply, onSave, className = "" }: OpportunityCardProps) {
  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return "Salary not specified";
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return `From $${min.toLocaleString()}`;
    if (max) return `Up to $${max.toLocaleString()}`;
    return "Salary not specified";
  };

  const getTypeColor = (type: string) => {
    const typeColors: Record<string, string> = {
      "Full-time": "bg-primary text-primary-foreground",
      "Contract": "bg-opportunity text-opportunity-foreground", 
      "Project-based": "bg-creative text-creative-foreground",
      "Freelance": "bg-connection text-connection-foreground",
      "Part-time": "bg-secondary text-secondary-foreground",
      "Internship": "bg-accent text-accent-foreground"
    };
    return typeColors[type] || "bg-muted text-muted-foreground";
  };

  return (
    <Card className={`group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <Avatar className="h-12 w-12 flex-shrink-0">
              <AvatarImage 
                src={opportunity.profiles?.avatar_url || ""} 
                alt={opportunity.profiles?.display_name || opportunity.company || "Organization"} 
              />
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {(opportunity.profiles?.display_name || opportunity.company || "ORG")
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-foreground mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                {opportunity.title}
              </h3>
              <p className="text-muted-foreground font-medium text-sm">
                {opportunity.profiles?.display_name || opportunity.company || "Unknown Organization"}
              </p>
            </div>
          </div>
          <Badge className={`${getTypeColor(opportunity.type)} flex-shrink-0`}>
            {opportunity.type}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Location, Salary, Posted Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
          <div className="flex items-center text-muted-foreground">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{opportunity.location || "Location not specified"}</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <DollarSign className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{formatSalary(opportunity.salary_min, opportunity.salary_max)}</span>
          </div>
          <div className="flex items-center text-muted-foreground">
            <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{formatDistanceToNow(new Date(opportunity.created_at))} ago</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
          {opportunity.description}
        </p>

        {/* Tags */}
        {opportunity.tags && opportunity.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {opportunity.tags.slice(0, 4).map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs font-medium">
                {tag}
              </Badge>
            ))}
            {opportunity.tags.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{opportunity.tags.length - 4} more
              </Badge>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-border/50">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-1" />
              {opportunity.applications_count || 0} applicants
            </div>
            <div className="flex items-center">
              <Eye className="h-4 w-4 mr-1" />
              {Math.floor(Math.random() * 100) + 50} views
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {onSave && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onSave(opportunity.id)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Bookmark className="h-4 w-4" />
              </Button>
            )}
            <Button 
              size="sm" 
              onClick={() => onApply(opportunity.id)}
              disabled={opportunity.user_applied}
              className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-medium px-6"
            >
              {opportunity.user_applied ? "Applied" : "Apply Now"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
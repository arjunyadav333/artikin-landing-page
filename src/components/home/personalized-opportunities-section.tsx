import { memo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink, MapPin, DollarSign, Calendar } from 'lucide-react';
import { usePersonalizedOpportunities, PersonalizedOpportunity } from '@/hooks/usePersonalizedOpportunities';
import { formatDistanceToNow } from 'date-fns';

const OpportunityCard = memo(({ opportunity }: { opportunity: PersonalizedOpportunity }) => {
  const formatSalaryRange = (min: number | null, max: number | null) => {
    if (!min && !max) return null;
    if (min && max) {
      return `$${(min / 1000).toFixed(0)}k - $${(max / 1000).toFixed(0)}k`;
    }
    if (min) return `$${(min / 1000).toFixed(0)}k+`;
    if (max) return `Up to $${(max / 1000).toFixed(0)}k`;
    return null;
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'full-time':
      case 'permanent':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'contract':
      case 'freelance':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'part-time':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'internship':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const salaryRange = formatSalaryRange(opportunity.salary_min, opportunity.salary_max);
  const companyName = opportunity.organization_name || opportunity.company || opportunity.profiles?.display_name;

  return (
    <Link to={`/opportunities/${opportunity.id}`} className="block">
      <div className="p-4 bg-muted/20 rounded-xl hover:bg-muted/40 transition-all duration-200 hover:shadow-sm border border-transparent hover:border-border/50">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-sm text-foreground truncate mb-1 hover:text-primary transition-colors">
              {opportunity.title}
            </h4>
            {companyName && (
              <p className="text-xs text-muted-foreground truncate">
                {companyName}
              </p>
            )}
          </div>
          <Badge 
            className={`text-xs px-2 py-1 font-medium ${getTypeColor(opportunity.type)}`}
          >
            {opportunity.type}
          </Badge>
        </div>

        <div className="space-y-2">
          {opportunity.location && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">{opportunity.location}</span>
            </div>
          )}
          
          {salaryRange && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <DollarSign className="w-3 h-3 flex-shrink-0" />
              <span>{salaryRange}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3 flex-shrink-0" />
            <span>{formatDistanceToNow(new Date(opportunity.created_at), { addSuffix: true })}</span>
          </div>

          {opportunity.art_forms && opportunity.art_forms.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {opportunity.art_forms.slice(0, 2).map((artform, index) => (
                <Badge key={index} variant="outline" className="text-xs px-2 py-0 h-5">
                  {artform}
                </Badge>
              ))}
              {opportunity.art_forms.length > 2 && (
                <Badge variant="outline" className="text-xs px-2 py-0 h-5">
                  +{opportunity.art_forms.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
});

OpportunityCard.displayName = "OpportunityCard";

const PersonalizedOpportunitiesSkeleton = memo(() => (
  <div className="space-y-3">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="p-4 bg-muted/20 rounded-xl">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <Skeleton className="h-4 w-3/4 mb-1" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-3 w-1/2" />
          <div className="flex gap-1">
            <Skeleton className="h-5 w-16" />
            <Skeleton className="h-5 w-12" />
          </div>
        </div>
      </div>
    ))}
  </div>
));

PersonalizedOpportunitiesSkeleton.displayName = "PersonalizedOpportunitiesSkeleton";

export const PersonalizedOpportunitiesSection = memo(() => {
  const { data: opportunities, isLoading, error } = usePersonalizedOpportunities(4);

  if (error) {
    return null; // Fail silently for better UX
  }

  return (
    <div className="bg-card/50 rounded-2xl border border-border/50 p-6 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-300 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg text-foreground">For You</h3>
        <Link to="/opportunities">
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-primary">
            See all <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </div>
      
      {isLoading ? (
        <PersonalizedOpportunitiesSkeleton />
      ) : opportunities && opportunities.length > 0 ? (
        <div className="space-y-3">
          {opportunities.slice(0, 3).map((opportunity) => (
            <OpportunityCard key={opportunity.id} opportunity={opportunity} />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p className="text-sm mb-3">No opportunities match your profile yet</p>
          <Link to="/opportunities">
            <Button variant="outline" size="sm">
              Browse All Opportunities
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
});

PersonalizedOpportunitiesSection.displayName = "PersonalizedOpportunitiesSection";
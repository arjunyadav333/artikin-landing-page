import React, { useState } from 'react';
import { Calendar, MapPin, Users, Edit, Settings, Eye, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreateOpportunityFlow } from './create-opportunity-flow';
import { useOrganizationOpportunities } from '@/hooks/useOrganizationOpportunities';
import { formatDistanceToNow, isAfter } from 'date-fns';

interface OpportunityListProps {
  onManageApplicants?: (opportunityId: string) => void;
}

export const OpportunityList: React.FC<OpportunityListProps> = ({
  onManageApplicants
}) => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editOpportunity, setEditOpportunity] = useState<any>(null);
  const { data: opportunities = [], isLoading } = useOrganizationOpportunities();

  const activeOpportunities = opportunities.filter(opp => opp.status === 'active');
  const closedOpportunities = opportunities.filter(opp => opp.status === 'closed');

  const formatDeadline = (deadline: string) => {
    const deadlineDate = new Date(deadline);
    const now = new Date();
    const isExpired = !isAfter(deadlineDate, now);
    
    if (isExpired) {
      return `Closed ${formatDistanceToNow(deadlineDate, { addSuffix: true })}`;
    }
    
    return `Closes ${formatDistanceToNow(deadlineDate, { addSuffix: true })}`;
  };

  const OpportunityCard = ({ opportunity }: { opportunity: any }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate">{opportunity.title}</h3>
            <p className="text-muted-foreground text-sm">{opportunity.organization_name}</p>
          </div>
          {opportunity.image_url && (
            <img 
              src={opportunity.image_url} 
              alt={opportunity.title}
              className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
            />
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Location */}
        {(opportunity.city || opportunity.state) && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>
              {[opportunity.city, opportunity.state].filter(Boolean).join(', ')}
            </span>
          </div>
        )}

        {/* Art Forms */}
        {opportunity.art_forms && opportunity.art_forms.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {opportunity.art_forms.slice(0, 3).map((artForm: string) => (
              <Badge key={artForm} variant="secondary" className="text-xs">
                {artForm}
              </Badge>
            ))}
            {opportunity.art_forms.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{opportunity.art_forms.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Deadline */}
        {opportunity.deadline && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4" />
            <span className={
              opportunity.status === 'closed' || !isAfter(new Date(opportunity.deadline), new Date())
                ? 'text-muted-foreground' 
                : 'text-foreground'
            }>
              {formatDeadline(opportunity.deadline)}
            </span>
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{opportunity.applications_count} applications</span>
          </div>
          {opportunity.views_count > 0 && (
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{opportunity.views_count} views</span>
            </div>
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {opportunity.description}
        </p>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setEditOpportunity(opportunity)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onManageApplicants?.(opportunity.id)}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Manage Applicants
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Your Opportunities</h2>
          <Button disabled>Loading...</Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-4 bg-muted rounded w-full"></div>
                  <div className="h-4 bg-muted rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Your Opportunities</h2>
        <Button 
          onClick={() => {
            setEditOpportunity(null);
            setCreateModalOpen(true);
          }}
          size="lg"
        >
          Post New Job Opportunity
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active">
            Active ({activeOpportunities.length})
          </TabsTrigger>
          <TabsTrigger value="closed">
            Closed ({closedOpportunities.length})
          </TabsTrigger>
          <TabsTrigger value="all">
            All ({opportunities.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeOpportunities.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activeOpportunities.map((opportunity) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <div className="text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No active opportunities</p>
                <p className="text-sm mt-1">Create your first job opportunity to get started</p>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="closed" className="space-y-4">
          {closedOpportunities.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {closedOpportunities.map((opportunity) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <div className="text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No closed opportunities</p>
                <p className="text-sm mt-1">Opportunities will appear here when they expire</p>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
          {opportunities.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {opportunities.map((opportunity) => (
                <OpportunityCard key={opportunity.id} opportunity={opportunity} />
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <div className="text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No opportunities yet</p>
                <p className="text-sm mt-1">Create your first job opportunity to get started</p>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Create/Edit Modal */}
      <CreateOpportunityFlow
        open={createModalOpen || !!editOpportunity}
        onOpenChange={(open) => {
          if (!open) {
            setCreateModalOpen(false);
            setEditOpportunity(null);
          } else {
            setCreateModalOpen(true);
          }
        }}
        editOpportunity={editOpportunity}
      />
    </div>
  );
};
import { OpportunityCard } from "@/components/opportunities/opportunity-card";
import { useToast } from "@/hooks/use-toast";

// Sample data for demo
const sampleOpportunities = [
  {
    id: "1",
    title: "Lead Actor for Feature Film",
    organization: {
      id: "org1",
      name: "Vikram Films",
      logo_url: ""
    },
    thumbnail_url: "",
    gender: "Any",
    artform: "Acting",
    location: "Hyderabad, Telangana",
    deadline: "2025-11-07T00:00:00Z",
    description: "We are looking for a talented lead actor for our upcoming feature film. This is an exciting opportunity to work with renowned directors and a professional crew.",
    posted_at: "2025-09-09T10:00:00Z",
    views_count: 234,
    applicants_count: 12,
    is_owner: true
  },
  {
    id: "2", 
    title: "Classical Dancer for Stage Performance",
    organization: {
      id: "org2",
      name: "Chennai Dance Academy",
      logo_url: ""
    },
    thumbnail_url: "",
    gender: "Female",
    artform: "Dance",
    location: "Chennai, Tamil Nadu",
    deadline: "2025-10-15T00:00:00Z",
    description: "Seeking experienced classical dancer for a prestigious stage performance. Bharatanatyam or Kuchipudi preferred.",
    posted_at: "2025-09-08T14:30:00Z",
    views_count: 189,
    applicants_count: 8,
    is_owner: false
  }
];

export default function OpportunityCardDemo() {
  const { toast } = useToast();

  const handleApply = (id: string) => {
    toast({
      title: "Application submitted",
      description: `Applied to opportunity ${id}`
    });
  };

  const handleEdit = (id: string) => {
    toast({
      title: "Edit opportunity",
      description: `Editing opportunity ${id}`
    });
  };

  const handleManageApplicants = (id: string) => {
    toast({
      title: "Manage applicants",
      description: `Managing applicants for opportunity ${id}`
    });
  };

  const handleDelete = (id: string) => {
    toast({
      title: "Opportunity deleted",
      description: `Deleted opportunity ${id}`,
      variant: "destructive"
    });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Opportunity Card Components</h1>
          <p className="text-muted-foreground mb-8">
            Role-aware opportunity cards with share, delete, and details functionality
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Organization View (Owner)</h2>
            <OpportunityCard
              opportunity={sampleOpportunities[0]}
              onEdit={handleEdit}
              onManageApplicants={handleManageApplicants}
              onDelete={handleDelete}
            />
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-4">Artist View (Non-owner)</h2>
            <OpportunityCard
              opportunity={sampleOpportunities[1]}
              onApply={handleApply}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
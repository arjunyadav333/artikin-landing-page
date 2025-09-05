import { Plus, Heart, FileText, Image, Video, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

interface PortfolioGridProps {
  portfolios?: any[];
  isLoading?: boolean;
  isOwnProfile: boolean;
}

// Mock portfolio data - replace with real data later
const portfolioPieces = [
  {
    id: 1,
    title: "Sustainable Fashion App",
    category: "UI/UX Design",
    image: "/placeholder.svg",
    likes: 145,
    description: "Complete mobile app design for sustainable fashion marketplace"
  },
  {
    id: 2,
    title: "Urban Landscapes Series",
    category: "Digital Art",
    image: "/placeholder.svg",
    likes: 203,
    description: "Digital illustration series exploring city moods"
  },
  {
    id: 3,
    title: "Brand Identity - Tech Startup",
    category: "Branding",
    image: "/placeholder.svg",
    likes: 178,
    description: "Complete brand identity including logo, colors, and guidelines"
  },
  {
    id: 4,
    title: "Motion Graphics Reel",
    category: "Animation",
    image: "/placeholder.svg",
    likes: 234,
    description: "Collection of motion graphics and animations"
  },
  {
    id: 5,
    title: "Photography Portfolio",
    category: "Photography",
    image: "/placeholder.svg",
    likes: 189,
    description: "Professional photography work and portraits"
  },
  {
    id: 6,
    title: "Web Design Collection",
    category: "Web Design",
    image: "/placeholder.svg",
    likes: 156,
    description: "Various web design projects and landing pages"
  }
];

export function PortfolioGrid({ portfolios = [], isLoading = false, isOwnProfile }: PortfolioGridProps) {
  // Use mock data if no portfolios provided
  const portfolioPieces = portfolios.length > 0 ? portfolios : [
    {
      id: 1,
      title: "Sustainable Fashion App",
      category: "UI/UX Design",
      image: "/placeholder.svg",
      likes: 145,
      description: "Complete mobile app design for sustainable fashion marketplace"
    },
    {
      id: 2,
      title: "Urban Landscapes Series",
      category: "Digital Art",
      image: "/placeholder.svg",
      likes: 203,
      description: "Digital illustration series exploring city moods"
    },
    {
      id: 3,
      title: "Brand Identity - Tech Startup",
      category: "Branding",
      image: "/placeholder.svg",
      likes: 178,
      description: "Complete brand identity including logo, colors, and guidelines"
    }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-[4/3] w-full" />
              <CardContent className="p-4">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2 mb-2" />
                <Skeleton className="h-3 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Add Project Button (Only for own profile) */}
      {isOwnProfile && (
        <div className="flex justify-center">
          <Button 
            variant="outline" 
            className="border-dashed border-2 border-primary/30 text-primary hover:bg-primary/10 h-20 px-8"
          >
            <Plus className="h-6 w-6 mr-2" />
            Add Project
          </Button>
        </div>
      )}

      {/* Portfolio Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolioPieces.map((piece) => (
          <div
            key={piece.id}
            className="group cursor-pointer bg-card rounded-lg overflow-hidden border border-border hover:border-primary/30 transition-all duration-200"
          >
            {/* Image */}
            <div className="aspect-[4/3] bg-gradient-to-br from-primary/10 to-primary/5 relative overflow-hidden">
              <img 
                src={piece.image} 
                alt={piece.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <div className="text-white text-center">
                  <p className="text-sm font-medium mb-1">{piece.category}</p>
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <Heart className="h-4 w-4" />
                    {piece.likes}
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                {piece.title}
              </h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {piece.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {portfolioPieces.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No portfolio pieces yet</p>
          <p className="text-muted-foreground text-sm mt-2">
            Portfolio projects will appear here
          </p>
        </div>
      )}
    </div>
  );
}
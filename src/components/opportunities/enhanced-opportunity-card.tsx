import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { MapPin, Clock, Users, Eye, Bookmark, Star } from "lucide-react";
import { Opportunity } from "@/hooks/useOpportunities";
import { formatDistanceToNow } from "date-fns";

interface EnhancedOpportunityCardProps {
  opportunity: Opportunity;
  onApply: (id: string) => void;
  onSave?: (id: string) => void;
  index: number;
  className?: string;
}

export function EnhancedOpportunityCard({ 
  opportunity, 
  onApply, 
  onSave, 
  index,
  className = "" 
}: EnhancedOpportunityCardProps) {
  const getTypeColor = (type: string) => {
    const typeColors: Record<string, string> = {
      "Full-time": "bg-primary/10 text-primary border-primary/20",
      "Contract": "bg-orange-500/10 text-orange-600 border-orange-500/20", 
      "Project-based": "bg-purple-500/10 text-purple-600 border-purple-500/20",
      "Freelance": "bg-green-500/10 text-green-600 border-green-500/20",
      "Part-time": "bg-blue-500/10 text-blue-600 border-blue-500/20",
      "Internship": "bg-indigo-500/10 text-indigo-600 border-indigo-500/20"
    };
    return typeColors[type] || "bg-muted text-muted-foreground";
  };

  const getUrgencyBadge = () => {
    const daysAgo = Math.floor(
      (Date.now() - new Date(opportunity.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    if (daysAgo <= 1) {
      return <Badge className="bg-red-100 text-red-700 border-red-200">New</Badge>;
    } else if (daysAgo <= 3) {
      return <Badge className="bg-orange-100 text-orange-700 border-orange-200">Hot</Badge>;
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.1,
        ease: "easeOut"
      }}
      whileHover={{ y: -8 }}
      className={className}
    >
      <Card className="group relative overflow-hidden bg-gradient-to-br from-card via-card to-card/95 hover:shadow-xl transition-all duration-300 border-border/50 hover:border-primary/20">
        {/* Gradient overlay for premium feel */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <CardHeader className="relative pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <motion.div
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              >
                <Avatar className="h-14 w-14 flex-shrink-0 ring-2 ring-transparent group-hover:ring-primary/20 transition-all duration-300">
                  <AvatarImage 
                    src={opportunity.profiles?.avatar_url || ""} 
                    alt={opportunity.profiles?.display_name || opportunity.company || "Organization"} 
                  />
                  <AvatarFallback className="bg-gradient-to-br from-primary/10 to-accent/10 text-primary font-semibold text-lg">
                    {(opportunity.profiles?.display_name || opportunity.company || "ORG")
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-start gap-2">
                  <h3 className="text-xl font-bold text-foreground line-clamp-2 group-hover:text-primary transition-colors duration-200 flex-1">
                    {opportunity.title}
                  </h3>
                  {getUrgencyBadge()}
                </div>
                
                <div className="flex items-center gap-2">
                  <p className="text-muted-foreground font-medium text-base">
                    {opportunity.profiles?.display_name || opportunity.company || "Unknown Organization"}
                  </p>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`h-3 w-3 ${i < 4 ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} 
                      />
                    ))}
                    <span className="text-xs text-muted-foreground ml-1">(4.2)</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <Badge 
                variant="outline" 
                className={`${getTypeColor(opportunity.type)} font-medium px-3 py-1`}
              >
                {opportunity.type}
              </Badge>
              
              {onSave && (
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => onSave(opportunity.id)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-accent hover:bg-accent/10"
                  >
                    <Bookmark className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative space-y-5">
          {/* Key Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
            <motion.div 
              className="flex items-center text-muted-foreground group-hover:text-foreground transition-colors"
              whileHover={{ x: 4 }}
            >
              <MapPin className="h-4 w-4 mr-2 flex-shrink-0 text-primary" />
              <span className="truncate font-medium">{opportunity.location || "Remote"}</span>
            </motion.div>
            
            <motion.div 
              className="flex items-center text-muted-foreground group-hover:text-foreground transition-colors"
              whileHover={{ x: 4 }}
            >
              <Clock className="h-4 w-4 mr-2 flex-shrink-0 text-orange-600" />
              <span className="truncate font-medium">{formatDistanceToNow(new Date(opportunity.created_at))} ago</span>
            </motion.div>
          </div>

          {/* Description with gradient fade */}
          <div className="relative">
            <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 group-hover:text-foreground/90 transition-colors">
              {opportunity.description}
            </p>
            <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-t from-card to-transparent opacity-50 group-hover:opacity-30 transition-opacity" />
          </div>

          {/* Enhanced Tags */}
          {opportunity.tags && opportunity.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {opportunity.tags.slice(0, 4).map((tag, tagIndex) => (
                <motion.div
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * tagIndex }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Badge 
                    variant="secondary" 
                    className="text-xs font-medium bg-muted/50 hover:bg-primary/10 hover:text-primary transition-colors cursor-pointer"
                  >
                    {tag}
                  </Badge>
                </motion.div>
              ))}
              {opportunity.tags.length > 4 && (
                <Badge variant="outline" className="text-xs bg-muted/30">
                  +{opportunity.tags.length - 4} more
                </Badge>
              )}
            </div>
          )}

          {/* Enhanced Footer */}
          <div className="flex items-center justify-between pt-5 border-t border-border/50 group-hover:border-primary/20 transition-colors">
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <motion.div 
                className="flex items-center gap-1 group-hover:text-foreground transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                <Users className="h-4 w-4 text-blue-600" />
                <span className="font-medium">{opportunity.applications_count || 0}</span>
                <span>applicants</span>
              </motion.div>
              
              <motion.div 
                className="flex items-center gap-1 group-hover:text-foreground transition-colors"
                whileHover={{ scale: 1.05 }}
              >
                <Eye className="h-4 w-4 text-purple-600" />
                <span className="font-medium">{Math.floor(Math.random() * 200) + 100}</span>
                <span>views</span>
              </motion.div>
            </div>
            
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                size="sm" 
                onClick={() => onApply(opportunity.id)}
                disabled={opportunity.user_applied}
                className={`
                  font-semibold px-6 py-2 rounded-xl shadow-lg transition-all duration-300
                  ${opportunity.user_applied 
                    ? 'bg-muted text-muted-foreground cursor-not-allowed' 
                    : 'bg-gradient-to-r from-primary via-primary to-accent hover:from-primary/90 hover:via-primary/90 hover:to-accent/90 text-white shadow-primary/25 hover:shadow-lg hover:shadow-primary/30'
                  }
                `}
              >
                {opportunity.user_applied ? (
                  <>
                    ✓ Applied
                  </>
                ) : (
                  <>
                    Apply Now
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
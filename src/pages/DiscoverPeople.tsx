import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowLeft, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FilterDropdown, FilterOptions } from "@/components/connections/filter-dropdown";
import { UserCard } from "@/components/connections/user-card";
import { useSuggestedUsers, useSearchUsers } from "@/hooks/useConnections";
import { motion } from "framer-motion";

const DiscoverPeople = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({
    showArtistsOnly: false,
    showOrganizationsOnly: false,
    sortBy: 'newest'
  });

  const { data: suggestedUsers = [], isLoading: loadingSuggestions } = useSuggestedUsers();
  const { data: searchResults = [], isLoading: loadingSearch } = useSearchUsers(searchTerm);

  const displayUsers = useMemo(() => {
    const users = searchTerm ? searchResults : suggestedUsers;
    if (!users) return [];
    
    return users
      .filter(user => {
        // Type filters
        if (filters.showArtistsOnly && user.role !== 'artist') return false;
        if (filters.showOrganizationsOnly && user.role !== 'organization') return false;
        
        // Artform filter
        if (filters.artformFilter && user.artform !== filters.artformFilter) return false;
        
        return true;
      })
      .sort((a, b) => {
        switch (filters.sortBy) {
          case 'alphabetical-az':
            return a.display_name?.localeCompare(b.display_name) || 0;
          case 'alphabetical-za':
            return b.display_name?.localeCompare(a.display_name) || 0;
          case 'most-popular':
            // Follower count sorting will be implemented
            return 0;
          case 'newest':
          default:
            return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        }
      });
  }, [suggestedUsers, searchResults, searchTerm, filters]);

  const isLoading = searchTerm ? loadingSearch : loadingSuggestions;

  const handleBack = () => {
    navigate('/connections');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-20 md:pb-8">
      <div className="container max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4 mb-6"
        >
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBack}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Discover People</h1>
            <p className="text-muted-foreground">Find new people to connect with</p>
          </div>
        </motion.div>

        {/* Search Bar & Filters */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search for new people to follow..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <FilterDropdown 
              filters={filters} 
              onFiltersChange={setFilters} 
              showPopularitySort={true}
            />
          </div>
        </motion.div>

        {/* Suggestions or Search Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {!searchTerm && (
            <div className="mb-4">
              <h2 className="text-lg font-semibold mb-2">Suggested for you</h2>
              <p className="text-sm text-muted-foreground">People you might want to follow</p>
            </div>
          )}
          
          <div className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : displayUsers.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-muted-foreground">
                    {searchTerm ? `${displayUsers.length} people found` : `${displayUsers.length} suggestions`}
                  </p>
                </div>
                {displayUsers.map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <UserCard user={user} />
                  </motion.div>
                ))}
              </>
            ) : (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-muted-foreground mb-2">
                  {searchTerm || Object.values(filters).some(v => v && v !== 'newest') 
                    ? 'No people match your search criteria' 
                    : 'No new people to discover'}
                </h3>
                <p className="text-muted-foreground mb-6">
                  {searchTerm || Object.values(filters).some(v => v && v !== 'newest')
                    ? 'Try adjusting your search terms or filters to find more people.' 
                    : 'You\'ve discovered everyone! Check back later for new members.'}
                </p>
                {(searchTerm || Object.values(filters).some(v => v && v !== 'newest')) && (
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm("");
                      setFilters({
                        showArtistsOnly: false,
                        showOrganizationsOnly: false,
                        sortBy: 'newest'
                      });
                    }}
                  >
                    Clear filters
                  </Button>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DiscoverPeople;
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FilterDropdown, FilterOptions } from "@/components/connections/filter-dropdown";
import { UserCard } from "@/components/connections/user-card";
import { useConnections } from "@/hooks/useConnections";
import { useCurrentProfile } from "@/hooks/useProfiles";
import { motion } from "framer-motion";

const Connections = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({
    showArtistsOnly: false,
    showOrganizationsOnly: false,
    sortBy: 'newest'
  });

  const { data: currentProfile } = useCurrentProfile();
  const { data: following = [], isLoading: followingLoading } = useConnections(
    currentProfile?.user_id, 
    'following'
  );
  const { data: followers = [], isLoading: followersLoading } = useConnections(
    currentProfile?.user_id, 
    'followers'
  );

  const filterAndSortUsers = (users: any[], type: 'following' | 'followers') => {
    if (!users) return [];
    
    return users
      .map(conn => type === 'following' ? conn.following : conn.follower)
      .filter(user => {
        if (!user) return false;
        
        // Search filter
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          const matchesSearch = 
            user.display_name?.toLowerCase().includes(searchLower) ||
            user.username?.toLowerCase().includes(searchLower) ||
            user.bio?.toLowerCase().includes(searchLower);
          if (!matchesSearch) return false;
        }
        
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
          case 'newest':
          default:
            return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        }
      });
  };

  const filteredFollowing = useMemo(() => 
    filterAndSortUsers(following, 'following'), 
    [following, searchTerm, filters]
  );
  
  const filteredFollowers = useMemo(() => 
    filterAndSortUsers(followers, 'followers'), 
    [followers, searchTerm, filters]
  );

  const handleDiscoverPeople = () => {
    navigate('/connections/discover');
  };

  const handleRemoveFollower = (userId: string) => {
      // Remove follower functionality will be implemented
    };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-20 md:pb-8">
      <div className="container max-w-4xl mx-auto px-4 py-6">
        {/* Search Bar & Filters */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex gap-4 items-center mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search among followers and following..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <FilterDropdown filters={filters} onFiltersChange={setFilters} />
          </div>

          {/* Discover People Button */}
          <Button 
            onClick={handleDiscoverPeople}
            className="w-full bg-[#007bff] hover:bg-[#007bff]/90 text-white font-semibold py-3 rounded-lg"
            size="lg"
          >
            <Users className="h-5 w-5 mr-2" />
            Discover People
          </Button>
        </motion.div>

        {/* Tabs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Tabs defaultValue="followers" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="followers">
                Followers ({followersLoading ? '...' : filteredFollowers.length})
              </TabsTrigger>
              <TabsTrigger value="following">
                Following ({followingLoading ? '...' : filteredFollowing.length})
              </TabsTrigger>
            </TabsList>

            {/* Followers Tab */}
            <TabsContent value="followers" className="mt-6">
              <div className="space-y-4">
                {followersLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : filteredFollowers.length > 0 ? (
                  filteredFollowers.map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <UserCard 
                        user={user} 
                        isFollower={true}
                        onRemoveFollower={handleRemoveFollower}
                      />
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                      {searchTerm || Object.values(filters).some(v => v && v !== 'newest') 
                        ? 'No followers match your search criteria' 
                        : 'No followers yet'}
                    </h3>
                    <p className="text-muted-foreground">
                      {!searchTerm && !Object.values(filters).some(v => v && v !== 'newest')
                        ? 'When people follow you, they\'ll appear here.'
                        : 'Try adjusting your search or filters.'}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Following Tab */}
            <TabsContent value="following" className="mt-6">
              <div className="space-y-4">
                {followingLoading ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : filteredFollowing.length > 0 ? (
                  filteredFollowing.map((user, index) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <UserCard 
                        user={user} 
                        isFollowing={true}
                      />
                    </motion.div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                      {searchTerm || Object.values(filters).some(v => v && v !== 'newest') 
                        ? 'No following match your search criteria' 
                        : 'Not following anyone yet'}
                    </h3>
                    <p className="text-muted-foreground">
                      {!searchTerm && !Object.values(filters).some(v => v && v !== 'newest')
                        ? 'Start following people to see them here.'
                        : 'Try adjusting your search or filters.'}
                    </p>
                    {(!searchTerm && !Object.values(filters).some(v => v && v !== 'newest')) && (
                      <Button 
                        onClick={handleDiscoverPeople}
                        className="mt-4 bg-[#007bff] hover:bg-[#007bff]/90"
                      >
                        Discover People
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default Connections;
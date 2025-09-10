import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FilterDropdown, FilterOptions } from "@/components/connections/filter-dropdown";
import { ConnectionRow } from "@/components/connections/connection-row";
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
    // TODO: Implement remove follower functionality
    console.log('Remove follower:', userId);
  };

  // Combined connections for "All" tab
  const allConnections = useMemo(() => {
    // Safety check: ensure arrays exist and are arrays
    const safeFilteredFollowing = Array.isArray(filteredFollowing) ? filteredFollowing : [];
    const safeFilteredFollowers = Array.isArray(filteredFollowers) ? filteredFollowers : [];
    
    const followingUsers = safeFilteredFollowing.map(user => ({ ...user, relation: 'following' as const }));
    const followerUsers = safeFilteredFollowers.map(user => ({ ...user, relation: 'follower' as const }));
    
    // Merge and deduplicate by user_id
    const combined = [...followingUsers, ...followerUsers];
    const unique = combined.reduce((acc, user) => {
      const existing = acc.find(u => u.user_id === user.user_id);
      if (existing) {
        // If both following and follower, mark as mutual
        existing.relation = 'mutual';
      } else {
        acc.push(user);
      }
      return acc;
    }, [] as any[]);
    
    return unique.sort((a, b) => a.display_name?.localeCompare(b.display_name) || 0);
  }, [filteredFollowing, filteredFollowers]);

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      {/* Full-width responsive container */}
      <div className="w-full max-w-none">
        {/* Top search bar */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-4 items-center"
            >
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search connections..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-12"
                />
              </div>
              <FilterDropdown filters={filters} onFiltersChange={setFilters} />
              <Button 
                onClick={handleDiscoverPeople}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-6"
                size="default"
              >
                <Users className="h-4 w-4 mr-2" />
                Discover
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Tab row */}
        <div className="max-w-4xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="all">
                  All ({allConnections?.length || 0})
                </TabsTrigger>
                <TabsTrigger value="followers">
                  Followers ({followersLoading ? '...' : (filteredFollowers?.length || 0)})
                </TabsTrigger>
                <TabsTrigger value="following">
                  Following ({followingLoading ? '...' : (filteredFollowing?.length || 0)})
                </TabsTrigger>
              </TabsList>

              {/* All Tab */}
              <TabsContent value="all" className="mt-0">
                <div className="bg-card rounded-lg border overflow-hidden">
                  {allConnections && allConnections.length > 0 ? (
                    allConnections.map((user, index) => (
                      <motion.div
                        key={user.user_id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                      >
                        <ConnectionRow 
                          user={user} 
                          relation={user.relation}
                        />
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-12 px-4">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                        {searchTerm || Object.values(filters).some(v => v && v !== 'newest') 
                          ? 'No connections match your search' 
                          : 'No connections yet'}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {!searchTerm && !Object.values(filters).some(v => v && v !== 'newest')
                          ? 'Start connecting with people to see them here.'
                          : 'Try adjusting your search or filters.'}
                      </p>
                      {(!searchTerm && !Object.values(filters).some(v => v && v !== 'newest')) && (
                        <Button 
                          onClick={handleDiscoverPeople}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Discover People
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Followers Tab */}
              <TabsContent value="followers" className="mt-0">
                <div className="bg-card rounded-lg border overflow-hidden">
                  {followersLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : filteredFollowers && filteredFollowers.length > 0 ? (
                    filteredFollowers.map((user, index) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                      >
                        <ConnectionRow 
                          user={user} 
                          relation="follow_back"
                          onRemoveFollower={handleRemoveFollower}
                        />
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-12 px-4">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                        {searchTerm || Object.values(filters).some(v => v && v !== 'newest') 
                          ? 'No followers match your search' 
                          : 'No followers yet'}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {!searchTerm && !Object.values(filters).some(v => v && v !== 'newest')
                          ? 'When people follow you, they\'ll appear here.'
                          : 'Try adjusting your search or filters.'}
                      </p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Following Tab */}
              <TabsContent value="following" className="mt-0">
                <div className="bg-card rounded-lg border overflow-hidden">
                  {followingLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : filteredFollowing && filteredFollowing.length > 0 ? (
                    filteredFollowing.map((user, index) => (
                      <motion.div
                        key={user.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                      >
                        <ConnectionRow 
                          user={user} 
                          relation="mutual"
                        />
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-12 px-4">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                        {searchTerm || Object.values(filters).some(v => v && v !== 'newest') 
                          ? 'No following match your search' 
                          : 'Not following anyone yet'}
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        {!searchTerm && !Object.values(filters).some(v => v && v !== 'newest')
                          ? 'Start following people to see them here.'
                          : 'Try adjusting your search or filters.'}
                      </p>
                      {(!searchTerm && !Object.values(filters).some(v => v && v !== 'newest')) && (
                        <Button 
                          onClick={handleDiscoverPeople}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <Users className="h-4 w-4 mr-2" />
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
    </div>
  );
};

export default Connections;
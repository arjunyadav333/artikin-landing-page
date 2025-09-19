import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { UserRow } from "@/components/connections/user-row";
import { useConnections } from "@/hooks/useConnections";
import { useCurrentProfile } from "@/hooks/useProfiles";
import { Skeleton } from "@/components/ui/skeleton";

type SortOption = 'newest' | 'alphabetical' | 'relevant';

const Connections = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [activeTab, setActiveTab] = useState('following');

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
        
        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'alphabetical':
            return a.display_name?.localeCompare(b.display_name) || 0;
          case 'relevant':
            // TODO: Implement relevance sorting
            return 0;
          case 'newest':
          default:
            return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        }
      });
  };

  const filteredFollowing = useMemo(() => 
    filterAndSortUsers(following, 'following'), 
    [following, searchTerm, sortBy]
  );
  
  const filteredFollowers = useMemo(() => 
    filterAndSortUsers(followers, 'followers'), 
    [followers, searchTerm, sortBy]
  );

  const handleRemoveFollower = (userId: string) => {
    // Remove follower functionality will be implemented
  };

  const UserRowSkeleton = () => (
    <div className="flex items-center px-6 py-4">
      <Skeleton className="h-12 w-12 rounded-full mr-4" />
      <div className="flex-1">
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-9 w-20 rounded-xl" />
    </div>
  );

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      <div className="w-full px-4 py-6">
        {/* Search and Filter */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search connections"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-11 rounded-xl border-border bg-background focus:ring-2 focus:ring-ring focus:border-ring text-sm"
              />
            </div>
            {/* Filter Dropdown - Icon Only */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="rounded-xl px-3">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover border shadow-lg rounded-xl">
                <DropdownMenuItem onClick={() => setSortBy('newest')}>
                  Most Recent
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('alphabetical')}>
                  Alphabetical
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('relevant')}>
                  Most Relevant
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Following and Followers Buttons */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            <Button
              onClick={() => setActiveTab('following')}
              variant={activeTab === 'following' ? 'default' : 'outline'}
              className="text-sm font-medium rounded-xl w-full sm:w-auto"
            >
              Following ({followingLoading ? '...' : filteredFollowing.length})
            </Button>
            <Button
              onClick={() => setActiveTab('followers')}
              variant={activeTab === 'followers' ? 'default' : 'outline'}
              className="text-sm font-medium rounded-xl w-full sm:w-auto"
            >
              Followers ({followersLoading ? '...' : filteredFollowers.length})
            </Button>
          </div>
        </div>

        {/* Content */}
        <div>
          {activeTab === 'following' && (
            <div>
              {followingLoading ? (
                <div className="divide-y divide-border">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <UserRowSkeleton key={i} />
                  ))}
                </div>
              ) : filteredFollowing.length > 0 ? (
                <div className="divide-y divide-border">
                  {filteredFollowing.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      isFollowing={true}
                      showOptionsMenu={true}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 px-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.83 0-1.54.5-1.85 1.22l-2.26 5.34c-.24.57.1 1.23.72 1.23.24 0 .47-.1.64-.26L16 14l1 3v5h3zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89 2 2zm2.25 2h-4.5c-.83 0-1.54.5-1.85 1.22L.74 12.63A1.5 1.5 0 0 0 2.09 14H3.5v8h3v-6.5h2V22h3v-6c0-1.1-.9-2-2-2h-1l1.8-3.1c.2-.34.3-.73.3-1.1v-2.8C10.6 6.45 10.15 6 9.6 6z"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {searchTerm ? 'No results found' : 'No following yet'}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    {searchTerm ? 'Try a different search term.' : 'When you follow people, they\'ll appear here.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'followers' && (
            <div>
              {followersLoading ? (
                <div className="divide-y divide-border">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <UserRowSkeleton key={i} />
                  ))}
                </div>
              ) : filteredFollowers.length > 0 ? (
                <div className="divide-y divide-border">
                  {filteredFollowers.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      isFollower={true}
                      showOptionsMenu={true}
                      onRemoveFollower={handleRemoveFollower}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 px-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.83 0-1.54.5-1.85 1.22l-2.26 5.34c-.24.57.1 1.23.72 1.23.24 0 .47-.1.64-.26L16 14l1 3v5h3zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89 2 2zm2.25 2h-4.5c-.83 0-1.54.5-1.85 1.22L.74 12.63A1.5 1.5 0 0 0 2.09 14H3.5v8h3v-6.5h2V22h3v-6c0-1.1-.9-2-2-2h-1l1.8-3.1c.2-.34.3-.73.3-1.1v-2.8C10.6 6.45 10.15 6 9.6 6z"/>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {searchTerm ? 'No results found' : 'No followers yet'}
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    {searchTerm ? 'Try a different search term.' : 'When people follow you, they\'ll appear here.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Connections;
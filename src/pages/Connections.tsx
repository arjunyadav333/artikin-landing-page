import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Search, ChevronDown } from "lucide-react";
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

  const getSortDisplayText = (sort: SortOption) => {
    switch (sort) {
      case 'alphabetical': return 'Alphabetical';
      case 'relevant': return 'Most Relevant';
      case 'newest': 
      default: return 'Most Recent';
    }
  };

  const UserRowSkeleton = () => (
    <div className="flex items-center h-16 px-4 border-b border-gray-100">
      <Skeleton className="h-12 w-12 rounded-full mr-3" />
      <div className="flex-1">
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-8 w-20 rounded-full" />
    </div>
  );

  return (
    <div className="min-h-screen bg-white pb-20 md:pb-8">
      <div className="max-w-2xl mx-auto md:max-w-3xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-4 z-40">
          <div className="text-center md:text-left">
            <h1 className="text-16px font-semibold text-gray-900 md:text-16px">
              Connections
            </h1>
            <p className="text-13px font-medium text-gray-600 mt-1">
              Followers • {followersLoading ? '...' : filteredFollowers.length} | Following • {followingLoading ? '...' : filteredFollowing.length}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="sticky top-[73px] bg-white border-b border-gray-100 px-4 py-3 z-30">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-transparent p-0 h-auto gap-2">
              <TabsTrigger 
                value="following" 
                className="px-4 py-1.5 text-14px font-medium rounded-full data-[state=active]:bg-accent data-[state=active]:text-white data-[state=inactive]:bg-gray-100 data-[state=inactive]:text-gray-700 border-0"
              >
                Following
              </TabsTrigger>
              <TabsTrigger 
                value="followers" 
                className="px-4 py-1.5 text-14px font-medium rounded-full data-[state=active]:bg-accent data-[state=active]:text-white data-[state=inactive]:bg-gray-100 data-[state=inactive]:text-gray-700 border-0"
              >
                Followers
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Search Bar */}
        <div className="sticky top-[125px] bg-white px-4 py-3 border-b border-gray-50 z-20">
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-lg mx-auto md:mx-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search connections"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-10 rounded-full border border-gray-200 bg-white focus:ring-2 focus:ring-accent focus:border-accent text-14px"
              />
            </div>
            {/* Sort Dropdown - Desktop */}
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="text-14px font-medium rounded-full">
                    {getSortDisplayText(sortBy)}
                    <ChevronDown className="ml-1 h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-white border shadow-lg">
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
        </div>

        {/* Content */}
        <Tabs value={activeTab}>
          {/* Following Tab */}
          <TabsContent value="following" className="m-0">
            <div className="bg-white">
              {followingLoading ? (
                <div className="space-y-0">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <UserRowSkeleton key={i} />
                  ))}
                </div>
              ) : filteredFollowing.length > 0 ? (
                <div>
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
                <div className="text-center py-16 px-4">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.83 0-1.54.5-1.85 1.22l-2.26 5.34c-.24.57.1 1.23.72 1.23.24 0 .47-.1.64-.26L16 14l1 3v5h3zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm2.25 2h-4.5c-.83 0-1.54.5-1.85 1.22L.74 12.63A1.5 1.5 0 0 0 2.09 14H3.5v8h3v-6.5h2V22h3v-6c0-1.1-.9-2-2-2h-1l1.8-3.1c.2-.34.3-.73.3-1.1v-2.8C10.6 6.45 10.15 6 9.6 6z"/>
                    </svg>
                  </div>
                  <h3 className="text-17px font-semibold text-gray-900 mb-2">
                    {searchTerm ? 'No results found' : 'No following yet'}
                  </h3>
                  <p className="text-15px text-gray-500">
                    {searchTerm ? 'Try a different search term.' : 'When you follow people, they\'ll appear here.'}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Followers Tab */}
          <TabsContent value="followers" className="m-0">
            <div className="bg-white">
              {followersLoading ? (
                <div className="space-y-0">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <UserRowSkeleton key={i} />
                  ))}
                </div>
              ) : filteredFollowers.length > 0 ? (
                <div>
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
                <div className="text-center py-16 px-4">
                  <div className="text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 18v-6h2.5l-2.54-7.63A1.5 1.5 0 0 0 18.54 8H17c-.83 0-1.54.5-1.85 1.22l-2.26 5.34c-.24.57.1 1.23.72 1.23.24 0 .47-.1.64-.26L16 14l1 3v5h3zM12.5 11.5c.83 0 1.5-.67 1.5-1.5s-.67-1.5-1.5-1.5S11 9.17 11 10s.67 1.5 1.5 1.5zM5.5 6c1.11 0 2-.89 2-2s-.89-2-2-2-2 .89-2 2 .89 2 2 2zm2.25 2h-4.5c-.83 0-1.54.5-1.85 1.22L.74 12.63A1.5 1.5 0 0 0 2.09 14H3.5v8h3v-6.5h2V22h3v-6c0-1.1-.9-2-2-2h-1l1.8-3.1c.2-.34.3-.73.3-1.1v-2.8C10.6 6.45 10.15 6 9.6 6z"/>
                    </svg>
                  </div>
                  <h3 className="text-17px font-semibold text-gray-900 mb-2">
                    {searchTerm ? 'No results found' : 'No followers yet'}
                  </h3>
                  <p className="text-15px text-gray-500">
                    {searchTerm ? 'Try a different search term.' : 'When people follow you, they\'ll appear here.'}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Connections;
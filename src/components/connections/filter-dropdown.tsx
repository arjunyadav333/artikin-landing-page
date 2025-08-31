import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Filter, ChevronDown } from "lucide-react";

export interface FilterOptions {
  showArtistsOnly: boolean;
  showOrganizationsOnly: boolean;
  artformFilter?: string;
  sortBy: 'newest' | 'alphabetical-az' | 'alphabetical-za' | 'most-popular';
}

interface FilterDropdownProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  showPopularitySort?: boolean;
}

const artforms = [
  'actor', 'dancer', 'model', 'photographer', 'videographer', 
  'instrumentalist', 'singer', 'drawing', 'painting'
];

export function FilterDropdown({ filters, onFiltersChange, showPopularitySort = false }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value };
    
    // Handle mutual exclusivity for artist/organization filters
    if (key === 'showArtistsOnly' && value) {
      newFilters.showOrganizationsOnly = false;
    }
    if (key === 'showOrganizationsOnly' && value) {
      newFilters.showArtistsOnly = false;
    }
    
    onFiltersChange(newFilters);
  };

  const clearArtformFilter = () => {
    updateFilter('artformFilter', undefined);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.showArtistsOnly) count++;
    if (filters.showOrganizationsOnly) count++;
    if (filters.artformFilter) count++;
    if (filters.sortBy !== 'newest') count++;
    return count;
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filters
          {getActiveFiltersCount() > 0 && (
            <span className="bg-primary text-primary-foreground rounded-full text-xs px-1.5 py-0.5 min-w-[1.25rem] h-5 flex items-center justify-center">
              {getActiveFiltersCount()}
            </span>
          )}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={filters.showArtistsOnly}
          onCheckedChange={(checked) => updateFilter('showArtistsOnly', checked)}
        >
          Artists Only
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={filters.showOrganizationsOnly}
          onCheckedChange={(checked) => updateFilter('showOrganizationsOnly', checked)}
        >
          Organizations Only
        </DropdownMenuCheckboxItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="flex items-center justify-between">
          Filter by Artform
          {filters.artformFilter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearArtformFilter}
              className="h-6 px-2 text-xs"
            >
              Clear
            </Button>
          )}
        </DropdownMenuLabel>
        {artforms.map((artform) => (
          <DropdownMenuCheckboxItem
            key={artform}
            checked={filters.artformFilter === artform}
            onCheckedChange={(checked) => {
              updateFilter('artformFilter', checked ? artform : undefined);
            }}
            className="capitalize"
          >
            {artform}
          </DropdownMenuCheckboxItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel>Sort By</DropdownMenuLabel>
        <DropdownMenuItem onClick={() => updateFilter('sortBy', 'newest')}>
          Newest {filters.sortBy === 'newest' && '✓'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => updateFilter('sortBy', 'alphabetical-az')}>
          A-Z {filters.sortBy === 'alphabetical-az' && '✓'}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => updateFilter('sortBy', 'alphabetical-za')}>
          Z-A {filters.sortBy === 'alphabetical-za' && '✓'}
        </DropdownMenuItem>
        {showPopularitySort && (
          <DropdownMenuItem onClick={() => updateFilter('sortBy', 'most-popular')}>
            Most Popular {filters.sortBy === 'most-popular' && '✓'}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
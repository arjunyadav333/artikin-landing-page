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
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter, ChevronDown, ChevronRight, X } from "lucide-react";

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

const defaultFilters: FilterOptions = {
  showArtistsOnly: false,
  showOrganizationsOnly: false,
  sortBy: 'newest'
};

export function FilterDropdown({ filters, onFiltersChange, showPopularitySort = false }: FilterDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState<FilterOptions>(filters);

  // Reset temp filters when dropdown opens
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setTempFilters(filters);
    }
    setIsOpen(open);
  };

  const updateTempFilter = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...tempFilters, [key]: value };
    
    // Handle mutual exclusivity for artist/organization filters
    if (key === 'showArtistsOnly' && value) {
      newFilters.showOrganizationsOnly = false;
    }
    if (key === 'showOrganizationsOnly' && value) {
      newFilters.showArtistsOnly = false;
    }
    
    setTempFilters(newFilters);
  };

  const clearTempArtformFilter = () => {
    updateTempFilter('artformFilter', undefined);
  };

  const handleApply = () => {
    onFiltersChange(tempFilters);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setTempFilters(filters);
    setIsOpen(false);
  };

  const handleClearAll = () => {
    setTempFilters(defaultFilters);
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
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
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
      <DropdownMenuContent align="end" className="w-64 max-h-[400px] overflow-y-auto">
        
        {/* Filter by Type */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center justify-between">
            <span>Filter by Type</span>
            <span className="ml-auto text-xs text-muted-foreground">
              {tempFilters.showArtistsOnly ? 'Artists Only' : 
               tempFilters.showOrganizationsOnly ? 'Organizations Only' : 
               'All Types'}
            </span>
            <ChevronRight className="h-4 w-4" />
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => {
              updateTempFilter('showArtistsOnly', false);
              updateTempFilter('showOrganizationsOnly', false);
            }}>
              All Types {(!tempFilters.showArtistsOnly && !tempFilters.showOrganizationsOnly) && '✓'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              updateTempFilter('showArtistsOnly', true);
              updateTempFilter('showOrganizationsOnly', false);
            }}>
              Artists Only {tempFilters.showArtistsOnly && '✓'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => {
              updateTempFilter('showOrganizationsOnly', true);
              updateTempFilter('showArtistsOnly', false);
            }}>
              Organizations Only {tempFilters.showOrganizationsOnly && '✓'}
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        
        <DropdownMenuSeparator />
        
        {/* Filter by Artform - Multiple Selection */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center justify-between">
            <span>Filter by Artform</span>
            <span className="ml-auto text-xs text-muted-foreground">
              {tempFilters.artformFilter ? tempFilters.artformFilter : 'All Artforms'}
            </span>
            <ChevronRight className="h-4 w-4" />
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-48">
            <DropdownMenuLabel className="flex items-center justify-between">
              Select Artforms
              {tempFilters.artformFilter && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearTempArtformFilter}
                  className="h-6 px-2 text-xs"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </DropdownMenuLabel>
            <div className="max-h-40 overflow-y-auto">
              <DropdownMenuCheckboxItem
                checked={!tempFilters.artformFilter}
                onCheckedChange={(checked) => {
                  if (checked) updateTempFilter('artformFilter', undefined);
                }}
              >
                All Artforms
              </DropdownMenuCheckboxItem>
              <DropdownMenuSeparator />
              {artforms.map((artform) => (
                <DropdownMenuCheckboxItem
                  key={artform}
                  checked={tempFilters.artformFilter === artform}
                  onCheckedChange={(checked) => {
                    updateTempFilter('artformFilter', checked ? artform : undefined);
                  }}
                  className="capitalize"
                >
                  {artform}
                </DropdownMenuCheckboxItem>
              ))}
            </div>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        
        <DropdownMenuSeparator />
        
        {/* Sort By */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center justify-between">
            <span>Sort By</span>
            <span className="ml-auto text-xs text-muted-foreground capitalize">
              {tempFilters.sortBy === 'alphabetical-az' ? 'A-Z' :
               tempFilters.sortBy === 'alphabetical-za' ? 'Z-A' :
               tempFilters.sortBy === 'most-popular' ? 'Most Popular' :
               'Newest'}
            </span>
            <ChevronRight className="h-4 w-4" />
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuItem onClick={() => updateTempFilter('sortBy', 'newest')}>
              Newest {tempFilters.sortBy === 'newest' && '✓'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateTempFilter('sortBy', 'alphabetical-az')}>
              A-Z {tempFilters.sortBy === 'alphabetical-az' && '✓'}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => updateTempFilter('sortBy', 'alphabetical-za')}>
              Z-A {tempFilters.sortBy === 'alphabetical-za' && '✓'}
            </DropdownMenuItem>
            {showPopularitySort && (
              <DropdownMenuItem onClick={() => updateTempFilter('sortBy', 'most-popular')}>
                Most Popular {tempFilters.sortBy === 'most-popular' && '✓'}
              </DropdownMenuItem>
            )}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        
        <DropdownMenuSeparator />
        
        {/* Action Buttons */}
        <div className="p-2 space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleClearAll}
            className="w-full justify-center text-xs"
          >
            Clear All
          </Button>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCancel}
              className="flex-1 text-xs"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleApply}
              className="flex-1 text-xs"
            >
              Apply
            </Button>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
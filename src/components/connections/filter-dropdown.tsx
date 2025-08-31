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
import { Filter, ChevronDown, X } from "lucide-react";

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
      <DropdownMenuContent align="end" className="w-56 max-h-[400px] overflow-y-auto">
        <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
        <DropdownMenuCheckboxItem
          checked={tempFilters.showArtistsOnly}
          onCheckedChange={(checked) => updateTempFilter('showArtistsOnly', checked)}
        >
          Artists Only
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem
          checked={tempFilters.showOrganizationsOnly}
          onCheckedChange={(checked) => updateTempFilter('showOrganizationsOnly', checked)}
        >
          Organizations Only
        </DropdownMenuCheckboxItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="flex items-center justify-between">
          Filter by Artform
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
        <div className="max-h-32 overflow-y-auto">
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
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel>Sort By</DropdownMenuLabel>
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
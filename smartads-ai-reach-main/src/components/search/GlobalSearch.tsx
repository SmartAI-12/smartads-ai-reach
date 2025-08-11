import React, { useState, useCallback } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, Filter, Download, Calendar as CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';

interface DateRange {
  from?: Date;
  to?: Date;
}

interface Filter {
  key: string;
  label: string;
  options: { value: string; label: string }[];
}

interface GlobalSearchProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filters: Filter[];
  activeFilters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  dateRange?: DateRange;
  onDateRangeChange?: (range: DateRange) => void;
  onExport?: () => void;
  onClearFilters: () => void;
  placeholder?: string;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  searchTerm,
  onSearchChange,
  filters,
  activeFilters,
  onFilterChange,
  dateRange,
  onDateRangeChange,
  onExport,
  onClearFilters,
  placeholder = "Search..."
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);
  
  // Debounce search to prevent excessive API calls
  const debouncedSearchTerm = useDebounce(localSearchTerm, 300);
  
  // Update parent when debounced value changes
  React.useEffect(() => {
    onSearchChange(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearchChange]);
  
  // Memoized handlers for performance
  const handleSearchChange = useCallback((value: string) => {
    setLocalSearchTerm(value);
  }, []);
  
  const handleFilterToggle = useCallback(() => {
    setShowFilters(!showFilters);
  }, [showFilters]);
  
  const handleDateRangeSelect = useCallback((range: any) => {
    onDateRangeChange?.(range || { from: undefined, to: undefined });
  }, [onDateRangeChange]);

  const hasActiveFilters = Object.values(activeFilters).some(value => value !== 'all' && value !== '') ||
                          (dateRange?.from || dateRange?.to);

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={placeholder}
                value={localSearchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={handleFilterToggle}
              className={showFilters ? "bg-primary/10" : ""}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                  {Object.values(activeFilters).filter(v => v !== 'all' && v !== '').length + 
                   (dateRange?.from || dateRange?.to ? 1 : 0)}
                </span>
              )}
            </Button>
            {onExport && (
              <Button variant="outline" onClick={onExport}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            )}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Advanced Filters</h3>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={onClearFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear All
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Filter Selects */}
                {filters.map((filter) => (
                  <div key={filter.key}>
                    <label className="text-sm font-medium mb-2 block">{filter.label}</label>
                    <Select
                      value={activeFilters[filter.key] || 'all'}
                      onValueChange={(value) => onFilterChange(filter.key, value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All {filter.label}</SelectItem>
                        {filter.options.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}

                {/* Date Range Picker */}
                {onDateRangeChange && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Date Range</label>
                    <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange?.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, "LLL dd, y")} -{" "}
                                {format(dateRange.to, "LLL dd, y")}
                              </>
                            ) : (
                              format(dateRange.from, "LLL dd, y")
                            )
                          ) : (
                            <span>Pick a date range</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={dateRange?.from}
                          selected={dateRange as any}
                          onSelect={handleDateRangeSelect}
                          numberOfMonths={2}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
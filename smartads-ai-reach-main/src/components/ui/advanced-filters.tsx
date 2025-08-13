import React, { useState } from 'react';
import { CalendarIcon, Filter, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterDefinition {
  key: string;
  label: string;
  type: 'select' | 'multiselect' | 'text' | 'number' | 'date' | 'daterange';
  options?: FilterOption[];
  placeholder?: string;
}

export interface DateRange {
  from?: Date;
  to?: Date;
}

export interface FilterValue {
  key: string;
  value: any;
  label: string;
}

interface AdvancedFiltersProps {
  filters: FilterDefinition[];
  values: Record<string, any>;
  onChange: (key: string, value: any) => void;
  onClear: () => void;
  className?: string;
}

export const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({
  filters,
  values,
  onChange,
  onClear,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const activeFilters = filters.filter(filter => {
    const value = values[filter.key];
    if (filter.type === 'daterange') {
      return value?.from || value?.to;
    }
    return value !== undefined && value !== '' && value !== null;
  });

  const renderFilterInput = (filter: FilterDefinition) => {
    const value = values[filter.key];

    switch (filter.type) {
      case 'select':
        return (
          <Select
            value={value || 'all'}
            onValueChange={(newValue) => onChange(filter.key, newValue === 'all' ? '' : newValue)}
          >
            <SelectTrigger>
              <SelectValue placeholder={filter.placeholder || `Select ${filter.label}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {filter.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'text':
        return (
          <Input
            type="text"
            placeholder={filter.placeholder || `Enter ${filter.label}`}
            value={value || ''}
            onChange={(e) => onChange(filter.key, e.target.value)}
          />
        );

      case 'number':
        return (
          <Input
            type="number"
            placeholder={filter.placeholder || `Enter ${filter.label}`}
            value={value || ''}
            onChange={(e) => onChange(filter.key, e.target.value ? Number(e.target.value) : '')}
          />
        );

      case 'date':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal w-full",
                  !value && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value ? format(new Date(value), "PPP") : filter.placeholder || "Pick a date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={value ? new Date(value) : undefined}
                onSelect={(date) => onChange(filter.key, date)}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        );

      case 'daterange':
        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "justify-start text-left font-normal w-full",
                  !value?.from && !value?.to && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value?.from ? (
                  value?.to ? (
                    <>
                      {format(value.from, "LLL dd, y")} -{" "}
                      {format(value.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(value.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                defaultMonth={value?.from}
                selected={value}
                onSelect={(range) => onChange(filter.key, range)}
                numberOfMonths={2}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        );

      default:
        return null;
    }
  };

  return (
    <div className={className}>
      <div className="flex items-center gap-2 mb-4">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {activeFilters.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFilters.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96 p-0" align="start">
            <Card className="border-0 shadow-none">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">Advanced Filters</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {filters.map((filter) => (
                  <div key={filter.key} className="space-y-2">
                    <Label className="text-xs font-medium">{filter.label}</Label>
                    {renderFilterInput(filter)}
                  </div>
                ))}
                {activeFilters.length > 0 && (
                  <div className="pt-2 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onClear();
                        setIsOpen(false);
                      }}
                      className="w-full"
                    >
                      Clear All Filters
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </PopoverContent>
        </Popover>

        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeFilters.map((filter) => {
              const value = values[filter.key];
              let displayValue = '';

              if (filter.type === 'daterange' && value) {
                if (value.from && value.to) {
                  displayValue = `${format(value.from, "MMM dd")} - ${format(value.to, "MMM dd")}`;
                } else if (value.from) {
                  displayValue = `From ${format(value.from, "MMM dd")}`;
                }
              } else if (filter.type === 'date' && value) {
                displayValue = format(new Date(value), "MMM dd, yyyy");
              } else if (filter.type === 'select' && filter.options) {
                const option = filter.options.find(opt => opt.value === value);
                displayValue = option?.label || String(value);
              } else {
                displayValue = String(value);
              }

              return (
                <Badge
                  key={filter.key}
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  <span className="text-xs">
                    {filter.label}: {displayValue}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto w-auto p-0 hover:bg-transparent"
                    onClick={() => onChange(filter.key, filter.type === 'daterange' ? undefined : '')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
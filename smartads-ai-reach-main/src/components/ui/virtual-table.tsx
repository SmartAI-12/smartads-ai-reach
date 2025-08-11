import React, { useMemo, useState } from 'react';
import { FixedSizeList as List } from 'react-window';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: keyof T | string;
  title: string;
  render?: (value: any, item: T, index: number) => React.ReactNode;
  width?: number | string;
  sortable?: boolean;
}

interface VirtualTableProps<T> {
  data: T[];
  columns: Column<T>[];
  height?: number;
  itemHeight?: number;
  selectable?: boolean;
  selectedItems?: Set<string>;
  onSelectItem?: (id: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  getItemId?: (item: T) => string;
  loading?: boolean;
  className?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: string, direction: 'asc' | 'desc') => void;
}

const ITEM_HEIGHT = 60;
const HEADER_HEIGHT = 48;

export function VirtualTable<T>({
  data,
  columns,
  height = 400,
  itemHeight = ITEM_HEIGHT,
  selectable = false,
  selectedItems = new Set(),
  onSelectItem,
  onSelectAll,
  getItemId = (item: any) => item.id,
  loading = false,
  className,
  sortBy,
  sortDirection = 'asc',
  onSort,
}: VirtualTableProps<T>) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const isAllSelected = useMemo(() => {
    return data.length > 0 && data.every(item => selectedItems.has(getItemId(item)));
  }, [data, selectedItems, getItemId]);

  const isPartiallySelected = useMemo(() => {
    return selectedItems.size > 0 && !isAllSelected;
  }, [selectedItems.size, isAllSelected]);

  const handleSelectAll = () => {
    if (onSelectAll) {
      onSelectAll(!isAllSelected);
    }
  };

  const handleSort = (column: Column<T>) => {
    if (!column.sortable || !onSort) return;
    
    const columnKey = String(column.key);
    const newDirection = sortBy === columnKey && sortDirection === 'asc' ? 'desc' : 'asc';
    onSort(columnKey, newDirection);
  };

  const renderHeader = () => (
    <div 
      className="flex items-center border-b bg-muted/50 sticky top-0 z-10"
      style={{ height: HEADER_HEIGHT }}
    >
      {selectable && (
        <div className="flex items-center justify-center w-12 px-2">
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={handleSelectAll}
          />
        </div>
      )}
      {columns.map((column, index) => (
        <div
          key={String(column.key)}
          className={cn(
            "flex items-center px-4 text-sm font-medium text-muted-foreground select-none",
            column.sortable && "cursor-pointer hover:text-foreground",
            index === 0 && !selectable && "pl-6"
          )}
          style={{ width: column.width || 'auto', flex: column.width ? 'none' : 1 }}
          onClick={() => handleSort(column)}
        >
          <span className="truncate">{column.title}</span>
          {column.sortable && sortBy === String(column.key) && (
            <div className="ml-2">
              {sortDirection === 'asc' ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const item = data[index];
    const itemId = getItemId(item);
    const isSelected = selectedItems.has(itemId);
    const isHovered = hoveredIndex === index;

    return (
      <div
        style={style}
        className={cn(
          "flex items-center border-b transition-colors",
          isSelected && "bg-muted/50",
          isHovered && "bg-muted/30"
        )}
        onMouseEnter={() => setHoveredIndex(index)}
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {selectable && (
          <div className="flex items-center justify-center w-12 px-2">
            <Checkbox
              checked={isSelected}
              onCheckedChange={(checked) => {
                if (onSelectItem) {
                  onSelectItem(itemId, Boolean(checked));
                }
              }}
            />
          </div>
        )}
        {columns.map((column, colIndex) => {
          const value = typeof column.key === 'string' && column.key.includes('.') 
            ? column.key.split('.').reduce((obj, key) => obj?.[key], item as any)
            : (item as any)[column.key];

          return (
            <div
              key={String(column.key)}
              className={cn(
                "px-4 text-sm truncate",
                colIndex === 0 && !selectable && "pl-6"
              )}
              style={{ width: column.width || 'auto', flex: column.width ? 'none' : 1 }}
            >
              {column.render ? column.render(value, item, index) : String(value || '')}
            </div>
          );
        })}
      </div>
    );
  };

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-0">
          <div style={{ height }}>
            {renderHeader()}
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground">Loading...</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-0">
          <div style={{ height }}>
            {renderHeader()}
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground">No data available</div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="p-0">
        <div style={{ height }}>
          {renderHeader()}
          <List
            height={height - HEADER_HEIGHT}
            itemCount={data.length}
            itemSize={itemHeight}
            width="100%"
            overscanCount={5}
          >
            {Row}
          </List>
        </div>
      </CardContent>
    </Card>
  );
}
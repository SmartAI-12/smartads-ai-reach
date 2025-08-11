import React, { useMemo, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { usePagination } from '@/hooks/usePagination';
import { BulkActions } from '@/components/ui/bulk-actions';

export interface Column<T> {
  key: keyof T | string;
  title: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
  width?: string;
}

interface BulkAction {
  key: string;
  label: string;
  icon: React.ReactNode;
  variant?: 'default' | 'destructive';
  confirmTitle?: string;
  confirmDescription?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title?: string;
  loading?: boolean;
  selectable?: boolean;
  selectedItems?: T[];
  onSelectionChange?: (items: T[]) => void;
  bulkActions?: BulkAction[];
  onBulkAction?: (actionKey: string, selectedItems: T[]) => void;
  itemsPerPage?: number;
  getItemId?: (item: T) => string;
  emptyMessage?: string;
  emptyAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ComponentType<any>;
  };
}

export function DataTable<T>({
  data,
  columns,
  title,
  loading = false,
  selectable = false,
  emptyMessage = "No items found",
  emptyAction,
  selectedItems = [],
  onSelectionChange,
  bulkActions = [],
  onBulkAction,
  itemsPerPage = 10,
  getItemId = (item: any) => item.id,
}: DataTableProps<T>) {
  const {
    currentPage,
    totalPages,
    paginatedData,
    nextPage,
    prevPage,
    goToPage,
    isFirstPage,
    isLastPage,
    pageInfo,
  } = usePagination({ data, itemsPerPage });

  // Memoize expensive calculations
  const memoizedColumns = useMemo(() => columns, [columns]);
  const memoizedData = useMemo(() => paginatedData, [paginatedData]);

  const handleSelectAll = useCallback((checked: boolean) => {
    if (!onSelectionChange) return;
    
    if (checked) {
      const newSelected = [...selectedItems];
      paginatedData.forEach(item => {
        const id = getItemId(item);
        if (!selectedItems.find(selected => getItemId(selected) === id)) {
          newSelected.push(item);
        }
      });
      onSelectionChange(newSelected);
    } else {
      const currentPageIds = paginatedData.map(getItemId);
      const newSelected = selectedItems.filter(item => 
        !currentPageIds.includes(getItemId(item))
      );
      onSelectionChange(newSelected);
    }
  }, [onSelectionChange, selectedItems, paginatedData, getItemId]);

  const handleSelectItem = useCallback((item: T, checked: boolean) => {
    if (!onSelectionChange) return;
    
    const id = getItemId(item);
    if (checked) {
      if (!selectedItems.find(selected => getItemId(selected) === id)) {
        onSelectionChange([...selectedItems, item]);
      }
    } else {
      onSelectionChange(selectedItems.filter(selected => getItemId(selected) !== id));
    }
  }, [onSelectionChange, selectedItems, getItemId]);

  const isItemSelected = useCallback((item: T) => {
    const id = getItemId(item);
    return selectedItems.some(selected => getItemId(selected) === id);
  }, [selectedItems, getItemId]);

  const handleBulkAction = useCallback((actionKey: string) => {
    onBulkAction?.(actionKey, selectedItems);
  }, [onBulkAction, selectedItems]);

  const currentPageSelectedCount = paginatedData.filter(isItemSelected).length;
  const isAllCurrentPageSelected = currentPageSelectedCount === paginatedData.length && paginatedData.length > 0;
  const isIndeterminate = currentPageSelectedCount > 0 && currentPageSelectedCount < paginatedData.length;

  const renderPaginationItems = () => {
    const items = [];
    const showEllipsis = totalPages > 7;
    
    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => goToPage(i)}
              isActive={currentPage === i}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    } else {
      items.push(
        <PaginationItem key={1}>
          <PaginationLink
            onClick={() => goToPage(1)}
            isActive={currentPage === 1}
            className="cursor-pointer"
          >
            1
          </PaginationLink>
        </PaginationItem>
      );

      if (currentPage > 3) {
        items.push(<PaginationEllipsis key="ellipsis1" />);
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        items.push(
          <PaginationItem key={i}>
            <PaginationLink
              onClick={() => goToPage(i)}
              isActive={currentPage === i}
              className="cursor-pointer"
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }

      if (currentPage < totalPages - 2) {
        items.push(<PaginationEllipsis key="ellipsis2" />);
      }

      if (totalPages > 1) {
        items.push(
          <PaginationItem key={totalPages}>
            <PaginationLink
              onClick={() => goToPage(totalPages)}
              isActive={currentPage === totalPages}
              className="cursor-pointer"
            >
              {totalPages}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }

    return items;
  };

  return (
    <Card>
      {title && (
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
      )}
      <CardContent className="p-0">
        {/* Bulk Actions */}
        {selectable && bulkActions.length > 0 && (
          <div className="p-4 border-b">
            <BulkActions
              selectedCount={selectedItems.length}
              totalCount={data.length}
              actions={bulkActions}
              onAction={handleBulkAction}
            />
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              {selectable && (
                <TableHead className="w-12">
                  <Checkbox
                    checked={isAllCurrentPageSelected}
                    onCheckedChange={handleSelectAll}
                    ref={(ref) => {
                      if (ref && 'indeterminate' in ref) {
                        (ref as any).indeterminate = isIndeterminate;
                      }
                    }}
                  />
                </TableHead>
              )}
              {memoizedColumns.map((column, index) => (
                <TableHead key={index} style={{ width: column.width }}>
                  {column.title}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              [...Array(itemsPerPage)].map((_, index) => (
                <TableRow key={index}>
                  {selectable && (
                    <TableCell>
                      <Skeleton className="h-4 w-4 rounded" />
                    </TableCell>
                  )}
                  {memoizedColumns.map((_, colIndex) => (
                    <TableCell key={colIndex}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : paginatedData.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={memoizedColumns.length + (selectable ? 1 : 0)} 
                  className="text-center py-8"
                >
                  <div className="space-y-3">
                    <p className="text-muted-foreground">{emptyMessage}</p>
                    {emptyAction && (
                      <Button onClick={emptyAction.onClick} className="gap-2">
                        {emptyAction.icon && <emptyAction.icon className="h-4 w-4" />}
                        {emptyAction.label}
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              memoizedData.map((item, index) => (
                <TableRow key={getItemId(item) || index}>
                  {selectable && (
                    <TableCell>
                      <Checkbox
                        checked={isItemSelected(item)}
                        onCheckedChange={(checked) => handleSelectItem(item, !!checked)}
                      />
                    </TableCell>
                  )}
                  {memoizedColumns.map((column, colIndex) => (
                    <TableCell key={colIndex}>
                      {column.render 
                        ? column.render((item as any)[column.key], item)
                        : (item as any)[column.key]
                      }
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {pageInfo.from} to {pageInfo.to} of {pageInfo.total} results
            </div>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={prevPage}
                    className={`cursor-pointer ${isFirstPage ? 'pointer-events-none opacity-50' : ''}`}
                  />
                </PaginationItem>
                {renderPaginationItems()}
                <PaginationItem>
                  <PaginationNext 
                    onClick={nextPage}
                    className={`cursor-pointer ${isLastPage ? 'pointer-events-none opacity-50' : ''}`}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
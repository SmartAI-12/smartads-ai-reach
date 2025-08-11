import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

export interface MobileCardItem {
  id: string;
  title: string;
  subtitle?: string;
  status?: {
    label: string;
    variant: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  metadata?: Array<{
    label: string;
    value: string;
    icon?: React.ComponentType<any>;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  }>;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  }>;
}

export interface MobileCardListProps {
  items: MobileCardItem[];
  loading?: boolean;
  selectable?: boolean;
  selectedItems?: string[];
  onSelectionChange?: (items: string[]) => void;
  onItemClick?: (itemId: string) => void;
  className?: string;
}

export const MobileCardList: React.FC<MobileCardListProps> = ({
  items,
  loading = false,
  selectable = false,
  selectedItems = [],
  onSelectionChange,
  onItemClick,
  className,
}) => {
  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (!onSelectionChange) return;
    
    if (checked) {
      onSelectionChange([...selectedItems, itemId]);
    } else {
      onSelectionChange(selectedItems.filter(id => id !== itemId));
    }
  };

  if (loading) {
    return (
      <div className={cn("space-y-3", className)}>
        {[...Array(5)].map((_, index) => (
          <Card key={index} className="animate-pulse">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="flex gap-2">
                  <div className="h-6 bg-muted rounded w-16"></div>
                  <div className="h-6 bg-muted rounded w-20"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item) => (
        <Card 
          key={item.id} 
          className={cn(
            "transition-all duration-200 hover:shadow-md",
            onItemClick && "cursor-pointer",
            selectedItems.includes(item.id) && "ring-2 ring-primary"
          )}
          onClick={() => onItemClick?.(item.id)}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              {selectable && (
                <Checkbox
                  checked={selectedItems.includes(item.id)}
                  onCheckedChange={(checked) => handleSelectItem(item.id, !!checked)}
                  onClick={(e) => e.stopPropagation()}
                  className="mt-1"
                />
              )}
              
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-medium leading-tight">{item.title}</h3>
                    {item.subtitle && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {item.subtitle}
                      </p>
                    )}
                  </div>
                  
                  {item.status && (
                    <Badge variant={item.status.variant} className="text-xs">
                      {item.status.label}
                    </Badge>
                  )}
                </div>

                {item.metadata && item.metadata.length > 0 && (
                  <div className="grid grid-cols-1 gap-1">
                    {item.metadata.map((meta, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        {meta.icon && <meta.icon className="h-3 w-3" />}
                        <span className="text-muted-foreground">{meta.label}:</span>
                        {meta.variant ? (
                          <Badge variant={meta.variant} className="text-xs">
                            {meta.value}
                          </Badge>
                        ) : (
                          <span className="font-medium">{meta.value}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {item.actions && (
                  <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                    {item.actions.map((action, index) => (
                      <Button
                        key={index}
                        size="sm"
                        variant={action.variant || 'outline'}
                        onClick={action.onClick}
                      >
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {items.length === 0 && !loading && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No items found</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings2, Eye, EyeOff } from 'lucide-react';
import { Label } from '@/components/ui/label';

export interface ColumnDefinition {
  key: string;
  title: string;
  visible: boolean;
  required?: boolean;
}

interface ColumnManagerProps {
  columns: ColumnDefinition[];
  onColumnToggle: (key: string, visible: boolean) => void;
  onReset?: () => void;
}

export const ColumnManager: React.FC<ColumnManagerProps> = ({
  columns,
  onColumnToggle,
  onReset,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const visibleCount = columns.filter(col => col.visible).length;
  const totalCount = columns.length;

  const handleToggle = (key: string, checked: boolean) => {
    // Prevent hiding all columns
    if (!checked && visibleCount === 1) {
      return;
    }
    onColumnToggle(key, checked);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings2 className="h-4 w-4 mr-2" />
          Columns ({visibleCount}/{totalCount})
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium">Manage Columns</CardTitle>
              {onReset && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onReset();
                    setIsOpen(false);
                  }}
                >
                  Reset
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-xs text-muted-foreground mb-3">
              Choose which columns to display in the table
            </div>
            
            {columns.map((column) => {
              const canToggle = !column.required && !(visibleCount === 1 && column.visible);
              
              return (
                <div key={column.key} className="flex items-center space-x-3">
                  <Checkbox
                    id={column.key}
                    checked={column.visible}
                    onCheckedChange={(checked) => handleToggle(column.key, Boolean(checked))}
                    disabled={!canToggle}
                  />
                  <Label
                    htmlFor={column.key}
                    className={`flex-1 text-sm ${
                      !canToggle ? 'text-muted-foreground' : 'cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {column.visible ? (
                        <Eye className="h-3 w-3" />
                      ) : (
                        <EyeOff className="h-3 w-3" />
                      )}
                      <span>{column.title}</span>
                      {column.required && (
                        <span className="text-xs text-muted-foreground">(Required)</span>
                      )}
                    </div>
                  </Label>
                </div>
              );
            })}

            <div className="pt-2 border-t text-xs text-muted-foreground">
              {visibleCount === 1 && "At least one column must be visible"}
              {columns.some(col => col.required) && "Required columns cannot be hidden"}
            </div>
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
};
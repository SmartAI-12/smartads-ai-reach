import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChevronDown, Trash2, Download, Archive, CheckCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface BulkAction {
  key: string;
  label: string;
  icon: React.ReactNode;
  variant?: 'default' | 'destructive';
  confirmTitle?: string;
  confirmDescription?: string;
}

interface BulkActionsProps {
  selectedCount: number;
  totalCount: number;
  actions: BulkAction[];
  onAction: (actionKey: string) => void;
  isLoading?: boolean;
}

export const BulkActions: React.FC<BulkActionsProps> = ({
  selectedCount,
  totalCount,
  actions,
  onAction,
  isLoading = false,
}) => {
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action?: BulkAction;
  }>({ open: false });

  const handleActionClick = (action: BulkAction) => {
    if (action.confirmTitle) {
      setConfirmDialog({ open: true, action });
    } else {
      onAction(action.key);
    }
  };

  const handleConfirm = () => {
    if (confirmDialog.action) {
      onAction(confirmDialog.action.key);
    }
    setConfirmDialog({ open: false });
  };

  if (selectedCount === 0) return null;

  return (
    <>
      <div className="flex items-center gap-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
        <Badge variant="secondary" className="gap-1">
          <CheckCircle className="h-3 w-3" />
          {selectedCount} of {totalCount} selected
        </Badge>
        
        <div className="flex items-center gap-2">
          {actions.length === 1 ? (
            <Button
              variant={actions[0].variant || "default"}
              size="sm"
              onClick={() => handleActionClick(actions[0])}
              disabled={isLoading}
              className="gap-2"
            >
              {actions[0].icon}
              {actions[0].label}
            </Button>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" disabled={isLoading} className="gap-2">
                  Actions
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {actions.map((action) => (
                  <DropdownMenuItem
                    key={action.key}
                    onClick={() => handleActionClick(action)}
                    className={action.variant === 'destructive' ? 'text-destructive' : ''}
                  >
                    {action.icon}
                    {action.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ open })}
        title={confirmDialog.action?.confirmTitle || 'Confirm Action'}
        description={confirmDialog.action?.confirmDescription || `Are you sure you want to perform this action on ${selectedCount} items?`}
        confirmText="Continue"
        variant={confirmDialog.action?.variant}
        onConfirm={handleConfirm}
      />
    </>
  );
};

// Pre-configured bulk actions for common use cases
export const createBulkActions = {
  delete: (confirmDescription?: string): BulkAction => ({
    key: 'delete',
    label: 'Delete Selected',
    icon: <Trash2 className="h-4 w-4" />,
    variant: 'destructive' as const,
    confirmTitle: 'Delete Items',
    confirmDescription: confirmDescription || 'This action cannot be undone.',
  }),
  
  export: (): BulkAction => ({
    key: 'export',
    label: 'Export Selected',
    icon: <Download className="h-4 w-4" />,
  }),
  
  archive: (): BulkAction => ({
    key: 'archive',
    label: 'Archive Selected',
    icon: <Archive className="h-4 w-4" />,
    confirmTitle: 'Archive Items',
    confirmDescription: 'Selected items will be archived and hidden from the main view.',
  }),
  
  markComplete: (): BulkAction => ({
    key: 'markComplete',
    label: 'Mark Complete',
    icon: <CheckCircle className="h-4 w-4" />,
  }),
  
  markIncomplete: (): BulkAction => ({
    key: 'markIncomplete',
    label: 'Mark Incomplete',
    icon: <XCircle className="h-4 w-4" />,
  }),
};
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Receipt, Calendar, User, Target, Search, Filter, Plus, Eye, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { GlobalSearch } from '@/components/search/GlobalSearch';
import { DataTable, Column } from '@/components/ui/data-table';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useExpenses, useApproveExpense } from '@/hooks/useExpenses';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { isManagerOrAbove, UserRole } from '@/utils/roleUtils';

const ExpensesList: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  const [selectedExpenses, setSelectedExpenses] = useState<any[]>([]);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({ open: false, title: '', description: '', onConfirm: () => {} });

  const { data: expenses, isLoading } = useExpenses();
  const approveExpenseMutation = useApproveExpense();

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      approved: 'outline',
      rejected: 'destructive',
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const categories = [...new Set(expenses?.map(expense => expense.category))];

  const filteredExpenses = expenses?.filter((expense) => {
    const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expense.campaigns?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || expense.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || expense.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const canApproveExpenses = isManagerOrAbove(profile?.role as UserRole);

  const columns: Column<any>[] = [
    {
      key: 'description',
      title: 'Description',
      render: (value, expense) => (
        <div className="flex items-center gap-2">
          {expense.receipt_url && (
            <Receipt className="h-4 w-4 text-muted-foreground" />
          )}
          <div>
            <div className="font-medium">{value}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'campaigns',
      title: 'Campaign',
      render: (value, expense) => (
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-muted-foreground" />
          <span>{expense.campaigns?.name || 'No Campaign'}</span>
        </div>
      ),
    },
    {
      key: 'category',
      title: 'Category',
      render: (value) => (
        <Badge variant="outline" className="text-xs">
          {value}
        </Badge>
      ),
    },
    {
      key: 'amount',
      title: 'Amount',
      render: (value) => (
        <span className="font-medium">{formatCurrency(value)}</span>
      ),
    },
    {
      key: 'expense_date',
      title: 'Date',
      render: (value) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          {formatDate(value)}
        </div>
      ),
    },
    {
      key: 'status',
      title: 'Status',
      render: (value) => getStatusBadge(value),
    },
    {
      key: 'profiles',
      title: 'Submitted By',
      render: (value, expense) => (
        expense.profiles ? (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={expense.profiles.avatar_url} />
              <AvatarFallback className="text-xs">
                {expense.profiles.full_name
                  ?.split(' ')
                  .map(n => n[0])
                  .join('')
                  .toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">{expense.profiles.full_name}</span>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">Unknown</span>
        )
      ),
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, expense) => (
        <div className="flex justify-end gap-2">
          {expense.receipt_url && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setSelectedReceipt(expense.receipt_url)}
            >
              <Eye className="h-4 w-4" />
            </Button>
          )}
          {canApproveExpenses && expense.status === 'pending' && (
            <>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleApproval(expense.id, 'approved')}
                disabled={approveExpenseMutation.isPending}
              >
                <CheckCircle className="h-4 w-4 text-green-600" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleApproval(expense.id, 'rejected')}
                disabled={approveExpenseMutation.isPending}
              >
                <XCircle className="h-4 w-4 text-red-600" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  const bulkActions = canApproveExpenses ? [
    {
      key: 'approve',
      label: 'Approve Selected',
      icon: <CheckCircle className="h-4 w-4" />,
      variant: 'default' as const,
    },
    {
      key: 'reject',
      label: 'Reject Selected',
      icon: <XCircle className="h-4 w-4" />,
      variant: 'destructive' as const,
      confirmTitle: 'Reject Expenses',
      confirmDescription: 'Are you sure you want to reject the selected expenses?',
    },
  ] : [];

  const handleBulkAction = (actionKey: string) => {
    if (actionKey === 'approve') {
      handleBulkApproval('approved');
    } else if (actionKey === 'reject') {
      handleBulkApproval('rejected');
    }
  };

  const handleApproval = (expenseId: string, status: 'approved' | 'rejected') => {
    if (!profile?.id) return;
    approveExpenseMutation.mutate({ 
      id: expenseId, 
      status, 
      approved_by: profile.id 
    }, {
      onSuccess: () => {
        toast({
          title: "Success",
          description: `Expense ${status} successfully`,
        });
      },
      onError: () => {
        toast({
          title: "Error",
          description: `Failed to ${status} expense`,
          variant: "destructive",
        });
      }
    });
  };

  const handleBulkApproval = (status: 'approved' | 'rejected') => {
    if (!profile?.id) return;
    
    setConfirmDialog({
      open: true,
      title: `${status === 'approved' ? 'Approve' : 'Reject'} Selected Expenses`,
      description: `Are you sure you want to ${status} ${selectedExpenses.length} expense(s)?`,
      onConfirm: () => {
        selectedExpenses.forEach(expense => {
          if (expense.status === 'pending') {
            handleApproval(expense.id, status);
          }
        });
        setSelectedExpenses([]);
        setConfirmDialog({ ...confirmDialog, open: false });
      }
    });
  };

  const searchFilters = [
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'pending', label: 'Pending' },
        { value: 'approved', label: 'Approved' },
        { value: 'rejected', label: 'Rejected' }
      ]
    },
    {
      key: 'category',
      label: 'Category',
      options: categories.map(category => ({ value: category, label: category }))
    }
  ];

  const activeFilters = { status: statusFilter, category: categoryFilter };

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'status') setStatusFilter(value);
    if (key === 'category') setCategoryFilter(value);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setCategoryFilter('all');
  };

  const exportData = () => {
    if (!filteredExpenses) return;
    
    const csv = filteredExpenses.map(expense => ({
      Description: expense.description,
      Campaign: expense.campaigns?.name || '',
      Category: expense.category,
      Amount: expense.amount,
      Date: new Date(expense.expense_date).toLocaleDateString(),
      Status: expense.status,
      'Submitted By': expense.profiles?.full_name || '',
      Created: new Date(expense.created_at).toLocaleDateString()
    }));
    
    const csvContent = [
      Object.keys(csv[0] || {}).join(','),
      ...csv.map(row => Object.values(row).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'expenses.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Expenses</h1>
          <p className="text-muted-foreground">
            Track and manage campaign expenses and receipts
          </p>
        </div>
        <Button onClick={() => navigate('/expenses/create')}>
          <Plus className="mr-2 h-4 w-4" />
          New Expense
        </Button>
      </div>

      {/* Global Search */}
      <GlobalSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filters={searchFilters}
        activeFilters={activeFilters}
        onFilterChange={handleFilterChange}
        onClearFilters={clearFilters}
        onExport={exportData}
        placeholder="Search expenses or campaigns..."
      />

      <DataTable
        data={filteredExpenses || []}
        columns={columns}
        title="All Expenses"
        loading={isLoading}
        selectable={canApproveExpenses}
        selectedItems={selectedExpenses}
        onSelectionChange={setSelectedExpenses}
        bulkActions={bulkActions}
        onBulkAction={handleBulkAction}
        itemsPerPage={15}
      />

      {/* Receipt Viewer Dialog */}
      <Dialog open={!!selectedReceipt} onOpenChange={() => setSelectedReceipt(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Receipt</DialogTitle>
          </DialogHeader>
          {selectedReceipt && (
            <div className="flex justify-center">
              <img 
                src={selectedReceipt} 
                alt="Receipt" 
                className="max-w-full max-h-96 object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling!.textContent = 'Unable to load receipt image';
                }}
              />
              <div className="text-muted-foreground"></div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
        variant="default"
      />
    </div>
  );
};

export default ExpensesList;
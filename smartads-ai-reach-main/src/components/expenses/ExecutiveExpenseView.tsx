import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  Receipt, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Plus,
  Calendar,
  Target,
  Upload,
  Eye,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useExpenses } from '@/hooks/useExpenses';

export const ExecutiveExpenseView: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('pending');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedReceipt, setSelectedReceipt] = useState<string | null>(null);
  
  const { data: allExpenses, isLoading } = useExpenses();

  // Filter expenses for executive user
  const myExpenses = allExpenses?.filter(expense => 
    expense.created_by === profile?.id
  ) || [];

  const pendingExpenses = myExpenses.filter(expense => expense.status === 'pending');
  const approvedExpenses = myExpenses.filter(expense => expense.status === 'approved');
  const rejectedExpenses = myExpenses.filter(expense => expense.status === 'rejected');

  // Apply category filter
  const getFilteredExpenses = (expenses: any[]) => {
    return categoryFilter === 'all' 
      ? expenses 
      : expenses.filter(expense => expense.category === categoryFilter);
  };

  const totalExpenseAmount = myExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const pendingAmount = pendingExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const approvedAmount = approvedExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const categories = [...new Set(myExpenses.map(expense => expense.category))];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-50 border-green-200';
      case 'rejected': return 'text-red-600 bg-red-50 border-red-200';
      case 'pending': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-orange-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const ExpenseCard: React.FC<{ expense: any }> = ({ expense }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-medium mb-1 flex items-center gap-2">
              {getStatusIcon(expense.status)}
              {expense.description}
              {expense.receipt_url && (
                <Receipt className="h-4 w-4 text-muted-foreground" />
              )}
            </h4>
            <div className="text-2xl font-bold text-green-600 mb-2">
              ${expense.amount.toLocaleString()}
            </div>
          </div>
          <Badge className={getStatusColor(expense.status)}>
            {expense.status}
          </Badge>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Target className="h-3 w-3" />
            <span>{expense.campaigns?.name || 'No campaign'}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{new Date(expense.expense_date).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/expenses/${expense.id}`)}
          >
            View Details
          </Button>
          {expense.receipt_url && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setSelectedReceipt(expense.receipt_url)}
            >
              <Eye className="h-3 w-3 mr-1" />
              Receipt
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            My Expenses
          </h1>
          <p className="text-muted-foreground">
            Submit and track your campaign expenses
          </p>
        </div>
        <Button onClick={() => navigate('/expenses/create')} className="gap-2">
          <Plus className="h-4 w-4" />
          Submit Expense
        </Button>
      </div>

      {/* Expense Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              ${totalExpenseAmount.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Total Expenses</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              ${pendingAmount.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Pending Approval</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              ${approvedAmount.toLocaleString()}
            </div>
            <div className="text-sm text-muted-foreground">Approved</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{myExpenses.length}</div>
            <div className="text-sm text-muted-foreground">Total Submissions</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Submit Card */}
      <EnhancedCard variant="gradient" className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Quick Expense Submission
            </h3>
            <p className="text-muted-foreground">
              Submit your expenses quickly with receipt upload and automatic categorization
            </p>
          </div>
          <Button onClick={() => navigate('/expenses/create')} size="lg">
            <Plus className="h-4 w-4 mr-2" />
            Submit New Expense
          </Button>
        </div>
      </EnhancedCard>

      {/* Expense Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="pending">Pending ({pendingExpenses.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({approvedExpenses.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejected ({rejectedExpenses.length})</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="pending" className="space-y-4">
          {getFilteredExpenses(pendingExpenses).length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {getFilteredExpenses(pendingExpenses).map((expense) => (
                <ExpenseCard key={expense.id} expense={expense} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Clock className="h-16 w-16 mx-auto mb-4 text-orange-500" />
              <h3 className="text-lg font-medium mb-2">No pending expenses</h3>
              <p className="text-muted-foreground mb-4">
                {categoryFilter !== 'all' 
                  ? `No pending ${categoryFilter} expenses` 
                  : 'All expenses have been processed'}
              </p>
              <Button onClick={() => navigate('/expenses/create')}>
                <Plus className="h-4 w-4 mr-2" />
                Submit New Expense
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="approved" className="space-y-4">
          {getFilteredExpenses(approvedExpenses).length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {getFilteredExpenses(approvedExpenses).map((expense) => (
                <ExpenseCard key={expense.id} expense={expense} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-medium mb-2">No approved expenses</h3>
              <p className="text-muted-foreground">
                {categoryFilter !== 'all' 
                  ? `No approved ${categoryFilter} expenses` 
                  : 'Approved expenses will appear here'}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="space-y-4">
          {getFilteredExpenses(rejectedExpenses).length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {getFilteredExpenses(rejectedExpenses).map((expense) => (
                <ExpenseCard key={expense.id} expense={expense} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
              <h3 className="text-lg font-medium mb-2">No rejected expenses</h3>
              <p className="text-muted-foreground">
                Great! All your expenses have been approved
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

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
    </div>
  );
};

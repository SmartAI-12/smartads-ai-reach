import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Download, 
  Calendar, 
  Target,
  TrendingUp,
  Users,
  DollarSign,
  CheckSquare,
  Plus,
  Filter,
  Eye,
  Share
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { useAuth } from '@/contexts/AuthContext';
import { useTasks } from '@/hooks/useTasks';
import { useExpenses } from '@/hooks/useExpenses';
import { useLeads } from '@/hooks/useLeads';
import { useCampaigns } from '@/hooks/useCampaigns';

export const ExecutiveReportView: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [timeFilter, setTimeFilter] = useState<string>('this_month');
  const [campaignFilter, setCampaignFilter] = useState<string>('all');
  
  const { data: allTasks } = useTasks();
  const { data: allExpenses } = useExpenses();
  const { data: allLeads } = useLeads();
  const { data: campaigns } = useCampaigns();

  // Filter data for executive user
  const myTasks = allTasks?.filter(task => 
    task.assigned_to === profile?.id || task.created_by === profile?.id
  ) || [];
  
  const myExpenses = allExpenses?.filter(expense => 
    expense.created_by === profile?.id
  ) || [];
  
  const myLeads = allLeads?.filter(lead => 
    lead.created_by === profile?.id
  ) || [];

  // Time filtering logic
  const getDateRange = (filter: string) => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    
    switch (filter) {
      case 'this_week': return startOfWeek;
      case 'this_month': return startOfMonth;
      case 'this_year': return startOfYear;
      default: return startOfMonth;
    }
  };

  const filterByDate = (items: any[], dateField: string) => {
    const startDate = getDateRange(timeFilter);
    return items.filter(item => new Date(item[dateField]) >= startDate);
  };

  const filteredTasks = filterByDate(myTasks, 'created_at');
  const filteredExpenses = filterByDate(myExpenses, 'expense_date');
  const filteredLeads = filterByDate(myLeads, 'created_at');

  // Campaign filtering
  const applyFilters = (items: any[]) => {
    if (campaignFilter === 'all') return items;
    return items.filter(item => item.campaign_id === campaignFilter);
  };

  // Report metrics
  const completedTasks = applyFilters(filteredTasks).filter(task => task.status === 'completed');
  const totalExpenseAmount = applyFilters(filteredExpenses).reduce((sum, expense) => sum + expense.amount, 0);
  const convertedLeads = applyFilters(filteredLeads).filter(lead => lead.status === 'converted');
  const taskCompletionRate = filteredTasks.length > 0 
    ? Math.round((completedTasks.length / filteredTasks.length) * 100) 
    : 0;
  const leadConversionRate = filteredLeads.length > 0 
    ? Math.round((convertedLeads.length / filteredLeads.length) * 100) 
    : 0;

  const reportTemplates = [
    {
      id: 'weekly_summary',
      title: 'Weekly Executive Summary',
      description: 'Comprehensive weekly performance report',
      icon: Calendar,
      color: 'bg-blue-500'
    },
    {
      id: 'campaign_performance',
      title: 'Campaign Performance Report',
      description: 'Detailed campaign execution metrics',
      icon: Target,
      color: 'bg-green-500'
    },
    {
      id: 'expense_summary',
      title: 'Expense Summary Report',
      description: 'Financial expenditure breakdown',
      icon: DollarSign,
      color: 'bg-purple-500'
    },
    {
      id: 'lead_pipeline',
      title: 'Lead Pipeline Report',
      description: 'Lead generation and conversion analysis',
      icon: Users,
      color: 'bg-orange-500'
    }
  ];

  const generateReport = (templateId: string) => {
    // In a real implementation, this would generate and download the report
    console.log(`Generating report: ${templateId}`);
    // For now, navigate to create report page with template
    navigate(`/reports/create?template=${templateId}`);
  };

  const exportData = (format: 'pdf' | 'excel' | 'csv') => {
    // Mock export functionality
    console.log(`Exporting data as ${format}`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Executive Reports
          </h1>
          <p className="text-muted-foreground">
            Generate comprehensive execution reports and analytics
          </p>
        </div>
        <Button onClick={() => navigate('/reports/create')} className="gap-2">
          <Plus className="h-4 w-4" />
          Create Report
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Time Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this_week">This Week</SelectItem>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="this_year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Select value={campaignFilter} onValueChange={setCampaignFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Campaign" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Campaigns</SelectItem>
            {campaigns?.map((campaign) => (
              <SelectItem key={campaign.id} value={campaign.id}>
                {campaign.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Quick Report Templates */}
      <EnhancedCard variant="gradient" className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
          <FileText className="h-5 w-5 text-primary" />
          Quick Report Templates
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {reportTemplates.map((template) => (
            <Card 
              key={template.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => generateReport(template.id)}
            >
              <CardContent className="p-4 text-center">
                <div className={`w-12 h-12 rounded-full ${template.color} flex items-center justify-center mx-auto mb-3`}>
                  <template.icon className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-medium mb-1">{template.title}</h4>
                <p className="text-sm text-muted-foreground">{template.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </EnhancedCard>

      {/* Report Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{applyFilters(filteredTasks).length}</div>
                <div className="text-sm text-muted-foreground">Total Tasks</div>
              </CardContent>
            </Card>
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
                <div className="text-2xl font-bold text-purple-600">{applyFilters(filteredLeads).length}</div>
                <div className="text-sm text-muted-foreground">Total Leads</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">{taskCompletionRate}%</div>
                <div className="text-sm text-muted-foreground">Task Completion</div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Summary */}
          <div className="grid gap-6 lg:grid-cols-2">
            <EnhancedCard className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-primary" />
                Task Performance
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Completed Tasks</span>
                  <span className="font-medium">{completedTasks.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Completion Rate</span>
                  <span className="font-medium">{taskCompletionRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Overdue Tasks</span>
                  <span className="font-medium text-red-600">
                    {applyFilters(filteredTasks).filter(task => 
                      task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'
                    ).length}
                  </span>
                </div>
              </div>
            </EnhancedCard>

            <EnhancedCard className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Lead Performance
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total Leads</span>
                  <span className="font-medium">{applyFilters(filteredLeads).length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Converted Leads</span>
                  <span className="font-medium">{convertedLeads.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Conversion Rate</span>
                  <span className="font-medium">{leadConversionRate}%</span>
                </div>
              </div>
            </EnhancedCard>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Task Execution Report</h3>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => exportData('pdf')}>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="outline" onClick={() => exportData('excel')}>
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {applyFilters(filteredTasks).slice(0, 9).map((task) => (
              <Card key={task.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{task.title}</h4>
                    <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                      {task.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {task.campaigns?.name || 'No campaign'}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    {task.due_date ? `Due: ${new Date(task.due_date).toLocaleDateString()}` : 'No due date'}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Expense Report</h3>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => exportData('pdf')}>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="outline" onClick={() => exportData('csv')}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {applyFilters(filteredExpenses).slice(0, 9).map((expense) => (
              <Card key={expense.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{expense.description}</h4>
                    <Badge variant={
                      expense.status === 'approved' ? 'default' : 
                      expense.status === 'rejected' ? 'destructive' : 'secondary'
                    }>
                      {expense.status}
                    </Badge>
                  </div>
                  <div className="text-lg font-bold text-green-600 mb-2">
                    ${expense.amount.toLocaleString()}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {expense.campaigns?.name || 'No campaign'}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    {new Date(expense.expense_date).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leads" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">Lead Generation Report</h3>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => exportData('pdf')}>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button variant="outline" onClick={() => exportData('excel')}>
                <Download className="h-4 w-4 mr-2" />
                Export Excel
              </Button>
            </div>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {applyFilters(filteredLeads).slice(0, 9).map((lead) => (
              <Card key={lead.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-medium">{lead.name}</h4>
                    <Badge variant={
                      lead.status === 'converted' ? 'default' : 
                      lead.status === 'lost' ? 'destructive' : 'secondary'
                    }>
                      {lead.status}
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    Score: {lead.score}/100
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {lead.campaigns?.name || 'No campaign'}
                  </p>
                  <div className="text-xs text-muted-foreground">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

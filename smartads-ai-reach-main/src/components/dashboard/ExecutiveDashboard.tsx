import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckSquare, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Calendar, 
  AlertCircle, 
  Plus,
  FileText,
  Target,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { useAuth } from '@/contexts/AuthContext';
import { useTasks } from '@/hooks/useTasks';
import { useExpenses } from '@/hooks/useExpenses';
import { useLeads } from '@/hooks/useLeads';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useDashboardStats } from '@/hooks/useDashboardStats';

export const ExecutiveDashboard: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: tasks, isLoading: tasksLoading } = useTasks();
  const { data: expenses, isLoading: expensesLoading } = useExpenses();
  const { data: leads, isLoading: leadsLoading } = useLeads();
  const { data: campaigns, isLoading: campaignsLoading } = useCampaigns();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();

  // Executive-specific data processing
  const myTasks = tasks?.filter(task => 
    task.assigned_to === profile?.id || task.created_by === profile?.id
  ) || [];
  
  const pendingTasks = myTasks.filter(task => task.status !== 'completed');
  const completedTasks = myTasks.filter(task => task.status === 'completed');
  const overdueTasks = myTasks.filter(task => 
    task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'
  );

  const myExpenses = expenses?.filter(expense => 
    expense.created_by === profile?.id
  ) || [];
  
  const pendingExpenses = myExpenses.filter(expense => expense.status === 'pending');
  const totalExpenseAmount = myExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  const myLeads = leads?.filter(lead => 
    lead.created_by === profile?.id
  ) || [];
  
  const activeLeads = myLeads.filter(lead => 
    ['new', 'contacted', 'qualified'].includes(lead.status)
  );
  const convertedLeads = myLeads.filter(lead => lead.status === 'converted');

  const activeCampaigns = campaigns?.filter(campaign => 
    campaign.status === 'active'
  ) || [];

  const taskCompletionRate = myTasks.length > 0 
    ? Math.round((completedTasks.length / myTasks.length) * 100) 
    : 0;

  const leadConversionRate = myLeads.length > 0 
    ? Math.round((convertedLeads.length / myLeads.length) * 100) 
    : 0;

  const quickActions = [
    {
      title: 'Create Task',
      description: 'Add a new task to your workflow',
      icon: CheckSquare,
      action: () => navigate('/tasks/create'),
      color: 'bg-blue-500'
    },
    {
      title: 'Submit Expense',
      description: 'Add expense with receipt',
      icon: DollarSign,
      action: () => navigate('/expenses/create'),
      color: 'bg-green-500'
    },
    {
      title: 'Add Lead',
      description: 'Capture new lead information',
      icon: Users,
      action: () => navigate('/leads/create'),
      color: 'bg-purple-500'
    },
    {
      title: 'Generate Report',
      description: 'Create execution report',
      icon: FileText,
      action: () => navigate('/reports/create'),
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="p-6 space-y-8 min-h-screen bg-gradient-subtle">
      {/* Welcome Header */}
      <div className="space-y-3">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
          Welcome back, {profile?.full_name?.split(' ')[0] || 'Executive'}! 👋
        </h1>
        <p className="text-lg text-muted-foreground">
          Your executive dashboard - manage tasks, expenses, leads, and reports efficiently.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="My Tasks"
          value={myTasks.length}
          description={`${completedTasks.length} completed`}
          icon={CheckSquare}
          trend={{ 
            value: taskCompletionRate, 
            isPositive: taskCompletionRate >= 70 
          }}
        />
        <StatsCard
          title="My Expenses"
          value={`$${totalExpenseAmount.toLocaleString()}`}
          description={`${pendingExpenses.length} pending approval`}
          icon={DollarSign}
          trend={{ 
            value: pendingExpenses.length, 
            isPositive: pendingExpenses.length === 0 
          }}
        />
        <StatsCard
          title="My Leads"
          value={myLeads.length}
          description={`${convertedLeads.length} converted`}
          icon={Users}
          trend={{ 
            value: leadConversionRate, 
            isPositive: leadConversionRate >= 20 
          }}
        />
        <StatsCard
          title="Active Campaigns"
          value={activeCampaigns.length}
          description="Campaigns in progress"
          icon={Target}
        />
      </div>

      {/* Quick Actions */}
      <EnhancedCard variant="gradient" className="p-6">
        <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
          <div className="p-1 rounded-md bg-primary/10">
            <Plus className="h-4 w-4 text-primary" />
          </div>
          Quick Actions
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, index) => (
            <Card 
              key={index} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={action.action}
            >
              <CardContent className="p-4 text-center">
                <div className={`w-12 h-12 rounded-full ${action.color} flex items-center justify-center mx-auto mb-3`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <h4 className="font-medium mb-1">{action.title}</h4>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </EnhancedCard>

      {/* Executive Workflow Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="leads">Leads</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Task Progress */}
            <EnhancedCard variant="gradient" className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-primary" />
                Task Progress
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Completion Rate</span>
                  <span className="font-medium">{taskCompletionRate}%</span>
                </div>
                <Progress value={taskCompletionRate} className="h-2" />
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{pendingTasks.length}</div>
                    <div className="text-sm text-muted-foreground">Pending</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{completedTasks.length}</div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-600">{overdueTasks.length}</div>
                    <div className="text-sm text-muted-foreground">Overdue</div>
                  </div>
                </div>
              </div>
            </EnhancedCard>

            {/* Lead Performance */}
            <EnhancedCard variant="gradient" className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Lead Performance
              </h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Conversion Rate</span>
                  <span className="font-medium">{leadConversionRate}%</span>
                </div>
                <Progress value={leadConversionRate} className="h-2" />
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{activeLeads.length}</div>
                    <div className="text-sm text-muted-foreground">Active</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{convertedLeads.length}</div>
                    <div className="text-sm text-muted-foreground">Converted</div>
                  </div>
                </div>
              </div>
            </EnhancedCard>
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">My Tasks</h3>
            <Button onClick={() => navigate('/tasks')} variant="outline">
              View All Tasks
            </Button>
          </div>
          
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Priority Tasks */}
            <EnhancedCard className="p-6">
              <h4 className="font-medium mb-4 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                Priority Tasks
              </h4>
              <div className="space-y-3">
                {pendingTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {task.due_date ? `Due: ${new Date(task.due_date).toLocaleDateString()}` : 'No due date'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={task.priority === 'urgent' ? 'destructive' : 'secondary'}>
                        {task.priority}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate(`/tasks/${task.id}`)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                ))}
                {pendingTasks.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
                    <p>All tasks completed! Great work!</p>
                  </div>
                )}
              </div>
            </EnhancedCard>

            {/* Recent Activity */}
            <EnhancedCard className="p-6">
              <h4 className="font-medium mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-blue-500" />
                Recent Activity
              </h4>
              <div className="space-y-3">
                {completedTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <div className="flex-1">
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Completed {task.updated_at ? new Date(task.updated_at).toLocaleDateString() : 'recently'}
                      </p>
                    </div>
                  </div>
                ))}
                {completedTasks.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-2" />
                    <p>No completed tasks yet</p>
                  </div>
                )}
              </div>
            </EnhancedCard>
          </div>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">My Expenses</h3>
            <Button onClick={() => navigate('/expenses')} variant="outline">
              View All Expenses
            </Button>
          </div>
          
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Pending Expenses */}
            <EnhancedCard className="p-6">
              <h4 className="font-medium mb-4 flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-500" />
                Pending Approval
              </h4>
              <div className="space-y-3">
                {pendingExpenses.slice(0, 5).map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{expense.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {expense.campaigns?.name} • {new Date(expense.expense_date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${expense.amount.toLocaleString()}</p>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                  </div>
                ))}
                {pendingExpenses.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-500" />
                    <p>No pending expenses</p>
                  </div>
                )}
              </div>
            </EnhancedCard>

            {/* Expense Summary */}
            <EnhancedCard className="p-6">
              <h4 className="font-medium mb-4 flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-500" />
                Expense Summary
              </h4>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    ${totalExpenseAmount.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Expenses</div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-orange-600">
                      {pendingExpenses.length}
                    </div>
                    <div className="text-xs text-muted-foreground">Pending</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">
                      {myExpenses.filter(e => e.status === 'approved').length}
                    </div>
                    <div className="text-xs text-muted-foreground">Approved</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-red-600">
                      {myExpenses.filter(e => e.status === 'rejected').length}
                    </div>
                    <div className="text-xs text-muted-foreground">Rejected</div>
                  </div>
                </div>
              </div>
            </EnhancedCard>
          </div>
        </TabsContent>

        <TabsContent value="leads" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-semibold">My Leads</h3>
            <Button onClick={() => navigate('/leads')} variant="outline">
              View All Leads
            </Button>
          </div>
          
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Active Leads */}
            <EnhancedCard className="p-6">
              <h4 className="font-medium mb-4 flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-500" />
                Active Leads
              </h4>
              <div className="space-y-3">
                {activeLeads.slice(0, 5).map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{lead.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {lead.email || lead.phone} • Score: {lead.score}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        lead.status === 'qualified' ? 'default' : 
                        lead.status === 'contacted' ? 'secondary' : 'outline'
                      }>
                        {lead.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                {activeLeads.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-2" />
                    <p>No active leads</p>
                  </div>
                )}
              </div>
            </EnhancedCard>

            {/* Lead Performance */}
            <EnhancedCard className="p-6">
              <h4 className="font-medium mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                Performance Metrics
              </h4>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {leadConversionRate}%
                  </div>
                  <div className="text-sm text-muted-foreground">Conversion Rate</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold text-blue-600">
                      {activeLeads.length}
                    </div>
                    <div className="text-xs text-muted-foreground">Active</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-green-600">
                      {convertedLeads.length}
                    </div>
                    <div className="text-xs text-muted-foreground">Converted</div>
                  </div>
                </div>
              </div>
            </EnhancedCard>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

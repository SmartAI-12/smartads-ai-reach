import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Area, AreaChart } from 'recharts';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useLeads } from '@/hooks/useLeads';
import { useExpenses } from '@/hooks/useExpenses';
import { useTasks } from '@/hooks/useTasks';
import { TrendingUp, TrendingDown, DollarSign, Target, Users, Clock } from 'lucide-react';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', 'hsl(var(--destructive))'];

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  description?: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, description }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {change !== undefined && (
        <div className={`flex items-center text-xs ${change >= 0 ? 'text-success' : 'text-destructive'}`}>
          {change >= 0 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
          {Math.abs(change)}% from last period
        </div>
      )}
      {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
    </CardContent>
  </Card>
);

export const EnhancedAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('30d');
  const { data: campaigns = [] } = useCampaigns();
  const { data: leads } = useLeads();
  const { data: expenses = [] } = useExpenses();
  const { data: tasks = [] } = useTasks();

  // Filter data based on time range
  const getDateFilter = (days: number) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return cutoff;
  };

  const filterByTimeRange = (items: any[], dateField: string) => {
    if (timeRange === 'all') return items;
    const days = parseInt(timeRange.replace('d', ''));
    const cutoff = getDateFilter(days);
    return items.filter(item => new Date(item[dateField]) >= cutoff);
  };

  // Calculate metrics
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const totalBudget = campaigns.reduce((sum, c) => sum + (Number(c.budget) || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const budgetUtilization = totalBudget > 0 ? ((totalExpenses / totalBudget) * 100).toFixed(1) : 0;
  
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const taskCompletionRate = tasks.length > 0 ? ((completedTasks / tasks.length) * 100).toFixed(1) : 0;

  // ROI Calculation
  const roiData = campaigns.map(campaign => {
    const campaignExpenses = expenses
      .filter(e => e.campaign_id === campaign.id)
      .reduce((sum, e) => sum + Number(e.amount), 0);
    
    const campaignLeads = leads?.filter(l => l.campaign_id === campaign.id).length || 0;
    const avgLeadValue = 100; // Placeholder - would come from settings
    const revenue = campaignLeads * avgLeadValue;
    const roi = campaignExpenses > 0 ? ((revenue - campaignExpenses) / campaignExpenses * 100) : 0;
    
    return {
      name: campaign.name.substring(0, 20),
      expenses: campaignExpenses,
      revenue,
      roi: Math.round(roi),
    };
  }).filter(c => c.expenses > 0);

  // Lead conversion funnel
  const leadFunnelData = [
    { stage: 'New', count: leads?.filter(l => l.status === 'new').length || 0 },
    { stage: 'Contacted', count: leads?.filter(l => l.status === 'contacted').length || 0 },
    { stage: 'Qualified', count: leads?.filter(l => l.status === 'qualified').length || 0 },
    { stage: 'Converted', count: leads?.filter(l => l.status === 'converted').length || 0 },
  ];

  // Expense trends with budget comparison
  const expensesByMonth = expenses.reduce((acc, expense) => {
    const month = new Date(expense.expense_date).toLocaleString('default', { month: 'short', year: '2-digit' });
    acc[month] = (acc[month] || 0) + Number(expense.amount);
    return acc;
  }, {} as Record<string, number>);

  const budgetByMonth = campaigns.reduce((acc, campaign) => {
    const month = new Date(campaign.created_at).toLocaleString('default', { month: 'short', year: '2-digit' });
    acc[month] = (acc[month] || 0) + (Number(campaign.budget) || 0);
    return acc;
  }, {} as Record<string, number>);

  const expenseTrendData = Object.keys({...expensesByMonth, ...budgetByMonth})
    .sort()
    .slice(-6)
    .map(month => ({
      month,
      expenses: expensesByMonth[month] || 0,
      budget: budgetByMonth[month] || 0,
    }));

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Enhanced Analytics</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="365d">Last year</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Active Campaigns"
          value={activeCampaigns}
          icon={<Target className="h-4 w-4 text-primary" />}
          description="Currently running"
        />
        <MetricCard
          title="Budget Utilization"
          value={`${budgetUtilization}%`}
          icon={<DollarSign className="h-4 w-4 text-success" />}
          description={`$${totalExpenses.toLocaleString()} of $${totalBudget.toLocaleString()}`}
        />
        <MetricCard
          title="Task Completion Rate"
          value={`${taskCompletionRate}%`}
          icon={<Clock className="h-4 w-4 text-accent" />}
          description={`${completedTasks} of ${tasks.length} tasks`}
        />
        <MetricCard
          title="Total Leads"
          value={leads?.length || 0}
          icon={<Users className="h-4 w-4 text-secondary" />}
          description="All time leads generated"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget vs Expenses Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Budget vs Expenses Trend</CardTitle>
            <CardDescription>Monthly budget allocation and actual spending</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={expenseTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`$${Number(value).toLocaleString()}`, '']} />
                <Area type="monotone" dataKey="budget" stackId="1" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                <Area type="monotone" dataKey="expenses" stackId="2" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive))" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Lead Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Lead Conversion Funnel</CardTitle>
            <CardDescription>Lead progression through stages</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={leadFunnelData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis type="category" dataKey="stage" />
                <Tooltip />
                <Bar dataKey="count" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Campaign ROI */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign ROI Analysis</CardTitle>
            <CardDescription>Return on investment by campaign</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={roiData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value, name) => {
                  if (name === 'roi') return [`${value}%`, 'ROI'];
                  return [`$${Number(value).toLocaleString()}`, name === 'expenses' ? 'Expenses' : 'Revenue'];
                }} />
                <Bar dataKey="roi" fill="hsl(var(--success))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Performance Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Summary</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Average Lead Score</span>
                <span className="font-bold">
                  {leads?.length ? (leads.reduce((sum, l) => sum + (l.score || 0), 0) / leads.length).toFixed(1) : 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Avg. Campaign Duration</span>
                <span className="font-bold">
                  {campaigns.length ? Math.round(campaigns.reduce((sum, c) => {
                    const start = new Date(c.start_date || c.created_at);
                    const end = new Date(c.end_date || Date.now());
                    return sum + Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
                  }, 0) / campaigns.length) : 0} days
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Revenue</span>
                <span className="font-bold text-success">
                  ${((leads?.filter(l => l.status === 'converted').length || 0) * 100).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Conversion Rate</span>
                <span className="font-bold">
                  {leads?.length ? ((leads.filter(l => l.status === 'converted').length / leads.length) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
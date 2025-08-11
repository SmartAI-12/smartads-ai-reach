import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, ComposedChart } from 'recharts';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useLeadStats } from '@/hooks/useLeads';
import { useExpenses } from '@/hooks/useExpenses';
import { useTasks } from '@/hooks/useTasks';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', 'hsl(var(--destructive))'];

export const AnalyticsCharts: React.FC = () => {
  const { data: campaigns = [] } = useCampaigns();
  const { data: leadStats } = useLeadStats();
  const { data: expenses = [] } = useExpenses();
  const { data: tasks = [] } = useTasks();

  // Campaign status distribution
  const campaignStatusData = campaigns.reduce((acc, campaign) => {
    acc[campaign.status] = (acc[campaign.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const campaignChartData = Object.entries(campaignStatusData).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
  }));

  // Expense trends by month
  const expensesByMonth = expenses.reduce((acc, expense) => {
    const month = new Date(expense.expense_date).toLocaleString('default', { month: 'short', year: '2-digit' });
    acc[month] = (acc[month] || 0) + Number(expense.amount);
    return acc;
  }, {} as Record<string, number>);

  const expenseChartData = Object.entries(expensesByMonth)
    .slice(-6) // Last 6 months
    .map(([month, amount]) => ({
      month,
      amount: Math.round(amount),
    }));

  // Task completion status
  const taskStatusData = tasks.reduce((acc, task) => {
    acc[task.status] = (acc[task.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const taskChartData = Object.entries(taskStatusData).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count,
  }));

  // Lead conversion funnel with unique IDs
  const leadFunnelData = React.useMemo(() => {
    if (!leadStats?.statusCounts) return [];
    
    return [
      { id: 'funnel-new', name: 'New', value: leadStats.statusCounts.new || 0 },
      { id: 'funnel-contacted', name: 'Contacted', value: leadStats.statusCounts.contacted || 0 },
      { id: 'funnel-qualified', name: 'Qualified', value: leadStats.statusCounts.qualified || 0 },
      { id: 'funnel-converted', name: 'Converted', value: leadStats.statusCounts.converted || 0 },
    ];
  }, [leadStats]);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Campaign Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Status</CardTitle>
          <CardDescription>Distribution of campaigns by status</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={campaignChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {campaignChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Expense Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Expense Trends</CardTitle>
          <CardDescription>Monthly expense tracking</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={expenseChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`$${value}`, 'Amount']}
                labelFormatter={(label) => `Month: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Task Status Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Task Status</CardTitle>
          <CardDescription>Distribution of tasks by status</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={taskChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="hsl(var(--secondary))" name="Tasks" key="task-status-bar" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Lead Conversion Funnel - Custom Implementation */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Conversion Funnel</CardTitle>
          <CardDescription>Lead progression through the sales funnel</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart
              data={leadFunnelData}
              layout="horizontal"
              margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
              barGap={0}
              barCategoryGap={0}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                type="number"
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => value.toLocaleString()}
              />
              <YAxis 
                dataKey="name"
                type="category"
                axisLine={false}
                tickLine={false}
                width={90}
              />
              <Tooltip 
                formatter={(value) => [value, 'Leads']}
                labelFormatter={(label) => `Status: ${label}`}
              />
              {leadFunnelData.map((item, index) => (
                <Bar
                  key={`bar-${item.id}`}
                  dataKey="value"
                  data={[item]}
                  stackId="a"
                  fill="hsl(var(--accent))"
                  isAnimationActive={false}
                  radius={index === leadFunnelData.length - 1 ? [0, 4, 4, 0] : 0}
                >
                  <Cell 
                    key={`cell-${item.id}`}
                    fill={`hsl(var(--accent))`}
                  />
                </Bar>
              ))}
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
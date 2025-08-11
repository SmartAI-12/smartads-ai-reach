import React from 'react';
import { Target, CheckSquare, DollarSign, UserCheck, Users, Activity, Calendar, AlertCircle, CheckCircle } from 'lucide-react';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { AnalyticsCharts } from '@/components/dashboard/AnalyticsCharts';
import { ActivityFeed } from '@/components/activity/ActivityFeed';
import { useAuth } from '@/contexts/AuthContext';
import { EnhancedCard } from '@/components/ui/enhanced-card';
import { LoadingState } from '@/components/ui/loading';
import { useDashboardStats } from '@/hooks/useDashboardStats';
import { useCampaigns } from '@/hooks/useCampaigns';
import { useTasks } from '@/hooks/useTasks';
import { DashboardSkeleton } from '@/components/ui/dashboard-skeleton';
import { PerformanceMonitor } from '@/components/ui/performance-monitor';

const Index = () => {
  const { profile } = useAuth();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: campaigns, isLoading: campaignsLoading } = useCampaigns();
  const { data: tasks, isLoading: tasksLoading } = useTasks();

  if (statsLoading || campaignsLoading || tasksLoading) {
    return <DashboardSkeleton />;
  }

  const recentCampaigns = campaigns?.slice(0, 3) || [];
  const recentTasks = tasks?.slice(0, 5) || [];
  const overdueTasks = tasks?.filter(task => 
    task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed'
  ) || [];

  return (
    <>
      <PerformanceMonitor />
      <div className="p-6 space-y-8 min-h-screen bg-gradient-subtle">
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-primary bg-clip-text text-transparent">
            Welcome back, {profile?.full_name?.split(' ')[0] || 'User'}! 👋
          </h1>
          <p className="text-lg text-muted-foreground">
            Here's your SmartAds BTL dashboard overview for today.
          </p>
        </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Active Campaigns"
          value={stats?.activeCampaigns || 0}
          description={`${stats?.totalCampaigns || 0} total campaigns`}
          icon={Target}
          trend={{ 
            value: stats?.activeCampaigns ? Math.round((stats.activeCampaigns / stats.totalCampaigns) * 100) : 0, 
            isPositive: true 
          }}
        />
        <StatsCard
          title="Total Tasks"
          value={stats?.totalTasks || 0}
          description={`${stats?.completedTasks || 0} completed`}
          icon={CheckSquare}
          trend={{ 
            value: stats?.totalTasks ? Math.round((stats.completedTasks / stats.totalTasks) * 100) : 0, 
            isPositive: true 
          }}
        />
        <StatsCard
          title="Total Expenses"
          value={`$${(stats?.totalExpenses || 0).toLocaleString()}`}
          description="All campaigns"
          icon={DollarSign}
        />
        <StatsCard
          title="Active Clients"
          value={stats?.totalClients || 0}
          description="Total active clients"
          icon={Users}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <QuickActions />
        </div>
        
        <div className="space-y-4">
          <EnhancedCard variant="gradient" className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
              <div className="p-1 rounded-md bg-primary/10">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              Recent Campaigns
            </h3>
            <div className="space-y-3">
              {recentCampaigns.length > 0 ? (
                recentCampaigns.map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                    <div>
                      <p className="font-medium">{campaign.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {campaign.clients?.name} • {campaign.status}
                      </p>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${
                      campaign.status === 'active' ? 'bg-success/20 text-success' :
                      campaign.status === 'completed' ? 'bg-muted text-muted-foreground' :
                      'bg-warning/20 text-warning'
                    }`}>
                      {campaign.status}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">No campaigns yet</p>
              )}
            </div>
          </EnhancedCard>

          <EnhancedCard variant="gradient" className="p-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-lg">
              <div className="p-1 rounded-md bg-primary/10">
                <AlertCircle className="h-4 w-4 text-primary" />
              </div>
              Urgent Tasks
            </h3>
            <div className="space-y-3">
              {overdueTasks.length > 0 ? (
                overdueTasks.slice(0, 3).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg">
                    <div>
                      <p className="font-medium">{task.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Due: {new Date(task.due_date!).toLocaleDateString()}
                      </p>
                    </div>
                    <AlertCircle className="h-4 w-4 text-destructive" />
                  </div>
                ))
              ) : (
                <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg">
                  <div>
                    <p className="font-medium">All caught up!</p>
                    <p className="text-sm text-muted-foreground">No overdue tasks</p>
                  </div>
                  <CheckCircle className="h-4 w-4 text-success" />
                </div>
              )}
            </div>
          </EnhancedCard>
        </div>
      </div>

      {/* Analytics and Activity Section */}
      <div className="grid gap-4 lg:grid-cols-3 mt-8">
        <div className="lg:col-span-2">
          <AnalyticsCharts />
        </div>
        <div>
          <ActivityFeed limit={8} />
        </div>
        </div>
      </div>
    </>
  );
};

export default Index;

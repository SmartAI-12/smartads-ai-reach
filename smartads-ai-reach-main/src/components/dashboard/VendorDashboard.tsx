import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Target, CheckSquare, MapPin, Camera, DollarSign, Clock, AlertTriangle } from 'lucide-react';
import { useVendorCampaigns } from '@/hooks/useVendorCampaigns';
import { useVendorTasks } from '@/hooks/useVendorTasks';
import { useVendorExpenses } from '@/hooks/useVendorCheckins';
import { useNavigate } from 'react-router-dom';
import { LoadingState } from '@/components/ui/loading';

export const VendorDashboard: React.FC = () => {
  const { data: campaigns, isLoading: campaignsLoading } = useVendorCampaigns();
  const { data: tasks, isLoading: tasksLoading } = useVendorTasks();
  const { data: expenses, isLoading: expensesLoading } = useVendorExpenses();
  const navigate = useNavigate();

  if (campaignsLoading || tasksLoading || expensesLoading) {
    return <LoadingState>Loading your dashboard...</LoadingState>;
  }

  const totalCampaigns = campaigns?.length || 0;
  const activeCampaigns = campaigns?.filter(c => c.status === 'active').length || 0;
  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0;
  const pendingTasks = tasks?.filter(t => t.status === 'pending').length || 0;
  const overdueTasks = tasks?.filter(t => {
    if (!t.due_date) return false;
    return new Date(t.due_date) < new Date();
  }).length || 0;

  const totalCheckIns = tasks?.reduce((acc, task) => acc + (task.check_ins?.length || 0), 0) || 0;
  const totalPhotos = tasks?.reduce((acc, task) => acc + (task.task_photos?.length || 0), 0) || 0;
  const totalExpenses = expenses?.length || 0;
  const totalExpenseAmount = expenses?.reduce((acc, exp) => acc + exp.amount, 0) || 0;

  const recentTasks = tasks?.slice(0, 5) || [];
  const recentCampaigns = campaigns?.slice(0, 3) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Vendor Dashboard</h1>
        <p className="text-gray-600">Welcome back! Here's an overview of your assigned work.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Campaigns</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              out of {totalCampaigns} total campaigns
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks}</div>
            <p className="text-xs text-muted-foreground">
              out of {totalTasks} total tasks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks}</div>
            {overdueTasks > 0 && (
              <p className="text-xs text-red-600 font-medium">
                {overdueTasks} overdue
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalExpenseAmount.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {totalExpenses} expense entries
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Activity Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Check-ins
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{totalCheckIns}</div>
            <p className="text-sm text-gray-600">Location check-ins recorded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Photos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{totalPhotos}</div>
            <p className="text-sm text-gray-600">Proof photos uploaded</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Overdue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{overdueTasks}</div>
            <p className="text-sm text-gray-600">Tasks past due date</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTasks.map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{task.title}</h4>
                    <p className="text-sm text-gray-600">{task.campaigns?.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                      {task.status}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/vendor/tasks`)}
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
              {recentTasks.length === 0 && (
                <p className="text-gray-500 text-center py-4">No recent tasks</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Campaigns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentCampaigns.map((campaign) => (
                <div key={campaign.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{campaign.name}</h4>
                    <p className="text-sm text-gray-600">{campaign.clients?.name}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={
                      campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                      campaign.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }>
                      {campaign.status}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate(`/vendor/campaigns`)}
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
              {recentCampaigns.length === 0 && (
                <p className="text-gray-500 text-center py-4">No active campaigns</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => navigate('/vendor/tasks')}
            >
              <CheckSquare className="h-6 w-6" />
              <span>View My Tasks</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => navigate('/vendor/campaigns')}
            >
              <Target className="h-6 w-6" />
              <span>View My Campaigns</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => navigate('/expenses')}
            >
              <DollarSign className="h-6 w-6" />
              <span>Log Expenses</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

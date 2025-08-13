import React from 'react';
import { Users, UserPlus, Shield, Activity, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import UsersList from '@/components/users/UsersList';

const UsersPage: React.FC = () => {
  // Fetch user statistics
  const { data: userStats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const { data: users, error } = await supabase
        .from('profiles')
        .select('role, is_active, created_at, updated_at');

      if (error) throw error;

      const totalUsers = users.length;
      const activeUsers = users.filter(u => u.is_active).length;
      const inactiveUsers = totalUsers - activeUsers;
      
      const roleDistribution = users.reduce((acc, user) => {
        const role = user.role || 'executive';
        acc[role] = (acc[role] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const recentUsers = users.filter(u => {
        const createdDate = new Date(u.created_at);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return createdDate > weekAgo;
      }).length;

      // Since we don't have last_login_at, we'll use updated_at as a proxy for recent activity
      const recentlyActive = users.filter(u => {
        if (!u.updated_at) return false;
        const updateDate = new Date(u.updated_at);
        const dayAgo = new Date();
        dayAgo.setDate(dayAgo.getDate() - 1);
        return updateDate > dayAgo;
      }).length;

      return {
        totalUsers,
        activeUsers,
        inactiveUsers,
        roleDistribution,
        recentUsers,
        recentlyActive
      };
    },
  });

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Comprehensive user administration, role management, and activity monitoring
          </p>
        </div>
        <Badge variant="outline" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Admin Only
        </Badge>
      </div>

      {/* User Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {userStats?.recentUsers || 0} added this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{userStats?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {userStats?.recentlyActive || 0} active today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Users</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{userStats?.inactiveUsers || 0}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Role Distribution</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {userStats?.roleDistribution && Object.entries(userStats.roleDistribution).map(([role, count]) => (
                <div key={role} className="flex justify-between text-sm">
                  <span className="capitalize">{role}:</span>
                  <span className="font-medium">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Management Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            User Administration
          </CardTitle>
          <CardDescription>
            Create, edit, deactivate users • Role management • Profile management • Activity monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UsersList />
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersPage;
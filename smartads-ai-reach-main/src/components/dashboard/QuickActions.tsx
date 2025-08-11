import React from 'react';
import { Plus, Target, CheckSquare, Users, FileText, DollarSign, BarChart, UserPlus, FileBarChart } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { QuickCreateModal } from '@/components/modals/QuickCreateModal';
import { useAuth } from '@/contexts/AuthContext';

export const QuickActions: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  const canCreateCampaigns = profile?.role === 'admin' || profile?.role === 'manager';
  const canManageClients = profile?.role === 'admin' || profile?.role === 'manager';

  const actions = [
    {
      title: 'New Campaign',
      description: 'Launch a new marketing campaign',
      icon: Target,
      component: () => (
        <QuickCreateModal 
          type="campaign" 
          trigger={
            <Button className="w-full justify-start gap-3 h-auto p-4 bg-gradient-primary hover:opacity-90 transition-opacity">
              <div className="p-2 rounded-lg bg-white/20">
                <Target className="h-5 w-5" />
              </div>
              <div className="text-left">
                <div className="font-medium">New Campaign</div>
                <div className="text-xs opacity-90">Create marketing campaign</div>
              </div>
            </Button>
          }
        />
      ),
      disabled: !canCreateCampaigns,
    },
    {
      title: 'Add Task',
      description: 'Create and assign a new task',
      icon: CheckSquare,
      action: () => navigate('/tasks/create'),
      variant: 'outline' as const,
    },
    {
      title: 'New Lead',
      description: 'Add a potential customer',
      icon: UserPlus,
      action: () => navigate('/leads/create'),
      variant: 'outline' as const,
    },
    {
      title: 'Create Report',
      description: 'Document campaign progress',
      icon: FileBarChart,
      action: () => navigate('/reports/create'),
      variant: 'outline' as const,
    },
    {
      title: 'View Reports',
      description: 'Review campaign execution',
      icon: FileText,
      action: () => navigate('/reports'),
      variant: 'outline' as const,
    },
    {
      title: 'Manage Clients',
      description: 'Add and manage clients',
      icon: Users,
      action: () => navigate('/clients'),
      variant: 'outline' as const,
      disabled: !canManageClients,
    },
  ];

  return (
    <Card className="shadow-md border-0 bg-gradient-subtle">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
          <div className="p-1 rounded-md bg-primary/10">
            <Plus className="h-4 w-4 text-primary" />
          </div>
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {actions.map((action, index) => {
            if (action.component) {
              return (
                <div key={index} className="space-y-2">
                  {action.component()}
                </div>
              );
            }
            
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant={action.variant}
                className="h-auto p-4 flex flex-col items-start space-y-2 group transition-all duration-200 hover:scale-[1.02]"
                onClick={action.action}
                disabled={action.disabled}
              >
                <div className="flex items-center gap-2 w-full">
                  <Icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                  <span className="font-medium">{action.title}</span>
                </div>
                <span className="text-xs opacity-80 text-left">
                  {action.description}
                </span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
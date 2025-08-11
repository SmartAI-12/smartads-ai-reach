import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface DashboardStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalTasks: number;
  completedTasks: number;
  totalClients: number;
  totalExpenses: number;
  totalLeads: number;
  convertedLeads: number;
}

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async (): Promise<DashboardStats> => {
      const [
        campaignsResult,
        activeCampaignsResult,
        tasksResult,
        completedTasksResult,
        clientsResult,
        expensesResult,
        leadsResult,
        convertedLeadsResult,
      ] = await Promise.all([
        supabase.from('campaigns').select('id', { count: 'exact', head: true }),
        supabase.from('campaigns').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('tasks').select('id', { count: 'exact', head: true }),
        supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('status', 'completed'),
        supabase.from('clients').select('id', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('expenses').select('amount'),
        supabase.from('leads').select('id', { count: 'exact', head: true }),
        supabase.from('leads').select('id', { count: 'exact', head: true }).eq('status', 'converted'),
      ]);

      // Calculate total expenses
      const totalExpenses = expensesResult.data?.reduce((sum, expense) => 
        sum + (parseFloat(expense.amount.toString()) || 0), 0
      ) || 0;

      return {
        totalCampaigns: campaignsResult.count || 0,
        activeCampaigns: activeCampaignsResult.count || 0,
        totalTasks: tasksResult.count || 0,
        completedTasks: completedTasksResult.count || 0,
        totalClients: clientsResult.count || 0,
        totalExpenses,
        totalLeads: leadsResult.count || 0,
        convertedLeads: convertedLeadsResult.count || 0,
      };
    },
  });
};
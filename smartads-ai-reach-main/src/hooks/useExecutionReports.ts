import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ExecutionReport {
  id: string;
  campaign_id: string;
  report_date: string;
  activities_completed?: string[];
  challenges?: string;
  next_steps?: string;
  metrics?: Record<string, any>;
  photos?: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
  campaigns?: {
    name: string;
  };
  profiles?: {
    full_name: string;
  };
}

export const useExecutionReports = () => {
  return useQuery({
    queryKey: ['execution-reports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('execution_reports')
        .select(`
          *,
          campaigns (name),
          profiles!execution_reports_created_by_fkey (full_name)
        `)
        .order('report_date', { ascending: false });

      if (error) throw error;
      return data as ExecutionReport[];
    },
  });
};

export const useCreateExecutionReport = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (report: Omit<ExecutionReport, 'id' | 'created_at' | 'updated_at' | 'campaigns' | 'profiles'>) => {
      const { data, error } = await supabase
        .from('execution_reports')
        .insert(report)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['execution-reports'] });
      toast({
        title: 'Success',
        description: 'Execution report created successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to create execution report',
        variant: 'destructive',
      });
    },
  });
};

export const useUpdateExecutionReport = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ExecutionReport> & { id: string }) => {
      const { data, error } = await supabase
        .from('execution_reports')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['execution-reports'] });
      toast({
        title: 'Success',
        description: 'Execution report updated successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: 'Failed to update execution report',
        variant: 'destructive',
      });
    },
  });
};
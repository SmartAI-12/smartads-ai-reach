import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface VendorTask {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  campaign_id: string;
  created_by: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  campaigns?: {
    name: string;
  };
  profiles?: {
    full_name: string;
  };
  check_ins?: {
    id: string;
    check_in_time: string;
    check_out_time?: string;
    location: any;
    address?: string;
    notes?: string;
  }[];
  task_photos?: {
    id: string;
    photo_url: string;
    caption?: string;
    created_at: string;
  }[];
  expenses?: {
    id: string;
    amount: number;
    category: string;
    description?: string;
    status: string;
    created_at: string;
  }[];
}

export const useVendorTasks = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['vendor-tasks', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      // First get the vendor's profile ID
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      // Then get tasks assigned to this vendor
      const { data, error } = await supabase
        .from('tasks')
        .select(`
          *,
          campaigns(name),
          profiles!tasks_assigned_to_fkey(full_name)
        `)
        .eq('assigned_to', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      const transformedData = data?.map(task => ({
        ...task,
        check_ins: [],
        task_photos: [],
        expenses: []
      })) || [];
      
      return transformedData as VendorTask[];
    },
    enabled: !!user,
  });
};

export const useUpdateVendorTask = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<VendorTask> & { id: string }) => {
      const { data, error } = await supabase
        .from('tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vendor-tasks'] });
      toast({
        title: "Success",
        description: "Task updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
};

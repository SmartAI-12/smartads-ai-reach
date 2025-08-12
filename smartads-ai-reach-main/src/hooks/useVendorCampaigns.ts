import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface VendorCampaign {
  id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  budget?: number;
  start_date?: string;
  end_date?: string;
  client_id: string;
  created_by: string;
  assigned_to?: string;
  target_audience?: string;
  objectives?: string;
  kpis?: any;
  created_at: string;
  updated_at: string;
  clients?: {
    name: string;
  };
  profiles?: {
    full_name: string;
  };
  tasks?: {
    id: string;
    title: string;
    status: string;
    priority: string;
    due_date?: string;
  }[];
}

export const useVendorCampaigns = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['vendor-campaigns', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      // First get the vendor's profile ID
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;

      // Then get campaigns assigned to this vendor
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          clients(name),
          profiles!campaigns_assigned_to_fkey(full_name),
          tasks(
            id,
            title,
            status,
            priority,
            due_date
          )
        `)
        .eq('assigned_to', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as VendorCampaign[];
    },
    enabled: !!user,
  });
};

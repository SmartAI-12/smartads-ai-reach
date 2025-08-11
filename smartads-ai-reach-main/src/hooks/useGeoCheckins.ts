import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface GeoCheckin {
  id: string;
  campaign_id: string;
  user_id: string;
  checkin_type: 'campaign_start' | 'campaign_end' | 'milestone_update' | 'issue_report';
  latitude: number;
  longitude: number;
  address?: string;
  notes?: string;
  photos: string[];
  created_at: string;
}

export const useGeoCheckins = (campaignId?: string) => {
  return useQuery({
    queryKey: ['geo_checkins', campaignId],
    queryFn: async () => {
      let query = supabase
        .from('geo_checkins')
        .select('*')
        .order('created_at', { ascending: false });

      if (campaignId) {
        query = query.eq('campaign_id', campaignId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as GeoCheckin[];
    },
  });
};

export const useCreateGeoCheckin = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (checkin: Omit<GeoCheckin, 'id' | 'created_at'>) => {
      const { data, error } = await supabase
        .from('geo_checkins')
        .insert([checkin])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['geo_checkins'] });
      toast({
        title: "Success",
        description: "Check-in recorded successfully",
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
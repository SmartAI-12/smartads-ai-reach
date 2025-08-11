import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface Activity {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  entity_name: string | null;
  details: any;
  created_at: string;
  profiles?: {
    full_name: string;
    avatar_url: string | null;
  };
}

export const useActivities = (limit: number = 20) => {
  return useQuery({
    queryKey: ['activities', limit],
    queryFn: async () => {
      const { data: activities, error: activitiesError } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (activitiesError) throw activitiesError;

      // Get unique user IDs and fetch their profiles
      const userIds = [...new Set(activities.map(a => a.user_id))];
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Combine activities with profiles
      const activitiesWithProfiles = activities.map(activity => ({
        ...activity,
        profiles: profiles.find(p => p.id === activity.user_id) || null,
      }));

      return activitiesWithProfiles as Activity[];
    },
  });
};

export const useCreateActivity = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: {
      action: string;
      entity_type: string;
      entity_id?: string;
      entity_name?: string;
      details?: any;
    }) => {
      if (!profile?.id) throw new Error('User not authenticated');

      const { error } = await supabase.rpc('log_activity', {
        p_user_id: profile.id,
        p_action: params.action,
        p_entity_type: params.entity_type,
        p_entity_id: params.entity_id || null,
        p_entity_name: params.entity_name || null,
        p_details: params.details || null,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to log activity",
        variant: "destructive",
      });
    },
  });
};

// Real-time activities subscription hook
export const useActivitySubscription = () => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: ['activity-subscription'],
    queryFn: async () => {
      const channel = supabase
        .channel('activities')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'activities',
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ['activities'] });
          }
        )
        .subscribe();

      return channel;
    },
  });
};
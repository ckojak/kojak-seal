import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type VehiclePermission = 'owner' | 'editor' | 'viewer';

export interface VehicleUser {
  id: string;
  vehicle_id: string;
  user_id: string;
  permission: VehiclePermission;
  invited_by: string | null;
  created_at: string;
}

export function useVehicleUsers(vehicleId?: string) {
  return useQuery({
    queryKey: ['vehicle-users', vehicleId],
    queryFn: async () => {
      if (!vehicleId) return [];
      const { data, error } = await supabase
        .from('vehicle_users')
        .select('*')
        .eq('vehicle_id', vehicleId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as VehicleUser[];
    },
    enabled: !!vehicleId,
  });
}

export function useAddVehicleUser() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ 
      vehicleId, 
      userId, 
      permission 
    }: { 
      vehicleId: string; 
      userId: string; 
      permission: VehiclePermission;
    }) => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('vehicle_users')
        .insert({
          vehicle_id: vehicleId,
          user_id: userId,
          permission,
          invited_by: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as VehicleUser;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-users', variables.vehicleId] });
    },
  });
}

export function useRemoveVehicleUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, vehicleId }: { id: string; vehicleId: string }) => {
      const { error } = await supabase
        .from('vehicle_users')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['vehicle-users', variables.vehicleId] });
    },
  });
}
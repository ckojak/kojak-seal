import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Veiculo {
  id: string;
  user_id: string;
  placa: string;
  marca: string | null;
  modelo: string | null;
  ano: number | null;
  cor: string | null;
  created_at: string;
  updated_at: string;
}

export function useVeiculos() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['veiculos', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('veiculos')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Veiculo[];
    },
    enabled: !!user,
  });
}

export function useCreateVeiculo() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (veiculo: Omit<Veiculo, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('veiculos')
        .insert({
          ...veiculo,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['veiculos'] });
    },
  });
}

export function useUpdateVeiculo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Veiculo> & { id: string }) => {
      const { data, error } = await supabase
        .from('veiculos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['veiculos'] });
    },
  });
}

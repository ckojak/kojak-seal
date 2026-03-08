import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Veiculo {
  id: string;
  user_id: string;
  placa: string;
  marca: string | null;
  modelo: string | null;
  ano: number | null;
  cor: string | null;
  oficina_email: string | null;
  proprietario_id: string | null;
  created_at: string;
  updated_at: string;
}

// Force rebuild to pick up updated Supabase secrets

export function useVeiculos(options?: { isOficina?: boolean }) {
  const { user } = useAuth();
  const isOficina = options?.isOficina ?? false;

  return useQuery({
    queryKey: ['veiculos', user?.id, isOficina],
    queryFn: async () => {
      if (!user) return [];

      if (isOficina) {
        // Oficina: fetch vehicles they own + vehicles they serviced
        // Priority 1: vehicles with maintenance by this oficina
        // Priority 2: vehicles they own
        const [ownedRes, servicedRes] = await Promise.all([
          supabase
            .from('veiculos')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('manutencoes')
            .select('veiculo_id')
            .eq('user_id', user.id),
        ]);

        if (ownedRes.error) { toast.error('Erro ao carregar veículos'); throw ownedRes.error; }

        const servicedVehicleIds = new Set(
          (servicedRes.data ?? []).map((m) => m.veiculo_id)
        );

        // Fetch serviced vehicles not already owned
        const ownedIds = new Set((ownedRes.data ?? []).map((v) => v.id));
        const extraIds = [...servicedVehicleIds].filter((id) => !ownedIds.has(id));

        let servicedVehicles: Veiculo[] = [];
        if (extraIds.length > 0) {
          const { data, error } = await supabase
            .from('veiculos')
            .select('*')
            .in('id', extraIds);
          if (!error && data) servicedVehicles = data as Veiculo[];
        }

        // Merge: serviced first, then owned-only
        const allVehicles = [...(ownedRes.data as Veiculo[]), ...servicedVehicles];
        const seen = new Set<string>();
        const sorted: Veiculo[] = [];

        // Priority 1: vehicles serviced by this oficina
        for (const v of allVehicles) {
          if (servicedVehicleIds.has(v.id) && !seen.has(v.id)) {
            sorted.push(v);
            seen.add(v.id);
          }
        }
        // Priority 2: remaining owned vehicles
        for (const v of allVehicles) {
          if (!seen.has(v.id)) {
            sorted.push(v);
            seen.add(v.id);
          }
        }

        return sorted;
      }

      // Regular user: only their own vehicles
      const { data, error } = await supabase
        .from('veiculos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) { toast.error('Erro ao carregar veículos'); throw error; }
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
      toast.success('Veículo adicionado com sucesso!');
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error('Erro ao adicionar veículo: ' + message);
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

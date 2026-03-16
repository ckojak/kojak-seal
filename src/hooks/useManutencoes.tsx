import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Manutencao {
  id: string;
  veiculo_id: string;
  user_id: string;
  km_atual: number;
  descricao: string;
  foto_url?: string | null;
  data_selada: string;
  oficina: string;
  verificado: boolean;
}

export function useManutencoes(veiculoId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['manutencoes', veiculoId, user?.id],
    queryFn: async () => {
      let query = supabase
        .from('manutencoes')
        .select('*')
        .order('data_selada', { ascending: false });

      if (veiculoId) {
        query = query.eq('veiculo_id', veiculoId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data ?? []) as Manutencao[];
    },
    enabled: !!user,
  });
}

export function useCreateManutencao() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (newManutencao: Partial<Manutencao>) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data: profile } = await supabase
        .from('profiles')
        .select('user_type, is_verified, display_name')
        .eq('user_id', user.id)
        .single();

      const isOficinaReal = profile?.user_type === 'oficina' && profile?.is_verified === true;

      const { data, error } = await supabase
        .from('manutencoes')
        .insert([{
          veiculo_id: newManutencao.veiculo_id!,
          km_atual: newManutencao.km_atual!,
          descricao: newManutencao.descricao!,
          foto_url: newManutencao.foto_url || null,
          user_id: user.id,
          oficina: profile?.display_name || 'Usuário',
          verificado: isOficinaReal,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manutencoes'] });
      toast.success('Manutenção registrada com sucesso!');
    },
    onError: (error: any) => {
      toast.error('Erro ao salvar: ' + error.message);
    }
  });
}

export function useUploadFoto() {
  return useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('manutencao_fotos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('manutencao_fotos')
        .getPublicUrl(fileName);

      return data.publicUrl;
    },
  });
}

export const calculateHealthScore = (manutencoes: Manutencao[]) => {
  if (manutencoes.length === 0) return 100;
  const verificadas = manutencoes.filter(m => m.verificado).length;
  const score = (verificadas / manutencoes.length) * 100;
  return Math.round(score);
};

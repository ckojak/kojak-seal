import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Manutencao {
  id: string;
  user_id: string;
  veiculo_id: string;
  km_atual: number;
  descricao: string;
  foto_url: string | null;
  foto_peca_url?: string | null;
  dias_revisao?: number | null;
  data_selada: string;
  oficina: string;
  verificado: boolean;
}

interface CreateManutencaoInput {
  veiculo_id: string;
  km_atual: number;
  descricao: string;
  foto_url?: string | null;
  foto_peca_url?: string | null;
  oficina?: string;
  dias_revisao?: number | null;
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
      if (error) {
        toast.error('Erro ao carregar manutenções');
        throw error;
      }

      return (data ?? []) as Manutencao[];
    },
    enabled: !!user,
  });
}

export function useCreateManutencao() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (newManutencao: CreateManutencaoInput) => {
      if (!user) throw new Error('Usuário não autenticado');

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('profile_type, is_verified_admin, display_name, razao_social')
        .eq('user_id', user.id)
        .maybeSingle();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      const isOficinaReal = profile?.profile_type === 'oficina' && !!profile?.is_verified_admin;

      const payload = {
        veiculo_id: newManutencao.veiculo_id,
        km_atual: newManutencao.km_atual,
        descricao: newManutencao.descricao,
        foto_url: newManutencao.foto_url ?? null,
        dias_revisao: newManutencao.dias_revisao ?? null,
        oficina: newManutencao.oficina ?? profile?.razao_social ?? profile?.display_name ?? 'Usuário',
        verificado: isOficinaReal,
        user_id: user.id,
      };

      const { data, error } = await supabase
        .from('manutencoes')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return data as Manutencao;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manutencoes'] });
      toast.success('Manutenção registrada com sucesso!');
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';
      toast.error('Erro ao salvar: ' + message);
    }
  });
}

export function useUploadFoto() {
  return useMutation({
    mutationFn: async (file: File) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('manutencoes-fotos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('manutencoes-fotos')
        .getPublicUrl(filePath);

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

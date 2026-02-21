import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Manutencao {
  id: string;
  veiculo_id: string;
  km_atual: number;
  descricao: string;
  foto_url?: string;
  foto_peca_url?: string; // Nova coluna para a segunda foto
  data_selada: string;
  oficina: string;
  verificado: boolean;
  status: 'pendente' | 'aprovado' | 'rejeitado';
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
      return data as Manutencao[];
    },
    enabled: !!user,
  });
}

export function useCreateManutencao() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (newManutencao: Partial<Manutencao>) => {
      const { data: profile } = await supabase
        .from('profiles')
        .select('profile_type, is_verified_admin, full_name')
        .eq('id', user?.id)
        .single();

      // Lógica de Bilionário: Só é verificado se for Oficina E aprovado por você
      const isOficinaReal = profile?.profile_type === 'oficina' && profile?.is_verified_admin;

      const { data, error } = await supabase
        .from('manutencoes')
        .insert([{
          ...newManutencao,
          oficina: profile?.full_name || 'Usuário',
          verificado: isOficinaReal, // Trava de segurança
          status: isOficinaReal ? 'aprovado' : 'pendente'
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
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('manutencao_fotos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('manutencao_fotos')
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

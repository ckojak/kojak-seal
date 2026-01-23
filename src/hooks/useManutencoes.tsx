import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Manutencao {
  id: string;
  veiculo_id: string;
  user_id: string;
  km_atual: number;
  oficina: string;
  descricao: string;
  foto_url: string | null;
  data_selada: string;
  verificado: boolean;
}

export function useManutencoes(veiculoId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['manutencoes', user?.id, veiculoId],
    queryFn: async () => {
      if (!user) return [];
      
      let query = supabase
        .from('manutencoes')
        .select('*')
        .order('data_selada', { ascending: false });
      
      if (veiculoId) {
        query = query.eq('veiculo_id', veiculoId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Manutencao[];
    },
    enabled: !!user,
  });
}

export function useCreateManutencao() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (manutencao: {
      veiculo_id: string;
      km_atual: number;
      oficina: string;
      descricao: string;
      foto_url?: string;
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      // IMPORTANTE: data_selada é definida automaticamente pelo servidor (now())
      // O frontend NUNCA envia uma data
      const { data, error } = await supabase
        .from('manutencoes')
        .insert({
          veiculo_id: manutencao.veiculo_id,
          user_id: user.id,
          km_atual: manutencao.km_atual,
          oficina: manutencao.oficina,
          descricao: manutencao.descricao,
          foto_url: manutencao.foto_url || null,
          // data_selada e verificado são definidos automaticamente pelo DB
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as Manutencao;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['manutencoes'] });
    },
  });
}

// Upload de foto para o bucket de manutenções
export function useUploadFoto() {
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (file: File) => {
      if (!user) throw new Error('User not authenticated');
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('manutencoes-fotos')
        .upload(fileName, file);
      
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl } } = supabase.storage
        .from('manutencoes-fotos')
        .getPublicUrl(fileName);
      
      return publicUrl;
    },
  });
}

// Calcula o Health Score baseado na frequência de manutenções
export function calculateHealthScore(manutencoes: Manutencao[]): number {
  if (manutencoes.length === 0) return 50; // Score neutro se não há registros
  
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
  
  // Manutenções recentes aumentam o score
  const recentCount = manutencoes.filter(m => 
    new Date(m.data_selada) > thirtyDaysAgo
  ).length;
  
  const moderateCount = manutencoes.filter(m => {
    const date = new Date(m.data_selada);
    return date <= thirtyDaysAgo && date > ninetyDaysAgo;
  }).length;
  
  // Score base
  let score = 50;
  
  // Bônus por manutenções recentes
  score += Math.min(recentCount * 15, 30);
  
  // Bônus por manutenções moderadas
  score += Math.min(moderateCount * 5, 15);
  
  // Bônus por quantidade total
  score += Math.min(manutencoes.length * 2, 10);
  
  // Limitar entre 0 e 100
  return Math.min(Math.max(score, 0), 100);
}

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface CurrentProfile {
  id: string;
  user_id: string;
  user_type: string | null;
  cnpj: string | null;
  display_name: string | null;
  is_verified: boolean;
  onboarding_completed: boolean | null;
  subscription_status: string;
}

export function useCurrentProfile() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['current-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await query;
      // ... (mantém a lógica de busca do seu arquivo original)
      return data as CurrentProfile;
    },
    // ...
  });

  // A MÁGICA DE GIGANTE ESTÁ AQUI:
  // Só é considerado "Oficina" com poder de selagem se:
  // 1. O tipo for oficina E 2. Você deu o OK no Admin (is_verified)
  const isOficina = query.data?.user_type === 'oficina' && query.data?.is_verified === true;
  
  const hasCnpj = !!query.data?.cnpj;
  const canSearchPlates = isOficina && hasCnpj;

  return {
    ...query,
    profile: query.data,
    isOficina, // Agora isso depende do seu clique no Admin
    hasCnpj,
    canSearchPlates,
  };
}

import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

const CEO_EMAIL = 'bmw.reta@hotmail.com';

export function useCurrentProfile() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['current-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user,
  });

  // LÓGICA DE PODER ABSOLUTO (CEO BYPASS)
  const isCEO = user?.email?.toLowerCase() === CEO_EMAIL.toLowerCase();
  
  // Se for CEO, isOficina e isVerified são SEMPRE true
  const isOficina = isCEO || (query.data?.user_type === 'oficina');
  const isVerified = isCEO || (query.data?.is_verified === true);
  
  // Liberar busca de placa e todas as ferramentas premium
  const canSearchPlates = isCEO || (isOficina && !!query.data?.cnpj);

  return {
    ...query,
    profile: query.data,
    isCEO,
    isOficina: isOficina && isVerified, // Para usuários normais, precisa de ambos. Para CEO, isCEO já resolveu acima.
    canSearchPlates,
    isVerified,
  };
}

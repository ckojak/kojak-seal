import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

const CEO_EMAIL = 'bmw.reta@hotmail.com';

export function useCurrentProfile() {
  const { user } = useAuth();
  const isCEO = user?.email?.toLowerCase() === CEO_EMAIL.toLowerCase();

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

  // Regra Universal: Oficina Validada ou CEO — checks user_type, profile_type, AND role columns
  const p = query.data;
  const isOficinaType = p?.user_type === 'oficina' || p?.profile_type === 'oficina' || p?.role === 'oficina';
  const isVerifiedOficina = isOficinaType && (p?.is_verified === true || p?.is_verified_admin === true);
  const isOficina = isCEO || isVerifiedOficina;

  return {
    ...query,
    profile: query.data,
    isCEO,
    isOficina,
    isVerified: isCEO || p?.is_verified === true,
    canSearchPlates: isCEO || (isOficina && !!p?.cnpj),
  };
}

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

      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, user_type, cnpj, display_name, is_verified, onboarding_completed, subscription_status')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
      }
      return data as CurrentProfile;
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5,
  });

  const isOficina = query.data?.user_type === 'oficina';
  const hasCnpj = !!query.data?.cnpj;
  const canSearchPlates = isOficina && hasCnpj;

  return {
    ...query,
    profile: query.data,
    isOficina,
    hasCnpj,
    canSearchPlates,
  };
}

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

const CEO_EMAIL = 'bmw.reta@hotmail.com';

export interface SubscriptionStatus {
  status: 'active' | 'inactive' | 'free';
  expiresAt: Date | null;
  isExpired: boolean;
  canUsePremiumFeatures: boolean;
}

export function useSubscription() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async (): Promise<SubscriptionStatus> => {
      const isCEO = user?.email?.toLowerCase() === CEO_EMAIL.toLowerCase();

      if (!user) {
        return { status: 'free', expiresAt: null, isExpired: false, canUsePremiumFeatures: false };
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_status, subscription_expires_at')
        .eq('user_id', user.id)
        .single();

      const expiresAt = data?.subscription_expires_at ? new Date(data.subscription_expires_at) : null;
      const now = new Date();
      const isExpired = expiresAt ? now > expiresAt : false;
      
      // GOD MODE: CEO sempre pode usar tudo, sem expiração
      const canUsePremiumFeatures = isCEO || (data?.subscription_status === 'active' && !isExpired) || data?.subscription_status === 'free';

      return {
        status: isCEO ? 'active' : (data?.subscription_status as any || 'free'),
        expiresAt: isCEO ? new Date('2099-12-31') : expiresAt,
        isExpired: isCEO ? false : isExpired,
        canUsePremiumFeatures,
      };
    },
    enabled: !!user,
  });
}

// Hook para o modal (Gatekeeper)
export function useSubscriptionGatekeeper() {
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const { data: subscription, isLoading } = useSubscription();
  const { user } = useAuth();

  const checkAccess = useCallback((): boolean => {
    if (isLoading || !subscription) return true;
    const isCEO = user?.email?.toLowerCase() === CEO_EMAIL.toLowerCase();
    
    if (isCEO) return true; // CEO ignora o modal de cobrança

    if ((subscription.status === 'active' && subscription.isExpired) || subscription.status === 'inactive') {
      setShowRenewalModal(true);
      return false;
    }
    return true;
  }, [subscription, isLoading, user]);

  return { subscription, isLoading, showRenewalModal, checkAccess, closeModal: () => setShowRenewalModal(false) };
}

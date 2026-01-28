import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

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
      if (!user) {
        return {
          status: 'free',
          expiresAt: null,
          isExpired: false,
          canUsePremiumFeatures: false,
        };
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('subscription_status, subscription_expires_at')
        .eq('user_id', user.id)
        .single();

      if (error || !data) {
        return {
          status: 'free',
          expiresAt: null,
          isExpired: false,
          canUsePremiumFeatures: false,
        };
      }

      const expiresAt = data.subscription_expires_at 
        ? new Date(data.subscription_expires_at) 
        : null;
      
      const now = new Date();
      const isExpired = expiresAt ? now > expiresAt : false;
      
      // User can use premium features if:
      // - Status is 'active' AND not expired
      // - OR status is 'free' (for now, free users can use features)
      const canUsePremiumFeatures = 
        (data.subscription_status === 'active' && !isExpired) ||
        data.subscription_status === 'free';

      return {
        status: data.subscription_status as SubscriptionStatus['status'],
        expiresAt,
        isExpired,
        canUsePremiumFeatures,
      };
    },
    enabled: !!user,
    staleTime: 1000 * 60, // Cache for 1 minute
  });
}

// Hook for subscription gatekeeper logic
export function useSubscriptionGatekeeper() {
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const { data: subscription, isLoading } = useSubscription();

  const checkAccess = useCallback((): boolean => {
    if (isLoading || !subscription) return true; // Allow during loading
    
    // If subscription is active and expired, block access
    if (subscription.status === 'active' && subscription.isExpired) {
      setShowRenewalModal(true);
      return false;
    }
    
    // If subscription is inactive, block access
    if (subscription.status === 'inactive') {
      setShowRenewalModal(true);
      return false;
    }
    
    return true;
  }, [subscription, isLoading]);

  const closeModal = useCallback(() => {
    setShowRenewalModal(false);
  }, []);

  return {
    subscription,
    isLoading,
    showRenewalModal,
    checkAccess,
    closeModal,
  };
}

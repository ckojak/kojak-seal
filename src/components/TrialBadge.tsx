import { useSubscription } from '@/hooks/useSubscription';
import { differenceInDays } from 'date-fns';
import { Clock } from 'lucide-react';

export function TrialBadge() {
  const { data: subscription } = useSubscription();

  if (!subscription || subscription.status !== 'active' || !subscription.expiresAt) return null;

  const daysLeft = differenceInDays(subscription.expiresAt, new Date());
  if (daysLeft <= 0 || daysLeft > 15) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20">
      <Clock className="w-3.5 h-3.5 text-primary" />
      <span className="text-xs font-medium text-primary">
        Período de Teste: Faltam {daysLeft} dia{daysLeft !== 1 ? 's' : ''}
      </span>
    </div>
  );
}

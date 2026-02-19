import { useSubscription } from '@/hooks/useSubscription';
import { AlertTriangle, MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { differenceInDays } from 'date-fns';

const WHATSAPP_NUMBER = '5521979934676';
const WHATSAPP_MESSAGE = encodeURIComponent(
  'Olá! Minha assinatura do Ficha do Carro está vencendo (ou venceu) e quero renovar meu acesso.'
);

export function SubscriptionExpiryBanner() {
  const { data: subscription } = useSubscription();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !subscription) return null;

  // Only show for active subscriptions that expire within 7 days
  if (subscription.status !== 'active' || !subscription.expiresAt) return null;

  const daysLeft = differenceInDays(subscription.expiresAt, new Date());

  // Show if expired or within 7 days of expiring
  if (daysLeft > 7) return null;

  const isExpired = daysLeft <= 0;
  const isTrial = subscription.status === 'active'; // We can refine later if needed

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`, '_blank');
  };

  return (
    <div className={`relative rounded-xl p-4 mb-4 border ${
      isExpired 
        ? 'bg-destructive/10 border-destructive/30' 
        : 'bg-[38_92%_50%]/10 border-[38_92%_50%]/30'
    }`}
    style={{
      background: isExpired 
        ? 'hsl(0 84% 60% / 0.1)' 
        : 'hsl(38 92% 50% / 0.1)',
      borderColor: isExpired 
        ? 'hsl(0 84% 60% / 0.3)' 
        : 'hsl(38 92% 50% / 0.3)',
    }}>
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="flex items-start gap-3 pr-6">
        <AlertTriangle 
          className="w-5 h-5 shrink-0 mt-0.5"
          style={{ color: isExpired ? 'hsl(0 84% 60%)' : 'hsl(38 92% 50%)' }}
        />
        <div className="flex-1">
          <p className="text-sm font-semibold text-foreground">
            {isExpired 
              ? '⚠️ Sua assinatura expirou!' 
              : `⚠️ Atenção: Sua assinatura expira em ${daysLeft} dia${daysLeft !== 1 ? 's' : ''}!`
            }
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {isExpired
              ? 'Renove agora para continuar selando manutenções e usando os recursos premium.'
              : 'Renove agora para não perder o acesso ao sistema.'
            }
          </p>
          <Button
            size="sm"
            onClick={handleWhatsApp}
            className="mt-3 h-8 gap-2 bg-[#25D366] hover:bg-[#128C7E] text-white text-xs"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            Renovar Agora
          </Button>
        </div>
      </div>
    </div>
  );
}

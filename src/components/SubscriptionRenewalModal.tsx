import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, MessageCircle, X, Crown, Zap } from 'lucide-react';

interface SubscriptionRenewalModalProps {
  open: boolean;
  onClose: () => void;
}

const WHATSAPP_NUMBER = '5521979934676';
const WHATSAPP_MESSAGE = encodeURIComponent(
  'Olá Kojak, quero assinar/renovar meu plano no Auto-Log.'
);

export function SubscriptionRenewalModal({ open, onClose }: SubscriptionRenewalModalProps) {
  const handleWhatsAppClick = () => {
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`,
      '_blank'
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md mx-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Fechar</span>
        </button>
        
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/20 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          
          <DialogTitle className="text-xl font-bold text-foreground">
            Assinatura Vencida!
          </DialogTitle>
          
          <DialogDescription className="text-muted-foreground text-center">
            Sua assinatura expirou. Renove para continuar selando manutenções e usando recursos premium.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 mt-4">
          {/* Plano Mensal */}
          <div className="rounded-xl border border-border bg-secondary/30 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Plano Mensal</p>
                <p className="text-xs text-muted-foreground">Acesso completo por 30 dias</p>
              </div>
            </div>
            <p className="text-lg font-bold text-primary">R$ 49,90</p>
          </div>

          {/* Plano Anual */}
          <div className="rounded-xl border-2 border-primary/50 bg-primary/5 p-4 flex items-center justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-bl-lg">
              MELHOR OFERTA
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                <Crown className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Plano Anual</p>
                <p className="text-xs text-muted-foreground">2 meses grátis incluso</p>
              </div>
            </div>
            <p className="text-lg font-bold text-primary">R$ 499</p>
          </div>

          <Button
            onClick={handleWhatsAppClick}
            className="w-full h-12 bg-[#25D366] hover:bg-[#128C7E] text-white gap-3 mt-2"
          >
            <MessageCircle className="w-5 h-5" />
            Renovar via WhatsApp
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            Escolha seu plano e envie a mensagem. Nossa equipe ativará seu acesso em minutos.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

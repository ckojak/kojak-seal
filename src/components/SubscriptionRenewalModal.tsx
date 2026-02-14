import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, MessageCircle, X } from 'lucide-react';

interface SubscriptionRenewalModalProps {
  open: boolean;
  onClose: () => void;
}

const WHATSAPP_NUMBER = '5521979934676';
const WHATSAPP_MESSAGE = encodeURIComponent(
  'Olá Kojak! Minha assinatura do Auto-Log está vencendo (ou venceu) e quero renovar meu acesso.'
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
            Sua assinatura expirou. Para continuar selando manutenções e usando recursos premium, renove agora.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-6">
          <Button
            onClick={handleWhatsAppClick}
            className="w-full h-12 bg-[#25D366] hover:bg-[#128C7E] text-white gap-3"
          >
            <MessageCircle className="w-5 h-5" />
            Renovar via WhatsApp
          </Button>
          
          <p className="text-xs text-muted-foreground text-center">
            Entre em contato para renovar sua assinatura e desbloquear todos os recursos do Kojak Auto-Log.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

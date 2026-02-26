import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Share2, Copy, Check, ShieldCheck, Fingerprint, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { Veiculo } from '@/hooks/useVeiculos';

interface ShareVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  veiculo: Veiculo;
}

export function ShareVehicleModal({ isOpen, onClose, veiculo }: ShareVehicleModalProps) {
  const [copied, setCopied] = useState(false);
  
  const publicUrl = `${window.location.origin}/v/${veiculo.id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.success('Link de integridade copiado!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erro ao copiar link');
    }
  };

  const handleOpenLink = () => {
    window.open(publicUrl, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-[#0F172A] border-slate-800 max-w-md rounded-[2.5rem] p-8 shadow-2xl">
        <DialogHeader>
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 border border-primary/20">
            <Share2 className="w-7 h-7 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-black text-white uppercase tracking-tight">
            Partilha Oficial
          </DialogTitle>
          <DialogDescription className="text-slate-400 font-medium">
            Gere o link de autenticidade para o veículo <span className="text-primary font-bold">{veiculo.placa}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 mt-4">
          {/* Seção do Link Público Blindado */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">
                URL de Verificação
              </Label>
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-green-500 bg-green-500/5 px-2 py-1 rounded-md border border-green-500/10">
                <ShieldCheck className="w-3 h-3" /> ATIVO
              </div>
            </div>
            
            <div className="relative group">
              <Input
                value={publicUrl}
                readOnly
                className="bg-slate-900/50 border-slate-800 text-slate-300 text-sm h-14 pr-24 rounded-2xl focus-visible:ring-primary/30"
              />
              <div className="absolute right-2 top-2 flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleOpenLink}
                  className="h-10 w-10 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
                  title="Abrir link"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
                <Button
                  onClick={handleCopyLink}
                  className={`h-10 px-4 rounded-xl font-bold transition-all ${
                    copied ? 'bg-green-600 hover:bg-green-600' : 'bg-primary hover:bg-primary/90'
                  }`}
                >
                  {copied ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Info de Segurança (Blockchain-Style) */}
          <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl space-y-3">
            <div className="flex items-center gap-3">
              <Fingerprint className="w-5 h-5 text-primary/60" />
              <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                Este link dá acesso à <span className="text-white font-bold">Ficha Pública de Integridade</span>. 
                Qualquer pessoa com o link poderá auditar o histórico de manutenções seladas.
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full border-slate-800 hover:bg-slate-900 text-slate-400 hover:text-white h-12 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all"
            onClick={onClose}
          >
            Fechar Painel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

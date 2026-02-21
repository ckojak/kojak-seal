import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { useVeiculos } from '@/hooks/useVeiculos';
import { useManutencoes, calculateHealthScore } from '@/hooks/useManutencoes';
import { Award, Shield, Share2, FileDown, Loader2, MessageCircle, QrCode, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { QRCodeSVG } from 'qrcode.react';
import { usePdfExport } from '@/hooks/usePdfExport';
import { toast } from 'sonner';

export default function Certificado() {
  const { id: urlVehicleId } = useParams();
  const { data: veiculos = [] } = useVeiculos();
  const { data: manutencoes = [] } = useManutencoes();
  const { exportToPdf, isExporting } = usePdfExport();
  
  // Se houver ID na URL, usa ele (Modo Admin), se não, pega o primeiro carro do usuário
  const veiculoAtual = urlVehicleId 
    ? veiculos.find(v => v.id === urlVehicleId) || veiculos[0]
    : veiculos[0];

  const manutencoesVeiculo = veiculoAtual 
    ? manutencoes.filter(m => m.veiculo_id === veiculoAtual.id)
    : [];

  const healthScore = calculateHealthScore(manutencoesVeiculo);
  const publicUrl = veiculoAtual ? `${window.location.origin}/v/${veiculoAtual.id}` : '';

  const handleShare = async () => {
    if (!publicUrl) return;
    try {
      await navigator.share({
        title: `Ficha do Carro - ${veiculoAtual?.placa}`,
        text: `Confira o histórico verificado deste veículo.`,
        url: publicUrl,
      });
    } catch (err) {
      toast.error("Compartilhamento não disponível no seu navegador.");
    }
  };

  if (!veiculoAtual) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
          <Shield className="w-16 h-16 text-muted-foreground mb-4 opacity-20" />
          <h2 className="text-xl font-bold">Nenhum veículo selecionado</h2>
          <p className="text-sm text-muted-foreground mt-2">Adicione um veículo para gerar seu certificado.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="px-4 pt-6 pb-24 max-w-lg mx-auto">
        {/* Selo de Autenticidade */}
        <div className="relative bg-gradient-to-b from-card to-secondary/30 border border-border p-8 rounded-[2.5rem] shadow-xl overflow-hidden mb-8">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Award className="w-32 h-32 text-primary" />
          </div>

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20">
              <ShieldCheck className="w-10 h-10 text-primary" />
            </div>
            
            <div>
              <h1 className="text-2xl font-black tracking-tight uppercase">Certificado Digital</h1>
              <p className="text-[10px] text-primary font-bold tracking-[0.2em] uppercase">Histórico Imutável Verificado</p>
            </div>

            <div className="w-full py-6 border-y border-border/50 my-6">
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Veículo Identificado</p>
              <h2 className="text-3xl font-mono font-bold text-foreground">{veiculoAtual.placa}</h2>
              <p className="text-sm font-medium text-muted-foreground">{veiculoAtual.marca} {veiculoAtual.modelo}</p>
            </div>

            {/* QR CODE - O CORAÇÃO DA VERIFICAÇÃO */}
            <div className="bg-white p-4 rounded-3xl shadow-inner mb-4">
              <QRCodeSVG value={publicUrl} size={160} level="H" includeMargin={false} />
            </div>
            <p className="text-[10px] text-muted-foreground max-w-[200px]">
              Escaneie para validar a autenticidade e ver as fotos das manutenções no servidor.
            </p>
          </div>
        </div>

        {/* Ações de Bilionário */}
        <div className="grid grid-cols-1 gap-3">
          <Button
            onClick={handleShare}
            className="h-16 rounded-2xl bg-primary text-primary-foreground font-bold gap-3 shadow-lg shadow-primary/20"
          >
            <Share2 className="w-5 h-5" />
            Compartilhar Link Público
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              className="h-14 rounded-2xl border-border bg-card font-bold gap-2"
              onClick={() => exportToPdf(veiculoAtual, manutencoesVeiculo)}
              disabled={isExporting}
            >
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileDown className="w-4 h-4" />}
              PDF
            </Button>
            
            <Button
              variant="outline"
              className="h-14 rounded-2xl border-border bg-card font-bold gap-2"
              onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent('Confira o certificado do meu carro: ' + publicUrl)}`, '_blank')}
            >
              <MessageCircle className="w-4 h-4 text-green-500" />
              WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

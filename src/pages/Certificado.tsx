import { AppLayout } from '@/components/AppLayout';
import { useVeiculos } from '@/hooks/useVeiculos';
import { useManutencoes, calculateHealthScore } from '@/hooks/useManutencoes';
import { Award, Shield, QrCode, Share2, CheckCircle2, Calendar, Gauge } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

export default function Certificado() {
  const { data: veiculos = [] } = useVeiculos();
  const { data: manutencoes = [] } = useManutencoes();
  
  const veiculoAtual = veiculos[0];
  const manutencoesVeiculo = veiculoAtual 
    ? manutencoes.filter(m => m.veiculo_id === veiculoAtual.id)
    : [];
  const healthScore = calculateHealthScore(manutencoesVeiculo);

  const handleShare = () => {
    toast.info('Funcionalidade de compartilhamento em breve!');
  };

  if (!veiculoAtual) {
    return (
      <AppLayout>
        <div className="px-4 pt-6 pb-4 flex flex-col items-center justify-center min-h-[60vh]">
          <Award className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Nenhum certificado disponível
          </h2>
          <p className="text-sm text-muted-foreground text-center">
            Adicione um veículo e registre manutenções para gerar o certificado
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="px-4 pt-6 pb-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Award className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Certificado Digital
            </h1>
            <p className="text-sm text-muted-foreground">
              Identidade automotiva verificada
            </p>
          </div>
        </div>

        {/* Certificate Card */}
        <div className="relative overflow-hidden rounded-2xl bg-card border border-primary/30 shadow-neon">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-5">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
              </pattern>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>
          </div>

          <div className="relative p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Shield className="w-6 h-6 text-primary" />
                <span className="text-sm font-bold text-primary uppercase tracking-wider">
                  Kojak Auto-Log
                </span>
              </div>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                <CheckCircle2 className="w-3 h-3" />
                Verificado
              </span>
            </div>

            {/* Vehicle Info */}
            <div className="text-center mb-6">
              <p className="text-sm text-muted-foreground mb-1">Veículo</p>
              <h2 className="text-3xl font-mono font-bold text-primary text-glow tracking-wider">
                {veiculoAtual.placa}
              </h2>
              <p className="text-lg font-medium text-foreground mt-1">
                {veiculoAtual.marca} {veiculoAtual.modelo}
              </p>
              {veiculoAtual.ano && (
                <p className="text-sm text-muted-foreground">{veiculoAtual.ano}</p>
              )}
            </div>

            {/* QR Code placeholder */}
            <div className="flex justify-center mb-6">
              <div className="w-32 h-32 rounded-xl bg-secondary/50 border border-border flex flex-col items-center justify-center">
                <QrCode className="w-16 h-16 text-muted-foreground" />
                <span className="text-xs text-muted-foreground mt-2">QR Code</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">
                  {manutencoesVeiculo.length}
                </p>
                <p className="text-xs text-muted-foreground">Registros</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary text-glow">
                  {healthScore}
                </p>
                <p className="text-xs text-muted-foreground">Health Score</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-foreground">
                  {manutencoesVeiculo.length > 0 
                    ? Math.max(...manutencoesVeiculo.map(m => m.km_atual)).toLocaleString()
                    : '0'}
                </p>
                <p className="text-xs text-muted-foreground">Último KM</p>
              </div>
            </div>

            {/* Last maintenance */}
            {manutencoesVeiculo.length > 0 && (
              <div className="p-3 rounded-xl bg-secondary/30 border border-border">
                <p className="text-xs text-muted-foreground mb-1">Última manutenção selada</p>
                <p className="text-sm font-medium text-foreground">
                  {format(new Date(manutencoesVeiculo[0].data_selada), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
              </div>
            )}
          </div>

          {/* Footer stamp */}
          <div className="px-6 py-4 border-t border-border/50 bg-secondary/20">
            <p className="text-xs text-center text-muted-foreground">
              Todos os registros são imutáveis e verificados por timestamp do servidor
            </p>
          </div>
        </div>

        {/* Share Button */}
        <Button
          variant="glass"
          size="lg"
          className="w-full mt-6 gap-2"
          onClick={handleShare}
        >
          <Share2 className="w-5 h-5" />
          Compartilhar Certificado
        </Button>
      </div>
    </AppLayout>
  );
}

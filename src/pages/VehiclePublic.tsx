import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FipeValue } from '@/components/FipeValue';
import { ShieldCheck, CheckCircle2, Calendar, Gauge, Car, AlertCircle, Home, MessageCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { calculateHealthScore, Manutencao } from '@/hooks/useManutencoes';
import { Veiculo } from '@/hooks/useVeiculos';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentProfile } from '@/hooks/useCurrentProfile';

export default function VehiclePublic() {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const { isOficina } = useCurrentProfile();
  const navigate = useNavigate();

  const { data: veiculo, isLoading: loadingVeiculo, error: veiculoError } = useQuery({
    queryKey: ['veiculo-publico', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('veiculos')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Veiculo;
    },
    enabled: !!id,
  });

  const { data: manutencoes = [], isLoading: loadingManutencoes } = useQuery({
    queryKey: ['manutencoes-publicas', id],
    queryFn: async () => {
      if (!id) return [];
      const { data, error } = await supabase
        .from('manutencoes')
        .select('*')
        .eq('veiculo_id', id)
        .order('data_selada', { ascending: false });
      if (error) throw error;
      return data as Manutencao[];
    },
    enabled: !!id,
  });

  const healthScore = calculateHealthScore(manutencoes);
  const isLoading = loadingVeiculo || loadingManutencoes || authLoading;

  const isOwner = veiculo && user ? veiculo.user_id === user.id : false;
  const hasAccess = !user || isOwner || isOficina;

  const publicUrl = `${window.location.origin}/v/${id}`;

  const handleWhatsAppShare = () => {
    if (!veiculo) return;
    const message = encodeURIComponent(
      `Confira o histórico e valor do veículo ${veiculo.placa} na Ficha do Carro: ${publicUrl}`
    );
    window.open(`https://wa.me/?text=${message}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (veiculo && user && !hasAccess) {
    navigate('/forbidden', { replace: true });
    return null;
  }

  if (veiculoError || !veiculo) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="relative z-10 text-center max-w-md">
          <div className="flex items-center justify-center gap-2 mb-8">
            <ShieldCheck className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold text-foreground">
              Ficha do Carro
            </span>
          </div>

          <div className="w-20 h-20 rounded-full bg-destructive/10 border-2 border-destructive/30 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-destructive" />
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-2">
            Veículo não encontrado
          </h1>
          <p className="text-muted-foreground mb-8">
            O veículo que você está procurando não existe ou foi removido do sistema.
          </p>

          <Button
            size="lg"
            className="gap-2"
            onClick={() => navigate('/')}
          >
            <Home className="w-5 h-5" />
            Voltar ao Início
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border px-4 py-3">
        <div className="flex items-center justify-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
          <span className="text-lg font-bold text-primary">Ficha do Carro</span>
        </div>
        <p className="text-xs text-center text-muted-foreground mt-1">
          Verificação Pública de Histórico
        </p>
      </header>

      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Vehicle Card - Ficha Técnica style */}
        <div className="rounded-2xl bg-card border border-primary/30 shadow-elevated p-6 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <Car className="w-7 h-7 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-mono font-bold text-primary tracking-wider">
                {veiculo.placa}
              </h1>
              <p className="text-foreground font-medium">
                {veiculo.marca} {veiculo.modelo}
              </p>
              {veiculo.ano && <p className="text-sm text-muted-foreground">{veiculo.ano}</p>}
            </div>
          </div>

          {/* Stats - Documento style with dividers */}
          <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-secondary/30 border border-border mb-4">
            <div className="text-center border-r border-border last:border-r-0">
              <p className="text-2xl font-bold text-foreground">{manutencoes.length}</p>
              <p className="text-xs text-muted-foreground">Registros</p>
            </div>
            <div className="text-center border-r border-border last:border-r-0">
              <p className="text-2xl font-bold text-primary">{healthScore}</p>
              <p className="text-xs text-muted-foreground">Health Score</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-foreground">
                {manutencoes.length > 0 
                  ? Math.max(...manutencoes.map(m => m.km_atual)).toLocaleString()
                  : '0'}
              </p>
              <p className="text-xs text-muted-foreground">Último KM</p>
            </div>
          </div>

          <FipeValue 
            marca={veiculo.marca}
            modelo={veiculo.modelo}
            ano={veiculo.ano}
            healthScore={healthScore}
          />
        </div>

        {/* Verification Badge */}
        <div className="flex items-center justify-center gap-2 mb-6 p-3 rounded-xl bg-primary/10 border border-primary/30">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-primary">
            Histórico verificado e imutável
          </span>
        </div>

        {/* WhatsApp Share Button */}
        <Button
          size="lg"
          className="w-full gap-2 mb-6 bg-[#25D366] hover:bg-[#20bd5a] text-white"
          onClick={handleWhatsAppShare}
        >
          <MessageCircle className="w-5 h-5" />
          Compartilhar via WhatsApp
        </Button>

        {/* Maintenance History */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Histórico de Manutenções
          </h2>

          {manutencoes.length === 0 ? (
            <div className="text-center py-8 rounded-xl bg-card border border-border">
              <p className="text-muted-foreground">Nenhuma manutenção registrada</p>
            </div>
          ) : (
            <div className="space-y-3">
              {manutencoes.map((manutencao) => (
                <div
                  key={manutencao.id}
                  className="relative pl-6 pb-4 border-l-2 border-border last:border-l-0 last:pb-0"
                >
                  <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary border-2 border-background" />
                  
                  <div className="rounded-xl bg-card border border-border p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {manutencao.oficina}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(manutencao.data_selada), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10">
                        <CheckCircle2 className="w-3 h-3 text-primary" />
                        <span className="text-xs font-medium text-primary">Selado</span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-2">
                      {manutencao.descricao}
                    </p>

                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Gauge className="w-3 h-3" />
                      <span>{manutencao.km_atual.toLocaleString()} km</span>
                    </div>

                    {manutencao.foto_url && (
                      <div className="mt-3">
                        <img
                          src={manutencao.foto_url}
                          alt="Comprovante"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="text-center py-6 border-t border-border">
          <p className="text-xs text-muted-foreground">
            Todos os registros são imutáveis e verificados por timestamp do servidor
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Powered by <span className="text-primary font-medium">Ficha do Carro</span>
          </p>
        </footer>
      </main>
    </div>
  );
}

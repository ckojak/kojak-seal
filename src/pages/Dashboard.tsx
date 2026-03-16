import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { MaintenanceTimeline } from '@/components/MaintenanceTimeline';
import { useVeiculos, useCreateVeiculo } from '@/hooks/useVeiculos';
import { useManutencoes, Manutencao } from '@/hooks/useManutencoes';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentProfile } from '@/hooks/useCurrentProfile';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Stamp, History, ChevronRight, LayoutDashboard, Car, ShieldCheck } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AddVehicleForm, VehicleFormData } from '@/components/AddVehicleForm';

export default function Dashboard() {
  const { user } = useAuth();
  const { isOficina, profile } = useCurrentProfile();
  const { data: veiculos = [], isLoading: loadingVeiculos } = useVeiculos({ isOficina });
  const { data: manutencoes = [], isLoading: loadingManutencoes } = useManutencoes();
  const createVeiculo = useCreateVeiculo();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [showAddVeiculo, setShowAddVeiculo] = useState(false);

  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      setShowAddVeiculo(true);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const handleAddVeiculo = async (data: VehicleFormData) => {
    try {
      await createVeiculo.mutateAsync({
        placa: data.placa.toUpperCase(),
        marca: data.marca || null,
        modelo: data.modelo || null,
        ano: data.ano ? parseInt(data.ano) : null,
        cor: data.cor || null,
        oficina_email: data.oficinaEmail || null, 
      });
      setShowAddVeiculo(false);
    } catch (error: any) {
      // Erro tratado pelo hook/toast
    }
  };

  const veiculoAtual = veiculos[0];
  const manutencoesVeiculoAtual = veiculoAtual 
    ? manutencoes.filter((m: Manutencao) => m.veiculo_id === veiculoAtual.id)
    : [];

  return (
    <AppLayout>
      <div className="px-4 pt-6 pb-24 max-w-lg mx-auto">
        {/* Cabeçalho de Autoridade */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Painel {isOficina ? 'Oficina' : 'Cliente'}
            </h1>
          </div>
          {profile?.is_verified_admin && (
            <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/20">
              <ShieldCheck className="w-3 h-3" />
              <span className="text-[10px] font-bold uppercase">Verificado</span>
            </div>
          )}
        </div>

        {loadingVeiculos ? (
          <div className="space-y-4">
            <div className="h-48 w-full bg-secondary animate-pulse rounded-3xl" />
          </div>
        ) : veiculoAtual ? (
          <div className="space-y-8">
            {/* Card do Veículo Principal */}
            <div className="relative overflow-hidden bg-card border border-border p-6 rounded-[2rem] shadow-sm">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center border border-border">
                    <Car className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-foreground leading-tight">
                      {veiculoAtual.marca} {veiculoAtual.modelo}
                    </h2>
                    <p className="text-xs font-mono text-muted-foreground mt-1 uppercase tracking-widest">
                      {veiculoAtual.placa}
                    </p>
                  </div>
                </div>
              </div>

              {/* Ações Rápidas - Decisão de Interface por Perfil */}
              <div className="grid grid-cols-1 gap-3">
                {isOficina && (
                  <Button 
                    onClick={() => navigate('/selar')}
                    className="w-full h-14 justify-center gap-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-95"
                  >
                    <Stamp className="w-5 h-5" />
                    Selar Manutenção
                  </Button>
                )}
                
                <Button 
                  onClick={() => navigate('/historico')}
                  variant="outline"
                  className="w-full h-14 justify-center gap-3 border-border bg-secondary/50 hover:bg-secondary rounded-2xl font-bold transition-all active:scale-95"
                >
                  <History className="w-5 h-5 text-muted-foreground" />
                  Acessar Ficha Completa
                </Button>
              </div>
            </div>

            {/* Timeline de Registros */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="font-bold text-sm text-foreground uppercase tracking-wider">
                  Registros Recentes
                </h3>
                <button 
                  onClick={() => navigate('/historico')}
                  className="text-xs text-primary font-bold flex items-center gap-1 hover:opacity-80 transition-opacity"
                >
                  Histórico total <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              
              {manutencoesVeiculoAtual.length > 0 ? (
                <div className="bg-secondary/20 rounded-3xl p-2 border border-border/50">
                  <MaintenanceTimeline manutencoes={manutencoesVeiculoAtual.slice(0, 3)} />
                </div>
              ) : (
                <div className="text-center py-10 bg-secondary/10 rounded-3xl border border-dashed border-border">
                  <p className="text-xs text-muted-foreground font-medium">
                    Nenhuma manutenção selada ainda.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Estado Vazio */
          <div className="text-center py-16 px-6 bg-secondary/10 rounded-[2.5rem] border-2 border-dashed border-border">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-muted-foreground opacity-30" />
            </div>
            <h2 className="text-lg font-bold text-foreground">Sua garagem está vazia</h2>
            <p className="text-sm text-muted-foreground mt-2 mb-8 max-w-[200px] mx-auto">
              Registre seu primeiro veículo para começar a gerar o histórico imutável.
            </p>
            <Button 
              onClick={() => setShowAddVeiculo(true)}
              className="px-8 rounded-2xl font-bold"
            >
              Adicionar Veículo
            </Button>
          </div>
        )}

        {/* Modal de Cadastro de Veículo */}
        <Dialog open={showAddVeiculo} onOpenChange={setShowAddVeiculo}>
          <DialogContent className="bg-card border-border rounded-[2rem] max-w-[95vw] sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-foreground">Novo Registro</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <AddVehicleForm 
                onSubmit={handleAddVeiculo} 
                isSubmitting={createVeiculo.isPending} 
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

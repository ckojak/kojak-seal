import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { VehicleCard } from '@/components/VehicleCard';
import { MaintenanceTimeline } from '@/components/MaintenanceTimeline';
import { PlateSearchBar } from '@/components/PlateSearchBar';
import { useVeiculos, useCreateVeiculo } from '@/hooks/useVeiculos';
import { useManutencoes, Manutencao } from '@/hooks/useManutencoes';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Shield, Plus, Car, Stamp, History, ChevronRight } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { AddVehicleForm, VehicleFormData } from '@/components/AddVehicleForm';

export default function Dashboard() {
  const { user } = useAuth();
  const { data: veiculos = [], isLoading: loadingVeiculos } = useVeiculos();
  const { data: manutencoes = [], isLoading: loadingManutencoes } = useManutencoes();
  const createVeiculo = useCreateVeiculo();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [selectedVeiculo, setSelectedVeiculo] = useState<string | null>(null);
  const [showAddVeiculo, setShowAddVeiculo] = useState(false);

  // Auto-open modal if ?add=true is in URL (from "Cadastrar este carro" button)
  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      setShowAddVeiculo(true);
      // Clear the param from URL
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  // Filtrar manutenções pelo veículo selecionado
  const filteredManutencoes = selectedVeiculo 
    ? manutencoes.filter((m: Manutencao) => m.veiculo_id === selectedVeiculo)
    : manutencoes;

  const handleAddVeiculo = async (data: VehicleFormData) => {
    try {
      await createVeiculo.mutateAsync({
        placa: data.placa.toUpperCase(),
        marca: data.marca || null,
        modelo: data.modelo || null,
        ano: data.ano ? parseInt(data.ano) : null,
        cor: data.cor || null,
      });
      toast.success('Veículo adicionado com sucesso!');
      setShowAddVeiculo(false);
    } catch (error: any) {
      toast.error(error.message || 'Erro ao adicionar veículo');
    }
  };

  const veiculoAtual = veiculos[0];
  const manutencoesVeiculoAtual = veiculoAtual 
    ? manutencoes.filter((m: Manutencao) => m.veiculo_id === veiculoAtual.id)
    : [];

  return (
    <AppLayout>
      <div className="px-4 pt-6 pb-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Bem-vindo ao</p>
            <h1 className="text-2xl font-bold text-foreground">
              Kojak <span className="text-primary text-glow">Auto-Log</span>
            </h1>
          </div>
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary" />
          </div>
        </div>

        {/* Global Plate Search */}
        <div className="mb-6">
          <PlateSearchBar />
        </div>

        {/* Main Vehicle Card */}
        {loadingVeiculos ? (
          <div className="h-40 rounded-2xl bg-card animate-pulse" />
        ) : veiculoAtual ? (
          <VehicleCard
            veiculo={veiculoAtual}
            manutencoes={manutencoesVeiculoAtual}
            isSelected
          />
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-border p-8 text-center">
            <Car className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Nenhum veículo cadastrado
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Adicione seu primeiro veículo para começar
            </p>
            <Dialog open={showAddVeiculo} onOpenChange={setShowAddVeiculo}>
              <DialogTrigger asChild>
                <Button variant="neon">
                  <Plus className="w-4 h-4" />
                  Adicionar veículo
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card border-border">
                <DialogHeader>
                  <DialogTitle className="text-foreground">Adicionar veículo</DialogTitle>
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
        )}

        {/* Quick Actions */}
        {veiculoAtual && (
          <div className="grid grid-cols-2 gap-3 mt-6">
            <Button
              variant="seal"
              size="xl"
              className="flex-col h-auto py-6 gap-2"
              onClick={() => navigate('/selar')}
            >
              <Stamp className="w-8 h-8" />
              <span>Selar Manutenção</span>
            </Button>
            <Button
              variant="glass"
              size="xl"
              className="flex-col h-auto py-6 gap-2"
              onClick={() => navigate('/historico')}
            >
              <History className="w-8 h-8 text-primary" />
              <span>Ver Histórico</span>
            </Button>
          </div>
        )}

        {/* Recent Maintenance */}
        {veiculoAtual && manutencoesVeiculoAtual.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                Manutenções Recentes
              </h2>
              <button 
                onClick={() => navigate('/historico')}
                className="text-sm text-primary flex items-center gap-1 hover:underline"
              >
                Ver todas <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <MaintenanceTimeline manutencoes={manutencoesVeiculoAtual.slice(0, 3)} />
          </div>
        )}

        {/* Add Vehicle Button (if has vehicles) */}
        {veiculos.length > 0 && (
          <Dialog open={showAddVeiculo} onOpenChange={setShowAddVeiculo}>
            <DialogTrigger asChild>
              <Button variant="ghost" className="w-full mt-6 text-muted-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar outro veículo
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border">
              <DialogHeader>
                <DialogTitle className="text-foreground">Adicionar veículo</DialogTitle>
              </DialogHeader>
              <div className="mt-4">
                <AddVehicleForm 
                  onSubmit={handleAddVeiculo} 
                  isSubmitting={createVeiculo.isPending} 
                />
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AppLayout>
  );
}

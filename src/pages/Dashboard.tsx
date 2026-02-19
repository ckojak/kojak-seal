import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { VehicleCard } from '@/components/VehicleCard';
import { MaintenanceTimeline } from '@/components/MaintenanceTimeline';
import { PlateSearchBar } from '@/components/PlateSearchBar';
import { useVeiculos, useCreateVeiculo } from '@/hooks/useVeiculos';
import { useManutencoes, Manutencao } from '@/hooks/useManutencoes';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentProfile } from '@/hooks/useCurrentProfile';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ShieldCheck, Plus, Car, Stamp, History, ChevronRight, Camera } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { AddVehicleForm, VehicleFormData } from '@/components/AddVehicleForm';
import { SubscriptionExpiryBanner } from '@/components/SubscriptionExpiryBanner';
import { TrialBadge } from '@/components/TrialBadge';
import { PartScannerModal } from '@/components/PartScannerModal';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Dashboard() {
  const { user } = useAuth();
  const { isOficina, canSearchPlates } = useCurrentProfile();
  const { data: veiculos = [], isLoading: loadingVeiculos } = useVeiculos({ isOficina });
  const { data: manutencoes = [], isLoading: loadingManutencoes } = useManutencoes();
  const createVeiculo = useCreateVeiculo();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [selectedVeiculo, setSelectedVeiculo] = useState<string | null>(null);
  const [showAddVeiculo, setShowAddVeiculo] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  useEffect(() => {
    if (searchParams.get('add') === 'true') {
      setShowAddVeiculo(true);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

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
        <SubscriptionExpiryBanner />

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Bem-vindo ao</p>
            <h1 className="text-2xl font-bold text-foreground">
              Ficha do Carro
            </h1>
            <TrialBadge />
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
          </div>
        </div>

        {/* Global Plate Search - Only for oficina users with CNPJ */}
        {canSearchPlates && (
          <div className="mb-6">
            <PlateSearchBar />
          </div>
        )}

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
                <Button>
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
          <>
            <div className="grid grid-cols-2 gap-3 mt-6">
              <Button
                size="xl"
                className="flex-col h-auto py-6 gap-2"
                onClick={() => navigate('/selar')}
              >
                <Stamp className="w-8 h-8" />
                <span>Selar Manutenção</span>
              </Button>
              <Button
                variant="outline"
                size="xl"
                className="flex-col h-auto py-6 gap-2"
                onClick={() => navigate('/historico')}
              >
                <History className="w-8 h-8 text-primary" />
                <span>Ver Histórico</span>
              </Button>
            </div>

            {/* Part Scanner Button */}
            <Button
              variant="outline"
              size="lg"
              className="w-full mt-3 gap-3"
              onClick={() => setShowScanner(true)}
            >
              <Camera className="w-5 h-5 text-primary" />
              📸 Escanear Peça
            </Button>
            <PartScannerModal open={showScanner} onClose={() => setShowScanner(false)} />
          </>
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

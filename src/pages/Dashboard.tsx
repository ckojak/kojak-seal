import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { MaintenanceTimeline } from '@/components/MaintenanceTimeline';
import { useVeiculos, useCreateVeiculo } from '@/hooks/useVeiculos';
import { useManutencoes, Manutencao } from '@/hooks/useManutencoes';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentProfile } from '@/hooks/useCurrentProfile';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Stamp, History, ChevronRight } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AddVehicleForm, VehicleFormData } from '@/components/AddVehicleForm';

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
        // Envia o email da oficina para o banco via API
        oficina_email: data.oficinaEmail || null, 
      });
      setShowAddVeiculo(false);
    } catch (error: any) {}
  };

  const veiculoAtual = veiculos[0];
  const manutencoesVeiculoAtual = veiculoAtual 
    ? manutencoes.filter((m: Manutencao) => m.veiculo_id === veiculoAtual.id)
    : [];

  return (
    <AppLayout>
      <div className="px-4 pt-6 pb-4">
        {/* Header simplificado */}
        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-xl font-bold text-foreground">Visão Geral</h1>
        </div>

        {/* Quick Actions - A MÁGICA DE SEGURANÇA ACONTECE AQUI */}
        {veiculoAtual && (
          <div className="grid gap-3 mb-8">
            {/* O BOTÃO SELAR SÓ APARECE SE FOR OFICINA */}
            {isOficina && (
              <Button 
                onClick={() => navigate('/selar')}
                className="w-full justify-start gap-3 bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Stamp className="w-5 h-5" />
                Selar Manutenção (Apenas Oficina)
              </Button>
            )}
            
            <Button 
              onClick={() => navigate('/historico')}
              variant="outline"
              className="w-full justify-start gap-3"
            >
              <History className="w-5 h-5" />
              Ver Histórico do Veículo
            </Button>
          </div>
        )}

        {/* Add Vehicle Button */}
        <Dialog open={showAddVeiculo} onOpenChange={setShowAddVeiculo}>
          <DialogTrigger asChild>
            <Button variant="ghost" className="w-full mt-6 text-muted-foreground border border-dashed border-border">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar outro veículo
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">Adicionar veículo</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <AddVehicleForm onSubmit={handleAddVeiculo} isSubmitting={createVeiculo.isPending} />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}

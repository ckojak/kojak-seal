import { AppLayout } from '@/components/AppLayout';
import { MaintenanceTimeline } from '@/components/MaintenanceTimeline';
import { useVeiculos } from '@/hooks/useVeiculos';
import { useManutencoes } from '@/hooks/useManutencoes';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { History, Filter } from 'lucide-react';
import { useState } from 'react';

export default function Historico() {
  const { data: veiculos = [] } = useVeiculos();
  const { data: manutencoes = [], isLoading } = useManutencoes();
  const [filtroVeiculo, setFiltroVeiculo] = useState<string>('todos');

  const filteredManutencoes = filtroVeiculo === 'todos' 
    ? manutencoes 
    : manutencoes.filter(m => m.veiculo_id === filtroVeiculo);

  return (
    <AppLayout>
      <div className="px-4 pt-6 pb-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <History className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Histórico de Manutenções
            </h1>
            <p className="text-sm text-muted-foreground">
              Registros verificados e imutáveis
            </p>
          </div>
        </div>

        {/* Filter */}
        {veiculos.length > 1 && (
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filtrar por veículo</span>
            </div>
            <Select value={filtroVeiculo} onValueChange={setFiltroVeiculo}>
              <SelectTrigger className="h-10 bg-secondary border-border rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="todos">Todos os veículos</SelectItem>
                {veiculos.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    {v.placa} - {v.modelo || v.marca || 'Veículo'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Timeline */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-xl bg-card animate-pulse" />
            ))}
          </div>
        ) : (
          <MaintenanceTimeline manutencoes={filteredManutencoes} />
        )}

        {/* Stats */}
        {filteredManutencoes.length > 0 && (
          <div className="mt-8 p-4 rounded-xl bg-card border border-border">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">
              Resumo
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {filteredManutencoes.length}
                </p>
                <p className="text-xs text-muted-foreground">
                  Manutenções registradas
                </p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary text-glow">
                  {filteredManutencoes.filter(m => m.verificado).length}
                </p>
                <p className="text-xs text-muted-foreground">
                  Verificadas
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

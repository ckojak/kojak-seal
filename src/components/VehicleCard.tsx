import { Veiculo } from '@/hooks/useVeiculos';
import { Manutencao, calculateHealthScore } from '@/hooks/useManutencoes';
import { FipeValue } from '@/components/FipeValue';
import { Car, Calendar, Gauge } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VehicleCardProps {
  veiculo: Veiculo;
  manutencoes: Manutencao[];
  onClick?: () => void;
  isSelected?: boolean;
  showFipe?: boolean;
}

export function VehicleCard({ veiculo, manutencoes, onClick, isSelected, showFipe = true }: VehicleCardProps) {
  const healthScore = calculateHealthScore(manutencoes);
  
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-primary';
    if (score >= 60) return 'text-yellow-400';
    if (score >= 40) return 'text-orange-400';
    return 'text-destructive';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excelente';
    if (score >= 60) return 'Bom';
    if (score >= 40) return 'Atenção';
    return 'Crítico';
  };

  return (
    <div 
      onClick={onClick}
      className={cn(
        "relative overflow-hidden rounded-2xl p-5 transition-all duration-300 cursor-pointer",
        "bg-card border border-border",
        "hover:border-primary/30 hover:shadow-neon",
        isSelected && "border-primary/50 shadow-neon"
      )}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
      
      <div className="relative flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Car className="w-5 h-5 text-primary" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {veiculo.marca || 'Veículo'}
            </span>
          </div>
          
          <h3 className="text-xl font-bold text-foreground mb-1">
            {veiculo.modelo || 'Sem modelo'}
          </h3>
          
          <p className="text-2xl font-mono font-bold text-primary tracking-wider">
            {veiculo.placa}
          </p>
          
          <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
            {veiculo.ano && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{veiculo.ano}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Gauge className="w-4 h-4" />
              <span>{manutencoes.length} manutenções</span>
            </div>
          </div>
        </div>
        
        {/* Health Score Circle */}
        <div className="flex flex-col items-center">
          <div className={cn(
            "relative w-16 h-16 rounded-full border-4 flex items-center justify-center",
            "transition-all duration-300",
            healthScore >= 80 && "border-primary shadow-neon",
            healthScore >= 60 && healthScore < 80 && "border-yellow-400",
            healthScore >= 40 && healthScore < 60 && "border-orange-400",
            healthScore < 40 && "border-destructive"
          )}>
            <span className={cn(
              "text-xl font-bold",
              getScoreColor(healthScore)
            )}>
              {healthScore}
            </span>
          </div>
          <span className={cn(
            "text-xs font-medium mt-1",
            getScoreColor(healthScore)
          )}>
            {getScoreLabel(healthScore)}
          </span>
        </div>
      </div>

      {/* FIPE Value Section */}
      {showFipe && (
        <div className="relative mt-4">
          <FipeValue 
            marca={veiculo.marca}
            modelo={veiculo.modelo}
            ano={veiculo.ano}
            healthScore={healthScore}
          />
        </div>
      )}
    </div>
  );
}

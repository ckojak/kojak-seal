import { Manutencao } from '@/hooks/useManutencoes';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle2, Gauge, Wrench, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MaintenanceTimelineProps {
  manutencoes: Manutencao[];
}

export function MaintenanceTimeline({ manutencoes }: MaintenanceTimelineProps) {
  if (manutencoes.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 rounded-full bg-secondary/50 flex items-center justify-center mx-auto mb-4">
          <Wrench className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Nenhuma manutenção registrada
        </h3>
        <p className="text-sm text-muted-foreground">
          Sele sua primeira manutenção para começar o histórico
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
      
      <div className="space-y-4">
        {manutencoes.map((manutencao, index) => (
          <div 
            key={manutencao.id} 
            className={cn(
              "relative pl-14 animate-slide-up",
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Timeline node */}
            <div className="absolute left-4 top-4 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-neon">
              <CheckCircle2 className="w-3 h-3 text-primary-foreground" />
            </div>
            
            {/* Card */}
            <div className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-primary uppercase tracking-wider">
                      Selado
                    </span>
                    {manutencao.verificado && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        Verificado
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(manutencao.data_selada), "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR })}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Gauge className="w-4 h-4" />
                  <span className="font-mono">{manutencao.km_atual.toLocaleString()} km</span>
                </div>
              </div>
              
              {/* Content */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Wrench className="w-4 h-4 text-muted-foreground" />
                  <span className="font-medium text-foreground">{manutencao.oficina}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {manutencao.descricao}
                </p>
              </div>
              
              {/* Photo */}
              {manutencao.foto_url && (
                <div className="mt-3 relative rounded-lg overflow-hidden bg-secondary/30">
                  <img 
                    src={manutencao.foto_url} 
                    alt="Comprovante da manutenção"
                    className="w-full h-32 object-cover"
                  />
                  <div className="absolute bottom-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md glass-dark text-xs text-foreground">
                    <Camera className="w-3 h-3" />
                    Comprovante
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { Manutencao } from '@/hooks/useManutencoes';
import { useProfiles, Profile } from '@/hooks/useProfiles';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle2, Gauge, Wrench, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VerifiedBadge } from './VerifiedBadge';

interface MaintenanceTimelineProps {
  manutencoes: Manutencao[];
  profiles?: Profile[];
}

export function MaintenanceTimeline({ manutencoes, profiles = [] }: MaintenanceTimelineProps) {
  const userIds = [...new Set(manutencoes.map(m => m.user_id).filter(Boolean))];
  const { data: fetchedProfiles } = useProfiles(profiles.length === 0 ? userIds : []);
  
  const allProfiles = profiles.length > 0 ? profiles : (fetchedProfiles || []);
  
  const getProfile = (userId: string) => allProfiles.find(p => p.user_id === userId);
  
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
      <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />
      
      <div className="space-y-4">
        {manutencoes.map((manutencao, index) => (
          <div 
            key={manutencao.id} 
            className={cn("relative pl-14 animate-slide-up")}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="absolute left-4 top-4 w-5 h-5 rounded-full bg-primary flex items-center justify-center shadow-neon">
              <CheckCircle2 className="w-3 h-3 text-primary-foreground" />
            </div>
            
            <div className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-primary uppercase tracking-wider">Selado</span>
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
              
              <div className="space-y-2">
                {(() => {
                  const profile = manutencao.user_id ? getProfile(manutencao.user_id) : null;
                  const isVerified = profile?.is_verified ?? false;
                  
                  return (
                    <div className="flex items-center gap-2 text-sm">
                      <Wrench className={cn("w-4 h-4", isVerified ? "text-primary" : "text-muted-foreground")} />
                      <span className={cn("font-medium", isVerified ? "text-primary" : "text-foreground")}>
                        {manutencao.oficina}
                      </span>
                      {isVerified && <VerifiedBadge size="sm" />}
                    </div>
                  );
                })()}
                <p className="text-sm text-muted-foreground leading-relaxed">{manutencao.descricao}</p>
              </div>
              
              {manutencao.foto_url && (
                <div className="mt-3 relative rounded-lg overflow-hidden bg-secondary/30">
                  <img src={manutencao.foto_url} alt="Comprovante da manutenção" className="w-full h-32 object-cover" />
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

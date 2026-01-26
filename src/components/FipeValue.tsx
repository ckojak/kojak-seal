import { useFipe } from '@/hooks/useFipe';
import { TrendingUp, DollarSign, Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface FipeValueProps {
  marca: string | null;
  modelo: string | null;
  ano: number | null;
  healthScore?: number;
  variant?: 'compact' | 'full';
}

export function FipeValue({ marca, modelo, ano, healthScore = 0, variant = 'full' }: FipeValueProps) {
  const { valor, isLoading, error } = useFipe(marca, modelo, ano);

  if (!marca || !modelo || !ano) {
    return null;
  }

  if (isLoading) {
    return (
      <div className={cn(
        "p-3 rounded-xl bg-secondary/50 border border-border",
        variant === 'compact' && "p-2"
      )}>
        <div className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 text-primary animate-spin" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    );
  }

  if (!valor) {
    return null;
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 text-sm">
        <DollarSign className="w-4 h-4 text-primary" />
        <span className="text-muted-foreground">FIPE:</span>
        <span className="font-semibold text-foreground">{valor}</span>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="w-5 h-5 text-primary" />
          <span className="text-sm font-medium text-muted-foreground">
            Referência de Mercado
          </span>
        </div>
        {healthScore >= 80 && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium">
            <TrendingUp className="w-3 h-3" />
            Alto Potencial
          </span>
        )}
      </div>
      
      <p className="text-2xl font-bold text-foreground mb-2">
        {valor}
      </p>
      
      <p className="text-xs text-muted-foreground leading-relaxed">
        {healthScore >= 80 ? (
          <>
            <span className="text-primary font-medium">✓ Veículos com Health Score alto</span> tendem a valer acima da tabela FIPE por terem histórico de manutenção comprovado.
          </>
        ) : healthScore >= 60 ? (
          'Valor de referência FIPE. Mantenha o histórico em dia para valorizar seu veículo.'
        ) : (
          'Valor de referência FIPE. Registre mais manutenções para aumentar o valor percebido.'
        )}
      </p>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Shield, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SealAnimationProps {
  show: boolean;
  onComplete?: () => void;
}

export function SealAnimation({ show, onComplete }: SealAnimationProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => {
        onComplete?.();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-fade-in">
      <div className="flex flex-col items-center">
        {/* Seal stamp */}
        <div className={cn(
          "relative w-40 h-40 animate-stamp"
        )}>
          {/* Outer ring */}
          <div className="absolute inset-0 rounded-full border-4 border-primary shadow-neon-intense animate-pulse-glow" />
          
          {/* Inner content */}
          <div className="absolute inset-2 rounded-full bg-card border-2 border-primary/30 flex flex-col items-center justify-center">
            <Shield className="w-12 h-12 text-primary mb-1" />
            <span className="text-xs font-bold text-primary uppercase tracking-widest">
              Selado
            </span>
          </div>
          
          {/* Check mark */}
          <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-neon">
            <Check className="w-6 h-6 text-primary-foreground" />
          </div>
        </div>
        
        {/* Text */}
        <h2 className="mt-6 text-xl font-bold text-foreground text-glow">
          Manutenção Selada!
        </h2>
        <p className="mt-2 text-sm text-muted-foreground text-center max-w-xs">
          Registro imutável criado com timestamp do servidor
        </p>
      </div>
    </div>
  );
}

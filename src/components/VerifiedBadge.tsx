import { ShieldCheck } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface VerifiedBadgeProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

export function VerifiedBadge({ 
  className, 
  size = 'md',
  showTooltip = true 
}: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const badge = (
    <div className={cn(
      "inline-flex items-center justify-center",
      className
    )}>
      <ShieldCheck 
        className={cn(
          sizeClasses[size],
          "text-primary drop-shadow-[0_0_6px_hsl(var(--primary))]"
        )} 
      />
    </div>
  );

  if (!showTooltip) return badge;

  return (
    <TooltipProvider>
      <Tooltip delayDuration={200}>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent 
          side="top" 
          className="bg-card border-primary/30 text-foreground"
        >
          <div className="flex items-center gap-2 text-xs">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" />
            <span>Oficina Certificada pelo Kojak Auto-Log</span>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

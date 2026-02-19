import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Shield, Home, Search, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 text-center max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Shield className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold text-foreground">
            Ficha do Carro
          </span>
        </div>

        {/* Error icon */}
        <div className="w-24 h-24 rounded-full bg-destructive/10 border-2 border-destructive/30 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-12 h-12 text-destructive" />
        </div>

        {/* Error code */}
        <h1 className="text-6xl font-mono font-bold text-foreground mb-4">
          4<span className="text-primary text-glow">0</span>4
        </h1>

        {/* Message */}
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Rota não encontrada
        </h2>
        <p className="text-muted-foreground mb-8">
          A página que você está procurando não existe ou foi movida.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="neon"
            size="lg"
            className="gap-2"
            onClick={() => navigate('/')}
          >
            <Home className="w-5 h-5" />
            Voltar ao Início
          </Button>
          <Button
            variant="glass"
            size="lg"
            className="gap-2"
            onClick={() => navigate('/dashboard')}
          >
            <Search className="w-5 h-5" />
            Ir ao Dashboard
          </Button>
        </div>

        {/* Current path debug */}
        <p className="mt-8 text-xs text-muted-foreground font-mono">
          Rota: {location.pathname}
        </p>
      </div>
    </div>
  );
};

export default NotFound;

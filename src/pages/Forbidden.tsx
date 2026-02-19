import { Shield, ShieldOff, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

export default function Forbidden() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-destructive/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-destructive/3 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 text-center max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Shield className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold text-foreground">
            Ficha do Carro
          </span>
        </div>

        <div className="w-20 h-20 rounded-full bg-destructive/10 border-2 border-destructive/30 flex items-center justify-center mx-auto mb-6">
          <ShieldOff className="w-10 h-10 text-destructive" />
        </div>

        <h1 className="text-3xl font-bold text-foreground mb-2">
          403
        </h1>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Acesso Não Autorizado
        </h2>
        <p className="text-muted-foreground mb-8">
          Você não tem permissão para visualizar este veículo. Apenas o proprietário ou oficinas autorizadas podem acessar este histórico.
        </p>

        <Button
          variant="neon"
          size="lg"
          className="gap-2"
          onClick={() => navigate('/dashboard')}
        >
          <Home className="w-5 h-5" />
          Voltar ao Dashboard
        </Button>
      </div>
    </div>
  );
}

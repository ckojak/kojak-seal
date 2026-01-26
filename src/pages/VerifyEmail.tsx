import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Shield, Mail, Clock, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const EXPIRY_MINUTES = 15;
const EXPIRY_SECONDS = EXPIRY_MINUTES * 60;

export default function VerifyEmail() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || '';
  
  const [timeLeft, setTimeLeft] = useState(EXPIRY_SECONDS);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleResendEmail = async () => {
    if (!email || resendCooldown > 0) return;
    
    setIsResending(true);
    
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;
      
      toast.success('E-mail reenviado com sucesso!');
      setResendCooldown(60); // 60 seconds cooldown
      setTimeLeft(EXPIRY_SECONDS); // Reset timer
    } catch (error: any) {
      toast.error(error.message || 'Erro ao reenviar e-mail');
    } finally {
      setIsResending(false);
    }
  };

  const isExpired = timeLeft <= 0;
  const isUrgent = timeLeft <= 300 && timeLeft > 0; // Last 5 minutes

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <Shield className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold text-foreground">
            Kojak <span className="text-primary text-glow">Auto-Log</span>
          </span>
        </div>

        {/* Main Card */}
        <div className="bg-card border border-border rounded-2xl p-8 shadow-elevated">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${
              isExpired 
                ? 'bg-destructive/10 border-2 border-destructive/30'
                : isUrgent
                  ? 'bg-yellow-500/10 border-2 border-yellow-500/30'
                  : 'bg-primary/10 border-2 border-primary/30 shadow-neon'
            }`}>
              {isExpired ? (
                <AlertTriangle className="w-10 h-10 text-destructive" />
              ) : (
                <Mail className="w-10 h-10 text-primary" />
              )}
            </div>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-foreground text-center mb-2">
            {isExpired ? 'Link expirado' : 'Verifique seu e-mail'}
          </h1>

          {/* Email display */}
          {email && (
            <p className="text-sm text-muted-foreground text-center mb-4">
              Enviamos para: <span className="text-foreground font-medium">{email}</span>
            </p>
          )}

          {/* Timer */}
          <div className={`flex items-center justify-center gap-3 p-4 rounded-xl mb-6 ${
            isExpired 
              ? 'bg-destructive/10 border border-destructive/30'
              : isUrgent
                ? 'bg-yellow-500/10 border border-yellow-500/30'
                : 'bg-secondary/50 border border-border'
          }`}>
            <Clock className={`w-5 h-5 ${
              isExpired 
                ? 'text-destructive' 
                : isUrgent 
                  ? 'text-yellow-500' 
                  : 'text-primary'
            }`} />
            <div className="text-center">
              {isExpired ? (
                <p className="text-destructive font-medium">
                  O link de confirmação expirou
                </p>
              ) : (
                <>
                  <p className={`text-2xl font-mono font-bold ${
                    isUrgent ? 'text-yellow-500' : 'text-primary text-glow'
                  }`}>
                    {formatTime(timeLeft)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    para confirmar seu cadastro
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Security message */}
          <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 mb-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Medida de segurança
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isExpired
                    ? 'Por segurança, cadastros não confirmados são automaticamente removidos. Clique abaixo para reenviar o e-mail.'
                    : `Você tem ${EXPIRY_MINUTES} minutos para confirmar antes que o cadastro expire por segurança. Isso impede cadastros fantasmas e protege seus dados.`
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              variant="neon"
              size="lg"
              className="w-full gap-2"
              onClick={handleResendEmail}
              disabled={isResending || resendCooldown > 0}
            >
              {isResending ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <RefreshCw className="w-5 h-5" />
              )}
              {resendCooldown > 0 
                ? `Aguarde ${resendCooldown}s` 
                : 'Reenviar e-mail'
              }
            </Button>

            <Button
              variant="ghost"
              size="lg"
              className="w-full"
              onClick={() => navigate('/auth')}
            >
              Voltar ao login
            </Button>
          </div>
        </div>

        {/* Footer tip */}
        <p className="mt-6 text-xs text-muted-foreground text-center">
          Não recebeu? Verifique sua pasta de spam ou lixo eletrônico.
        </p>
      </div>
    </div>
  );
}

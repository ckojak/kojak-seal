import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShieldCheck, Mail, Lock, Eye, EyeOff, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast.success('Acesso autorizado!');
        navigate('/dashboard');
      } else {
        const { error } = await signUp(email, password);
        if (error) throw error;
        navigate('/verify-email', { state: { email } });
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro na autenticação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      {/* Logo Kojak Seal */}
      <div className="flex flex-col items-center mb-10 animate-fade-in">
        <div className="relative w-20 h-20 mb-4">
          <div className="absolute inset-0 rounded-2xl bg-primary/10 animate-pulse" />
          <div className="absolute inset-2 rounded-xl bg-card border-2 border-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <ShieldCheck className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h1 className="text-3xl font-black text-foreground tracking-tight">
          Kojak Seal
        </h1>
        <p className="text-sm text-muted-foreground mt-1 text-center">
          Parada de Carro Digital
        </p>
      </div>

      {/* Form */}
      <div className="w-full max-w-sm animate-slide-up">
        <div className="bg-card border border-border rounded-2xl p-6 shadow-elevated">
          <h2 className="text-xl font-bold text-foreground mb-6 text-center">
            {isLogin ? 'Entrar' : 'Criar conta'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-muted-foreground">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  className="pl-10 h-12 bg-secondary border-border rounded-xl focus:border-primary"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-muted-foreground">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="pl-10 pr-10 h-12 bg-secondary border-border rounded-xl focus:border-primary"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full mt-6 gap-2 font-bold"
              disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Zap className="w-5 h-5" />
                  {isLogin ? 'Entrar' : 'Criar conta'}
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              {isLogin ? 'Não tem conta? ' : 'Já tem conta? '}
              <span className="text-primary font-medium">
                {isLogin ? 'Criar agora' : 'Fazer login'}
              </span>
            </button>
          </div>
        </div>
      </div>

      <p className="mt-8 text-xs text-muted-foreground text-center">
        Registros selados com timestamp imutável do servidor
      </p>
    </div>
  );
}

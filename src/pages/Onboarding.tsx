import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Car, Wrench, Shield, Building2, Phone, MapPin, FileText, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { addDays } from 'date-fns';

type UserType = 'car_owner' | 'workshop' | null;

function formatCNPJ(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userType, setUserType] = useState<UserType>(null);
  const [loading, setLoading] = useState(false);

  // Workshop form fields
  const [cnpj, setCnpj] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [endereco, setEndereco] = useState('');
  const [telefone, setTelefone] = useState('');

  const handleCarOwnerSelect = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          user_type: 'car_owner',
          onboarding_completed: true,
        } as any)
        .eq('user_id', user!.id);

      if (error) throw error;
      toast.success('Bem-vindo ao Ficha do Carro!');
      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      toast.error(error.message || 'Erro ao salvar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleWorkshopSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const cnpjDigits = cnpj.replace(/\D/g, '');
    if (cnpjDigits.length !== 14) {
      toast.error('CNPJ deve ter 14 dígitos');
      return;
    }
    if (!razaoSocial.trim()) {
      toast.error('Razão Social é obrigatória');
      return;
    }
    if (!endereco.trim()) {
      toast.error('Endereço é obrigatório');
      return;
    }
    const phoneDigits = telefone.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      toast.error('Telefone deve ter pelo menos 10 dígitos');
      return;
    }

    setLoading(true);
    try {
      const trialExpires = addDays(new Date(), 15);

      const { error } = await supabase
        .from('profiles')
        .update({
          user_type: 'workshop',
          cnpj: cnpjDigits,
          razao_social: razaoSocial.trim(),
          endereco: endereco.trim(),
          telefone: phoneDigits,
          display_name: razaoSocial.trim(),
          onboarding_completed: true,
          subscription_status: 'active',
          subscription_expires_at: trialExpires.toISOString(),
        } as any)
        .eq('user_id', user!.id);

      if (error) throw error;
      toast.success('Oficina cadastrada! Você ganhou 15 dias de teste grátis! 🎉');
      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      toast.error(error.message || 'Erro ao cadastrar oficina');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      {/* Logo */}
      <div className="flex flex-col items-center mb-8 animate-fade-in">
        <div className="relative w-16 h-16 mb-3">
          <div className="absolute inset-0 rounded-2xl bg-primary/10" />
          <div className="absolute inset-2 rounded-xl bg-card border-2 border-primary flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-foreground">
          Ficha do Carro
        </h1>
      </div>

      <div className="w-full max-w-md animate-slide-up">
        {/* Step 1: Choose type */}
        {!userType && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground text-center mb-6">
              Como você vai usar o Ficha do Carro?
            </h2>
            
            <button
              onClick={handleCarOwnerSelect}
              disabled={loading}
              className="w-full group"
            >
              <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300 cursor-pointer group-hover:glow-neon">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Car className="w-7 h-7 text-primary" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-semibold text-foreground text-lg">Dono de Carro</h3>
                    <p className="text-sm text-muted-foreground">
                      Acompanhe o histórico de manutenções do seu veículo
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>
            </button>

            <button
              onClick={() => setUserType('workshop')}
              disabled={loading}
              className="w-full group"
            >
              <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300 cursor-pointer group-hover:glow-neon">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Wrench className="w-7 h-7 text-primary" />
                  </div>
                  <div className="text-left flex-1">
                    <h3 className="font-semibold text-foreground text-lg">Oficina / Mecânico</h3>
                    <p className="text-sm text-muted-foreground">
                      Registre serviços com selo de confiança verificado
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>
            </button>

            {loading && (
              <div className="flex justify-center pt-2">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            )}
          </div>
        )}

        {/* Step 2: Workshop form */}
        {userType === 'workshop' && (
          <div className="bg-card border border-border rounded-2xl p-6 shadow-elevated">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Dados da Oficina</h2>
                <p className="text-xs text-muted-foreground">Preencha para receber o selo de confiança</p>
              </div>
            </div>

            <form onSubmit={handleWorkshopSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cnpj" className="text-sm text-muted-foreground">
                  CNPJ *
                </Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="cnpj"
                    value={cnpj}
                    onChange={(e) => setCnpj(formatCNPJ(e.target.value))}
                    placeholder="XX.XXX.XXX/0001-XX"
                    className="pl-10 h-12 bg-secondary border-border rounded-xl"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="razaoSocial" className="text-sm text-muted-foreground">
                  Razão Social / Nome da Oficina *
                </Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="razaoSocial"
                    value={razaoSocial}
                    onChange={(e) => setRazaoSocial(e.target.value)}
                    placeholder="Auto Center Exemplo LTDA"
                    className="pl-10 h-12 bg-secondary border-border rounded-xl"
                    required
                    maxLength={200}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco" className="text-sm text-muted-foreground">
                  Endereço *
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="endereco"
                    value={endereco}
                    onChange={(e) => setEndereco(e.target.value)}
                    placeholder="Rua, Número - Bairro, Cidade/UF"
                    className="pl-10 h-12 bg-secondary border-border rounded-xl"
                    required
                    maxLength={300}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone" className="text-sm text-muted-foreground">
                  Telefone / WhatsApp *
                </Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="telefone"
                    value={telefone}
                    onChange={(e) => setTelefone(formatPhone(e.target.value))}
                    placeholder="(21) 99999-9999"
                    className="pl-10 h-12 bg-secondary border-border rounded-xl"
                    required
                  />
                </div>
              </div>

              {/* Trial info */}
              <div className="bg-primary/10 border border-primary/20 rounded-xl p-4 mt-2">
                <p className="text-sm text-primary font-medium">🎁 Ganhe 15 dias grátis!</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Ao completar o cadastro, você recebe automaticamente um período de teste de 15 dias com acesso total ao sistema.
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setUserType(null)}
                  className="flex-1"
                  disabled={loading}
                >
                  Voltar
                </Button>
                <Button
                  type="submit"
                  variant="seal"
                  className="flex-1"
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Wrench className="w-4 h-4" />
                      Cadastrar Oficina
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

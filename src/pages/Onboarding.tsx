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

type UserType = 'cliente' | 'oficina' | null;

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

  const [cnpj, setCnpj] = useState('');
  const [razaoSocial, setRazaoSocial] = useState('');
  const [endereco, setEndereco] = useState('');
  const [telefone, setTelefone] = useState('');

  const handleClienteSelect = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          user_type: 'cliente',
          onboarding_completed: true,
        })
        .eq('user_id', user!.id);

      if (error) throw error;
      toast.success('Bem-vindo ao Ficha do Carro!');
      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      toast.error('Erro ao salvar perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleWorkshopSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const trialExpires = addDays(new Date(), 30); // 30 dias de teste grátis

      const { error } = await supabase
        .from('profiles')
        .update({
          user_type: 'oficina',
          cnpj: cnpj.replace(/\D/g, ''),
          razao_social: razaoSocial.trim(),
          endereco: endereco.trim(),
          telefone: telefone.replace(/\D/g, ''),
          display_name: razaoSocial.trim(),
          onboarding_completed: true,
          subscription_status: 'active',
          subscription_expires_at: trialExpires.toISOString(),
          is_verified: false,
        })
        .eq('user_id', user!.id);

      if (error) throw error;
      toast.success('Oficina cadastrada! Aguarde a verificação do CEO. 🎉');
      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      toast.error('Erro ao cadastrar oficina');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="flex flex-col items-center mb-8 animate-fade-in text-center">
        <div className="relative w-16 h-16 mb-3">
          <div className="absolute inset-0 rounded-2xl bg-primary/10" />
          <div className="absolute inset-2 rounded-xl bg-card border-2 border-primary flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-foreground">Ficha do Carro</h1>
        <p className="text-xs text-muted-foreground uppercase tracking-widest mt-1">Configuração de Conta</p>
      </div>

      <div className="w-full max-w-md animate-slide-up">
        {!userType && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground text-center mb-6">Como você vai usar o App?</h2>
            
            <button onClick={handleClienteSelect} disabled={loading} className="w-full group text-left">
              <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Car className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground">Dono de Carro</h3>
                    <p className="text-xs text-muted-foreground">Gerencie sua garagem</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>
            </button>

            <button onClick={() => setUserType('oficina')} disabled={loading} className="w-full group text-left">
              <Card className="bg-card border-border hover:border-primary/50 transition-all duration-300">
                <CardContent className="flex items-center gap-4 p-5">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Wrench className="w-7 h-7 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground">Oficina / Mecânico</h3>
                    <p className="text-xs text-muted-foreground">Registre serviços verificados</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </CardContent>
              </Card>
            </button>
          </div>
        )}

        {userType === 'oficina' && (
          <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-foreground mb-1">Dados Profissionais</h2>
            <p className="text-xs text-muted-foreground mb-6">Identidade da sua oficina no sistema</p>

            <form onSubmit={handleWorkshopSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">CNPJ</Label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input value={cnpj} onChange={(e) => setCnpj(formatCNPJ(e.target.value))} placeholder="00.000.000/0001-00" className="pl-10 bg-secondary rounded-xl border-none" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Nome da Oficina</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input value={razaoSocial} onChange={(e) => setRazaoSocial(e.target.value)} placeholder="Auto Center Master" className="pl-10 bg-secondary rounded-xl border-none" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Endereço</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input value={endereco} onChange={(e) => setEndereco(e.target.value)} placeholder="Rua, Número - Bairro" className="pl-10 bg-secondary rounded-xl border-none" required />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">WhatsApp</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input value={telefone} onChange={(e) => setTelefone(formatPhone(e.target.value))} placeholder="(00) 00000-0000" className="pl-10 bg-secondary rounded-xl border-none" required />
                </div>
              </div>

              <Button type="submit" className="w-full py-6 rounded-2xl font-bold gap-2" disabled={loading}>
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Finalizar Cadastro'}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useCnpjLookup } from '@/hooks/useCnpjLookup';
import { isValidCnpj, formatCnpj } from '@/lib/cnpj';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Car, Wrench, Shield, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userType, setUserType] = useState<'cliente' | 'oficina' | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ cnpj: '', razaoSocial: '', endereco: '', telefone: '' });
  const [cnpjValidated, setCnpjValidated] = useState(false);

  const { fetchByCnpj, isLoading: isLookingUpCnpj, error: cnpjError } = useCnpjLookup();

  const handleCnpjBlur = async () => {
    if (!form.cnpj) return;
    setCnpjValidated(false);
    const result = await fetchByCnpj(form.cnpj);
    if (result) {
      setForm(prev => ({
        ...prev,
        razaoSocial: result.razaoSocial || prev.razaoSocial,
        endereco: result.endereco || prev.endereco,
        telefone: prev.telefone || result.telefone,
      }));
      setCnpjValidated(true);
      toast.success(
        result.ativa
          ? 'CNPJ validado na Receita Federal!'
          : 'CNPJ encontrado, mas a situação cadastral não está ATIVA.'
      );
    }
  };

  const handleFinalize = async (type: 'cliente' | 'oficina') => {
    if (type === 'oficina' && !isValidCnpj(form.cnpj)) {
      toast.error('Digite um CNPJ válido antes de continuar.');
      return;
    }

    setLoading(true);
    try {
      const updateData = type === 'cliente'
        ? { user_type: 'cliente', onboarding_completed: true }
        : {
            user_type: 'oficina',
            cnpj: form.cnpj.replace(/\D/g, ''),
            razao_social: form.razaoSocial,
            endereco: form.endereco,
            telefone: form.telefone.replace(/\D/g, ''),
            display_name: form.razaoSocial,
            onboarding_completed: true,
            is_verified: false,
          };

      const { error } = await supabase.from('profiles').update(updateData).eq('user_id', user!.id);
      if (error) throw error;
      toast.success('Cadastro finalizado!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Erro ao salvar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <div className="w-full max-w-md space-y-8 text-center">
        <Shield className="w-12 h-12 text-primary mx-auto" />
        <h1 className="text-2xl font-bold">Ficha do Carro</h1>

        {!userType ? (
          <div className="space-y-4">
            <Button onClick={() => handleFinalize('cliente')} variant="outline" className="w-full h-20 gap-4 justify-start px-6 rounded-2xl">
              <Car className="w-6 h-6" /> <div className="text-left"><p className="font-bold">Sou Cliente</p><p className="text-xs text-muted-foreground">Gerenciar meus carros</p></div>
            </Button>
            <Button onClick={() => setUserType('oficina')} variant="outline" className="w-full h-20 gap-4 justify-start px-6 rounded-2xl">
              <Wrench className="w-6 h-6" /> <div className="text-left"><p className="font-bold">Sou Oficina</p><p className="text-xs text-muted-foreground">Selar manutenções profissionais</p></div>
            </Button>
          </div>
        ) : (
          <div className="bg-card border border-border p-6 rounded-3xl space-y-4 text-left">
            <div className="space-y-2">
              <Label>CNPJ</Label>
              <div className="relative">
                <Input
                  value={form.cnpj}
                  onChange={e => setForm({ ...form, cnpj: e.target.value })}
                  onBlur={handleCnpjBlur}
                  placeholder="00.000.000/0001-00"
                />
                {isLookingUpCnpj && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />}
                {cnpjValidated && !isLookingUpCnpj && <CheckCircle2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500" />}
              </div>
              {cnpjError && <p className="text-xs text-destructive">{cnpjError}</p>}
              {form.cnpj && !cnpjError && (
                <p className="text-[11px] text-muted-foreground">{formatCnpj(form.cnpj)}</p>
              )}
            </div>
            <div className="space-y-2"><Label>Nome da Oficina</Label><Input value={form.razaoSocial} onChange={e => setForm({...form, razaoSocial: e.target.value})} /></div>
            <div className="space-y-2"><Label>Endereço</Label><Input value={form.endereco} onChange={e => setForm({...form, endereco: e.target.value})} /></div>
            <div className="space-y-2"><Label>Telefone</Label><Input value={form.telefone} onChange={e => setForm({...form, telefone: e.target.value})} /></div>
            <Button onClick={() => handleFinalize('oficina')} className="w-full h-12 rounded-xl" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : 'Cadastrar Oficina'}
            </Button>
            <p className="text-[10px] text-muted-foreground text-center">
              ⚠️ Depois de salvo, o CNPJ não poderá mais ser alterado.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

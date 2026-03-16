import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Car, Wrench, Shield, Building2, Phone, MapPin, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userType, setUserType] = useState<'cliente' | 'oficina' | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ cnpj: '', razaoSocial: '', endereco: '', telefone: '' });

  const handleFinalize = async (type: 'cliente' | 'oficina') => {
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
            is_verified: false 
          };

      const { error } = await supabase.from('profiles').update(updateData).eq('user_id', user!.id);
      if (error) throw error;
      toast.success('Cadastro finalizado!');
      navigate('/dashboard');
    } catch (error) { toast.error('Erro ao salvar'); } finally { setLoading(false); }
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
            <div className="space-y-2"><Label>CNPJ</Label><Input value={form.cnpj} onChange={e => setForm({...form, cnpj: e.target.value})} placeholder="00.000.000/0001-00" /></div>
            <div className="space-y-2"><Label>Nome da Oficina</Label><Input value={form.razaoSocial} onChange={e => setForm({...form, razaoSocial: e.target.value})} /></div>
            <div className="space-y-2"><Label>Endereço</Label><Input value={form.endereco} onChange={e => setForm({...form, endereco: e.target.value})} /></div>
            <div className="space-y-2"><Label>Telefone</Label><Input value={form.telefone} onChange={e => setForm({...form, telefone: e.target.value})} /></div>
            <Button onClick={() => handleFinalize('oficina')} className="w-full h-12 rounded-xl" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : 'Cadastrar Oficina'}</Button>
          </div>
        )}
      </div>
    </div>
  );
}

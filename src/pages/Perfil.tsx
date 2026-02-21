import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentProfile } from '@/hooks/useCurrentProfile';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, LogOut, Wrench, Shield, Save, Loader2, Settings } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function Perfil() {
  const { user, signOut } = useAuth();
  const { profile, isOficina, isCEO } = useCurrentProfile();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ razaoSocial: '', cnpj: '', endereco: '', telefone: '' });

  useEffect(() => {
    if (profile) setForm({ razaoSocial: profile.razao_social || '', cnpj: profile.cnpj || '', endereco: profile.endereco || '', telefone: profile.telefone || '' });
  }, [profile]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.from('profiles').update({ razao_social: form.razaoSocial, cnpj: form.cnpj, endereco: form.endereco, telefone: form.telefone }).eq('user_id', user?.id);
      if (error) throw error;
      toast.success('Perfil atualizado!');
    } catch (error) { toast.error('Erro ao salvar'); } finally { setLoading(false); }
  };

  return (
    <AppLayout>
      <div className="px-4 py-8 max-w-lg mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Meu Perfil</h1>
          <Button onClick={signOut} variant="ghost" className="text-destructive"><LogOut className="w-5 h-5" /></Button>
        </div>

        <div className="p-6 bg-card border border-border rounded-[2rem] flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center"><User className="w-8 h-8 text-primary" /></div>
          <div><h2 className="font-bold">{profile?.display_name}</h2><p className="text-xs text-muted-foreground">{user?.email}</p></div>
        </div>

        {(isOficina || isCEO) && (
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Ficha da Oficina</h3>
            <div className="bg-card border border-border p-6 rounded-[2rem] space-y-4">
              <div className="space-y-1"><Label className="text-[10px]">RAZÃO SOCIAL</Label><Input value={form.razaoSocial} onChange={e => setForm({...form, razaoSocial: e.target.value})} className="bg-secondary" /></div>
              <div className="space-y-1"><Label className="text-[10px]">CNPJ</Label><Input value={form.cnpj} onChange={e => setForm({...form, cnpj: e.target.value})} className="bg-secondary" /></div>
              <div className="space-y-1"><Label className="text-[10px]">ENDEREÇO</Label><Input value={form.endereco} onChange={e => setForm({...form, endereco: e.target.value})} className="bg-secondary" /></div>
              <div className="space-y-1"><Label className="text-[10px]">WHATSAPP</Label><Input value={form.telefone} onChange={e => setForm({...form, telefone: e.target.value})} className="bg-secondary" /></div>
              <Button onClick={handleSave} className="w-full h-12 rounded-2xl gap-2" disabled={loading}>{loading ? <Loader2 className="animate-spin" /> : <><Save className="w-4 h-4" /> Salvar</>}</Button>
            </div>
          </div>
        )}

        {isCEO && (
          <Link to="/admin" className="block p-5 bg-primary/5 border border-primary/20 rounded-2xl hover:bg-primary/10 transition-all">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3"><Settings className="w-5 h-5 text-primary" /><div className="font-bold text-primary">Painel do CEO</div></div>
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
          </Link>
        )}
      </div>
    </AppLayout>
  );
}

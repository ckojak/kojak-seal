import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentProfile } from '@/hooks/useCurrentProfile';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail, LogOut, Wrench, Shield, Building2, MapPin, Phone, Save, Loader2, Settings } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';

export default function Perfil() {
  const { user, signOut } = useAuth();
  const { profile, isOficina, isCEO } = useCurrentProfile();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    razaoSocial: '',
    cnpj: '',
    endereco: '',
    telefone: '',
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        razaoSocial: profile.razao_social || '',
        cnpj: profile.cnpj || '',
        endereco: profile.endereco || '',
        telefone: profile.telefone || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          razao_social: formData.razaoSocial,
          cnpj: formData.cnpj,
          endereco: formData.endereco,
          telefone: formData.telefone,
          display_name: formData.razaoSocial || profile?.display_name,
        })
        .eq('user_id', user?.id);

      if (error) throw error;
      toast.success('Ficha técnica atualizada!');
    } catch (error) {
      toast.error('Erro ao salvar no servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="px-4 pt-6 pb-24 max-w-lg mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Meu Perfil</h1>
          <Button variant="ghost" size="icon" onClick={() => signOut()} className="text-destructive">
            <LogOut className="w-5 h-5" />
          </Button>
        </div>

        <div className="bg-card border border-border rounded-[2rem] p-6 mb-8 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-lg">{profile?.display_name || 'Usuário'}</h2>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
              {profile?.is_verified && (
                <div className="mt-2 flex items-center gap-1 text-green-500">
                  <Shield className="w-3 h-3 fill-current" />
                  <span className="text-[10px] font-black uppercase">Oficina Verificada</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {(isOficina || isCEO) && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 px-2">
              <Wrench className="w-4 h-4 text-primary" />
              <h3 className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Configurações de Oficina</h3>
            </div>

            <div className="bg-card border border-border rounded-[2rem] p-6 space-y-5">
              <div className="space-y-2">
                <Label className="text-xs">Razão Social</Label>
                <Input value={formData.razaoSocial} onChange={e => setFormData({...formData, razaoSocial: e.target.value})} className="bg-secondary rounded-xl border-none" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">CNPJ</Label>
                  <Input value={formData.cnpj} onChange={e => setFormData({...formData, cnpj: e.target.value})} className="bg-secondary rounded-xl border-none" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Telefone</Label>
                  <Input value={formData.telefone} onChange={e => setFormData({...formData, telefone: e.target.value})} className="bg-secondary rounded-xl border-none" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs">Endereço</Label>
                <Input value={formData.endereco} onChange={e => setFormData({...formData, endereco: e.target.value})} className="bg-secondary rounded-xl border-none" />
              </div>

              <Button onClick={handleSave} className="w-full py-6 rounded-2xl font-bold gap-2" disabled={loading}>
                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                Salvar Alterações
              </Button>
            </div>
          </div>
        )}

        {isCEO && (
          <div className="mt-8">
            <Link to="/admin">
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex items-center justify-between hover:bg-primary/10 transition-all">
                <div className="flex items-center gap-3">
                  <Settings className="w-6 h-6 text-primary" />
                  <div>
                    <h3 className="font-bold text-primary">Painel do CEO</h3>
                    <p className="text-[10px] text-muted-foreground">GESTÃO GLOBAL DO SISTEMA</p>
                  </div>
                </div>
                <Shield className="w-5 h-5 text-primary" />
              </div>
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

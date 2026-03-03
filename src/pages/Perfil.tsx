import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { useCurrentProfile } from '@/hooks/useCurrentProfile';
import { useVeiculos } from '@/hooks/useVeiculos';
import { useManutencoes } from '@/hooks/useManutencoes';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  User, Mail, LogOut, Car, Wrench, Shield, 
  Bell, Settings, Building2, MapPin, Phone, Save, Loader2, Lock, LocateFixed
} from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { NotificationSettings } from '@/components/NotificationSettings';
import { Badge } from '@/components/ui/badge';

export default function Perfil() {
  const { user, signOut } = useAuth();
  const { profile, isOficina, isCEO } = useCurrentProfile();
  const { data: veiculos = [] } = useVeiculos();
  const { data: manutencoes = [] } = useManutencoes();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [verifyingCnpj, setVerifyingCnpj] = useState(false);

  // DIRECTIVE 4: Immutable lock — once CNPJ is set and verified, core identity is frozen
  const isCnpjLocked = !!(profile?.cnpj && profile?.is_verified);

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

  // DIRECTIVE 3: CNPJ auto-fill on Perfil page for unlocked profiles
  useEffect(() => {
    const cleanCnpj = formData.cnpj.replace(/\D/g, '');
    if (cleanCnpj.length === 14 && !isCnpjLocked && !verifyingCnpj) {
      handleCnpjLookup(cleanCnpj);
    }
  }, [formData.cnpj]);

  const handleCnpjLookup = async (cnpj: string) => {
    setVerifyingCnpj(true);
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      
      if (data.situacao === "ATIVA") {
        setFormData(prev => ({
          ...prev,
          razaoSocial: data.razao_social || data.nome_fantasia || prev.razaoSocial,
          endereco: `${data.logradouro}, ${data.numero} - ${data.bairro}, ${data.municipio} - ${data.uf}`,
        }));
        toast.success("CNPJ validado na Receita Federal!");
      } else {
        toast.error("Este CNPJ não está ATIVO na Receita.");
      }
    } catch {
      toast.error("CNPJ não encontrado. Verifique os números.");
    } finally {
      setVerifyingCnpj(false);
    }
  };

  // GPS Sniper
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Seu dispositivo não suporta GPS no navegador.");
      return;
    }
    setIsLocating(true);
    toast.info("Buscando satélite...");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (data?.address) {
            const rua = data.address.road || data.address.pedestrian || "";
            const bairro = data.address.suburb || data.address.neighbourhood || "";
            const cidade = data.address.city || data.address.town || "";
            const estado = data.address.state || "";
            setFormData(prev => ({ ...prev, endereco: `${rua}, ${bairro} - ${cidade} - ${estado}`.replace(/^, /, '').trim() }));
            toast.success("Localização capturada com sucesso!");
          } else {
            toast.error("Não foi possível converter a localização.");
          }
        } catch { toast.error("Falha ao traduzir as coordenadas GPS."); }
        finally { setIsLocating(false); }
      },
      () => { setIsLocating(false); toast.error("Permissão de localização negada ou falha no GPS."); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Logout realizado com sucesso');
    navigate('/');
  };

  const handleSaveWorkshopData = async () => {
    setLoading(true);
    try {
      // DIRECTIVE 4: Only mutable fields are sent when locked
      const updatePayload: Record<string, any> = {
        endereco: formData.endereco,
        telefone: formData.telefone,
      };

      if (!isCnpjLocked) {
        updatePayload.cnpj = formData.cnpj;
        updatePayload.razao_social = formData.razaoSocial;
        updatePayload.display_name = formData.razaoSocial || profile?.display_name;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updatePayload)
        .eq('user_id', user?.id);

      if (error) throw error;
      toast.success('Ficha da oficina atualizada!');
    } catch (error) {
      toast.error('Erro ao salvar dados');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout>
      <div className="px-4 pt-6 pb-24 max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">Meu Perfil</h1>
            <p className="text-sm text-muted-foreground">Configurações da conta</p>
          </div>
        </div>

        {/* User Card */}
        <div className="bg-card border border-border rounded-2xl p-5 mb-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center border border-primary/10">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-foreground truncate">{profile?.display_name || 'Usuário'}</h2>
              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                <Mail className="w-3 h-3" />
                <span className="truncate">{user?.email}</span>
                <Lock className="w-3 h-3 text-primary ml-1" />
              </div>
              {profile?.is_verified && (
                <div className="mt-2 flex items-center gap-1 text-green-500">
                  <Shield className="w-3 h-3 fill-current" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Verificado</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Car className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{veiculos.length}</p>
                <p className="text-[10px] uppercase text-muted-foreground">Veículos</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Wrench className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{manutencoes.length}</p>
                <p className="text-[10px] uppercase text-muted-foreground">Registros</p>
              </div>
            </div>
          </div>
        </div>

        {/* Workshop Settings */}
        {(isOficina || isCEO) && (
          <div className="mb-8 animate-fade-in">
            <div className="flex items-center gap-2 mb-4 px-1">
              <Settings className="w-4 h-4 text-primary" />
              <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-muted-foreground">Ficha Profissional</h3>
              {isCnpjLocked && (
                <Badge className="ml-auto text-[9px]" variant="outline">
                  <Lock className="w-3 h-3 mr-1" /> Identidade Auditada
                </Badge>
              )}
            </div>
            
            <div className="bg-card border border-border rounded-[2rem] p-6 space-y-4 shadow-sm">
              {/* CNPJ - LOCKED after verification */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-xs text-muted-foreground ml-1">CNPJ {isCnpjLocked ? '(Auditado)' : '(Auto-verificação)'}</Label>
                  {verifyingCnpj && <Loader2 className="w-3 h-3 text-primary animate-spin" />}
                </div>
                <div className="relative">
                  <Input 
                    value={formData.cnpj} 
                    onChange={e => !isCnpjLocked && setFormData({...formData, cnpj: e.target.value})}
                    disabled={isCnpjLocked}
                    className={`bg-secondary/50 border-none rounded-xl h-12 ${isCnpjLocked ? 'opacity-60 pr-10' : ''}`}
                    placeholder="00.000.000/0001-00"
                  />
                  {isCnpjLocked && <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />}
                </div>
              </div>

              {/* Razão Social - LOCKED after verification */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground ml-1">Razão Social / Nome Fantasia</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                  <Input 
                    value={formData.razaoSocial} 
                    onChange={e => !isCnpjLocked && setFormData({...formData, razaoSocial: e.target.value})}
                    disabled={isCnpjLocked}
                    className={`pl-10 bg-secondary/50 border-none rounded-xl h-12 ${isCnpjLocked ? 'opacity-60' : ''}`}
                    placeholder="Nome da sua Oficina"
                  />
                  {isCnpjLocked && <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />}
                </div>
              </div>

              {/* Telefone - ALWAYS MUTABLE */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground ml-1">WhatsApp de Contato</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                  <Input 
                    value={formData.telefone} 
                    onChange={e => setFormData({...formData, telefone: e.target.value})}
                    className="pl-10 bg-secondary/50 border-none rounded-xl h-12"
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              {/* Endereço - ALWAYS MUTABLE */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground ml-1">Endereço Completo</Label>
                <div className="relative flex items-center">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 z-10" />
                  <Input 
                    value={formData.endereco} 
                    onChange={e => setFormData({...formData, endereco: e.target.value})}
                    className="pl-10 pr-12 bg-secondary/50 border-none rounded-xl h-12"
                    placeholder="Rua, Número, Bairro, Cidade - UF"
                  />
                  <button 
                    onClick={handleGetLocation}
                    disabled={isLocating}
                    title="Pegar localização atual"
                    className="absolute right-2 p-2 bg-primary/20 text-primary rounded-lg hover:bg-primary/40 transition-colors z-10"
                  >
                    {isLocating ? <Loader2 className="w-4 h-4 animate-spin" /> : <LocateFixed className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button 
                onClick={handleSaveWorkshopData} 
                className="w-full h-14 rounded-2xl font-bold gap-2 shadow-lg shadow-primary/10 mt-6" 
                disabled={loading || verifyingCnpj}
              >
                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                Salvar Dados da Oficina
              </Button>
            </div>
          </div>
        )}

        {/* Notifications */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4 px-1">
            <Bell className="w-4 h-4 text-primary" />
            <h3 className="font-bold text-xs uppercase tracking-[0.2em] text-muted-foreground">Notificações</h3>
          </div>
          <div className="bg-card border border-border rounded-2xl p-2">
            <NotificationSettings />
          </div>
        </div>

        {/* CEO Panel Link */}
        {isCEO && (
          <Link to="/admin" className="block mb-8 group">
            <div className="bg-primary/5 border border-primary/20 rounded-[2rem] p-5 flex items-center justify-between group-hover:bg-primary/10 transition-all">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center">
                  <Settings className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-primary">Painel do CEO</h3>
                  <p className="text-[10px] text-muted-foreground uppercase font-black">Gestão Total do Sistema</p>
                </div>
              </div>
              <Shield className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
            </div>
          </Link>
        )}

        {/* Sign Out */}
        <Button
          variant="outline"
          size="lg"
          className="w-full h-14 rounded-2xl gap-2 text-destructive border-destructive/20 hover:bg-destructive/5 font-bold"
          onClick={handleSignOut}
        >
          <LogOut className="w-5 h-5" />
          Sair da Conta
        </Button>
      </div>
    </AppLayout>
  );
}

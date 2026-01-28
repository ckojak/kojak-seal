import { AppLayout } from '@/components/AppLayout';
import { useAuth } from '@/hooks/useAuth';
import { useVeiculos } from '@/hooks/useVeiculos';
import { useManutencoes } from '@/hooks/useManutencoes';
import { Button } from '@/components/ui/button';
import { User, Mail, LogOut, Car, Wrench, Shield, Bell, Settings } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { NotificationSettings } from '@/components/NotificationSettings';

const ADMIN_EMAIL = 'bmw.reta@hotmail.com';

export default function Perfil() {
  const { user, signOut } = useAuth();
  const { data: veiculos = [] } = useVeiculos();
  const { data: manutencoes = [] } = useManutencoes();
  const navigate = useNavigate();
  
  const isAdmin = user?.email === ADMIN_EMAIL;

  const handleSignOut = async () => {
    await signOut();
    toast.success('Logout realizado com sucesso');
    navigate('/');
  };

  return (
    <AppLayout>
      <div className="px-4 pt-6 pb-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">
              Meu Perfil
            </h1>
            <p className="text-sm text-muted-foreground">
              Configurações da conta
            </p>
          </div>
        </div>

        {/* User Card */}
        <div className="bg-card border border-border rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-foreground">Usuário</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Mail className="w-4 h-4" />
                <span className="truncate">{user?.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Car className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{veiculos.length}</p>
                <p className="text-xs text-muted-foreground">Veículos</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Wrench className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{manutencoes.length}</p>
                <p className="text-xs text-muted-foreground">Manutenções</p>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Notificações</h3>
          </div>
          <NotificationSettings />
        </div>

        {/* About */}
        <div className="bg-card border border-border rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-foreground">Sobre o Kojak Auto-Log</h3>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Ecossistema de confiança automotiva onde manutenções são seladas com data imutável 
            do servidor, garantindo a autenticidade do histórico do veículo.
          </p>
        </div>

        {/* Admin Panel Link (only for admin) */}
        {isAdmin && (
          <Link to="/admin" className="block mb-6">
            <div className="bg-primary/10 border border-primary/30 rounded-2xl p-4 flex items-center justify-between hover:bg-primary/20 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Settings className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-primary">Painel Admin</h3>
                  <p className="text-xs text-muted-foreground">Gerenciar usuários e oficinas</p>
                </div>
              </div>
              <Shield className="w-5 h-5 text-primary" />
            </div>
          </Link>
        )}

        {/* Logout */}
        <Button
          variant="outline"
          size="lg"
          className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10"
          onClick={handleSignOut}
        >
          <LogOut className="w-5 h-5" />
          Sair da conta
        </Button>
      </div>
    </AppLayout>
  );
}
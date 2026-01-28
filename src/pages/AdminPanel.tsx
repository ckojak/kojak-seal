import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, ShieldCheck, Users, Loader2, Calendar, Ban, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { format, addDays, addYears } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ADMIN_EMAIL = 'bmw.reta@hotmail.com';

interface ProfileWithSubscription {
  id: string;
  user_id: string;
  display_name: string | null;
  is_verified: boolean;
  created_at: string;
  subscription_status: 'active' | 'inactive' | 'free';
  subscription_expires_at: string | null;
}

export default function AdminPanel() {
  const { user, loading: authLoading } = useAuth();
  const [profiles, setProfiles] = useState<ProfileWithSubscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const isAdmin = user?.email === ADMIN_EMAIL;

  useEffect(() => {
    if (isAdmin) {
      fetchProfiles();
    }
  }, [isAdmin]);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProfiles((data || []) as ProfileWithSubscription[]);
    } catch (error) {
      console.error('Error fetching profiles:', error);
      toast.error('Erro ao carregar perfis');
    } finally {
      setLoading(false);
    }
  };

  const toggleVerification = async (profileId: string, currentStatus: boolean) => {
    setUpdating(profileId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_verified: !currentStatus })
        .eq('id', profileId);

      if (error) throw error;

      setProfiles(prev =>
        prev.map(p =>
          p.id === profileId ? { ...p, is_verified: !currentStatus } : p
        )
      );

      toast.success(
        !currentStatus 
          ? 'Oficina verificada com sucesso!' 
          : 'Verificação removida'
      );
    } catch (error) {
      console.error('Error updating verification:', error);
      toast.error('Erro ao atualizar verificação');
    } finally {
      setUpdating(null);
    }
  };

  const activateSubscription = async (profileId: string, days: number) => {
    setUpdating(profileId);
    try {
      const expiresAt = days === 365 
        ? addYears(new Date(), 1) 
        : addDays(new Date(), days);

      const { error } = await supabase
        .from('profiles')
        .update({ 
          subscription_status: 'active',
          subscription_expires_at: expiresAt.toISOString()
        })
        .eq('id', profileId);

      if (error) throw error;

      setProfiles(prev =>
        prev.map(p =>
          p.id === profileId 
            ? { ...p, subscription_status: 'active', subscription_expires_at: expiresAt.toISOString() } 
            : p
        )
      );

      toast.success(`Assinatura ativada por ${days} dias!`);
    } catch (error) {
      console.error('Error activating subscription:', error);
      toast.error('Erro ao ativar assinatura');
    } finally {
      setUpdating(null);
    }
  };

  const blockSubscription = async (profileId: string) => {
    setUpdating(profileId);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          subscription_status: 'inactive',
          subscription_expires_at: null
        })
        .eq('id', profileId);

      if (error) throw error;

      setProfiles(prev =>
        prev.map(p =>
          p.id === profileId 
            ? { ...p, subscription_status: 'inactive', subscription_expires_at: null } 
            : p
        )
      );

      toast.success('Assinatura bloqueada!');
    } catch (error) {
      console.error('Error blocking subscription:', error);
      toast.error('Erro ao bloquear assinatura');
    } finally {
      setUpdating(null);
    }
  };

  const getSubscriptionBadge = (profile: ProfileWithSubscription) => {
    const isExpired = profile.subscription_expires_at 
      && new Date(profile.subscription_expires_at) < new Date();

    if (profile.subscription_status === 'inactive') {
      return <Badge variant="destructive">Bloqueado</Badge>;
    }
    if (profile.subscription_status === 'active') {
      if (isExpired) {
        return <Badge variant="destructive">Expirado</Badge>;
      }
      return <Badge className="bg-primary/20 text-primary">Ativo</Badge>;
    }
    return <Badge variant="secondary">Free</Badge>;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AppLayout showNav={false}>
      <div className="min-h-screen bg-background p-4 md:p-8">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Painel Super Admin
            </h1>
          </div>
          <p className="text-muted-foreground">
            Gerencie oficinas verificadas, assinaturas e usuários do Kojak Auto-Log
          </p>
        </div>

        {/* Stats Cards */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total de Usuários
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold text-foreground">
                  {profiles.length}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Oficinas Verificadas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold text-primary">
                  {profiles.filter(p => p.is_verified).length}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Assinaturas Ativas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="text-2xl font-bold text-primary">
                  {profiles.filter(p => p.subscription_status === 'active').length}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Usuários Bloqueados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Ban className="w-5 h-5 text-destructive" />
                <span className="text-2xl font-bold text-destructive">
                  {profiles.filter(p => p.subscription_status === 'inactive').length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <div className="max-w-7xl mx-auto">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Gestão de Perfis e Assinaturas</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-transparent">
                        <TableHead className="text-muted-foreground">Nome</TableHead>
                        <TableHead className="text-muted-foreground">Tipo</TableHead>
                        <TableHead className="text-muted-foreground">Assinatura</TableHead>
                        <TableHead className="text-muted-foreground">Expira em</TableHead>
                        <TableHead className="text-muted-foreground">Verificado</TableHead>
                        <TableHead className="text-muted-foreground text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profiles.map((profile) => (
                        <TableRow key={profile.id} className="border-border">
                          <TableCell className="font-medium text-foreground">
                            {profile.display_name || 'Sem nome'}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={profile.is_verified ? "default" : "secondary"}
                              className={profile.is_verified ? "bg-primary/20 text-primary" : ""}
                            >
                              {profile.is_verified ? 'Oficina' : 'Usuário'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {getSubscriptionBadge(profile)}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {profile.subscription_expires_at ? (
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                {format(new Date(profile.subscription_expires_at), "dd/MM/yyyy", { locale: ptBR })}
                              </div>
                            ) : (
                              <span className="text-muted-foreground/50">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {updating === profile.id && (
                                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                              )}
                              <Switch
                                checked={profile.is_verified}
                                onCheckedChange={() => toggleVerification(profile.id, profile.is_verified)}
                                disabled={updating === profile.id}
                              />
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => activateSubscription(profile.id, 30)}
                                disabled={updating === profile.id}
                                className="text-xs h-8"
                              >
                                +30 Dias
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => activateSubscription(profile.id, 365)}
                                disabled={updating === profile.id}
                                className="text-xs h-8"
                              >
                                +1 Ano
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => blockSubscription(profile.id)}
                                disabled={updating === profile.id || profile.subscription_status === 'inactive'}
                                className="text-xs h-8"
                              >
                                <Ban className="w-3.5 h-3.5" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Back Link */}
        <div className="max-w-7xl mx-auto mt-6">
          <a 
            href="/dashboard" 
            className="text-muted-foreground hover:text-primary transition-colors text-sm"
          >
            ← Voltar ao Dashboard
          </a>
        </div>
      </div>
    </AppLayout>
  );
}

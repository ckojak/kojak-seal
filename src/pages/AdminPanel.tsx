import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Shield, ShieldCheck, Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const ADMIN_EMAIL = 'bmw.reta@hotmail.com';

interface ProfileWithEmail {
  id: string;
  user_id: string;
  display_name: string | null;
  is_verified: boolean;
  created_at: string;
  email?: string;
}

export default function AdminPanel() {
  const { user, loading: authLoading } = useAuth();
  const [profiles, setProfiles] = useState<ProfileWithEmail[]>([]);
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
      setProfiles(data || []);
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
        <div className="max-w-6xl mx-auto mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Painel Super Admin
            </h1>
          </div>
          <p className="text-muted-foreground">
            Gerencie oficinas verificadas e usuários do Kojak Auto-Log
          </p>
        </div>

        {/* Stats Cards */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
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
                Usuários Comuns
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-muted-foreground" />
                <span className="text-2xl font-bold text-foreground">
                  {profiles.filter(p => !p.is_verified).length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users Table */}
        <div className="max-w-6xl mx-auto">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-foreground">Gestão de Perfis</CardTitle>
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
                        <TableHead className="text-muted-foreground">User ID</TableHead>
                        <TableHead className="text-muted-foreground">Tipo</TableHead>
                        <TableHead className="text-muted-foreground">Status</TableHead>
                        <TableHead className="text-muted-foreground text-right">Verificado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {profiles.map((profile) => (
                        <TableRow key={profile.id} className="border-border">
                          <TableCell className="font-medium text-foreground">
                            {profile.display_name || 'Sem nome'}
                          </TableCell>
                          <TableCell className="text-muted-foreground font-mono text-xs">
                            {profile.user_id.slice(0, 8)}...
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
                            {profile.is_verified ? (
                              <div className="flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4 text-primary" />
                                <span className="text-primary text-sm">Certificado</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-sm">Padrão</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
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
        <div className="max-w-6xl mx-auto mt-6">
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

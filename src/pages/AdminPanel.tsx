import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ShieldCheck, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { format, addDays } from 'date-fns';

const ADMIN_EMAIL = 'bmw.reta@hotmail.com';

export default function AdminPanel() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const isAdmin = user?.email?.toLowerCase() === ADMIN_EMAIL;

  useEffect(() => { if (isAdmin) fetchProfiles(); }, [isAdmin]);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Erro ao carregar perfis:', error);
      toast.error('Erro ao carregar perfis');
    } finally {
      setLoading(false);
    }
  };

  const toggleVerification = async (profileId: string, currentStatus: boolean) => {
    setUpdating(profileId);
    try {
      const nextStatus = !currentStatus;
      const { error } = await supabase
        .from('profiles')
        .update({
          is_verified: nextStatus,
          is_verified_admin: nextStatus,
          user_type: nextStatus ? 'oficina' : 'cliente',
          role: nextStatus ? 'oficina' : 'user',
        })
        .eq('id', profileId);
      if (error) throw error;
      setProfiles(prev => prev.map(p => p.id === profileId ? {
        ...p,
        is_verified: nextStatus,
        is_verified_admin: nextStatus,
        user_type: nextStatus ? 'oficina' : 'cliente',
        role: nextStatus ? 'oficina' : 'user',
      } : p));
      toast.success(nextStatus ? 'Oficina Verificada!' : 'Acesso Revogado');
    } catch (error) { toast.error('Erro na atualização'); } finally { setUpdating(null); }
  };

  const changeRole = async (profileId: string, newRole: string) => {
    setUpdating(profileId);
    try {
      const updates: Record<string, any> = { role: newRole };
      if (newRole === 'oficina') {
        updates.user_type = 'oficina';
        updates.profile_type = 'oficina';
      } else if (newRole === 'admin') {
        updates.user_type = 'admin';
      } else {
        updates.user_type = 'cliente';
        updates.profile_type = 'cliente';
      }
      const { error } = await supabase.from('profiles').update(updates).eq('id', profileId);
      if (error) throw error;
      setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, ...updates } : p));
      toast.success(`Perfil alterado para ${newRole}`);
    } catch (error) { toast.error('Erro ao alterar role'); } finally { setUpdating(null); }
  };

  const activateSubscription = async (profileId: string, days: number) => {
    setUpdating(profileId);
    try {
      const expiresAt = addDays(new Date(), days);
      const { error } = await supabase.from('profiles').update({ subscription_status: 'active', subscription_expires_at: expiresAt.toISOString() }).eq('id', profileId);
      if (error) throw error;
      setProfiles(prev => prev.map(p => p.id === profileId ? { ...p, subscription_status: 'active', subscription_expires_at: expiresAt.toISOString() } : p));
      toast.success(`Ativado por ${days} dias`);
    } catch (error) { toast.error('Erro ao ativar'); } finally { setUpdating(null); }
  };

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;
  if (!user || !isAdmin) return <Navigate to="/dashboard" replace />;

  return (
    <AppLayout showNav={false}>
      <div className="p-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')} className="shrink-0">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <ShieldCheck className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold">Painel CEO</h1>
          <Badge variant="outline" className="ml-auto">{profiles.length} perfis</Badge>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>
        ) : profiles.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">Nenhum perfil encontrado.</div>
        ) : (
          <Card className="bg-card border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome/Oficina</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Expira em</TableHead>
                  <TableHead>Verificado</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.razao_social || p.display_name || 'Sem nome'}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[220px] truncate">
                      {p.email || p.display_name || p.user_id?.substring(0, 8) + '...'}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={p.role || 'user'}
                        onValueChange={(val) => changeRole(p.id, val)}
                        disabled={updating === p.id}
                      >
                        <SelectTrigger className="w-[110px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">user</SelectItem>
                          <SelectItem value="oficina">oficina</SelectItem>
                          <SelectItem value="admin">admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell><Badge variant={p.subscription_status === 'active' ? 'default' : 'secondary'}>{p.subscription_status || 'free'}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{p.subscription_expires_at ? format(new Date(p.subscription_expires_at), 'dd/MM/yyyy') : '-'}</TableCell>
                    <TableCell>
                      <Switch checked={!!p.is_verified} onCheckedChange={() => toggleVerification(p.id, !!p.is_verified)} disabled={updating === p.id} />
                    </TableCell>
                    <TableCell className="text-right flex justify-end gap-2">
                      <Button size="sm" variant="outline" onClick={() => activateSubscription(p.id, 30)} disabled={updating === p.id}>+30d</Button>
                      <Button size="sm" variant="outline" onClick={() => activateSubscription(p.id, 365)} disabled={updating === p.id}>+1a</Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

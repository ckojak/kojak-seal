import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, UserPlus, Trash2, Crown, Edit3, Eye, Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useVehicleUsers, useRemoveVehicleUser, VehiclePermission } from '@/hooks/useVehicleUsers';
import { Veiculo } from '@/hooks/useVeiculos';

interface ShareVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  veiculo: Veiculo;
}

const PERMISSION_LABELS: Record<VehiclePermission, { label: string; icon: React.ReactNode; description: string }> = {
  owner: {
    label: 'Proprietário',
    icon: <Crown className="w-4 h-4 text-yellow-500" />,
    description: 'Acesso total, pode convidar outros',
  },
  editor: {
    label: 'Editor',
    icon: <Edit3 className="w-4 h-4 text-primary" />,
    description: 'Pode registrar manutenções',
  },
  viewer: {
    label: 'Visualizador',
    icon: <Eye className="w-4 h-4 text-muted-foreground" />,
    description: 'Apenas visualização',
  },
};

export function ShareVehicleModal({ isOpen, onClose, veiculo }: ShareVehicleModalProps) {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<VehiclePermission>('viewer');
  const [copied, setCopied] = useState(false);
  
  const { data: vehicleUsers = [], isLoading } = useVehicleUsers(veiculo.id);
  const removeUser = useRemoveVehicleUser();

  const publicUrl = `${window.location.origin}/v/${veiculo.id}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      toast.success('Link copiado!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Erro ao copiar link');
    }
  };

  const handleInvite = () => {
    // Por enquanto, mostrar mensagem informativa
    // Em uma implementação completa, enviaria um email de convite
    toast.info('Funcionalidade de convite por email em desenvolvimento. Use o link público para compartilhar o histórico.');
    setEmail('');
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      await removeUser.mutateAsync({ id: userId, vehicleId: veiculo.id });
      toast.success('Usuário removido');
    } catch {
      toast.error('Erro ao remover usuário');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Users className="w-5 h-5 text-primary" />
            Compartilhar Veículo
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Compartilhe o histórico de {veiculo.placa} com outras pessoas
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Link público */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-foreground">Link público</Label>
            <div className="flex gap-2">
              <Input
                value={publicUrl}
                readOnly
                className="bg-secondary/50 text-sm"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
                className="shrink-0"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-primary" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Qualquer pessoa com este link pode visualizar o histórico
            </p>
          </div>

          {/* Convidar por email */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-foreground">Convidar usuário</Label>
            
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="email@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-secondary/50"
              />
              <Select value={permission} onValueChange={(v) => setPermission(v as VehiclePermission)}>
                <SelectTrigger className="w-32 bg-secondary/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="editor">
                    <div className="flex items-center gap-2">
                      {PERMISSION_LABELS.editor.icon}
                      <span>Editor</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="viewer">
                    <div className="flex items-center gap-2">
                      {PERMISSION_LABELS.viewer.icon}
                      <span>Visualizador</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={handleInvite}
              disabled={!email}
            >
              <UserPlus className="w-4 h-4" />
              Convidar
            </Button>
          </div>

          {/* Lista de usuários */}
          {vehicleUsers.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium text-foreground">
                Usuários com acesso
              </Label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {vehicleUsers.map((vu) => (
                  <div
                    key={vu.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border"
                  >
                    <div className="flex items-center gap-3">
                      {PERMISSION_LABELS[vu.permission].icon}
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {vu.user_id.slice(0, 8)}...
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {PERMISSION_LABELS[vu.permission].label}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleRemoveUser(vu.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
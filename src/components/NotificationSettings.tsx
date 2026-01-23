import { Bell, BellOff, BellRing, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export function NotificationSettings() {
  const {
    permission,
    enabled,
    requestPermission,
    disableNotifications,
    sendTestNotification,
    isSupported,
  } = usePushNotifications();

  if (!isSupported) {
    return (
      <div className="p-4 rounded-xl bg-secondary/30 border border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            <Info className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              Notificações não suportadas
            </p>
            <p className="text-xs text-muted-foreground">
              Seu navegador não suporta notificações push
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl bg-secondary/30 border border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              enabled ? 'bg-primary/20' : 'bg-muted'
            }`}>
              {enabled ? (
                <BellRing className="w-5 h-5 text-primary" />
              ) : (
                <BellOff className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Lembretes de Manutenção
              </p>
              <p className="text-xs text-muted-foreground">
                {enabled 
                  ? 'Você receberá lembretes periódicos' 
                  : 'Ative para receber lembretes'}
              </p>
            </div>
          </div>
          
          {enabled ? (
            <Button
              variant="outline"
              size="sm"
              onClick={disableNotifications}
              className="text-destructive hover:text-destructive"
            >
              Desativar
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={requestPermission}
              className="gap-2"
            >
              <Bell className="w-4 h-4" />
              Ativar
            </Button>
          )}
        </div>
      </div>

      {enabled && (
        <>
          <div className="p-4 rounded-xl bg-card border border-border">
            <h4 className="text-sm font-medium text-foreground mb-2">
              Configurações de lembrete
            </h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Lembrete a cada 5.000 km rodados
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                Lembrete a cada 90 dias sem manutenção
              </li>
            </ul>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={sendTestNotification}
            className="w-full gap-2"
          >
            <BellRing className="w-4 h-4" />
            Enviar notificação de teste
          </Button>
        </>
      )}

      {permission === 'denied' && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
          <p className="text-xs text-destructive">
            Permissão de notificações bloqueada. Acesse as configurações do seu navegador para permitir notificações deste site.
          </p>
        </div>
      )}
    </div>
  );
}
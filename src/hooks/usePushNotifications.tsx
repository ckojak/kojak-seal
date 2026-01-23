import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

// Configurações de intervalo para lembretes
const REMINDER_INTERVALS = {
  km: 5000, // Lembrar a cada 5000 km
  days: 90, // Lembrar a cada 90 dias
};

interface NotificationSettings {
  enabled: boolean;
  lastKmReminder: number;
  lastDateReminder: string;
}

const STORAGE_KEY = 'kojak-notification-settings';

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      enabled: false,
      lastKmReminder: 0,
      lastDateReminder: new Date().toISOString(),
    };
  });

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  }, [settings]);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      toast.error('Seu navegador não suporta notificações');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      
      if (result === 'granted') {
        setSettings(prev => ({ ...prev, enabled: true }));
        toast.success('Notificações ativadas com sucesso!');
        
        // Mostrar notificação de teste
        new Notification('Kojak Auto-Log', {
          body: 'Você receberá lembretes de manutenção!',
          icon: '/favicon.ico',
          badge: '/favicon.ico',
        });
        
        return true;
      } else {
        toast.error('Permissão de notificação negada');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      toast.error('Erro ao solicitar permissão');
      return false;
    }
  }, []);

  const disableNotifications = useCallback(() => {
    setSettings(prev => ({ ...prev, enabled: false }));
    toast.info('Notificações desativadas');
  }, []);

  const checkMaintenanceReminder = useCallback((
    lastKm: number,
    lastMaintenanceDate: string | null
  ) => {
    if (!settings.enabled || permission !== 'granted') return;

    const now = new Date();
    let shouldRemind = false;
    let reminderMessage = '';

    // Verificar por quilometragem
    if (lastKm - settings.lastKmReminder >= REMINDER_INTERVALS.km) {
      shouldRemind = true;
      reminderMessage = `Você já rodou ${REMINDER_INTERVALS.km.toLocaleString()} km desde a última revisão. Hora de verificar seu veículo!`;
      setSettings(prev => ({ ...prev, lastKmReminder: lastKm }));
    }

    // Verificar por tempo
    if (lastMaintenanceDate) {
      const lastDate = new Date(lastMaintenanceDate);
      const daysDiff = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff >= REMINDER_INTERVALS.days) {
        const lastReminderDate = new Date(settings.lastDateReminder);
        const daysSinceReminder = Math.floor((now.getTime() - lastReminderDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceReminder >= 7) { // Não enviar mais de uma vez por semana
          shouldRemind = true;
          reminderMessage = `Já se passaram ${daysDiff} dias desde sua última manutenção. Agende uma revisão!`;
          setSettings(prev => ({ ...prev, lastDateReminder: now.toISOString() }));
        }
      }
    }

    if (shouldRemind && reminderMessage) {
      new Notification('🔧 Lembrete de Manutenção', {
        body: reminderMessage,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        requireInteraction: true,
      });
    }
  }, [settings, permission]);

  const sendTestNotification = useCallback(() => {
    if (permission !== 'granted') {
      toast.error('Permissão de notificação não concedida');
      return;
    }

    new Notification('🔧 Lembrete de Teste', {
      body: 'Esta é uma notificação de teste do Kojak Auto-Log!',
      icon: '/favicon.ico',
      badge: '/favicon.ico',
    });
  }, [permission]);

  return {
    permission,
    enabled: settings.enabled,
    requestPermission,
    disableNotifications,
    checkMaintenanceReminder,
    sendTestNotification,
    isSupported: 'Notification' in window,
  };
}
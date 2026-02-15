import { useMemo, useState } from 'react';
import { 
  Bell, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  Settings,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { AppLayout } from '@/components/navigation/AppLayout';
import { cn } from '@/lib/utils';
import { useDbEvents } from '@/hooks/useDbEvents';
import { useDbGoals } from '@/hooks/useDbGoals';
import { formatCurrency } from '@/lib/formatters';
import { Loader2 } from 'lucide-react';

interface Alert {
  id: string;
  type: 'payment_due' | 'payment_overdue' | 'goal_progress';
  title: string;
  description: string;
  value?: number;
  read: boolean;
}

const alertTypeConfig = {
  payment_due: { icon: Clock, color: 'text-amber-600 bg-amber-500/10' },
  payment_overdue: { icon: AlertCircle, color: 'text-destructive bg-destructive/10' },
  goal_progress: { icon: CheckCircle2, color: 'text-primary bg-primary/10' },
};

const alertSettings = [
  { id: 'payment_due', label: 'Pagamentos próximos do vencimento', enabled: true },
  { id: 'payment_overdue', label: 'Pagamentos atrasados', enabled: true },
  { id: 'goal_progress', label: 'Progresso de metas', enabled: true },
];

export default function AlertsPage() {
  const { events, pendingPayments, currentMonthEvents, isLoading: eventsLoading } = useDbEvents();
  const { currentMonthGoal, isLoading: goalsLoading } = useDbGoals();
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [readIds, setReadIds] = useState<string[]>([]);
  const [settings, setSettings] = useState(alertSettings);
  const [showSettings, setShowSettings] = useState(false);

  const receivedThisMonth = useMemo(() => {
    return currentMonthEvents
      .filter(e => e.paidAt)
      .reduce((sum, e) => sum + e.netValue, 0);
  }, [currentMonthEvents]);

  const goalAmount = currentMonthGoal?.targetAmount || 0;
  const goalProgress = goalAmount > 0 ? Math.min(Math.round((receivedThisMonth / goalAmount) * 100), 100) : 0;

  // Compute overdue from events
  const overdueEvents = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return (events || []).filter(e => !e.paidAt && e.paymentDate && new Date(e.paymentDate) < today);
  }, [events]);

  // Build alerts from real data
  const alerts = useMemo<Alert[]>(() => {
    const result: Alert[] = [];
    const today = new Date();
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);

    // Overdue payments
    overdueEvents.forEach(e => {
      result.push({
        id: `overdue-${e.id}`,
        type: 'payment_overdue',
        title: 'Pagamento atrasado',
        description: `${e.type === 'consultation' ? 'Consulta' : 'Plantão'}${e.locationName ? ` - ${e.locationName}` : ''} está atrasado`,
        value: e.netValue,
        read: false,
      });
    });

    // Upcoming due payments (next 3 days)
    pendingPayments.forEach(e => {
      if (e.paymentDate) {
        const dueDate = new Date(e.paymentDate);
        if (dueDate <= threeDaysFromNow && dueDate >= today) {
          result.push({
            id: `due-${e.id}`,
            type: 'payment_due',
            title: 'Pagamento próximo do vencimento',
            description: `${e.type === 'consultation' ? 'Consulta' : 'Plantão'}${e.locationName ? ` - ${e.locationName}` : ''} vence em breve`,
            value: e.netValue,
            read: false,
          });
        }
      }
    });

    // Goal progress
    if (goalAmount > 0 && goalProgress >= 80) {
      result.push({
        id: 'goal-progress',
        type: 'goal_progress',
        title: goalProgress >= 100 ? 'Meta atingida! 🎉' : 'Meta quase atingida!',
        description: `Você atingiu ${goalProgress}% da sua meta mensal`,
        read: false,
      });
    }

    return result.filter(a => !dismissed.includes(a.id));
  }, [overdueEvents, pendingPayments, goalAmount, goalProgress, dismissed]);

  const unreadCount = alerts.filter(a => !readIds.includes(a.id)).length;

  const isLoading = eventsLoading || goalsLoading;

  if (isLoading) {
    return (
      <AppLayout title="Alertas">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Alertas">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Alertas Inteligentes</h1>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} não lidos` : 'Todos os alertas lidos'}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowSettings(!showSettings)}>
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {showSettings && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Configurações de alertas</CardTitle>
              <CardDescription>Escolha quais alertas deseja receber</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings.map(setting => (
                <div key={setting.id} className="flex items-center justify-between">
                  <span className="text-sm">{setting.label}</span>
                  <Switch
                    checked={setting.enabled}
                    onCheckedChange={() => setSettings(prev => prev.map(s => s.id === setting.id ? { ...s, enabled: !s.enabled } : s))}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="space-y-3">
          {alerts.map(alert => {
            const config = alertTypeConfig[alert.type];
            const Icon = config?.icon || Bell;
            const isRead = readIds.includes(alert.id);

            return (
              <Card 
                key={alert.id}
                className={cn("transition-all", !isRead && "border-primary/50 bg-primary/5")}
                onClick={() => setReadIds(prev => prev.includes(alert.id) ? prev : [...prev, alert.id])}
              >
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className={cn("w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0", config?.color)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-foreground">{alert.title}</h4>
                        <Button 
                          variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground"
                          onClick={(e) => { e.stopPropagation(); setDismissed(prev => [...prev, alert.id]); }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                      {alert.value && (
                        <p className="text-sm font-semibold text-foreground mt-2">{formatCurrency(alert.value)}</p>
                      )}
                    </div>
                  </div>
                  {!isRead && <Badge className="mt-2 bg-primary text-primary-foreground">Novo</Badge>}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {alerts.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="w-12 h-12 text-muted-foreground mb-4" />
              <CardTitle className="text-lg mb-2">Nenhum alerta</CardTitle>
              <CardDescription className="text-center">Você não tem alertas no momento</CardDescription>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

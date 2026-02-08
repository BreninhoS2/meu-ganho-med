import { useState } from 'react';
import { 
  Bell, 
  AlertCircle, 
  CheckCircle2, 
  Clock,
  Calendar,
  DollarSign,
  Settings,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { AppLayout } from '@/components/navigation/AppLayout';
import { cn } from '@/lib/utils';

// Mock alerts
const mockAlerts = [
  {
    id: '1',
    type: 'payment_due',
    title: 'Pagamento próximo do vencimento',
    description: 'Plantão do Hospital São Lucas vence em 3 dias',
    value: 1200,
    date: new Date(2026, 1, 11),
    read: false,
  },
  {
    id: '2',
    type: 'payment_overdue',
    title: 'Pagamento atrasado',
    description: 'Plantão da UPA Centro está 5 dias atrasado',
    value: 2000,
    date: new Date(2026, 1, 3),
    read: false,
  },
  {
    id: '3',
    type: 'goal_progress',
    title: 'Meta quase atingida!',
    description: 'Você atingiu 90% da sua meta mensal',
    date: new Date(2026, 1, 8),
    read: true,
  },
];

const alertTypeConfig = {
  payment_due: {
    icon: Clock,
    color: 'text-amber-600 bg-amber-500/10',
  },
  payment_overdue: {
    icon: AlertCircle,
    color: 'text-destructive bg-destructive/10',
  },
  goal_progress: {
    icon: CheckCircle2,
    color: 'text-primary bg-primary/10',
  },
};

const alertSettings = [
  { id: 'payment_due', label: 'Pagamentos próximos do vencimento', enabled: true },
  { id: 'payment_overdue', label: 'Pagamentos atrasados', enabled: true },
  { id: 'goal_progress', label: 'Progresso de metas', enabled: true },
  { id: 'weekly_summary', label: 'Resumo semanal', enabled: false },
];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(mockAlerts);
  const [settings, setSettings] = useState(alertSettings);
  const [showSettings, setShowSettings] = useState(false);

  const unreadCount = alerts.filter(a => !a.read).length;

  const markAsRead = (id: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === id ? { ...a, read: true } : a
    ));
  };

  const deleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const toggleSetting = (id: string) => {
    setSettings(prev => prev.map(s =>
      s.id === id ? { ...s, enabled: !s.enabled } : s
    ));
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <AppLayout title="Alertas">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-foreground">Alertas Inteligentes</h1>
            <p className="text-sm text-muted-foreground">
              {unreadCount > 0 ? `${unreadCount} não lidos` : 'Todos os alertas lidos'}
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setShowSettings(!showSettings)}
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        {/* Settings panel */}
        {showSettings && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Configurações de alertas</CardTitle>
              <CardDescription>
                Escolha quais alertas deseja receber
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {settings.map(setting => (
                <div key={setting.id} className="flex items-center justify-between">
                  <span className="text-sm">{setting.label}</span>
                  <Switch
                    checked={setting.enabled}
                    onCheckedChange={() => toggleSetting(setting.id)}
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Alerts list */}
        <div className="space-y-3">
          {alerts.map(alert => {
            const config = alertTypeConfig[alert.type as keyof typeof alertTypeConfig];
            const Icon = config?.icon || Bell;

            return (
              <Card 
                key={alert.id}
                className={cn(
                  "transition-all",
                  !alert.read && "border-primary/50 bg-primary/5"
                )}
                onClick={() => markAsRead(alert.id)}
              >
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                      config?.color
                    )}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-foreground">{alert.title}</h4>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-6 w-6 text-muted-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteAlert(alert.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {alert.description}
                      </p>
                      {alert.value && (
                        <p className="text-sm font-semibold text-foreground mt-2">
                          {formatCurrency(alert.value)}
                        </p>
                      )}
                    </div>
                  </div>
                  {!alert.read && (
                    <Badge className="mt-2 bg-primary text-primary-foreground">
                      Novo
                    </Badge>
                  )}
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
              <CardDescription className="text-center">
                Você não tem alertas no momento
              </CardDescription>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

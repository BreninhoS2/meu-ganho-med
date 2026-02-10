import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  CheckCircle, Clock, TrendingUp, Calendar, Filter, Loader2 
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppLayout } from '@/components/navigation/AppLayout';
import { useDbEvents } from '@/hooks/useDbEvents';
import { useDbLocations } from '@/hooks/useDbLocations';
import { formatCurrency, formatDate } from '@/lib/formatters';
import { cn } from '@/lib/utils';

type PeriodFilter = 'month' | '7days' | '30days' | 'all';

export default function ReceivablesPage() {
  const { events, isLoading: eventsLoading } = useDbEvents();
  const { locationMap, isLoading: locationsLoading } = useDbLocations();
  const [period, setPeriod] = useState<PeriodFilter>('month');

  const isLoading = eventsLoading || locationsLoading;

  // All paid events
  const paidEvents = useMemo(() => {
    return events.filter(e => !!e.paidAt);
  }, [events]);

  // Filter by period
  const filteredEvents = useMemo(() => {
    const now = new Date();
    return paidEvents.filter(e => {
      const paidDate = new Date(e.paidAt!);
      switch (period) {
        case '7days': {
          const diff = (now.getTime() - paidDate.getTime()) / (1000 * 60 * 60 * 24);
          return diff >= 0 && diff <= 7;
        }
        case '30days': {
          const diff = (now.getTime() - paidDate.getTime()) / (1000 * 60 * 60 * 24);
          return diff >= 0 && diff <= 30;
        }
        case 'month': {
          return paidDate.getMonth() === now.getMonth() && paidDate.getFullYear() === now.getFullYear();
        }
        default:
          return true;
      }
    }).sort((a, b) => new Date(b.paidAt!).getTime() - new Date(a.paidAt!).getTime());
  }, [paidEvents, period]);

  const totalFiltered = useMemo(() => {
    return filteredEvents.reduce((sum, e) => sum + e.netValue, 0);
  }, [filteredEvents]);

  // Current month total (always shown in summary)
  const currentMonthTotal = useMemo(() => {
    const now = new Date();
    return paidEvents
      .filter(e => {
        const d = new Date(e.paidAt!);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
      })
      .reduce((sum, e) => sum + e.netValue, 0);
  }, [paidEvents]);

  const last7DaysTotal = useMemo(() => {
    const now = new Date();
    return paidEvents
      .filter(e => {
        const diff = (now.getTime() - new Date(e.paidAt!).getTime()) / (1000 * 60 * 60 * 24);
        return diff >= 0 && diff <= 7;
      })
      .reduce((sum, e) => sum + e.netValue, 0);
  }, [paidEvents]);

  const periodLabel: Record<PeriodFilter, string> = {
    month: 'Este mês',
    '7days': 'Últimos 7 dias',
    '30days': 'Últimos 30 dias',
    all: 'Todos',
  };

  if (isLoading) {
    return (
      <AppLayout title="Recebimentos">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Recebimentos">
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-foreground">Recebimentos</h1>
          <p className="text-sm text-muted-foreground">Histórico de pagamentos recebidos</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="bg-gradient-to-br from-primary/5 to-emerald-500/5 border-primary/20">
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs">Este mês</span>
              </div>
              <p className="text-lg font-bold text-primary">{formatCurrency(currentMonthTotal)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs">Últimos 7 dias</span>
              </div>
              <p className="text-lg font-bold text-foreground">{formatCurrency(last7DaysTotal)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Period filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={period} onValueChange={(v) => setPeriod(v as PeriodFilter)}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="month">Este mês</SelectItem>
              <SelectItem value="7days">Últimos 7 dias</SelectItem>
              <SelectItem value="30days">Últimos 30 dias</SelectItem>
              <SelectItem value="all">Todos</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground ml-auto">
            {filteredEvents.length} recebimento{filteredEvents.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Total for filter */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{periodLabel[period]}</p>
                <p className="text-2xl font-bold text-primary">{formatCurrency(totalFiltered)}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>

        {/* List */}
        <div className="space-y-2">
          {filteredEvents.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="font-semibold text-foreground mb-1">Nenhum recebimento</p>
                <p className="text-sm text-muted-foreground text-center">
                  Nenhum pagamento recebido neste período.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredEvents.map(event => {
              const locationName = event.locationId
                ? locationMap.get(event.locationId)
                : event.locationName;

              return (
                <Card key={event.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-foreground truncate">
                            {event.type === 'shift'
                              ? `Plantão ${(event as any).duration || ''}`
                              : 'Consulta'}
                          </p>
                          <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                            Pago
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {locationName && `${locationName} • `}
                          {formatDate(event.date)}
                        </p>
                        {event.paidAt && (
                          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Pago em {format(new Date(event.paidAt), "dd/MM/yyyy", { locale: ptBR })}
                          </p>
                        )}
                      </div>
                      <p className="text-lg font-bold text-primary ml-3">
                        {formatCurrency(event.netValue)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </AppLayout>
  );
}

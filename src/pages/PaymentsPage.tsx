import { useMemo, useState } from 'react';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Receipt, CheckCircle2, Clock, AlertCircle, Undo2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppLayout } from '@/components/navigation/AppLayout';
import { cn } from '@/lib/utils';
import { useDbEvents } from '@/hooks/useDbEvents';
import { useDbLocations } from '@/hooks/useDbLocations';
import { MedicalEventWithCalculations } from '@/types';

type PaymentView = {
  id: string;
  title: string;
  eventDate: string;
  dueDate: string;
  value: number;
  status: 'pending' | 'paid' | 'overdue';
  paidAt: string | null;
};

/** Single source of truth for payment status */
function getPaymentStatus(isPaid: boolean, dueDateStr: string): 'pending' | 'paid' | 'overdue' {
  if (isPaid) return 'paid';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDateStr + 'T00:00:00');
  return due < today ? 'overdue' : 'pending';
}

const statusConfig = {
  pending: {
    label: 'Pendente',
    icon: Clock,
    color: 'text-amber-600 bg-amber-500/10',
  },
  paid: {
    label: 'Pago',
    icon: CheckCircle2,
    color: 'text-primary bg-primary/10',
  },
  overdue: {
    label: 'Atrasado',
    icon: AlertCircle,
    color: 'text-destructive bg-destructive/10',
  },
};

const formatCurrency = (value: number) =>
  value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const { events, updateEvent, isLoading: eventsLoading } = useDbEvents();
  const { locations, isLoading: locationsLoading } = useDbLocations();

  const isLoading = eventsLoading || locationsLoading;

  // Build location deadline map
  const locationDeadlineMap = useMemo(() => {
    const map = new Map<string, { name: string; deadlineDays: number }>();
    locations.forEach((loc) =>
      map.set(loc.id, { name: loc.name, deadlineDays: loc.paymentDeadlineDays })
    );
    return map;
  }, [locations]);

  // Transform events into payment views
  const payments: PaymentView[] = useMemo(() => {
    return events
      .filter((e) => e.status !== 'cancelled' && e.grossValue > 0)
      .map((event: MedicalEventWithCalculations) => {
        const locInfo = event.locationId ? locationDeadlineMap.get(event.locationId) : null;
        const deadlineDays = locInfo?.deadlineDays ?? 30;
        const locationName = locInfo?.name || event.locationName || '';

        // Build title
        let title = '';
        if (event.type === 'shift') {
          const dur = (event as any).duration || '12h';
          title = `Plantão ${dur}`;
        } else {
          title = 'Consulta';
        }
        if (locationName) title += ` – ${locationName}`;

        // Due date = event date + deadline days (never overridden by paymentDate)
        const eventDateObj = new Date(event.date + 'T12:00:00');
        const dueDateObj = addDays(eventDateObj, deadlineDays);
        const dueDate = format(dueDateObj, 'yyyy-MM-dd');

        const isPaid = event.paymentStatus === 'paid';
        const status = getPaymentStatus(isPaid, dueDate);

        return {
          id: event.id,
          title,
          eventDate: event.date,
          dueDate,
          value: event.netValue,
          status,
          paidAt: isPaid ? (event.paymentDate || null) : null,
        };
      });
  }, [events, locationDeadlineMap]);

  // Memoized counts
  const counts = useMemo(() => ({
    all: payments.length,
    pending: payments.filter((p) => p.status === 'pending').length,
    paid: payments.filter((p) => p.status === 'paid').length,
    overdue: payments.filter((p) => p.status === 'overdue').length,
  }), [payments]);

  // Filtered + sorted per tab
  const filteredPayments = useMemo(() => {
    const list = activeTab === 'all' ? [...payments] : payments.filter((p) => p.status === activeTab);
    if (activeTab === 'paid') {
      return list.sort((a, b) => (b.paidAt || '').localeCompare(a.paidAt || ''));
    }
    if (activeTab === 'overdue' || activeTab === 'pending') {
      return list.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    }
    return list.sort((a, b) => b.dueDate.localeCompare(a.dueDate));
  }, [payments, activeTab]);

  const totalPending = useMemo(
    () =>
      payments
        .filter((p) => p.status === 'pending' || p.status === 'overdue')
        .reduce((sum, p) => sum + p.value, 0),
    [payments]
  );

  const totalPaid = useMemo(
    () => payments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + p.value, 0),
    [payments]
  );

  const handleMarkPaid = async (id: string) => {
    await updateEvent(id, { paymentStatus: 'paid' });
  };

  const handleUnmarkPaid = async (id: string) => {
    await updateEvent(id, { paymentStatus: 'pending' });
  };

  if (isLoading) {
    return (
      <AppLayout title="Pagamentos">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Pagamentos">
      <div className="space-y-4">
        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs">A receber</span>
              </div>
              <p className="text-xl font-bold text-foreground">
                {formatCurrency(totalPending)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs">Recebido</span>
              </div>
              <p className="text-xl font-bold text-primary">
                {formatCurrency(totalPaid)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filter tabs with colored badges */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="all" className="gap-1.5">
              Todos
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-muted text-muted-foreground">
                {counts.all}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-1.5">
              Pend.
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-amber-500/20 text-amber-600">
                {counts.pending}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="paid" className="gap-1.5">
              Pagos
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-emerald-500/20 text-emerald-600">
                {counts.paid}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="overdue" className="gap-1.5">
              Atras.
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 bg-destructive/20 text-destructive">
                {counts.overdue}
              </Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Payments list */}
        <div className="space-y-3">
          {filteredPayments.map((payment) => {
            const config = statusConfig[payment.status];
            const StatusIcon = config.icon;

            return (
              <Card key={payment.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-foreground line-clamp-1">
                        {payment.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                        <span>
                          Evento: {format(new Date(payment.eventDate + 'T12:00:00'), 'dd/MM', { locale: ptBR })}
                        </span>
                        <span>•</span>
                        <span>
                          Venc.: {format(new Date(payment.dueDate + 'T12:00:00'), 'dd/MM', { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        {formatCurrency(payment.value)}
                      </p>
                      <Badge
                        variant="secondary"
                        className={cn('mt-1 text-xs', config.color)}
                      >
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {config.label}
                      </Badge>
                    </div>
                  </div>
                  {payment.status !== 'paid' && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => handleMarkPaid(payment.id)}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Marcar como pago
                      </Button>
                    </div>
                  )}
                  {payment.status === 'paid' && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-muted-foreground"
                        onClick={() => handleUnmarkPaid(payment.id)}
                      >
                        <Undo2 className="w-4 h-4 mr-2" />
                        Desmarcar pagamento
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {filteredPayments.length === 0 && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Receipt className="w-12 h-12 text-muted-foreground mb-4" />
              <CardTitle className="text-lg mb-2">Nenhum pagamento</CardTitle>
              <CardDescription className="text-center">
                {activeTab === 'all'
                  ? 'Adicione eventos na Agenda para ver pagamentos aqui'
                  : `Nenhum pagamento com status "${statusConfig[activeTab as keyof typeof statusConfig]?.label}"`}
              </CardDescription>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

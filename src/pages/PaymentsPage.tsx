import { useState } from 'react';
import { format, addDays, isBefore, isAfter } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Receipt, CheckCircle2, Clock, AlertCircle, Filter, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppLayout } from '@/components/navigation/AppLayout';
import { cn } from '@/lib/utils';

// Mock data for payments
const mockPayments = [
  {
    id: '1',
    title: 'Plantão 12h - Hospital São Lucas',
    date: new Date(2026, 1, 5),
    paymentDate: new Date(2026, 2, 5),
    value: 1200,
    status: 'pending',
  },
  {
    id: '2',
    title: 'Consulta - Clínica Vida',
    date: new Date(2026, 1, 3),
    paymentDate: new Date(2026, 1, 10),
    value: 350,
    status: 'paid',
  },
  {
    id: '3',
    title: 'Plantão 24h - UPA Centro',
    date: new Date(2026, 1, 1),
    paymentDate: new Date(2026, 1, 15),
    value: 2000,
    status: 'overdue',
  },
  {
    id: '4',
    title: 'Plantão 12h - Hospital São Lucas',
    date: new Date(2026, 1, 10),
    paymentDate: new Date(2026, 2, 10),
    value: 1200,
    status: 'pending',
  },
];

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

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [payments] = useState(mockPayments);

  const filteredPayments = payments.filter(payment => {
    if (activeTab === 'all') return true;
    return payment.status === activeTab;
  });

  const totalPending = payments
    .filter(p => p.status === 'pending' || p.status === 'overdue')
    .reduce((sum, p) => sum + p.value, 0);

  const totalPaid = payments
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + p.value, 0);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

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

        {/* Filter tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="pending">Pendentes</TabsTrigger>
            <TabsTrigger value="paid">Pagos</TabsTrigger>
            <TabsTrigger value="overdue">Atrasados</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Payments list */}
        <div className="space-y-3">
          {filteredPayments.map(payment => {
            const config = statusConfig[payment.status as keyof typeof statusConfig];
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
                          Evento: {format(payment.date, "dd/MM", { locale: ptBR })}
                        </span>
                        <span>•</span>
                        <span>
                          Venc.: {format(payment.paymentDate, "dd/MM", { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">
                        {formatCurrency(payment.value)}
                      </p>
                      <Badge 
                        variant="secondary" 
                        className={cn("mt-1 text-xs", config.color)}
                      >
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {config.label}
                      </Badge>
                    </div>
                  </div>
                  {payment.status === 'pending' && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <Button variant="outline" size="sm" className="w-full">
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Marcar como pago
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
                  ? 'Nenhum pagamento registrado ainda'
                  : `Nenhum pagamento com status "${statusConfig[activeTab as keyof typeof statusConfig]?.label}"`
                }
              </CardDescription>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

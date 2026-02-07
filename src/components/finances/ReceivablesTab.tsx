import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MedicalEventWithCalculations } from '@/types';
import { formatCurrency, formatDate, getDaysUntil } from '@/lib/formatters';
import { CheckCircle, AlertCircle, Clock, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ReceivablesTabProps {
  pendingPayments: MedicalEventWithCalculations[];
  locationMap: Map<string, string>;
  onMarkPaid: (id: string) => void;
  onEdit?: (event: MedicalEventWithCalculations) => void;
}

export function ReceivablesTab({ pendingPayments, locationMap, onMarkPaid, onEdit }: ReceivablesTabProps) {
  const next7Days = pendingPayments.filter(e => {
    if (!e.paymentDate) return false;
    const days = getDaysUntil(e.paymentDate);
    return days >= 0 && days <= 7;
  });
  
  const next30Days = pendingPayments.filter(e => {
    if (!e.paymentDate) return false;
    const days = getDaysUntil(e.paymentDate);
    return days >= 0 && days <= 30;
  });

  const totalPending = pendingPayments.reduce((sum, e) => sum + e.netValue, 0);
  const total7Days = next7Days.reduce((sum, e) => sum + e.netValue, 0);
  const total30Days = next30Days.reduce((sum, e) => sum + e.netValue, 0);

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs">Próximos 7 dias</span>
          </div>
          <p className="text-lg font-bold text-foreground">{formatCurrency(total7Days)}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground mb-1">
            <AlertCircle className="w-4 h-4" />
            <span className="text-xs">Próximos 30 dias</span>
          </div>
          <p className="text-lg font-bold text-foreground">{formatCurrency(total30Days)}</p>
        </Card>
      </div>

      {/* Total pending */}
      <Card className="p-4 bg-warning/10 border-warning/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Total pendente</p>
            <p className="text-2xl font-bold text-warning">{formatCurrency(totalPending)}</p>
          </div>
          <AlertCircle className="w-8 h-8 text-warning" />
        </div>
      </Card>

      {/* Pending list */}
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-muted-foreground uppercase">
          Pagamentos pendentes
        </h3>
        
        {pendingPayments.length === 0 ? (
          <Card className="p-6 text-center">
            <CheckCircle className="w-10 h-10 mx-auto text-success mb-2" />
            <p className="text-sm text-muted-foreground">
              Nenhum pagamento pendente!
            </p>
          </Card>
        ) : (
          <div className="space-y-2">
            {pendingPayments.map((event) => {
              const locationName = event.locationId 
                ? locationMap.get(event.locationId) 
                : event.locationName;
              const isOverdue = event.paymentDate && getDaysUntil(event.paymentDate) < 0;
              const daysUntil = event.paymentDate ? getDaysUntil(event.paymentDate) : null;

              return (
                <Card key={event.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">
                        {event.type === 'shift' ? `Plantão ${(event as any).duration}` : 'Consulta'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {locationName && `${locationName} • `}
                        {formatDate(event.date)}
                      </p>
                      {event.paymentDate && (
                        <p className={cn(
                          'text-xs mt-1',
                          isOverdue ? 'text-destructive' : 'text-muted-foreground'
                        )}>
                          {isOverdue 
                            ? `Atrasado há ${Math.abs(daysUntil!)} dias`
                            : daysUntil === 0 
                              ? 'Vence hoje' 
                              : `Vence em ${daysUntil} dias`
                          }
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-lg font-bold text-money">
                        {formatCurrency(event.netValue)}
                      </p>
                      {onEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          onClick={() => onEdit(event)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-success border-success hover:bg-success hover:text-success-foreground"
                        onClick={() => onMarkPaid(event.id)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Pago
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

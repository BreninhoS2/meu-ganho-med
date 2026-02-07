import { Card } from '@/components/ui/card';
import { MedicalEventWithCalculations } from '@/types';
import { formatCurrency, formatDate, getRelativeDayLabel } from '@/lib/formatters';
import { Clock, Stethoscope, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UpcomingEventsProps {
  events: MedicalEventWithCalculations[];
  locationMap: Map<string, string>;
}

export function UpcomingEvents({ events, locationMap }: UpcomingEventsProps) {
  if (events.length === 0) {
    return (
      <Card className="p-6 text-center">
        <Calendar className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">
          Nenhum evento nos próximos 7 dias
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {events.slice(0, 5).map((event) => {
        const locationName = event.locationId 
          ? locationMap.get(event.locationId) || event.locationName 
          : event.locationName;
        const relativeLabel = getRelativeDayLabel(event.date);
        const isShift = event.type === 'shift';

        return (
          <Card key={event.id} className="p-3">
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                isShift ? 'bg-primary/10' : 'bg-accent'
              )}>
                {isShift ? (
                  <Clock className="w-5 h-5 text-primary" />
                ) : (
                  <Stethoscope className="w-5 h-5 text-accent-foreground" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">
                    {isShift ? `Plantão ${(event as any).duration}` : 'Consulta'}
                  </span>
                  {relativeLabel && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground">
                      {relativeLabel}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {locationName ? `${locationName} • ` : ''}
                  {formatDate(event.date)}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm font-semibold text-money">
                  {formatCurrency(event.netValue)}
                </p>
              <p className={cn(
                  'text-xs',
                  event.paymentStatus === 'pending' 
                    ? 'text-warning' 
                    : 'text-muted-foreground'
                )}>
                  {event.paymentStatus === 'pending' ? 'Pendente' : 'Pago'}
                </p>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

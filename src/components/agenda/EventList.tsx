import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MedicalEventWithCalculations, MedicalEvent } from '@/types';
import { formatCurrency, formatFullDate, EVENT_STATUS_LABELS, PAYMENT_STATUS_LABELS } from '@/lib/formatters';
import { Clock, Stethoscope, Trash2, CheckCircle, Calendar, Pencil } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EventListProps {
  events: MedicalEventWithCalculations[];
  locationMap: Map<string, string>;
  onDelete: (id: string) => void;
  onMarkPaid: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Omit<MedicalEvent, 'type'>>) => void;
  onEdit?: (event: MedicalEventWithCalculations) => void;
}

export function EventList({ events, locationMap, onDelete, onMarkPaid, onEdit }: EventListProps) {
  if (events.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
        <h3 className="font-medium text-foreground mb-1">Nenhum evento encontrado</h3>
        <p className="text-sm text-muted-foreground">
          Adicione seu primeiro plantão ou consulta
        </p>
      </Card>
    );
  }

  // Group events by date
  const groupedEvents = events.reduce((acc, event) => {
    const date = event.date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {} as Record<string, MedicalEventWithCalculations[]>);

  return (
    <div className="space-y-4">
      {Object.entries(groupedEvents)
        .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
        .map(([date, dayEvents]) => (
          <div key={date}>
            <h3 className="text-xs font-medium text-muted-foreground uppercase mb-2">
              {formatFullDate(date)}
            </h3>
            <div className="space-y-2">
              {dayEvents.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  locationName={event.locationId ? locationMap.get(event.locationId) : event.locationName}
                  onDelete={() => onDelete(event.id)}
                  onMarkPaid={() => onMarkPaid(event.id)}
                  onEdit={onEdit ? () => onEdit(event) : undefined}
                />
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}

interface EventCardProps {
  event: MedicalEventWithCalculations;
  locationName?: string;
  onDelete: () => void;
  onMarkPaid: () => void;
  onEdit?: () => void;
}

function EventCard({ event, locationName, onDelete, onMarkPaid, onEdit }: EventCardProps) {
  const isShift = event.type === 'shift';
  const isPending = event.paymentStatus === 'pending';
  const isCancelled = event.status === 'cancelled';

  return (
    <Card className={cn('p-4', isCancelled && 'opacity-60')}>
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
          isShift ? 'bg-primary/10' : 'bg-accent'
        )}>
          {isShift ? (
            <Clock className="w-5 h-5 text-primary" />
          ) : (
            <Stethoscope className="w-5 h-5 text-accent-foreground" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-foreground">
              {isShift ? `Plantão ${(event as any).duration}` : 'Consulta'}
            </span>
            <span className={cn(
              'text-xs px-2 py-0.5 rounded-full',
              event.status === 'completed' ? 'bg-success/20 text-success' :
              event.status === 'cancelled' ? 'bg-destructive/20 text-destructive' :
              'bg-secondary text-secondary-foreground'
            )}>
              {EVENT_STATUS_LABELS[event.status]}
            </span>
          </div>

          {locationName && (
            <p className="text-sm text-muted-foreground mb-1">{locationName}</p>
          )}

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{event.hours}h</span>
            <span>{formatCurrency(event.hourlyRate)}/h</span>
            <span className={cn(isPending && 'text-warning font-medium')}>
              {PAYMENT_STATUS_LABELS[event.paymentStatus]}
            </span>
          </div>
        </div>

        {/* Value and actions */}
        <div className="text-right flex flex-col items-end gap-2">
          <div>
            <p className="font-semibold text-money">{formatCurrency(event.netValue)}</p>
            {event.discount > 0 && (
              <p className="text-xs text-muted-foreground line-through">
                {formatCurrency(event.grossValue)}
              </p>
            )}
          </div>

          <div className="flex gap-1">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={onEdit}
              >
                <Pencil className="w-4 h-4" />
              </Button>
            )}
            {isPending && event.status === 'completed' && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-success hover:text-success"
                onClick={onMarkPaid}
              >
                <CheckCircle className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

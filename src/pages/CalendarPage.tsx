import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AppLayout } from '@/components/navigation/AppLayout';
import { cn } from '@/lib/utils';
import { useDbEvents } from '@/hooks/useDbEvents';
import { Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/formatters';
import { useNavigate } from 'react-router-dom';

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { events, isLoading } = useDbEvents();
  const navigate = useNavigate();

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDayOfWeek = monthStart.getDay();
  const emptyDays = Array(startDayOfWeek).fill(null);

  // Build event lookup from real data
  const eventsByDate = useMemo(() => {
    const map = new Map<string, typeof events>();
    events.forEach(event => {
      const key = event.date; // format: YYYY-MM-DD
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(event);
    });
    return map;
  }, [events]);

  const getEventsForDay = (date: Date) => {
    const key = format(date, 'yyyy-MM-dd');
    return eventsByDate.get(key) || [];
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const selectedEvents = selectedDate ? getEventsForDay(selectedDate) : [];

  if (isLoading) {
    return (
      <AppLayout title="Calendário">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Calendário">
      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Button variant="ghost" size="icon" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <CardTitle className="text-lg capitalize">
                {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => navigateMonth('next')}>
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {emptyDays.map((_, index) => (
                <div key={`empty-${index}`} className="aspect-square" />
              ))}
              {days.map(day => {
                const dayEvents = getEventsForDay(day);
                const hasEvents = dayEvents.length > 0;
                const isSelected = selectedDate && isSameDay(day, selectedDate);

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "aspect-square rounded-lg flex flex-col items-center justify-center text-sm transition-colors relative",
                      !isSameMonth(day, currentDate) && "text-muted-foreground/50",
                      isToday(day) && "bg-primary text-primary-foreground font-bold",
                      isSelected && !isToday(day) && "bg-primary/10 border-2 border-primary",
                      !isToday(day) && !isSelected && "hover:bg-muted"
                    )}
                  >
                    {format(day, 'd')}
                    {hasEvents && (
                      <div className="absolute bottom-1 flex gap-0.5">
                        {dayEvents.slice(0, 3).map((event, i) => (
                          <div
                            key={i}
                            className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              event.type === 'shift' ? "bg-primary" : "bg-amber-500"
                            )}
                          />
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {selectedDate && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">
                {format(selectedDate, "d 'de' MMMM", { locale: ptBR })}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedEvents.length > 0 ? (
                <div className="space-y-2">
                  {selectedEvents.map(event => (
                    <div
                      key={event.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-2 h-8 rounded-full",
                            event.type === 'shift' ? "bg-primary" : "bg-amber-500"
                          )}
                        />
                        <div>
                          <p className="font-medium">
                            {event.type === 'shift' ? 'Plantão' : 'Consulta'}
                            {event.locationName ? ` - ${event.locationName}` : ''}
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            {event.type === 'shift' ? 'Plantão' : 'Consulta'}
                          </Badge>
                        </div>
                      </div>
                      <p className="font-semibold text-primary">
                        {formatCurrency(event.netValue)}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum evento neste dia
                </p>
              )}
              <Button
                className="w-full mt-4"
                variant="outline"
                onClick={() => navigate('/agenda')}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar evento
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}

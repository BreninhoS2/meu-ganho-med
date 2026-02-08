import { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AppLayout } from '@/components/navigation/AppLayout';
import { cn } from '@/lib/utils';

// Mock data for events
const mockEvents = [
  { id: '1', date: new Date(2026, 1, 10), type: 'plantao', title: 'Plantão 12h', value: 1200 },
  { id: '2', date: new Date(2026, 1, 15), type: 'consulta', title: 'Consulta', value: 350 },
  { id: '3', date: new Date(2026, 1, 20), type: 'plantao', title: 'Plantão 24h', value: 2400 },
  { id: '4', date: new Date(2026, 1, 8), type: 'plantao', title: 'Plantão 12h', value: 1200 },
];

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get first day of week offset
  const startDayOfWeek = monthStart.getDay();
  const emptyDays = Array(startDayOfWeek).fill(null);

  const getEventsForDay = (date: Date) => {
    return mockEvents.filter(event => isSameDay(event.date, date));
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

  return (
    <AppLayout title="Calendário">
      <div className="space-y-4">
        {/* Month navigation */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <CardTitle className="text-lg capitalize">
                {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Weekday headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-muted-foreground py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
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
                              event.type === 'plantao' ? "bg-primary" : "bg-amber-500"
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

        {/* Selected day events */}
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
                            event.type === 'plantao' ? "bg-primary" : "bg-amber-500"
                          )}
                        />
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <Badge variant="secondary" className="text-xs">
                            {event.type === 'plantao' ? 'Plantão' : 'Consulta'}
                          </Badge>
                        </div>
                      </div>
                      <p className="font-semibold text-primary">
                        R$ {event.value.toLocaleString('pt-BR')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Nenhum evento neste dia
                </p>
              )}
              <Button className="w-full mt-4" variant="outline">
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

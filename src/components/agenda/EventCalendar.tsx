import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { MedicalEventWithCalculations } from '@/types';
import { cn } from '@/lib/utils';

interface EventCalendarProps {
  events: MedicalEventWithCalculations[];
  selectedDate: string | null;
  onSelectDate: (date: string | null) => void;
}

const WEEKDAYS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS_PT = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export function EventCalendar({ events, selectedDate, onSelectDate }: EventCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return { month: now.getMonth(), year: now.getFullYear() };
  });

  // Get events by date for quick lookup
  const eventsByDate = events.reduce((acc, event) => {
    const date = event.date;
    if (!acc[date]) {
      acc[date] = { shifts: 0, consultations: 0 };
    }
    if (event.type === 'shift') {
      acc[date].shifts++;
    } else {
      acc[date].consultations++;
    }
    return acc;
  }, {} as Record<string, { shifts: number; consultations: number }>);

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(prev => {
      if (prev.month === 0) {
        return { month: 11, year: prev.year - 1 };
      }
      return { month: prev.month - 1, year: prev.year };
    });
  };

  const goToNextMonth = () => {
    setCurrentMonth(prev => {
      if (prev.month === 11) {
        return { month: 0, year: prev.year + 1 };
      }
      return { month: prev.month + 1, year: prev.year };
    });
  };

  const goToToday = () => {
    const now = new Date();
    setCurrentMonth({ month: now.getMonth(), year: now.getFullYear() });
    onSelectDate(now.toISOString().split('T')[0]);
  };

  const daysInMonth = getDaysInMonth(currentMonth.month, currentMonth.year);
  const firstDay = getFirstDayOfMonth(currentMonth.month, currentMonth.year);
  const today = new Date().toISOString().split('T')[0];

  const days: (number | null)[] = [];
  // Add empty cells for days before the first of the month
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }
  // Add days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const formatDateKey = (day: number) => {
    const month = String(currentMonth.month + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${currentMonth.year}-${month}-${dayStr}`;
  };

  const handleDayClick = (day: number) => {
    const dateKey = formatDateKey(day);
    if (selectedDate === dateKey) {
      onSelectDate(null); // Deselect
    } else {
      onSelectDate(dateKey);
    }
  };

  return (
    <Card className="p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={goToPreviousMonth}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="text-center">
          <h3 className="font-semibold text-foreground">
            {MONTHS_PT[currentMonth.month]} {currentMonth.year}
          </h3>
          <button
            onClick={goToToday}
            className="text-xs text-primary hover:underline"
          >
            Hoje
          </button>
        </div>
        <Button variant="ghost" size="icon" onClick={goToNextMonth}>
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS_PT.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-muted-foreground py-1"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const dateKey = formatDateKey(day);
          const dayEvents = eventsByDate[dateKey];
          const isToday = dateKey === today;
          const isSelected = dateKey === selectedDate;
          const hasEvents = dayEvents && (dayEvents.shifts > 0 || dayEvents.consultations > 0);

          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              className={cn(
                'aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all',
                isSelected && 'bg-primary text-primary-foreground',
                isToday && !isSelected && 'bg-accent',
                !isSelected && !isToday && 'hover:bg-secondary',
              )}
            >
              <span className={cn(
                'text-sm font-medium',
                isSelected && 'text-primary-foreground',
                !isSelected && isToday && 'text-accent-foreground',
                !isSelected && !isToday && 'text-foreground'
              )}>
                {day}
              </span>
              
              {/* Event indicators */}
              {hasEvents && (
                <div className="flex gap-0.5 mt-0.5">
                  {dayEvents.shifts > 0 && (
                    <div className={cn(
                      'w-1.5 h-1.5 rounded-full',
                      isSelected ? 'bg-primary-foreground' : 'bg-primary'
                    )} />
                  )}
                  {dayEvents.consultations > 0 && (
                    <div className={cn(
                      'w-1.5 h-1.5 rounded-full',
                      isSelected ? 'bg-primary-foreground/70' : 'bg-accent-foreground'
                    )} />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-border">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-primary" />
          <span>Plantão</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <div className="w-2 h-2 rounded-full bg-accent-foreground" />
          <span>Consulta</span>
        </div>
      </div>
    </Card>
  );
}

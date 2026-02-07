import { ShiftWithCalculations } from '@/types/shift';
import { formatCurrency, formatCurrencyDetailed, formatFullDate } from '@/lib/formatters';
import { Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ShiftCardProps {
  shift: ShiftWithCalculations;
  onDelete: (id: string) => void;
}

export function ShiftCard({ shift, onDelete }: ShiftCardProps) {
  const hours = shift.type === '12h' ? 12 : 24;

  return (
    <div className="card-elevated rounded-xl p-4 animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        {/* Left: Date and Type */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-secondary">
            <span className="text-xs text-muted-foreground uppercase">
              {formatFullDate(shift.date).split(' ')[0]}
            </span>
            <span className="text-lg font-bold text-foreground">
              {new Date(shift.date + 'T12:00:00').getDate()}
            </span>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                  shift.type === '12h' ? 'badge-12h' : 'badge-24h'
                }`}
              >
                {shift.type}
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {hours}h
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              {formatCurrencyDetailed(shift.hourlyRate)}/hora
            </p>
          </div>
        </div>

        {/* Right: Values */}
        <div className="text-right">
          <p className="money-display text-lg text-foreground">
            {formatCurrency(shift.netValue)}
          </p>
          {shift.discount > 0 && (
            <p className="text-xs text-muted-foreground line-through">
              {formatCurrency(shift.grossValue)}
            </p>
          )}
        </div>
      </div>

      {/* Delete Action */}
      <div className="mt-3 pt-3 border-t border-border/50 flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive h-8 px-2"
          onClick={() => onDelete(shift.id)}
        >
          <Trash2 className="w-4 h-4 mr-1" />
          <span className="text-xs">Remover</span>
        </Button>
      </div>
    </div>
  );
}

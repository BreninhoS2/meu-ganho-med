import { ShiftWithCalculations } from '@/types/shift';
import { ShiftCard } from './ShiftCard';
import { CalendarX } from 'lucide-react';

interface ShiftListProps {
  shifts: ShiftWithCalculations[];
  onDelete: (id: string) => void;
}

export function ShiftList({ shifts, onDelete }: ShiftListProps) {
  if (shifts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mb-4">
          <CalendarX className="w-8 h-8 text-muted-foreground" />
        </div>
        <h3 className="font-medium text-foreground mb-1">
          Nenhum plantão cadastrado
        </h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Adicione seu primeiro plantão para começar a acompanhar seus ganhos.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {shifts.map((shift) => (
        <ShiftCard key={shift.id} shift={shift} onDelete={onDelete} />
      ))}
    </div>
  );
}

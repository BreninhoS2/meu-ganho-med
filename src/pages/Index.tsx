import { useState } from 'react';
import { useShifts } from '@/hooks/useShifts';
import { MonthlySummary } from '@/components/MonthlySummary';
import { ShiftList } from '@/components/ShiftList';
import { ShiftForm } from '@/components/ShiftForm';
import { AddShiftButton } from '@/components/AddShiftButton';
import { Stethoscope } from 'lucide-react';

const Index = () => {
  const [showForm, setShowForm] = useState(false);
  const { currentMonthShifts, monthlySummary, addShift, removeShift } = useShifts();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-background/80 backdrop-blur-sm border-b border-border/50">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Stethoscope className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground">PlantãoMed</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-5 pb-24">
        {/* Monthly Summary */}
        <section className="mb-6">
          <MonthlySummary summary={monthlySummary} />
        </section>

        {/* Shifts List */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
              Plantões deste mês
            </h2>
            <span className="text-xs text-muted-foreground">
              {currentMonthShifts.length} registros
            </span>
          </div>
          <ShiftList shifts={currentMonthShifts} onDelete={removeShift} />
        </section>
      </main>

      {/* FAB */}
      <AddShiftButton onClick={() => setShowForm(true)} />

      {/* Form Modal */}
      {showForm && (
        <ShiftForm
          onSubmit={addShift}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default Index;

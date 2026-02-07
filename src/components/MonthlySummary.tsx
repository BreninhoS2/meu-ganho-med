import { MonthlySummary as MonthlySummaryType } from '@/types/shift';
import { formatCurrency, formatCurrencyDetailed, getCurrentMonthName } from '@/lib/formatters';
import { Clock, TrendingUp, Calendar, DollarSign } from 'lucide-react';

interface MonthlySummaryProps {
  summary: MonthlySummaryType;
}

export function MonthlySummary({ summary }: MonthlySummaryProps) {
  return (
    <div className="summary-gradient rounded-2xl p-5 text-primary-foreground">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-medium opacity-90 capitalize">
          {getCurrentMonthName()}
        </h2>
        <div className="flex items-center gap-1.5 text-xs opacity-80">
          <Calendar className="w-3.5 h-3.5" />
          <span>{summary.totalShifts} plantões</span>
        </div>
      </div>

      {/* Main Value */}
      <div className="mb-6">
        <p className="text-xs opacity-75 mb-1">Total líquido</p>
        <p className="money-display text-4xl">
          {formatCurrency(summary.totalNet)}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <DollarSign className="w-3.5 h-3.5 opacity-75" />
            <span className="text-xs opacity-75">Bruto</span>
          </div>
          <p className="font-semibold text-sm">
            {formatCurrency(summary.totalGross)}
          </p>
        </div>

        <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <Clock className="w-3.5 h-3.5 opacity-75" />
            <span className="text-xs opacity-75">Horas</span>
          </div>
          <p className="font-semibold text-sm">{summary.totalHours}h</p>
        </div>

        <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-3">
          <div className="flex items-center gap-1.5 mb-1">
            <TrendingUp className="w-3.5 h-3.5 opacity-75" />
            <span className="text-xs opacity-75">R$/hora</span>
          </div>
          <p className="font-semibold text-sm">
            {summary.averageHourlyRate > 0
              ? formatCurrencyDetailed(summary.averageHourlyRate)
              : '—'}
          </p>
        </div>
      </div>
    </div>
  );
}

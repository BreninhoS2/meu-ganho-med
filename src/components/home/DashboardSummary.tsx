import { Card } from '@/components/ui/card';
import { MonthlySummary } from '@/types';
import { formatCurrency } from '@/lib/formatters';
import { getCurrentMonthName } from '@/lib/formatters';
import { TrendingUp, Clock, Wallet, AlertCircle } from 'lucide-react';

interface DashboardSummaryProps {
  summary: MonthlySummary;
}

export function DashboardSummary({ summary }: DashboardSummaryProps) {
  return (
    <Card className="summary-gradient text-primary-foreground p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium opacity-90">
          Resumo de {getCurrentMonthName()}
        </h2>
      </div>

      {/* Main numbers */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs opacity-75">Total Líquido</p>
          <p className="text-2xl font-bold money-display">
            {formatCurrency(summary.totalNet)}
          </p>
        </div>
        <div>
          <p className="text-xs opacity-75">Total Bruto</p>
          <p className="text-lg font-semibold money-display">
            {formatCurrency(summary.totalGross)}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2 pt-2 border-t border-white/20">
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-xs opacity-75 mb-1">
            <Clock className="w-3 h-3" />
            <span>Horas</span>
          </div>
          <p className="text-sm font-semibold">{summary.totalHours}h</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-xs opacity-75 mb-1">
            <TrendingUp className="w-3 h-3" />
            <span>R$/h</span>
          </div>
          <p className="text-sm font-semibold">
            {formatCurrency(summary.averageHourlyRate)}
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-xs opacity-75 mb-1">
            <Wallet className="w-3 h-3" />
            <span>Pago</span>
          </div>
          <p className="text-sm font-semibold">
            {formatCurrency(summary.paidAmount)}
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1 text-xs opacity-75 mb-1">
            <AlertCircle className="w-3 h-3" />
            <span>Pendente</span>
          </div>
          <p className="text-sm font-semibold">
            {formatCurrency(summary.pendingAmount)}
          </p>
        </div>
      </div>
    </Card>
  );
}

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { MedicalEventWithCalculations, Expense, MonthlySummary } from '@/types';
import { formatCurrency, getMonthName } from '@/lib/formatters';
import { calculateLocationSummaries } from '@/lib/calculations';
import { Target, TrendingUp, Building2, BarChart3, Edit2, Check } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface ReportsTabProps {
  events: MedicalEventWithCalculations[];
  expenses: Expense[];
  locationMap: Map<string, string>;
  getMonthlySummary: (month: number, year: number) => MonthlySummary;
  currentGoal?: number;
  setGoal: (amount: number) => void | Promise<any>;
}

export function ReportsTab({ 
  events, 
  expenses, 
  locationMap, 
  getMonthlySummary, 
  currentGoal, 
  setGoal,
}: ReportsTabProps) {
  const [editingGoal, setEditingGoal] = useState(false);
  const [goalValue, setGoalValue] = useState(currentGoal?.toString() || '');

  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Get last 6 months data
  const monthlyData = useMemo(() => {
    const data = [];
    for (let i = 5; i >= 0; i--) {
      const month = (currentMonth - i + 12) % 12;
      const year = currentMonth - i < 0 ? currentYear - 1 : currentYear;
      const summary = getMonthlySummary(month, year);
      data.push({
        month: getMonthName(month, year).split(' ')[0].substring(0, 3),
        bruto: summary.totalGross,
        liquido: summary.totalNet,
        despesas: summary.totalExpenses,
      });
    }
    return data;
  }, [getMonthlySummary, currentMonth, currentYear]);

  // Location ranking
  const locationRanking = useMemo(() => {
    return calculateLocationSummaries(events).slice(0, 5);
  }, [events]);

  // Current month summary
  const currentSummary = getMonthlySummary(currentMonth, currentYear);
  const goalProgress = currentGoal && currentGoal > 0 ? {
    percentage: Math.min(100, Math.round((currentSummary.totalNet / currentGoal) * 100)),
    remaining: Math.max(0, currentGoal - currentSummary.totalNet),
    target: currentGoal,
    achieved: currentSummary.totalNet >= currentGoal,
  } : null;

  const handleSaveGoal = () => {
    const amount = parseFloat(goalValue);
    if (amount > 0) {
      setGoal(amount);
    }
    setEditingGoal(false);
  };

  return (
    <div className="space-y-6">
      {/* Goal section */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <span className="font-medium text-foreground">Meta do Mês</span>
          </div>
          {!editingGoal && (
            <Button variant="ghost" size="sm" onClick={() => setEditingGoal(true)}>
              <Edit2 className="w-4 h-4" />
            </Button>
          )}
        </div>

        {editingGoal ? (
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="10000"
              value={goalValue}
              onChange={(e) => setGoalValue(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSaveGoal}>
              <Check className="w-4 h-4" />
            </Button>
          </div>
        ) : goalProgress ? (
          <div className="space-y-2">
            <Progress value={goalProgress.percentage} className="h-3" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {formatCurrency(currentSummary.totalNet)} de {formatCurrency(currentGoal!)}
              </span>
              <span className={goalProgress.achieved ? 'text-success font-medium' : 'text-foreground'}>
                {goalProgress.achieved ? '✓ Meta atingida!' : `${goalProgress.percentage.toFixed(0)}%`}
              </span>
            </div>
            {!goalProgress.achieved && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Faltam {formatCurrency(goalProgress.remaining)}
              </p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Defina uma meta para acompanhar seu progresso
          </p>
        )}
      </Card>

      {/* Monthly chart */}
      <Card className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-primary" />
          <span className="font-medium text-foreground">Ganhos por Mês</span>
        </div>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
              <YAxis className="text-xs" tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
              <Tooltip 
                formatter={(value: number) => formatCurrency(value)}
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Bar dataKey="bruto" name="Bruto" fill="hsl(var(--muted-foreground))" radius={[4, 4, 0, 0]} />
              <Bar dataKey="liquido" name="Líquido" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Margin card */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Margem (Líquido - Despesas)</p>
            <p className={`text-2xl font-bold ${currentSummary.netAfterExpenses >= 0 ? 'text-money' : 'text-destructive'}`}>
              {formatCurrency(currentSummary.netAfterExpenses)}
            </p>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <p>Líquido: {formatCurrency(currentSummary.totalNet)}</p>
            <p>Despesas: -{formatCurrency(currentSummary.totalExpenses)}</p>
          </div>
        </div>
      </Card>

      {/* Location ranking */}
      {locationRanking.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-primary" />
            <span className="font-medium text-foreground">Ranking por Local</span>
          </div>
          
          <div className="space-y-3">
            {locationRanking.map((loc, index) => (
              <div key={loc.locationId} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    index === 0 ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                  }`}>
                    {index + 1}
                  </span>
                  <span className="text-sm text-foreground">{loc.locationName}</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-money">{formatCurrency(loc.totalNet)}</p>
                  <p className="text-xs text-muted-foreground">{loc.eventCount} eventos</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Stats summary */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Plantões</p>
          <p className="text-2xl font-bold text-foreground">{currentSummary.totalShifts}</p>
        </Card>
        <Card className="p-4 text-center">
          <p className="text-xs text-muted-foreground mb-1">Consultas</p>
          <p className="text-2xl font-bold text-foreground">{currentSummary.totalConsultations}</p>
        </Card>
      </div>
    </div>
  );
}

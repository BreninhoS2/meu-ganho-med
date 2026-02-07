import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { formatCurrency } from '@/lib/formatters';
import { Target, TrendingUp } from 'lucide-react';

interface GoalProgressProps {
  goal: number;
  current: number;
}

export function GoalProgress({ goal, current }: GoalProgressProps) {
  const percentage = Math.min(100, (current / goal) * 100);
  const remaining = Math.max(0, goal - current);
  const achieved = current >= goal;

  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-3">
        <Target className="w-4 h-4 text-primary" />
        <span className="text-sm font-medium text-foreground">Meta do Mês</span>
        {achieved && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-success/20 text-success">
            ✓ Atingida!
          </span>
        )}
      </div>
      
      <div className="space-y-2">
        <Progress value={percentage} className="h-2" />
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            {formatCurrency(current)} de {formatCurrency(goal)}
          </span>
          <span className="font-medium text-foreground">
            {percentage.toFixed(0)}%
          </span>
        </div>

        {!achieved && remaining > 0 && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="w-3 h-3" />
            <span>Faltam {formatCurrency(remaining)}</span>
          </div>
        )}
      </div>
    </Card>
  );
}

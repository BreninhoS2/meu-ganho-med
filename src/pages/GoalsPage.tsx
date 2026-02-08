import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Target, 
  Plus, 
  Edit, 
  TrendingUp,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { AppLayout } from '@/components/navigation/AppLayout';
import { cn } from '@/lib/utils';

// Mock data
const mockGoal = {
  target: 25000,
  current: 18450,
  suggestedTarget: 22000,
};

const mockHistory = [
  { month: 'Janeiro 2026', target: 20000, achieved: 22000, percentage: 110 },
  { month: 'Dezembro 2025', target: 20000, achieved: 18500, percentage: 92 },
  { month: 'Novembro 2025', target: 18000, achieved: 19200, percentage: 107 },
];

export default function GoalsPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [goalValue, setGoalValue] = useState(mockGoal.target);

  const currentMonth = format(new Date(), 'MMMM yyyy', { locale: ptBR });
  const percentage = Math.round((mockGoal.current / mockGoal.target) * 100);
  const remaining = mockGoal.target - mockGoal.current;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <AppLayout title="Metas">
      <div className="space-y-4">
        {/* Current goal */}
        <Card className="bg-gradient-to-br from-primary/5 to-emerald-500/5 border-primary/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4" />
                Meta de {currentMonth}
              </CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-3">
                <Input
                  type="number"
                  value={goalValue}
                  onChange={(e) => setGoalValue(Number(e.target.value))}
                  placeholder="Meta mensal"
                />
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => setIsEditing(false)}
                    className="flex-1"
                  >
                    Salvar
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setGoalValue(mockGoal.target);
                      setIsEditing(false);
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-end justify-between mb-2">
                  <div>
                    <p className="text-3xl font-bold text-primary">
                      {formatCurrency(mockGoal.current)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      de {formatCurrency(mockGoal.target)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-foreground">{percentage}%</p>
                    <p className="text-xs text-muted-foreground">atingido</p>
                  </div>
                </div>
                <Progress value={percentage} className="h-3" />
                <p className="text-sm text-muted-foreground mt-2">
                  Faltam {formatCurrency(remaining)} para atingir a meta
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Suggestion card */}
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-5 h-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-foreground">Sugestão de meta</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Com base na sua média dos últimos 3 meses, sugerimos uma meta de{' '}
                  <strong className="text-foreground">
                    {formatCurrency(mockGoal.suggestedTarget)}
                  </strong>
                </p>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="mt-2 border-amber-500/50 text-amber-600 hover:bg-amber-500/10"
                >
                  Aplicar sugestão
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* History */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Histórico de metas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockHistory.map((item) => (
                <div 
                  key={item.month}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="font-medium text-foreground capitalize">{item.month}</p>
                    <p className="text-xs text-muted-foreground">
                      Meta: {formatCurrency(item.target)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      {formatCurrency(item.achieved)}
                    </p>
                    <p className={cn(
                      "text-xs font-medium",
                      item.percentage >= 100 ? "text-primary" : "text-destructive"
                    )}>
                      {item.percentage}% atingido
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

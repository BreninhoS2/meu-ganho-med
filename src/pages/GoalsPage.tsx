import { useState, useEffect, useCallback, memo } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Target, Edit, TrendingUp, Sparkles, Lock, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { AppLayout } from '@/components/navigation/AppLayout';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/formatters';
import { useDbGoals, GoalSuggestion } from '@/hooks/useDbGoals';

// ─── History Item ───
const HistoryItem = memo(({ month, year, target, achieved, percentage }: {
  month: number; year: number; target: number; achieved: number; percentage: number;
}) => {
  const label = format(new Date(year, month, 1), 'MMMM yyyy', { locale: ptBR });
  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground capitalize truncate">{label}</p>
        <p className="text-xs text-muted-foreground">Meta: {formatCurrency(target)}</p>
      </div>
      <div className="text-right flex-shrink-0 ml-2">
        <p className="font-semibold text-foreground">{formatCurrency(achieved)}</p>
        <p className={cn("text-xs font-medium", percentage >= 100 ? "text-primary" : "text-destructive")}>
          {percentage}% atingido
        </p>
      </div>
    </div>
  );
});
HistoryItem.displayName = 'HistoryItem';

// ─── Main Page ───
export default function GoalsPage() {
  const {
    currentMonthGoal, isLoading, editLockInfo,
    setGoal, applySuggestion, calculateSuggestion, getCurrentProgress, getHistory,
  } = useDbGoals();

  const [isEditing, setIsEditing] = useState(false);
  const [goalValue, setGoalValue] = useState('');
  const [saving, setSaving] = useState(false);

  // Progress state
  const [progress, setProgress] = useState({ received: 0, target: 0, percentage: 0, remaining: 0, achieved: false });
  const [loadingProgress, setLoadingProgress] = useState(true);

  // Suggestion state
  const [suggestion, setSuggestion] = useState<GoalSuggestion | null>(null);
  const [loadingSuggestion, setLoadingSuggestion] = useState(true);
  const [applyingSuggestion, setApplyingSuggestion] = useState(false);

  // History state
  const [history, setHistory] = useState<Array<{ month: number; year: number; target: number; achieved: number; percentage: number }>>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const currentMonth = format(new Date(), 'MMMM yyyy', { locale: ptBR });

  // Load progress
  useEffect(() => {
    let cancelled = false;
    setLoadingProgress(true);
    getCurrentProgress().then(p => { if (!cancelled) { setProgress(p); setLoadingProgress(false); } });
    return () => { cancelled = true; };
  }, [getCurrentProgress]);

  // Load suggestion
  useEffect(() => {
    let cancelled = false;
    setLoadingSuggestion(true);
    calculateSuggestion().then(s => { if (!cancelled) { setSuggestion(s); setLoadingSuggestion(false); } });
    return () => { cancelled = true; };
  }, [calculateSuggestion]);

  // Load history
  useEffect(() => {
    let cancelled = false;
    setLoadingHistory(true);
    getHistory().then(h => { if (!cancelled) { setHistory(h); setLoadingHistory(false); } });
    return () => { cancelled = true; };
  }, [getHistory]);

  // Sync edit input
  useEffect(() => {
    if (currentMonthGoal) setGoalValue(String(currentMonthGoal.targetAmount));
  }, [currentMonthGoal]);

  const handleSave = useCallback(async () => {
    const num = Number(goalValue);
    if (!num || num <= 0) return;
    setSaving(true);
    const result = await setGoal(num);
    setSaving(false);
    if (result) {
      setIsEditing(false);
      // Refresh progress
      getCurrentProgress().then(setProgress);
    }
  }, [goalValue, setGoal, getCurrentProgress]);

  const handleApplySuggestion = useCallback(async () => {
    if (!suggestion || suggestion.suggestedAmount <= 0) return;
    setApplyingSuggestion(true);
    const result = await applySuggestion(suggestion.suggestedAmount);
    setApplyingSuggestion(false);
    if (result) getCurrentProgress().then(setProgress);
  }, [suggestion, applySuggestion, getCurrentProgress]);

  if (isLoading) {
    return (
      <AppLayout title="Metas">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    );
  }

  const hasGoal = currentMonthGoal && currentMonthGoal.targetAmount > 0;

  return (
    <AppLayout title="Metas">
      <div className="space-y-4">
        {/* ─── Current Goal Card ─── */}
        <Card className="bg-gradient-to-br from-primary/5 to-emerald-500/5 border-primary/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="w-4 h-4" />
                Meta de {currentMonth}
              </CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={editLockInfo.locked}
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        {editLockInfo.locked ? <Lock className="w-4 h-4 text-muted-foreground" /> : <Edit className="w-4 h-4" />}
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {editLockInfo.locked && editLockInfo.unlockDate && (
                    <TooltipContent>
                      <p>Você poderá editar em {editLockInfo.daysRemaining} dia(s) ({format(editLockInfo.unlockDate, 'dd/MM', { locale: ptBR })})</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-3">
                <Input
                  type="number"
                  value={goalValue}
                  onChange={(e) => setGoalValue(e.target.value)}
                  placeholder="Meta mensal (R$)"
                  min={1}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSave} disabled={saving} className="flex-1">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Salvar'}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setGoalValue(String(currentMonthGoal?.targetAmount ?? '')); setIsEditing(false); }}>
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : hasGoal ? (
              <>
                <div className="flex items-end justify-between mb-2">
                  <div className="min-w-0 flex-1">
                    {loadingProgress ? (
                      <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                    ) : (
                      <>
                        <p className="text-3xl font-bold text-primary truncate">{formatCurrency(progress.received)}</p>
                        <p className="text-sm text-muted-foreground">de {formatCurrency(progress.target)}</p>
                      </>
                    )}
                  </div>
                  {!loadingProgress && (
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-2xl font-bold text-foreground">{progress.percentage}%</p>
                      <p className="text-xs text-muted-foreground">atingido</p>
                    </div>
                  )}
                </div>
                {!loadingProgress && (
                  <>
                    <Progress value={progress.percentage} className="h-3" />
                    {!progress.achieved && progress.remaining > 0 && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Faltam {formatCurrency(progress.remaining)} para atingir a meta
                      </p>
                    )}
                    {progress.achieved && (
                      <p className="text-sm text-primary font-medium mt-2">🎉 Meta atingida!</p>
                    )}
                  </>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground mb-2">Nenhuma meta definida para este mês.</p>
                <Button size="sm" onClick={() => setIsEditing(true)}>Definir meta</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ─── Suggestion Card ─── */}
        <Card className="border-amber-500/20 bg-amber-500/5">
          <CardContent className="pt-4">
            {loadingSuggestion ? (
              <div className="flex items-center gap-2 py-2">
                <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                <span className="text-sm text-muted-foreground">Calculando sugestão...</span>
              </div>
            ) : suggestion && suggestion.suggestedAmount > 0 ? (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-foreground">Sugestão de meta</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {suggestion.explanation}
                  </p>
                  <p className="text-sm font-semibold text-foreground mt-1">
                    Meta sugerida: {formatCurrency(suggestion.suggestedAmount)}
                  </p>
                  {suggestion.breakdown.length > 0 && (
                    <div className="mt-2 space-y-0.5">
                      {suggestion.breakdown.map((line, i) => (
                        <p key={i} className="text-xs text-muted-foreground">• {line}</p>
                      ))}
                    </div>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-3 border-amber-500/50 text-amber-600 hover:bg-amber-500/10"
                    onClick={handleApplySuggestion}
                    disabled={applyingSuggestion || editLockInfo.locked}
                  >
                    {applyingSuggestion ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                    {editLockInfo.locked ? 'Edição bloqueada' : 'Aplicar sugestão'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-5 h-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">Sugestão de meta</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Registre pagamentos recebidos nos últimos meses para receber sugestões inteligentes.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ─── History ─── */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Histórico de metas
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingHistory ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : history.length > 0 ? (
              <div className="space-y-3">
                {history.map((item) => (
                  <HistoryItem key={`${item.year}-${item.month}`} {...item} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Nenhum histórico de metas ainda. Seu histórico aparecerá nos próximos meses.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

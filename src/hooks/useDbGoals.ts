import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface GoalRecord {
  id: string;
  month: number;
  year: number;
  targetAmount: number;
  lastManualEditAt: string | null;
  isSuggestionApplied: boolean;
  notes: string | null;
  createdAt: string;
}

interface DbGoal {
  id: string;
  user_id: string;
  month: number;
  year: number;
  target_amount: number;
  last_manual_edit_at: string | null;
  is_suggestion_applied: boolean | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function mapDb(db: DbGoal): GoalRecord {
  return {
    id: db.id,
    month: db.month,
    year: db.year,
    targetAmount: Number(db.target_amount),
    lastManualEditAt: db.last_manual_edit_at,
    isSuggestionApplied: db.is_suggestion_applied ?? false,
    notes: db.notes,
    createdAt: db.created_at,
  };
}

export interface GoalSuggestion {
  suggestedAmount: number;
  averageLast3: number;
  trendPercent: number;
  explanation: string;
  breakdown: string[];
}

const EDIT_COOLDOWN_DAYS = 15;

export function useDbGoals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState<GoalRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const now = useMemo(() => new Date(), []);
  const currentMonth = useMemo(() => now.getMonth(), [now]);
  const currentYear = useMemo(() => now.getFullYear(), [now]);

  // ─── Fetch all goals ───
  const fetchGoals = useCallback(async () => {
    if (!user) { setGoals([]); setIsLoading(false); return; }
    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('year', { ascending: false })
        .order('month', { ascending: false });
      if (error) throw error;
      setGoals((data || []).map(mapDb));
    } catch (e) {
      console.error('Error fetching goals:', e);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchGoals(); }, [fetchGoals]);

  // ─── Current month goal ───
  const currentMonthGoal = useMemo(
    () => goals.find(g => g.month === currentMonth && g.year === currentYear),
    [goals, currentMonth, currentYear]
  );

  // ─── 15-day edit lock ───
  const editLockInfo = useMemo(() => {
    if (!currentMonthGoal?.lastManualEditAt) return { locked: false, unlockDate: null, daysRemaining: 0 };
    const lastEdit = new Date(currentMonthGoal.lastManualEditAt);
    const unlockDate = new Date(lastEdit);
    unlockDate.setDate(unlockDate.getDate() + EDIT_COOLDOWN_DAYS);
    const daysRemaining = Math.max(0, Math.ceil((unlockDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
    return { locked: daysRemaining > 0, unlockDate, daysRemaining };
  }, [currentMonthGoal, now]);

  // ─── Revenue for a given month (sum of net values where paid_at is in that month) ───
  const getMonthRevenue = useCallback(async (month: number, year: number): Promise<number> => {
    if (!user) return 0;
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0, 23, 59, 59);
    const { data, error } = await supabase
      .from('events')
      .select('gross_value, discount, discount_type, paid_at')
      .eq('user_id', user.id)
      .not('paid_at', 'is', null)
      .neq('status', 'cancelled')
      .gte('paid_at', startDate.toISOString())
      .lte('paid_at', endDate.toISOString());
    if (error) { console.error(error); return 0; }
    return (data || []).reduce((sum, e) => {
      const gross = Number(e.gross_value);
      const discount = Number(e.discount);
      const discountType = e.discount_type;
      const net = discountType === 'percentage' ? gross * (1 - discount / 100) : gross - discount;
      return sum + Math.max(0, net);
    }, 0);
  }, [user]);

  // ─── Smart suggestion ───
  const calculateSuggestion = useCallback(async (): Promise<GoalSuggestion> => {
    const months: { m: number; y: number }[] = [];
    let m = currentMonth, y = currentYear;
    for (let i = 0; i < 3; i++) {
      m--;
      if (m < 0) { m = 11; y--; }
      months.push({ m, y });
    }

    const revenues = await Promise.all(months.map(({ m, y }) => getMonthRevenue(m, y)));
    const nonZero = revenues.filter(r => r > 0);

    if (nonZero.length === 0) {
      return {
        suggestedAmount: 0,
        averageLast3: 0,
        trendPercent: 0,
        explanation: 'Ainda não há dados suficientes para sugerir uma meta. Registre seus pagamentos para receber sugestões.',
        breakdown: [],
      };
    }

    const avg = nonZero.reduce((a, b) => a + b, 0) / nonZero.length;

    // Simple trend: compare most recent to oldest available
    let trendPercent = 0;
    if (nonZero.length >= 2) {
      const reversedRevenues = [...revenues].reverse();
      const oldest = reversedRevenues.find(r => r > 0) ?? avg;
      const newest = revenues.find(r => r > 0) ?? avg;
      if (oldest > 0) trendPercent = ((newest - oldest) / oldest) * 100;
    }

    // Apply trend with dampening (50% of trend)
    const trendFactor = 1 + (trendPercent * 0.5) / 100;
    const suggested = Math.round(avg * trendFactor / 100) * 100; // round to nearest 100

    const breakdown: string[] = [];
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    months.forEach(({ m, y }, i) => {
      if (revenues[i] > 0) breakdown.push(`${monthNames[m]}/${y}: R$ ${revenues[i].toLocaleString('pt-BR', { minimumFractionDigits: 0 })}`);
    });
    breakdown.push(`Média: R$ ${Math.round(avg).toLocaleString('pt-BR')}`);
    if (Math.abs(trendPercent) > 1) {
      breakdown.push(`Tendência: ${trendPercent > 0 ? '+' : ''}${trendPercent.toFixed(0)}%`);
    }

    const trendText = trendPercent > 5
      ? 'Seus ganhos estão crescendo!'
      : trendPercent < -5
        ? 'Ajustamos para baixo considerando a tendência recente.'
        : 'Mantendo a estabilidade dos últimos meses.';

    return {
      suggestedAmount: Math.max(suggested, 0),
      averageLast3: Math.round(avg),
      trendPercent: Math.round(trendPercent),
      explanation: `Baseado na sua média de R$ ${Math.round(avg).toLocaleString('pt-BR')} nos últimos ${nonZero.length} meses. ${trendText}`,
      breakdown,
    };
  }, [currentMonth, currentYear, getMonthRevenue]);

  // ─── Auto-create goal for current month if missing ───
  const ensureCurrentMonthGoal = useCallback(async () => {
    if (!user || isLoading) return;
    if (goals.find(g => g.month === currentMonth && g.year === currentYear)) return;

    // Try previous month's goal as fallback
    let prevMonth = currentMonth - 1, prevYear = currentYear;
    if (prevMonth < 0) { prevMonth = 11; prevYear--; }
    const prevGoal = goals.find(g => g.month === prevMonth && g.year === prevYear);

    let targetAmount = prevGoal?.targetAmount ?? 0;

    // Try smart suggestion
    try {
      const suggestion = await calculateSuggestion();
      if (suggestion.suggestedAmount > 0) targetAmount = suggestion.suggestedAmount;
    } catch (e) { console.error(e); }

    if (targetAmount <= 0) return; // no data at all, don't create empty goal

    try {
      const { data, error } = await supabase
        .from('goals')
        .insert({
          user_id: user.id,
          month: currentMonth,
          year: currentYear,
          target_amount: targetAmount,
          is_suggestion_applied: true,
        })
        .select()
        .single();
      if (error) throw error;
      setGoals(prev => [mapDb(data), ...prev]);
    } catch (e) {
      console.error('Error auto-creating goal:', e);
    }
  }, [user, isLoading, goals, currentMonth, currentYear, calculateSuggestion]);

  useEffect(() => {
    if (!isLoading && user) ensureCurrentMonthGoal();
  }, [isLoading, user, ensureCurrentMonthGoal]);

  // ─── Override lock (conscious unlock) ───
  const overrideLock = useCallback(async (): Promise<boolean> => {
    if (!user || !currentMonthGoal) return false;
    try {
      const { error } = await supabase
        .from('goals')
        .update({
          override_used: true,
          override_at: new Date().toISOString(),
          last_manual_edit_at: null, // clear lock so setGoal won't block
        })
        .eq('id', currentMonthGoal.id);
      if (error) throw error;
      // Refresh goals to clear editLockInfo
      await fetchGoals();
      return true;
    } catch (e) {
      console.error('Error overriding lock:', e);
      toast({ title: 'Erro ao desbloquear', variant: 'destructive' });
      return false;
    }
  }, [user, currentMonthGoal, fetchGoals, toast]);

  // ─── Set goal (manual edit) ───
  const setGoal = useCallback(async (targetAmount: number) => {
    if (!user) return null;
    if (editLockInfo.locked) {
      toast({ title: 'Edição bloqueada', description: `Você poderá editar novamente em ${editLockInfo.daysRemaining} dia(s).`, variant: 'destructive' });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('goals')
        .upsert({
          user_id: user.id,
          month: currentMonth,
          year: currentYear,
          target_amount: targetAmount,
          last_manual_edit_at: new Date().toISOString(),
          is_suggestion_applied: false,
        }, { onConflict: 'user_id,month,year' })
        .select()
        .single();
      if (error) throw error;
      const newGoal = mapDb(data);
      setGoals(prev => {
        const filtered = prev.filter(g => !(g.month === currentMonth && g.year === currentYear));
        return [newGoal, ...filtered];
      });
      toast({ title: 'Meta atualizada!' });
      return newGoal;
    } catch (e) {
      console.error('Error setting goal:', e);
      toast({ title: 'Erro ao definir meta', variant: 'destructive' });
      return null;
    }
  }, [user, currentMonth, currentYear, editLockInfo, toast]);

  // ─── Apply suggestion ───
  const applySuggestion = useCallback(async (suggestedAmount: number) => {
    if (!user) return null;
    if (editLockInfo.locked) {
      toast({ title: 'Edição bloqueada', description: `Você poderá editar novamente em ${editLockInfo.daysRemaining} dia(s).`, variant: 'destructive' });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('goals')
        .upsert({
          user_id: user.id,
          month: currentMonth,
          year: currentYear,
          target_amount: suggestedAmount,
          last_manual_edit_at: new Date().toISOString(),
          is_suggestion_applied: true,
        }, { onConflict: 'user_id,month,year' })
        .select()
        .single();
      if (error) throw error;
      const newGoal = mapDb(data);
      setGoals(prev => {
        const filtered = prev.filter(g => !(g.month === currentMonth && g.year === currentYear));
        return [newGoal, ...filtered];
      });
      toast({ title: 'Sugestão aplicada!' });
      return newGoal;
    } catch (e) {
      console.error('Error applying suggestion:', e);
      toast({ title: 'Erro ao aplicar sugestão', variant: 'destructive' });
      return null;
    }
  }, [user, currentMonth, currentYear, editLockInfo, toast]);

  // ─── History with real achieved amounts ───
  const getHistory = useCallback(async (): Promise<Array<{ month: number; year: number; target: number; achieved: number; percentage: number }>> => {
    const pastGoals = goals
      .filter(g => !(g.month === currentMonth && g.year === currentYear))
      .sort((a, b) => (b.year * 12 + b.month) - (a.year * 12 + a.month))
      .slice(0, 6);

    const results = await Promise.all(
      pastGoals.map(async (g) => {
        const achieved = await getMonthRevenue(g.month, g.year);
        return {
          month: g.month,
          year: g.year,
          target: g.targetAmount,
          achieved: Math.round(achieved),
          percentage: g.targetAmount > 0 ? Math.round((achieved / g.targetAmount) * 100) : 0,
        };
      })
    );
    return results;
  }, [goals, currentMonth, currentYear, getMonthRevenue]);

  // ─── Current month progress (real paid revenue) ───
  const getCurrentProgress = useCallback(async () => {
    const received = await getMonthRevenue(currentMonth, currentYear);
    const target = currentMonthGoal?.targetAmount ?? 0;
    const percentage = target > 0 ? Math.min(100, (received / target) * 100) : 0;
    const remaining = Math.max(0, target - received);
    return { received: Math.round(received), target, percentage: Math.round(percentage), remaining: Math.round(remaining), achieved: received >= target };
  }, [currentMonth, currentYear, currentMonthGoal, getMonthRevenue]);

  return {
    goals,
    currentMonthGoal,
    isLoading,
    editLockInfo,
    setGoal,
    overrideLock,
    applySuggestion,
    calculateSuggestion,
    getCurrentProgress,
    getHistory,
    refetch: fetchGoals,
  };
}

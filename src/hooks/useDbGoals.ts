import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { MonthlyGoal } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface DbGoal {
  id: string;
  user_id: string;
  month: number;
  year: number;
  target_amount: number;
  created_at: string;
  updated_at: string;
}

function mapDbToGoal(db: DbGoal): MonthlyGoal {
  return {
    id: db.id,
    month: db.month,
    year: db.year,
    targetAmount: Number(db.target_amount),
    createdAt: db.created_at,
  };
}

export function useDbGoals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [goals, setGoals] = useState<MonthlyGoal[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGoals = useCallback(async () => {
    if (!user) {
      setGoals([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (error) throw error;

      setGoals((data || []).map(mapDbToGoal));
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast({
        title: 'Erro ao carregar metas',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const currentMonth = useMemo(() => {
    const now = new Date();
    return { month: now.getMonth(), year: now.getFullYear() };
  }, []);

  const currentMonthGoal = useMemo(() => {
    return goals.find(
      (g) => g.month === currentMonth.month && g.year === currentMonth.year
    );
  }, [goals, currentMonth]);

  const setGoal = useCallback(async (month: number, year: number, targetAmount: number) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('goals')
        .upsert({
          user_id: user.id,
          month,
          year,
          target_amount: targetAmount,
        }, {
          onConflict: 'user_id,month,year',
        })
        .select()
        .single();

      if (error) throw error;

      const newGoal = mapDbToGoal(data);
      setGoals((prev) => {
        const filtered = prev.filter(
          (g) => !(g.month === month && g.year === year)
        );
        return [...filtered, newGoal];
      });
      return newGoal;
    } catch (error) {
      console.error('Error setting goal:', error);
      toast({
        title: 'Erro ao definir meta',
        variant: 'destructive',
      });
      return null;
    }
  }, [user, toast]);

  const removeGoal = useCallback(async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setGoals((prev) => prev.filter((g) => g.id !== id));
    } catch (error) {
      console.error('Error removing goal:', error);
      toast({
        title: 'Erro ao remover meta',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  const getGoalByMonth = useCallback(
    (month: number, year: number): MonthlyGoal | undefined => {
      return goals.find((g) => g.month === month && g.year === year);
    },
    [goals]
  );

  const calculateProgress = useCallback(
    (currentAmount: number, month?: number, year?: number) => {
      const targetMonth = month ?? currentMonth.month;
      const targetYear = year ?? currentMonth.year;
      const goal = getGoalByMonth(targetMonth, targetYear);
      
      if (!goal || goal.targetAmount === 0) {
        return {
          percentage: 0,
          remaining: 0,
          target: 0,
          achieved: false,
        };
      }

      const percentage = Math.min((currentAmount / goal.targetAmount) * 100, 100);
      const remaining = Math.max(goal.targetAmount - currentAmount, 0);
      
      return {
        percentage,
        remaining,
        target: goal.targetAmount,
        achieved: currentAmount >= goal.targetAmount,
      };
    },
    [currentMonth, getGoalByMonth]
  );

  return {
    goals,
    currentMonthGoal,
    isLoading,
    setGoal,
    removeGoal,
    getGoalByMonth,
    calculateProgress,
    refetch: fetchGoals,
  };
}

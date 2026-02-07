import { useState, useEffect, useCallback, useMemo } from 'react';
import { MonthlyGoal } from '@/types';
import { getGoals, setGoals, generateId } from '@/lib/storage';

export function useGoals() {
  const [goals, setGoalsState] = useState<MonthlyGoal[]>(() => getGoals());

  useEffect(() => {
    setGoals(goals);
  }, [goals]);

  const currentMonth = useMemo(() => {
    const now = new Date();
    return { month: now.getMonth(), year: now.getFullYear() };
  }, []);

  const currentMonthGoal = useMemo(() => {
    return goals.find(
      (g) => g.month === currentMonth.month && g.year === currentMonth.year
    );
  }, [goals, currentMonth]);

  const setGoal = useCallback((month: number, year: number, targetAmount: number) => {
    setGoalsState((prev) => {
      const existingIndex = prev.findIndex((g) => g.month === month && g.year === year);
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], targetAmount };
        return updated;
      }

      const newGoal: MonthlyGoal = {
        id: generateId(),
        month,
        year,
        targetAmount,
        createdAt: new Date().toISOString(),
      };
      return [...prev, newGoal];
    });
  }, []);

  const getGoalForMonth = useCallback(
    (month: number, year: number): MonthlyGoal | undefined => {
      return goals.find((g) => g.month === month && g.year === year);
    },
    [goals]
  );

  const calculateProgress = useCallback(
    (currentNet: number, targetAmount: number) => {
      if (targetAmount <= 0) return { percentage: 0, remaining: 0, achieved: false };
      
      const percentage = Math.min(100, (currentNet / targetAmount) * 100);
      const remaining = Math.max(0, targetAmount - currentNet);
      const achieved = currentNet >= targetAmount;
      
      return { percentage, remaining, achieved };
    },
    []
  );

  return {
    goals,
    currentMonthGoal,
    setGoal,
    getGoalForMonth,
    calculateProgress,
  };
}

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Expense, ExpenseCategory } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface DbExpense {
  id: string;
  user_id: string;
  category: string;
  value: number;
  date: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

function mapDbToExpense(db: DbExpense): Expense {
  return {
    id: db.id,
    category: db.category as ExpenseCategory,
    value: Number(db.value),
    date: db.date,
    description: db.description || undefined,
    createdAt: db.created_at,
  };
}

export function useDbExpenses() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchExpenses = useCallback(async () => {
    if (!user) {
      setExpenses([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;

      setExpenses((data || []).map(mapDbToExpense));
    } catch (error) {
      console.error('Error fetching expenses:', error);
      toast({
        title: 'Erro ao carregar despesas',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const currentMonth = useMemo(() => {
    const now = new Date();
    return { month: now.getMonth(), year: now.getFullYear() };
  }, []);

  const currentMonthExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const date = new Date(expense.date);
      return date.getMonth() === currentMonth.month && date.getFullYear() === currentMonth.year;
    });
  }, [expenses, currentMonth]);

  const totalCurrentMonthExpenses = useMemo(() => {
    return currentMonthExpenses.reduce((sum, e) => sum + e.value, 0);
  }, [currentMonthExpenses]);

  const expensesByCategory = useMemo(() => {
    const byCategory = new Map<ExpenseCategory, number>();
    currentMonthExpenses.forEach((expense) => {
      const current = byCategory.get(expense.category) || 0;
      byCategory.set(expense.category, current + expense.value);
    });
    return byCategory;
  }, [currentMonthExpenses]);

  const addExpense = useCallback(async (expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          user_id: user.id,
          category: expenseData.category,
          value: expenseData.value,
          date: expenseData.date,
          description: expenseData.description || null,
        })
        .select()
        .single();

      if (error) throw error;

      const newExpense = mapDbToExpense(data);
      setExpenses((prev) => [...prev, newExpense]);
      return newExpense;
    } catch (error) {
      console.error('Error adding expense:', error);
      toast({
        title: 'Erro ao adicionar despesa',
        variant: 'destructive',
      });
      return null;
    }
  }, [user, toast]);

  const updateExpense = useCallback(async (id: string, updates: Partial<Expense>) => {
    if (!user) return;

    try {
      const updateData: Record<string, any> = {};
      
      if (updates.category !== undefined) updateData.category = updates.category;
      if (updates.value !== undefined) updateData.value = updates.value;
      if (updates.date !== undefined) updateData.date = updates.date;
      if (updates.description !== undefined) updateData.description = updates.description;

      const { error } = await supabase
        .from('expenses')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setExpenses((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
      );
    } catch (error) {
      console.error('Error updating expense:', error);
      toast({
        title: 'Erro ao atualizar despesa',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  const removeExpense = useCallback(async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setExpenses((prev) => prev.filter((e) => e.id !== id));
    } catch (error) {
      console.error('Error removing expense:', error);
      toast({
        title: 'Erro ao remover despesa',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  const getExpensesByMonth = useCallback(
    (month: number, year: number): Expense[] => {
      return expenses.filter((expense) => {
        const date = new Date(expense.date);
        return date.getMonth() === month && date.getFullYear() === year;
      });
    },
    [expenses]
  );

  return {
    expenses,
    currentMonthExpenses,
    totalCurrentMonthExpenses,
    expensesByCategory,
    isLoading,
    addExpense,
    updateExpense,
    removeExpense,
    getExpensesByMonth,
    refetch: fetchExpenses,
  };
}

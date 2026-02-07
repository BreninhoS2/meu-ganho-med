import { useState, useEffect, useCallback, useMemo } from 'react';
import { Expense, ExpenseCategory } from '@/types';
import { getExpenses, setExpenses, generateId } from '@/lib/storage';

export function useExpenses() {
  const [expenses, setExpensesState] = useState<Expense[]>(() => getExpenses());

  useEffect(() => {
    setExpenses(expenses);
  }, [expenses]);

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

  const addExpense = useCallback((expenseData: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    setExpensesState((prev) => [...prev, newExpense]);
    return newExpense;
  }, []);

  const updateExpense = useCallback((id: string, updates: Partial<Expense>) => {
    setExpensesState((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  }, []);

  const removeExpense = useCallback((id: string) => {
    setExpensesState((prev) => prev.filter((e) => e.id !== id));
  }, []);

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
    addExpense,
    updateExpense,
    removeExpense,
    getExpensesByMonth,
  };
}

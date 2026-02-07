import { useState, useEffect, useMemo } from 'react';
import { Shift, ShiftWithCalculations, MonthlySummary } from '@/types/shift';

const STORAGE_KEY = 'plantaomed_shifts';

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function calculateShiftDetails(shift: Shift): ShiftWithCalculations {
  const hours = shift.type === '12h' ? 12 : 24;
  
  let discountValue = 0;
  if (shift.discountType === 'percentage') {
    discountValue = (shift.grossValue * shift.discount) / 100;
  } else {
    discountValue = shift.discount;
  }
  
  const netValue = Math.max(0, shift.grossValue - discountValue);
  const hourlyRate = netValue / hours;
  
  return {
    ...shift,
    netValue,
    hourlyRate,
  };
}

export function useShifts() {
  const [shifts, setShifts] = useState<Shift[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(shifts));
  }, [shifts]);

  const shiftsWithCalculations = useMemo(() => {
    return shifts
      .map(calculateShiftDetails)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [shifts]);

  const currentMonth = useMemo(() => {
    const now = new Date();
    return {
      month: now.getMonth(),
      year: now.getFullYear(),
    };
  }, []);

  const currentMonthShifts = useMemo(() => {
    return shiftsWithCalculations.filter((shift) => {
      const shiftDate = new Date(shift.date);
      return (
        shiftDate.getMonth() === currentMonth.month &&
        shiftDate.getFullYear() === currentMonth.year
      );
    });
  }, [shiftsWithCalculations, currentMonth]);

  const monthlySummary: MonthlySummary = useMemo(() => {
    if (currentMonthShifts.length === 0) {
      return {
        totalGross: 0,
        totalNet: 0,
        averageHourlyRate: 0,
        totalShifts: 0,
        totalHours: 0,
      };
    }

    const totalGross = currentMonthShifts.reduce((sum, s) => sum + s.grossValue, 0);
    const totalNet = currentMonthShifts.reduce((sum, s) => sum + s.netValue, 0);
    const totalHours = currentMonthShifts.reduce(
      (sum, s) => sum + (s.type === '12h' ? 12 : 24),
      0
    );
    const averageHourlyRate = totalNet / totalHours;

    return {
      totalGross,
      totalNet,
      averageHourlyRate,
      totalShifts: currentMonthShifts.length,
      totalHours,
    };
  }, [currentMonthShifts]);

  const addShift = (shiftData: Omit<Shift, 'id'>) => {
    const newShift: Shift = {
      ...shiftData,
      id: generateId(),
    };
    setShifts((prev) => [...prev, newShift]);
  };

  const removeShift = (id: string) => {
    setShifts((prev) => prev.filter((s) => s.id !== id));
  };

  const updateShift = (id: string, updates: Partial<Omit<Shift, 'id'>>) => {
    setShifts((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  return {
    shifts: shiftsWithCalculations,
    currentMonthShifts,
    monthlySummary,
    addShift,
    removeShift,
    updateShift,
  };
}

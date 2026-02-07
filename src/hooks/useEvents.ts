import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  MedicalEvent, 
  MedicalEventWithCalculations, 
  Shift,
  Consultation,
  MonthlySummary,
  EventFilters 
} from '@/types';
import { getEvents, setEvents, generateId } from '@/lib/storage';
import { calculateEventDetails, calculateMonthlySummary, getUpcomingEvents, getPendingPayments } from '@/lib/calculations';
import { useExpenses } from './useExpenses';

export function useEvents() {
  const [events, setEventsState] = useState<MedicalEvent[]>(() => getEvents());
  const { expenses } = useExpenses();

  useEffect(() => {
    setEvents(events);
  }, [events]);

  const eventsWithCalculations = useMemo(() => {
    return events
      .map(calculateEventDetails)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [events]);

  const currentMonth = useMemo(() => {
    const now = new Date();
    return { month: now.getMonth(), year: now.getFullYear() };
  }, []);

  const currentMonthEvents = useMemo(() => {
    return eventsWithCalculations.filter((event) => {
      const date = new Date(event.date);
      return date.getMonth() === currentMonth.month && date.getFullYear() === currentMonth.year;
    });
  }, [eventsWithCalculations, currentMonth]);

  const monthlySummary = useMemo(() => {
    return calculateMonthlySummary(eventsWithCalculations, expenses, currentMonth.month, currentMonth.year);
  }, [eventsWithCalculations, expenses, currentMonth]);

  const upcomingEvents = useMemo(() => {
    return getUpcomingEvents(eventsWithCalculations, 7);
  }, [eventsWithCalculations]);

  const pendingPayments = useMemo(() => {
    return getPendingPayments(eventsWithCalculations);
  }, [eventsWithCalculations]);

  const addEvent = useCallback((eventData: Omit<MedicalEvent, 'id' | 'createdAt'>) => {
    const newEvent: MedicalEvent = {
      ...eventData,
      id: generateId(),
      createdAt: new Date().toISOString(),
    } as MedicalEvent;
    setEventsState((prev) => [...prev, newEvent]);
    return newEvent;
  }, []);

  const updateEvent = useCallback((id: string, updates: Partial<MedicalEvent>) => {
    setEventsState((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } as MedicalEvent : e))
    );
  }, []);

  const removeEvent = useCallback((id: string) => {
    setEventsState((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const markAsPaid = useCallback((id: string, paymentDate?: string) => {
    setEventsState((prev) =>
      prev.map((e) =>
        e.id === id
          ? { ...e, paymentStatus: 'paid' as const, paymentDate: paymentDate || new Date().toISOString().split('T')[0] }
          : e
      )
    );
  }, []);

  const filterEvents = useCallback(
    (filters: EventFilters): MedicalEventWithCalculations[] => {
      return eventsWithCalculations.filter((event) => {
        if (filters.type && event.type !== filters.type) return false;
        if (filters.status && event.status !== filters.status) return false;
        if (filters.paymentStatus && event.paymentStatus !== filters.paymentStatus) return false;
        if (filters.locationId && event.locationId !== filters.locationId) return false;
        if (filters.startDate && event.date < filters.startDate) return false;
        if (filters.endDate && event.date > filters.endDate) return false;
        return true;
      });
    },
    [eventsWithCalculations]
  );

  const getEventsByMonth = useCallback(
    (month: number, year: number): MedicalEventWithCalculations[] => {
      return eventsWithCalculations.filter((event) => {
        const date = new Date(event.date);
        return date.getMonth() === month && date.getFullYear() === year;
      });
    },
    [eventsWithCalculations]
  );

  const getMonthlySummary = useCallback(
    (month: number, year: number): MonthlySummary => {
      return calculateMonthlySummary(eventsWithCalculations, expenses, month, year);
    },
    [eventsWithCalculations, expenses]
  );

  return {
    events: eventsWithCalculations,
    currentMonthEvents,
    monthlySummary,
    upcomingEvents,
    pendingPayments,
    addEvent,
    updateEvent,
    removeEvent,
    markAsPaid,
    filterEvents,
    getEventsByMonth,
    getMonthlySummary,
  };
}

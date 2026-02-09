import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { 
  MedicalEvent, 
  MedicalEventWithCalculations, 
  MonthlySummary,
  EventFilters,
  Shift,
  Consultation
} from '@/types';
import { calculateEventDetails, calculateMonthlySummary, getUpcomingEvents, getPendingPayments } from '@/lib/calculations';
import { useToast } from '@/hooks/use-toast';

// Database type mapping
interface DbEvent {
  id: string;
  user_id: string;
  type: string;
  date: string;
  location_id: string | null;
  location_name: string | null;
  gross_value: number;
  discount: number;
  discount_type: string;
  status: string;
  payment_status: string;
  payment_date: string | null;
  paid_at: string | null;
  duration: string | null;
  custom_hours: number | null;
  start_time: string | null;
  end_time: string | null;
  time: string | null;
  patient_name: string | null;
  privacy_mode: boolean | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function mapDbEventToMedicalEvent(dbEvent: DbEvent): MedicalEvent {
  const baseEvent = {
    id: dbEvent.id,
    date: dbEvent.date,
    locationId: dbEvent.location_id || undefined,
    locationName: dbEvent.location_name || undefined,
    grossValue: Number(dbEvent.gross_value),
    discount: Number(dbEvent.discount),
    discountType: dbEvent.discount_type as 'value' | 'percentage',
    status: dbEvent.status as 'scheduled' | 'completed' | 'cancelled',
    paymentStatus: dbEvent.payment_status as 'paid' | 'pending',
    paymentDate: dbEvent.payment_date || undefined,
    paidAt: dbEvent.paid_at || undefined,
    notes: dbEvent.notes || undefined,
    createdAt: dbEvent.created_at,
  };

  if (dbEvent.type === 'shift') {
    return {
      ...baseEvent,
      type: 'shift',
      duration: (dbEvent.duration || '12h') as '12h' | '24h' | 'custom',
      customHours: dbEvent.custom_hours ? Number(dbEvent.custom_hours) : undefined,
      startTime: dbEvent.start_time || undefined,
      endTime: dbEvent.end_time || undefined,
    } as Shift;
  } else {
    return {
      ...baseEvent,
      type: 'consultation',
      time: dbEvent.time || '08:00',
      patientName: dbEvent.patient_name || undefined,
      privacyMode: dbEvent.privacy_mode || false,
    } as Consultation;
  }
}

function mapMedicalEventToDb(event: Omit<MedicalEvent, 'id' | 'createdAt'>, userId: string): Partial<DbEvent> {
  const base = {
    user_id: userId,
    type: event.type,
    date: event.date,
    location_id: event.locationId || null,
    location_name: event.locationName || null,
    gross_value: event.grossValue,
    discount: event.discount,
    discount_type: event.discountType,
    status: event.status,
    payment_status: event.paymentStatus,
    payment_date: event.paymentDate || null,
    paid_at: event.paidAt || null,
    notes: event.notes || null,
  };

  if (event.type === 'shift') {
    const shift = event as Omit<Shift, 'id' | 'createdAt'>;
    return {
      ...base,
      duration: shift.duration,
      custom_hours: shift.customHours || null,
      start_time: shift.startTime || null,
      end_time: shift.endTime || null,
    };
  } else {
    const consultation = event as Omit<Consultation, 'id' | 'createdAt'>;
    return {
      ...base,
      time: consultation.time || null,
      patient_name: consultation.patientName || null,
      privacy_mode: consultation.privacyMode || null,
    };
  }
}

export function useDbEvents() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [events, setEvents] = useState<MedicalEvent[]>([]);
  const [expenses, setExpenses] = useState<{ value: number; date: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch events from database
  const fetchEvents = useCallback(async () => {
    if (!user) {
      setEvents([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;

      const mappedEvents = (data || []).map(mapDbEventToMedicalEvent);
      setEvents(mappedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: 'Erro ao carregar eventos',
        description: 'Tente recarregar a página.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  // Fetch expenses for calculations
  const fetchExpenses = useCallback(async () => {
    if (!user) {
      setExpenses([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('value, date')
        .eq('user_id', user.id);

      if (error) throw error;
      setExpenses((data || []).map(e => ({ value: Number(e.value), date: e.date })));
    } catch (error) {
      console.error('Error fetching expenses:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchEvents();
    fetchExpenses();
  }, [fetchEvents, fetchExpenses]);

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

  const addEvent = useCallback(async (eventData: Omit<MedicalEvent, 'id' | 'createdAt'>) => {
    if (!user) return null;

    try {
      const dbData = mapMedicalEventToDb(eventData, user.id);
      
      const { data, error } = await supabase
        .from('events')
        .insert([dbData as any])
        .select()
        .single();

      if (error) throw error;

      if (error) throw error;

      const newEvent = mapDbEventToMedicalEvent(data);
      setEvents((prev) => [...prev, newEvent]);
      return newEvent;
    } catch (error) {
      console.error('Error adding event:', error);
      toast({
        title: 'Erro ao adicionar evento',
        variant: 'destructive',
      });
      return null;
    }
  }, [user, toast]);

  const updateEvent = useCallback(async (id: string, updates: Partial<MedicalEvent>) => {
    if (!user) return;

    try {
      const updateData: Record<string, any> = {};
      
      if (updates.date !== undefined) updateData.date = updates.date;
      if (updates.locationId !== undefined) updateData.location_id = updates.locationId;
      if (updates.locationName !== undefined) updateData.location_name = updates.locationName;
      if (updates.grossValue !== undefined) updateData.gross_value = updates.grossValue;
      if (updates.discount !== undefined) updateData.discount = updates.discount;
      if (updates.discountType !== undefined) updateData.discount_type = updates.discountType;
      if (updates.status !== undefined) updateData.status = updates.status;
      if (updates.paymentStatus !== undefined) updateData.payment_status = updates.paymentStatus;
      if (updates.paymentDate !== undefined) updateData.payment_date = updates.paymentDate;
      if ('paidAt' in updates) updateData.paid_at = updates.paidAt || null;
      if (updates.notes !== undefined) updateData.notes = updates.notes;
      
      // Shift-specific fields
      if ('duration' in updates) updateData.duration = updates.duration;
      if ('customHours' in updates) updateData.custom_hours = updates.customHours;
      if ('startTime' in updates) updateData.start_time = updates.startTime;
      if ('endTime' in updates) updateData.end_time = updates.endTime;
      
      // Consultation-specific fields
      if ('time' in updates) updateData.time = updates.time;
      if ('patientName' in updates) updateData.patient_name = updates.patientName;
      if ('privacyMode' in updates) updateData.privacy_mode = updates.privacyMode;

      const { error } = await supabase
        .from('events')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setEvents((prev) =>
        prev.map((e) => (e.id === id ? { ...e, ...updates } as MedicalEvent : e))
      );
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: 'Erro ao atualizar evento',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  const removeEvent = useCallback(async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      setEvents((prev) => prev.filter((e) => e.id !== id));
    } catch (error) {
      console.error('Error removing event:', error);
      toast({
        title: 'Erro ao remover evento',
        variant: 'destructive',
      });
    }
  }, [user, toast]);

  const markAsPaid = useCallback(async (id: string, paymentDate?: string) => {
    await updateEvent(id, {
      paymentStatus: 'paid',
      paymentDate: paymentDate || new Date().toISOString().split('T')[0],
    });
  }, [updateEvent]);

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
    isLoading,
    addEvent,
    updateEvent,
    removeEvent,
    markAsPaid,
    filterEvents,
    getEventsByMonth,
    getMonthlySummary,
    refetch: fetchEvents,
  };
}

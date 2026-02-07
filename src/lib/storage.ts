import { MedicalEvent, Location, Expense, MonthlyGoal } from '@/types';

const STORAGE_KEYS = {
  events: 'plantaomed_events',
  locations: 'plantaomed_locations',
  expenses: 'plantaomed_expenses',
  goals: 'plantaomed_goals',
  // Legacy key for migration
  legacyShifts: 'plantaomed_shifts',
} as const;

// Generic storage functions
function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(value));
}

// Events (Shifts + Consultations)
export function getEvents(): MedicalEvent[] {
  const events = getItem<MedicalEvent[]>(STORAGE_KEYS.events, []);
  
  // Migrate legacy shifts if no events exist
  if (events.length === 0) {
    const legacyShifts = getItem<any[]>(STORAGE_KEYS.legacyShifts, []);
    if (legacyShifts.length > 0) {
      const migratedEvents: MedicalEvent[] = legacyShifts.map((shift) => ({
        id: shift.id,
        type: 'shift' as const,
        date: shift.date,
        grossValue: shift.grossValue,
        discount: shift.discount,
        discountType: shift.discountType,
        duration: shift.type, // '12h' or '24h'
        status: 'completed' as const,
        paymentStatus: 'paid' as const,
        createdAt: shift.date,
      }));
      setEvents(migratedEvents);
      return migratedEvents;
    }
  }
  
  return events;
}

export function setEvents(events: MedicalEvent[]): void {
  setItem(STORAGE_KEYS.events, events);
}

// Locations
export function getLocations(): Location[] {
  return getItem<Location[]>(STORAGE_KEYS.locations, []);
}

export function setLocations(locations: Location[]): void {
  setItem(STORAGE_KEYS.locations, locations);
}

// Expenses
export function getExpenses(): Expense[] {
  return getItem<Expense[]>(STORAGE_KEYS.expenses, []);
}

export function setExpenses(expenses: Expense[]): void {
  setItem(STORAGE_KEYS.expenses, expenses);
}

// Goals
export function getGoals(): MonthlyGoal[] {
  return getItem<MonthlyGoal[]>(STORAGE_KEYS.goals, []);
}

export function setGoals(goals: MonthlyGoal[]): void {
  setItem(STORAGE_KEYS.goals, goals);
}

// ID generator
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

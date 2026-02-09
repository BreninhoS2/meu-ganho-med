// ============= Event Types =============

export type EventType = 'shift' | 'consultation';
export type ShiftDuration = '12h' | '24h' | 'custom';
export type EventStatus = 'scheduled' | 'completed' | 'cancelled';
export type PaymentStatus = 'paid' | 'pending';
export type DiscountType = 'value' | 'percentage';
export type LocationType = 'hospital' | 'clinic';
export type ExpenseCategory = 
  | 'accountant' 
  | 'course' 
  | 'uniform' 
  | 'transport' 
  | 'food' 
  | 'equipment' 
  | 'other';

// ============= Location =============

export interface Location {
  id: string;
  name: string;
  type: LocationType;
  defaultShift12hValue: number;
  defaultShift24hValue: number;
  defaultConsultationValue: number;
  paymentDeadlineDays: number; // e.g., 30 days
  notes?: string;
  createdAt: string;
}

// ============= Base Event =============

export interface BaseEvent {
  id: string;
  type: EventType;
  date: string; // ISO date string
  locationId?: string;
  locationName?: string; // For display when location is deleted
  grossValue: number;
  discount: number;
  discountType: DiscountType;
  status: EventStatus;
  paymentStatus: PaymentStatus;
  paymentDate?: string; // Expected/due payment date
  paidAt?: string; // Actual payment timestamp (source of truth for "paid")
  notes?: string;
  createdAt: string;
}

// ============= Shift (Plantão) =============

export interface Shift extends BaseEvent {
  type: 'shift';
  duration: ShiftDuration;
  customHours?: number; // Only used when duration is 'custom'
  startTime?: string; // HH:MM
  endTime?: string; // HH:MM
}

// ============= Consultation (Consulta) =============

export interface Consultation extends BaseEvent {
  type: 'consultation';
  time: string; // HH:MM
  patientName?: string; // Optional, can be "Paciente A" for privacy
  privacyMode?: boolean; // If true, shows "Paciente X" instead of name
}

// ============= Union type for all events =============

export type MedicalEvent = Shift | Consultation;

// ============= Event with calculations =============

export interface EventWithCalculations extends BaseEvent {
  netValue: number;
  hourlyRate: number;
  hours: number;
}

export interface ShiftWithCalculations extends Shift, Omit<EventWithCalculations, keyof BaseEvent> {}
export interface ConsultationWithCalculations extends Consultation, Omit<EventWithCalculations, keyof BaseEvent> {}

export type MedicalEventWithCalculations = ShiftWithCalculations | ConsultationWithCalculations;

// ============= Expense (Despesa) =============

export interface Expense {
  id: string;
  category: ExpenseCategory;
  value: number;
  date: string;
  description?: string;
  createdAt: string;
}

// ============= Goal (Meta) =============

export interface MonthlyGoal {
  id: string;
  month: number; // 0-11
  year: number;
  targetAmount: number;
  createdAt: string;
}

// ============= Summary Types =============

export interface MonthlySummary {
  totalGross: number;
  totalNet: number;
  averageHourlyRate: number;
  totalShifts: number;
  totalConsultations: number;
  totalHours: number;
  pendingAmount: number;
  paidAmount: number;
  totalExpenses: number;
  netAfterExpenses: number;
}

export interface LocationSummary {
  locationId: string;
  locationName: string;
  totalGross: number;
  totalNet: number;
  eventCount: number;
  averageHourlyRate: number;
}

// ============= Filter Types =============

export interface EventFilters {
  type?: EventType;
  status?: EventStatus;
  paymentStatus?: PaymentStatus;
  locationId?: string;
  startDate?: string;
  endDate?: string;
}

// ============= Legacy Shift type for compatibility =============

export type { Shift as LegacyShift } from './shift';

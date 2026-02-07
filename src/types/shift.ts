export interface Shift {
  id: string;
  date: string; // ISO date string
  type: '12h' | '24h';
  grossValue: number;
  discount: number; // Can be value or percentage
  discountType: 'value' | 'percentage';
}

export interface ShiftWithCalculations extends Shift {
  netValue: number;
  hourlyRate: number;
}

export interface MonthlySummary {
  totalGross: number;
  totalNet: number;
  averageHourlyRate: number;
  totalShifts: number;
  totalHours: number;
}

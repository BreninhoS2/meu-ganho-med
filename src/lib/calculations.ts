import { 
  MedicalEvent, 
  MedicalEventWithCalculations, 
  Shift, 
  Consultation,
  ShiftWithCalculations,
  ConsultationWithCalculations,
  MonthlySummary,
  Expense,
  LocationSummary
} from '@/types';

export function getEventHours(event: MedicalEvent): number {
  if (event.type === 'shift') {
    const shift = event as Shift;
    if (shift.duration === 'custom' && shift.customHours) {
      return shift.customHours;
    }
    return shift.duration === '12h' ? 12 : 24;
  }
  // Consultations are typically 1 hour
  return 1;
}

export function calculateNetValue(grossValue: number, discount: number, discountType: 'value' | 'percentage'): number {
  let discountValue = 0;
  if (discountType === 'percentage') {
    discountValue = (grossValue * discount) / 100;
  } else {
    discountValue = discount;
  }
  return Math.max(0, grossValue - discountValue);
}

export function calculateEventDetails<T extends MedicalEvent>(event: T): T & { netValue: number; hourlyRate: number; hours: number } {
  const hours = getEventHours(event);
  const netValue = calculateNetValue(event.grossValue, event.discount, event.discountType);
  const hourlyRate = hours > 0 ? netValue / hours : 0;

  return {
    ...event,
    netValue,
    hourlyRate,
    hours,
  };
}

export function calculateMonthlySummary(
  events: MedicalEventWithCalculations[],
  expenses: Expense[],
  month: number,
  year: number
): MonthlySummary {
  const monthEvents = events.filter((e) => {
    const date = new Date(e.date);
    return date.getMonth() === month && date.getFullYear() === year && e.status !== 'cancelled';
  });

  const monthExpenses = expenses.filter((e) => {
    const date = new Date(e.date);
    return date.getMonth() === month && date.getFullYear() === year;
  });

  if (monthEvents.length === 0) {
    const totalExpenses = monthExpenses.reduce((sum, e) => sum + e.value, 0);
    return {
      totalGross: 0,
      totalNet: 0,
      averageHourlyRate: 0,
      totalShifts: 0,
      totalConsultations: 0,
      totalHours: 0,
      pendingAmount: 0,
      paidAmount: 0,
      totalExpenses,
      netAfterExpenses: -totalExpenses,
    };
  }

  const totalGross = monthEvents.reduce((sum, e) => sum + e.grossValue, 0);
  const totalNet = monthEvents.reduce((sum, e) => sum + e.netValue, 0);
  const totalHours = monthEvents.reduce((sum, e) => sum + e.hours, 0);
  const averageHourlyRate = totalHours > 0 ? totalNet / totalHours : 0;
  const totalShifts = monthEvents.filter((e) => e.type === 'shift').length;
  const totalConsultations = monthEvents.filter((e) => e.type === 'consultation').length;
  const pendingAmount = monthEvents
    .filter((e) => e.paymentStatus === 'pending')
    .reduce((sum, e) => sum + e.netValue, 0);
  const paidAmount = monthEvents
    .filter((e) => e.paymentStatus === 'paid')
    .reduce((sum, e) => sum + e.netValue, 0);
  const totalExpenses = monthExpenses.reduce((sum, e) => sum + e.value, 0);
  const netAfterExpenses = totalNet - totalExpenses;

  return {
    totalGross,
    totalNet,
    averageHourlyRate,
    totalShifts,
    totalConsultations,
    totalHours,
    pendingAmount,
    paidAmount,
    totalExpenses,
    netAfterExpenses,
  };
}

export function calculateLocationSummaries(
  events: MedicalEventWithCalculations[]
): LocationSummary[] {
  const locationMap = new Map<string, LocationSummary>();

  events.forEach((event) => {
    if (event.status === 'cancelled') return;
    
    const locationId = event.locationId || 'unknown';
    const locationName = event.locationName || 'Sem local';
    
    const existing = locationMap.get(locationId);
    if (existing) {
      existing.totalGross += event.grossValue;
      existing.totalNet += event.netValue;
      existing.eventCount += 1;
      const totalHours = existing.eventCount * (event.hours || 12); // Approximate
      existing.averageHourlyRate = existing.totalNet / totalHours;
    } else {
      locationMap.set(locationId, {
        locationId,
        locationName,
        totalGross: event.grossValue,
        totalNet: event.netValue,
        eventCount: 1,
        averageHourlyRate: event.hourlyRate,
      });
    }
  });

  return Array.from(locationMap.values()).sort((a, b) => b.totalNet - a.totalNet);
}

export function getUpcomingEvents(
  events: MedicalEventWithCalculations[],
  days: number = 7
): MedicalEventWithCalculations[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const futureDate = new Date(today);
  futureDate.setDate(futureDate.getDate() + days);

  return events
    .filter((e) => {
      const eventDate = new Date(e.date + 'T12:00:00');
      eventDate.setHours(0, 0, 0, 0);
      return eventDate >= today && eventDate <= futureDate && e.status !== 'cancelled';
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function getPendingPayments(
  events: MedicalEventWithCalculations[],
  days?: number
): MedicalEventWithCalculations[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let filtered = events.filter(
    (e) => e.paymentStatus === 'pending' && e.status === 'completed'
  );

  if (days !== undefined) {
    const futureDate = new Date(today);
    futureDate.setDate(futureDate.getDate() + days);
    
    filtered = filtered.filter((e) => {
      if (!e.paymentDate) return true;
      const paymentDate = new Date(e.paymentDate + 'T12:00:00');
      return paymentDate <= futureDate;
    });
  }

  return filtered.sort((a, b) => {
    if (!a.paymentDate) return 1;
    if (!b.paymentDate) return -1;
    return new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime();
  });
}

export function generateInsights(
  events: MedicalEventWithCalculations[],
  summary: MonthlySummary,
  goal?: number
): string[] {
  const insights: string[] = [];
  
  // Best paying location
  const locationSummaries = calculateLocationSummaries(events);
  if (locationSummaries.length > 1) {
    const best = locationSummaries[0];
    insights.push(`${best.locationName} paga melhor: ${formatCurrencyShort(best.averageHourlyRate)}/h`);
  }

  // Goal progress
  if (goal && goal > 0) {
    const remaining = goal - summary.totalNet;
    if (remaining > 0) {
      insights.push(`Faltam ${formatCurrencyShort(remaining)} para a meta do mês`);
      
      // Estimate shifts needed
      if (summary.averageHourlyRate > 0) {
        const avgShiftValue = summary.averageHourlyRate * 12; // Assume 12h shifts
        const shiftsNeeded = Math.ceil(remaining / avgShiftValue);
        if (shiftsNeeded <= 5) {
          insights.push(`Mais ${shiftsNeeded} plantão${shiftsNeeded > 1 ? 'ões' : ''} de 12h para bater a meta`);
        }
      }
    } else {
      insights.push('🎉 Você bateu a meta do mês!');
    }
  }

  // Pending payments warning
  if (summary.pendingAmount > summary.paidAmount) {
    insights.push(`${formatCurrencyShort(summary.pendingAmount)} ainda pendentes de pagamento`);
  }

  return insights.slice(0, 3);
}

function formatCurrencyShort(value: number): string {
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(1).replace('.', ',')}k`;
  }
  return `R$ ${value.toFixed(0)}`;
}

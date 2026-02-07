import { MedicalEventWithCalculations, Expense } from '@/types';
import { EVENT_STATUS_LABELS, PAYMENT_STATUS_LABELS, EXPENSE_CATEGORY_LABELS } from './formatters';

export function generateEventsCSV(events: MedicalEventWithCalculations[], locationMap: Map<string, string>): string {
  const headers = [
    'Data',
    'Tipo',
    'Duração/Horário',
    'Local',
    'Valor Bruto',
    'Desconto',
    'Valor Líquido',
    'Valor/Hora',
    'Status',
    'Pagamento',
    'Data Pagamento',
  ];

  const rows = events.map((event) => {
    const locationName = event.locationId ? locationMap.get(event.locationId) || event.locationName || '' : '';
    const durationOrTime = event.type === 'shift' 
      ? (event as any).duration 
      : (event as any).time || '';
    const discountStr = event.discountType === 'percentage' 
      ? `${event.discount}%` 
      : `R$ ${event.discount}`;

    return [
      event.date,
      event.type === 'shift' ? 'Plantão' : 'Consulta',
      durationOrTime,
      locationName,
      event.grossValue.toFixed(2),
      discountStr,
      event.netValue.toFixed(2),
      event.hourlyRate.toFixed(2),
      EVENT_STATUS_LABELS[event.status],
      PAYMENT_STATUS_LABELS[event.paymentStatus],
      event.paymentDate || '',
    ];
  });

  return [headers, ...rows].map((row) => row.map(escapeCSV).join(',')).join('\n');
}

export function generateExpensesCSV(expenses: Expense[]): string {
  const headers = ['Data', 'Categoria', 'Valor', 'Descrição'];

  const rows = expenses.map((expense) => [
    expense.date,
    EXPENSE_CATEGORY_LABELS[expense.category],
    expense.value.toFixed(2),
    expense.description || '',
  ]);

  return [headers, ...rows].map((row) => row.map(escapeCSV).join(',')).join('\n');
}

function escapeCSV(value: string | number): string {
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function downloadCSV(content: string, filename: string): void {
  const BOM = '\uFEFF'; // UTF-8 BOM for Excel compatibility
  const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

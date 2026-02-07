export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCurrencyDetailed(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString + 'T12:00:00');
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
  }).format(date);
}

export function formatFullDate(dateString: string): string {
  const date = new Date(dateString + 'T12:00:00');
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
  }).format(date);
}

export function formatLongDate(dateString: string): string {
  const date = new Date(dateString + 'T12:00:00');
  return new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function getCurrentMonthName(): string {
  return new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(new Date());
}

export function getMonthName(month: number, year: number): string {
  const date = new Date(year, month, 1);
  return new Intl.DateTimeFormat('pt-BR', {
    month: 'long',
    year: 'numeric',
  }).format(date);
}

export function formatTime(time: string): string {
  return time;
}

export function formatDateTime(dateString: string, time?: string): string {
  const formatted = formatFullDate(dateString);
  if (time) {
    return `${formatted} às ${time}`;
  }
  return formatted;
}

export function getDaysUntil(dateString: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateString + 'T12:00:00');
  target.setHours(0, 0, 0, 0);
  const diffTime = target.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function isToday(dateString: string): boolean {
  const today = new Date();
  const date = new Date(dateString + 'T12:00:00');
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

export function isTomorrow(dateString: string): boolean {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const date = new Date(dateString + 'T12:00:00');
  return (
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear()
  );
}

export function getRelativeDayLabel(dateString: string): string | null {
  if (isToday(dateString)) return 'Hoje';
  if (isTomorrow(dateString)) return 'Amanhã';
  const days = getDaysUntil(dateString);
  if (days > 0 && days <= 7) return `Em ${days} dias`;
  return null;
}

export const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  accountant: 'Contador',
  course: 'Curso',
  uniform: 'Jaleco/Uniforme',
  transport: 'Transporte',
  food: 'Alimentação',
  equipment: 'Equipamentos',
  other: 'Outros',
};

export const EVENT_STATUS_LABELS: Record<string, string> = {
  scheduled: 'Agendado',
  completed: 'Realizado',
  cancelled: 'Cancelado',
};

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  paid: 'Pago',
  pending: 'Pendente',
};

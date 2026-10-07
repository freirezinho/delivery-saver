/**
 * Brazilian Portuguese (pt-BR) formatters for Currency and Dates.
 */

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateBR(dateStr: string): string {
  try {
    const [year, month, day] = dateStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short'
    });
  } catch {
    return dateStr;
  }
}

export function formatDateTimeBR(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const isToday = getLocalDateString(date) === getLocalDateString(now);

  const timeStr = date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  if (isToday) {
    return `Hoje, ${timeStr}`;
  }

  const yesterday = new Date(now.getTime() - 86400000);
  if (getLocalDateString(date) === getLocalDateString(yesterday)) {
    return `Ontem, ${timeStr}`;
  }

  return `${date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}, ${timeStr}`;
}

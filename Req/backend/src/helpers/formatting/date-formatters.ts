/**
 * Helper functions for date formatting and manipulation
 * SRP: Date formatting utilities
 */

/**
 * Parse date string to Date object with validation
 */
export function parseDate(dateString: string): Date {
  const date = new Date(dateString);

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date string: ${dateString}`);
  }

  return date;
}

/**
 * Format date for database queries
 */
export function formatDateForQuery(date: Date): string {
  return date.toISOString();
}

/**
 * Create date range object for queries
 */
export function createDateRange(from?: string, to?: string): { gte?: Date; lte?: Date } | null {
  if (!from && !to) return null;

  const range: { gte?: Date; lte?: Date } = {};

  if (from) {
    range.gte = parseDate(from);
  }

  if (to) {
    range.lte = parseDate(to);
  }

  return range;
}

/**
 * Get date N days ago
 */
export function getDaysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

/**
 * Format date for display
 */
export function formatDateForDisplay(date: Date): string {
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Check if date is within range
 */
export function isDateInRange(date: Date, from?: Date, to?: Date): boolean {
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

/**
 * Get start of day
 */
export function getStartOfDay(date: Date): Date {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
}

/**
 * Get end of day
 */
export function getEndOfDay(date: Date): Date {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
}

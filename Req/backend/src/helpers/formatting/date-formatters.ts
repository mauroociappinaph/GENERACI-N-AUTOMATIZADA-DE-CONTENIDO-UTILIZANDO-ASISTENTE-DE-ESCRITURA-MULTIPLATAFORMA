/**
 * Date formatting helpers
 * SRP: Only handles date formatting utilities
 */

export const formatDateToISO = (date: Date): string => {
  return date.toISOString();
};

export const formatDateToLocal = (date: Date, locale: string = 'es-ES'): string => {
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateForDatabase = (date: Date): string => {
  return date.toISOString().slice(0, 19).replace('T', ' ');
};

export const isValidDate = (date: unknown): date is Date => {
  return date instanceof Date && !isNaN(date.getTime());
};

export const parseDate = (dateString: string): Date | null => {
  const parsed = new Date(dateString);
  return isValidDate(parsed) ? parsed : null;
};

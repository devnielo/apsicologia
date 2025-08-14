import { format, parseISO, isValid, addMinutes, subMinutes } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';

/**
 * Format a date for display
 */
export function formatDate(date: Date | string, formatString: string = 'yyyy-MM-dd'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';
  return format(dateObj, formatString);
}

/**
 * Format time for display
 */
export function formatTime(date: Date | string, formatString: string = 'HH:mm'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';
  return format(dateObj, formatString);
}

/**
 * Format datetime for display
 */
export function formatDateTime(date: Date | string, formatString: string = 'yyyy-MM-dd HH:mm'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';
  return format(dateObj, formatString);
}

/**
 * Convert UTC date to timezone
 */
export function utcToTimezone(date: Date, timezone: string): Date {
  return toZonedTime(date, timezone);
}

/**
 * Convert timezone date to UTC
 */
export function timezoneToUtc(date: Date, timezone: string): Date {
  return fromZonedTime(date, timezone);
}

/**
 * Add buffer time to appointment
 */
export function addBufferTime(date: Date, bufferMinutes: number): Date {
  return addMinutes(date, bufferMinutes);
}

/**
 * Subtract buffer time from appointment
 */
export function subtractBufferTime(date: Date, bufferMinutes: number): Date {
  return subMinutes(date, bufferMinutes);
}

/**
 * Check if a date is valid
 */
export function isValidDate(date: any): date is Date {
  return date instanceof Date && isValid(date);
}

/**
 * Parse ISO string to Date
 */
export function parseDate(dateString: string): Date | null {
  try {
    const date = parseISO(dateString);
    return isValid(date) ? date : null;
  } catch {
    return null;
  }
}

/**
 * Get current date in timezone
 */
export function getCurrentDateInTimezone(timezone: string): Date {
  return toZonedTime(new Date(), timezone);
}

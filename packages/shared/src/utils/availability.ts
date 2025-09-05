// Utility functions for availability data transformation and validation

import { isValidTimeFormat } from './validation';

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

export interface FrontendAvailability {
  dayOfWeek: number;
  timeSlots: TimeSlot[];
}

export interface BackendAvailability {
  dayOfWeek: number;
  startTime?: string;
  endTime?: string;
  isAvailable: boolean;
}

/**
 * Validates day of week (0-6)
 */
export function isValidDayOfWeek(day: number): boolean {
  return Number.isInteger(day) && day >= 0 && day <= 6;
}

/**
 * Validates that end time is after start time
 */
export function isValidTimeRange(startTime: string, endTime: string): boolean {
  if (!isValidTimeFormat(startTime) || !isValidTimeFormat(endTime)) {
    return false;
  }
  
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  
  return endMinutes > startMinutes;
}

/**
 * Transform frontend availability format to backend format
 * Frontend: {dayOfWeek, timeSlots: [{startTime, endTime}]}
 * Backend: {dayOfWeek, startTime, endTime, isAvailable} (multiple entries for split shifts)
 */
export function transformFrontendToBackend(
  frontendData: FrontendAvailability[]
): BackendAvailability[] {
  // Ensure frontendData is an array
  if (!Array.isArray(frontendData)) {
    console.warn('transformFrontendToBackend: frontendData is not an array, returning empty array');
    return [];
  }
  
  const result: BackendAvailability[] = [];
  
  frontendData
    .filter(day => day && isValidDayOfWeek(day.dayOfWeek))
    .forEach(day => {
      // If no timeSlots or empty array, mark as unavailable
      if (!day.timeSlots || day.timeSlots.length === 0) {
        result.push({
          dayOfWeek: day.dayOfWeek,
          isAvailable: false
        });
        return;
      }

      // Process each time slot for the day (supports split shifts)
      day.timeSlots.forEach(slot => {
        // Validate time slot
        if (!slot.startTime || !slot.endTime) {
          return; // Skip invalid slots
        }

        if (!isValidTimeRange(slot.startTime, slot.endTime)) {
          throw new Error(`Invalid time range for day ${day.dayOfWeek}: ${slot.startTime} - ${slot.endTime}`);
        }

        result.push({
          dayOfWeek: day.dayOfWeek,
          startTime: slot.startTime,
          endTime: slot.endTime,
          isAvailable: true
        });
      });
    });
  
  return result;
}

/**
 * Transform backend availability format to frontend format
 * Backend: {dayOfWeek, startTime, endTime, isAvailable} (multiple entries for split shifts)
 * Frontend: {dayOfWeek, timeSlots: [{startTime, endTime}]}
 */
export function transformBackendToFrontend(
  backendData: BackendAvailability[]
): FrontendAvailability[] {
  // Group backend data by dayOfWeek
  const dayGroups = new Map<number, BackendAvailability[]>();
  
  backendData
    .filter(day => isValidDayOfWeek(day.dayOfWeek))
    .forEach(day => {
      if (!dayGroups.has(day.dayOfWeek)) {
        dayGroups.set(day.dayOfWeek, []);
      }
      dayGroups.get(day.dayOfWeek)!.push(day);
    });

  // Transform each day group
  const result: FrontendAvailability[] = [];
  
  dayGroups.forEach((dayEntries, dayOfWeek) => {
    const timeSlots: { startTime: string; endTime: string }[] = [];
    
    dayEntries.forEach(entry => {
      if (entry.isAvailable && entry.startTime && entry.endTime) {
        timeSlots.push({
          startTime: entry.startTime,
          endTime: entry.endTime
        });
      }
    });
    
    // Sort time slots by start time
    timeSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));
    
    result.push({
      dayOfWeek,
      timeSlots
    });
  });
  
  // Sort by dayOfWeek
  return result.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  data: BackendAvailability[];
}

/**
 * Validate and sanitize availability data structure
 */
export function validateAvailabilityData(data: any[]): ValidationResult {
  const errors: string[] = [];
  const sanitizedData: BackendAvailability[] = [];
  
  if (!Array.isArray(data)) {
    return {
      isValid: false,
      errors: ['Availability data must be an array'],
      data: []
    };
  }

  data.forEach((day, index) => {
    if (!day || typeof day !== 'object') {
      errors.push(`Day ${index}: Invalid day object`);
      return;
    }

    if (!isValidDayOfWeek(day.dayOfWeek)) {
      errors.push(`Day ${index}: Invalid dayOfWeek (must be 0-6)`);
      return;
    }

    // Handle backend format (already has startTime/endTime)
    if (day.startTime && day.endTime) {
      if (!isValidTimeFormat(day.startTime) || !isValidTimeFormat(day.endTime)) {
        errors.push(`Day ${index}: Invalid time format`);
        return;
      }
      
      if (!isValidTimeRange(day.startTime, day.endTime)) {
        errors.push(`Day ${index}: Invalid time range`);
        return;
      }

      sanitizedData.push({
        dayOfWeek: day.dayOfWeek,
        startTime: day.startTime,
        endTime: day.endTime,
        isAvailable: true
      });
      return;
    }

    // Handle frontend format (has timeSlots)
    if (day.timeSlots && Array.isArray(day.timeSlots)) {
      if (day.timeSlots.length === 0) {
        sanitizedData.push({
          dayOfWeek: day.dayOfWeek,
          isAvailable: false
        });
        return;
      }

      const firstSlot = day.timeSlots[0];
      if (!firstSlot.startTime || !firstSlot.endTime) {
        errors.push(`Day ${index}: Missing startTime or endTime in time slot`);
        return;
      }

      if (!isValidTimeFormat(firstSlot.startTime) || !isValidTimeFormat(firstSlot.endTime)) {
        errors.push(`Day ${index}: Invalid time format in time slot`);
        return;
      }

      if (!isValidTimeRange(firstSlot.startTime, firstSlot.endTime)) {
        errors.push(`Day ${index}: Invalid time range in time slot`);
        return;
      }

      sanitizedData.push({
        dayOfWeek: day.dayOfWeek,
        startTime: firstSlot.startTime,
        endTime: firstSlot.endTime,
        isAvailable: true
      });
      return;
    }

    // If no valid time data, mark as unavailable
    sanitizedData.push({
      dayOfWeek: day.dayOfWeek,
      isAvailable: false
    });
  });

  return {
    isValid: errors.length === 0,
    errors,
    data: sanitizedData
  };
}

/**
 * Get day name from day number
 */
export function getDayName(dayOfWeek: number, locale: string = 'es'): string {
  const days = {
    es: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
    en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  };
  
  return days[locale as keyof typeof days]?.[dayOfWeek] || `Day ${dayOfWeek}`;
}

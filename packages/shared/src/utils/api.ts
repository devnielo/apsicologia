import type { IApiResponse, IPaginatedResponse } from '../types/common.js';

/**
 * Create success API response
 */
export function createSuccessResponse<T>(data: T, meta?: any): IApiResponse<T> {
  return {
    success: true,
    data,
    meta,
  };
}

/**
 * Create error API response
 */
export function createErrorResponse(message: string, code?: string, details?: any): IApiResponse {
  return {
    success: false,
    error: {
      message,
      code,
      details,
    },
  };
}

/**
 * Create paginated response
 */
export function createPaginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): IPaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit);
  
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  };
}

/**
 * Generate unique ID (simple implementation)
 */
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

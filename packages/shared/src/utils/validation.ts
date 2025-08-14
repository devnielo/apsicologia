/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (Spanish format)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+34|0034|34)?[6-9]\d{8}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): boolean {
  // At least 8 characters, one uppercase, one lowercase, one number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
}

/**
 * Validate ObjectId format
 */
export function isValidObjectId(id: string): boolean {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
}

/**
 * Validate time format (HH:mm)
 */
export function isValidTimeFormat(time: string): boolean {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(time);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sanitize HTML string
 */
export function sanitizeHtml(html: string): string {
  return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
}

/**
 * Validate file type
 */
export function isValidFileType(filename: string, allowedTypes: string[]): boolean {
  const extension = filename.split('.').pop()?.toLowerCase();
  return extension ? allowedTypes.includes(extension) : false;
}

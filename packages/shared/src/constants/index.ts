// User roles and permissions
export const USER_ROLES = {
  ADMIN: 'admin',
  PROFESSIONAL: 'professional',
  RECEPTION: 'reception',
  PATIENT: 'patient',
} as const;

// Appointment statuses
export const APPOINTMENT_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed',
  NO_SHOW: 'no-show',
  RESCHEDULED: 'rescheduled',
} as const;

// Payment statuses
export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  CANCELLED: 'cancelled',
} as const;

// Appointment sources
export const APPOINTMENT_SOURCE = {
  ADMIN: 'admin',
  PUBLIC: 'public',
  PATIENT: 'patient',
  PROFESSIONAL: 'professional',
} as const;

// File owner types
export const FILE_OWNER_TYPE = {
  PATIENT: 'patient',
  APPOINTMENT: 'appointment',
  NOTE: 'note',
  PROFESSIONAL: 'professional',
  CENTER: 'center',
} as const;

// Audit actions
export const AUDIT_ACTION = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LOGIN: 'login',
  LOGOUT: 'logout',
  VIEW: 'view',
  EXPORT: 'export',
  DOWNLOAD: 'download',
} as const;

// Common time constants
export const TIME_CONSTANTS = {
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  MONTH: 30 * 24 * 60 * 60 * 1000,
  YEAR: 365 * 24 * 60 * 60 * 1000,
} as const;

// JWT token expiry times
export const TOKEN_EXPIRY = {
  ACCESS_TOKEN: '15m',
  REFRESH_TOKEN: '7d',
  RESET_PASSWORD: '1h',
  EMAIL_VERIFICATION: '24h',
  APPOINTMENT_CONFIRMATION: '30d',
} as const;

// Cache TTL in seconds
export const CACHE_TTL = {
  SESSION: 24 * 60 * 60, // 24 hours
  SLOTS: 15 * 60, // 15 minutes
  STATS: 60 * 60, // 1 hour
  USER_PROFILE: 30 * 60, // 30 minutes
  AVAILABILITY: 10 * 60, // 10 minutes
} as const;

// Rate limiting
export const RATE_LIMITS = {
  API_GENERAL: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 100,
  },
  API_AUTH: {
    WINDOW_MS: 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: 5,
  },
  API_BOOKING: {
    WINDOW_MS: 60 * 1000, // 1 minute
    MAX_REQUESTS: 3,
  },
} as const;

// File upload limits
export const FILE_LIMITS = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'audio/mpeg',
    'audio/wav',
    'audio/mp4',
    'video/mp4',
    'video/webm',
  ],
  ALLOWED_EXTENSIONS: [
    'jpg',
    'jpeg',
    'png',
    'gif',
    'webp',
    'pdf',
    'doc',
    'docx',
    'mp3',
    'wav',
    'mp4',
    'webm',
  ],
} as const;

// Email templates
export const EMAIL_TEMPLATES = {
  APPOINTMENT_CONFIRMATION: 'appointment-confirmation',
  APPOINTMENT_REMINDER: 'appointment-reminder',
  APPOINTMENT_CANCELLED: 'appointment-cancelled',
  APPOINTMENT_RESCHEDULED: 'appointment-rescheduled',
  PASSWORD_RESET: 'password-reset',
  EMAIL_VERIFICATION: 'email-verification',
  WELCOME: 'welcome',
  INVOICE_SENT: 'invoice-sent',
  PAYMENT_CONFIRMATION: 'payment-confirmation',
  FORM_ASSIGNED: 'form-assigned',
} as const;

// Default pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

// Timezone
export const DEFAULT_TIMEZONE = 'Europe/Madrid';
export const DEFAULT_LOCALE = 'es';

// Currency
export const DEFAULT_CURRENCY = 'EUR';

// Professional specialties (predefined options)
export const SPECIALTIES = [
  'Psicología Clínica',
  'Psicología Infantil',
  'Psicología de Parejas',
  'Psicología Forense',
  'Neuropsicología',
  'Psicología Educativa',
  'Psicología Deportiva',
  'Psicología Organizacional',
  'Terapia Cognitivo-Conductual',
  'Terapia Familiar',
  'Terapia Gestalt',
  'Terapia Humanística',
  'Terapia EMDR',
  'Mindfulness',
  'Coaching',
] as const;

// Service categories
export const SERVICE_CATEGORIES = [
  'Consulta Individual',
  'Terapia de Pareja',
  'Terapia Familiar',
  'Terapia Infantil',
  'Evaluación Psicológica',
  'Coaching',
  'Talleres Grupales',
  'Supervisión',
  'Formación',
] as const;

// Room types
export const ROOM_TYPES = {
  PHYSICAL: 'physical',
  VIRTUAL: 'virtual',
} as const;

// Gender options
export const GENDER_OPTIONS = [
  'male',
  'female',
  'other',
  'prefer_not_to_say',
] as const;

// Languages
export const LANGUAGES = [
  'es',
  'ca',
  'en',
  'fr',
  'de',
  'it',
  'pt',
] as const;

// System status
export const SYSTEM_STATUS = {
  HEALTHY: 'healthy',
  UNHEALTHY: 'unhealthy',
  DEGRADED: 'degraded',
} as const;

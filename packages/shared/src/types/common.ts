export type ObjectId = string;

export interface ITimestamps {
  createdAt: Date;
  updatedAt: Date;
}

export interface ISoftDelete {
  deletedAt?: Date;
  isDeleted: boolean;
}

export interface IAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface IContact {
  name: string;
  phone: string;
  email?: string;
  relationship: string;
}

export interface IDateRange {
  start: Date;
  end: Date;
  reason?: string;
}

export interface IWeeklyAvailability {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 6 = Saturday
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  isAvailable: boolean;
}

export interface IConsent {
  type: 'privacy' | 'marketing' | 'treatment' | 'recording' | 'data_processing';
  version: string;
  consentedAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface IPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface IPaginatedResponse<T> {
  data: T[];
  pagination: IPagination;
}

export interface IApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  meta?: any;
}

export interface ISearchFilters {
  query?: string;
  status?: string[];
  dateFrom?: Date;
  dateTo?: Date;
  professionalId?: ObjectId;
  patientId?: ObjectId;
  serviceId?: ObjectId;
  roomId?: ObjectId;
}

export interface ISortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export type UserRole = 'admin' | 'professional' | 'reception' | 'patient';

export type AppointmentStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'cancelled' 
  | 'completed' 
  | 'no-show'
  | 'rescheduled';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';

export type AppointmentSource = 'admin' | 'public' | 'patient' | 'professional';

export type FileOwnerType = 'patient' | 'appointment' | 'note' | 'professional' | 'center';

export type AuditAction = 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'login' 
  | 'logout' 
  | 'view' 
  | 'export' 
  | 'download';

export interface IHealthCheck {
  service: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  timestamp: Date;
  responseTime?: number;
  details?: any;
}

export interface ISystemStatus {
  overall: 'healthy' | 'unhealthy' | 'degraded';
  services: IHealthCheck[];
  uptime: number;
  version: string;
}

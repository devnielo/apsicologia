import type { 
  ObjectId, 
  ITimestamps, 
  ISoftDelete, 
  AppointmentStatus, 
  PaymentStatus, 
  AppointmentSource 
} from './common.js';

export interface IAppointment extends ITimestamps, ISoftDelete {
  _id: ObjectId;
  patientId: ObjectId;
  professionalId: ObjectId;
  serviceId: ObjectId;
  roomId?: ObjectId;
  start: Date;
  end: Date;
  duration: number; // in minutes
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  source: AppointmentSource;
  notes?: string;
  privateNotes?: string; // Only visible to professionals
  publicNotes?: string; // Visible to patient
  jitsiRoomId?: string;
  jitsiMeetingUrl?: string;
  remindersSent: Date[];
  confirmationToken?: string;
  cancelledAt?: Date;
  cancelReason?: string;
  cancelledBy?: ObjectId;
  rescheduledFromId?: ObjectId;
  rescheduledToId?: ObjectId;
  noShowReason?: string;
  rating?: number; // 1-5 stars from patient
  feedback?: string;
  price: number;
  currency: string;
  discount?: number;
  finalPrice: number;
  insuranceCovered?: number;
  followUpRequired: boolean;
  followUpDate?: Date;
  attachments: ObjectId[]; // File references
  tags: string[];
  version: number; // For optimistic locking
}

export interface IAppointmentCreateInput {
  patientId: ObjectId;
  professionalId: ObjectId;
  serviceId: ObjectId;
  roomId?: ObjectId;
  start: Date;
  end: Date;
  notes?: string;
  privateNotes?: string;
  publicNotes?: string;
  source?: AppointmentSource;
  price?: number;
  discount?: number;
  insuranceCovered?: number;
  tags?: string[];
}

export interface IAppointmentUpdateInput {
  patientId?: ObjectId;
  professionalId?: ObjectId;
  serviceId?: ObjectId;
  roomId?: ObjectId;
  start?: Date;
  end?: Date;
  status?: AppointmentStatus;
  paymentStatus?: PaymentStatus;
  notes?: string;
  privateNotes?: string;
  publicNotes?: string;
  price?: number;
  discount?: number;
  insuranceCovered?: number;
  followUpRequired?: boolean;
  followUpDate?: Date;
  tags?: string[];
}

export interface IAppointmentRescheduleInput {
  appointmentId: ObjectId;
  newStart: Date;
  newEnd: Date;
  reason?: string;
  notifyPatient?: boolean;
}

export interface IAppointmentCancelInput {
  appointmentId: ObjectId;
  reason: string;
  refundAmount?: number;
  notifyPatient?: boolean;
}

export interface IAppointmentSearchInput {
  query?: string;
  patientId?: ObjectId;
  professionalId?: ObjectId;
  serviceId?: ObjectId;
  roomId?: ObjectId;
  status?: AppointmentStatus[];
  paymentStatus?: PaymentStatus[];
  source?: AppointmentSource[];
  dateFrom?: Date;
  dateTo?: Date;
  tags?: string[];
  hasNotes?: boolean;
  hasAttachments?: boolean;
  priceRange?: {
    min?: number;
    max?: number;
  };
}

export interface IAppointmentSlot {
  start: Date;
  end: Date;
  duration: number;
  professionalId: ObjectId;
  serviceId: ObjectId;
  roomId?: ObjectId;
  price: number;
  isAvailable: boolean;
  isBlocked?: boolean;
  blockReason?: string;
  isRecurring?: boolean;
  recurringId?: ObjectId;
}

export interface IAppointmentAvailabilityRequest {
  professionalId?: ObjectId;
  serviceId?: ObjectId;
  date: Date;
  duration?: number;
  includeFull?: boolean;
}

export interface IAppointmentBookingRequest {
  patientId?: ObjectId;
  patientInfo?: {
    name: string;
    email: string;
    phone: string;
  };
  professionalId: ObjectId;
  serviceId: ObjectId;
  start: Date;
  notes?: string;
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  marketingConsent?: boolean;
  paymentMethod?: 'online' | 'cash' | 'card' | 'insurance';
  couponCode?: string;
}

export interface IAppointmentConfirmation {
  appointmentId: ObjectId;
  confirmationToken: string;
  icsContent: string;
  jitsiMeetingUrl?: string;
  instructions?: string;
}

export interface IAppointmentReminder {
  appointmentId: ObjectId;
  type: 'email' | 'sms' | 'push';
  scheduledFor: Date;
  sent: boolean;
  sentAt?: Date;
  error?: string;
}

export interface IAppointmentCalendarEvent {
  id: ObjectId;
  title: string;
  start: Date;
  end: Date;
  allDay: boolean;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  status: AppointmentStatus;
  paymentStatus: PaymentStatus;
  patientName: string;
  professionalName: string;
  serviceName: string;
  roomName?: string;
  price: number;
  editable: boolean;
  url?: string;
  extendedProps: {
    appointmentId: ObjectId;
    patientId: ObjectId;
    professionalId: ObjectId;
    serviceId: ObjectId;
    roomId?: ObjectId;
    hasNotes: boolean;
    hasAttachments: boolean;
    jitsiMeetingUrl?: string;
  };
}

export interface IAppointmentStats {
  total: number;
  byStatus: Record<AppointmentStatus, number>;
  byPaymentStatus: Record<PaymentStatus, number>;
  bySource: Record<AppointmentSource, number>;
  revenue: {
    total: number;
    paid: number;
    pending: number;
    refunded: number;
  };
  averageRating?: number;
  completionRate: number;
  noShowRate: number;
  cancellationRate: number;
}

export interface IAppointmentWithDetails extends IAppointment {
  patient: {
    _id: ObjectId;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
  };
  professional: {
    _id: ObjectId;
    name: string;
    specialties: string[];
    avatar?: string;
  };
  service: {
    _id: ObjectId;
    name: string;
    duration: number;
    price: number;
    color?: string;
  };
  room?: {
    _id: ObjectId;
    name: string;
    type: 'physical' | 'virtual';
  };
}

export interface IRecurringAppointment {
  _id: ObjectId;
  patientId: ObjectId;
  professionalId: ObjectId;
  serviceId: ObjectId;
  roomId?: ObjectId;
  startDate: Date;
  endDate?: Date;
  frequency: 'weekly' | 'biweekly' | 'monthly';
  dayOfWeek: number; // 0-6, Sunday = 0
  timeSlot: {
    start: string; // HH:mm
    end: string; // HH:mm
  };
  maxOccurrences?: number;
  isActive: boolean;
  notes?: string;
  createdAppointments: ObjectId[];
  exceptions: Date[]; // Dates to skip
  createdAt: Date;
  updatedAt: Date;
}

export interface IAppointmentTemplate {
  _id: ObjectId;
  name: string;
  description?: string;
  professionalId: ObjectId;
  serviceId: ObjectId;
  duration: number;
  price: number;
  notes?: string;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

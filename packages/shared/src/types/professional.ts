import type { ObjectId, ITimestamps, ISoftDelete, IWeeklyAvailability, IDateRange } from './common.js';

export interface IProfessional extends ITimestamps, ISoftDelete {
  _id: ObjectId;
  userId: ObjectId;
  name: string;
  title?: string;
  bio?: string;
  specialties: string[];
  licenseNumber?: string;
  services: ObjectId[];
  rooms: ObjectId[];
  weeklyAvailability: IWeeklyAvailability[];
  vacations: IDateRange[];
  breaks: IDateRange[]; // Short breaks during the day
  timezone: string;
  bufferMinutes: number; // Time between appointments
  telehealthEnabled: boolean;
  isActive: boolean;
  color: string; // For calendar display
  avatar?: string;
  phone?: string;
  email?: string;
  address?: string;
  languages: string[];
  yearsOfExperience?: number;
  education?: string[];
  certifications?: string[];
  socialLinks?: {
    website?: string;
    linkedin?: string;
    twitter?: string;
  };
  consultationFee?: number;
  currency: string;
  acceptsOnlinePayments: boolean;
  paymentMethods?: string[];
  rating?: number;
  totalReviews: number;
  totalAppointments: number;
  completionRate: number;
}

export interface IProfessionalCreateInput {
  userId: ObjectId;
  name: string;
  title?: string;
  bio?: string;
  specialties: string[];
  licenseNumber?: string;
  services?: ObjectId[];
  rooms?: ObjectId[];
  weeklyAvailability?: IWeeklyAvailability[];
  timezone?: string;
  bufferMinutes?: number;
  telehealthEnabled?: boolean;
  color?: string;
  phone?: string;
  email?: string;
  languages?: string[];
  consultationFee?: number;
  currency?: string;
  acceptsOnlinePayments?: boolean;
  paymentMethods?: string[];
}

export interface IProfessionalUpdateInput {
  name?: string;
  title?: string;
  bio?: string;
  specialties?: string[];
  licenseNumber?: string;
  services?: ObjectId[];
  rooms?: ObjectId[];
  weeklyAvailability?: IWeeklyAvailability[];
  vacations?: IDateRange[];
  timezone?: string;
  bufferMinutes?: number;
  telehealthEnabled?: boolean;
  isActive?: boolean;
  color?: string;
  avatar?: string;
  phone?: string;
  email?: string;
  languages?: string[];
  yearsOfExperience?: number;
  education?: string[];
  certifications?: string[];
  socialLinks?: {
    website?: string;
    linkedin?: string;
    twitter?: string;
  };
  consultationFee?: number;
  acceptsOnlinePayments?: boolean;
  paymentMethods?: string[];
}

export interface IProfessionalPublic {
  _id: ObjectId;
  name: string;
  title?: string;
  bio?: string;
  specialties: string[];
  avatar?: string;
  languages: string[];
  yearsOfExperience?: number;
  rating?: number;
  totalReviews: number;
  telehealthEnabled: boolean;
  consultationFee?: number;
  currency: string;
  acceptsOnlinePayments: boolean;
  isActive: boolean;
}

export interface IProfessionalStats {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  revenue: number;
  averageRating?: number;
  completionRate: number;
  averageSessionDuration: number;
  patientRetentionRate: number;
  nextAvailableSlot?: Date;
}

export interface IProfessionalCalendar {
  professionalId: ObjectId;
  date: Date;
  slots: {
    start: Date;
    end: Date;
    isAvailable: boolean;
    isBooked: boolean;
    isBlocked: boolean;
    appointmentId?: ObjectId;
    blockReason?: string;
  }[];
  workingHours: {
    start: string;
    end: string;
  };
  breaks: IDateRange[];
}

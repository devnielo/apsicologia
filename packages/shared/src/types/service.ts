import type { ObjectId, ITimestamps, ISoftDelete } from './common.js';

export interface IService extends ITimestamps, ISoftDelete {
  _id: ObjectId;
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
  currency: string;
  
  // Visual and categorization
  color?: string;
  category?: string;
  tags: string[];
  
  // Availability settings
  isActive: boolean;
  isOnlineAvailable: boolean;
  requiresApproval: boolean;
  
  // Professional restrictions
  availableTo: ObjectId[]; // Professional IDs
  isPubliclyBookable: boolean;
  
  // Pricing and billing
  priceDetails: {
    basePrice: number;
    discountedPrice?: number;
    discounts?: {
      name: string;
      percentage: number;
      validFrom?: Date;
      validUntil?: Date;
    }[];
  };
  
  // Service configuration
  settings: {
    maxAdvanceBookingDays: number;
    minAdvanceBookingHours: number;
    allowSameDayBooking: boolean;
    bufferBefore: number; // minutes
    bufferAfter: number; // minutes
    maxConcurrentBookings: number;
    requiresIntake: boolean;
    intakeFormId?: ObjectId;
  };
  
  // Preparation and follow-up
  preparation?: {
    instructions?: string;
    requiredDocuments?: string[];
    recommendedDuration?: number; // minutes before appointment
  };
  
  followUp?: {
    instructions?: string;
    scheduledTasks?: string[];
    recommendedGap?: number; // days until next appointment
  };
  
  // Statistics (computed)
  stats: {
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    averageRating?: number;
    totalRevenue: number;
  };
}

export interface IServiceCreateInput {
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
  currency?: string;
  color?: string;
  category?: string;
  tags?: string[];
  isOnlineAvailable?: boolean;
  requiresApproval?: boolean;
  availableTo?: ObjectId[];
  isPubliclyBookable?: boolean;
  settings?: {
    maxAdvanceBookingDays?: number;
    minAdvanceBookingHours?: number;
    allowSameDayBooking?: boolean;
    bufferBefore?: number;
    bufferAfter?: number;
    maxConcurrentBookings?: number;
    requiresIntake?: boolean;
    intakeFormId?: ObjectId;
  };
  preparation?: {
    instructions?: string;
    requiredDocuments?: string[];
    recommendedDuration?: number;
  };
  followUp?: {
    instructions?: string;
    scheduledTasks?: string[];
    recommendedGap?: number;
  };
}

export interface IServiceUpdateInput {
  name?: string;
  description?: string;
  durationMinutes?: number;
  price?: number;
  currency?: string;
  color?: string;
  category?: string;
  tags?: string[];
  isActive?: boolean;
  isOnlineAvailable?: boolean;
  requiresApproval?: boolean;
  isPubliclyBookable?: boolean;
  settings?: Partial<IServiceCreateInput['settings']>;
  preparation?: Partial<IServiceCreateInput['preparation']>;
  followUp?: Partial<IServiceCreateInput['followUp']>;
}

export interface IServiceCategory {
  name: string;
  description?: string;
  color: string;
  isActive: boolean;
  sortOrder: number;
}

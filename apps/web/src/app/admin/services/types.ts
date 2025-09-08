export interface ServiceDiscount {
  name: string;
  percentage: number;
  validFrom?: Date;
  validUntil?: Date;
}

export interface ServicePriceDetails {
  basePrice: number;
  discountedPrice?: number;
  discounts?: ServiceDiscount[];
}

export interface ServiceSettings {
  maxAdvanceBookingDays: number;
  minAdvanceBookingHours: number;
  allowSameDayBooking: boolean;
  bufferBefore: number; // minutes
  bufferAfter: number; // minutes
  maxConcurrentBookings: number;
  requiresIntake: boolean;
  intakeFormId?: string;
}

export interface ServicePreparation {
  instructions?: string;
  requiredDocuments?: string[];
  recommendedDuration?: number; // minutes before appointment
}

export interface ServiceFollowUp {
  instructions?: string;
  scheduledTasks?: string[];
  recommendedGap?: number; // days until next appointment
}

export interface ServiceStats {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  averageRating?: number;
  totalRevenue: number;
}

export interface Service {
  id: string;
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
  availableTo: string[]; // Professional IDs
  isPubliclyBookable: boolean;
  
  // Pricing and billing
  priceDetails: ServicePriceDetails;
  
  // Service configuration
  settings: ServiceSettings;
  
  // Preparation and follow-up
  preparation?: ServicePreparation;
  followUp?: ServiceFollowUp;
  
  // Statistics (computed)
  stats: ServiceStats;
  
  // Soft delete and audit
  deletedAt?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Form types for create/edit
export interface ServiceFormData {
  // Basic information
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
  isPubliclyBookable: boolean;
  
  // Professional restrictions
  availableTo: string[];
  
  // Pricing details
  priceDetails: {
    basePrice: number;
    discountedPrice?: number;
    discounts: ServiceDiscount[];
  };
  
  // Service configuration
  settings: ServiceSettings;
  
  // Preparation and follow-up
  preparation?: ServicePreparation;
  followUp?: ServiceFollowUp;
}

// API response types
export interface ServiceListResponse {
  services: Service[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Filter types
export interface ServiceFilters {
  search?: string;
  category?: string | string[];
  isActive?: boolean;
  isOnlineAvailable?: boolean;
  requiresApproval?: boolean;
  isPubliclyBookable?: boolean;
  professionalId?: string;
  tags?: string[];
  priceMin?: number;
  priceMax?: number;
  durationMin?: number;
  durationMax?: number;
  currency?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  dateFrom?: string;
  dateTo?: string;
  dateField?: string;
}

export interface ServicePaginationState {
  page: number;
  limit: number;
  total: number;
}

export interface ServiceSortState {
  field: string;
  order: 'asc' | 'desc';
}

export interface ServiceTableFilters {
  [key: string]: any;
}

import mongoose, { Document, Schema } from 'mongoose';
import { IProfessional } from '@apsicologia/shared/types';

export interface IProfessionalDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone?: string;
  
  // Professional information
  licenseNumber?: string;
  specialties: string[];
  bio?: string;
  title: string;
  yearsOfExperience?: number;
  profilePicture?: string; // Base64 encoded image
  
  // Services and pricing
  services: mongoose.Types.ObjectId[];
  defaultServiceDuration: number; // minutes
  
  // Availability settings
  weeklyAvailability: {
    dayOfWeek: number; // 0-6 (Sunday-Saturday)
    startTime: string; // HH:MM format
    endTime: string; // HH:MM format
    isAvailable: boolean;
  }[];
  
  // Time management
  bufferMinutes: number; // Buffer between appointments
  timezone: string;
  
  // Rooms and locations
  assignedRooms: mongoose.Types.ObjectId[];
  defaultRoom?: mongoose.Types.ObjectId;
  
  // Vacation and absence management
  vacations: {
    startDate: Date;
    endDate: Date;
    reason?: string;
    isRecurring?: boolean;
    recurrencePattern?: string; // RRULE format
  }[];
  
  // Settings and preferences
  settings: {
    allowOnlineBooking: boolean;
    requireApproval: boolean;
    maxAdvanceBookingDays: number;
    minAdvanceBookingHours: number;
    allowSameDayBooking: boolean;
    automaticConfirmation: boolean;
    sendReminders: boolean;
    reminderSettings: {
      email24h: boolean;
      email2h: boolean;
      sms24h: boolean;
      sms2h: boolean;
    };
  };
  
  // Contact and social
  contactInfo: {
    website?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  };
  
  // Professional status
  status: 'active' | 'inactive' | 'on_leave' | 'suspended';
  isAcceptingNewPatients: boolean;
  maxPatientsPerDay?: number;
  
  // Billing and financial
  billingSettings: {
    defaultPaymentMethod: 'cash' | 'card' | 'transfer' | 'insurance';
    acceptsInsurance: boolean;
    insuranceProviders: string[];
    taxRate?: number;
  };
  
  // Statistics (computed fields)
  stats: {
    totalPatients: number;
    activePatients: number;
    totalAppointments: number;
    averageRating?: number;
    completionRate?: number;
  };
  
  // Soft delete and audit
  isActive: boolean;
  deletedAt?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const WeeklyAvailabilitySchema = new Schema({
  dayOfWeek: {
    type: Number,
    required: true,
    min: 0,
    max: 6,
  },
  startTime: {
    type: String,
    required: function(this: any) { return this.isAvailable; },
    validate: {
      validator: (v: string) => !v || /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v),
      message: 'Invalid time format. Use HH:MM',
    },
  },
  endTime: {
    type: String,
    required: function(this: any) { return this.isAvailable; },
    validate: {
      validator: (v: string) => !v || /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v),
      message: 'Invalid time format. Use HH:MM',
    },
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
}, { _id: false });

const VacationSchema = new Schema({
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(this: any, v: Date) {
        return v >= this.startDate;
      },
      message: 'End date must be after start date',
    },
  },
  reason: {
    type: String,
    trim: true,
  },
  isRecurring: {
    type: Boolean,
    default: false,
  },
  recurrencePattern: {
    type: String,
    trim: true,
  },
}, { timestamps: true });

const ProfessionalSchema = new Schema<IProfessionalDocument>(
  {
    // Link to user account (required)
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
      index: true,
    },
    
    // Basic information
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
      index: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      trim: true,
      index: true,
    },
    
    // Professional information
    licenseNumber: {
      type: String,
      trim: true,
      sparse: true,
      index: true,
    },
    specialties: {
      type: [String],
      default: [],
      index: true,
    },
    bio: {
      type: String,
      maxlength: [1000, 'Bio cannot exceed 1000 characters'],
    },
    title: {
      type: String,
      required: [true, 'Professional title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    yearsOfExperience: {
      type: Number,
      min: [0, 'Years of experience cannot be negative'],
      max: [50, 'Years of experience seems too high'],
    },
    profilePicture: {
      type: String,
      trim: true,
      maxlength: [5000000, 'Profile picture cannot exceed 5MB when base64 encoded'], // ~5MB limit
    },
    
    // Services and pricing
    services: {
      type: [Schema.Types.ObjectId],
      ref: 'Service',
      default: [],
      index: true,
    },
    defaultServiceDuration: {
      type: Number,
      default: 50, // 50 minutes default session
      min: [15, 'Minimum service duration is 15 minutes'],
      max: [240, 'Maximum service duration is 4 hours'],
    },
    
    // Availability settings
    weeklyAvailability: {
      type: [WeeklyAvailabilitySchema],
      default: [
        // Default Monday to Friday 9:00-17:00
        { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isAvailable: true },
        { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isAvailable: true },
        { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isAvailable: true },
        { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isAvailable: true },
        { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', isAvailable: true },
        { dayOfWeek: 6, startTime: '09:00', endTime: '17:00', isAvailable: false },
        { dayOfWeek: 0, startTime: '09:00', endTime: '17:00', isAvailable: false },
      ],
    },
    
    // Time management
    bufferMinutes: {
      type: Number,
      default: 10,
      min: [0, 'Buffer minutes cannot be negative'],
      max: [60, 'Buffer minutes cannot exceed 1 hour'],
    },
    timezone: {
      type: String,
      default: 'Europe/Madrid',
    },
    
    // Rooms and locations
    assignedRooms: {
      type: [Schema.Types.ObjectId],
      ref: 'Room',
      default: [],
      index: true,
    },
    defaultRoom: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      index: true,
    },
    
    // Vacation and absence management
    vacations: {
      type: [VacationSchema],
      default: [],
    },
    
    // Settings and preferences
    settings: {
      allowOnlineBooking: { type: Boolean, default: true },
      requireApproval: { type: Boolean, default: false },
      maxAdvanceBookingDays: { type: Number, default: 30, min: 1, max: 365 },
      minAdvanceBookingHours: { type: Number, default: 2, min: 0, max: 72 },
      allowSameDayBooking: { type: Boolean, default: true },
      automaticConfirmation: { type: Boolean, default: true },
      sendReminders: { type: Boolean, default: true },
      reminderSettings: {
        email24h: { type: Boolean, default: true },
        email2h: { type: Boolean, default: false },
        sms24h: { type: Boolean, default: false },
        sms2h: { type: Boolean, default: false },
      },
    },
    
    // Contact and social
    contactInfo: {
      website: { type: String, trim: true },
      linkedin: { type: String, trim: true },
      twitter: { type: String, trim: true },
      instagram: { type: String, trim: true },
    },
    
    // Professional status
    status: {
      type: String,
      enum: ['active', 'inactive', 'on_leave', 'suspended'],
      default: 'active',
      index: true,
    },
    isAcceptingNewPatients: {
      type: Boolean,
      default: true,
      index: true,
    },
    maxPatientsPerDay: {
      type: Number,
      min: [1, 'Minimum 1 patient per day'],
      max: [20, 'Maximum 20 patients per day'],
    },
    
    // Billing and financial
    billingSettings: {
      defaultPaymentMethod: {
        type: String,
        enum: ['cash', 'card', 'transfer'],
        default: 'cash',
      },
      acceptsOnlinePayments: {
        type: Boolean,
        default: false,
      },
      paymentMethods: {
        type: [String],
        default: [],
      },
      taxRate: { type: Number, min: 0, max: 100 }, // Percentage
    },
    
    // Statistics (will be updated by scheduled jobs)
    stats: {
      totalPatients: { type: Number, default: 0 },
      activePatients: { type: Number, default: 0 },
      totalAppointments: { type: Number, default: 0 },
      averageRating: { type: Number, min: 0, max: 5 },
      completionRate: { type: Number, min: 0, max: 100 }, // Percentage
    },
    
    // Soft delete and audit
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    deletedAt: {
      type: Date,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc: any, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound indexes for common queries
ProfessionalSchema.index({ status: 1, isActive: 1 });
ProfessionalSchema.index({ specialties: 1, status: 1, isActive: 1 });
ProfessionalSchema.index({ services: 1, status: 1, isActive: 1 });
ProfessionalSchema.index({ isAcceptingNewPatients: 1, status: 1, isActive: 1 });
ProfessionalSchema.index({ createdAt: -1 });

// Text search index
ProfessionalSchema.index({ 
  name: 'text', 
  specialties: 'text', 
  bio: 'text' 
});

// Pre-save middleware
ProfessionalSchema.pre('save', function(this: IProfessionalDocument, next) {
  // Ensure default room is in assigned rooms
  if (this.defaultRoom && !this.assignedRooms.includes(this.defaultRoom)) {
    this.assignedRooms.push(this.defaultRoom);
  }
  
  // Sort weekly availability by day
  this.weeklyAvailability.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  
  next();
});

// Static methods
ProfessionalSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase(), isActive: true });
};

ProfessionalSchema.statics.findBySpecialty = function(specialty: string) {
  return this.find({ 
    specialties: specialty,
    status: 'active',
    isActive: true 
  });
};

ProfessionalSchema.statics.findAvailableForBooking = function() {
  return this.find({
    status: 'active',
    isAcceptingNewPatients: true,
    'settings.allowOnlineBooking': true,
    isActive: true,
  });
};

ProfessionalSchema.statics.findByService = function(serviceId: mongoose.Types.ObjectId) {
  return this.find({
    services: serviceId,
    status: 'active',
    isActive: true,
  });
};

// Instance methods
ProfessionalSchema.methods.addService = function(serviceId: mongoose.Types.ObjectId) {
  if (!this.services.includes(serviceId)) {
    this.services.push(serviceId);
  }
  return this.save();
};

ProfessionalSchema.methods.removeService = function(serviceId: mongoose.Types.ObjectId) {
  this.services = this.services.filter((id: mongoose.Types.ObjectId) => !id.equals(serviceId));
  return this.save();
};

ProfessionalSchema.methods.addSpecialty = function(specialty: string) {
  if (!this.specialties.includes(specialty)) {
    this.specialties.push(specialty);
  }
  return this.save();
};

ProfessionalSchema.methods.removeSpecialty = function(specialty: string) {
  this.specialties = this.specialties.filter((s: string) => s !== specialty);
  return this.save();
};

ProfessionalSchema.methods.addVacation = function(
  startDate: Date,
  endDate: Date,
  reason?: string,
  isRecurring: boolean = false,
  recurrencePattern?: string
) {
  this.vacations.push({
    startDate,
    endDate,
    reason,
    isRecurring,
    recurrencePattern,
  });
  return this.save();
};

ProfessionalSchema.methods.removeVacation = function(vacationId: string) {
  this.vacations = this.vacations.filter((v: any) => v._id?.toString() !== vacationId);
  return this.save();
};

ProfessionalSchema.methods.isAvailableOnDate = function(date: Date): boolean {
  const dayOfWeek = date.getDay();
  const availability = this.weeklyAvailability.find((a: any) => a.dayOfWeek === dayOfWeek);
  
  if (!availability || !availability.isAvailable) {
    return false;
  }
  
  // Check if date falls within any vacation period
  const isOnVacation = this.vacations.some((vacation: any) => {
    return date >= vacation.startDate && date <= vacation.endDate;
  });
  
  return !isOnVacation;
};

ProfessionalSchema.methods.getAvailableHours = function(date: Date): { start: string; end: string } | null {
  if (!this.isAvailableOnDate(date)) {
    return null;
  }
  
  const dayOfWeek = date.getDay();
  const availability = this.weeklyAvailability.find((a: any) => a.dayOfWeek === dayOfWeek);
  
  if (!availability) {
    return null;
  }
  
  return {
    start: availability.startTime,
    end: availability.endTime,
  };
};

ProfessionalSchema.methods.updateStats = function(stats: Partial<IProfessionalDocument['stats']>) {
  this.stats = { ...this.stats, ...stats };
  return this.save();
};

export const Professional = mongoose.model<IProfessionalDocument>('Professional', ProfessionalSchema);
export default Professional;

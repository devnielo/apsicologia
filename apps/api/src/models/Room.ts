import mongoose, { Document, Schema } from 'mongoose';
import { IRoom } from '@apsicologia/shared/types';

export interface IRoomDocument extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  type: 'physical' | 'virtual';
  
  // Physical room details
  location?: {
    building?: string;
    floor?: string;
    roomNumber?: string;
    address?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  
  // Virtual room configuration
  virtualConfig?: {
    platform: 'jitsi' | 'zoom' | 'teams' | 'meet' | 'custom';
    roomId?: string;
    meetingUrl?: string;
    accessCode?: string;
    waitingRoom: boolean;
    recordingEnabled: boolean;
    maxParticipants: number;
    settings?: {
      audioMuted: boolean;
      videoMuted: boolean;
      chatEnabled: boolean;
      screenShareEnabled: boolean;
      backgroundBlur: boolean;
    };
  };
  
  // Room capacity and features
  capacity: number;
  equipment: string[];
  amenities: string[];
  accessibility: string[];
  
  // Availability and scheduling
  isActive: boolean;
  isBookable: boolean;
  operatingHours?: {
    dayOfWeek: number; // 0-6 (Sunday-Saturday)
    startTime: string; // HH:MM
    endTime: string; // HH:MM
    isAvailable: boolean;
  }[];
  
  // Visual and organizational
  color?: string;
  tags: string[];
  category?: string;
  
  // Pricing (optional, for room rental)
  pricing?: {
    baseRate: number;
    currency: string;
    billingPeriod: 'hour' | 'day' | 'session';
  };
  
  // Maintenance and status
  status: 'available' | 'occupied' | 'maintenance' | 'out_of_order';
  maintenanceSchedule?: {
    startDate: Date;
    endDate: Date;
    reason: string;
    isRecurring: boolean;
  }[];
  
  // Professional assignments
  assignedProfessionals: mongoose.Types.ObjectId[];
  primaryProfessional?: mongoose.Types.ObjectId;
  
  // Usage statistics
  stats: {
    totalBookings: number;
    totalHours: number;
    averageUtilization: number; // Percentage
    lastUsed?: Date;
    maintenanceHours: number;
  };
  
  // Soft delete and audit
  deletedAt?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const CoordinatesSchema = new Schema({
  lat: {
    type: Number,
    required: true,
    min: [-90, 'Latitude must be between -90 and 90'],
    max: [90, 'Latitude must be between -90 and 90'],
  },
  lng: {
    type: Number,
    required: true,
    min: [-180, 'Longitude must be between -180 and 180'],
    max: [180, 'Longitude must be between -180 and 180'],
  },
}, { _id: false });

const VirtualSettingsSchema = new Schema({
  audioMuted: { type: Boolean, default: false },
  videoMuted: { type: Boolean, default: false },
  chatEnabled: { type: Boolean, default: true },
  screenShareEnabled: { type: Boolean, default: true },
  backgroundBlur: { type: Boolean, default: false },
}, { _id: false });

const OperatingHoursSchema = new Schema({
  dayOfWeek: {
    type: Number,
    required: true,
    min: 0,
    max: 6,
  },
  startTime: {
    type: String,
    required: true,
    validate: {
      validator: (v: string) => /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v),
      message: 'Invalid time format. Use HH:MM',
    },
  },
  endTime: {
    type: String,
    required: true,
    validate: {
      validator: (v: string) => /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v),
      message: 'Invalid time format. Use HH:MM',
    },
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
}, { _id: false });

const MaintenanceScheduleSchema = new Schema({
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
    required: true,
    trim: true,
  },
  isRecurring: {
    type: Boolean,
    default: false,
  },
}, { timestamps: true });

const RoomSchema = new Schema<IRoomDocument>(
  {
    // Basic information
    name: {
      type: String,
      required: [true, 'Room name is required'],
      trim: true,
      maxlength: [100, 'Room name cannot exceed 100 characters'],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    type: {
      type: String,
      required: [true, 'Room type is required'],
      enum: ['physical', 'virtual'],
      index: true,
    },
    
    // Physical room details
    location: {
      building: {
        type: String,
        trim: true,
      },
      floor: {
        type: String,
        trim: true,
      },
      roomNumber: {
        type: String,
        trim: true,
      },
      address: {
        type: String,
        trim: true,
      },
      coordinates: CoordinatesSchema,
    },
    
    // Virtual room configuration
    virtualConfig: {
      platform: {
        type: String,
        enum: ['jitsi', 'zoom', 'teams', 'meet', 'custom'],
      },
      roomId: {
        type: String,
        trim: true,
      },
      meetingUrl: {
        type: String,
        trim: true,
        validate: {
          validator: (v: string) => !v || /^https?:\/\/.+/.test(v),
          message: 'Meeting URL must be a valid HTTP/HTTPS URL',
        },
      },
      accessCode: {
        type: String,
        trim: true,
      },
      waitingRoom: {
        type: Boolean,
        default: false,
      },
      recordingEnabled: {
        type: Boolean,
        default: false,
      },
      maxParticipants: {
        type: Number,
        default: 10,
        min: [2, 'Maximum participants must be at least 2'],
        max: [100, 'Maximum participants cannot exceed 100'],
      },
      settings: VirtualSettingsSchema,
    },
    
    // Room capacity and features
    capacity: {
      type: Number,
      required: [true, 'Room capacity is required'],
      min: [1, 'Room capacity must be at least 1'],
      max: [50, 'Room capacity cannot exceed 50'],
      index: true,
    },
    equipment: {
      type: [String],
      default: [],
      index: true,
    },
    amenities: {
      type: [String],
      default: [],
      index: true,
    },
    accessibility: {
      type: [String],
      default: [],
      index: true,
    },
    
    // Availability and scheduling
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isBookable: {
      type: Boolean,
      default: true,
      index: true,
    },
    operatingHours: {
      type: [OperatingHoursSchema],
      default: [
        // Default 24/7 availability for virtual rooms
        { dayOfWeek: 0, startTime: '00:00', endTime: '23:59', isAvailable: true },
        { dayOfWeek: 1, startTime: '00:00', endTime: '23:59', isAvailable: true },
        { dayOfWeek: 2, startTime: '00:00', endTime: '23:59', isAvailable: true },
        { dayOfWeek: 3, startTime: '00:00', endTime: '23:59', isAvailable: true },
        { dayOfWeek: 4, startTime: '00:00', endTime: '23:59', isAvailable: true },
        { dayOfWeek: 5, startTime: '00:00', endTime: '23:59', isAvailable: true },
        { dayOfWeek: 6, startTime: '00:00', endTime: '23:59', isAvailable: true },
      ],
    },
    
    // Visual and organizational
    color: {
      type: String,
      validate: {
        validator: (v: string) => /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v),
        message: 'Color must be a valid hex color code',
      },
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    category: {
      type: String,
      trim: true,
      index: true,
    },
    
    // Pricing (optional)
    pricing: {
      baseRate: {
        type: Number,
        min: [0, 'Base rate cannot be negative'],
      },
      currency: {
        type: String,
        enum: ['EUR', 'USD', 'GBP'],
        default: 'EUR',
        uppercase: true,
      },
      billingPeriod: {
        type: String,
        enum: ['hour', 'day', 'session'],
        default: 'session',
      },
    },
    
    // Maintenance and status
    status: {
      type: String,
      enum: ['available', 'occupied', 'maintenance', 'out_of_order'],
      default: 'available',
      index: true,
    },
    maintenanceSchedule: {
      type: [MaintenanceScheduleSchema],
      default: [],
    },
    
    // Professional assignments
    assignedProfessionals: {
      type: [Schema.Types.ObjectId],
      ref: 'Professional',
      default: [],
      index: true,
    },
    primaryProfessional: {
      type: Schema.Types.ObjectId,
      ref: 'Professional',
      index: true,
    },
    
    // Usage statistics
    stats: {
      totalBookings: { type: Number, default: 0 },
      totalHours: { type: Number, default: 0 },
      averageUtilization: { type: Number, default: 0, min: 0, max: 100 },
      lastUsed: { type: Date },
      maintenanceHours: { type: Number, default: 0 },
    },
    
    // Soft delete and audit
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
RoomSchema.index({ type: 1, isActive: 1, isBookable: 1 });
RoomSchema.index({ status: 1, isActive: 1 });
RoomSchema.index({ capacity: 1, type: 1, isActive: 1 });
RoomSchema.index({ assignedProfessionals: 1, isActive: 1 });
RoomSchema.index({ tags: 1, isActive: 1 });
RoomSchema.index({ category: 1, type: 1, isActive: 1 });
RoomSchema.index({ createdAt: -1 });

// Text search index
RoomSchema.index({ 
  name: 'text', 
  description: 'text',
  equipment: 'text',
  amenities: 'text',
  tags: 'text'
});

// Unique index for active room names
RoomSchema.index(
  { name: 1, type: 1 },
  { 
    unique: true,
    partialFilterExpression: { isActive: true, deletedAt: null },
    name: 'unique_active_room_name_by_type'
  }
);

// Pre-save middleware
RoomSchema.pre('save', function(this: IRoomDocument, next) {
  // Set default operating hours based on room type
  if (this.isNew && (!this.operatingHours || this.operatingHours.length === 0)) {
    if (this.type === 'virtual') {
      // Virtual rooms default to 24/7
      this.operatingHours = [
        { dayOfWeek: 0, startTime: '00:00', endTime: '23:59', isAvailable: true },
        { dayOfWeek: 1, startTime: '00:00', endTime: '23:59', isAvailable: true },
        { dayOfWeek: 2, startTime: '00:00', endTime: '23:59', isAvailable: true },
        { dayOfWeek: 3, startTime: '00:00', endTime: '23:59', isAvailable: true },
        { dayOfWeek: 4, startTime: '00:00', endTime: '23:59', isAvailable: true },
        { dayOfWeek: 5, startTime: '00:00', endTime: '23:59', isAvailable: true },
        { dayOfWeek: 6, startTime: '00:00', endTime: '23:59', isAvailable: true },
      ];
    } else {
      // Physical rooms default to business hours
      this.operatingHours = [
        { dayOfWeek: 1, startTime: '08:00', endTime: '20:00', isAvailable: true },
        { dayOfWeek: 2, startTime: '08:00', endTime: '20:00', isAvailable: true },
        { dayOfWeek: 3, startTime: '08:00', endTime: '20:00', isAvailable: true },
        { dayOfWeek: 4, startTime: '08:00', endTime: '20:00', isAvailable: true },
        { dayOfWeek: 5, startTime: '08:00', endTime: '20:00', isAvailable: true },
        { dayOfWeek: 6, startTime: '09:00', endTime: '14:00', isAvailable: true },
        { dayOfWeek: 0, startTime: '00:00', endTime: '23:59', isAvailable: false },
      ];
    }
  }
  
  // Ensure virtual config exists for virtual rooms
  if (this.type === 'virtual' && !this.virtualConfig) {
    this.virtualConfig = {
      platform: 'jitsi',
      waitingRoom: false,
      recordingEnabled: false,
      maxParticipants: 10,
      settings: {
        audioMuted: false,
        videoMuted: false,
        chatEnabled: true,
        screenShareEnabled: true,
        backgroundBlur: false,
      },
    };
  }
  
  // Generate default color if not provided
  if (!this.color && this.isNew) {
    const colors = this.type === 'virtual' 
      ? ['#06B6D4', '#3B82F6', '#8B5CF6', '#10B981'] // Blue/cyan tones for virtual
      : ['#EF4444', '#F59E0B', '#84CC16', '#EC4899']; // Warmer tones for physical
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }
  
  // Ensure primary professional is in assigned professionals
  if (this.primaryProfessional && !this.assignedProfessionals.includes(this.primaryProfessional)) {
    this.assignedProfessionals.push(this.primaryProfessional);
  }
  
  next();
});

// Static methods
RoomSchema.statics.findActive = function() {
  return this.find({ isActive: true, deletedAt: null });
};

RoomSchema.statics.findBookable = function() {
  return this.find({ 
    isActive: true, 
    isBookable: true,
    status: { $in: ['available'] },
    deletedAt: null 
  });
};

RoomSchema.statics.findByType = function(type: 'physical' | 'virtual') {
  return this.find({ 
    type, 
    isActive: true,
    deletedAt: null 
  });
};

RoomSchema.statics.findByCapacity = function(minCapacity: number, maxCapacity?: number) {
  const query: any = {
    capacity: { $gte: minCapacity },
    isActive: true,
    deletedAt: null,
  };
  
  if (maxCapacity) {
    query.capacity.$lte = maxCapacity;
  }
  
  return this.find(query);
};

RoomSchema.statics.findByProfessional = function(professionalId: mongoose.Types.ObjectId) {
  return this.find({
    assignedProfessionals: professionalId,
    isActive: true,
    deletedAt: null,
  });
};

RoomSchema.statics.findWithEquipment = function(equipment: string[]) {
  return this.find({
    equipment: { $in: equipment },
    isActive: true,
    deletedAt: null,
  });
};

// Instance methods
RoomSchema.methods.addProfessional = function(professionalId: mongoose.Types.ObjectId) {
  if (!this.assignedProfessionals.includes(professionalId)) {
    this.assignedProfessionals.push(professionalId);
  }
  return this.save();
};

RoomSchema.methods.removeProfessional = function(professionalId: mongoose.Types.ObjectId) {
  this.assignedProfessionals = this.assignedProfessionals.filter(
    (id: mongoose.Types.ObjectId) => !id.equals(professionalId)
  );
  
  // If removing primary professional, clear it
  if (this.primaryProfessional?.equals(professionalId)) {
    this.primaryProfessional = undefined;
  }
  
  return this.save();
};

RoomSchema.methods.addEquipment = function(equipment: string) {
  if (!this.equipment.includes(equipment)) {
    this.equipment.push(equipment);
  }
  return this.save();
};

RoomSchema.methods.removeEquipment = function(equipment: string) {
  this.equipment = this.equipment.filter((e: string) => e !== equipment);
  return this.save();
};

RoomSchema.methods.addAmenity = function(amenity: string) {
  if (!this.amenities.includes(amenity)) {
    this.amenities.push(amenity);
  }
  return this.save();
};

RoomSchema.methods.removeAmenity = function(amenity: string) {
  this.amenities = this.amenities.filter((a: string) => a !== amenity);
  return this.save();
};

RoomSchema.methods.isAvailableOnDate = function(date: Date): boolean {
  const dayOfWeek = date.getDay();
  const availability = this.operatingHours.find((oh: any) => oh.dayOfWeek === dayOfWeek);
  
  if (!availability || !availability.isAvailable) {
    return false;
  }
  
  // Check if room is under maintenance
  const isUnderMaintenance = this.maintenanceSchedule.some((maintenance: any) => {
    return date >= maintenance.startDate && date <= maintenance.endDate;
  });
  
  return !isUnderMaintenance && this.status === 'available' && this.isActive && this.isBookable;
};

RoomSchema.methods.getAvailableHours = function(date: Date): { start: string; end: string } | null {
  if (!this.isAvailableOnDate(date)) {
    return null;
  }
  
  const dayOfWeek = date.getDay();
  const availability = this.operatingHours.find((oh: any) => oh.dayOfWeek === dayOfWeek);
  
  if (!availability) {
    return null;
  }
  
  return {
    start: availability.startTime,
    end: availability.endTime,
  };
};

RoomSchema.methods.generateJitsiLink = function(): string | null {
  if (this.type !== 'virtual' || this.virtualConfig?.platform !== 'jitsi') {
    return null;
  }
  
  const roomId = this.virtualConfig?.roomId || this.name.replace(/\s+/g, '-').toLowerCase();
  return `https://meet.jit.si/${roomId}`;
};

RoomSchema.methods.scheduleMaintenance = function(
  startDate: Date,
  endDate: Date,
  reason: string,
  isRecurring: boolean = false
) {
  this.maintenanceSchedule.push({
    startDate,
    endDate,
    reason,
    isRecurring,
  });
  
  // Update status if maintenance is immediate
  const now = new Date();
  if (startDate <= now && endDate >= now) {
    this.status = 'maintenance';
  }
  
  return this.save();
};

RoomSchema.methods.updateStats = function(stats: Partial<IRoomDocument['stats']>) {
  this.stats = { ...this.stats, ...stats };
  return this.save();
};

RoomSchema.methods.softDelete = function() {
  this.deletedAt = new Date();
  this.isActive = false;
  return this.save();
};

RoomSchema.methods.restore = function() {
  this.deletedAt = undefined;
  this.isActive = true;
  return this.save();
};

export const Room = mongoose.model<IRoomDocument>('Room', RoomSchema);
export default Room;

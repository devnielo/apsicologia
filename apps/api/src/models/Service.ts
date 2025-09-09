import mongoose, { Document, Schema } from 'mongoose';
import { IService } from '@apsicologia/shared/types';

export interface IServiceDocument extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
  currency: string;
  
  // Visual and categorization
  color?: string;
  imageUrl?: string;
  category?: string;
  tags: string[];
  
  // Availability settings
  isActive: boolean;
  isOnlineAvailable: boolean;
  requiresApproval: boolean;
  
  // Professional restrictions
  availableTo: mongoose.Types.ObjectId[]; // Professional IDs
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
    intakeFormId?: mongoose.Types.ObjectId;
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
  
  // Soft delete and audit
  deletedAt?: Date;
  
  // Statistics (computed)
  stats: {
    totalBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    averageRating?: number;
    totalRevenue: number;
  };
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const DiscountSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  percentage: {
    type: Number,
    required: true,
    min: [0, 'Discount percentage cannot be negative'],
    max: [100, 'Discount percentage cannot exceed 100%'],
  },
  validFrom: {
    type: Date,
  },
  validUntil: {
    type: Date,
  },
}, { _id: false });

const ServiceSchema = new Schema<IServiceDocument>(
  {
    // Basic information
    name: {
      type: String,
      required: [true, 'Service name is required'],
      trim: true,
      maxlength: [100, 'Service name cannot exceed 100 characters'],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    durationMinutes: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [15, 'Minimum service duration is 15 minutes'],
      max: [480, 'Maximum service duration is 8 hours'],
      index: true,
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
      index: true,
    },
    currency: {
      type: String,
      required: [true, 'Currency is required'],
      enum: ['EUR', 'USD', 'GBP'],
      default: 'EUR',
      uppercase: true,
    },
    
    // Visual and categorization
    color: {
      type: String,
      validate: {
        validator: function(v: string) {
          if (!v) return true; // Allow empty/null values
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
        },
        message: 'Color must be a valid hex color code',
      },
    },
    imageUrl: {
      type: String,
      default: null,
      validate: {
        validator: function(v: string) {
          if (!v) return true; // Allow null/empty
          
          // Only allow Cloudflare R2 URLs
          const cloudflareR2Pattern = /^https:\/\/[a-zA-Z0-9-]+\.r2\.cloudflarestorage\.com\/.*\.(jpg|jpeg|png|gif|webp)$/i;
          const cloudflarePublicPattern = /^https:\/\/pub-[a-zA-Z0-9]+\.r2\.dev\/.*\.(jpg|jpeg|png|gif|webp)$/i;
          
          return cloudflareR2Pattern.test(v) || cloudflarePublicPattern.test(v);
        },
        message: 'Image URL must be a valid image URL (jpg, jpeg, png, gif, webp)',
      },
    },
    category: {
      type: String,
      trim: true,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    
    // Availability settings
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isOnlineAvailable: {
      type: Boolean,
      default: true,
      index: true,
    },
    requiresApproval: {
      type: Boolean,
      default: false,
    },
    
    // Professional restrictions
    availableTo: {
      type: [Schema.Types.ObjectId],
      ref: 'Professional',
      default: [],
      index: true,
    },
    isPubliclyBookable: {
      type: Boolean,
      default: true,
      index: true,
    },
    
    // Pricing and billing
    priceDetails: {
      basePrice: {
        type: Number,
        required: true,
        min: [0, 'Base price cannot be negative'],
      },
      discountedPrice: {
        type: Number,
        min: [0, 'Discounted price cannot be negative'],
        validate: {
          validator: function(this: IServiceDocument, value: number) {
            return !value || value <= this.priceDetails.basePrice;
          },
          message: 'Discounted price must be less than or equal to base price',
        },
      },
      discounts: {
        type: [DiscountSchema],
        default: [],
      },
    },
    
    // Service configuration
    settings: {
      maxAdvanceBookingDays: {
        type: Number,
        default: 30,
        min: [1, 'Maximum advance booking must be at least 1 day'],
        max: [365, 'Maximum advance booking cannot exceed 365 days'],
      },
      minAdvanceBookingHours: {
        type: Number,
        default: 2,
        min: [0, 'Minimum advance booking cannot be negative'],
        max: [168, 'Minimum advance booking cannot exceed 7 days'],
      },
      allowSameDayBooking: {
        type: Boolean,
        default: true,
      },
      bufferBefore: {
        type: Number,
        default: 0,
        min: [0, 'Buffer before cannot be negative'],
        max: [120, 'Buffer before cannot exceed 2 hours'],
      },
      bufferAfter: {
        type: Number,
        default: 0,
        min: [0, 'Buffer after cannot be negative'],
        max: [120, 'Buffer after cannot exceed 2 hours'],
      },
      maxConcurrentBookings: {
        type: Number,
        default: 1,
        min: [1, 'Maximum concurrent bookings must be at least 1'],
        max: [10, 'Maximum concurrent bookings cannot exceed 10'],
      },
      requiresIntake: {
        type: Boolean,
        default: false,
      },
      intakeFormId: {
        type: Schema.Types.ObjectId,
        ref: 'FormSchema',
        default: null,
        validate: {
          validator: function(v: any) {
            // Allow null, undefined, or valid ObjectIds, but not empty strings
            return v === null || v === undefined || mongoose.Types.ObjectId.isValid(v);
          },
          message: 'Invalid intake form ID',
        },
      },
    },
    
    // Preparation and follow-up
    preparation: {
      instructions: {
        type: String,
        trim: true,
        maxlength: [1000, 'Preparation instructions cannot exceed 1000 characters'],
      },
      requiredDocuments: {
        type: [String],
        default: [],
      },
      recommendedDuration: {
        type: Number,
        min: [0, 'Recommended preparation duration cannot be negative'],
        max: [120, 'Recommended preparation duration cannot exceed 2 hours'],
      },
    },
    
    followUp: {
      instructions: {
        type: String,
        trim: true,
        maxlength: [1000, 'Follow-up instructions cannot exceed 1000 characters'],
      },
      scheduledTasks: {
        type: [String],
        default: [],
      },
      recommendedGap: {
        type: Number,
        min: [0, 'Recommended gap cannot be negative'],
        max: [365, 'Recommended gap cannot exceed 365 days'],
      },
    },
    
    // Soft delete and audit
    deletedAt: {
      type: Date,
      index: true,
    },
    
    // Statistics (will be updated by scheduled jobs)
    stats: {
      totalBookings: { type: Number, default: 0 },
      completedBookings: { type: Number, default: 0 },
      cancelledBookings: { type: Number, default: 0 },
      averageRating: { type: Number, min: 1, max: 5 },
      totalRevenue: { type: Number, default: 0 },
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
ServiceSchema.index({ isActive: 1, isPubliclyBookable: 1 });
ServiceSchema.index({ category: 1, isActive: 1 });
ServiceSchema.index({ price: 1, currency: 1 });
ServiceSchema.index({ durationMinutes: 1, isActive: 1 });
ServiceSchema.index({ availableTo: 1, isActive: 1 });
ServiceSchema.index({ tags: 1, isActive: 1 });
ServiceSchema.index({ createdAt: -1 });

// Text search index
ServiceSchema.index({ 
  name: 'text', 
  description: 'text',
  category: 'text',
  tags: 'text'
});

// Unique index for active services
ServiceSchema.index(
  { name: 1, isActive: 1 },
  { 
    unique: true,
    partialFilterExpression: { isActive: true, deletedAt: null },
    name: 'unique_active_service_name'
  }
);

// Pre-save middleware
ServiceSchema.pre('save', function(this: IServiceDocument, next) {
  // Sync price with priceDetails.basePrice
  if (this.isModified('price')) {
    this.priceDetails.basePrice = this.price;
  }
  
  // Validate intake form requirement
  if (this.settings.requiresIntake && !this.settings.intakeFormId) {
    return next(new Error('Intake form ID is required when intake is required'));
  }
  
  // Ensure color has default if not provided
  if (!this.color && this.isNew) {
    // Generate a random color if none provided
    const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#06B6D4'];
    this.color = colors[Math.floor(Math.random() * colors.length)];
  }
  
  next();
});

// Static methods
ServiceSchema.statics.findActive = function() {
  return this.find({ isActive: true, deletedAt: null });
};

ServiceSchema.statics.findPubliclyBookable = function() {
  return this.find({ 
    isActive: true, 
    isPubliclyBookable: true,
    deletedAt: null 
  });
};

ServiceSchema.statics.findByCategory = function(category: string) {
  return this.find({ 
    category, 
    isActive: true,
    deletedAt: null 
  });
};

ServiceSchema.statics.findByProfessional = function(professionalId: mongoose.Types.ObjectId) {
  return this.find({
    $or: [
      { availableTo: { $size: 0 } }, // Available to all
      { availableTo: professionalId }
    ],
    isActive: true,
    deletedAt: null
  });
};

ServiceSchema.statics.findByPriceRange = function(minPrice: number, maxPrice: number) {
  return this.find({
    price: { $gte: minPrice, $lte: maxPrice },
    isActive: true,
    deletedAt: null
  });
};

ServiceSchema.statics.findByDuration = function(minDuration: number, maxDuration: number) {
  return this.find({
    durationMinutes: { $gte: minDuration, $lte: maxDuration },
    isActive: true,
    deletedAt: null
  });
};

// Instance methods
ServiceSchema.methods.addProfessional = function(professionalId: mongoose.Types.ObjectId) {
  if (!this.availableTo.includes(professionalId)) {
    this.availableTo.push(professionalId);
  }
  return this.save();
};

ServiceSchema.methods.removeProfessional = function(professionalId: mongoose.Types.ObjectId) {
  this.availableTo = this.availableTo.filter((id: mongoose.Types.ObjectId) => !id.equals(professionalId));
  return this.save();
};

ServiceSchema.methods.addTag = function(tag: string) {
  if (!this.tags.includes(tag)) {
    this.tags.push(tag);
  }
  return this.save();
};

ServiceSchema.methods.removeTag = function(tag: string) {
  this.tags = this.tags.filter((t: string) => t !== tag);
  return this.save();
};

ServiceSchema.methods.calculatePrice = function(
  discountName?: string,
  additionalDiscountPercentage?: number
): { 
  originalPrice: number;
  finalPrice: number;
  serviceDiscount?: number;
  additionalDiscount?: number;
  breakdown: string;
} {
  let finalPrice = this.priceDetails.discountedPrice || this.priceDetails.basePrice;
  let serviceDiscount = 0;
  let additionalDiscount = 0;
  const breakdown: string[] = [`Base: ${this.priceDetails.basePrice}${this.currency}`];
  
  // Apply discounted price if available
  if (this.priceDetails.discountedPrice && this.priceDetails.discountedPrice < this.priceDetails.basePrice) {
    const discount = this.priceDetails.basePrice - this.priceDetails.discountedPrice;
    breakdown.push(`Service discount: -${discount}${this.currency}`);
  }
  
  // Apply named discount from service discounts
  if (discountName) {
    const discount = this.priceDetails.discounts?.find(
      (d: any) => d.name === discountName
    );
    
    if (discount) {
      const now = new Date();
      const isValid = (!discount.validFrom || discount.validFrom <= now) && 
                     (!discount.validUntil || discount.validUntil >= now);
      
      if (isValid) {
        serviceDiscount = (finalPrice * discount.percentage) / 100;
        finalPrice -= serviceDiscount;
        breakdown.push(`${discount.name} (${discount.percentage}%): -${serviceDiscount}${this.currency}`);
      }
    }
  }
  
  // Apply additional discount
  if (additionalDiscountPercentage && additionalDiscountPercentage > 0) {
    additionalDiscount = (finalPrice * additionalDiscountPercentage) / 100;
    finalPrice -= additionalDiscount;
    breakdown.push(`Additional discount (${additionalDiscountPercentage}%): -${additionalDiscount}${this.currency}`);
  }
  
  return {
    originalPrice: this.priceDetails.basePrice,
    finalPrice: Math.max(0, Math.round(finalPrice * 100) / 100), // Ensure no negative prices and round to 2 decimals
    serviceDiscount,
    additionalDiscount,
    breakdown: breakdown.join(', '),
  };
};

ServiceSchema.methods.updateStats = function(stats: Partial<IServiceDocument['stats']>) {
  this.stats = { ...this.stats, ...stats };
  return this.save();
};

ServiceSchema.methods.softDelete = function() {
  this.deletedAt = new Date();
  this.isActive = false;
  return this.save();
};

ServiceSchema.methods.restore = function() {
  this.deletedAt = undefined;
  this.isActive = true;
  return this.save();
};

export const Service = mongoose.model<IServiceDocument>('Service', ServiceSchema);
export default Service;

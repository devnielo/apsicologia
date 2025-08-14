import mongoose, { Document, Schema } from 'mongoose';

// Define PatientGender type directly
type PatientGender = 'male' | 'female' | 'other' | 'prefer_not_to_say';

export interface IPatientDocument extends Document {
  _id: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  birthDate?: Date;
  gender?: PatientGender;
  
  // Contact information
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  
  // Medical information
  allergies: string[];
  medicalConditions: string[];
  medications: string[];
  
  // Professional relationships
  assignedProfessionals: mongoose.Types.ObjectId[];
  primaryProfessional?: mongoose.Types.ObjectId;
  
  // Tags and categorization
  tags: string[];
  source: 'online' | 'referral' | 'direct' | 'other';
  referredBy?: string;
  
  // Communication preferences
  newsletterOptIn: boolean;
  communicationPreferences: {
    email: boolean;
    sms: boolean;
    phone: boolean;
  };
  
  // Consent and privacy
  consents: {
    treatmentConsent: {
      granted: boolean;
      grantedAt?: Date;
      document?: string;
    };
    dataProcessing: {
      granted: boolean;
      grantedAt?: Date;
      document?: string;
    };
    marketing: {
      granted: boolean;
      grantedAt?: Date;
    };
  };
  
  // Clinical information
  clinicalNotes?: string;
  riskLevel: 'low' | 'medium' | 'high';
  status: 'active' | 'inactive' | 'discharged' | 'pending';
  
  // Financial
  billingInfo?: {
    preferredPaymentMethod?: 'cash' | 'card' | 'transfer' | 'insurance';
    insuranceProvider?: string;
    insuranceNumber?: string;
  };
  
  // Soft delete and audit
  isActive: boolean;
  deletedAt?: Date;
  lastContactAt?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Virtuals
  age?: number;
  fullAddress?: string;
}

const PatientSchema = new Schema<IPatientDocument>(
  {
    // Link to user account (optional for patients who don't have login access)
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      sparse: true,
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
      required: [true, 'Phone is required'],
      trim: true,
      index: true,
    },
    birthDate: {
      type: Date,
      index: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    },
    
    // Contact information
    address: {
      street: { type: String, trim: true },
      city: { type: String, trim: true },
      postalCode: { type: String, trim: true },
      country: { type: String, trim: true, default: 'España' },
    },
    emergencyContact: {
      name: { type: String, trim: true },
      relationship: { type: String, trim: true },
      phone: { type: String, trim: true },
      email: { type: String, lowercase: true, trim: true },
    },
    
    // Medical information
    allergies: {
      type: [String],
      default: [],
    },
    medicalConditions: {
      type: [String],
      default: [],
    },
    medications: {
      type: [String],
      default: [],
    },
    
    // Professional relationships
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
    
    // Tags and categorization
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    source: {
      type: String,
      enum: ['online', 'referral', 'direct', 'other'],
      default: 'direct',
      index: true,
    },
    referredBy: {
      type: String,
      trim: true,
    },
    
    // Communication preferences
    newsletterOptIn: {
      type: Boolean,
      default: false,
      index: true,
    },
    communicationPreferences: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      phone: { type: Boolean, default: true },
    },
    
    // Consent and privacy
    consents: {
      treatmentConsent: {
        granted: { type: Boolean, default: false },
        grantedAt: { type: Date },
        document: { type: String }, // File path or URL
      },
      dataProcessing: {
        granted: { type: Boolean, default: false },
        grantedAt: { type: Date },
        document: { type: String },
      },
      marketing: {
        granted: { type: Boolean, default: false },
        grantedAt: { type: Date },
      },
    },
    
    // Clinical information
    clinicalNotes: {
      type: String,
      maxlength: [2000, 'Clinical notes cannot exceed 2000 characters'],
    },
    riskLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low',
      index: true,
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'discharged', 'pending'],
      default: 'pending',
      index: true,
    },
    
    // Financial
    billingInfo: {
      preferredPaymentMethod: {
        type: String,
        enum: ['cash', 'card', 'transfer', 'insurance'],
      },
      insuranceProvider: { type: String, trim: true },
      insuranceNumber: { type: String, trim: true },
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
    lastContactAt: {
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
      virtuals: true,
    },
  }
);

// Compound indexes for common queries
PatientSchema.index({ name: 'text', email: 'text' }); // Text search
PatientSchema.index({ status: 1, isActive: 1 });
PatientSchema.index({ assignedProfessionals: 1, isActive: 1 });
PatientSchema.index({ tags: 1, isActive: 1 });
PatientSchema.index({ createdAt: -1 });
PatientSchema.index({ lastContactAt: -1 });

// Ensure email uniqueness for active patients
PatientSchema.index(
  { email: 1, isActive: 1 },
  { 
    unique: true,
    partialFilterExpression: { isActive: true },
    name: 'unique_active_patient_email'
  }
);

// Virtual for age calculation
PatientSchema.virtual('age').get(function(this: IPatientDocument) {
  if (!this.birthDate) return undefined;
  const today = new Date();
  const birthYear = this.birthDate.getFullYear();
  const currentYear = today.getFullYear();
  let age = currentYear - birthYear;
  
  // Adjust if birthday hasn't occurred this year
  const birthMonth = this.birthDate.getMonth();
  const currentMonth = today.getMonth();
  if (currentMonth < birthMonth || 
      (currentMonth === birthMonth && today.getDate() < this.birthDate.getDate())) {
    age--;
  }
  
  return age;
});

// Virtual for full address
PatientSchema.virtual('fullAddress').get(function(this: IPatientDocument) {
  if (!this.address) return undefined;
  
  const parts = [
    this.address.street,
    this.address.city,
    this.address.postalCode,
    this.address.country
  ].filter(Boolean);
  
  return parts.length > 0 ? parts.join(', ') : undefined;
});

// Pre-save middleware
PatientSchema.pre('save', function(this: IPatientDocument, next) {
  // Update lastContactAt when patient is modified
  if (this.isModified() && !this.isModified('lastContactAt')) {
    this.lastContactAt = new Date();
  }
  
  // Ensure primary professional is in assigned professionals
  if (this.primaryProfessional && !this.assignedProfessionals.includes(this.primaryProfessional)) {
    this.assignedProfessionals.push(this.primaryProfessional);
  }
  
  next();
});

// Static methods
PatientSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase(), isActive: true });
};

PatientSchema.statics.findByProfessional = function(professionalId: mongoose.Types.ObjectId) {
  return this.find({ 
    assignedProfessionals: professionalId,
    isActive: true 
  }).sort({ lastContactAt: -1 });
};

PatientSchema.statics.findByStatus = function(status: string) {
  return this.find({ status, isActive: true });
};

PatientSchema.statics.findByTags = function(tags: string[]) {
  return this.find({ 
    tags: { $in: tags },
    isActive: true 
  });
};

PatientSchema.statics.searchByName = function(query: string) {
  return this.find({
    $text: { $search: query },
    isActive: true
  }).sort({ score: { $meta: 'textScore' } });
};

// Instance methods
PatientSchema.methods.assignToProfessional = function(professionalId: mongoose.Types.ObjectId) {
  if (!this.assignedProfessionals.includes(professionalId)) {
    this.assignedProfessionals.push(professionalId);
  }
  return this.save();
};

PatientSchema.methods.removeProfessional = function(professionalId: mongoose.Types.ObjectId) {
  this.assignedProfessionals = this.assignedProfessionals.filter(
    (id: mongoose.Types.ObjectId) => !id.equals(professionalId)
  );
  
  // If removing primary professional, clear it
  if (this.primaryProfessional?.equals(professionalId)) {
    this.primaryProfessional = undefined;
  }
  
  return this.save();
};

PatientSchema.methods.addTag = function(tag: string) {
  if (!this.tags.includes(tag)) {
    this.tags.push(tag);
  }
  return this.save();
};

PatientSchema.methods.removeTag = function(tag: string) {
  this.tags = this.tags.filter((t: string) => t !== tag);
  return this.save();
};

PatientSchema.methods.updateConsent = function(
  consentType: keyof IPatientDocument['consents'],
  granted: boolean,
  document?: string
) {
  this.consents[consentType] = {
    granted,
    grantedAt: granted ? new Date() : undefined,
    document
  };
  return this.save();
};

export const Patient = mongoose.model<IPatientDocument>('Patient', PatientSchema);
export default Patient;

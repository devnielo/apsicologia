import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import { UserRole } from '@apsicologia/shared/types';
import env from '../config/env.js';

export interface IUserDocument extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  passwordHash: string;
  name: string;
  phone?: string;
  role: UserRole;
  professionalId?: mongoose.Types.ObjectId;
  patientId?: mongoose.Types.ObjectId;
  
  // Authentication fields
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  
  // Two-factor authentication
  isTwoFactorEnabled: boolean;
  twoFactorSecret?: string;
  twoFactorBackupCodes?: string[];
  
  // Security
  lastLoginAt?: Date;
  lastLoginIP?: string;
  failedLoginAttempts: number;
  lockedUntil?: Date;
  
  // Preferences
  preferences: {
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
  };
  
  // Soft delete
  isActive: boolean;
  deletedAt?: Date;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  toAuthJSON(): any;
  incLoginAttempts(): Promise<any>;
  resetLoginAttempts(): Promise<any>;
  
  // Virtuals
  isLocked: boolean;
}

const UserSchema = new Schema<IUserDocument>(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false, // Don't return password in queries by default
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    phone: {
      type: String,
      trim: true,
      sparse: true, // Allow multiple null values but unique non-null values
      index: true,
    },
    role: {
      type: String,
      enum: ['admin', 'professional', 'reception', 'patient'],
      required: [true, 'Role is required'],
      index: true,
    },
    
    // References to related entities
    professionalId: {
      type: Schema.Types.ObjectId,
      ref: 'Professional',
      sparse: true,
      index: true,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient', 
      sparse: true,
      index: true,
    },
    
    // Authentication fields
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    emailVerificationExpires: {
      type: Date,
      select: false,
    },
    
    // Password reset
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
    
    // Two-factor authentication
    isTwoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
      select: false,
    },
    twoFactorBackupCodes: {
      type: [String],
      select: false,
    },
    
    // Security
    lastLoginAt: {
      type: Date,
    },
    lastLoginIP: {
      type: String,
    },
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    lockedUntil: {
      type: Date,
    },
    
    // Preferences
    preferences: {
      language: {
        type: String,
        default: 'es',
        enum: ['es', 'en', 'ca'],
      },
      timezone: {
        type: String,
        default: 'Europe/Madrid',
      },
      notifications: {
        email: {
          type: Boolean,
          default: true,
        },
        sms: {
          type: Boolean,
          default: false,
        },
        push: {
          type: Boolean,
          default: true,
        },
      },
    },
    
    // Soft delete
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
        delete ret.passwordHash;
        delete ret.emailVerificationToken;
        delete ret.emailVerificationExpires;
        delete ret.passwordResetToken;
        delete ret.passwordResetExpires;
        delete ret.twoFactorSecret;
        delete ret.twoFactorBackupCodes;
        return ret;
      },
    },
  }
);

// Compound indexes for common queries
UserSchema.index({ role: 1, isActive: 1 });
UserSchema.index({ email: 1, isActive: 1 });
UserSchema.index({ createdAt: -1 });

// Virtual for account lock status
UserSchema.virtual('isLocked').get(function(this: IUserDocument) {
  return !!(this.lockedUntil && this.lockedUntil > new Date());
});

// Pre-save middleware to hash password
UserSchema.pre('save', async function(this: IUserDocument, next) {
  if (!this.isModified('passwordHash')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(env.BCRYPT_ROUNDS);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Instance method to compare password
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!this.passwordHash) return false;
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Instance method to return safe user data for authentication
UserSchema.methods.toAuthJSON = function(): any {
  return {
    id: this._id.toString(),
    email: this.email,
    name: this.name,
    role: this.role,
    phone: this.phone,
    professionalId: this.professionalId?.toString(),
    patientId: this.patientId?.toString(),
    isEmailVerified: this.isEmailVerified,
    isTwoFactorEnabled: this.isTwoFactorEnabled,
    preferences: this.preferences,
    lastLoginAt: this.lastLoginAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

// Static methods
UserSchema.statics.findByEmail = function(email: string) {
  return this.findOne({ email: email.toLowerCase(), isActive: true });
};

UserSchema.statics.findByRole = function(role: UserRole) {
  return this.find({ role, isActive: true });
};

// Handle account locking
UserSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockedUntil && this.lockedUntil < new Date()) {
    return this.updateOne({
      $unset: {
        lockedUntil: 1,
      },
      $set: {
        failedLoginAttempts: 1,
      },
    });
  }
  
  const updates: any = { $inc: { failedLoginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.failedLoginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = {
      lockedUntil: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
    };
  }
  
  return this.updateOne(updates);
};

// Reset login attempts on successful login
UserSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: {
      failedLoginAttempts: 1,
      lockedUntil: 1,
    },
    $set: {
      lastLoginAt: new Date(),
    },
  });
};

export const User = mongoose.model<IUserDocument>('User', UserSchema);
export default User;

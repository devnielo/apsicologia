import mongoose, { Document, Schema } from 'mongoose';
import { IAppointment } from '@apsicologia/shared/types';

export interface IAppointmentDocument extends Document {
  _id: mongoose.Types.ObjectId;
  
  // Core appointment data
  patientId: mongoose.Types.ObjectId;
  professionalId: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  roomId?: mongoose.Types.ObjectId;
  
  // Scheduling
  startTime: Date;
  endTime: Date;
  duration: number; // minutes
  timezone: string;
  
  // Status management
  status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';
  paymentStatus: 'pending' | 'partial' | 'paid' | 'refunded' | 'overdue';
  
  // Booking source and method
  source: 'admin' | 'public_booking' | 'professional' | 'patient_portal';
  bookingMethod: 'online' | 'phone' | 'in_person' | 'email';
  
  // Virtual meeting integration
  virtualMeeting?: {
    platform: 'jitsi' | 'zoom' | 'teams' | 'meet' | 'custom';
    meetingId?: string;
    meetingUrl?: string;
    accessCode?: string;
    dialInNumbers?: string[];
    isRecorded: boolean;
    recordingUrl?: string;
  };
  
  // Pricing and billing
  pricing: {
    basePrice: number;
    discountAmount: number;
    discountReason?: string;
    totalAmount: number;
    currency: string;
  };
  
  // Notes and documentation
  notes?: {
    patientNotes?: string; // Patient's notes/concerns
    professionalNotes?: string; // Professional's notes
    adminNotes?: string; // Admin/reception notes
    cancellationReason?: string;
  };
  
  // Patient information snapshot
  patientInfo: {
    name: string;
    email: string;
    phone: string;
    dateOfBirth?: Date;
    emergencyContact?: {
      name: string;
      phone: string;
      relationship: string;
    };
  };
  
  // Forms and questionnaires
  forms: {
    intakeFormId?: mongoose.Types.ObjectId;
    intakeCompleted: boolean;
    preSessionFormId?: mongoose.Types.ObjectId;
    preSessionCompleted: boolean;
    postSessionFormId?: mongoose.Types.ObjectId;
    postSessionCompleted: boolean;
  };
  
  // Reminders and notifications
  reminders: {
    sms: {
      sent: boolean;
      sentAt?: Date;
      scheduledFor?: Date;
    };
    email: {
      sent: boolean;
      sentAt?: Date;
      scheduledFor?: Date;
    };
    push: {
      sent: boolean;
      sentAt?: Date;
      scheduledFor?: Date;
    };
  };
  
  // Attendance and timing
  attendance: {
    patientArrived: boolean;
    patientArrivedAt?: Date;
    professionalPresent: boolean;
    sessionStarted: boolean;
    sessionStartedAt?: Date;
    sessionEnded: boolean;
    sessionEndedAt?: Date;
    actualDuration?: number; // minutes
  };
  
  // Follow-up and next steps
  followUp?: {
    nextAppointmentDate?: Date;
    nextAppointmentServiceId?: mongoose.Types.ObjectId;
    recommendedFrequency?: 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'as_needed';
    homeworkAssigned?: string;
    medicationChanges?: string;
  };
  
  // File attachments
  attachments: {
    fileId: mongoose.Types.ObjectId;
    fileName: string;
    fileType: string;
    uploadedBy: mongoose.Types.ObjectId;
    uploadedAt: Date;
  }[];
  
  // Cancellation and rescheduling
  cancellation?: {
    cancelledBy: mongoose.Types.ObjectId;
    cancelledAt: Date;
    reason: string;
    refundAmount?: number;
    refundProcessed: boolean;
    rescheduleOffered: boolean;
  };
  
  rescheduling?: {
    originalStartTime: Date;
    originalEndTime: Date;
    rescheduledBy: mongoose.Types.ObjectId;
    rescheduledAt: Date;
    reason: string;
    reschedulingCount: number;
  };
  
  // Quality and feedback
  feedback?: {
    patientRating: number; // 1-5
    patientComment?: string;
    professionalRating?: number; // 1-5
    professionalComment?: string;
    overallSatisfaction: number; // 1-5
  };
  
  // Compliance and documentation
  compliance: {
    consentSigned: boolean;
    consentSignedAt?: Date;
    hipaaCompliant: boolean;
    documentationComplete: boolean;
    billingCoded: boolean;
  };
  
  // Metadata
  metadata?: {
    referralSource?: string;
    sessionType?: 'initial' | 'follow_up' | 'crisis' | 'group' | 'family' | 'assessment';
    treatmentPlan?: string;
    icdCodes?: string[];
    cptCodes?: string[];
  };
  
  // Timestamps and audit
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

const VirtualMeetingSchema = new Schema({
  platform: {
    type: String,
    enum: ['jitsi', 'zoom', 'teams', 'meet', 'custom'],
    required: true,
  },
  meetingId: {
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
  dialInNumbers: {
    type: [String],
    default: [],
  },
  isRecorded: {
    type: Boolean,
    default: false,
  },
  recordingUrl: {
    type: String,
    trim: true,
  },
}, { _id: false });

const PricingSchema = new Schema({
  basePrice: {
    type: Number,
    required: true,
    min: [0, 'Base price cannot be negative'],
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: [0, 'Discount amount cannot be negative'],
  },
  discountReason: {
    type: String,
    trim: true,
  },
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative'],
  },
  currency: {
    type: String,
    enum: ['EUR', 'USD', 'GBP'],
    default: 'EUR',
    uppercase: true,
  },
}, { _id: false });

const NotesSchema = new Schema({
  patientNotes: {
    type: String,
    trim: true,
    maxlength: [2000, 'Patient notes cannot exceed 2000 characters'],
  },
  professionalNotes: {
    type: String,
    trim: true,
    maxlength: [5000, 'Professional notes cannot exceed 5000 characters'],
  },
  adminNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Admin notes cannot exceed 1000 characters'],
  },
  cancellationReason: {
    type: String,
    trim: true,
    maxlength: [500, 'Cancellation reason cannot exceed 500 characters'],
  },
}, { _id: false });

const EmergencyContactSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  relationship: {
    type: String,
    required: true,
    trim: true,
  },
}, { _id: false });

const PatientInfoSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  dateOfBirth: {
    type: Date,
  },
  emergencyContact: EmergencyContactSchema,
}, { _id: false });

const ReminderSchema = new Schema({
  sent: {
    type: Boolean,
    default: false,
  },
  sentAt: {
    type: Date,
  },
  scheduledFor: {
    type: Date,
  },
}, { _id: false });

const AttachmentSchema = new Schema({
  fileId: {
    type: Schema.Types.ObjectId,
    ref: 'File',
    required: true,
  },
  fileName: {
    type: String,
    required: true,
    trim: true,
  },
  fileType: {
    type: String,
    required: true,
    trim: true,
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: false });

const AppointmentSchema = new Schema<IAppointmentDocument>(
  {
    // Core appointment data
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: [true, 'Patient is required'],
      index: true,
    },
    professionalId: {
      type: Schema.Types.ObjectId,
      ref: 'Professional',
      required: [true, 'Professional is required'],
      index: true,
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: [true, 'Service is required'],
      index: true,
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'Room',
      index: true,
    },
    
    // Scheduling
    startTime: {
      type: Date,
      required: [true, 'Start time is required'],
      index: true,
    },
    endTime: {
      type: Date,
      required: [true, 'End time is required'],
      validate: {
        validator: function(this: IAppointmentDocument, v: Date) {
          return v > this.startTime;
        },
        message: 'End time must be after start time',
      },
    },
    duration: {
      type: Number,
      required: [true, 'Duration is required'],
      min: [15, 'Minimum duration is 15 minutes'],
      max: [480, 'Maximum duration is 8 hours'],
    },
    timezone: {
      type: String,
      required: [true, 'Timezone is required'],
      default: 'Europe/Madrid',
    },
    
    // Status management
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled'],
      default: 'pending',
      index: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'paid', 'refunded', 'overdue'],
      default: 'pending',
      index: true,
    },
    
    // Booking source and method
    source: {
      type: String,
      enum: ['admin', 'public_booking', 'professional', 'patient_portal'],
      required: true,
      index: true,
    },
    bookingMethod: {
      type: String,
      enum: ['online', 'phone', 'in_person', 'email'],
      default: 'online',
    },
    
    // Virtual meeting integration
    virtualMeeting: VirtualMeetingSchema,
    
    // Pricing and billing
    pricing: {
      type: PricingSchema,
      required: true,
    },
    
    // Notes and documentation
    notes: NotesSchema,
    
    // Patient information snapshot
    patientInfo: {
      type: PatientInfoSchema,
      required: true,
    },
    
    // Forms and questionnaires
    forms: {
      intakeFormId: {
        type: Schema.Types.ObjectId,
        ref: 'FormSchema',
      },
      intakeCompleted: {
        type: Boolean,
        default: false,
      },
      preSessionFormId: {
        type: Schema.Types.ObjectId,
        ref: 'FormSchema',
      },
      preSessionCompleted: {
        type: Boolean,
        default: false,
      },
      postSessionFormId: {
        type: Schema.Types.ObjectId,
        ref: 'FormSchema',
      },
      postSessionCompleted: {
        type: Boolean,
        default: false,
      },
    },
    
    // Reminders and notifications
    reminders: {
      sms: { type: ReminderSchema, default: { sent: false } },
      email: { type: ReminderSchema, default: { sent: false } },
      push: { type: ReminderSchema, default: { sent: false } },
    },
    
    // Attendance and timing
    attendance: {
      patientArrived: { type: Boolean, default: false },
      patientArrivedAt: { type: Date },
      professionalPresent: { type: Boolean, default: false },
      sessionStarted: { type: Boolean, default: false },
      sessionStartedAt: { type: Date },
      sessionEnded: { type: Boolean, default: false },
      sessionEndedAt: { type: Date },
      actualDuration: { type: Number, min: 0 },
    },
    
    // Follow-up and next steps
    followUp: {
      nextAppointmentDate: { type: Date },
      nextAppointmentServiceId: {
        type: Schema.Types.ObjectId,
        ref: 'Service',
      },
      recommendedFrequency: {
        type: String,
        enum: ['weekly', 'biweekly', 'monthly', 'quarterly', 'as_needed'],
      },
      homeworkAssigned: {
        type: String,
        trim: true,
        maxlength: [1000, 'Homework cannot exceed 1000 characters'],
      },
      medicationChanges: {
        type: String,
        trim: true,
        maxlength: [500, 'Medication changes cannot exceed 500 characters'],
      },
    },
    
    // File attachments
    attachments: {
      type: [AttachmentSchema],
      default: [],
    },
    
    // Cancellation and rescheduling
    cancellation: {
      cancelledBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      cancelledAt: { type: Date },
      reason: {
        type: String,
        trim: true,
        maxlength: [500, 'Cancellation reason cannot exceed 500 characters'],
      },
      refundAmount: {
        type: Number,
        min: [0, 'Refund amount cannot be negative'],
      },
      refundProcessed: { type: Boolean, default: false },
      rescheduleOffered: { type: Boolean, default: false },
    },
    
    rescheduling: {
      originalStartTime: { type: Date },
      originalEndTime: { type: Date },
      rescheduledBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      rescheduledAt: { type: Date },
      reason: {
        type: String,
        trim: true,
        maxlength: [500, 'Rescheduling reason cannot exceed 500 characters'],
      },
      reschedulingCount: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    
    // Quality and feedback
    feedback: {
      patientRating: {
        type: Number,
        min: [1, 'Rating must be between 1 and 5'],
        max: [5, 'Rating must be between 1 and 5'],
      },
      patientComment: {
        type: String,
        trim: true,
        maxlength: [1000, 'Patient comment cannot exceed 1000 characters'],
      },
      professionalRating: {
        type: Number,
        min: [1, 'Rating must be between 1 and 5'],
        max: [5, 'Rating must be between 1 and 5'],
      },
      professionalComment: {
        type: String,
        trim: true,
        maxlength: [1000, 'Professional comment cannot exceed 1000 characters'],
      },
      overallSatisfaction: {
        type: Number,
        min: [1, 'Satisfaction rating must be between 1 and 5'],
        max: [5, 'Satisfaction rating must be between 1 and 5'],
      },
    },
    
    // Compliance and documentation
    compliance: {
      consentSigned: { type: Boolean, default: false },
      consentSignedAt: { type: Date },
      hipaaCompliant: { type: Boolean, default: false },
      documentationComplete: { type: Boolean, default: false },
      billingCoded: { type: Boolean, default: false },
    },
    
    // Metadata
    metadata: {
      referralSource: {
        type: String,
        trim: true,
      },
      sessionType: {
        type: String,
        enum: ['initial', 'follow_up', 'crisis', 'group', 'family', 'assessment'],
        default: 'follow_up',
      },
      treatmentPlan: {
        type: String,
        trim: true,
        maxlength: [2000, 'Treatment plan cannot exceed 2000 characters'],
      },
      icdCodes: {
        type: [String],
        default: [],
      },
      cptCodes: {
        type: [String],
        default: [],
      },
    },
    
    // Soft delete
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

// Compound indexes for efficient queries
AppointmentSchema.index({ professionalId: 1, startTime: 1 });
AppointmentSchema.index({ patientId: 1, startTime: -1 });
AppointmentSchema.index({ status: 1, startTime: 1 });
AppointmentSchema.index({ paymentStatus: 1, startTime: 1 });
AppointmentSchema.index({ startTime: 1, endTime: 1, professionalId: 1 });
AppointmentSchema.index({ startTime: 1, endTime: 1, roomId: 1 });
AppointmentSchema.index({ source: 1, createdAt: -1 });
AppointmentSchema.index({ serviceId: 1, status: 1 });

// Unique index to prevent double booking (same professional, overlapping times)
AppointmentSchema.index(
  { professionalId: 1, startTime: 1, endTime: 1 },
  {
    unique: true,
    partialFilterExpression: { 
      status: { $nin: ['cancelled', 'no_show'] },
      deletedAt: null
    },
    name: 'unique_professional_time_slot'
  }
);

// Text search index
AppointmentSchema.index({
  'patientInfo.name': 'text',
  'patientInfo.email': 'text',
  'notes.patientNotes': 'text',
  'notes.professionalNotes': 'text',
});

// Pre-save middleware
AppointmentSchema.pre('save', function(this: IAppointmentDocument, next) {
  // Calculate duration if not provided
  if (!this.duration && this.startTime && this.endTime) {
    this.duration = Math.round((this.endTime.getTime() - this.startTime.getTime()) / (1000 * 60));
  }
  
  // Update attendance actual duration when session ends
  if (this.attendance.sessionEnded && this.attendance.sessionStartedAt && this.attendance.sessionEndedAt) {
    this.attendance.actualDuration = Math.round(
      (this.attendance.sessionEndedAt.getTime() - this.attendance.sessionStartedAt.getTime()) / (1000 * 60)
    );
  }
  
  // Auto-generate virtual meeting link for virtual appointments
  if (!this.virtualMeeting && this.roomId && this.isNew) {
    // This will be populated by a post-save hook with room information
  }
  
  // Set compliance flags based on status
  if (this.status === 'completed') {
    this.compliance.documentationComplete = this.compliance.documentationComplete || false;
  }
  
  next();
});

// Static methods
AppointmentSchema.statics.findByProfessional = function(
  professionalId: mongoose.Types.ObjectId,
  startDate?: Date,
  endDate?: Date
) {
  const query: any = {
    professionalId,
    deletedAt: null,
  };
  
  if (startDate && endDate) {
    query.startTime = { $gte: startDate, $lte: endDate };
  } else if (startDate) {
    query.startTime = { $gte: startDate };
  }
  
  return this.find(query).sort({ startTime: 1 });
};

AppointmentSchema.statics.findByPatient = function(
  patientId: mongoose.Types.ObjectId,
  limit?: number
) {
  return this.find({
    patientId,
    deletedAt: null,
  })
    .sort({ startTime: -1 })
    .limit(limit || 20);
};

AppointmentSchema.statics.findConflicts = function(
  professionalId: mongoose.Types.ObjectId,
  startTime: Date,
  endTime: Date,
  excludeId?: mongoose.Types.ObjectId
) {
  const query: any = {
    professionalId,
    status: { $nin: ['cancelled', 'no_show'] },
    deletedAt: null,
    $or: [
      { startTime: { $lt: endTime, $gte: startTime } },
      { endTime: { $gt: startTime, $lte: endTime } },
      { startTime: { $lte: startTime }, endTime: { $gte: endTime } },
    ],
  };
  
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  return this.find(query);
};

AppointmentSchema.statics.findUpcoming = function(
  professionalId?: mongoose.Types.ObjectId,
  hours: number = 24
) {
  const now = new Date();
  const future = new Date(now.getTime() + hours * 60 * 60 * 1000);
  
  const query: any = {
    startTime: { $gte: now, $lte: future },
    status: { $in: ['confirmed', 'pending'] },
    deletedAt: null,
  };
  
  if (professionalId) {
    query.professionalId = professionalId;
  }
  
  return this.find(query).sort({ startTime: 1 });
};

AppointmentSchema.statics.findByStatus = function(
  status: string | string[],
  limit?: number
) {
  const statuses = Array.isArray(status) ? status : [status];
  
  return this.find({
    status: { $in: statuses },
    deletedAt: null,
  })
    .sort({ startTime: 1 })
    .limit(limit || 50);
};

AppointmentSchema.statics.getStatistics = function(
  professionalId?: mongoose.Types.ObjectId,
  startDate?: Date,
  endDate?: Date
) {
  const matchStage: any = { deletedAt: null };
  
  if (professionalId) {
    matchStage.professionalId = professionalId;
  }
  
  if (startDate && endDate) {
    matchStage.startTime = { $gte: startDate, $lte: endDate };
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        totalAppointments: { $sum: 1 },
        completedAppointments: {
          $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
        },
        cancelledAppointments: {
          $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
        },
        noShowAppointments: {
          $sum: { $cond: [{ $eq: ['$status', 'no_show'] }, 1, 0] }
        },
        totalRevenue: { $sum: '$pricing.totalAmount' },
        averageRating: { $avg: '$feedback.overallSatisfaction' },
        averageDuration: { $avg: '$duration' },
      }
    }
  ]);
};

// Instance methods
AppointmentSchema.methods.confirm = function() {
  this.status = 'confirmed';
  return this.save();
};

AppointmentSchema.methods.cancel = function(
  cancelledBy: mongoose.Types.ObjectId,
  reason: string,
  refundAmount?: number
) {
  this.status = 'cancelled';
  this.cancellation = {
    cancelledBy,
    cancelledAt: new Date(),
    reason,
    refundAmount: refundAmount || 0,
    refundProcessed: false,
    rescheduleOffered: true,
  };
  return this.save();
};

AppointmentSchema.methods.reschedule = function(
  newStartTime: Date,
  newEndTime: Date,
  rescheduledBy: mongoose.Types.ObjectId,
  reason: string
) {
  const originalStart = this.startTime;
  const originalEnd = this.endTime;
  
  this.startTime = newStartTime;
  this.endTime = newEndTime;
  this.duration = Math.round((newEndTime.getTime() - newStartTime.getTime()) / (1000 * 60));
  
  if (!this.rescheduling) {
    this.rescheduling = {
      originalStartTime: originalStart,
      originalEndTime: originalEnd,
      rescheduledBy,
      rescheduledAt: new Date(),
      reason,
      reschedulingCount: 1,
    };
  } else {
    this.rescheduling.reschedulingCount += 1;
    this.rescheduling.rescheduledAt = new Date();
    this.rescheduling.reason = reason;
  }
  
  // Reset reminders
  this.reminders.sms.sent = false;
  this.reminders.email.sent = false;
  this.reminders.push.sent = false;
  
  return this.save();
};

AppointmentSchema.methods.markArrived = function() {
  this.attendance.patientArrived = true;
  this.attendance.patientArrivedAt = new Date();
  return this.save();
};

AppointmentSchema.methods.startSession = function() {
  this.status = 'in_progress';
  this.attendance.sessionStarted = true;
  this.attendance.sessionStartedAt = new Date();
  this.attendance.professionalPresent = true;
  return this.save();
};

AppointmentSchema.methods.endSession = function() {
  this.status = 'completed';
  this.attendance.sessionEnded = true;
  this.attendance.sessionEndedAt = new Date();
  return this.save();
};

AppointmentSchema.methods.addFeedback = function(
  patientRating?: number,
  patientComment?: string,
  professionalRating?: number,
  professionalComment?: string
) {
  if (!this.feedback) {
    this.feedback = {};
  }
  
  if (patientRating) this.feedback.patientRating = patientRating;
  if (patientComment) this.feedback.patientComment = patientComment;
  if (professionalRating) this.feedback.professionalRating = professionalRating;
  if (professionalComment) this.feedback.professionalComment = professionalComment;
  
  // Calculate overall satisfaction
  const ratings = [
    this.feedback.patientRating,
    this.feedback.professionalRating
  ].filter(r => r !== undefined);
  
  if (ratings.length > 0) {
    this.feedback.overallSatisfaction = ratings.reduce((a, b) => a + b) / ratings.length;
  }
  
  return this.save();
};

AppointmentSchema.methods.addAttachment = function(
  fileId: mongoose.Types.ObjectId,
  fileName: string,
  fileType: string,
  uploadedBy: mongoose.Types.ObjectId
) {
  this.attachments.push({
    fileId,
    fileName,
    fileType,
    uploadedBy,
    uploadedAt: new Date(),
  });
  return this.save();
};

AppointmentSchema.methods.generateVirtualMeetingUrl = function(): string | null {
  if (!this.virtualMeeting || !this.roomId) {
    return null;
  }
  
  switch (this.virtualMeeting.platform) {
    case 'jitsi':
      const meetingId = this.virtualMeeting.meetingId || 
        `apt-${this._id.toString().substring(0, 8)}`;
      return `https://meet.jit.si/${meetingId}`;
    
    case 'zoom':
    case 'teams':
    case 'meet':
      return this.virtualMeeting.meetingUrl || null;
    
    default:
      return this.virtualMeeting.meetingUrl || null;
  }
};

AppointmentSchema.methods.canBeCancelled = function(): boolean {
  const now = new Date();
  const hoursUntilStart = (this.startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  return hoursUntilStart >= 2 && ['pending', 'confirmed'].includes(this.status);
};

AppointmentSchema.methods.canBeRescheduled = function(): boolean {
  const now = new Date();
  const hoursUntilStart = (this.startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  return hoursUntilStart >= 2 && ['pending', 'confirmed'].includes(this.status);
};

AppointmentSchema.methods.softDelete = function() {
  this.deletedAt = new Date();
  return this.save();
};

export const Appointment = mongoose.model<IAppointmentDocument>('Appointment', AppointmentSchema);
export default Appointment;

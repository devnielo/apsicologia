import mongoose, { Document, Schema } from 'mongoose';

export interface IFormResponseDocument extends Document {
  _id: mongoose.Types.ObjectId;
  
  // References
  formSchemaId: mongoose.Types.ObjectId;
  patientId: mongoose.Types.ObjectId;
  appointmentId?: mongoose.Types.ObjectId;
  professionalId?: mongoose.Types.ObjectId;
  assignedBy?: mongoose.Types.ObjectId;
  
  // Response status and workflow
  status: 'assigned' | 'in_progress' | 'completed' | 'submitted' | 'reviewed' | 'archived' | 'cancelled';
  
  // Response data
  responses: Record<string, any>;
  
  // Progress tracking
  progress: {
    currentStep: number;
    totalSteps: number;
    completedFields: string[];
    lastActiveField?: string;
    percentComplete: number;
  };
  
  // Timing information
  timing: {
    assignedAt?: Date;
    startedAt?: Date;
    lastSavedAt?: Date;
    completedAt?: Date;
    submittedAt?: Date;
    reviewedAt?: Date;
    totalTimeSpent: number; // minutes
    averageFieldTime: number; // seconds
  };
  
  // Scoring results (if form has scoring)
  scoring?: {
    totalScore?: {
      score: number;
      maxScore: number;
      percentage: number;
      interpretation?: {
        label: string;
        description: string;
        color?: string;
      };
    };
    subscales?: {
      name: string;
      score: number;
      maxScore: number;
      percentage: number;
      interpretation?: {
        label: string;
        description: string;
        color?: string;
      };
    }[];
    calculatedAt: Date;
    calculatedBy?: mongoose.Types.ObjectId;
  };
  
  // Validation results
  validation: {
    isValid: boolean;
    errors: {
      field: string;
      message: string;
      severity: 'error' | 'warning';
    }[];
    warnings: {
      field: string;
      message: string;
    }[];
    lastValidatedAt?: Date;
  };
  
  // Assignment and scheduling
  assignment: {
    dueDate?: Date;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    isOptional: boolean;
    instructions?: string;
    
    // Reminder tracking
    reminders: {
      sentAt: Date;
      type: 'email' | 'sms' | 'push' | 'in_app';
      status: 'sent' | 'delivered' | 'opened' | 'failed';
      reminderNumber: number;
    }[];
    
    // Overdue tracking
    isOverdue: boolean;
    overdueBy?: number; // days
    overdueSince?: Date;
  };
  
  // Review and approval workflow
  review: {
    isRequired: boolean;
    status?: 'pending' | 'approved' | 'needs_revision' | 'rejected';
    reviewedBy?: mongoose.Types.ObjectId;
    reviewedAt?: Date;
    reviewNotes?: string;
    
    // Clinical significance flags
    flags: {
      type: 'clinical_concern' | 'risk_indicator' | 'significant_change' | 'followup_needed' | 'other';
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      flaggedBy: mongoose.Types.ObjectId;
      flaggedAt: Date;
      resolved: boolean;
      resolvedAt?: Date;
      resolvedBy?: mongoose.Types.ObjectId;
    }[];
    
    // Professional notes
    clinicalNotes?: {
      note: string;
      isPrivate: boolean;
      addedBy: mongoose.Types.ObjectId;
      addedAt: Date;
    }[];
  };
  
  // Data quality and integrity
  dataQuality: {
    completeness: number; // percentage
    consistencyScore: number; // 0-100
    qualityFlags: {
      type: 'missing_data' | 'inconsistent_response' | 'extreme_value' | 'rapid_completion' | 'pattern_detected';
      description: string;
      field?: string;
      severity: 'info' | 'warning' | 'error';
    }[];
    
    // Response patterns
    responsePatterns: {
      straightLining: boolean; // same response to multiple questions
      speedCompletion: boolean; // completed too quickly
      missingCritical: boolean; // critical fields missing
    };
  };
  
  // Integration and export
  integration: {
    exportedToEMR: boolean;
    exportedAt?: Date;
    exportReference?: string;
    
    // Third-party sync
    syncedWithThirdParty: boolean;
    syncedAt?: Date;
    syncReference?: string;
    syncErrors: {
      error: string;
      occurredAt: Date;
      resolved: boolean;
    }[];
  };
  
  // Metadata and context
  metadata: {
    source: 'patient_portal' | 'admin_panel' | 'mobile_app' | 'kiosk' | 'email_link' | 'embedded';
    deviceInfo?: {
      type: 'desktop' | 'tablet' | 'mobile';
      browser?: string;
      os?: string;
    };
    ipAddress?: string;
    userAgent?: string;
    language: string;
    timezone: string;
    
    // Session information
    sessionId?: string;
    sessionStarted?: Date;
    sessionEnded?: Date;
    
    // Form version at time of response
    formVersion: string;
    formTitle: string;
  };
  
  // Privacy and consent
  privacy: {
    consentGiven: boolean;
    consentTimestamp?: Date;
    dataRetentionUntil?: Date;
    anonymized: boolean;
    anonymizedAt?: Date;
    
    // Data sharing permissions
    shareWithProvider: boolean;
    shareForResearch: boolean;
    shareAnonymized: boolean;
  };
  
  // Audit trail
  auditLog: {
    action: string;
    performedBy?: mongoose.Types.ObjectId;
    performedAt: Date;
    details?: string;
    ipAddress?: string;
    userAgent?: string;
    oldValue?: any;
    newValue?: any;
  }[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  
  // Instance methods
  calculateScore(): Promise<this>;
  updateProgress(): this;
  validateResponses(): this;
  markAsCompleted(): Promise<this>;
  submitForReview(): Promise<this>;
  addClinicalFlag(type: string, severity: string, description: string, flaggedBy: mongoose.Types.ObjectId): this;
  addClinicalNote(note: string, addedBy: mongoose.Types.ObjectId, isPrivate?: boolean): this;
  sendReminder(type: 'email' | 'sms' | 'push' | 'in_app'): Promise<boolean>;
  exportToEMR(): Promise<boolean>;
  anonymizeData(): Promise<this>;
  softDelete(): Promise<this>;
}

const ProgressSchema = new Schema({
  currentStep: {
    type: Number,
    default: 0,
    min: 0,
  },
  totalSteps: {
    type: Number,
    default: 1,
    min: 1,
  },
  completedFields: {
    type: [String],
    default: [],
  },
  lastActiveField: {
    type: String,
    trim: true,
  },
  percentComplete: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
}, { _id: false });

const TimingSchema = new Schema({
  assignedAt: {
    type: Date,
  },
  startedAt: {
    type: Date,
  },
  lastSavedAt: {
    type: Date,
  },
  completedAt: {
    type: Date,
  },
  submittedAt: {
    type: Date,
  },
  reviewedAt: {
    type: Date,
  },
  totalTimeSpent: {
    type: Number,
    default: 0,
    min: 0,
  },
  averageFieldTime: {
    type: Number,
    default: 0,
    min: 0,
  },
}, { _id: false });

const ScoringInterpretationSchema = new Schema({
  label: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  color: {
    type: String,
    trim: true,
  },
}, { _id: false });

const ScoringSchema = new Schema({
  totalScore: {
    score: {
      type: Number,
      required: true,
    },
    maxScore: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    interpretation: {
      type: ScoringInterpretationSchema,
    },
  },
  subscales: {
    type: [{
      name: {
        type: String,
        required: true,
        trim: true,
      },
      score: {
        type: Number,
        required: true,
      },
      maxScore: {
        type: Number,
        required: true,
      },
      percentage: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
      },
      interpretation: {
        type: ScoringInterpretationSchema,
      },
    }],
    default: [],
  },
  calculatedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  calculatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
}, { _id: false });

const ValidationSchema = new Schema({
  isValid: {
    type: Boolean,
    default: true,
  },
  errors: {
    type: [{
      field: {
        type: String,
        required: true,
        trim: true,
      },
      message: {
        type: String,
        required: true,
        trim: true,
      },
      severity: {
        type: String,
        enum: ['error', 'warning'],
        default: 'error',
      },
    }],
    default: [],
  },
  warnings: {
    type: [{
      field: {
        type: String,
        required: true,
        trim: true,
      },
      message: {
        type: String,
        required: true,
        trim: true,
      },
    }],
    default: [],
  },
  lastValidatedAt: {
    type: Date,
  },
}, { _id: false });

const ReminderSchema = new Schema({
  sentAt: {
    type: Date,
    required: true,
  },
  type: {
    type: String,
    enum: ['email', 'sms', 'push', 'in_app'],
    required: true,
  },
  status: {
    type: String,
    enum: ['sent', 'delivered', 'opened', 'failed'],
    default: 'sent',
  },
  reminderNumber: {
    type: Number,
    required: true,
    min: 1,
  },
}, { _id: false });

const AssignmentSchema = new Schema({
  dueDate: {
    type: Date,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  isOptional: {
    type: Boolean,
    default: true,
  },
  instructions: {
    type: String,
    trim: true,
    maxlength: [1000, 'Instructions cannot exceed 1000 characters'],
  },
  reminders: {
    type: [ReminderSchema],
    default: [],
  },
  isOverdue: {
    type: Boolean,
    default: false,
  },
  overdueBy: {
    type: Number,
    min: 0,
  },
  overdueSince: {
    type: Date,
  },
}, { _id: false });

const FlagSchema = new Schema({
  type: {
    type: String,
    enum: ['clinical_concern', 'risk_indicator', 'significant_change', 'followup_needed', 'other'],
    required: true,
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: [500, 'Flag description cannot exceed 500 characters'],
  },
  flaggedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  flaggedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  resolved: {
    type: Boolean,
    default: false,
  },
  resolvedAt: {
    type: Date,
  },
  resolvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
}, { _id: false });

const ClinicalNoteSchema = new Schema({
  note: {
    type: String,
    required: true,
    trim: true,
    maxlength: [2000, 'Clinical note cannot exceed 2000 characters'],
  },
  isPrivate: {
    type: Boolean,
    default: false,
  },
  addedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  addedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
}, { _id: false });

const ReviewSchema = new Schema({
  isRequired: {
    type: Boolean,
    default: false,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'needs_revision', 'rejected'],
  },
  reviewedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewedAt: {
    type: Date,
  },
  reviewNotes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Review notes cannot exceed 1000 characters'],
  },
  flags: {
    type: [FlagSchema],
    default: [],
  },
  clinicalNotes: {
    type: [ClinicalNoteSchema],
    default: [],
  },
}, { _id: false });

const QualityFlagSchema = new Schema({
  type: {
    type: String,
    enum: ['missing_data', 'inconsistent_response', 'extreme_value', 'rapid_completion', 'pattern_detected'],
    required: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  field: {
    type: String,
    trim: true,
  },
  severity: {
    type: String,
    enum: ['info', 'warning', 'error'],
    default: 'info',
  },
}, { _id: false });

const DataQualitySchema = new Schema({
  completeness: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  consistencyScore: {
    type: Number,
    default: 100,
    min: 0,
    max: 100,
  },
  qualityFlags: {
    type: [QualityFlagSchema],
    default: [],
  },
  responsePatterns: {
    straightLining: {
      type: Boolean,
      default: false,
    },
    speedCompletion: {
      type: Boolean,
      default: false,
    },
    missingCritical: {
      type: Boolean,
      default: false,
    },
  },
}, { _id: false });

const SyncErrorSchema = new Schema({
  error: {
    type: String,
    required: true,
    trim: true,
  },
  occurredAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  resolved: {
    type: Boolean,
    default: false,
  },
}, { _id: false });

const IntegrationSchema = new Schema({
  exportedToEMR: {
    type: Boolean,
    default: false,
  },
  exportedAt: {
    type: Date,
  },
  exportReference: {
    type: String,
    trim: true,
  },
  syncedWithThirdParty: {
    type: Boolean,
    default: false,
  },
  syncedAt: {
    type: Date,
  },
  syncReference: {
    type: String,
    trim: true,
  },
  syncErrors: {
    type: [SyncErrorSchema],
    default: [],
  },
}, { _id: false });

const DeviceInfoSchema = new Schema({
  type: {
    type: String,
    enum: ['desktop', 'tablet', 'mobile'],
  },
  browser: {
    type: String,
    trim: true,
  },
  os: {
    type: String,
    trim: true,
  },
}, { _id: false });

const MetadataSchema = new Schema({
  source: {
    type: String,
    enum: ['patient_portal', 'admin_panel', 'mobile_app', 'kiosk', 'email_link', 'embedded'],
    required: true,
  },
  deviceInfo: {
    type: DeviceInfoSchema,
  },
  ipAddress: {
    type: String,
    trim: true,
  },
  userAgent: {
    type: String,
    trim: true,
  },
  language: {
    type: String,
    default: 'es',
    trim: true,
    lowercase: true,
  },
  timezone: {
    type: String,
    default: 'Europe/Madrid',
    trim: true,
  },
  sessionId: {
    type: String,
    trim: true,
  },
  sessionStarted: {
    type: Date,
  },
  sessionEnded: {
    type: Date,
  },
  formVersion: {
    type: String,
    required: true,
    trim: true,
  },
  formTitle: {
    type: String,
    required: true,
    trim: true,
  },
}, { _id: false });

const PrivacySchema = new Schema({
  consentGiven: {
    type: Boolean,
    default: false,
  },
  consentTimestamp: {
    type: Date,
  },
  dataRetentionUntil: {
    type: Date,
  },
  anonymized: {
    type: Boolean,
    default: false,
  },
  anonymizedAt: {
    type: Date,
  },
  shareWithProvider: {
    type: Boolean,
    default: true,
  },
  shareForResearch: {
    type: Boolean,
    default: false,
  },
  shareAnonymized: {
    type: Boolean,
    default: false,
  },
}, { _id: false });

const AuditLogSchema = new Schema({
  action: {
    type: String,
    required: true,
    trim: true,
  },
  performedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  performedAt: {
    type: Date,
    required: true,
    default: Date.now,
  },
  details: {
    type: String,
    trim: true,
  },
  ipAddress: {
    type: String,
    trim: true,
  },
  userAgent: {
    type: String,
    trim: true,
  },
  oldValue: {
    type: Schema.Types.Mixed,
  },
  newValue: {
    type: Schema.Types.Mixed,
  },
}, { _id: false });

const FormResponseSchema = new Schema<IFormResponseDocument>(
  {
    // References
    formSchemaId: {
      type: Schema.Types.ObjectId,
      ref: 'FormSchema',
      required: true,
      index: true,
    },
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true,
    },
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment',
      index: true,
    },
    professionalId: {
      type: Schema.Types.ObjectId,
      ref: 'Professional',
      index: true,
    },
    assignedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    
    // Status
    status: {
      type: String,
      enum: ['assigned', 'in_progress', 'completed', 'submitted', 'reviewed', 'archived', 'cancelled'],
      default: 'assigned',
      index: true,
    },
    
    // Response data
    responses: {
      type: Schema.Types.Mixed,
      default: {},
    },
    
    // Progress
    progress: {
      type: ProgressSchema,
      default: {
        currentStep: 0,
        totalSteps: 1,
        completedFields: [],
        percentComplete: 0,
      },
    },
    
    // Timing
    timing: {
      type: TimingSchema,
      default: {
        totalTimeSpent: 0,
        averageFieldTime: 0,
      },
    },
    
    // Scoring
    scoring: {
      type: ScoringSchema,
    },
    
    // Validation
    validation: {
      type: ValidationSchema,
      default: {
        isValid: true,
        errors: [],
        warnings: [],
      },
    },
    
    // Assignment
    assignment: {
      type: AssignmentSchema,
      default: {
        priority: 'medium',
        isOptional: true,
        reminders: [],
        isOverdue: false,
      },
    },
    
    // Review
    review: {
      type: ReviewSchema,
      default: {
        isRequired: false,
        flags: [],
        clinicalNotes: [],
      },
    },
    
    // Data quality
    dataQuality: {
      type: DataQualitySchema,
      default: {
        completeness: 0,
        consistencyScore: 100,
        qualityFlags: [],
        responsePatterns: {
          straightLining: false,
          speedCompletion: false,
          missingCritical: false,
        },
      },
    },
    
    // Integration
    integration: {
      type: IntegrationSchema,
      default: {
        exportedToEMR: false,
        syncedWithThirdParty: false,
        syncErrors: [],
      },
    },
    
    // Metadata
    metadata: {
      type: MetadataSchema,
      required: true,
    },
    
    // Privacy
    privacy: {
      type: PrivacySchema,
      default: {
        consentGiven: false,
        anonymized: false,
        shareWithProvider: true,
        shareForResearch: false,
        shareAnonymized: false,
      },
    },
    
    // Audit log
    auditLog: {
      type: [AuditLogSchema],
      default: [],
    },
    
    // Soft delete
    deletedAt: {
      type: Date,
      index: true,
    },
  },
  { 
    timestamps: true,
    collection: 'form_responses',
    suppressReservedKeysWarning: true,
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

// Compound indexes
FormResponseSchema.index({ formSchemaId: 1, patientId: 1 });
FormResponseSchema.index({ patientId: 1, status: 1 });
FormResponseSchema.index({ status: 1, 'assignment.dueDate': 1 });
FormResponseSchema.index({ professionalId: 1, status: 1 });
FormResponseSchema.index({ 'assignment.isOverdue': 1, status: 1 });
FormResponseSchema.index({ createdAt: -1 });

// Pre-save middleware
FormResponseSchema.pre('save', function(this: IFormResponseDocument, next) {
  // Update progress
  this.updateProgress();
  
  // Check if overdue
  if (this.assignment.dueDate && new Date() > this.assignment.dueDate) {
    this.assignment.isOverdue = true;
    this.assignment.overdueSince = this.assignment.overdueSince || new Date();
    this.assignment.overdueBy = Math.ceil(
      (new Date().getTime() - this.assignment.dueDate.getTime()) / (1000 * 60 * 60 * 24)
    );
  }
  
  // Update timing
  if (this.isModified('responses')) {
    this.timing.lastSavedAt = new Date();
    
    if (this.status === 'in_progress' && !this.timing.startedAt) {
      this.timing.startedAt = new Date();
    }
  }
  
  next();
});

// Static methods
FormResponseSchema.statics.findByPatient = function(patientId: mongoose.Types.ObjectId) {
  return this.find({
    patientId,
    deletedAt: null,
  }).sort({ createdAt: -1 });
};

FormResponseSchema.statics.findOverdue = function() {
  return this.find({
    'assignment.isOverdue': true,
    status: { $in: ['assigned', 'in_progress'] },
    deletedAt: null,
  }).sort({ 'assignment.dueDate': 1 });
};

FormResponseSchema.statics.findPendingReview = function() {
  return this.find({
    status: 'submitted',
    'review.isRequired': true,
    deletedAt: null,
  }).sort({ 'timing.submittedAt': 1 });
};

FormResponseSchema.statics.getAnalytics = function(formSchemaId?: mongoose.Types.ObjectId) {
  const matchStage: any = { deletedAt: null };
  if (formSchemaId) {
    matchStage.formSchemaId = formSchemaId;
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        avgCompletionTime: { $avg: '$timing.totalTimeSpent' },
        avgCompleteness: { $avg: '$dataQuality.completeness' },
      },
    },
  ]);
};

// Instance methods
FormResponseSchema.methods.updateProgress = function() {
  const responses = this.responses || {};
  const totalFields = Object.keys(responses).length;
  const completedFields = Object.entries(responses)
    .filter(([key, value]) => value !== null && value !== undefined && value !== '')
    .map(([key]) => key);
  
  this.progress.completedFields = completedFields;
  this.progress.percentComplete = totalFields > 0 ? Math.round((completedFields.length / totalFields) * 100) : 0;
  
  return this;
};

FormResponseSchema.methods.validateResponses = function() {
  // This would integrate with the FormSchema validation
  // For now, basic validation
  const errors: any[] = [];
  const warnings: any[] = [];
  
  // Check for required fields (would come from form schema)
  const responses = this.responses || {};
  
  this.validation.errors = errors;
  this.validation.warnings = warnings;
  this.validation.isValid = errors.length === 0;
  this.validation.lastValidatedAt = new Date();
  
  return this;
};

FormResponseSchema.methods.calculateScore = async function() {
  // This would use the FormSchema scoring rules
  // Implementation would be similar to FormSchema.calculateScore
  // but working with actual response data
  
  this.scoring = {
    calculatedAt: new Date(),
  } as any;
  
  return this.save();
};

FormResponseSchema.methods.markAsCompleted = function() {
  this.status = 'completed';
  this.timing.completedAt = new Date();
  
  // Calculate total time if started
  if (this.timing.startedAt) {
    this.timing.totalTimeSpent = Math.round(
      (this.timing.completedAt.getTime() - this.timing.startedAt.getTime()) / (1000 * 60)
    );
  }
  
  this.addAuditLog('completed', this.patientId);
  
  return this.save();
};

FormResponseSchema.methods.submitForReview = function() {
  this.status = 'submitted';
  this.timing.submittedAt = new Date();
  
  if (this.review.isRequired) {
    this.review.status = 'pending';
  }
  
  this.addAuditLog('submitted', this.patientId);
  
  return this.save();
};

FormResponseSchema.methods.addClinicalFlag = function(
  type: string,
  severity: string,
  description: string,
  flaggedBy: mongoose.Types.ObjectId
) {
  this.review.flags.push({
    type: type as any,
    severity: severity as any,
    description,
    flaggedBy,
    flaggedAt: new Date(),
    resolved: false,
  });
  
  this.addAuditLog('flag_added', flaggedBy, `${type}: ${description}`);
  
  return this;
};

FormResponseSchema.methods.addClinicalNote = function(
  note: string,
  addedBy: mongoose.Types.ObjectId,
  isPrivate: boolean = false
) {
  this.review.clinicalNotes = this.review.clinicalNotes || [];
  this.review.clinicalNotes.push({
    note,
    isPrivate,
    addedBy,
    addedAt: new Date(),
  });
  
  this.addAuditLog('clinical_note_added', addedBy);
  
  return this;
};

FormResponseSchema.methods.sendReminder = async function(type: 'email' | 'sms' | 'push' | 'in_app') {
  // Implementation would integrate with notification system
  const reminderNumber = this.assignment.reminders.length + 1;
  
  this.assignment.reminders.push({
    sentAt: new Date(),
    type,
    status: 'sent',
    reminderNumber,
  });
  
  this.addAuditLog('reminder_sent', undefined, `${type} reminder #${reminderNumber}`);
  
  await this.save();
  return true;
};

FormResponseSchema.methods.exportToEMR = async function() {
  // Implementation would integrate with EMR system
  this.integration.exportedToEMR = true;
  this.integration.exportedAt = new Date();
  this.integration.exportReference = `EXP-${Date.now()}`;
  
  this.addAuditLog('exported_to_emr');
  
  await this.save();
  return true;
};

FormResponseSchema.methods.anonymizeData = function() {
  // Remove/hash PII from responses
  this.privacy.anonymized = true;
  this.privacy.anonymizedAt = new Date();
  
  // This would implement actual anonymization logic
  // For now, just mark as anonymized
  
  this.addAuditLog('data_anonymized');
  
  return this.save();
};

FormResponseSchema.methods.addAuditLog = function(
  action: string,
  performedBy?: mongoose.Types.ObjectId,
  details?: string
) {
  this.auditLog.push({
    action,
    performedBy,
    performedAt: new Date(),
    details,
  });
  
  return this;
};

FormResponseSchema.methods.softDelete = function() {
  this.deletedAt = new Date();
  this.status = 'archived';
  this.addAuditLog('deleted');
  return this.save();
};

export const FormResponse = mongoose.model<IFormResponseDocument>('FormResponse', FormResponseSchema);
export default FormResponse;

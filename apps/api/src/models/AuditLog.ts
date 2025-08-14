import mongoose, { Document, Schema } from 'mongoose';
import { IAuditLog } from '@apsicologia/shared/types';

export interface IAuditLogDocument extends Document {
  _id: mongoose.Types.ObjectId;
  
  // Core audit information
  action: string;
  entityType: string;
  entityId: mongoose.Types.ObjectId | string;
  
  // Actor information
  actorId?: mongoose.Types.ObjectId;
  actorType: 'user' | 'system' | 'api' | 'service' | 'external';
  actorEmail?: string;
  actorName?: string;
  actorRole?: string;
  
  // Session and context
  sessionId?: string;
  requestId?: string;
  correlationId?: string;
  
  // Request context
  ipAddress?: string;
  userAgent?: string;
  origin?: string;
  referer?: string;
  
  // Geographic and device information
  geoLocation?: {
    country?: string;
    region?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
    timezone?: string;
  };
  
  deviceInfo?: {
    deviceType: 'desktop' | 'mobile' | 'tablet' | 'unknown';
    browser?: string;
    browserVersion?: string;
    os?: string;
    osVersion?: string;
    isMobile: boolean;
  };
  
  // Change tracking
  changes?: {
    field: string;
    oldValue?: any;
    newValue?: any;
    changeType: 'create' | 'update' | 'delete' | 'access' | 'export';
  }[];
  
  // Before and after states
  beforeState?: any;
  afterState?: any;
  
  // Result and status
  status: 'success' | 'failure' | 'error' | 'warning' | 'partial';
  statusCode?: number;
  errorMessage?: string;
  errorStack?: string;
  
  // Performance metrics
  duration?: number; // in milliseconds
  cpuUsage?: number;
  memoryUsage?: number;
  
  // Security and compliance
  security: {
    riskLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
    
    // Authentication context
    authMethod?: 'password' | 'oauth' | 'jwt' | 'api_key' | 'saml' | 'ldap';
    mfaUsed?: boolean;
    tokenType?: 'bearer' | 'basic' | 'cookie' | 'header';
    
    // Authorization context
    permissions?: string[];
    roles?: string[];
    scopes?: string[];
    
    // Security flags
    flags: {
      type: 'suspicious_activity' | 'multiple_failures' | 'privilege_escalation' | 'data_breach' | 'unauthorized_access' | 'policy_violation';
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      autoDetected: boolean;
      reviewRequired: boolean;
      reviewedBy?: mongoose.Types.ObjectId;
      reviewedAt?: Date;
      resolution?: string;
    }[];
    
    // Compliance markers
    compliance: {
      hipaaRelevant: boolean;
      gdprRelevant: boolean;
      requiresRetention: boolean;
      retentionPeriod?: number; // in months
      complianceNotes?: string;
    };
  };
  
  // Business context
  business: {
    // Patient context (if applicable)
    patientId?: mongoose.Types.ObjectId;
    patientIdentifier?: string;
    
    // Professional context
    professionalId?: mongoose.Types.ObjectId;
    professionalIdentifier?: string;
    
    // Appointment context
    appointmentId?: mongoose.Types.ObjectId;
    
    // Organization context
    organizationId?: mongoose.Types.ObjectId;
    departmentId?: mongoose.Types.ObjectId;
    
    // Clinical context
    clinicalRelevant: boolean;
    containsPHI: boolean;
    dataClassification: 'public' | 'internal' | 'confidential' | 'restricted';
  };
  
  // Metadata and additional context
  metadata: {
    // Custom fields for specific audit needs
    customFields: Record<string, any>;
    
    // Tags for categorization
    tags: string[];
    
    // Priority level
    priority: 'low' | 'medium' | 'high' | 'critical';
    
    // Source system or service
    source: string;
    sourceVersion?: string;
    
    // Integration context
    integrationId?: string;
    externalTransactionId?: string;
    
    // Batch processing context
    batchId?: string;
    batchSize?: number;
    batchIndex?: number;
  };
  
  // Alerting and notifications
  alerting: {
    // Alert rules that were triggered
    triggeredRules: {
      ruleId: string;
      ruleName: string;
      ruleType: 'threshold' | 'pattern' | 'anomaly' | 'compliance' | 'security';
      severity: 'info' | 'warning' | 'error' | 'critical';
      triggered: boolean;
      notificationsSent: string[]; // channels where notifications were sent
    }[];
    
    // Notification status
    notificationStatus: {
      email: boolean;
      sms: boolean;
      slack: boolean;
      webhook: boolean;
      dashboard: boolean;
    };
  };
  
  // Data retention and archival
  retention: {
    category: string;
    retentionPeriod: number; // in months
    archiveAfter?: Date;
    deleteAfter?: Date;
    
    // Legal hold information
    legalHold?: {
      holdId: string;
      holdReason: string;
      holdDate: Date;
      releaseDate?: Date;
    };
  };
  
  // Related audit logs
  related: {
    parentLogId?: mongoose.Types.ObjectId;
    childLogIds: mongoose.Types.ObjectId[];
    correlatedLogs: mongoose.Types.ObjectId[];
    
    // Event chain tracking
    eventChainId?: string;
    eventSequence?: number;
  };
  
  // Timestamps
  timestamp: Date;
  createdAt: Date;
  
  // Instance methods
  addSecurityFlag(type: string, severity: string, description: string, autoDetected?: boolean): this;
  correlateWith(logId: mongoose.Types.ObjectId): Promise<this>;
  triggerAlert(ruleId: string, ruleName: string, severity: string): this;
  maskSensitiveData(): this;
  export(format: 'json' | 'csv' | 'xml'): any;
  calculateRiskScore(): number;
}

const AuditLogSchema = new Schema<IAuditLogDocument>(
  {
    // Core audit information
    action: {
      type: String,
      required: [true, 'Action is required'],
      trim: true,
      maxlength: [100, 'Action cannot exceed 100 characters'],
      index: true,
    },
    entityType: {
      type: String,
      required: [true, 'Entity type is required'],
      trim: true,
      index: true,
    },
    entityId: {
      type: Schema.Types.Mixed,
      required: [true, 'Entity ID is required'],
      index: true,
    },
    
    // Actor information
    actorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    actorType: {
      type: String,
      enum: ['user', 'system', 'api', 'service', 'external'],
      default: 'user',
      index: true,
    },
    actorEmail: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
    },
    actorName: {
      type: String,
      trim: true,
      index: true,
    },
    actorRole: {
      type: String,
      trim: true,
      index: true,
    },
    
    // Session context
    sessionId: {
      type: String,
      trim: true,
      index: true,
    },
    requestId: {
      type: String,
      trim: true,
      index: true,
    },
    correlationId: {
      type: String,
      trim: true,
      index: true,
    },
    
    // Request context
    ipAddress: {
      type: String,
      trim: true,
      validate: {
        validator: function(v: string) {
          if (!v) return true;
          // Simple IP validation (IPv4 and IPv6)
          const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
          const ipv6Regex = /^([0-9a-f]{1,4}:){7}[0-9a-f]{1,4}$/i;
          return ipv4Regex.test(v) || ipv6Regex.test(v);
        },
        message: 'Invalid IP address format',
      } as any,
      index: true,
    },
    userAgent: {
      type: String,
      trim: true,
      maxlength: [500, 'User agent cannot exceed 500 characters'],
    },
    origin: {
      type: String,
      trim: true,
      maxlength: [200, 'Origin cannot exceed 200 characters'],
    },
    referer: {
      type: String,
      trim: true,
      maxlength: [500, 'Referer cannot exceed 500 characters'],
    },
    
    // Geographic information
    geoLocation: {
      country: { type: String, trim: true },
      region: { type: String, trim: true },
      city: { type: String, trim: true },
      latitude: { type: Number, min: -90, max: 90 },
      longitude: { type: Number, min: -180, max: 180 },
      timezone: { type: String, trim: true },
    },
    
    // Device information
    deviceInfo: {
      deviceType: {
        type: String,
        enum: ['desktop', 'mobile', 'tablet', 'unknown'],
        default: 'unknown',
      },
      browser: { type: String, trim: true },
      browserVersion: { type: String, trim: true },
      os: { type: String, trim: true },
      osVersion: { type: String, trim: true },
      isMobile: { type: Boolean, default: false },
    },
    
    // Change tracking
    changes: {
      type: [{
        field: { type: String, required: true, trim: true },
        oldValue: { type: Schema.Types.Mixed },
        newValue: { type: Schema.Types.Mixed },
        changeType: {
          type: String,
          enum: ['create', 'update', 'delete', 'access', 'export'],
          required: true,
        },
      }],
      default: [],
    },
    
    // State snapshots
    beforeState: {
      type: Schema.Types.Mixed,
    },
    afterState: {
      type: Schema.Types.Mixed,
    },
    
    // Result information
    status: {
      type: String,
      enum: ['success', 'failure', 'error', 'warning', 'partial'],
      default: 'success',
      index: true,
    },
    statusCode: {
      type: Number,
      min: 100,
      max: 599,
    },
    errorMessage: {
      type: String,
      trim: true,
      maxlength: [1000, 'Error message cannot exceed 1000 characters'],
    },
    errorStack: {
      type: String,
      trim: true,
    },
    
    // Performance metrics
    duration: {
      type: Number,
      min: 0,
    },
    cpuUsage: {
      type: Number,
      min: 0,
      max: 100,
    },
    memoryUsage: {
      type: Number,
      min: 0,
    },
    
    // Security information
    security: {
      riskLevel: {
        type: String,
        enum: ['none', 'low', 'medium', 'high', 'critical'],
        default: 'none',
        index: true,
      },
      
      // Authentication
      authMethod: {
        type: String,
        enum: ['password', 'oauth', 'jwt', 'api_key', 'saml', 'ldap'],
      },
      mfaUsed: { type: Boolean, default: false },
      tokenType: {
        type: String,
        enum: ['bearer', 'basic', 'cookie', 'header'],
      },
      
      // Authorization
      permissions: { type: [String], default: [] },
      roles: { type: [String], default: [] },
      scopes: { type: [String], default: [] },
      
      // Security flags
      flags: {
        type: [{
          type: {
            type: String,
            enum: ['suspicious_activity', 'multiple_failures', 'privilege_escalation', 'data_breach', 'unauthorized_access', 'policy_violation'],
            required: true,
          },
          severity: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical'],
            required: true,
          },
          description: { type: String, required: true, trim: true },
          autoDetected: { type: Boolean, default: true },
          reviewRequired: { type: Boolean, default: false },
          reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
          reviewedAt: { type: Date },
          resolution: { type: String, trim: true },
        }],
        default: [],
      },
      
      // Compliance
      compliance: {
        hipaaRelevant: { type: Boolean, default: false },
        gdprRelevant: { type: Boolean, default: false },
        requiresRetention: { type: Boolean, default: true },
        retentionPeriod: { type: Number, default: 84 }, // 7 years
        complianceNotes: { type: String, trim: true },
      },
    },
    
    // Business context
    business: {
      patientId: {
        type: Schema.Types.ObjectId,
        ref: 'Patient',
        index: true,
      },
      patientIdentifier: {
        type: String,
        trim: true,
      },
      professionalId: {
        type: Schema.Types.ObjectId,
        ref: 'Professional',
        index: true,
      },
      professionalIdentifier: {
        type: String,
        trim: true,
      },
      appointmentId: {
        type: Schema.Types.ObjectId,
        ref: 'Appointment',
        index: true,
      },
      organizationId: {
        type: Schema.Types.ObjectId,
        index: true,
      },
      departmentId: {
        type: Schema.Types.ObjectId,
        index: true,
      },
      clinicalRelevant: { type: Boolean, default: false },
      containsPHI: { type: Boolean, default: false },
      dataClassification: {
        type: String,
        enum: ['public', 'internal', 'confidential', 'restricted'],
        default: 'internal',
        index: true,
      },
    },
    
    // Metadata
    metadata: {
      customFields: {
        type: Schema.Types.Mixed,
        default: {},
      },
      tags: {
        type: [String],
        default: [],
        index: true,
      },
      priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'medium',
        index: true,
      },
      source: {
        type: String,
        required: [true, 'Source is required'],
        trim: true,
        index: true,
      },
      sourceVersion: {
        type: String,
        trim: true,
      },
      integrationId: {
        type: String,
        trim: true,
      },
      externalTransactionId: {
        type: String,
        trim: true,
      },
      batchId: {
        type: String,
        trim: true,
        index: true,
      },
      batchSize: {
        type: Number,
        min: 1,
      },
      batchIndex: {
        type: Number,
        min: 0,
      },
    },
    
    // Alerting
    alerting: {
      triggeredRules: {
        type: [{
          ruleId: { type: String, required: true, trim: true },
          ruleName: { type: String, required: true, trim: true },
          ruleType: {
            type: String,
            enum: ['threshold', 'pattern', 'anomaly', 'compliance', 'security'],
            required: true,
          },
          severity: {
            type: String,
            enum: ['info', 'warning', 'error', 'critical'],
            required: true,
          },
          triggered: { type: Boolean, required: true },
          notificationsSent: { type: [String], default: [] },
        }],
        default: [],
      },
      notificationStatus: {
        email: { type: Boolean, default: false },
        sms: { type: Boolean, default: false },
        slack: { type: Boolean, default: false },
        webhook: { type: Boolean, default: false },
        dashboard: { type: Boolean, default: false },
      },
    },
    
    // Data retention
    retention: {
      category: {
        type: String,
        default: 'audit_log',
      },
      retentionPeriod: {
        type: Number,
        default: 84, // 7 years
        min: 1,
      },
      archiveAfter: { type: Date },
      deleteAfter: { type: Date },
      legalHold: {
        holdId: { type: String, trim: true },
        holdReason: { type: String, trim: true },
        holdDate: { type: Date },
        releaseDate: { type: Date },
      },
    },
    
    // Related logs
    related: {
      parentLogId: {
        type: Schema.Types.ObjectId,
        ref: 'AuditLog',
      },
      childLogIds: {
        type: [Schema.Types.ObjectId],
        ref: 'AuditLog',
        default: [],
      },
      correlatedLogs: {
        type: [Schema.Types.ObjectId],
        ref: 'AuditLog',
        default: [],
      },
      eventChainId: {
        type: String,
        trim: true,
        index: true,
      },
      eventSequence: {
        type: Number,
        min: 0,
      },
    },
    
    // Timestamps
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Only track creation
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
AuditLogSchema.index({ action: 1, entityType: 1, timestamp: -1 });
AuditLogSchema.index({ actorId: 1, timestamp: -1 });
AuditLogSchema.index({ 'business.patientId': 1, timestamp: -1 });
AuditLogSchema.index({ sessionId: 1, timestamp: -1 });
AuditLogSchema.index({ ipAddress: 1, timestamp: -1 });
AuditLogSchema.index({ status: 1, 'security.riskLevel': 1, timestamp: -1 });
AuditLogSchema.index({ 'metadata.source': 1, timestamp: -1 });
AuditLogSchema.index({ 'security.flags.type': 1, 'security.flags.severity': 1 });
AuditLogSchema.index({ 'business.dataClassification': 1, timestamp: -1 });
AuditLogSchema.index({ 'alerting.triggeredRules.severity': 1, timestamp: -1 });

// TTL index for automatic deletion based on retention policy
AuditLogSchema.index({ 'retention.deleteAfter': 1 }, { expireAfterSeconds: 0 });

// Text search index for searching audit logs
AuditLogSchema.index({
  action: 'text',
  'metadata.tags': 'text',
  errorMessage: 'text',
  'security.flags.description': 'text',
});

// Pre-save middleware
AuditLogSchema.pre('save', function(this: IAuditLogDocument, next) {
  // Set retention dates if not already set
  if (!this.retention.archiveAfter) {
    const archiveDate = new Date();
    archiveDate.setMonth(archiveDate.getMonth() + Math.floor(this.retention.retentionPeriod * 0.8));
    this.retention.archiveAfter = archiveDate;
  }
  
  if (!this.retention.deleteAfter) {
    const deleteDate = new Date();
    deleteDate.setMonth(deleteDate.getMonth() + this.retention.retentionPeriod);
    this.retention.deleteAfter = deleteDate;
  }
  
  // Auto-detect risk level based on various factors
  if (this.security.riskLevel === 'none') {
    this.security.riskLevel = this.calculateRiskScore() > 70 ? 'high' : 
                               this.calculateRiskScore() > 40 ? 'medium' : 'low';
  }
  
  next();
});

// Static methods for common audit queries
AuditLogSchema.statics.findByActor = function(actorId: mongoose.Types.ObjectId, limit: number = 100) {
  return this.find({ actorId })
    .sort({ timestamp: -1 })
    .limit(limit);
};

AuditLogSchema.statics.findByEntity = function(entityType: string, entityId: mongoose.Types.ObjectId | string) {
  return this.find({ entityType, entityId })
    .sort({ timestamp: -1 });
};

AuditLogSchema.statics.findSecurityEvents = function(severity?: string) {
  const query: any = {
    'security.flags.0': { $exists: true },
  };
  
  if (severity) {
    query['security.flags.severity'] = severity;
  }
  
  return this.find(query)
    .sort({ timestamp: -1 });
};

AuditLogSchema.statics.findByTimeRange = function(startDate: Date, endDate: Date) {
  return this.find({
    timestamp: {
      $gte: startDate,
      $lte: endDate,
    },
  }).sort({ timestamp: -1 });
};

AuditLogSchema.statics.findFailedOperations = function() {
  return this.find({
    status: { $in: ['failure', 'error'] },
  }).sort({ timestamp: -1 });
};

AuditLogSchema.statics.findByIPAddress = function(ipAddress: string) {
  return this.find({ ipAddress })
    .sort({ timestamp: -1 });
};

AuditLogSchema.statics.findPatientAccess = function(patientId: mongoose.Types.ObjectId) {
  return this.find({
    'business.patientId': patientId,
    'business.containsPHI': true,
  }).sort({ timestamp: -1 });
};

AuditLogSchema.statics.getComplianceReport = function(startDate: Date, endDate: Date) {
  return this.aggregate([
    {
      $match: {
        timestamp: { $gte: startDate, $lte: endDate },
        $or: [
          { 'security.compliance.hipaaRelevant': true },
          { 'security.compliance.gdprRelevant': true },
        ],
      },
    },
    {
      $group: {
        _id: {
          action: '$action',
          entityType: '$entityType',
          dataClassification: '$business.dataClassification',
        },
        count: { $sum: 1 },
        uniqueActors: { $addToSet: '$actorId' },
        avgDuration: { $avg: '$duration' },
        failureCount: {
          $sum: {
            $cond: [{ $in: ['$status', ['failure', 'error']] }, 1, 0],
          },
        },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

// Instance methods
AuditLogSchema.methods.addSecurityFlag = function(
  type: string,
  severity: string,
  description: string,
  autoDetected: boolean = true
) {
  this.security.flags.push({
    type: type as any,
    severity: severity as any,
    description,
    autoDetected,
    reviewRequired: severity === 'critical' || severity === 'high',
  });
  
  // Update risk level if this is a high severity flag
  if (severity === 'critical') {
    this.security.riskLevel = 'critical';
  } else if (severity === 'high' && this.security.riskLevel !== 'critical') {
    this.security.riskLevel = 'high';
  }
  
  return this;
};

AuditLogSchema.methods.correlateWith = async function(logId: mongoose.Types.ObjectId) {
  if (!this.related.correlatedLogs.includes(logId)) {
    this.related.correlatedLogs.push(logId);
  }
  
  // Also add correlation to the other log
  const otherLog = await (this.constructor as any).findById(logId);
  if (otherLog && !otherLog.related.correlatedLogs.includes(this._id)) {
    otherLog.related.correlatedLogs.push(this._id);
    await otherLog.save();
  }
  
  return this.save();
};

AuditLogSchema.methods.triggerAlert = function(
  ruleId: string,
  ruleName: string,
  severity: string
) {
  this.alerting.triggeredRules.push({
    ruleId,
    ruleName,
    ruleType: 'security',
    severity: severity as any,
    triggered: true,
    notificationsSent: [],
  });
  
  return this;
};

AuditLogSchema.methods.maskSensitiveData = function() {
  // Mask sensitive data in states and changes
  if (this.beforeState) {
    this.beforeState = this._maskObject(this.beforeState);
  }
  
  if (this.afterState) {
    this.afterState = this._maskObject(this.afterState);
  }
  
  this.changes?.forEach((change: any) => {
    if (this._isSensitiveField(change.field)) {
      change.oldValue = '***MASKED***';
      change.newValue = '***MASKED***';
    }
  });
  
  return this;
};

// Helper method to mask sensitive object fields
AuditLogSchema.methods._maskObject = function(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  
  const sensitiveFields = [
    'password', 'email', 'phone', 'ssn', 'creditCard', 'bankAccount',
    'birthDate', 'address', 'medicalRecord', 'diagnosis'
  ];
  
  const masked = { ...obj };
  
  sensitiveFields.forEach(field => {
    if (masked[field]) {
      masked[field] = '***MASKED***';
    }
  });
  
  return masked;
};

AuditLogSchema.methods._isSensitiveField = function(fieldName: string): boolean {
  const sensitivePatterns = [
    /password/i, /email/i, /phone/i, /ssn/i, /social/i,
    /credit/i, /bank/i, /birth/i, /address/i, /medical/i,
    /diagnosis/i, /treatment/i, /prescription/i
  ];
  
  return sensitivePatterns.some(pattern => pattern.test(fieldName));
};

AuditLogSchema.methods.export = function(format: 'json' | 'csv' | 'xml' = 'json') {
  const data = this.toObject();
  
  switch (format) {
    case 'json':
      return JSON.stringify(data, null, 2);
    
    case 'csv':
      // Simplified CSV export - would need proper CSV library
      const headers = Object.keys(data).join(',');
      const values = Object.values(data).map(v => 
        typeof v === 'object' ? JSON.stringify(v) : v
      ).join(',');
      return `${headers}\n${values}`;
    
    case 'xml':
      // Simplified XML export - would need proper XML library
      return `<audit-log>${JSON.stringify(data)}</audit-log>`;
    
    default:
      return data;
  }
};

AuditLogSchema.methods.calculateRiskScore = function(): number {
  let score = 0;
  
  // Base score based on action type
  const highRiskActions = ['delete', 'export', 'access_patient', 'modify_permissions'];
  if (highRiskActions.includes(this.action)) {
    score += 30;
  }
  
  // Add score for failed operations
  if (this.status === 'failure' || this.status === 'error') {
    score += 20;
  }
  
  // Add score for sensitive data access
  if (this.business.containsPHI) {
    score += 25;
  }
  
  // Add score for unusual access patterns
  if (this.deviceInfo?.deviceType === 'unknown') {
    score += 10;
  }
  
  // Add score for security flags
  this.security.flags.forEach((flag: any) => {
    switch (flag.severity) {
      case 'critical': score += 40; break;
      case 'high': score += 25; break;
      case 'medium': score += 15; break;
      case 'low': score += 5; break;
    }
  });
  
  // Add score for off-hours access
  const hour = this.timestamp.getHours();
  if (hour < 6 || hour > 22) {
    score += 15;
  }
  
  return Math.min(score, 100);
};

export const AuditLog = mongoose.model<IAuditLogDocument>('AuditLog', AuditLogSchema);
export default AuditLog;

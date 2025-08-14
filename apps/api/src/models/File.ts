import mongoose, { Document, Schema } from 'mongoose';
import { IFile } from '@apsicologia/shared/types';

export interface IFileDocument extends Document {
  _id: mongoose.Types.ObjectId;
  
  // File identification
  fileName: string;
  originalFileName: string;
  mimeType: string;
  fileExtension: string;
  fileSize: number;
  
  // Storage information
  storageProvider: 'local' | 'minio' | 's3' | 'gcp' | 'azure';
  storagePath: string;
  storageUrl?: string;
  bucketName?: string;
  
  // File hashing and integrity
  checksum: string;
  checksumAlgorithm: 'md5' | 'sha1' | 'sha256' | 'sha512';
  
  // Ownership and relationships
  ownerId: mongoose.Types.ObjectId;
  ownerType: 'patient' | 'professional' | 'appointment' | 'note' | 'form_response' | 'invoice' | 'system';
  
  // Related entities
  patientId?: mongoose.Types.ObjectId;
  professionalId?: mongoose.Types.ObjectId;
  appointmentId?: mongoose.Types.ObjectId;
  noteId?: mongoose.Types.ObjectId;
  formResponseId?: mongoose.Types.ObjectId;
  invoiceId?: mongoose.Types.ObjectId;
  
  // File classification
  category: 'document' | 'image' | 'audio' | 'video' | 'form' | 'medical_record' | 'invoice' | 'receipt' | 'consent' | 'identification' | 'insurance' | 'other';
  subcategory?: string;
  
  // File metadata
  description?: string;
  tags: string[];
  
  // Image/media specific metadata
  mediaMetadata?: {
    width?: number;
    height?: number;
    duration?: number; // for audio/video in seconds
    bitrate?: number;
    codec?: string;
    thumbnailPath?: string;
    thumbnailUrl?: string;
  };
  
  // Document specific metadata
  documentMetadata?: {
    pageCount?: number;
    title?: string;
    author?: string;
    subject?: string;
    keywords?: string[];
    textExtracted?: string; // for search
    ocrProcessed?: boolean;
    language?: string;
  };
  
  // Medical file specific metadata
  medicalMetadata?: {
    studyType?: string; // X-ray, MRI, CT scan, etc.
    studyDate?: Date;
    bodyPart?: string;
    modality?: string; // DICOM modality
    equipmentModel?: string;
    institutionName?: string;
    dicomData?: any; // DICOM specific data if applicable
  };
  
  // Access control and permissions
  permissions: {
    visibility: 'private' | 'shared' | 'public';
    
    // User-specific permissions
    userPermissions: {
      userId: mongoose.Types.ObjectId;
      canRead: boolean;
      canWrite: boolean;
      canDelete: boolean;
      canShare: boolean;
      grantedBy: mongoose.Types.ObjectId;
      grantedAt: Date;
      expiresAt?: Date;
    }[];
    
    // Role-based permissions
    rolePermissions: {
      role: 'admin' | 'professional' | 'reception' | 'patient';
      canRead: boolean;
      canWrite: boolean;
      canDelete: boolean;
      canShare: boolean;
    }[];
    
    // Public access settings
    publicAccess?: {
      enabled: boolean;
      requiresToken: boolean;
      token?: string;
      expiresAt?: Date;
      downloadLimit?: number;
      currentDownloads: number;
    };
  };
  
  // Processing status
  processing: {
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
    
    // Processing tasks
    tasks: {
      taskType: 'thumbnail' | 'ocr' | 'virus_scan' | 'transcription' | 'compression' | 'watermark' | 'encryption';
      status: 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';
      startedAt?: Date;
      completedAt?: Date;
      errorMessage?: string;
      resultData?: any;
    }[];
    
    // Processing queue information
    queuedAt?: Date;
    processedAt?: Date;
    processingDuration?: number; // in milliseconds
  };
  
  // Security and encryption
  security: {
    isEncrypted: boolean;
    encryptionMethod?: 'aes-256' | 'aes-128' | 'rsa' | 'pgp';
    encryptionKeyId?: string;
    
    // Virus scanning
    virusScanned: boolean;
    virusScanResult?: 'clean' | 'infected' | 'suspicious' | 'error';
    virusScanDate?: Date;
    virusScanEngine?: string;
    
    // Digital signatures
    digitalSignature?: {
      isSigned: boolean;
      signedBy?: mongoose.Types.ObjectId;
      signedAt?: Date;
      signatureData?: string;
      certificateInfo?: any;
    };
    
    // Watermarking
    watermark?: {
      hasWatermark: boolean;
      watermarkType?: 'text' | 'image' | 'invisible';
      watermarkData?: string;
    };
  };
  
  // Version control
  versioning: {
    version: number;
    isLatestVersion: boolean;
    parentFileId?: mongoose.Types.ObjectId;
    childFileIds: mongoose.Types.ObjectId[];
    
    // Version history
    versionHistory: {
      version: number;
      uploadedBy: mongoose.Types.ObjectId;
      uploadedAt: Date;
      changeDescription?: string;
      fileSize: number;
      checksum: string;
    }[];
  };
  
  // Download and access tracking
  accessTracking: {
    downloadCount: number;
    viewCount: number;
    lastDownloadedAt?: Date;
    lastViewedAt?: Date;
    
    // Download history
    downloadHistory: {
      downloadedBy: mongoose.Types.ObjectId;
      downloadedAt: Date;
      ipAddress?: string;
      userAgent?: string;
      downloadMethod: 'direct' | 'preview' | 'api' | 'email';
    }[];
    
    // Access analytics
    analytics: {
      uniqueViewers: number;
      uniqueDownloaders: number;
      averageViewDuration?: number;
      topReferrers: string[];
      deviceTypes: {
        desktop: number;
        mobile: number;
        tablet: number;
      };
    };
  };
  
  // Compliance and legal
  compliance: {
    // HIPAA compliance
    hipaaCompliant: boolean;
    containsPHI: boolean;
    phiCategories?: string[];
    
    // GDPR compliance
    gdprCompliant: boolean;
    containsPII: boolean;
    piiCategories?: string[];
    dataRetentionPeriod?: number; // in months
    
    // Legal holds
    legalHolds: {
      holdId: string;
      holdReason: string;
      holdBy: mongoose.Types.ObjectId;
      holdDate: Date;
      releaseDate?: Date;
    }[];
    
    // Audit requirements
    auditRequired: boolean;
    auditFrequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually';
    lastAuditDate?: Date;
    nextAuditDate?: Date;
  };
  
  // Backup and archival
  backup: {
    isBackedUp: boolean;
    backupDate?: Date;
    backupLocation?: string;
    backupProvider?: string;
    
    // Archival status
    isArchived: boolean;
    archivedDate?: Date;
    archivalTier?: 'hot' | 'warm' | 'cold' | 'frozen';
    estimatedRetrievalTime?: number; // in hours
    
    // Retention policy
    retentionPolicy: {
      category: string;
      retentionPeriod: number; // in months
      deleteAfter?: Date;
      autoDelete: boolean;
    };
  };
  
  // Upload information
  upload: {
    uploadedBy: mongoose.Types.ObjectId;
    uploadMethod: 'web_upload' | 'api' | 'email' | 'sync' | 'import' | 'scan';
    uploadSource?: string; // source application or service
    uploadSession?: string;
    uploadProgress?: number; // 0-100
    
    // Upload validation
    validated: boolean;
    validationErrors: string[];
    validationWarnings: string[];
    
    // Chunked upload support
    isChunkedUpload: boolean;
    chunkCount?: number;
    chunksReceived?: number;
    chunkIds?: string[];
  };
  
  // Integration with external systems
  integrations: {
    // EMR integration
    emrIntegration?: {
      emrSystem: string;
      emrRecordId: string;
      syncStatus: 'pending' | 'synced' | 'failed' | 'conflict';
      lastSyncAt?: Date;
      syncErrors?: string[];
    };
    
    // Cloud storage sync
    cloudSync?: {
      provider: string;
      providerId: string;
      syncStatus: 'pending' | 'synced' | 'failed';
      lastSyncAt?: Date;
    };
  };
  
  // Audit log
  auditLog: {
    action: string;
    performedBy: mongoose.Types.ObjectId;
    performedAt: Date;
    ipAddress?: string;
    userAgent?: string;
    details?: string;
    oldValues?: any;
    newValues?: any;
  }[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  
  // Instance methods
  generateDownloadUrl(expiresIn?: number): Promise<string>;
  generatePreviewUrl(expiresIn?: number): Promise<string>;
  generateThumbnail(): Promise<string>;
  extractText(): Promise<string>;
  scanForVirus(): Promise<boolean>;
  encrypt(keyId?: string): Promise<boolean>;
  decrypt(): Promise<boolean>;
  createVersion(uploadedBy: mongoose.Types.ObjectId, description?: string): Promise<IFileDocument>;
  grantPermission(userId: mongoose.Types.ObjectId, permissions: any, grantedBy: mongoose.Types.ObjectId): Promise<this>;
  revokePermission(userId: mongoose.Types.ObjectId): Promise<this>;
  addToLegalHold(holdId: string, reason: string, holdBy: mongoose.Types.ObjectId): Promise<this>;
  releaseFromLegalHold(holdId: string): Promise<this>;
  archive(tier?: string): Promise<this>;
  restore(): Promise<this>;
  softDelete(): Promise<this>;
}

const FileSchema = new Schema<IFileDocument>(
  {
    // File identification
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
      maxlength: [255, 'File name cannot exceed 255 characters'],
      index: true,
    },
    originalFileName: {
      type: String,
      required: [true, 'Original file name is required'],
      trim: true,
      maxlength: [255, 'Original file name cannot exceed 255 characters'],
    },
    mimeType: {
      type: String,
      required: [true, 'MIME type is required'],
      trim: true,
      lowercase: true,
    },
    fileExtension: {
      type: String,
      required: [true, 'File extension is required'],
      trim: true,
      lowercase: true,
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required'],
      min: [0, 'File size cannot be negative'],
    },
    
    // Storage information
    storageProvider: {
      type: String,
      enum: ['local', 'minio', 's3', 'gcp', 'azure'],
      required: true,
      default: 'minio',
    },
    storagePath: {
      type: String,
      required: [true, 'Storage path is required'],
      trim: true,
    },
    storageUrl: {
      type: String,
      trim: true,
    },
    bucketName: {
      type: String,
      trim: true,
    },
    
    // File integrity
    checksum: {
      type: String,
      required: [true, 'Checksum is required'],
      trim: true,
    },
    checksumAlgorithm: {
      type: String,
      enum: ['md5', 'sha1', 'sha256', 'sha512'],
      default: 'sha256',
    },
    
    // Ownership
    ownerId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    ownerType: {
      type: String,
      enum: ['patient', 'professional', 'appointment', 'note', 'form_response', 'invoice', 'system'],
      required: true,
      index: true,
    },
    
    // Related entities
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      index: true,
    },
    professionalId: {
      type: Schema.Types.ObjectId,
      ref: 'Professional',
      index: true,
    },
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment',
      index: true,
    },
    noteId: {
      type: Schema.Types.ObjectId,
      ref: 'Note',
      index: true,
    },
    formResponseId: {
      type: Schema.Types.ObjectId,
      ref: 'FormResponse',
      index: true,
    },
    invoiceId: {
      type: Schema.Types.ObjectId,
      ref: 'Invoice',
      index: true,
    },
    
    // Classification
    category: {
      type: String,
      enum: ['document', 'image', 'audio', 'video', 'form', 'medical_record', 'invoice', 'receipt', 'consent', 'identification', 'insurance', 'other'],
      required: true,
      index: true,
    },
    subcategory: {
      type: String,
      trim: true,
    },
    
    // Metadata
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    tags: {
      type: [String],
      default: [],
    },
    
    // Media metadata
    mediaMetadata: {
      width: { type: Number, min: 0 },
      height: { type: Number, min: 0 },
      duration: { type: Number, min: 0 },
      bitrate: { type: Number, min: 0 },
      codec: { type: String, trim: true },
      thumbnailPath: { type: String, trim: true },
      thumbnailUrl: { type: String, trim: true },
    },
    
    // Document metadata
    documentMetadata: {
      pageCount: { type: Number, min: 0 },
      title: { type: String, trim: true },
      author: { type: String, trim: true },
      subject: { type: String, trim: true },
      keywords: { type: [String], default: [] },
      textExtracted: { type: String, text: true },
      ocrProcessed: { type: Boolean, default: false },
      language: { type: String, trim: true, default: 'es' },
    },
    
    // Medical metadata
    medicalMetadata: {
      studyType: { type: String, trim: true },
      studyDate: { type: Date },
      bodyPart: { type: String, trim: true },
      modality: { type: String, trim: true },
      equipmentModel: { type: String, trim: true },
      institutionName: { type: String, trim: true },
      dicomData: { type: Schema.Types.Mixed },
    },
    
    // Permissions (simplified)
    permissions: {
      visibility: {
        type: String,
        enum: ['private', 'shared', 'public'],
        default: 'private',
      },
      userPermissions: {
        type: [{
          userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
          canRead: { type: Boolean, default: true },
          canWrite: { type: Boolean, default: false },
          canDelete: { type: Boolean, default: false },
          canShare: { type: Boolean, default: false },
          grantedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
          grantedAt: { type: Date, required: true, default: Date.now },
          expiresAt: { type: Date },
        }],
        default: [],
      },
      rolePermissions: {
        type: [{
          role: {
            type: String,
            enum: ['admin', 'professional', 'reception', 'patient'],
            required: true,
          },
          canRead: { type: Boolean, default: true },
          canWrite: { type: Boolean, default: false },
          canDelete: { type: Boolean, default: false },
          canShare: { type: Boolean, default: false },
        }],
        default: [],
      },
      publicAccess: {
        enabled: { type: Boolean, default: false },
        requiresToken: { type: Boolean, default: true },
        token: { type: String, trim: true },
        expiresAt: { type: Date },
        downloadLimit: { type: Number, min: 0 },
        currentDownloads: { type: Number, default: 0, min: 0 },
      },
    },
    
    // Processing
    processing: {
      status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'failed', 'cancelled'],
        default: 'pending',
        index: true,
      },
      tasks: {
        type: [{
          taskType: {
            type: String,
            enum: ['thumbnail', 'ocr', 'virus_scan', 'transcription', 'compression', 'watermark', 'encryption'],
            required: true,
          },
          status: {
            type: String,
            enum: ['pending', 'processing', 'completed', 'failed', 'skipped'],
            default: 'pending',
          },
          startedAt: { type: Date },
          completedAt: { type: Date },
          errorMessage: { type: String, trim: true },
          resultData: { type: Schema.Types.Mixed },
        }],
        default: [],
      },
      queuedAt: { type: Date },
      processedAt: { type: Date },
      processingDuration: { type: Number, min: 0 },
    },
    
    // Security
    security: {
      isEncrypted: { type: Boolean, default: false },
      encryptionMethod: {
        type: String,
        enum: ['aes-256', 'aes-128', 'rsa', 'pgp'],
      },
      encryptionKeyId: { type: String, trim: true },
      
      virusScanned: { type: Boolean, default: false },
      virusScanResult: {
        type: String,
        enum: ['clean', 'infected', 'suspicious', 'error'],
      },
      virusScanDate: { type: Date },
      virusScanEngine: { type: String, trim: true },
      
      digitalSignature: {
        isSigned: { type: Boolean, default: false },
        signedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        signedAt: { type: Date },
        signatureData: { type: String, trim: true },
        certificateInfo: { type: Schema.Types.Mixed },
      },
      
      watermark: {
        hasWatermark: { type: Boolean, default: false },
        watermarkType: {
          type: String,
          enum: ['text', 'image', 'invisible'],
        },
        watermarkData: { type: String, trim: true },
      },
    },
    
    // Versioning
    versioning: {
      version: { type: Number, default: 1, min: 1 },
      isLatestVersion: { type: Boolean, default: true },
      parentFileId: { type: Schema.Types.ObjectId, ref: 'File' },
      childFileIds: {
        type: [Schema.Types.ObjectId],
        ref: 'File',
        default: [],
      },
      versionHistory: {
        type: [{
          version: { type: Number, required: true, min: 1 },
          uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
          uploadedAt: { type: Date, required: true },
          changeDescription: { type: String, trim: true },
          fileSize: { type: Number, required: true, min: 0 },
          checksum: { type: String, required: true, trim: true },
        }],
        default: [],
      },
    },
    
    // Access tracking (simplified)
    accessTracking: {
      downloadCount: { type: Number, default: 0, min: 0 },
      viewCount: { type: Number, default: 0, min: 0 },
      lastDownloadedAt: { type: Date },
      lastViewedAt: { type: Date },
      
      downloadHistory: {
        type: [{
          downloadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
          downloadedAt: { type: Date, required: true, default: Date.now },
          ipAddress: { type: String, trim: true },
          userAgent: { type: String, trim: true },
          downloadMethod: {
            type: String,
            enum: ['direct', 'preview', 'api', 'email'],
            default: 'direct',
          },
        }],
        default: [],
      },
      
      analytics: {
        uniqueViewers: { type: Number, default: 0, min: 0 },
        uniqueDownloaders: { type: Number, default: 0, min: 0 },
        averageViewDuration: { type: Number, min: 0 },
        topReferrers: { type: [String], default: [] },
        deviceTypes: {
          desktop: { type: Number, default: 0, min: 0 },
          mobile: { type: Number, default: 0, min: 0 },
          tablet: { type: Number, default: 0, min: 0 },
        },
      },
    },
    
    // Compliance (simplified)
    compliance: {
      hipaaCompliant: { type: Boolean, default: false },
      containsPHI: { type: Boolean, default: false },
      phiCategories: { type: [String], default: [] },
      
      gdprCompliant: { type: Boolean, default: true },
      containsPII: { type: Boolean, default: false },
      piiCategories: { type: [String], default: [] },
      dataRetentionPeriod: { type: Number, min: 1 },
      
      legalHolds: {
        type: [{
          holdId: { type: String, required: true, trim: true },
          holdReason: { type: String, required: true, trim: true },
          holdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
          holdDate: { type: Date, required: true },
          releaseDate: { type: Date },
        }],
        default: [],
      },
      
      auditRequired: { type: Boolean, default: false },
      auditFrequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly', 'quarterly', 'annually'],
      },
      lastAuditDate: { type: Date },
      nextAuditDate: { type: Date },
    },
    
    // Backup (simplified)
    backup: {
      isBackedUp: { type: Boolean, default: false },
      backupDate: { type: Date },
      backupLocation: { type: String, trim: true },
      backupProvider: { type: String, trim: true },
      
      isArchived: { type: Boolean, default: false },
      archivedDate: { type: Date },
      archivalTier: {
        type: String,
        enum: ['hot', 'warm', 'cold', 'frozen'],
        default: 'hot',
      },
      estimatedRetrievalTime: { type: Number, min: 0 },
      
      retentionPolicy: {
        category: { type: String, default: 'general' },
        retentionPeriod: { type: Number, default: 84 }, // 7 years
        deleteAfter: { type: Date },
        autoDelete: { type: Boolean, default: false },
      },
    },
    
    // Upload info
    upload: {
      uploadedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      uploadMethod: {
        type: String,
        enum: ['web_upload', 'api', 'email', 'sync', 'import', 'scan'],
        default: 'web_upload',
      },
      uploadSource: { type: String, trim: true },
      uploadSession: { type: String, trim: true },
      uploadProgress: { type: Number, min: 0, max: 100, default: 100 },
      
      validated: { type: Boolean, default: false },
      validationErrors: { type: [String], default: [] },
      validationWarnings: { type: [String], default: [] },
      
      isChunkedUpload: { type: Boolean, default: false },
      chunkCount: { type: Number, min: 1 },
      chunksReceived: { type: Number, min: 0 },
      chunkIds: { type: [String], default: [] },
    },
    
    // Integrations (simplified)
    integrations: {
      emrIntegration: {
        emrSystem: { type: String, trim: true },
        emrRecordId: { type: String, trim: true },
        syncStatus: {
          type: String,
          enum: ['pending', 'synced', 'failed', 'conflict'],
          default: 'pending',
        },
        lastSyncAt: { type: Date },
        syncErrors: { type: [String], default: [] },
      },
      cloudSync: {
        provider: { type: String, trim: true },
        providerId: { type: String, trim: true },
        syncStatus: {
          type: String,
          enum: ['pending', 'synced', 'failed'],
          default: 'pending',
        },
        lastSyncAt: { type: Date },
      },
    },
    
    // Audit log
    auditLog: {
      type: [{
        action: { type: String, required: true, trim: true },
        performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        performedAt: { type: Date, required: true, default: Date.now },
        ipAddress: { type: String, trim: true },
        userAgent: { type: String, trim: true },
        details: { type: String, trim: true },
        oldValues: { type: Schema.Types.Mixed },
        newValues: { type: Schema.Types.Mixed },
      }],
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
FileSchema.index({ ownerId: 1, ownerType: 1 });
FileSchema.index({ patientId: 1, category: 1 });
FileSchema.index({ category: 1, createdAt: -1 });
FileSchema.index({ checksum: 1, fileSize: 1 }, { unique: false }); // For duplicate detection
FileSchema.index({ 'processing.status': 1, createdAt: 1 });
FileSchema.index({ 'versioning.isLatestVersion': 1, 'versioning.parentFileId': 1 });
FileSchema.index({ 'security.virusScanned': 1, 'security.virusScanResult': 1 });

// Text search index
FileSchema.index({
  fileName: 'text',
  originalFileName: 'text',
  description: 'text',
  tags: 'text',
  'documentMetadata.textExtracted': 'text',
});

// TTL index for temporary files
FileSchema.index({ 'backup.retentionPolicy.deleteAfter': 1 }, { expireAfterSeconds: 0 });

// Pre-save middleware
FileSchema.pre('save', function(this: IFileDocument, next) {
  // Set retention date if not set
  if (!this.backup.retentionPolicy.deleteAfter) {
    const retentionDate = new Date();
    retentionDate.setMonth(retentionDate.getMonth() + this.backup.retentionPolicy.retentionPeriod);
    this.backup.retentionPolicy.deleteAfter = retentionDate;
  }
  
  // Add to version history if this is a new version
  if (this.isModified('checksum') && !this.isNew) {
    this.versioning.versionHistory.push({
      version: this.versioning.version,
      uploadedBy: this.upload.uploadedBy,
      uploadedAt: new Date(),
      fileSize: this.fileSize,
      checksum: this.checksum,
    });
    this.versioning.version += 1;
  }
  
  next();
});

// Static methods
FileSchema.statics.findByOwner = function(ownerId: mongoose.Types.ObjectId, ownerType: string) {
  return this.find({
    ownerId,
    ownerType,
    deletedAt: null,
  }).sort({ createdAt: -1 });
};

FileSchema.statics.findPendingProcessing = function() {
  return this.find({
    'processing.status': 'pending',
    deletedAt: null,
  }).sort({ createdAt: 1 });
};

FileSchema.statics.findDuplicates = function(checksum: string, fileSize: number) {
  return this.find({
    checksum,
    fileSize,
    deletedAt: null,
  });
};

FileSchema.statics.findExpiredFiles = function() {
  return this.find({
    'backup.retentionPolicy.deleteAfter': { $lte: new Date() },
    'backup.retentionPolicy.autoDelete': true,
    deletedAt: null,
  });
};

// Instance methods
FileSchema.methods.generateDownloadUrl = async function(expiresIn: number = 3600) {
  // This would integrate with the actual storage provider
  // For now, return a placeholder URL
  const baseUrl = process.env.STORAGE_BASE_URL || 'http://localhost:9000';
  const token = `${this._id}_${Date.now()}_${Math.random()}`;
  
  // Track download preparation
  this.auditLog.push({
    action: 'download_url_generated',
    performedBy: this.upload.uploadedBy, // This should be passed as parameter
    performedAt: new Date(),
    details: `URL expires in ${expiresIn} seconds`,
  });
  
  await this.save();
  
  return `${baseUrl}/${this.bucketName}/${this.storagePath}?token=${token}&expires=${expiresIn}`;
};

FileSchema.methods.generatePreviewUrl = async function(expiresIn: number = 3600) {
  // Generate thumbnail or preview URL
  if (this.mediaMetadata?.thumbnailUrl) {
    return this.mediaMetadata.thumbnailUrl;
  }
  
  // Generate preview URL similar to download URL
  return this.generateDownloadUrl(expiresIn);
};

FileSchema.methods.generateThumbnail = async function() {
  // This would queue a thumbnail generation task
  this.processing.tasks.push({
    taskType: 'thumbnail',
    status: 'pending',
  });
  
  this.processing.status = 'pending';
  
  this.auditLog.push({
    action: 'thumbnail_generation_queued',
    performedBy: this.upload.uploadedBy,
    performedAt: new Date(),
  });
  
  await this.save();
  
  return 'thumbnail_queued';
};

FileSchema.methods.extractText = async function() {
  // This would queue OCR or text extraction task
  if (this.documentMetadata?.textExtracted) {
    return this.documentMetadata.textExtracted;
  }
  
  this.processing.tasks.push({
    taskType: 'ocr',
    status: 'pending',
  });
  
  this.processing.status = 'pending';
  
  this.auditLog.push({
    action: 'text_extraction_queued',
    performedBy: this.upload.uploadedBy,
    performedAt: new Date(),
  });
  
  await this.save();
  
  return 'text_extraction_queued';
};

FileSchema.methods.scanForVirus = async function() {
  // Queue virus scan task
  this.processing.tasks.push({
    taskType: 'virus_scan',
    status: 'pending',
  });
  
  this.processing.status = 'pending';
  
  this.auditLog.push({
    action: 'virus_scan_queued',
    performedBy: this.upload.uploadedBy,
    performedAt: new Date(),
  });
  
  await this.save();
  
  return true;
};

FileSchema.methods.encrypt = async function(keyId?: string) {
  if (this.security.isEncrypted) {
    return true;
  }
  
  this.security.isEncrypted = true;
  this.security.encryptionMethod = 'aes-256';
  this.security.encryptionKeyId = keyId || `key_${Date.now()}`;
  
  this.auditLog.push({
    action: 'file_encrypted',
    performedBy: this.upload.uploadedBy,
    performedAt: new Date(),
    details: `Encryption method: ${this.security.encryptionMethod}`,
  });
  
  return this.save();
};

FileSchema.methods.decrypt = async function() {
  if (!this.security.isEncrypted) {
    return true;
  }
  
  this.security.isEncrypted = false;
  this.security.encryptionMethod = undefined;
  this.security.encryptionKeyId = undefined;
  
  this.auditLog.push({
    action: 'file_decrypted',
    performedBy: this.upload.uploadedBy,
    performedAt: new Date(),
  });
  
  return this.save();
};

FileSchema.methods.createVersion = async function(uploadedBy: mongoose.Types.ObjectId, description?: string) {
  // Create a new version of this file
  const newVersion = new (this.constructor as any)({
    ...this.toObject(),
    _id: undefined,
    versioning: {
      version: this.versioning.version + 1,
      isLatestVersion: true,
      parentFileId: this.versioning.parentFileId || this._id,
      childFileIds: [],
      versionHistory: [...this.versioning.versionHistory],
    },
    upload: {
      ...this.upload,
      uploadedBy,
    },
    createdAt: undefined,
    updatedAt: undefined,
  });
  
  // Update this version to not be the latest
  this.versioning.isLatestVersion = false;
  this.versioning.childFileIds.push(newVersion._id);
  
  // Add audit log entry
  newVersion.auditLog.push({
    action: 'version_created',
    performedBy: uploadedBy,
    performedAt: new Date(),
    details: description || `Version ${newVersion.versioning.version} created`,
  });
  
  await this.save();
  return newVersion.save();
};

FileSchema.methods.grantPermission = function(
  userId: mongoose.Types.ObjectId,
  permissions: any,
  grantedBy: mongoose.Types.ObjectId
) {
  // Remove existing permission for this user
  this.permissions.userPermissions = this.permissions.userPermissions.filter(
    (p: any) => !p.userId.equals(userId)
  );
  
  // Add new permission
  this.permissions.userPermissions.push({
    userId,
    ...permissions,
    grantedBy,
    grantedAt: new Date(),
  });
  
  this.auditLog.push({
    action: 'permission_granted',
    performedBy: grantedBy,
    performedAt: new Date(),
    details: `Granted permissions to user ${userId}`,
  });
  
  return this.save();
};

FileSchema.methods.revokePermission = function(userId: mongoose.Types.ObjectId) {
  this.permissions.userPermissions = this.permissions.userPermissions.filter(
    (p: any) => !p.userId.equals(userId)
  );
  
  this.auditLog.push({
    action: 'permission_revoked',
    performedBy: this.upload.uploadedBy,
    performedAt: new Date(),
    details: `Revoked permissions from user ${userId}`,
  });
  
  return this.save();
};

FileSchema.methods.addToLegalHold = function(
  holdId: string,
  reason: string,
  holdBy: mongoose.Types.ObjectId
) {
  this.compliance.legalHolds.push({
    holdId,
    holdReason: reason,
    holdBy,
    holdDate: new Date(),
  });
  
  this.auditLog.push({
    action: 'legal_hold_applied',
    performedBy: holdBy,
    performedAt: new Date(),
    details: `Legal hold ${holdId}: ${reason}`,
  });
  
  return this.save();
};

FileSchema.methods.releaseFromLegalHold = function(holdId: string) {
  const hold = this.compliance.legalHolds.find((h: any) => h.holdId === holdId);
  if (hold) {
    hold.releaseDate = new Date();
  }
  
  this.auditLog.push({
    action: 'legal_hold_released',
    performedBy: this.upload.uploadedBy,
    performedAt: new Date(),
    details: `Legal hold ${holdId} released`,
  });
  
  return this.save();
};

FileSchema.methods.archive = function(tier: string = 'cold') {
  this.backup.isArchived = true;
  this.backup.archivedDate = new Date();
  this.backup.archivalTier = tier as any;
  
  // Set estimated retrieval time based on tier
  const retrievalTimes: Record<string, number> = {
    hot: 0,
    warm: 1,
    cold: 4,
    frozen: 12,
  };
  this.backup.estimatedRetrievalTime = retrievalTimes[tier] || 4;
  
  this.auditLog.push({
    action: 'file_archived',
    performedBy: this.upload.uploadedBy,
    performedAt: new Date(),
    details: `Archived to ${tier} tier`,
  });
  
  return this.save();
};

FileSchema.methods.restore = function() {
  this.backup.isArchived = false;
  this.backup.archivalTier = 'hot';
  this.backup.estimatedRetrievalTime = 0;
  
  this.auditLog.push({
    action: 'file_restored',
    performedBy: this.upload.uploadedBy,
    performedAt: new Date(),
  });
  
  return this.save();
};

FileSchema.methods.softDelete = function() {
  this.deletedAt = new Date();
  
  this.auditLog.push({
    action: 'file_deleted',
    performedBy: this.upload.uploadedBy,
    performedAt: new Date(),
  });
  
  return this.save();
};

export const File = mongoose.model<IFileDocument>('File', FileSchema);
export default File;

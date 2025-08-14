import mongoose, { Document, Schema } from 'mongoose';
import { INote } from '@apsicologia/shared/types';

export interface INoteDocument extends Document {
  _id: mongoose.Types.ObjectId;
  
  // Related entities
  patientId: mongoose.Types.ObjectId;
  professionalId: mongoose.Types.ObjectId;
  appointmentId?: mongoose.Types.ObjectId;
  episodeId?: mongoose.Types.ObjectId;
  
  // Note identification and classification
  title: string;
  type: 'session_note' | 'assessment' | 'treatment_plan' | 'progress_note' | 'discharge_summary' | 'consultation' | 'prescription' | 'other';
  category?: string; // Custom categories defined by clinic
  
  // Note content
  content: {
    // Rich text content (JSON from Tiptap editor)
    json: any;
    // Plain text version for search and export
    text: string;
    // HTML version for display
    html?: string;
  };
  
  // Clinical structure
  structure?: {
    // SOAP format (Subjective, Objective, Assessment, Plan)
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
    
    // Alternative structures
    reason?: string; // Chief complaint
    history?: string; // History of present illness
    examination?: string; // Physical/mental examination
    diagnosis?: string; // Clinical diagnosis
    treatment?: string; // Treatment plan
    followup?: string; // Follow-up plan
    
    // Custom fields
    customFields?: Record<string, string>;
  };
  
  // Templates and standardization
  template?: {
    templateId: mongoose.Types.ObjectId;
    templateName: string;
    templateVersion: string;
    customizations: Record<string, any>;
  };
  
  // Clinical coding
  coding: {
    // ICD-10 codes
    icd10?: {
      code: string;
      description: string;
    }[];
    
    // DSM-5 codes
    dsm5?: {
      code: string;
      description: string;
    }[];
    
    // CPT codes (for procedures)
    cpt?: {
      code: string;
      description: string;
    }[];
    
    // Custom coding systems
    custom?: {
      system: string;
      code: string;
      description: string;
    }[];
  };
  
  // Note status and workflow
  status: 'draft' | 'in_review' | 'signed' | 'locked' | 'amended' | 'deleted';
  
  // Digital signature and validation
  signature?: {
    isSigned: boolean;
    signedAt?: Date;
    signedBy: mongoose.Types.ObjectId;
    signatureHash?: string; // Cryptographic hash
    signatureMethod: 'digital' | 'electronic' | 'wet' | 'biometric';
    ipAddress?: string;
    location?: string;
    
    // Witness information (if required)
    witness?: {
      witnessId: mongoose.Types.ObjectId;
      witnessName: string;
      witnessedAt: Date;
    };
  };
  
  // Version control and amendments
  versioning: {
    version: number;
    isOriginal: boolean;
    originalNoteId?: mongoose.Types.ObjectId;
    previousVersionId?: mongoose.Types.ObjectId;
    nextVersionId?: mongoose.Types.ObjectId;
    
    // Amendment tracking
    amendments: {
      amendmentId: string;
      amendedAt: Date;
      amendedBy: mongoose.Types.ObjectId;
      reason: string;
      description: string;
      originalContent?: any;
      amendedContent?: any;
    }[];
    
    // Addenda (additional notes)
    addenda: {
      addendumId: string;
      addedAt: Date;
      addedBy: mongoose.Types.ObjectId;
      content: string;
      type: 'correction' | 'addition' | 'clarification' | 'update';
    }[];
  };
  
  // Access control and permissions
  permissions: {
    visibility: 'private' | 'team' | 'department' | 'organization';
    
    // Specific user permissions
    userPermissions: {
      userId: mongoose.Types.ObjectId;
      canRead: boolean;
      canEdit: boolean;
      canSign: boolean;
      canAmend: boolean;
      grantedBy: mongoose.Types.ObjectId;
      grantedAt: Date;
      expiresAt?: Date;
    }[];
    
    // Role-based permissions
    rolePermissions: {
      role: 'admin' | 'professional' | 'supervisor' | 'resident' | 'student';
      canRead: boolean;
      canEdit: boolean;
      canSign: boolean;
      canAmend: boolean;
    }[];
    
    // Sharing with external entities
    externalSharing: {
      recipientType: 'patient' | 'guardian' | 'external_provider' | 'insurance' | 'legal' | 'other';
      recipientId?: string;
      recipientEmail?: string;
      sharedAt: Date;
      sharedBy: mongoose.Types.ObjectId;
      expiresAt?: Date;
      accessCount: number;
      lastAccessedAt?: Date;
    }[];
  };
  
  // Clinical significance and flags
  clinical: {
    // Risk assessment
    riskLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
    riskFactors: string[];
    
    // Clinical flags
    flags: {
      type: 'suicide_risk' | 'substance_abuse' | 'medication_concern' | 'safety_issue' | 'family_concern' | 'legal_issue' | 'other';
      severity: 'low' | 'medium' | 'high' | 'critical';
      description: string;
      flaggedBy: mongoose.Types.ObjectId;
      flaggedAt: Date;
      resolved: boolean;
      resolvedAt?: Date;
      resolvedBy?: mongoose.Types.ObjectId;
    }[];
    
    // Treatment response
    treatmentResponse?: 'excellent' | 'good' | 'fair' | 'poor' | 'no_change' | 'deteriorated';
    
    // Compliance/adherence
    compliance?: 'excellent' | 'good' | 'fair' | 'poor' | 'non_compliant';
    
    // Mental status exam components
    mentalStatusExam?: {
      appearance?: string;
      behavior?: string;
      speech?: string;
      mood?: string;
      affect?: string;
      thought?: string;
      perception?: string;
      cognition?: string;
      insight?: string;
      judgment?: string;
    };
  };
  
  // Attachments and references
  attachments: {
    fileId: mongoose.Types.ObjectId;
    fileName: string;
    fileType: string;
    fileSize: number;
    description?: string;
    attachedAt: Date;
    attachedBy: mongoose.Types.ObjectId;
  }[];
  
  // Related documents and references
  references: {
    type: 'note' | 'assessment' | 'test_result' | 'image' | 'form_response' | 'external_document';
    referenceId: mongoose.Types.ObjectId | string;
    description: string;
    linkType: 'related' | 'supersedes' | 'superseded_by' | 'corrects' | 'corrected_by';
  }[];
  
  // Quality assurance
  qualityAssurance: {
    // Peer review
    peerReview?: {
      isRequired: boolean;
      reviewedBy?: mongoose.Types.ObjectId;
      reviewedAt?: Date;
      reviewStatus?: 'pending' | 'approved' | 'needs_revision' | 'rejected';
      reviewComments?: string;
    };
    
    // Supervisor review
    supervisorReview?: {
      isRequired: boolean;
      supervisorId?: mongoose.Types.ObjectId;
      reviewedAt?: Date;
      reviewStatus?: 'pending' | 'approved' | 'needs_revision' | 'rejected';
      reviewComments?: string;
    };
    
    // Quality metrics
    qualityScore?: number; // 0-100
    completenessScore?: number; // 0-100
    
    // Compliance checks
    complianceChecks: {
      checkType: string;
      checkResult: 'pass' | 'fail' | 'warning';
      checkDetails?: string;
      checkedAt: Date;
    }[];
  };
  
  // Legal and regulatory
  legal: {
    // Retention policy
    retentionCategory: string;
    retentionPeriodYears: number;
    deleteAfter?: Date;
    
    // Legal holds
    legalHolds: {
      holdId: string;
      holdType: 'litigation' | 'audit' | 'investigation' | 'regulatory';
      holdReason: string;
      holdBy: mongoose.Types.ObjectId;
      holdDate: Date;
      releaseDate?: Date;
      releasedBy?: mongoose.Types.ObjectId;
    }[];
    
    // Disclosure log
    disclosures: {
      disclosedTo: string;
      disclosureReason: string;
      disclosedBy: mongoose.Types.ObjectId;
      disclosedAt: Date;
      consentObtained: boolean;
      consentReference?: string;
    }[];
  };
  
  // Search and indexing
  searchMetadata: {
    searchableText: string; // Processed for full-text search
    keywords: string[];
    concepts: string[]; // Extracted medical concepts
    sentiment?: 'positive' | 'negative' | 'neutral';
    language: string;
    readabilityScore?: number;
  };
  
  // Audit trail
  auditLog: {
    action: string;
    performedBy: mongoose.Types.ObjectId;
    performedAt: Date;
    details?: string;
    ipAddress?: string;
    userAgent?: string;
    fieldChanges?: {
      field: string;
      oldValue?: any;
      newValue?: any;
    }[];
  }[];
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  
  // Instance methods
  signNote(userId: mongoose.Types.ObjectId, method?: string, location?: string): Promise<this>;
  amendNote(amendedBy: mongoose.Types.ObjectId, reason: string, description: string): Promise<INoteDocument>;
  addAddendum(addedBy: mongoose.Types.ObjectId, content: string, type: string): Promise<this>;
  lockNote(): Promise<this>;
  addClinicalFlag(type: string, severity: string, description: string, flaggedBy: mongoose.Types.ObjectId): this;
  shareWithExternal(recipientType: string, recipientInfo: any, sharedBy: mongoose.Types.ObjectId): this;
  calculateQualityScore(): number;
  extractClinicalConcepts(): string[];
  generateSearchableText(): string;
  softDelete(): Promise<this>;
}

const ContentSchema = new Schema({
  json: {
    type: Schema.Types.Mixed,
    required: true,
  },
  text: {
    type: String,
    required: true,
    text: true, // Enable text search
  },
  html: {
    type: String,
  },
}, { _id: false });

const StructureSchema = new Schema({
  subjective: { type: String, trim: true },
  objective: { type: String, trim: true },
  assessment: { type: String, trim: true },
  plan: { type: String, trim: true },
  reason: { type: String, trim: true },
  history: { type: String, trim: true },
  examination: { type: String, trim: true },
  diagnosis: { type: String, trim: true },
  treatment: { type: String, trim: true },
  followup: { type: String, trim: true },
  customFields: {
    type: Schema.Types.Mixed,
    default: {},
  },
}, { _id: false });

const TemplateSchema = new Schema({
  templateId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  templateName: {
    type: String,
    required: true,
    trim: true,
  },
  templateVersion: {
    type: String,
    required: true,
    trim: true,
  },
  customizations: {
    type: Schema.Types.Mixed,
    default: {},
  },
}, { _id: false });

const CodingSchema = new Schema({
  icd10: {
    type: [{
      code: { type: String, required: true, trim: true },
      description: { type: String, required: true, trim: true },
    }],
    default: [],
  },
  dsm5: {
    type: [{
      code: { type: String, required: true, trim: true },
      description: { type: String, required: true, trim: true },
    }],
    default: [],
  },
  cpt: {
    type: [{
      code: { type: String, required: true, trim: true },
      description: { type: String, required: true, trim: true },
    }],
    default: [],
  },
  custom: {
    type: [{
      system: { type: String, required: true, trim: true },
      code: { type: String, required: true, trim: true },
      description: { type: String, required: true, trim: true },
    }],
    default: [],
  },
}, { _id: false });

const WitnessSchema = new Schema({
  witnessId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  witnessName: {
    type: String,
    required: true,
    trim: true,
  },
  witnessedAt: {
    type: Date,
    required: true,
  },
}, { _id: false });

const SignatureSchema = new Schema({
  isSigned: {
    type: Boolean,
    default: false,
  },
  signedAt: {
    type: Date,
  },
  signedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  signatureHash: {
    type: String,
    trim: true,
  },
  signatureMethod: {
    type: String,
    enum: ['digital', 'electronic', 'wet', 'biometric'],
    default: 'electronic',
  },
  ipAddress: {
    type: String,
    trim: true,
  },
  location: {
    type: String,
    trim: true,
  },
  witness: {
    type: WitnessSchema,
  },
}, { _id: false });

const AmendmentSchema = new Schema({
  amendmentId: {
    type: String,
    required: true,
    trim: true,
  },
  amendedAt: {
    type: Date,
    required: true,
  },
  amendedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reason: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  originalContent: {
    type: Schema.Types.Mixed,
  },
  amendedContent: {
    type: Schema.Types.Mixed,
  },
}, { _id: false });

const AddendumSchema = new Schema({
  addendumId: {
    type: String,
    required: true,
    trim: true,
  },
  addedAt: {
    type: Date,
    required: true,
  },
  addedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['correction', 'addition', 'clarification', 'update'],
    required: true,
  },
}, { _id: false });

const VersioningSchema = new Schema({
  version: {
    type: Number,
    default: 1,
    min: 1,
  },
  isOriginal: {
    type: Boolean,
    default: true,
  },
  originalNoteId: {
    type: Schema.Types.ObjectId,
    ref: 'Note',
  },
  previousVersionId: {
    type: Schema.Types.ObjectId,
    ref: 'Note',
  },
  nextVersionId: {
    type: Schema.Types.ObjectId,
    ref: 'Note',
  },
  amendments: {
    type: [AmendmentSchema],
    default: [],
  },
  addenda: {
    type: [AddendumSchema],
    default: [],
  },
}, { _id: false });

const NoteSchema = new Schema<INoteDocument>(
  {
    // Related entities
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true,
    },
    professionalId: {
      type: Schema.Types.ObjectId,
      ref: 'Professional',
      required: true,
      index: true,
    },
    appointmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Appointment',
      index: true,
    },
    episodeId: {
      type: Schema.Types.ObjectId,
      index: true,
    },
    
    // Note identification
    title: {
      type: String,
      required: [true, 'Note title is required'],
      trim: true,
      maxlength: [200, 'Note title cannot exceed 200 characters'],
    },
    type: {
      type: String,
      enum: ['session_note', 'assessment', 'treatment_plan', 'progress_note', 'discharge_summary', 'consultation', 'prescription', 'other'],
      required: true,
      index: true,
    },
    category: {
      type: String,
      trim: true,
      index: true,
    },
    
    // Content
    content: {
      type: ContentSchema,
      required: true,
    },
    
    // Structure
    structure: {
      type: StructureSchema,
    },
    
    // Template
    template: {
      type: TemplateSchema,
    },
    
    // Coding
    coding: {
      type: CodingSchema,
      default: {},
    },
    
    // Status
    status: {
      type: String,
      enum: ['draft', 'in_review', 'signed', 'locked', 'amended', 'deleted'],
      default: 'draft',
      index: true,
    },
    
    // Signature
    signature: {
      type: SignatureSchema,
      default: { isSigned: false },
    },
    
    // Versioning
    versioning: {
      type: VersioningSchema,
      default: {
        version: 1,
        isOriginal: true,
        amendments: [],
        addenda: [],
      },
    },
    
    // Permissions (simplified for space)
    permissions: {
      visibility: {
        type: String,
        enum: ['private', 'team', 'department', 'organization'],
        default: 'team',
      },
      userPermissions: {
        type: [{
          userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
          canRead: { type: Boolean, default: true },
          canEdit: { type: Boolean, default: false },
          canSign: { type: Boolean, default: false },
          canAmend: { type: Boolean, default: false },
          grantedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
          grantedAt: { type: Date, required: true },
          expiresAt: { type: Date },
        }],
        default: [],
      },
      rolePermissions: {
        type: [{
          role: {
            type: String,
            enum: ['admin', 'professional', 'supervisor', 'resident', 'student'],
            required: true,
          },
          canRead: { type: Boolean, default: true },
          canEdit: { type: Boolean, default: false },
          canSign: { type: Boolean, default: false },
          canAmend: { type: Boolean, default: false },
        }],
        default: [],
      },
      externalSharing: {
        type: [{
          recipientType: {
            type: String,
            enum: ['patient', 'guardian', 'external_provider', 'insurance', 'legal', 'other'],
            required: true,
          },
          recipientId: { type: String, trim: true },
          recipientEmail: { type: String, trim: true, lowercase: true },
          sharedAt: { type: Date, required: true },
          sharedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
          expiresAt: { type: Date },
          accessCount: { type: Number, default: 0 },
          lastAccessedAt: { type: Date },
        }],
        default: [],
      },
    },
    
    // Clinical information (simplified)
    clinical: {
      riskLevel: {
        type: String,
        enum: ['none', 'low', 'medium', 'high', 'critical'],
        default: 'none',
      },
      riskFactors: {
        type: [String],
        default: [],
      },
      flags: {
        type: [{
          type: {
            type: String,
            enum: ['suicide_risk', 'substance_abuse', 'medication_concern', 'safety_issue', 'family_concern', 'legal_issue', 'other'],
            required: true,
          },
          severity: {
            type: String,
            enum: ['low', 'medium', 'high', 'critical'],
            required: true,
          },
          description: { type: String, required: true, trim: true },
          flaggedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
          flaggedAt: { type: Date, required: true, default: Date.now },
          resolved: { type: Boolean, default: false },
          resolvedAt: { type: Date },
          resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        }],
        default: [],
      },
      treatmentResponse: {
        type: String,
        enum: ['excellent', 'good', 'fair', 'poor', 'no_change', 'deteriorated'],
      },
      compliance: {
        type: String,
        enum: ['excellent', 'good', 'fair', 'poor', 'non_compliant'],
      },
      mentalStatusExam: {
        appearance: { type: String, trim: true },
        behavior: { type: String, trim: true },
        speech: { type: String, trim: true },
        mood: { type: String, trim: true },
        affect: { type: String, trim: true },
        thought: { type: String, trim: true },
        perception: { type: String, trim: true },
        cognition: { type: String, trim: true },
        insight: { type: String, trim: true },
        judgment: { type: String, trim: true },
      },
    },
    
    // Attachments
    attachments: {
      type: [{
        fileId: { type: Schema.Types.ObjectId, required: true },
        fileName: { type: String, required: true, trim: true },
        fileType: { type: String, required: true, trim: true },
        fileSize: { type: Number, required: true, min: 0 },
        description: { type: String, trim: true },
        attachedAt: { type: Date, required: true, default: Date.now },
        attachedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
      }],
      default: [],
    },
    
    // References
    references: {
      type: [{
        type: {
          type: String,
          enum: ['note', 'assessment', 'test_result', 'image', 'form_response', 'external_document'],
          required: true,
        },
        referenceId: { type: Schema.Types.Mixed, required: true },
        description: { type: String, required: true, trim: true },
        linkType: {
          type: String,
          enum: ['related', 'supersedes', 'superseded_by', 'corrects', 'corrected_by'],
          default: 'related',
        },
      }],
      default: [],
    },
    
    // Quality assurance (simplified)
    qualityAssurance: {
      peerReview: {
        isRequired: { type: Boolean, default: false },
        reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        reviewedAt: { type: Date },
        reviewStatus: {
          type: String,
          enum: ['pending', 'approved', 'needs_revision', 'rejected'],
        },
        reviewComments: { type: String, trim: true },
      },
      supervisorReview: {
        isRequired: { type: Boolean, default: false },
        supervisorId: { type: Schema.Types.ObjectId, ref: 'User' },
        reviewedAt: { type: Date },
        reviewStatus: {
          type: String,
          enum: ['pending', 'approved', 'needs_revision', 'rejected'],
        },
        reviewComments: { type: String, trim: true },
      },
      qualityScore: { type: Number, min: 0, max: 100 },
      completenessScore: { type: Number, min: 0, max: 100 },
      complianceChecks: {
        type: [{
          checkType: { type: String, required: true, trim: true },
          checkResult: {
            type: String,
            enum: ['pass', 'fail', 'warning'],
            required: true,
          },
          checkDetails: { type: String, trim: true },
          checkedAt: { type: Date, required: true, default: Date.now },
        }],
        default: [],
      },
    },
    
    // Legal (simplified)
    legal: {
      retentionCategory: { type: String, default: 'clinical_notes' },
      retentionPeriodYears: { type: Number, default: 7 },
      deleteAfter: { type: Date },
      legalHolds: {
        type: [{
          holdId: { type: String, required: true, trim: true },
          holdType: {
            type: String,
            enum: ['litigation', 'audit', 'investigation', 'regulatory'],
            required: true,
          },
          holdReason: { type: String, required: true, trim: true },
          holdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
          holdDate: { type: Date, required: true },
          releaseDate: { type: Date },
          releasedBy: { type: Schema.Types.ObjectId, ref: 'User' },
        }],
        default: [],
      },
      disclosures: {
        type: [{
          disclosedTo: { type: String, required: true, trim: true },
          disclosureReason: { type: String, required: true, trim: true },
          disclosedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
          disclosedAt: { type: Date, required: true },
          consentObtained: { type: Boolean, required: true },
          consentReference: { type: String, trim: true },
        }],
        default: [],
      },
    },
    
    // Search metadata
    searchMetadata: {
      searchableText: { type: String, text: true },
      keywords: { type: [String], default: [] },
      concepts: { type: [String], default: [] },
      sentiment: {
        type: String,
        enum: ['positive', 'negative', 'neutral'],
      },
      language: { type: String, default: 'es' },
      readabilityScore: { type: Number, min: 0, max: 100 },
    },
    
    // Audit log
    auditLog: {
      type: [{
        action: { type: String, required: true, trim: true },
        performedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        performedAt: { type: Date, required: true, default: Date.now },
        details: { type: String, trim: true },
        ipAddress: { type: String, trim: true },
        userAgent: { type: String, trim: true },
        fieldChanges: {
          type: [{
            field: { type: String, required: true },
            oldValue: { type: Schema.Types.Mixed },
            newValue: { type: Schema.Types.Mixed },
          }],
          default: [],
        },
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
NoteSchema.index({ patientId: 1, type: 1, createdAt: -1 });
NoteSchema.index({ professionalId: 1, status: 1, createdAt: -1 });
NoteSchema.index({ appointmentId: 1, createdAt: -1 });
NoteSchema.index({ status: 1, createdAt: -1 });
NoteSchema.index({ 'signature.isSigned': 1, status: 1 });
NoteSchema.index({ type: 1, category: 1 });

// Text search index
NoteSchema.index({
  title: 'text',
  'content.text': 'text',
  'searchMetadata.searchableText': 'text',
  'searchMetadata.keywords': 'text',
});

// Pre-save middleware
NoteSchema.pre('save', function(this: INoteDocument, next) {
  // Generate searchable text
  this.searchMetadata.searchableText = this.generateSearchableText();
  
  // Set retention date
  if (!this.legal.deleteAfter) {
    const retentionDate = new Date();
    retentionDate.setFullYear(retentionDate.getFullYear() + this.legal.retentionPeriodYears);
    this.legal.deleteAfter = retentionDate;
  }
  
  // Calculate quality score
  if (this.isModified('content') || this.isModified('structure')) {
    this.qualityAssurance.qualityScore = this.calculateQualityScore();
  }
  
  next();
});

// Static methods
NoteSchema.statics.findByPatient = function(patientId: mongoose.Types.ObjectId) {
  return this.find({
    patientId,
    deletedAt: null,
  }).sort({ createdAt: -1 });
};

NoteSchema.statics.findPendingSignature = function() {
  return this.find({
    status: 'in_review',
    'signature.isSigned': false,
    deletedAt: null,
  }).sort({ createdAt: 1 });
};

NoteSchema.statics.findByRiskLevel = function(riskLevel: string) {
  return this.find({
    'clinical.riskLevel': riskLevel,
    deletedAt: null,
  }).sort({ createdAt: -1 });
};

// Instance methods
NoteSchema.methods.signNote = async function(
  userId: mongoose.Types.ObjectId,
  method: string = 'electronic',
  location?: string
) {
  if (this.signature?.isSigned) {
    throw new Error('Note is already signed');
  }
  
  this.signature = {
    isSigned: true,
    signedAt: new Date(),
    signedBy: userId,
    signatureMethod: method as any,
    location,
    signatureHash: `hash_${Date.now()}_${userId}`, // Would use actual crypto hash
  };
  
  this.status = 'signed';
  
  this.auditLog.push({
    action: 'note_signed',
    performedBy: userId,
    performedAt: new Date(),
    details: `Note signed using ${method}`,
  });
  
  return this.save();
};

NoteSchema.methods.amendNote = async function(
  amendedBy: mongoose.Types.ObjectId,
  reason: string,
  description: string
) {
  // Create amendment record
  const amendmentId = `AMD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  this.versioning.amendments.push({
    amendmentId,
    amendedAt: new Date(),
    amendedBy,
    reason,
    description,
    originalContent: this.content,
    amendedContent: null, // Will be set when content is updated
  });
  
  this.status = 'amended';
  this.versioning.version += 1;
  
  this.auditLog.push({
    action: 'note_amended',
    performedBy: amendedBy,
    performedAt: new Date(),
    details: `Amendment: ${reason}`,
  });
  
  return this.save();
};

NoteSchema.methods.addAddendum = function(
  addedBy: mongoose.Types.ObjectId,
  content: string,
  type: string
) {
  const addendumId = `ADD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  this.versioning.addenda.push({
    addendumId,
    addedAt: new Date(),
    addedBy,
    content,
    type: type as any,
  });
  
  this.auditLog.push({
    action: 'addendum_added',
    performedBy: addedBy,
    performedAt: new Date(),
    details: `Addendum type: ${type}`,
  });
  
  return this.save();
};

NoteSchema.methods.lockNote = function() {
  this.status = 'locked';
  
  this.auditLog.push({
    action: 'note_locked',
    performedBy: this.professionalId,
    performedAt: new Date(),
  });
  
  return this.save();
};

NoteSchema.methods.addClinicalFlag = function(
  type: string,
  severity: string,
  description: string,
  flaggedBy: mongoose.Types.ObjectId
) {
  this.clinical.flags.push({
    type: type as any,
    severity: severity as any,
    description,
    flaggedBy,
    flaggedAt: new Date(),
    resolved: false,
  });
  
  this.auditLog.push({
    action: 'clinical_flag_added',
    performedBy: flaggedBy,
    performedAt: new Date(),
    details: `${type} flag: ${description}`,
  });
  
  return this;
};

NoteSchema.methods.shareWithExternal = function(
  recipientType: string,
  recipientInfo: any,
  sharedBy: mongoose.Types.ObjectId
) {
  this.permissions.externalSharing.push({
    recipientType: recipientType as any,
    recipientId: recipientInfo.id,
    recipientEmail: recipientInfo.email,
    sharedAt: new Date(),
    sharedBy,
    accessCount: 0,
  });
  
  this.auditLog.push({
    action: 'external_sharing',
    performedBy: sharedBy,
    performedAt: new Date(),
    details: `Shared with ${recipientType}`,
  });
  
  return this;
};

NoteSchema.methods.calculateQualityScore = function(): number {
  let score = 0;
  
  // Content completeness (40 points)
  if (this.content.text.length > 100) score += 20;
  if (this.content.text.length > 500) score += 20;
  
  // Structure completeness (30 points)
  if (this.structure?.subjective) score += 7.5;
  if (this.structure?.objective) score += 7.5;
  if (this.structure?.assessment) score += 7.5;
  if (this.structure?.plan) score += 7.5;
  
  // Clinical coding (20 points)
  if (this.coding.icd10 && this.coding.icd10.length > 0) score += 10;
  if (this.coding.dsm5 && this.coding.dsm5.length > 0) score += 10;
  
  // Signature status (10 points)
  if (this.signature?.isSigned) score += 10;
  
  return Math.min(score, 100);
};

NoteSchema.methods.extractClinicalConcepts = function(): string[] {
  // This would use NLP to extract medical concepts
  // For now, simple keyword extraction
  const text = this.content.text.toLowerCase();
  const concepts: string[] = [];
  
  // Basic medical terms (would be much more sophisticated)
  const medicalTerms = [
    'depression', 'anxiety', 'therapy', 'medication',
    'treatment', 'diagnosis', 'symptoms', 'progress'
  ];
  
  medicalTerms.forEach(term => {
    if (text.includes(term)) {
      concepts.push(term);
    }
  });
  
  return concepts;
};

NoteSchema.methods.generateSearchableText = function(): string {
  let searchText = '';
  
  searchText += this.title + ' ';
  searchText += this.content.text + ' ';
  
  if (this.structure) {
    searchText += Object.values(this.structure).filter(Boolean).join(' ') + ' ';
  }
  
  // Add coding descriptions
  this.coding.icd10?.forEach((code: any) => {
    searchText += code.description + ' ';
  });
  
  this.coding.dsm5?.forEach((code: any) => {
    searchText += code.description + ' ';
  });
  
  return searchText.trim();
};

NoteSchema.methods.softDelete = function() {
  this.deletedAt = new Date();
  this.status = 'deleted';
  
  this.auditLog.push({
    action: 'note_deleted',
    performedBy: this.professionalId,
    performedAt: new Date(),
  });
  
  return this.save();
};

export const Note = mongoose.model<INoteDocument>('Note', NoteSchema);
export default Note;

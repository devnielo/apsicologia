import mongoose, { Document, Schema } from 'mongoose';
import { IForm } from '@apsicologia/shared/types';

export interface IFormSchemaDocument extends Document {
  _id: mongoose.Types.ObjectId;
  
  // Basic information
  name: string;
  title: string;
  description?: string;
  version: string;
  
  // Schema definition (react-jsonschema-form compatible)
  jsonSchema: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
    definitions?: Record<string, any>;
    additionalProperties?: boolean;
    [key: string]: any;
  };
  
  // UI Schema for form rendering
  uiSchema?: {
    [key: string]: any;
  };
  
  // Form configuration
  config: {
    isActive: boolean;
    isTemplate: boolean;
    allowMultipleSubmissions: boolean;
    requiresAuthentication: boolean;
    showProgressBar: boolean;
    allowSaveProgress: boolean;
    autoSave: boolean;
    submitButtonText: string;
    successMessage: string;
    errorMessage: string;
  };
  
  // Access control
  permissions: {
    canView: ('admin' | 'professional' | 'reception' | 'patient')[];
    canSubmit: ('admin' | 'professional' | 'reception' | 'patient')[];
    canEdit: ('admin' | 'professional' | 'reception')[];
  };
  
  // Form lifecycle
  lifecycle: {
    publishedAt?: Date;
    deprecatedAt?: Date;
    archivedAt?: Date;
    nextVersionId?: mongoose.Types.ObjectId;
    previousVersionId?: mongoose.Types.ObjectId;
  };
  
  // Assignment rules
  assignmentRules: {
    triggerType: 'manual' | 'appointment_booked' | 'appointment_completed' | 'patient_registered' | 'scheduled' | 'conditional';
    conditions?: {
      serviceIds?: mongoose.Types.ObjectId[];
      professionalIds?: mongoose.Types.ObjectId[];
      patientTags?: string[];
      appointmentStatus?: string[];
      daysBefore?: number;
      daysAfter?: number;
    };
    priority: number;
    isOptional: boolean;
    reminderSettings?: {
      enabled: boolean;
      reminderDays: number[];
      maxReminders: number;
      reminderTemplate?: string;
    };
  };
  
  // Form validation and scoring
  validation: {
    customValidations: {
      field: string;
      rule: string;
      message: string;
      value?: any;
    }[];
    scoringRules?: {
      totalScore?: {
        formula: string;
        maxScore: number;
        interpretation: {
          range: [number, number];
          label: string;
          description: string;
          color?: string;
        }[];
      };
      subscales?: {
        name: string;
        fields: string[];
        formula: string;
        maxScore: number;
        interpretation: {
          range: [number, number];
          label: string;
          description: string;
          color?: string;
        }[];
      }[];
    };
  };
  
  // Conditional logic
  conditionalLogic: {
    showWhen?: {
      field: string;
      operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains';
      value: any;
    }[];
    hideWhen?: {
      field: string;
      operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains';
      value: any;
    }[];
    requiredWhen?: {
      field: string;
      targetField: string;
      operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'not_contains';
      value: any;
    }[];
  };
  
  // Integration settings
  integrations: {
    exportToEMR: boolean;
    syncWithThirdParty?: {
      provider: string;
      endpoint: string;
      mapping: Record<string, string>;
      credentials?: string; // encrypted
    };
    webhooks?: {
      url: string;
      events: ('submitted' | 'updated' | 'deleted')[];
      headers?: Record<string, string>;
      secret?: string;
    }[];
  };
  
  // Analytics and usage
  analytics: {
    totalSubmissions: number;
    completionRate: number; // percentage
    averageCompletionTime: number; // minutes
    abandonmentPoints: {
      fieldName: string;
      abandonmentCount: number;
    }[];
    lastSubmissionAt?: Date;
  };
  
  // Form content and localization
  localization: {
    defaultLanguage: string;
    translations?: {
      [languageCode: string]: {
        title: string;
        description?: string;
        fields: Record<string, {
          title?: string;
          description?: string;
          placeholder?: string;
          options?: Record<string, string>;
        }>;
        messages: {
          submitButtonText: string;
          successMessage: string;
          errorMessage: string;
          validationMessages: Record<string, string>;
        };
      };
    };
  };
  
  // Metadata
  metadata: {
    category: 'intake' | 'assessment' | 'screening' | 'feedback' | 'consent' | 'registration' | 'survey' | 'other';
    tags: string[];
    estimatedCompletionTime: number; // minutes
    difficulty: 'easy' | 'medium' | 'hard';
    clinicalContext?: string;
    references?: string[];
    notes?: string;
  };
  
  // Audit and versioning
  createdBy: mongoose.Types.ObjectId;
  lastModifiedBy?: mongoose.Types.ObjectId;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  
  // Instance methods
  validateFormData(data: any): { isValid: boolean; errors: any[] };
  calculateScore(data: any): any;
  createNewVersion(): Promise<IFormSchemaDocument>;
  assignToPatient(patientId: mongoose.Types.ObjectId, dueDate?: Date): Promise<any>;
  clone(newName?: string): Promise<IFormSchemaDocument>;
  softDelete(): Promise<this>;
}

const JsonSchemaDefinition = new Schema({
  type: {
    type: String,
    required: true,
  },
  properties: {
    type: Schema.Types.Mixed,
    required: true,
  },
  required: {
    type: [String],
    default: [],
  },
  definitions: {
    type: Schema.Types.Mixed,
  },
  additionalProperties: {
    type: Boolean,
    default: false,
  },
}, { _id: false, strict: false });

const ConfigSchema = new Schema({
  isActive: {
    type: Boolean,
    default: true,
  },
  isTemplate: {
    type: Boolean,
    default: false,
  },
  allowMultipleSubmissions: {
    type: Boolean,
    default: false,
  },
  requiresAuthentication: {
    type: Boolean,
    default: true,
  },
  showProgressBar: {
    type: Boolean,
    default: true,
  },
  allowSaveProgress: {
    type: Boolean,
    default: true,
  },
  autoSave: {
    type: Boolean,
    default: false,
  },
  submitButtonText: {
    type: String,
    default: 'Enviar',
    trim: true,
  },
  successMessage: {
    type: String,
    default: 'Formulario enviado correctamente',
    trim: true,
  },
  errorMessage: {
    type: String,
    default: 'Error al enviar el formulario',
    trim: true,
  },
}, { _id: false });

const PermissionsSchema = new Schema({
  canView: {
    type: [String],
    enum: ['admin', 'professional', 'reception', 'patient'],
    default: ['admin', 'professional'],
  },
  canSubmit: {
    type: [String],
    enum: ['admin', 'professional', 'reception', 'patient'],
    default: ['patient'],
  },
  canEdit: {
    type: [String],
    enum: ['admin', 'professional', 'reception'],
    default: ['admin'],
  },
}, { _id: false });

const LifecycleSchema = new Schema({
  publishedAt: {
    type: Date,
  },
  deprecatedAt: {
    type: Date,
  },
  archivedAt: {
    type: Date,
  },
  nextVersionId: {
    type: Schema.Types.ObjectId,
    ref: 'FormSchema',
  },
  previousVersionId: {
    type: Schema.Types.ObjectId,
    ref: 'FormSchema',
  },
}, { _id: false });

const ConditionsSchema = new Schema({
  serviceIds: {
    type: [Schema.Types.ObjectId],
    ref: 'Service',
    default: [],
  },
  professionalIds: {
    type: [Schema.Types.ObjectId],
    ref: 'Professional',
    default: [],
  },
  patientTags: {
    type: [String],
    default: [],
  },
  appointmentStatus: {
    type: [String],
    enum: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'],
    default: [],
  },
  daysBefore: {
    type: Number,
    min: 0,
  },
  daysAfter: {
    type: Number,
    min: 0,
  },
}, { _id: false });

const ReminderSettingsSchema = new Schema({
  enabled: {
    type: Boolean,
    default: false,
  },
  reminderDays: {
    type: [Number],
    default: [1, 3, 7],
  },
  maxReminders: {
    type: Number,
    default: 3,
    min: 1,
    max: 10,
  },
  reminderTemplate: {
    type: String,
    trim: true,
  },
}, { _id: false });

const AssignmentRulesSchema = new Schema({
  triggerType: {
    type: String,
    enum: ['manual', 'appointment_booked', 'appointment_completed', 'patient_registered', 'scheduled', 'conditional'],
    default: 'manual',
  },
  conditions: {
    type: ConditionsSchema,
  },
  priority: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  isOptional: {
    type: Boolean,
    default: true,
  },
  reminderSettings: {
    type: ReminderSettingsSchema,
  },
}, { _id: false });

const CustomValidationSchema = new Schema({
  field: {
    type: String,
    required: true,
    trim: true,
  },
  rule: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  value: {
    type: Schema.Types.Mixed,
  },
}, { _id: false });

const InterpretationSchema = new Schema({
  range: {
    type: [Number],
    required: true,
    validate: {
      validator: (v: number[]) => v.length === 2 && v[0] <= v[1],
      message: 'Range must be an array of two numbers [min, max]',
    },
  },
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
    validate: {
      validator: (v: string) => !v || /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v),
      message: 'Color must be a valid hex color',
    },
  },
}, { _id: false });

const ValidationSchema = new Schema({
  customValidations: {
    type: [CustomValidationSchema],
    default: [],
  },
  scoringRules: {
    totalScore: {
      formula: {
        type: String,
        trim: true,
      },
      maxScore: {
        type: Number,
        min: 0,
      },
      interpretation: {
        type: [InterpretationSchema],
        default: [],
      },
    },
    subscales: {
      type: [{
        name: {
          type: String,
          required: true,
          trim: true,
        },
        fields: {
          type: [String],
          required: true,
        },
        formula: {
          type: String,
          required: true,
          trim: true,
        },
        maxScore: {
          type: Number,
          required: true,
          min: 0,
        },
        interpretation: {
          type: [InterpretationSchema],
          default: [],
        },
      }],
      default: [],
    },
  },
}, { _id: false });

const ConditionalLogicSchema = new Schema({
  showWhen: {
    type: [{
      field: {
        type: String,
        required: true,
        trim: true,
      },
      operator: {
        type: String,
        enum: ['equals', 'not_equals', 'greater_than', 'less_than', 'contains', 'not_contains'],
        required: true,
      },
      value: {
        type: Schema.Types.Mixed,
        required: true,
      },
    }],
    default: [],
  },
  hideWhen: {
    type: [{
      field: {
        type: String,
        required: true,
        trim: true,
      },
      operator: {
        type: String,
        enum: ['equals', 'not_equals', 'greater_than', 'less_than', 'contains', 'not_contains'],
        required: true,
      },
      value: {
        type: Schema.Types.Mixed,
        required: true,
      },
    }],
    default: [],
  },
  requiredWhen: {
    type: [{
      field: {
        type: String,
        required: true,
        trim: true,
      },
      targetField: {
        type: String,
        required: true,
        trim: true,
      },
      operator: {
        type: String,
        enum: ['equals', 'not_equals', 'greater_than', 'less_than', 'contains', 'not_contains'],
        required: true,
      },
      value: {
        type: Schema.Types.Mixed,
        required: true,
      },
    }],
    default: [],
  },
}, { _id: false });

const FormSchemaModel = new Schema<IFormSchemaDocument>(
  {
    // Basic information
    name: {
      type: String,
      required: [true, 'Form name is required'],
      trim: true,
      maxlength: [100, 'Form name cannot exceed 100 characters'],
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Form title is required'],
      trim: true,
      maxlength: [200, 'Form title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Form description cannot exceed 1000 characters'],
    },
    version: {
      type: String,
      required: [true, 'Form version is required'],
      trim: true,
      default: '1.0.0',
      validate: {
        validator: (v: string) => /^\d+\.\d+\.\d+$/.test(v),
        message: 'Version must follow semantic versioning (x.y.z)',
      },
    },
    
    // Schema definition
    jsonSchema: {
      type: JsonSchemaDefinition,
      required: true,
    },
    
    // UI Schema
    uiSchema: {
      type: Schema.Types.Mixed,
      default: {},
    },
    
    // Configuration
    config: {
      type: ConfigSchema,
      default: {},
    },
    
    // Permissions
    permissions: {
      type: PermissionsSchema,
      default: {},
    },
    
    // Lifecycle
    lifecycle: {
      type: LifecycleSchema,
      default: {},
    },
    
    // Assignment rules
    assignmentRules: {
      type: AssignmentRulesSchema,
      default: {},
    },
    
    // Validation
    validation: {
      type: ValidationSchema,
      default: {},
    },
    
    // Conditional logic
    conditionalLogic: {
      type: ConditionalLogicSchema,
      default: {},
    },
    
    // Integrations
    integrations: {
      exportToEMR: {
        type: Boolean,
        default: false,
      },
      syncWithThirdParty: {
        provider: {
          type: String,
          trim: true,
        },
        endpoint: {
          type: String,
          trim: true,
        },
        mapping: {
          type: Schema.Types.Mixed,
          default: {},
        },
        credentials: {
          type: String,
          trim: true, // Should be encrypted
        },
      },
      webhooks: {
        type: [{
          url: {
            type: String,
            required: true,
            trim: true,
            validate: {
              validator: (v: string) => /^https?:\/\/.+/.test(v),
              message: 'Webhook URL must be a valid HTTP/HTTPS URL',
            },
          },
          events: {
            type: [String],
            enum: ['submitted', 'updated', 'deleted'],
            required: true,
          },
          headers: {
            type: Schema.Types.Mixed,
            default: {},
          },
          secret: {
            type: String,
            trim: true,
          },
        }],
        default: [],
      },
    },
    
    // Analytics
    analytics: {
      totalSubmissions: {
        type: Number,
        default: 0,
        min: 0,
      },
      completionRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
      },
      averageCompletionTime: {
        type: Number,
        default: 0,
        min: 0,
      },
      abandonmentPoints: {
        type: [{
          fieldName: {
            type: String,
            required: true,
            trim: true,
          },
          abandonmentCount: {
            type: Number,
            required: true,
            min: 0,
          },
        }],
        default: [],
      },
      lastSubmissionAt: {
        type: Date,
      },
    },
    
    // Localization
    localization: {
      defaultLanguage: {
        type: String,
        default: 'es',
        trim: true,
        lowercase: true,
      },
      translations: {
        type: Schema.Types.Mixed,
        default: {},
      },
    },
    
    // Metadata
    metadata: {
      category: {
        type: String,
        enum: ['intake', 'assessment', 'screening', 'feedback', 'consent', 'registration', 'survey', 'other'],
        default: 'other',
      },
      tags: {
        type: [String],
        default: [],
      },
      estimatedCompletionTime: {
        type: Number,
        default: 10, // minutes
        min: 1,
        max: 240,
      },
      difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium',
      },
      clinicalContext: {
        type: String,
        trim: true,
        maxlength: [500, 'Clinical context cannot exceed 500 characters'],
      },
      references: {
        type: [String],
        default: [],
      },
      notes: {
        type: String,
        trim: true,
        maxlength: [2000, 'Notes cannot exceed 2000 characters'],
      },
    },
    
    // Audit
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lastModifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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
FormSchemaModel.index({ name: 1, version: 1 }, { unique: true });
FormSchemaModel.index({ 'metadata.category': 1, 'config.isActive': 1 });
FormSchemaModel.index({ 'assignmentRules.triggerType': 1, 'config.isActive': 1 });
FormSchemaModel.index({ createdBy: 1, createdAt: -1 });
FormSchemaModel.index({ 'lifecycle.publishedAt': -1 });

// Text search index
FormSchemaModel.index({
  name: 'text',
  title: 'text',
  description: 'text',
  'metadata.tags': 'text',
});

// Pre-save middleware
FormSchemaModel.pre('save', function(this: IFormSchemaDocument, next) {
  // Update lastModifiedBy on changes
  if (this.isModified() && !this.isNew && !this.lastModifiedBy) {
    this.lastModifiedBy = this.createdBy;
  }
  
  // Set publishedAt when activating for the first time
  if (this.isModified('config.isActive') && this.config.isActive && !this.lifecycle.publishedAt) {
    this.lifecycle.publishedAt = new Date();
  }
  
  next();
});

// Static methods
FormSchemaModel.statics.findActiveByCategory = function(category: string) {
  return this.find({
    'metadata.category': category,
    'config.isActive': true,
    deletedAt: null,
  }).sort({ createdAt: -1 });
};

FormSchemaModel.statics.findByTriggerType = function(triggerType: string) {
  return this.find({
    'assignmentRules.triggerType': triggerType,
    'config.isActive': true,
    deletedAt: null,
  }).sort({ 'assignmentRules.priority': -1 });
};

FormSchemaModel.statics.getAnalyticsSummary = function() {
  return this.aggregate([
    { $match: { deletedAt: null } },
    {
      $group: {
        _id: '$metadata.category',
        totalForms: { $sum: 1 },
        activeForms: {
          $sum: { $cond: ['$config.isActive', 1, 0] }
        },
        totalSubmissions: { $sum: '$analytics.totalSubmissions' },
        averageCompletionRate: { $avg: '$analytics.completionRate' },
        averageCompletionTime: { $avg: '$analytics.averageCompletionTime' },
      },
    },
  ]);
};

// Instance methods
FormSchemaModel.methods.validateFormData = function(data: any) {
  const errors: any[] = [];
  const schema = this.jsonSchema;
  
  // Basic validation against JSON schema
  if (schema.required) {
    for (const field of schema.required) {
      if (!data[field]) {
        errors.push({
          field,
          message: `Field '${field}' is required`,
        });
      }
    }
  }
  
  // Custom validations
  for (const validation of this.validation.customValidations) {
    const fieldValue = data[validation.field];
    let isValid = true;
    
    switch (validation.rule) {
      case 'min_length':
        isValid = fieldValue && fieldValue.length >= validation.value;
        break;
      case 'max_length':
        isValid = !fieldValue || fieldValue.length <= validation.value;
        break;
      case 'pattern':
        isValid = !fieldValue || new RegExp(validation.value).test(fieldValue);
        break;
      case 'min_value':
        isValid = fieldValue >= validation.value;
        break;
      case 'max_value':
        isValid = fieldValue <= validation.value;
        break;
    }
    
    if (!isValid) {
      errors.push({
        field: validation.field,
        message: validation.message,
      });
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

FormSchemaModel.methods.calculateScore = function(data: any) {
  const scoring = this.validation.scoringRules;
  if (!scoring) return null;
  
  const results: any = {};
  
  // Calculate total score
  if (scoring.totalScore) {
    let totalScore = 0;
    // Simple scoring - sum numeric fields
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'number') {
        totalScore += value;
      }
    }
    
    results.totalScore = {
      score: totalScore,
      maxScore: scoring.totalScore.maxScore,
      percentage: (totalScore / scoring.totalScore.maxScore) * 100,
      interpretation: this.getScoreInterpretation(totalScore, scoring.totalScore.interpretation),
    };
  }
  
  // Calculate subscale scores
  if (scoring.subscales) {
    results.subscales = scoring.subscales.map((subscale: any) => {
      let subscaleScore = 0;
      for (const field of subscale.fields) {
        if (typeof data[field] === 'number') {
          subscaleScore += data[field];
        }
      }
      
      return {
        name: subscale.name,
        score: subscaleScore,
        maxScore: subscale.maxScore,
        percentage: (subscaleScore / subscale.maxScore) * 100,
        interpretation: this.getScoreInterpretation(subscaleScore, subscale.interpretation),
      };
    });
  }
  
  return results;
};

FormSchemaModel.methods.getScoreInterpretation = function(score: number, interpretations: any[]) {
  for (const interpretation of interpretations) {
    const [min, max] = interpretation.range;
    if (score >= min && score <= max) {
      return interpretation;
    }
  }
  return null;
};

FormSchemaModel.methods.createNewVersion = function() {
  const newVersion = this.toObject();
  delete newVersion._id;
  delete newVersion.createdAt;
  delete newVersion.updatedAt;
  
  // Increment version
  const versionParts = this.version.split('.').map(Number);
  versionParts[1] += 1; // Increment minor version
  newVersion.version = versionParts.join('.');
  
  // Link versions
  newVersion.lifecycle = {
    previousVersionId: this._id,
  };
  
  // Reset analytics
  newVersion.analytics = {
    totalSubmissions: 0,
    completionRate: 0,
    averageCompletionTime: 0,
    abandonmentPoints: [],
  };
  
  return new (this.constructor as any)(newVersion).save();
};

FormSchemaModel.methods.clone = function(newName?: string) {
  const cloned = this.toObject();
  delete cloned._id;
  delete cloned.createdAt;
  delete cloned.updatedAt;
  
  cloned.name = newName || `${this.name} (Copy)`;
  cloned.config.isActive = false; // Clones start inactive
  cloned.lifecycle = {}; // Reset lifecycle
  cloned.analytics = {
    totalSubmissions: 0,
    completionRate: 0,
    averageCompletionTime: 0,
    abandonmentPoints: [],
  };
  
  return new (this.constructor as any)(cloned).save();
};

FormSchemaModel.methods.assignToPatient = async function(patientId: mongoose.Types.ObjectId, dueDate?: Date) {
  // This would create a FormResponse record with status 'assigned'
  // Implementation depends on FormResponse model
  return {
    formSchemaId: this._id,
    patientId,
    status: 'assigned',
    dueDate: dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    assignedAt: new Date(),
  };
};

FormSchemaModel.methods.softDelete = function() {
  this.deletedAt = new Date();
  this.config.isActive = false; // Deactivate when deleting
  return this.save();
};

export const FormSchema = mongoose.model<IFormSchemaDocument>('FormSchema', FormSchemaModel);
export default FormSchema;

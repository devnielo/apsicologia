import mongoose, { Document, Schema } from 'mongoose';
import { IPatient } from '@apsicologia/shared/types';

export interface IPatientDocument extends Document {
  _id: mongoose.Types.ObjectId;
  
  // User account reference (optional - for patient portal access)
  userId?: mongoose.Types.ObjectId;
  
  // Personal Information
  personalInfo: {
    firstName: string;
    lastName: string;
    fullName: string; // Computed field
    dateOfBirth: Date;
    age: number; // Computed field
    gender: 'male' | 'female' | 'non-binary' | 'other' | 'prefer-not-to-say';
    nationality?: string;
    idNumber?: string; // DNI, passport, etc.
    idType?: 'dni' | 'nie' | 'passport' | 'other';
    maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed' | 'separated' | 'domestic-partner';
    occupation?: string;
    employer?: string;
    profilePicture?: string; // Base64 encoded image
  };
  
  // Contact Information
  contactInfo: {
    email: string;
    phone: string;
    alternativePhone?: string;
    preferredContactMethod: 'email' | 'phone' | 'sms' | 'whatsapp';
    address: {
      street: string;
      city: string;
      postalCode: string;
      state?: string;
      country: string;
    };
  };
  
  // Emergency Contact
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  
  // Clinical Information
  clinicalInfo: {
    // Assigned professionals
    primaryProfessional?: mongoose.Types.ObjectId;
    assignedProfessionals: mongoose.Types.ObjectId[];
    
    // Medical history
    medicalHistory: {
      conditions: string[];
      medications: string[];
      allergies: string[];
      surgeries: string[];
      notes?: string;
    };
    
    // Mental health history
    mentalHealthHistory: {
      diagnoses: string[];
      previousTreatments: string[];
      currentStatus?: 'active' | 'stable' | 'improving' | 'critical';
      severity?: 'mild' | 'moderate' | 'severe';
      notes?: string;
    };
    
    // Current treatment
    currentTreatment: {
      treatmentPlan?: string; // Rich text HTML content
      goals: string[];
      startDate: Date;
      expectedDuration?: string;
      frequency?: string;
      notes?: string;
      sessions?: {
        sessionId: string;
        date: Date;
        duration: number; // in minutes
        type: 'individual' | 'group' | 'family' | 'assessment' | 'crisis';
        status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
        professionalId: mongoose.Types.ObjectId;
        notes: string; // Rich text HTML content
        objectives: string[];
        homework?: string;
        nextSessionPlan?: string;
        mood?: {
          before: number; // 1-10 scale
          after: number; // 1-10 scale
        };
        progress?: {
          rating: number; // 1-10 scale
          observations: string;
        };
        createdAt: Date;
        updatedAt: Date;
      }[];
    };
  };
  
  // Episodes and treatment cycles
  episodes: {
    episodeId: string;
    title: string;
    description?: string;
    startDate: Date;
    endDate?: Date;
    status: 'active' | 'completed' | 'on-hold' | 'cancelled';
    primaryProfessional: mongoose.Types.ObjectId;
    treatmentType: string;
    goals: string[];
    outcome?: string;
    notes?: string;
    appointmentIds: mongoose.Types.ObjectId[];
  }[];
  
  // Payment and billing configuration (ESTRUCTURA CORREGIDA - Coincide con el modelo Patient.ts backend)
  billing: {
    paymentMethod: 'stripe' | 'cash';
    stripeCustomerId?: string;
    preferredPaymentMethod?: 'card' | 'cash';
    billingNotes?: string;
  };
  
  // Preferences and configuration
  preferences: {
    // Communication preferences
    language: string;
    communicationPreferences: {
      appointmentReminders: boolean;
      reminderMethods: ('email' | 'sms' | 'phone' | 'push')[];
      reminderTiming: number[]; // Hours before appointment
      newsletters: boolean;
      marketingCommunications: boolean;
    };

    // Appointment preferences
    appointmentPreferences: {
      preferredTimes: {
        dayOfWeek: number; // 0-6, 0 = Sunday
        startTime: string; // HH:mm format
        endTime: string;
      }[];
      preferredProfessionals: mongoose.Types.ObjectId[];
      sessionFormat: 'in-person' | 'video' | 'phone' | 'any';
      sessionDuration: number; // minutes
      bufferBetweenSessions?: number; // minutes
      notes?: string;
    };

    // Portal access
    portalAccess: {
      enabled: boolean;
      lastLogin?: Date;
      passwordLastChanged?: Date;
      twoFactorEnabled: boolean;
      loginNotifications: boolean;
    };
  };
  
  // GDPR and consent management
  gdprConsent: {
    dataProcessing: {
      consented: boolean;
      consentDate: Date;
      consentMethod: 'verbal' | 'written' | 'digital';
      consentVersion: string;
      witnessedBy?: mongoose.Types.ObjectId;
      notes?: string;
    };
    marketingCommunications: {
      consented: boolean;
      consentDate?: Date;
      withdrawnDate?: Date;
      method: 'verbal' | 'written' | 'digital';
    };
    dataSharing: {
      healthcareProfessionals: boolean;
      insuranceProviders: boolean;
      emergencyContacts: boolean;
      researchPurposes?: boolean;
      consentDate: Date;
    };
    rightToErasure: {
      requested: boolean;
      requestDate?: Date;
      processedDate?: Date;
      processedBy?: mongoose.Types.ObjectId;
      retentionReason?: string;
      notes?: string;
    };
    dataPortability: {
      lastExportDate?: Date;
      exportFormat?: string;
      exportedBy?: mongoose.Types.ObjectId;
    };
  };
  
  // Signed Consent Documents (Global/Shared)
  signedConsentDocuments: {
    documentId: mongoose.Types.ObjectId;
    documentType: 'informed_consent' | 'treatment_agreement' | 'privacy_policy' | 'data_processing' | 'research_consent' | 'telehealth_consent' | 'minor_consent' | 'emergency_contact' | 'financial_agreement' | 'custom';
    documentTitle: string;
    signedDate: Date;
    signedBy: mongoose.Types.ObjectId;
    witnessedBy?: mongoose.Types.ObjectId;
    signatureMethod: 'digital' | 'physical' | 'verbal';
    documentVersion: string;
    isActive: boolean;
    expirationDate?: Date;
    notes?: string;
    metadata?: {
      ipAddress?: string;
      userAgent?: string;
      location?: string;
      deviceInfo?: string;
    };
  }[];
  
  // Tags and categorization
  tags: {
    name: string;
    category: 'clinical' | 'administrative' | 'billing' | 'custom';
    color?: string;
    addedBy: mongoose.Types.ObjectId;
    addedDate: Date;
  }[];
  
  // Status and lifecycle
  status: 'active' | 'inactive' | 'discharged' | 'transferred' | 'deceased' | 'deleted';
  
  // Relationship tracking
  relationships: {
    relatedPatientId: mongoose.Types.ObjectId;
    relationship: 'spouse' | 'child' | 'parent' | 'sibling' | 'guardian' | 'other';
    description?: string;
    canAccessInformation: boolean;
    emergencyContact: boolean;
  }[];
  
  // Referral information
  referral: {
    source?: 'self' | 'physician' | 'family' | 'friend' | 'insurance' | 'online' | 'other';
    referringPhysician?: {
      name: string;
      specialty?: string;
      phone?: string;
      email?: string;
      notes?: string;
    };
    referringPerson?: string;
    referralDate?: Date;
    referralReason?: string;
    referralNotes?: string;
  };
  
  // Statistics and metrics
  statistics: {
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    noShowAppointments: number;
    firstAppointmentDate?: Date;
    lastAppointmentDate?: Date;
    totalInvoiceAmount: number;
    totalPaidAmount: number;
    averageSessionRating?: number;
  };
  
  // Notes and observations
  administrativeNotes: {
    noteId: string;
    content: string;
    category: 'general' | 'billing' | 'scheduling' | 'clinical' | 'behavior';
    isPrivate: boolean;
    addedBy: mongoose.Types.ObjectId;
    addedDate: Date;
    lastModified?: Date;
    lastModifiedBy?: mongoose.Types.ObjectId;
  }[];
  
  // Audit and compliance
  createdBy: mongoose.Types.ObjectId;
  lastModifiedBy?: mongoose.Types.ObjectId;
  version: number;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  
  // Instance methods
  calculateAge(): number;
  getFullName(): string;
  addEpisode(episode: any): Promise<this>;
  closeEpisode(episodeId: string, outcome?: string): Promise<this>;
  addTag(tag: string, category: string, addedBy: mongoose.Types.ObjectId): Promise<this>;
  removeTag(tagName: string): Promise<this>;
  updateInsuranceUsage(sessionsUsed: number): Promise<this>;
  exportData(): Promise<any>;
  softDelete(): Promise<this>;
  generatePatientNumber(): string;
}

// Sub-schemas
const AddressSchema = new Schema({
  street: {
    type: String,
    required: true,
    trim: true,
  },
  city: {
    type: String,
    required: true,
    trim: true,
  },
  postalCode: {
    type: String,
    required: true,
    trim: true,
  },
  state: {
    type: String,
    trim: true,
  },
  country: {
    type: String,
    required: true,
    trim: true,
    default: 'Spain',
  },
}, { _id: false });

const PersonalInfoSchema = new Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters'],
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters'],
  },
  fullName: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
    index: true,
    validate: {
      validator: function(date: Date) {
        return date <= new Date();
      },
      message: 'Date of birth cannot be in the future',
    },
  },
  age: {
    type: Number,
    required: true,
    min: [0, 'Age cannot be negative'],
    max: [150, 'Age cannot exceed 150 years'],
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'non-binary', 'other', 'prefer-not-to-say'],
    required: true,
  },
  nationality: {
    type: String,
    trim: true,
  },
  idNumber: {
    type: String,
    trim: true,
    sparse: true,
    index: true,
  },
  idType: {
    type: String,
    enum: ['dni', 'nie', 'passport', 'other'],
  },
  maritalStatus: {
    type: String,
    enum: ['single', 'married', 'divorced', 'widowed', 'separated', 'domestic-partner'],
  },
  occupation: {
    type: String,
    trim: true,
    maxlength: [100, 'Occupation cannot exceed 100 characters'],
  },
  employer: {
    type: String,
    trim: true,
    maxlength: [100, 'Employer cannot exceed 100 characters'],
  },
  profilePicture: {
    type: String,
    trim: true,
    maxlength: [5000000, 'Profile picture cannot exceed 5MB when base64 encoded'], // ~5MB limit
  },
}, { _id: false });

const ContactInfoSchema = new Schema({
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(email: string) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Invalid email format',
    },
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  alternativePhone: {
    type: String,
    trim: true,
  },
  preferredContactMethod: {
    type: String,
    enum: ['email', 'phone', 'sms', 'whatsapp'],
    default: 'email',
  },
  address: {
    type: AddressSchema,
    required: true,
  },
}, { _id: false });

const EmergencyContactSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Emergency contact name cannot exceed 100 characters'],
  },
  relationship: {
    type: String,
    required: true,
    trim: true,
    maxlength: [50, 'Relationship cannot exceed 50 characters'],
  },
  phone: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
}, { _id: false });

const MedicationSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  dosage: {
    type: String,
    required: true,
    trim: true,
  },
  frequency: {
    type: String,
    required: true,
    trim: true,
  },
  prescribedBy: {
    type: String,
    trim: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
  },
  active: {
    type: Boolean,
    default: true,
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Medication notes cannot exceed 500 characters'],
  },
}, { timestamps: false });

const AllergySchema = new Schema({
  type: {
    type: String,
    enum: ['medication', 'food', 'environmental', 'other'],
    required: true,
  },
  allergen: {
    type: String,
    required: true,
    trim: true,
  },
  severity: {
    type: String,
    enum: ['mild', 'moderate', 'severe'],
    required: true,
  },
  reaction: {
    type: String,
    required: true,
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
  },
}, { timestamps: false });

const SurgerySchema = new Schema({
  procedure: {
    type: String,
    required: true,
    trim: true,
  },
  date: {
    type: Date,
    required: true,
  },
  hospital: {
    type: String,
    trim: true,
  },
  surgeon: {
    type: String,
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
  },
}, { timestamps: false });

const HospitalizationSchema = new Schema({
  reason: {
    type: String,
    required: true,
    trim: true,
  },
  admissionDate: {
    type: Date,
    required: true,
  },
  dischargeDate: {
    type: Date,
  },
  hospital: {
    type: String,
    required: true,
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
  },
}, { timestamps: false });

const EpisodeSchema = new Schema({
  episodeId: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'on-hold', 'cancelled'],
    default: 'active',
  },
  primaryProfessional: {
    type: Schema.Types.ObjectId,
    ref: 'Professional',
    required: true,
  },
  treatmentType: {
    type: String,
    required: true,
    trim: true,
  },
  goals: [{
    type: String,
    trim: true,
  }],
  outcome: {
    type: String,
    trim: true,
  },
  notes: {
    type: String,
    trim: true,
  },
  appointmentIds: [{
    type: Schema.Types.ObjectId,
    ref: 'Appointment',
  }],
}, { timestamps: false });

const TagSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  category: {
    type: String,
    enum: ['clinical', 'administrative', 'billing', 'custom'],
    default: 'custom',
  },
  color: {
    type: String,
    trim: true,
  },
  addedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  addedDate: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const PatientSchema = new Schema<IPatientDocument>(
  {
    // User account reference
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      sparse: true,
      index: true,
    },
    
    // Personal Information
    personalInfo: {
      type: PersonalInfoSchema,
      required: true,
    },
    
    // Contact Information
    contactInfo: {
      type: ContactInfoSchema,
      required: true,
    },
    
    // Emergency Contact
    emergencyContact: {
      type: EmergencyContactSchema,
      required: true,
    },
    
    // Clinical Information
    clinicalInfo: {
      primaryProfessional: {
        type: Schema.Types.ObjectId,
        ref: 'Professional',
        index: true,
      },
      assignedProfessionals: [{
        type: Schema.Types.ObjectId,
        ref: 'Professional',
      }],
      medicalHistory: {
        conditions: [{
          type: String,
          trim: true,
        }],
        medications: [{
          type: String,
          trim: true,
        }],
        allergies: [{
          type: String,
          trim: true,
        }],
        surgeries: [{
          type: String,
          trim: true,
        }],
        notes: {
          type: String,
          trim: true,
        },
      },
      mentalHealthHistory: {
        diagnoses: [{
          type: String,
          trim: true,
        }],
        previousTreatments: [{
          type: String,
          trim: true,
        }],
        currentStatus: {
          type: String,
          enum: ['active', 'stable', 'improving', 'critical'],
          default: 'active',
        },
        severity: {
          type: String,
          enum: ['mild', 'moderate', 'severe'],
        },
        notes: {
          type: String,
          trim: true,
        },
      },
      currentTreatment: {
        treatmentPlan: {
          type: String,
          trim: true,
          // Rich text HTML content for treatment plan
        },
        goals: [String],
        startDate: {
          type: Date,
          required: true,
        },
        expectedDuration: String,
        frequency: String,
        notes: String,
        sessions: [{
          sessionId: {
            type: String,
            required: true,
            unique: true,
          },
          date: {
            type: Date,
            required: true,
          },
          duration: {
            type: Number,
            required: true,
            min: 15,
            max: 180,
          },
          type: {
            type: String,
            enum: ['individual', 'group', 'family', 'assessment', 'crisis'],
            default: 'individual',
          },
          status: {
            type: String,
            enum: ['scheduled', 'completed', 'cancelled', 'no-show'],
            default: 'scheduled',
          },
          professionalId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Professional',
            required: true,
          },
          notes: {
            type: String,
            trim: true,
            // Rich text HTML content for session notes
          },
          objectives: [String],
          homework: String,
          nextSessionPlan: String,
          mood: {
            before: {
              type: Number,
              min: 1,
              max: 10,
            },
            after: {
              type: Number,
              min: 1,
              max: 10,
            },
          },
          progress: {
            rating: {
              type: Number,
              min: 1,
              max: 10,
            },
            observations: String,
          },
          createdAt: {
            type: Date,
            default: Date.now,
          },
          updatedAt: {
            type: Date,
            default: Date.now,
          },
        }],
      },
      // Rich text clinical notes
      clinicalNotes: {
        type: String,
        trim: true,
        // HTML content for clinical observations and notes
      },
    },
    
    // Episodes
    episodes: [EpisodeSchema],
    
    // Payment and billing configuration
    billing: {
      paymentMethod: {
        type: String,
        enum: ['stripe', 'cash'],
        default: 'stripe',
      },
      stripeCustomerId: String,
      preferredPaymentMethod: {
        type: String,
        enum: ['card', 'cash'],
        default: 'card',
      },
      billingNotes: String,
    },
    
    // Preferences
    preferences: {
      language: {
        type: String,
        default: 'es',
        enum: ['es', 'en', 'ca', 'eu', 'gl'],
      },
      communicationPreferences: {
        appointmentReminders: {
          type: Boolean,
          default: true,
        },
        reminderMethods: [{
          type: String,
          enum: ['email', 'sms', 'phone', 'push'],
        }],
        reminderTiming: [{
          type: Number, // Hours before appointment
        }],
        newsletters: {
          type: Boolean,
          default: false,
        },
        marketingCommunications: {
          type: Boolean,
          default: false,
        },
      },
      appointmentPreferences: {
        preferredTimes: [{
          day: {
            type: String,
            enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
            required: true
          },
          startTime: {
            type: String,
            required: true,
            validate: {
              validator: (v: string) => /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v),
              message: 'Start time must be in HH:MM format'
            }
          },
          endTime: {
            type: String,
            required: true,
            validate: {
              validator: (v: string) => /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(v),
              message: 'End time must be in HH:MM format'
            }
          }
        }],
        preferredProfessionals: [{
          type: Schema.Types.ObjectId,
          ref: 'Professional'
        }],
        preferredServices: [{
          type: Schema.Types.ObjectId,
          ref: 'Service'
        }],
        cancellationNotice: {
          type: Number,
          min: [1, 'Cancellation notice must be at least 1 hour'],
          max: [168, 'Cancellation notice cannot exceed 7 days'],
          default: 24
        },
        waitingListOptIn: {
          type: Boolean,
          default: false
        },
        notes: {
          type: String,
          maxlength: [500, 'Appointment notes cannot exceed 500 characters']
        }
      },
      portalAccess: {
        enabled: {
          type: Boolean,
          default: false,
        },
        lastLogin: Date,
        passwordLastChanged: Date,
        twoFactorEnabled: {
          type: Boolean,
          default: false,
        },
        loginNotifications: {
          type: Boolean,
          default: true,
        },
      },
    },
    
    // GDPR Consent
    gdprConsent: {
      dataProcessing: {
        consented: {
          type: Boolean,
          required: true,
        },
        consentDate: {
          type: Date,
          required: true,
        },
        consentMethod: {
          type: String,
          enum: ['verbal', 'written', 'digital'],
          required: true,
        },
        consentVersion: {
          type: String,
          required: true,
          default: '1.0',
        },
        witnessedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        notes: String,
      },
      marketingCommunications: {
        consented: {
          type: Boolean,
          default: false,
        },
        consentDate: Date,
        withdrawnDate: Date,
        method: {
          type: String,
          enum: ['verbal', 'written', 'digital'],
        },
      },
      dataSharing: {
        healthcareProfessionals: {
          type: Boolean,
          default: true,
        },
        insuranceProviders: {
          type: Boolean,
          default: false,
        },
        emergencyContacts: {
          type: Boolean,
          default: true,
        },
        researchPurposes: {
          type: Boolean,
          default: false,
        },
        consentDate: {
          type: Date,
          required: true,
        },
      },
      rightToErasure: {
        requested: {
          type: Boolean,
          default: false,
        },
        requestDate: Date,
        processedDate: Date,
        processedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        retentionReason: String,
        notes: String,
      },
      dataPortability: {
        lastExportDate: Date,
        exportFormat: String,
        exportedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    },
    
    // Signed Consent Documents (Global/Shared)
    signedConsentDocuments: [{
      documentId: {
        type: Schema.Types.ObjectId,
        ref: 'File',
        required: true,
      },
      documentType: {
        type: String,
        enum: ['informed_consent', 'treatment_agreement', 'privacy_policy', 'data_processing', 'research_consent', 'telehealth_consent', 'minor_consent', 'emergency_contact', 'financial_agreement', 'custom'],
        required: true,
      },
      documentTitle: {
        type: String,
        required: true,
        trim: true,
      },
      signedDate: {
        type: Date,
        required: true,
      },
      signedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      witnessedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
      signatureMethod: {
        type: String,
        enum: ['digital', 'physical', 'verbal'],
        required: true,
        default: 'digital',
      },
      documentVersion: {
        type: String,
        required: true,
        default: '1.0',
      },
      isActive: {
        type: Boolean,
        default: true,
      },
      expirationDate: Date,
      notes: {
        type: String,
        trim: true,
      },
      metadata: {
        ipAddress: String,
        userAgent: String,
        location: String,
        deviceInfo: String,
      },
    }],
    
    // Tags
    tags: [TagSchema],
    
    // Status
    status: {
      type: String,
      enum: ['active', 'inactive', 'discharged', 'transferred', 'deceased', 'deleted'],
      default: 'active',
      index: true,
    },
    
    // Relationships
    relationships: [{
      relatedPatientId: {
        type: Schema.Types.ObjectId,
        ref: 'Patient',
        required: true,
      },
      relationship: {
        type: String,
        enum: ['spouse', 'child', 'parent', 'sibling', 'guardian', 'other'],
        required: true,
      },
      description: String,
      canAccessInformation: {
        type: Boolean,
        default: false,
      },
      emergencyContact: {
        type: Boolean,
        default: false,
      },
    }],
    
    // Referral
    referral: {
      source: {
        type: String,
        enum: ['self', 'physician', 'family', 'friend', 'insurance', 'online', 'other'],
      },
      referringPhysician: {
        name: String,
        specialty: String,
        phone: String,
        email: String,
        notes: String,
      },
      referringPerson: String,
      referralDate: Date,
      referralReason: String,
      referralNotes: String,
    },
    
    // Statistics
    statistics: {
      totalAppointments: {
        type: Number,
        default: 0,
      },
      completedAppointments: {
        type: Number,
        default: 0,
      },
      cancelledAppointments: {
        type: Number,
        default: 0,
      },
      noShowAppointments: {
        type: Number,
        default: 0,
      },
      firstAppointmentDate: Date,
      lastAppointmentDate: Date,
      totalInvoiceAmount: {
        type: Number,
        default: 0,
      },
      totalPaidAmount: {
        type: Number,
        default: 0,
      },
      averageSessionRating: Number,
    },
    
    // Administrative notes
    administrativeNotes: [{
      noteId: {
        type: String,
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
      category: {
        type: String,
        enum: ['general', 'billing', 'scheduling', 'clinical', 'behavior'],
        default: 'general',
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
      addedDate: {
        type: Date,
        default: Date.now,
      },
      lastModified: Date,
      lastModifiedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    }],
    
    // Audit fields
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    lastModifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    version: {
      type: Number,
      default: 1,
      min: 1,
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
PatientSchema.index({ 'personalInfo.fullName': 'text', 'contactInfo.email': 'text' });
PatientSchema.index({ 'contactInfo.email': 1, deletedAt: 1 });
PatientSchema.index({ 'contactInfo.phone': 1, deletedAt: 1 });
PatientSchema.index({ 'personalInfo.idNumber': 1, deletedAt: 1 });
PatientSchema.index({ status: 1, createdAt: -1 });
PatientSchema.index({ 'clinicalInfo.primaryProfessional': 1, status: 1 });
PatientSchema.index({ 'tags.name': 1, 'tags.category': 1 });
PatientSchema.index({ createdAt: -1 });

// Unique constraints
PatientSchema.index({ 'contactInfo.email': 1 }, { unique: true, partialFilterExpression: { deletedAt: null } });
PatientSchema.index({ 'personalInfo.idNumber': 1, 'personalInfo.idType': 1 }, { 
  unique: true, 
  sparse: true,
  partialFilterExpression: { 
    deletedAt: null,
    'personalInfo.idNumber': { $exists: true, $ne: '' }
  }
});

// Pre-save middleware
PatientSchema.pre('save', function(this: IPatientDocument, next) {
  // Auto-calculate age and full name
  if (this.isModified('personalInfo.dateOfBirth') || this.isModified('personalInfo.firstName') || this.isModified('personalInfo.lastName')) {
    this.personalInfo.age = this.calculateAge();
    this.personalInfo.fullName = this.getFullName();
  }
  
  // Update version on modifications
  if (this.isModified() && !this.isNew) {
    this.version += 1;
  }
  
  // Set default communication preferences
  if (this.isNew && !this.preferences.communicationPreferences.reminderMethods.length) {
    this.preferences.communicationPreferences.reminderMethods = ['email'];
    this.preferences.communicationPreferences.reminderTiming = [24, 2]; // 24 hours and 2 hours before
  }
  
  next();
});

// Static methods
PatientSchema.statics.findByEmail = function(email: string) {
  return this.findOne({
    'contactInfo.email': email.toLowerCase(),
    deletedAt: null,
  });
};

PatientSchema.statics.findByPhone = function(phone: string) {
  return this.findOne({
    $or: [
      { 'contactInfo.phone': phone },
      { 'contactInfo.alternativePhone': phone },
    ],
    deletedAt: null,
  });
};

PatientSchema.statics.findByIdNumber = function(idNumber: string, idType?: string) {
  const query: any = {
    'personalInfo.idNumber': idNumber,
    deletedAt: null,
  };
  
  if (idType) {
    query['personalInfo.idType'] = idType;
  }
  
  return this.findOne(query);
};

PatientSchema.statics.findByProfessional = function(professionalId: string, status?: string) {
  const query: any = {
    $or: [
      { 'clinicalInfo.primaryProfessional': professionalId },
      { 'clinicalInfo.assignedProfessionals': professionalId },
    ],
    deletedAt: null,
  };
  
  if (status) {
    query.status = status;
  }
  
  return this.find(query).sort({ 'personalInfo.fullName': 1 });
};

PatientSchema.statics.searchPatients = function(searchTerm: string, limit?: number) {
  const regex = new RegExp(searchTerm, 'i');
  
  return this.find({
    $or: [
      { 'personalInfo.fullName': regex },
      { 'personalInfo.firstName': regex },
      { 'personalInfo.lastName': regex },
      { 'contactInfo.email': regex },
      { 'contactInfo.phone': regex },
      { 'personalInfo.idNumber': regex },
    ],
    deletedAt: null,
  })
    .sort({ 'personalInfo.fullName': 1 })
    .limit(limit || 20);
};

PatientSchema.statics.getByTag = function(tagName: string, category?: string) {
  const query: any = {
    'tags.name': tagName,
    deletedAt: null,
  };
  
  if (category) {
    query['tags.category'] = category;
  }
  
  return this.find(query);
};

// Instance methods
PatientSchema.methods.calculateAge = function(): number {
  const today = new Date();
  const birthDate = new Date(this.personalInfo.dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return Math.max(0, age);
};

PatientSchema.methods.getFullName = function(): string {
  return `${this.personalInfo.firstName} ${this.personalInfo.lastName}`.trim();
};

PatientSchema.methods.addEpisode = function(episode: any) {
  // Generate unique episode ID
  const episodeId = `EP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  const newEpisode = {
    episodeId,
    ...episode,
    startDate: episode.startDate || new Date(),
    status: 'active',
    appointmentIds: [],
  };
  
  this.episodes.push(newEpisode);
  return this.save();
};

PatientSchema.methods.closeEpisode = function(episodeId: string, outcome?: string) {
  const episode = this.episodes.find((ep: any) => ep.episodeId === episodeId);
  if (episode) {
    episode.status = 'completed';
    episode.endDate = new Date();
    if (outcome) {
      episode.outcome = outcome;
    }
  }
  return this.save();
};

PatientSchema.methods.addTag = function(tag: string, category: string, addedBy: mongoose.Types.ObjectId) {
  // Check if tag already exists
  const existingTag = this.tags.find((t: any) => t.name === tag && t.category === category);
  if (existingTag) {
    return this.save();
  }
  
  this.tags.push({
    name: tag,
    category,
    addedBy,
    addedDate: new Date(),
  });
  
  return this.save();
};

PatientSchema.methods.removeTag = function(tagName: string) {
  this.tags = this.tags.filter((tag: any) => tag.name !== tagName);
  return this.save();
};

PatientSchema.methods.updateInsuranceUsage = function(sessionsUsed: number) {
  if (this.insurance.primaryInsurance) {
    this.insurance.primaryInsurance.sessionsUsed = sessionsUsed;
  }
  return this.save();
};

PatientSchema.methods.exportData = function() {
  const exportData = this.toObject();
  
  // Add export metadata
  exportData._exportMetadata = {
    exportDate: new Date(),
    exportFormat: 'json',
    version: '1.0',
    gdprCompliant: true,
  };
  
  // Update data portability log
  this.gdprConsent.dataPortability.lastExportDate = new Date();
  this.gdprConsent.dataPortability.exportFormat = 'json';
  
  return this.save().then(() => exportData);
};

PatientSchema.methods.softDelete = function() {
  this.deletedAt = new Date();
  this.status = 'inactive';
  return this.save();
};

PatientSchema.methods.generatePatientNumber = function(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `PAT-${timestamp}-${random}`.toUpperCase();
};

export const Patient = mongoose.model<IPatientDocument>('Patient', PatientSchema);
export default Patient;

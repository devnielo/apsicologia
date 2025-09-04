import type { ObjectId, ITimestamps, ISoftDelete, IAddress, IContact, IConsent } from './common.js';

export interface IPatient extends ITimestamps, ISoftDelete {
  _id: ObjectId;
  userId?: ObjectId;
  
  // Personal Information
  personalInfo: {
    firstName: string;
    lastName: string;
    fullName: string;
    dateOfBirth: Date;
    age: number;
    gender: 'male' | 'female' | 'non-binary' | 'other' | 'prefer-not-to-say';
    nationality?: string;
    idNumber?: string;
    idType?: 'dni' | 'nie' | 'passport' | 'other';
    maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed' | 'separated' | 'domestic-partner';
    occupation?: string;
    employer?: string;
    profilePicture?: string;
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
    primaryProfessional: ObjectId;
    assignedProfessionals: ObjectId[];
    medicalHistory: {
      conditions: string[];
      medications: {
        name: string;
        dosage: string;
        frequency: string;
        prescribedBy?: string;
        startDate: Date;
        endDate?: Date;
        active: boolean;
        notes?: string;
      }[];
      allergies: {
        type: 'medication' | 'food' | 'environmental' | 'other';
        allergen: string;
        severity: 'mild' | 'moderate' | 'severe';
        reaction: string;
        notes?: string;
      }[];
      surgeries: {
        procedure: string;
        date: Date;
        hospital?: string;
        surgeon?: string;
        notes?: string;
      }[];
      hospitalizations: {
        reason: string;
        admissionDate: Date;
        dischargeDate?: Date;
        hospital: string;
        notes?: string;
      }[];
    };
    mentalHealthHistory: {
      previousTreatments: {
        type: 'therapy' | 'medication' | 'hospitalization' | 'other';
        provider?: string;
        startDate: Date;
        endDate?: Date;
        reason: string;
        outcome?: string;
        notes?: string;
      }[];
      diagnoses: {
        condition: string;
        diagnosedBy?: string;
        diagnosisDate: Date;
        icdCode?: string;
        status: 'active' | 'resolved' | 'in-remission' | 'chronic';
        severity?: 'mild' | 'moderate' | 'severe';
        notes?: string;
      }[];
      riskFactors: {
        factor: string;
        level: 'low' | 'moderate' | 'high';
        notes?: string;
        assessedDate: Date;
        assessedBy: ObjectId;
      }[];
    };
    currentTreatment: {
      treatmentPlan?: string; // Rich text HTML content
      goals: string[];
      startDate: Date;
      expectedDuration?: string;
      frequency?: string;
      notes?: string;
    };
    // Rich text clinical notes
    clinicalNotes?: string; // HTML content for clinical observations
  };
  
  // Episodes
  episodes: {
    episodeId: string;
    title: string;
    description?: string;
    startDate: Date;
    endDate?: Date;
    status: 'active' | 'completed' | 'on-hold' | 'cancelled';
    primaryProfessional: ObjectId;
    treatmentType: string;
    goals: string[];
    outcome?: string;
    notes?: string;
    appointmentIds: ObjectId[];
  }[];
  
  // Billing
  billing: {
    paymentMethod: 'stripe' | 'cash';
    stripeCustomerId?: string;
    preferredPaymentMethod?: 'card' | 'cash';
    billingNotes?: string;
  };
  
  // Preferences
  preferences: {
    language: string;
    communicationPreferences: {
      appointmentReminders: boolean;
      reminderMethods: ('email' | 'sms' | 'phone' | 'push')[];
      reminderTiming: number[];
      newsletters: boolean;
      marketingCommunications: boolean;
    };
    appointmentPreferences: {
      preferredTimes: {
        day: string;
        startTime: string;
        endTime: string;
      }[];
      preferredProfessionals: ObjectId[];
      cancellationNotice: number;
      waitingListOptIn: boolean;
      notes?: string;
    };
    portalAccess: {
      enabled: boolean;
      lastLogin?: Date;
      passwordLastChanged?: Date;
      twoFactorEnabled: boolean;
      loginNotifications: boolean;
    };
  };
  
  // GDPR Consent
  gdprConsent: {
    dataProcessing: {
      consented: boolean;
      consentDate: Date;
      consentMethod: 'verbal' | 'written' | 'digital';
      consentVersion: string;
      witnessedBy?: ObjectId;
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
      processedBy?: ObjectId;
      retentionReason?: string;
      notes?: string;
    };
    dataPortability: {
      lastExportDate?: Date;
      exportFormat?: string;
      exportedBy?: ObjectId;
    };
  };
  
  // Signed Consent Documents (Global/Shared)
  signedConsentDocuments: {
    documentId: ObjectId;
    documentType: 'informed_consent' | 'treatment_agreement' | 'privacy_policy' | 'data_processing' | 'research_consent' | 'telehealth_consent' | 'minor_consent' | 'emergency_contact' | 'financial_agreement' | 'custom';
    documentTitle: string;
    signedDate: Date;
    signedBy: ObjectId;
    witnessedBy?: ObjectId;
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
  
  // Tags
  tags: {
    name: string;
    category: 'clinical' | 'administrative' | 'billing' | 'custom';
    color?: string;
    addedBy: ObjectId;
    addedDate: Date;
  }[];
  
  // Status
  status: 'active' | 'inactive' | 'discharged' | 'transferred' | 'deceased' | 'deleted';
  
  // Relationships
  relationships: {
    relatedPatientId: ObjectId;
    relationship: 'spouse' | 'child' | 'parent' | 'sibling' | 'guardian' | 'other';
    description?: string;
    canAccessInformation: boolean;
    emergencyContact: boolean;
  }[];
  
  // Referral
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
  
  // Statistics
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
  
  // Administrative Notes
  administrativeNotes: {
    noteId: string;
    content: string;
    category: 'general' | 'billing' | 'scheduling' | 'clinical' | 'behavior';
    isPrivate: boolean;
    addedBy: ObjectId;
    addedDate: Date;
    lastModified?: Date;
    lastModifiedBy?: ObjectId;
  }[];
  
  // Audit
  createdBy: ObjectId;
  lastModifiedBy?: ObjectId;
  version: number;
}

export interface IInsuranceInfo {
  provider: string;
  policyNumber: string;
  groupNumber?: string;
  memberName: string;
  expiryDate?: Date;
  copay?: number;
  coverage?: string;
}

export interface IPatientCreateInput {
  name: string;
  email: string;
  phone: string;
  birthDate?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  address?: IAddress;
  emergencyContact?: IContact;
  tags?: string[];
  newsletterOptIn?: boolean;
  notes?: string;
  allergies?: string[];
  medicalHistory?: string;
  currentMedications?: string[];
  insuranceInfo?: IInsuranceInfo;
  referredBy?: string;
  assignedProfessionalIds?: ObjectId[];
  language?: string;
  timezone?: string;
}

export interface IPatientUpdateInput {
  name?: string;
  email?: string;
  phone?: string;
  birthDate?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  address?: IAddress;
  emergencyContact?: IContact;
  tags?: string[];
  newsletterOptIn?: boolean;
  notes?: string;
  allergies?: string[];
  medicalHistory?: string;
  currentMedications?: string[];
  insuranceInfo?: IInsuranceInfo;
  referredBy?: string;
  status?: 'active' | 'inactive' | 'archived';
  assignedProfessionalIds?: ObjectId[];
  avatar?: string;
  language?: string;
  timezone?: string;
}

export interface IPatientSearchInput {
  query?: string;
  tags?: string[];
  status?: ('active' | 'inactive' | 'archived')[];
  professionalId?: ObjectId;
  ageRange?: {
    min?: number;
    max?: number;
  };
  gender?: ('male' | 'female' | 'other' | 'prefer_not_to_say')[];
  hasInsurance?: boolean;
  lastAppointmentFrom?: Date;
  lastAppointmentTo?: Date;
}

export interface IPatientStats {
  _id: ObjectId;
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  noShowAppointments: number;
  totalSpent: number;
  lastAppointmentAt?: Date;
  nextAppointmentAt?: Date;
  averageRating?: number;
  adherenceRate: number; // Percentage of completed vs scheduled appointments
}

export interface IPatientWithStats extends IPatient {
  stats: IPatientStats;
}

export interface IPatientPublic {
  _id: ObjectId;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'archived';
  createdAt: Date;
}

export interface IPatientPortalProfile {
  _id: ObjectId;
  name: string;
  email: string;
  phone: string;
  birthDate?: Date;
  address?: IAddress;
  emergencyContact?: IContact;
  avatar?: string;
  language: string;
  timezone: string;
  newsletterOptIn: boolean;
  consents: IConsent[];
  upcomingAppointments: number;
  totalAppointments: number;
  lastAppointmentAt?: Date;
}

export interface IPatientConsentUpdate {
  type: IConsent['type'];
  consented: boolean;
  version: string;
}

export interface IPatientExportData {
  profile: IPatient;
  appointments: any[]; // Will be defined in appointment types
  invoices: any[]; // Will be defined in invoice types
  notes: any[]; // Will be defined in note types
  files: any[]; // Will be defined in file types
  forms: any[]; // Will be defined in form types
  exportedAt: Date;
  exportedBy: ObjectId;
}

export interface IPatientMergeInput {
  primaryPatientId: ObjectId;
  secondaryPatientId: ObjectId;
  mergeStrategy: {
    profile: 'primary' | 'secondary' | 'merge';
    appointments: 'primary' | 'secondary' | 'merge';
    notes: 'primary' | 'secondary' | 'merge';
    files: 'primary' | 'secondary' | 'merge';
  };
}

export interface IPatientTag {
  name: string;
  color: string;
  description?: string;
  isSystem: boolean;
  createdAt: Date;
  usageCount: number;
}

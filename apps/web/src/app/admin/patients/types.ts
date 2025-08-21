export interface Address {
  street: string;
  city: string;
  postalCode: string;
  state?: string;
  country: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
}

export interface Insurance {
  providerName?: string;
  policyNumber?: string;
  groupNumber?: string;
  paymentMethod: 'insurance' | 'self-pay' | 'mixed';
  copay?: number;
  deductible?: number;
  coverageDetails?: string;
}

export interface MedicalHistory {
  conditions: string[];
  medications: string[];
  allergies: string[];
  surgeries: string[];
  familyHistory: string[];
  vaccinationRecord?: string[];
}

export interface Patient {
  id: string;
  userId?: string;
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
    profilePicture?: string;
    occupation?: string;
    maritalStatus?: string;
  };
  contactInfo: {
    email: string;
    phone: string;
    alternativePhone?: string;
    preferredContactMethod: 'phone' | 'email' | 'sms' | 'whatsapp';
    address: Address;
  };
  emergencyContact: EmergencyContact;
  clinicalInfo?: {
    primaryProfessional?: string;
    assignedProfessionals: string[];
    referredBy?: string;
    referralReason?: string;
    medicalHistory: MedicalHistory;
    presentingConcerns: string[];
    treatmentGoals: string[];
    riskAssessment?: {
      level: 'low' | 'medium' | 'high';
      factors: string[];
      lastAssessment: Date;
    };
    mentalStatusExam?: any;
    diagnoses: any[];
    currentMedications: any[];
    previousTreatments: any[];
    episodeOfCare: any[];
  };
  insurance: Insurance;
  preferences: {
    language: string;
    communicationPreferences: {
      appointmentReminders: boolean;
      emailUpdates: boolean;
      smsNotifications: boolean;
      marketingEmails: boolean;
    };
    accessibility: {
      wheelchairAccess: boolean;
      hearingImpairment: boolean;
      visualImpairment: boolean;
      other?: string;
    };
    sessionPreferences: {
      preferredDays: string[];
      preferredTimes: string[];
      sessionFormat: 'in-person' | 'virtual' | 'hybrid';
      sessionDuration: number;
    };
  };
  gdprConsents: {
    processingConsent: {
      given: boolean;
      date: Date;
      version: string;
    };
    marketingConsent: {
      given: boolean;
      date?: Date;
    };
    dataRetention: {
      acknowledged: boolean;
      retentionPeriod: number;
    };
  };
  tags: Array<{
    name: string;
    color: string;
    category: 'clinical' | 'administrative' | 'billing' | 'personal';
    createdBy: string;
    createdAt: Date;
  }>;
  status: 'active' | 'inactive' | 'discharged' | 'transferred' | 'deceased';
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  lastModifiedBy?: string;
  deletedAt?: Date;
}

export interface PatientFilters {
  search?: string;
  status?: string;
  gender?: string;
  professionalId?: string;
  ageRange?: [number, number];
  dateFrom?: Date;
  dateTo?: Date;
  tags?: string[];
}

export interface PatientFormData {
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth?: Date;
    gender: string;
    nationality?: string;
    idNumber?: string;
    idType?: string;
    occupation?: string;
    maritalStatus?: string;
  };
  contactInfo: {
    email: string;
    phone: string;
    alternativePhone?: string;
    preferredContactMethod: string;
    address: {
      street: string;
      city: string;
      postalCode: string;
      state?: string;
      country: string;
    };
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  clinicalInfo?: {
    primaryProfessional?: string;
    referredBy?: string;
    referralReason?: string;
    presentingConcerns?: string[];
    treatmentGoals?: string[];
    medicalHistory?: {
      conditions?: string[];
      medications?: string[];
      allergies?: string[];
    };
  };
  preferences?: {
    language?: string;
    sessionPreferences?: {
      preferredDays?: string[];
      sessionFormat?: string;
      sessionDuration?: number;
    };
  };
  insurance?: {
    paymentMethod: string;
    providerName?: string;
    policyNumber?: string;
  };
  gdprConsents: {
    processingConsent: boolean;
    marketingConsent: boolean;
    dataRetention: boolean;
  };
  createUserAccount?: boolean;
}

export interface PatientsApiResponse {
  success: boolean;
  message: string;
  data: {
    patients: Patient[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  };
}

export interface PatientStats {
  total: number;
  active: number;
  inactive: number;
  newThisMonth: number;
}

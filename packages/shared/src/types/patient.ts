import type { ObjectId, ITimestamps, ISoftDelete, IAddress, IContact, IConsent } from './common.js';

export interface IPatient extends ITimestamps, ISoftDelete {
  _id: ObjectId;
  name: string;
  email: string;
  phone: string;
  birthDate?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  address?: IAddress;
  emergencyContact?: IContact;
  tags: string[];
  consents: IConsent[];
  newsletterOptIn: boolean;
  notes?: string;
  allergies?: string[];
  medicalHistory?: string;
  currentMedications?: string[];
  insuranceInfo?: IInsuranceInfo;
  referredBy?: string;
  status: 'active' | 'inactive' | 'archived';
  lastAppointmentAt?: Date;
  totalAppointments: number;
  assignedProfessionalIds: ObjectId[];
  avatar?: string;
  language: string;
  timezone: string;
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

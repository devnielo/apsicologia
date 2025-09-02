import type { ObjectId, ITimestamps, ISoftDelete, FileOwnerType } from './common.js';

export interface IFile extends ITimestamps, ISoftDelete {
  _id: ObjectId;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  url?: string;
  ownerType: FileOwnerType;
  ownerId: ObjectId;
  uploadedBy: ObjectId;
  isPublic: boolean;
  description?: string;
  tags: string[];
  metadata?: Record<string, any>;
  checksum?: string;
  downloadCount: number;
  lastDownloadedAt?: Date;
  expiresAt?: Date;
  
  // Digital signature information
  digitalSignature?: {
    isSigned: boolean;
    signedBy?: ObjectId;
    signedAt?: Date;
    signatureData?: string;
    certificateInfo?: any;
    
    // Global consent document properties
    isGlobalConsent: boolean;
    consentType?: 'informed_consent' | 'treatment_agreement' | 'privacy_policy' | 'data_processing' | 'research_consent' | 'telehealth_consent' | 'minor_consent' | 'emergency_contact' | 'financial_agreement' | 'custom';
    documentVersion?: string;
    isTemplate: boolean;
    templateId?: ObjectId;
    
    // Signature validation
    signatureMethod: 'digital' | 'physical' | 'verbal';
    witnessedBy?: ObjectId;
    signatureLocation?: string;
    signatureDevice?: string;
    ipAddress?: string;
    
    // Expiration and validity
    expiresAt?: Date;
    isActive: boolean;
    revokedAt?: Date;
    revokedBy?: ObjectId;
    revocationReason?: string;
  };
}

export interface IFileUpload {
  file: File;
  ownerType: FileOwnerType;
  ownerId: ObjectId;
  description?: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface IPresignedUrl {
  url: string;
  fields: Record<string, string>;
  fileId: ObjectId;
  expiresAt: Date;
}

// Signed consent document types
export interface ISignedConsentDocument {
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
}

export interface ISignedConsentInput {
  documentId: ObjectId;
  documentType: 'informed_consent' | 'treatment_agreement' | 'privacy_policy' | 'data_processing' | 'research_consent' | 'telehealth_consent' | 'minor_consent' | 'emergency_contact' | 'financial_agreement' | 'custom';
  documentTitle: string;
  signatureMethod: 'digital' | 'physical' | 'verbal';
  witnessedBy?: ObjectId;
  notes?: string;
}

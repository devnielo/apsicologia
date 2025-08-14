import type { ObjectId, ITimestamps, ISoftDelete } from './common.js';

export interface IForm extends ITimestamps, ISoftDelete {
  _id: ObjectId;
  name: string;
  description?: string;
  jsonSchema: Record<string, any>;
  uiSchema?: Record<string, any>;
  isActive: boolean;
  isPublic: boolean;
  requiresAuth: boolean;
  professionalIds?: ObjectId[];
  serviceIds?: ObjectId[];
  version: number;
  tags: string[];
  instructions?: string;
  thankYouMessage?: string;
  redirectUrl?: string;
  emailNotifications: boolean;
  notificationEmails?: string[];
  allowAnonymous: boolean;
  expiresAt?: Date;
  maxResponses?: number;
  totalResponses: number;
}

export interface IFormResponse extends ITimestamps {
  _id: ObjectId;
  formId: ObjectId;
  patientId?: ObjectId;
  appointmentId?: ObjectId;
  answers: Record<string, any>;
  submittedAt: Date;
  submittedBy?: ObjectId;
  ipAddress?: string;
  userAgent?: string;
  isAnonymous: boolean;
  isComplete: boolean;
  reviewedAt?: Date;
  reviewedBy?: ObjectId;
  notes?: string;
}

export interface IFormCreateInput {
  name: string;
  description?: string;
  jsonSchema: Record<string, any>;
  uiSchema?: Record<string, any>;
  isPublic?: boolean;
  requiresAuth?: boolean;
  professionalIds?: ObjectId[];
  serviceIds?: ObjectId[];
  tags?: string[];
  instructions?: string;
  thankYouMessage?: string;
  redirectUrl?: string;
  emailNotifications?: boolean;
  notificationEmails?: string[];
  allowAnonymous?: boolean;
  expiresAt?: Date;
  maxResponses?: number;
}

import type { ObjectId, ITimestamps, ISoftDelete } from './common.js';

export interface INote extends ITimestamps, ISoftDelete {
  _id: ObjectId;
  patientId: ObjectId;
  professionalId: ObjectId;
  appointmentId?: ObjectId;
  title?: string;
  content: string;
  contentJSON?: Record<string, any>; // Tiptap JSON format
  type: 'session' | 'treatment' | 'assessment' | 'general';
  isLocked: boolean;
  lockedAt?: Date;
  lockedBy?: ObjectId;
  isSigned: boolean;
  signedAt?: Date;
  signature?: string;
  version: number;
  versions: INoteVersion[];
  tags: string[];
  attachments: ObjectId[];
  templateId?: ObjectId;
  isTemplate: boolean;
  visibility: 'private' | 'team' | 'patient';
}

export interface INoteVersion {
  version: number;
  content: string;
  contentJSON?: Record<string, any>;
  changedAt: Date;
  changedBy: ObjectId;
  changeReason?: string;
}

export interface INoteTemplate extends ITimestamps {
  _id: ObjectId;
  name: string;
  description?: string;
  content: string;
  contentJSON?: Record<string, any>;
  type: 'session' | 'treatment' | 'assessment' | 'general';
  professionalId?: ObjectId;
  isGlobal: boolean;
  tags: string[];
  usageCount: number;
}

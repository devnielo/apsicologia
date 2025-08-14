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

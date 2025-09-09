export interface StorageService {
  bucketName?: string;
  uploadFile(filePath: string, buffer: Buffer, metadata?: Record<string, any>): Promise<string>;
  deleteFile(filePath: string): Promise<void>;
  getFileUrl(filePath: string): Promise<string>;
  generatePresignedUrl(filePath: string, expiresIn?: number): Promise<string>;
  initializeBucket?(): Promise<void>;
  healthCheck?(): Promise<boolean>;
}

export interface FileUploadResult {
  url: string;
  filePath: string;
  size: number;
  mimeType: string;
}

export interface StorageConfig {
  type: 'cloudflare-r2';
  bucket: string;
  publicUrl?: string;
}

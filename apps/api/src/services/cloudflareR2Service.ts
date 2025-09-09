import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { StorageService } from '../types/storage';
import logger from '../config/logger';

export class CloudflareR2Service implements StorageService {
  private client: S3Client | null = null;
  public bucketName: string;
  private publicUrl: string;

  constructor() {
    this.bucketName = process.env.CLOUDFLARE_R2_BUCKET || 'apsicologia-files';
    this.publicUrl = process.env.CLOUDFLARE_R2_PUBLIC_URL || '';

    // Initialize Cloudflare R2 client
    if (this.isCloudflareConfigured()) {
      this.client = new S3Client({
        region: 'auto', // Cloudflare R2 uses 'auto' region
        endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
        credentials: {
          accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY!,
          secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_KEY!,
        },
        forcePathStyle: true,
      });
      logger.info('Cloudflare R2 client initialized successfully');
    } else {
      logger.error('Cloudflare R2 not configured. Please set CLOUDFLARE_R2_ACCESS_KEY, CLOUDFLARE_R2_SECRET_KEY, and CLOUDFLARE_R2_ENDPOINT environment variables.');
    }
  }

  private isCloudflareConfigured(): boolean {
    return !!(
      process.env.CLOUDFLARE_R2_ACCESS_KEY &&
      process.env.CLOUDFLARE_R2_SECRET_KEY &&
      process.env.CLOUDFLARE_R2_ENDPOINT
    );
  }

  async uploadFile(filePath: string, buffer: Buffer, metadata?: any): Promise<string> {
    if (!this.client) {
      throw new Error('Cloudflare R2 not configured. Please set the required environment variables.');
    }

    const contentType = metadata?.['Content-Type'] || 'application/octet-stream';
    const sanitizedMetadata = metadata ? this.sanitizeMetadata(metadata) : {};

    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: filePath,
      Body: buffer,
      ContentType: contentType,
      Metadata: sanitizedMetadata,
    });

    try {
      await this.client.send(command);
      
      // Return the public URL or presigned URL
      if (this.publicUrl) {
        return `${this.publicUrl}/${filePath}`;
      }
      
      // If no public URL is configured, return a presigned URL
      return await this.generatePresignedUrl(filePath);
    } catch (error) {
      logger.error('Failed to upload file to Cloudflare R2:', error);
      throw new Error(`File upload failed: ${(error as Error).message}`);
    }
  }

  async deleteFile(filePath: string): Promise<void> {
    if (!this.client) {
      throw new Error('Cloudflare R2 not configured. Please set the required environment variables.');
    }

    const command = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: filePath,
    });

    try {
      await this.client.send(command);
      logger.info(`File deleted successfully from Cloudflare R2: ${filePath}`);
    } catch (error) {
      logger.error('Failed to delete file from Cloudflare R2:', error);
      throw new Error(`File deletion failed: ${(error as Error).message}`);
    }
  }

  async getFileUrl(filePath: string): Promise<string> {
    if (this.publicUrl) {
      return `${this.publicUrl}/${filePath}`;
    }
    
    // If no public URL configured, return presigned URL
    return await this.generatePresignedUrl(filePath);
  }

  async generatePresignedUrl(filePath: string, expiresIn: number = 3600): Promise<string> {
    if (!this.client) {
      throw new Error('Cloudflare R2 not configured. Please set the required environment variables.');
    }

    const command = new GetObjectCommand({
      Bucket: this.bucketName,
      Key: filePath,
    });

    try {
      const signedUrl = await getSignedUrl(this.client, command, { expiresIn });
      return signedUrl;
    } catch (error) {
      logger.error('Failed to generate presigned URL:', error);
      throw new Error(`Presigned URL generation failed: ${(error as Error).message}`);
    }
  }

  private sanitizeMetadata(metadata: Record<string, any>): Record<string, string> {
    const sanitized: Record<string, string> = {};
    
    Object.entries(metadata).forEach(([key, value]) => {
      // Remove Content-Type from metadata (it's handled separately)
      if (key.toLowerCase() !== 'content-type') {
        sanitized[key] = String(value);
      }
    });
    
    return sanitized;
  }

  // Health check method
  async healthCheck(): Promise<boolean> {
    if (!this.client) {
      return false;
    }

    try {
      // Try to access bucket with a non-existent file (minimal operation)
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: 'health-check-non-existent-file',
      });

      await this.client.send(command);
      return true;
    } catch (error) {
      // 404 is expected for health check file, other errors indicate problems
      return (error as any)?.name === 'NoSuchKey' || (error as any)?.$metadata?.httpStatusCode === 404;
    }
  }
}

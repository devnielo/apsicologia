import { CloudflareR2Service } from './cloudflareR2Service';
import { StorageService } from '../types/storage';
import logger from '../config/logger';

// Main storage service - wraps CloudflareR2Service with backward compatibility
class StorageServiceWrapper {
  private storageService: StorageService;

  constructor() {
    this.storageService = new CloudflareR2Service();
    logger.info('Storage service initialized (Cloudflare R2)');
  }

  async uploadServiceImage(
    serviceId: string,
    buffer: Buffer,
    originalName: string,
    mimeType: string
  ): Promise<string> {
    try {
      const timestamp = Date.now();
      const extension = originalName.split('.').pop() || 'jpg';
      const fileName = `service-${serviceId}-${timestamp}.${extension}`;
      const filePath = `services/${fileName}`;

      const metadata = {
        'Content-Type': mimeType,
        'X-Service-Id': serviceId,
        'X-Upload-Date': new Date().toISOString(),
        'X-Original-Name': originalName
      };

      const imageUrl = await this.storageService.uploadFile(filePath, buffer, metadata);
      
      logger.info(`Image uploaded successfully: ${imageUrl}`);
      return imageUrl;
    } catch (error) {
      logger.error('Failed to upload service image:', error);
      throw error;
    }
  }

  async deleteServiceImage(imageUrl: string): Promise<boolean> {
    try {
      // Extract file path from URL
      const urlParts = imageUrl.split('/');
      const filePath = urlParts.slice(-2).join('/'); // e.g., "services/service-123-timestamp.jpg"

      await this.storageService.deleteFile(filePath);
      logger.info(`Image deleted successfully: ${filePath}`);
      return true;
    } catch (error) {
      logger.error('Failed to delete service image:', error);
      return false;
    }
  }

  async getPresignedUrl(filePath: string, expiry: number = 24 * 60 * 60): Promise<string> {
    try {
      return await this.storageService.generatePresignedUrl(filePath, expiry);
    } catch (error) {
      logger.error('Failed to generate presigned URL:', error);
      throw error;
    }
  }

  // Additional methods required by file.controller.ts
  async initializeBucket(): Promise<void> {
    if (this.storageService.initializeBucket) {
      await this.storageService.initializeBucket();
    }
  }

  async uploadFile(filePath: string, buffer: Buffer, metadata?: any): Promise<string> {
    return await this.storageService.uploadFile(filePath, buffer, metadata);
  }

  async deleteFile(filePath: string): Promise<void> {
    await this.storageService.deleteFile(filePath);
  }

  getProvider(): string {
    return 'cloudflare-r2';
  }

  getBucketName(): string {
    return this.storageService.bucketName || 'apsicologia-files';
  }

  // Health check method
  async healthCheck(): Promise<{ status: string; storage: string }> {
    try {
      const isHealthy = await this.storageService.healthCheck?.() ?? false;
      return {
        status: isHealthy ? 'healthy' : 'unhealthy',
        storage: 'cloudflare-r2'
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        storage: 'cloudflare-r2'
      };
    }
  }
}

// Export singleton instance
export default new StorageServiceWrapper();

// Also export the new service directly
export { CloudflareR2Service, StorageServiceWrapper };

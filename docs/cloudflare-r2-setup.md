# Cloudflare R2 Storage Configuration

## Overview
This document covers the complete setup and configuration of Cloudflare R2 for file storage in the apsicologia platform.

## Why Cloudflare R2?

- **Cost Effective**: No egress fees (free data transfer out)
- **Performance**: Global CDN included
- **S3 Compatible**: Easy migration and familiar API
- **Security**: Built-in DDoS protection and encryption
- **GDPR Compliant**: EU data residency options

## Setup Guide

### 1. Cloudflare Account Setup

1. Sign up at [Cloudflare](https://cloudflare.com)
2. Navigate to R2 Object Storage
3. Create your first bucket: `apsicologia-files`

### 2. API Tokens

Create API token with permissions:
- R2:Edit for your account
- Zone:Read for your domain (if using custom domain)

### 3. Environment Variables

```bash
# Cloudflare R2 Configuration
CLOUDFLARE_R2_ACCOUNT_ID=your-account-id
CLOUDFLARE_R2_ACCESS_KEY=your-access-key  
CLOUDFLARE_R2_SECRET_KEY=your-secret-key
CLOUDFLARE_R2_BUCKET=apsicologia-files
CLOUDFLARE_R2_ENDPOINT=https://your-account-id.r2.cloudflarestorage.com
CLOUDFLARE_R2_PUBLIC_URL=https://files.yourdomain.com

# File Storage Type
FILE_STORAGE_TYPE=cloudflare-r2
```

### 4. Custom Domain (Optional but Recommended)

1. Add CNAME record: `files.yourdomain.com` → `your-bucket.your-account-id.r2.cloudflarestorage.com`
2. Enable R2 custom domain in Cloudflare dashboard
3. Update `CLOUDFLARE_R2_PUBLIC_URL` to your custom domain

## Implementation

### Service Class Structure

```typescript
class CloudflareR2Service implements StorageService {
  private client: S3Client;
  private bucketName: string;
  private publicUrl: string;

  async uploadFile(filePath: string, buffer: Buffer, metadata?: any): Promise<string>
  async deleteFile(filePath: string): Promise<void>
  async getFileUrl(filePath: string): Promise<string>
  async generatePresignedUrl(filePath: string, expiresIn: number): Promise<string>
}
```

### Integration Points

- **Image uploads** in Services module
- **Profile pictures** for users/professionals  
- **Document storage** for patient files
- **Audit logs** attachments

## Security Features

- Automatic HTTPS enforcement
- Built-in DDoS protection
- Server-side encryption (AES-256)
- Access control via Cloudflare Access (optional)
- Audit logging for all operations

## Monitoring & Analytics

- Real-time analytics in Cloudflare dashboard
- Usage metrics and billing insights
- Performance monitoring
- Error tracking and alerting

## Cost Estimation

For typical psychology practice:
- Storage: ~10GB = $0.15/month
- Requests: ~100K operations = $0.45/month
- **Total: ~$0.60/month** (vs $15-30 with AWS S3)

## Deployment Configurations

### Local Development
- Uses local storage fallback
- R2 credentials optional for development

### Vercel Production  
- Environment variables in Vercel dashboard
- Automatic deployments with R2 integration
- Edge function optimization

### Self-Hosted Production
- Docker environment variables
- Health checks for R2 connectivity
- Automatic failover to local storage

## Migration Checklist

- [ ] Create Cloudflare R2 bucket
- [ ] Generate API credentials
- [ ] Update environment variables
- [ ] Deploy updated code
- [ ] Test file uploads
- [ ] Migrate existing files (if any)
- [ ] Update DNS records (custom domain)
- [ ] Monitor for 24 hours

## Troubleshooting

### Common Issues

**Connection errors**: Check account ID and credentials
**Upload failures**: Verify bucket permissions  
**404 errors**: Confirm public URL configuration
**CORS issues**: Update Cloudflare CORS settings

### Health Checks

```bash
# Test R2 connectivity
curl -X GET "https://your-account-id.r2.cloudflarestorage.com/your-bucket"

# Test file upload via API
curl -X POST "http://localhost:3001/api/upload" \
  -H "Authorization: Bearer your-jwt" \
  -F "file=@test.jpg"
```

## Best Practices

1. **Naming Convention**: Use consistent file naming
2. **Metadata**: Include relevant metadata for tracking
3. **Cleanup**: Implement automatic cleanup of old files
4. **Backup**: Consider periodic backups for critical files
5. **Monitoring**: Set up alerts for unusual usage patterns

## Support Resources

- [Cloudflare R2 Docs](https://developers.cloudflare.com/r2/)
- [S3 API Compatibility](https://developers.cloudflare.com/r2/api/s3/)
- [Pricing Calculator](https://developers.cloudflare.com/r2/pricing/)

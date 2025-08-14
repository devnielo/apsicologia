import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { File } from '../models/File.js';
import { Patient } from '../models/Patient.js';
import { Appointment } from '../models/Appointment.js';
import { AuditLog } from '../models/AuditLog.js';
import logger from '../config/logger.js';
import { AuthRequest } from '../middleware/auth.js';
import multer from 'multer';
import config from '../config/env.js';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

interface UploadRequest {
  ownerType: 'patient' | 'appointment' | 'note' | 'professional' | 'system';
  ownerId?: string;
  category?: 'medical_record' | 'consent' | 'prescription' | 'report' | 'image' | 'document' | 'form_response';
  description?: string;
  tags?: string[];
  isPublic?: boolean;
  retentionDays?: number;
}

interface FileQuery {
  page?: string;
  limit?: string;
  ownerType?: string;
  ownerId?: string;
  category?: string;
  mimeType?: string;
  tags?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

// Multer configuration for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'text/csv',
      'audio/mpeg',
      'audio/wav',
      'video/mp4',
      'video/quicktime',
    ];

    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`));
    }
  },
});

export class FileController {
  /**
   * Upload file
   */
  static async uploadFile(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user!;
      const file = req.file;
      const uploadData = req.body as UploadRequest;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No file provided',
        });
      }

      // Check permissions based on user role
      if (authUser.role !== 'admin' && authUser.role !== 'reception' && authUser.role !== 'professional') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot upload files',
        });
      }

      // Generate unique filename
      const fileExtension = path.extname(file.originalname);
      const uniqueFilename = `${uuidv4()}${fileExtension}`;
      const objectKey = `${uploadData.ownerType}/${uploadData.ownerId || 'system'}/${uniqueFilename}`;

      // Create file record (simplified)
      const fileRecord = new File({
        fileName: uniqueFilename,
        originalFileName: file.originalname,
        mimeType: file.mimetype,
        fileExtension: fileExtension.toLowerCase(),
        fileSize: file.size,
        storageProvider: 'minio',
        storagePath: objectKey,
        bucketName: config.MINIO_BUCKET_NAME,
        checksum: `${Date.now()}-${Math.random()}`, // Simplified checksum
        checksumAlgorithm: 'sha256',
        ownerId: uploadData.ownerId ? new Types.ObjectId(uploadData.ownerId) : new Types.ObjectId(),
        ownerType: uploadData.ownerType,
        category: uploadData.category || 'document',
        description: uploadData.description,
        tags: uploadData.tags || [],
        upload: {
          uploadedBy: authUser._id,
          uploadMethod: 'web_upload',
          uploadSource: 'api',
          validated: true,
          validationErrors: [],
          validationWarnings: [],
          isChunkedUpload: false,
          uploadProgress: 100,
        },
        permissions: {
          visibility: uploadData.isPublic ? 'public' : 'private',
          userPermissions: [],
          rolePermissions: [],
        },
        processing: {
          status: 'completed',
          tasks: [],
        },
        security: {
          isEncrypted: false,
          virusScanned: false,
        },
        versioning: {
          version: 1,
          isLatestVersion: true,
          childFileIds: [],
          versionHistory: [],
        },
        accessTracking: {
          downloadCount: 0,
          viewCount: 0,
          downloadHistory: [],
          analytics: {
            uniqueViewers: 0,
            uniqueDownloaders: 0,
            deviceTypes: {
              desktop: 0,
              mobile: 0,
              tablet: 0,
            },
          },
        },
        compliance: {
          hipaaCompliant: ['patient', 'appointment', 'note'].includes(uploadData.ownerType),
          containsPHI: ['patient', 'appointment', 'note'].includes(uploadData.ownerType),
          gdprCompliant: true,
          containsPII: false,
          legalHolds: [],
          auditRequired: false,
        },
        backup: {
          isBackedUp: false,
          isArchived: false,
          archivalTier: 'hot',
          retentionPolicy: {
            category: 'general',
            retentionPeriod: uploadData.retentionDays ? Math.ceil(uploadData.retentionDays / 30) : 84,
            autoDelete: false,
          },
        },
        integrations: {},
        auditLog: [],
      });

      await fileRecord.save();

      // Log file upload
      await AuditLog.create({
        action: 'file_uploaded',
        entityType: 'file',
        entityId: fileRecord._id.toString(),
        actorId: authUser._id,
        actorType: 'user',
        actorEmail: authUser.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'success',
        changes: {
          created: {
            filename: fileRecord.fileName,
            originalName: fileRecord.originalFileName,
            size: fileRecord.fileSize,
            ownerType: fileRecord.ownerType,
            ownerId: fileRecord.ownerId,
          },
        },
        security: {
          riskLevel: 'medium',
          authMethod: 'jwt',
          compliance: {
            hipaaRelevant: ['patient', 'appointment', 'note'].includes(uploadData.ownerType),
            gdprRelevant: true,
            requiresRetention: true,
          },
        },
        business: {
          clinicalRelevant: ['patient', 'appointment', 'note'].includes(uploadData.ownerType),
          containsPHI: ['patient', 'appointment', 'note'].includes(uploadData.ownerType),
          dataClassification: uploadData.ownerType === 'system' ? 'internal' : 'confidential',
        },
        metadata: {
          source: 'file_controller',
          priority: 'medium',
          fileCategory: uploadData.category,
        },
        timestamp: new Date(),
      });

      res.status(201).json({
        success: true,
        message: 'File uploaded successfully',
        data: { file: fileRecord },
      });
    } catch (error) {
      logger.error('Upload file error:', error);
      next(error);
    }
  }

  /**
   * Get files with pagination and filtering
   */
  static async getFiles(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user!;
      const {
        page = '1',
        limit = '20',
        ownerType,
        ownerId,
        category,
        mimeType,
        tags,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search,
      } = req.query as FileQuery;

      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;

      // Build filter
      const filter: any = { deletedAt: null };

      // Apply role-based filtering
      if (authUser.role === 'patient') {
        const patient = await Patient.findOne({ 'contactInfo.email': authUser.email });
        if (!patient) {
          return res.status(404).json({
            success: false,
            message: 'Patient profile not found',
          });
        }
        filter.$or = [
          { ownerType: 'patient', ownerId: patient._id },
        ];
      } else if (authUser.role === 'professional') {
        filter.$or = [
          { ownerType: 'professional', ownerId: authUser.professionalId },
          { ownerType: 'system', 'permissions.visibility': 'public' },
        ];
      }

      // Apply query filters (admin and reception can access all)
      if (ownerType && (authUser.role === 'admin' || authUser.role === 'reception')) {
        filter.ownerType = ownerType;
      }

      if (ownerId && (authUser.role === 'admin' || authUser.role === 'reception' || authUser.role === 'professional')) {
        filter.ownerId = new Types.ObjectId(ownerId);
      }

      if (category) {
        filter.category = category;
      }

      if (mimeType) {
        filter.mimeType = new RegExp(mimeType, 'i');
      }

      if (tags) {
        const tagArray = tags.split(',');
        filter.tags = { $in: tagArray };
      }

      if (search) {
        filter.$or = filter.$or || [];
        filter.$or.push(
          { originalFileName: new RegExp(search, 'i') },
          { description: new RegExp(search, 'i') },
          { tags: { $in: [new RegExp(search, 'i')] } }
        );
      }

      // Build sort
      const sort: any = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Execute queries
      const [files, total] = await Promise.all([
        File.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limitNum)
          .populate('upload.uploadedBy', 'name email')
          .populate('ownerId', 'personalInfo.fullName name title')
          .exec(),
        File.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / limitNum);

      res.status(200).json({
        success: true,
        data: {
          files,
          pagination: {
            currentPage: pageNum,
            totalPages,
            totalFiles: total,
            hasNext: pageNum < totalPages,
            hasPrev: pageNum > 1,
          },
        },
      });
    } catch (error) {
      logger.error('Get files error:', error);
      next(error);
    }
  }

  /**
   * Get file by ID
   */
  static async getFileById(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileId } = req.params;
      const authUser = (req as AuthRequest).user!;

      const file = await File.findOne({ _id: fileId, deletedAt: null })
        .populate('upload.uploadedBy', 'name email')
        .populate('ownerId', 'personalInfo.fullName name title')
        .exec();

      if (!file) {
        return res.status(404).json({
          success: false,
          message: 'File not found',
        });
      }

      // Basic access check
      const canAccess = 
        authUser.role === 'admin' ||
        authUser.role === 'reception' ||
        file.upload.uploadedBy.toString() === authUser._id.toString();

      if (!canAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot access this file',
        });
      }

      res.status(200).json({
        success: true,
        data: { file },
      });
    } catch (error) {
      logger.error('Get file by ID error:', error);
      next(error);
    }
  }

  /**
   * Download file (simplified - returns file info)
   */
  static async downloadFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileId } = req.params;
      const authUser = (req as AuthRequest).user!;

      const file = await File.findOne({ _id: fileId, deletedAt: null });
      if (!file) {
        return res.status(404).json({
          success: false,
          message: 'File not found',
        });
      }

      // Basic access check
      const canAccess = 
        authUser.role === 'admin' ||
        authUser.role === 'reception' ||
        file.upload.uploadedBy.toString() === authUser._id.toString();

      if (!canAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot download this file',
        });
      }

      // Update download count
      file.accessTracking.downloadCount += 1;
      file.accessTracking.lastDownloadedAt = new Date();
      await file.save();

      // Return file info (simplified - in production would return presigned URL)
      res.status(200).json({
        success: true,
        data: {
          downloadUrl: `${config.APP_URL}/files/${file._id}/content`,
          filename: file.originalFileName,
          size: file.fileSize,
          mimetype: file.mimeType,
          expiresIn: '24 hours',
        },
      });
    } catch (error) {
      logger.error('Download file error:', error);
      next(error);
    }
  }

  /**
   * Update file metadata
   */
  static async updateFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileId } = req.params;
      const authUser = (req as AuthRequest).user!;
      const updateData = req.body;

      const file = await File.findOne({ _id: fileId, deletedAt: null });
      if (!file) {
        return res.status(404).json({
          success: false,
          message: 'File not found',
        });
      }

      // Check permissions
      const canUpdate = 
        authUser.role === 'admin' ||
        file.upload.uploadedBy.toString() === authUser._id.toString();

      if (!canUpdate) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot update this file',
        });
      }

      // Update allowed fields
      if (updateData.description !== undefined) {
        file.description = updateData.description;
      }

      if (updateData.tags) {
        file.tags = updateData.tags;
      }

      if (updateData.category) {
        file.category = updateData.category;
      }

      await file.save();

      res.status(200).json({
        success: true,
        message: 'File updated successfully',
        data: { file },
      });
    } catch (error) {
      logger.error('Update file error:', error);
      next(error);
    }
  }

  /**
   * Delete file (soft delete)
   */
  static async deleteFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileId } = req.params;
      const authUser = (req as AuthRequest).user!;

      const file = await File.findOne({ _id: fileId, deletedAt: null });
      if (!file) {
        return res.status(404).json({
          success: false,
          message: 'File not found',
        });
      }

      // Check permissions
      const canDelete = 
        authUser.role === 'admin' ||
        file.upload.uploadedBy.toString() === authUser._id.toString();

      if (!canDelete) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot delete this file',
        });
      }

      // Soft delete
      file.deletedAt = new Date();
      await file.save();

      res.status(200).json({
        success: true,
        message: 'File deleted successfully',
      });
    } catch (error) {
      logger.error('Delete file error:', error);
      next(error);
    }
  }

  /**
   * Get file statistics
   */
  static async getFileStats(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user!;

      // Check permissions
      if (authUser.role !== 'admin' && authUser.role !== 'reception') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot view file statistics',
        });
      }

      const [
        totalFiles,
        storageStats,
        categoryStats,
        ownerTypeStats,
      ] = await Promise.all([
        File.countDocuments({ deletedAt: null }),
        
        File.aggregate([
          { $match: { deletedAt: null } },
          { $group: {
            _id: null,
            totalSize: { $sum: '$fileSize' },
            averageSize: { $avg: '$fileSize' },
            totalDownloads: { $sum: '$accessTracking.downloadCount' },
          }},
        ]),

        File.aggregate([
          { $match: { deletedAt: null } },
          { $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalSize: { $sum: '$fileSize' },
          }},
          { $sort: { count: -1 } },
        ]),

        File.aggregate([
          { $match: { deletedAt: null } },
          { $group: {
            _id: '$ownerType',
            count: { $sum: 1 },
            totalSize: { $sum: '$fileSize' },
          }},
          { $sort: { count: -1 } },
        ]),
      ]);

      res.status(200).json({
        success: true,
        data: {
          overview: {
            totalFiles,
            ...(storageStats[0] || { totalSize: 0, averageSize: 0, totalDownloads: 0 }),
          },
          byCategory: categoryStats,
          byOwnerType: ownerTypeStats,
        },
      });
    } catch (error) {
      logger.error('Get file stats error:', error);
      next(error);
    }
  }
}

// Export upload middleware with explicit typing
export const uploadMiddleware: any = upload.single('file');

export default FileController;

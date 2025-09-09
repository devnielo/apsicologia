import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { File } from '../models/File.js';
import { Patient } from '../models/Patient.js';
import { Appointment } from '../models/Appointment.js';
import { Note } from '../models/Note.js';
import { AuditLog } from '../models/AuditLog.js';
import logger from '../config/logger.js';
import { AuthRequest } from '../middleware/auth.js';
import multer from 'multer';
import storageService from '../services/storageService.js';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import sharp from 'sharp';

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
      'audio/x-wav',
      'video/mp4',
      'video/quicktime',
      'application/json',
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
   * Initialize storage bucket if not exists
   */
  static async initializeBucket() {
    try {
      await storageService.initializeBucket();
      logger.info('Storage bucket initialized successfully');
    } catch (error) {
      logger.error('Storage bucket initialization error:', error);
    }
  }

  /**
   * Generate file checksum
   */
  static generateChecksum(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Process image files (create thumbnails, optimize)
   */
  static async processImage(buffer: Buffer, mimeType: string): Promise<{
    original: Buffer;
    thumbnail?: Buffer;
    optimized?: Buffer;
  }> {
    try {
      if (!mimeType.startsWith('image/')) {
        return { original: buffer };
      }

      // Create thumbnail (200x200)
      const thumbnail = await sharp(buffer)
        .resize(200, 200, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();

      // Create optimized version (max 1920x1080)
      const optimized = await sharp(buffer)
        .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer();

      return {
        original: buffer,
        thumbnail,
        optimized,
      };
    } catch (error) {
      logger.error('Image processing error:', error);
      return { original: buffer };
    }
  }

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
      if (authUser.role === 'patient') {
        // Patients can only upload to their own records
        const patient = await Patient.findOne({ 'contactInfo.email': authUser.email });
        if (!patient || (uploadData.ownerId && uploadData.ownerId !== patient._id.toString())) {
          return res.status(403).json({
            success: false,
            message: 'Access denied: Can only upload to your own records',
          });
        }
        uploadData.ownerId = patient._id.toString();
        uploadData.ownerType = 'patient';
      } else if (authUser.role !== 'admin' && authUser.role !== 'reception' && authUser.role !== 'professional') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot upload files',
        });
      }

      // Validate owner exists
      if (uploadData.ownerId && uploadData.ownerType !== 'system') {
        let ownerExists = false;
        
        switch (uploadData.ownerType) {
          case 'patient':
            ownerExists = !!(await Patient.findById(uploadData.ownerId));
            break;
          case 'appointment':
            ownerExists = !!(await Appointment.findById(uploadData.ownerId));
            break;
          case 'note':
            ownerExists = !!(await Note.findById(uploadData.ownerId));
            break;
          case 'professional':
            // Would check Professional model when available
            ownerExists = true;
            break;
        }

        if (!ownerExists) {
          return res.status(404).json({
            success: false,
            message: `${uploadData.ownerType} not found`,
          });
        }
      }

      // Generate unique filename and paths
      const fileExtension = path.extname(file.originalname).toLowerCase();
      const uniqueFilename = `${uuidv4()}${fileExtension}`;
      const basePath = uploadData.isPublic ? 'public' : 'private';
      const objectKey = `${basePath}/${uploadData.ownerType}/${uploadData.ownerId || 'system'}/${uniqueFilename}`;
      
      // Generate checksum
      const checksum = FileController.generateChecksum(file.buffer);
      
      // Check for duplicate files
      const existingFile = await File.findOne({
        checksum,
        deletedAt: null,
      });

      if (existingFile) {
        return res.status(409).json({
          success: false,
          message: 'File already exists',
          data: { existingFile },
        });
      }

      // Process images
      const processedFiles = await FileController.processImage(file.buffer, file.mimetype);

      // Upload to storage
      const uploadPromises: Promise<any>[] = [];

      // Upload original file
      uploadPromises.push(
        storageService.uploadFile(objectKey, processedFiles.original, {
          contentType: file.mimetype,
          metadata: {
            originalName: file.originalname,
            uploadedBy: authUser._id.toString(),
            uploadDate: new Date().toISOString(),
          },
        })
      );

      // Upload thumbnail and optimized versions for images
      let thumbnailPath: string | undefined;
      let optimizedPath: string | undefined;

      if (processedFiles.thumbnail) {
        thumbnailPath = objectKey.replace(fileExtension, '_thumb.jpg');
        uploadPromises.push(
          storageService.uploadFile(thumbnailPath, processedFiles.thumbnail, {
            contentType: 'image/jpeg',
          })
        );
      }

      if (processedFiles.optimized && processedFiles.optimized.length < file.size * 0.8) {
        optimizedPath = objectKey.replace(fileExtension, '_opt.jpg');
        uploadPromises.push(
          storageService.uploadFile(optimizedPath, processedFiles.optimized, {
            contentType: 'image/jpeg',
          })
        );
      }

      // Wait for all uploads to complete
      await Promise.all(uploadPromises);

      // Create file record
      const fileRecord = new File({
        fileName: uniqueFilename,
        originalFileName: file.originalname,
        mimeType: file.mimetype,
        fileExtension: fileExtension,
        fileSize: file.size,
        storageProvider: storageService.getProvider(),
        storagePath: objectKey,
        bucketName: storageService.getBucketName(),
        checksum,
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
        mediaMetadata: {
          thumbnailPath,
          thumbnailUrl: thumbnailPath,
        },
        security: {
          isEncrypted: false,
          virusScanned: false,
          scanResults: {},
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
          lastDownloadedAt: undefined,
          lastViewedAt: undefined,
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
          auditRequired: ['patient', 'appointment', 'note'].includes(uploadData.ownerType),
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
        changes: [
          {
            field: 'filename',
            newValue: fileRecord.fileName,
            changeType: 'create'
          },
          {
            field: 'originalName',
            newValue: fileRecord.originalFileName,
            changeType: 'create'
          },
          {
            field: 'size',
            newValue: fileRecord.fileSize,
            changeType: 'create'
          },
          {
            field: 'ownerType',
            newValue: fileRecord.ownerType,
            changeType: 'create'
          },
          {
            field: 'ownerId',
            newValue: fileRecord.ownerId,
            changeType: 'create'
          },
          {
            field: 'checksum',
            newValue: fileRecord.checksum,
            changeType: 'create'
          }
        ],
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
          { ownerType: 'system', 'permissions.visibility': 'public' },
        ];
      } else if (authUser.role === 'professional') {
        // Professional can access their own files, patient files they're assigned to, and public files
        const professionalPatients = await Patient.find({
          $or: [
            { 'clinicalInfo.primaryProfessional': authUser.professionalId },
            { 'clinicalInfo.assignedProfessionals': authUser.professionalId },
          ],
          deletedAt: null,
        }).select('_id');
        
        const patientIds = professionalPatients.map(p => p._id);
        
        filter.$or = [
          { ownerType: 'professional', ownerId: authUser.professionalId },
          { ownerType: 'patient', ownerId: { $in: patientIds } },
          { ownerType: 'system', 'permissions.visibility': 'public' },
          { 'upload.uploadedBy': authUser._id },
        ];
      }
      // Admin and reception can access all files (no additional filter)

      // Apply query filters
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
        const tagArray = tags.split(',').map(tag => tag.trim());
        filter.tags = { $in: tagArray };
      }

      if (search) {
        filter.$and = filter.$and || [];
        filter.$and.push({
          $or: [
            { originalFileName: new RegExp(search, 'i') },
            { description: new RegExp(search, 'i') },
            { tags: { $in: [new RegExp(search, 'i')] } },
          ],
        });
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
          .select('-auditLog') // Exclude audit log for list view
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

      // Check access permissions
      let hasAccess = false;

      if (authUser.role === 'admin' || authUser.role === 'reception') {
        hasAccess = true;
      } else if (authUser.role === 'professional') {
        if (file.ownerType === 'professional' && file.ownerId.equals(authUser.professionalId!)) {
          hasAccess = true;
        } else if (file.ownerType === 'patient') {
          const patient = await Patient.findById(file.ownerId);
          if (patient) {
            hasAccess = (patient.clinicalInfo.assignedProfessionals?.includes(authUser.professionalId!) ?? false) ||
                       (patient.clinicalInfo.primaryProfessional?.equals(authUser.professionalId!) ?? false);
          }
        } else if (file.upload.uploadedBy.equals(authUser._id)) {
          hasAccess = true;
        }
      } else if (authUser.role === 'patient') {
        const patient = await Patient.findOne({ 'contactInfo.email': authUser.email });
        if (patient && file.ownerType === 'patient' && file.ownerId.equals(patient._id)) {
          hasAccess = true;
        }
      }

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot access this file',
        });
      }

      // Update view count
      file.accessTracking.viewCount += 1;
      file.accessTracking.lastViewedAt = new Date();
      await file.save();

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
   * Generate presigned URL for file download
   */
  static async getDownloadUrl(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileId } = req.params;
      const { type = 'original' } = req.query;
      const authUser = (req as AuthRequest).user!;

      const file = await File.findOne({ _id: fileId, deletedAt: null });
      if (!file) {
        return res.status(404).json({
          success: false,
          message: 'File not found',
        });
      }

      // Check access permissions (same logic as getFileById)
      let hasAccess = false;

      if (authUser.role === 'admin' || authUser.role === 'reception') {
        hasAccess = true;
      } else if (authUser.role === 'professional') {
        if (file.ownerType === 'professional' && file.ownerId.equals(authUser.professionalId!)) {
          hasAccess = true;
        } else if (file.ownerType === 'patient') {
          const patient = await Patient.findById(file.ownerId);
          if (patient) {
            hasAccess = (patient.clinicalInfo.assignedProfessionals?.includes(authUser.professionalId!) ?? false) ||
                       (patient.clinicalInfo.primaryProfessional?.equals(authUser.professionalId!) ?? false);
          }
        } else if (file.upload.uploadedBy.equals(authUser._id)) {
          hasAccess = true;
        }
      } else if (authUser.role === 'patient') {
        const patient = await Patient.findOne({ 'contactInfo.email': authUser.email });
        if (patient && file.ownerType === 'patient' && file.ownerId.equals(patient._id)) {
          hasAccess = true;
        }
      }

      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot download this file',
        });
      }

      // Determine which file version to download
      let objectPath = file.storagePath;
      if (type === 'thumbnail' && file.mediaMetadata?.thumbnailPath) {
        objectPath = file.mediaMetadata.thumbnailPath;
      } else if (type === 'optimized' && file.mediaMetadata?.thumbnailPath) {
        // Use thumbnail as optimized version for now
        objectPath = file.mediaMetadata.thumbnailPath;
      }

      // Generate presigned URL (valid for 1 hour)
      const presignedUrl = await storageService.getPresignedUrl(
        objectPath,
        3600 // 1 hour expiry
      );

      // Update download count
      file.accessTracking.downloadCount += 1;
      file.accessTracking.lastDownloadedAt = new Date();
      await file.save();

      res.status(200).json({
        success: true,
        data: {
          downloadUrl: presignedUrl,
          filename: file.originalFileName,
          size: file.fileSize,
          mimetype: file.mimeType,
          type,
          expiresIn: '1 hour',
        },
      });
    } catch (error) {
      logger.error('Get download URL error:', error);
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
        authUser.role === 'reception' ||
        file.upload.uploadedBy.toString() === authUser._id.toString();

      if (!canUpdate) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot update this file',
        });
      }

      // Store original data for audit
      const originalData = file.toObject();

      // Update allowed fields
      if (updateData.description !== undefined) {
        file.description = updateData.description;
      }

      if (updateData.tags) {
        file.tags = Array.isArray(updateData.tags) ? updateData.tags : [updateData.tags];
      }

      if (updateData.category) {
        file.category = updateData.category;
      }

      if (updateData.isPublic !== undefined && authUser.role === 'admin') {
        file.permissions.visibility = updateData.isPublic ? 'public' : 'private';
      }

      await file.save();

      // Log file update
      await AuditLog.create({
        action: 'file_updated',
        entityType: 'file',
        entityId: file._id.toString(),
        actorId: authUser._id,
        actorType: 'user',
        actorEmail: authUser.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'success',
        changes: Object.keys(updateData).map(field => ({
          field,
          oldValue: (originalData as any)[field],
          newValue: file.get(field),
          changeType: 'update',
        })),
        security: {
          riskLevel: 'low',
          authMethod: 'jwt',
          compliance: {
            hipaaRelevant: file.compliance.hipaaCompliant,
            gdprRelevant: true,
            requiresRetention: true,
          },
        },
        business: {
          clinicalRelevant: file.compliance.containsPHI,
          containsPHI: file.compliance.containsPHI,
          dataClassification: 'internal',
        },
        metadata: {
          source: 'file_controller',
          priority: 'low',
        },
        timestamp: new Date(),
      });

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
   * Delete file (soft delete + storage cleanup)
   */
  static async deleteFile(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileId } = req.params;
      const { permanent = false } = req.query;
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
        (authUser.role === 'reception' && !file.compliance.containsPHI) ||
        file.upload.uploadedBy.toString() === authUser._id.toString();

      if (!canDelete) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot delete this file',
        });
      }

      if (permanent === 'true' && authUser.role === 'admin') {
        // Permanent deletion - remove from storage and database
        try {
          await storageService.deleteFile(file.storagePath);
          
          // Remove thumbnail and optimized versions
          if (file.mediaMetadata?.thumbnailPath) {
            await storageService.deleteFile(file.mediaMetadata.thumbnailPath);
          }
        } catch (storageError) {
          logger.error('Storage file removal error:', storageError);
        }

        await File.findByIdAndDelete(fileId);
      } else {
        // Soft delete
        file.deletedAt = new Date();
        await file.save();
      }

      // Log file deletion
      await AuditLog.create({
        action: permanent === 'true' ? 'file_deleted_permanent' : 'file_deleted_soft',
        entityType: 'file',
        entityId: file._id.toString(),
        actorId: authUser._id,
        actorType: 'user',
        actorEmail: authUser.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'success',
        changes: [
          {
            field: 'filename',
            oldValue: file.originalFileName,
            newValue: null,
            changeType: 'delete',
          },
          {
            field: 'permanent',
            oldValue: false,
            newValue: permanent === 'true',
            changeType: 'update',
          },
        ],
        security: {
          riskLevel: permanent === 'true' ? 'critical' : 'medium',
          authMethod: 'jwt',
          compliance: {
            hipaaRelevant: file.compliance.hipaaCompliant,
            gdprRelevant: true,
            requiresRetention: true,
          },
        },
        business: {
          clinicalRelevant: file.compliance.containsPHI,
          containsPHI: file.compliance.containsPHI,
          dataClassification: 'confidential',
        },
        metadata: {
          source: 'file_controller',
          priority: permanent === 'true' ? 'critical' : 'medium',
        },
        timestamp: new Date(),
      });

      res.status(200).json({
        success: true,
        message: `File ${permanent === 'true' ? 'permanently deleted' : 'deleted'} successfully`,
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
        mimeTypeStats,
        recentUploads,
      ] = await Promise.all([
        File.countDocuments({ deletedAt: null }),
        
        File.aggregate([
          { $match: { deletedAt: null } },
          { $group: {
            _id: null,
            totalSize: { $sum: '$fileSize' },
            averageSize: { $avg: '$fileSize' },
            totalDownloads: { $sum: '$accessTracking.downloadCount' },
            totalViews: { $sum: '$accessTracking.viewCount' },
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

        File.aggregate([
          { $match: { deletedAt: null } },
          { $group: {
            _id: { $substr: ['$mimeType', 0, 5] },
            count: { $sum: 1 },
            totalSize: { $sum: '$fileSize' },
          }},
          { $sort: { count: -1 } },
          { $limit: 10 },
        ]),

        File.find({ deletedAt: null })
          .sort({ createdAt: -1 })
          .limit(10)
          .populate('upload.uploadedBy', 'name email')
          .populate('ownerId', 'personalInfo.fullName name title')
          .select('originalFileName fileSize ownerType category createdAt')
          .exec(),
      ]);

      const storageData = storageStats[0] || { 
        totalSize: 0, 
        averageSize: 0, 
        totalDownloads: 0, 
        totalViews: 0 
      };

      res.status(200).json({
        success: true,
        data: {
          overview: {
            totalFiles,
            totalSize: storageData.totalSize,
            averageSize: storageData.averageSize,
            totalDownloads: storageData.totalDownloads,
            totalViews: storageData.totalViews,
            storageUsed: `${(storageData.totalSize / (1024 * 1024 * 1024)).toFixed(2)} GB`,
          },
          byCategory: categoryStats,
          byOwnerType: ownerTypeStats,
          byMimeType: mimeTypeStats,
          recentUploads,
        },
      });
    } catch (error) {
      logger.error('Get file stats error:', error);
      next(error);
    }
  }

  /**
   * Bulk delete files
   */
  static async bulkDeleteFiles(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileIds, permanent = false } = req.body;
      const authUser = (req as AuthRequest).user!;

      if (!Array.isArray(fileIds) || fileIds.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'File IDs array is required',
        });
      }

      // Only admin can perform bulk operations
      if (authUser.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Only administrators can bulk delete files',
        });
      }

      const files = await File.find({ 
        _id: { $in: fileIds }, 
        deletedAt: null 
      });

      if (files.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'No files found',
        });
      }

      const results = {
        deleted: 0,
        failed: 0,
        errors: [] as string[],
      };

      for (const file of files) {
        try {
          if (permanent) {
            // Permanent deletion
            await storageService.deleteFile(file.storagePath);
            
            if (file.mediaMetadata?.thumbnailPath) {
              await storageService.deleteFile(file.mediaMetadata.thumbnailPath);
            }

            await File.findByIdAndDelete(file._id);
          } else {
            // Soft delete
            file.deletedAt = new Date();
            await file.save();
          }

          results.deleted++;
        } catch (error) {
          results.failed++;
          results.errors.push(`Failed to delete ${file.originalFileName}: ${error}`);
        }
      }

      // Log bulk operation
      await AuditLog.create({
        action: permanent ? 'files_bulk_deleted_permanent' : 'files_bulk_deleted_soft',
        entityType: 'file',
        entityId: 'bulk_operation',
        actorId: authUser._id,
        actorType: 'user',
        actorEmail: authUser.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: results.failed === 0 ? 'success' : 'partial_failure',
        changes: [
          {
            field: 'deletedCount',
            newValue: results.deleted,
            changeType: 'update',
          },
          {
            field: 'failedCount',
            newValue: results.failed,
            changeType: 'update',
          },
          {
            field: 'errors',
            newValue: results.errors,
            changeType: 'update',
          },
        ],
        security: {
          riskLevel: 'critical',
          authMethod: 'jwt',
          compliance: {
            hipaaRelevant: true,
            gdprRelevant: true,
            requiresRetention: true,
          },
        },
        business: {
          clinicalRelevant: true,
          containsPHI: true,
          dataClassification: 'confidential',
        },
        metadata: {
          source: 'file_controller',
          priority: 'critical',
        },
        timestamp: new Date(),
      });

      res.status(200).json({
        success: true,
        message: `Bulk delete completed: ${results.deleted} deleted, ${results.failed} failed`,
        data: results,
      });
    } catch (error) {
      logger.error('Bulk delete files error:', error);
      next(error);
    }
  }
}

// Export upload middleware with explicit type
export const uploadMiddleware: any = upload.single('file');

export default FileController;

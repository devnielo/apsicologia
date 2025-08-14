import { Router } from 'express';
import FileController, { uploadMiddleware } from '../controllers/file.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { body, param, query } from 'express-validator';

const router = Router();

// File upload validation
const uploadValidation = [
  body('ownerType')
    .isIn(['patient', 'appointment', 'note', 'professional', 'system'])
    .withMessage('Invalid owner type'),
  body('ownerId')
    .optional()
    .isMongoId()
    .withMessage('Invalid owner ID'),
  body('category')
    .optional()
    .isIn(['medical_record', 'consent', 'prescription', 'report', 'image', 'document', 'form_response'])
    .withMessage('Invalid category'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  body('retentionDays')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Retention days must be a positive integer'),
];

// File query validation
const fileQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('ownerType')
    .optional()
    .isIn(['patient', 'appointment', 'note', 'professional', 'system'])
    .withMessage('Invalid owner type'),
  query('ownerId')
    .optional()
    .isMongoId()
    .withMessage('Invalid owner ID'),
  query('category')
    .optional()
    .isIn(['medical_record', 'consent', 'prescription', 'report', 'image', 'document', 'form_response'])
    .withMessage('Invalid category'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'originalFileName', 'fileSize'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
];

// File update validation
const fileUpdateValidation = [
  param('fileId')
    .isMongoId()
    .withMessage('Invalid file ID'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('category')
    .optional()
    .isIn(['medical_record', 'consent', 'prescription', 'report', 'image', 'document', 'form_response'])
    .withMessage('Invalid category'),
];

// Param validation
const fileIdValidation = [
  param('fileId')
    .isMongoId()
    .withMessage('Invalid file ID'),
];

/**
 * @route   POST /api/files
 * @desc    Upload a file
 * @access  Private (Admin, Reception, Professional)
 * @body    {ownerType, ownerId?, category?, description?, tags?, isPublic?, retentionDays?}
 * @file    multipart/form-data - file field
 */
router.post(
  '/',
  authenticate,
  authorize(['admin', 'reception', 'professional'] as any),
  uploadMiddleware,
  uploadValidation,
  validateRequest,
  FileController.uploadFile
);

/**
 * @route   GET /api/files
 * @desc    Get files with pagination and filtering
 * @access  Private (All roles with different access levels)
 * @query   {page?, limit?, ownerType?, ownerId?, category?, mimeType?, tags?, sortBy?, sortOrder?, search?}
 */
router.get(
  '/',
  authenticate,
  fileQueryValidation,
  validateRequest,
  FileController.getFiles
);

/**
 * @route   GET /api/files/stats
 * @desc    Get file statistics
 * @access  Private (Admin, Reception)
 */
router.get(
  '/stats',
  authenticate,
  authorize(['admin', 'reception'] as any),
  FileController.getFileStats
);

/**
 * @route   GET /api/files/:fileId
 * @desc    Get file by ID
 * @access  Private (Based on file ownership and permissions)
 * @params  fileId - MongoDB ObjectId
 */
router.get(
  '/:fileId',
  authenticate,
  fileIdValidation,
  validateRequest,
  FileController.getFileById
);

/**
 * @route   GET /api/files/:fileId/download
 * @desc    Download file (get download URL)
 * @access  Private (Based on file ownership and permissions)
 * @params  fileId - MongoDB ObjectId
 */
router.get(
  '/:fileId/download',
  authenticate,
  fileIdValidation,
  validateRequest,
  FileController.downloadFile
);

/**
 * @route   PUT /api/files/:fileId
 * @desc    Update file metadata
 * @access  Private (File owner or Admin)
 * @params  fileId - MongoDB ObjectId
 * @body    {description?, tags?, category?}
 */
router.put(
  '/:fileId',
  authenticate,
  fileUpdateValidation,
  validateRequest,
  FileController.updateFile
);

/**
 * @route   DELETE /api/files/:fileId
 * @desc    Delete file (soft delete)
 * @access  Private (File owner or Admin)
 * @params  fileId - MongoDB ObjectId
 */
router.delete(
  '/:fileId',
  authenticate,
  fileIdValidation,
  validateRequest,
  FileController.deleteFile
);

export default router;

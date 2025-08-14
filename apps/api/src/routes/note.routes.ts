import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { NoteController } from '../controllers/note.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router: Router = Router();

// Apply authentication to all routes
router.use(authenticate);

/**
 * @route   POST /api/v1/notes
 * @desc    Create clinical note
 * @access  Professional, Admin, Reception
 * @body    {patientId, appointmentId?, type, category?, title, content, structure?, coding?, clinical?}
 */
router.post(
  '/',
  [
    authorize('admin', 'professional', 'reception'),
    body('patientId')
      .isMongoId()
      .withMessage('Valid patient ID is required'),
    body('type')
      .isIn(['session_note', 'assessment', 'treatment_plan', 'progress_note', 'discharge_summary', 'consultation', 'prescription', 'other'])
      .withMessage('Valid note type is required'),
    body('title')
      .isLength({ min: 1, max: 200 })
      .trim()
      .withMessage('Title is required (1-200 characters)'),
    body('content.json')
      .notEmpty()
      .withMessage('Note content (JSON) is required'),
    body('content.text')
      .isLength({ min: 1 })
      .trim()
      .withMessage('Note content (text) is required'),
    body('appointmentId')
      .optional()
      .isMongoId()
      .withMessage('Valid appointment ID required'),
    body('category')
      .optional()
      .isLength({ max: 100 })
      .trim()
      .withMessage('Category must be less than 100 characters'),
    body('episodeId')
      .optional()
      .isMongoId()
      .withMessage('Valid episode ID required'),
    validateRequest,
  ],
  NoteController.createNote
);

/**
 * @route   GET /api/v1/notes
 * @desc    Get notes with pagination and filtering
 * @access  Professional, Admin, Reception
 * @query   {page?, limit?, patientId?, appointmentId?, type?, category?, status?, sortBy?, sortOrder?, search?, startDate?, endDate?}
 */
router.get(
  '/',
  [
    authorize('admin', 'professional', 'reception'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('patientId')
      .optional()
      .isMongoId()
      .withMessage('Valid patient ID required'),
    query('appointmentId')
      .optional()
      .isMongoId()
      .withMessage('Valid appointment ID required'),
    query('type')
      .optional()
      .isIn(['session_note', 'assessment', 'treatment_plan', 'progress_note', 'discharge_summary', 'consultation', 'prescription', 'other'])
      .withMessage('Invalid note type'),
    query('status')
      .optional()
      .isIn(['draft', 'in_review', 'signed', 'locked', 'amended', 'deleted'])
      .withMessage('Invalid status'),
    query('sortBy')
      .optional()
      .isIn(['createdAt', 'updatedAt', 'title', 'type', 'category', 'status'])
      .withMessage('Invalid sort field'),
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Sort order must be asc or desc'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be valid ISO 8601 date'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be valid ISO 8601 date'),
    validateRequest,
  ],
  NoteController.getNotes
);

/**
 * @route   GET /api/v1/notes/templates
 * @desc    Get note templates
 * @access  Professional, Admin, Reception
 */
router.get(
  '/templates',
  [authorize('admin', 'professional', 'reception')],
  NoteController.getNoteTemplates
);

/**
 * @route   GET /api/v1/notes/stats
 * @desc    Get note statistics
 * @access  Admin, Reception
 */
router.get(
  '/stats',
  [authorize('admin', 'reception')],
  NoteController.getNoteStats
);

/**
 * @route   GET /api/v1/notes/:noteId
 * @desc    Get note by ID
 * @access  Professional, Admin, Reception
 * @param   noteId - Note ObjectId
 */
router.get(
  '/:noteId',
  [
    authorize('admin', 'professional', 'reception'),
    param('noteId')
      .isMongoId()
      .withMessage('Valid note ID is required'),
    validateRequest,
  ],
  NoteController.getNoteById
);

/**
 * @route   PUT /api/v1/notes/:noteId
 * @desc    Update note
 * @access  Professional, Admin, Reception
 * @param   noteId - Note ObjectId
 * @body    {title?, content?, structure?, coding?, clinical?, category?, changeReason?}
 */
router.put(
  '/:noteId',
  [
    authorize('admin', 'professional', 'reception'),
    param('noteId')
      .isMongoId()
      .withMessage('Valid note ID is required'),
    body('title')
      .optional()
      .isLength({ min: 1, max: 200 })
      .trim()
      .withMessage('Title must be 1-200 characters'),
    body('content.json')
      .optional()
      .notEmpty()
      .withMessage('Note content (JSON) cannot be empty'),
    body('content.text')
      .optional()
      .isLength({ min: 1 })
      .trim()
      .withMessage('Note content (text) cannot be empty'),
    body('category')
      .optional()
      .isLength({ max: 100 })
      .trim()
      .withMessage('Category must be less than 100 characters'),
    body('changeReason')
      .optional()
      .isLength({ min: 1, max: 500 })
      .trim()
      .withMessage('Change reason must be 1-500 characters'),
    validateRequest,
  ],
  NoteController.updateNote
);

/**
 * @route   POST /api/v1/notes/:noteId/sign
 * @desc    Sign note
 * @access  Professional, Admin
 * @param   noteId - Note ObjectId
 * @body    {signatureMethod?, location?}
 */
router.post(
  '/:noteId/sign',
  [
    authorize('admin', 'professional'),
    param('noteId')
      .isMongoId()
      .withMessage('Valid note ID is required'),
    body('signatureMethod')
      .optional()
      .isIn(['digital', 'electronic', 'wet', 'biometric'])
      .withMessage('Invalid signature method'),
    body('location')
      .optional()
      .isLength({ max: 200 })
      .trim()
      .withMessage('Location must be less than 200 characters'),
    validateRequest,
  ],
  NoteController.signNote
);

/**
 * @route   DELETE /api/v1/notes/:noteId
 * @desc    Delete note (soft delete)
 * @access  Admin only
 * @param   noteId - Note ObjectId
 */
router.delete(
  '/:noteId',
  [
    authorize('admin'),
    param('noteId')
      .isMongoId()
      .withMessage('Valid note ID is required'),
    validateRequest,
  ],
  NoteController.deleteNote
);

export default router;

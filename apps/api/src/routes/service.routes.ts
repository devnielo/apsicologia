import { Router } from 'express';
import { body, param, query } from 'express-validator';
import ServiceController from '../controllers/service.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router: Router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route GET /services
 * @desc Get all services with pagination and filtering
 * @access Admin, Reception, Professional (limited view)
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search').optional().isLength({ min: 1, max: 100 }).withMessage('Search must be 1-100 characters'),
    query('category').optional().isLength({ min: 2, max: 50 }).withMessage('Category must be 2-50 characters'),
    query('isActive').optional().isIn(['true', 'false', 'all']).withMessage('IsActive must be true, false, or all'),
    query('isOnlineAvailable').optional().isBoolean().withMessage('IsOnlineAvailable must be a boolean'),
    query('professionalId').optional().isMongoId().withMessage('Invalid professional ID'),
    query('sortBy').optional().isIn(['name', 'category', 'price', 'durationMinutes', 'createdAt']).withMessage('Invalid sortBy field'),
    query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('SortOrder must be asc or desc'),
    validateRequest,
  ],
  ServiceController.getServices
);

/**
 * @route GET /services/stats
 * @desc Get service statistics
 * @access Admin, Reception
 */
router.get(
  '/stats',
  authorize('admin', 'reception'),
  ServiceController.getServiceStats
);

/**
 * @route GET /services/:serviceId
 * @desc Get service by ID with full details
 * @access Admin, Reception, Professional
 */
router.get(
  '/:serviceId',
  [
    param('serviceId').isMongoId().withMessage('Invalid service ID'),
    validateRequest,
  ],
  authorize('admin', 'reception', 'professional'),
  ServiceController.getServiceById
);

/**
 * @route POST /services
 * @desc Create new service
 * @access Admin only
 */
router.post(
  '/',
  authorize('admin'),
  [
    body('name')
      .notEmpty()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name is required and must be 2-100 characters'),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    body('category')
      .notEmpty()
      .isLength({ min: 2, max: 50 })
      .withMessage('Category is required and must be 2-50 characters'),
    body('duration')
      .isInt({ min: 15, max: 480 })
      .withMessage('Duration must be between 15 and 480 minutes'),
    body('price')
      .isFloat({ min: 0, max: 10000 })
      .withMessage('Price must be between 0 and 10000'),
    body('currency')
      .optional()
      .isLength({ min: 3, max: 3 })
      .withMessage('Currency must be 3 characters (ISO code)'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('IsActive must be a boolean'),
    body('requiresApproval')
      .optional()
      .isBoolean()
      .withMessage('RequiresApproval must be a boolean'),
    body('isOnlineAvailable')
      .optional()
      .isBoolean()
      .withMessage('IsOnlineAvailable must be a boolean'),
    body('maxAdvanceBookingDays')
      .optional()
      .isInt({ min: 1, max: 365 })
      .withMessage('MaxAdvanceBookingDays must be between 1 and 365'),
    body('minAdvanceBookingHours')
      .optional()
      .isInt({ min: 0, max: 168 })
      .withMessage('MinAdvanceBookingHours must be between 0 and 168'),
    body('cancellationPolicy.allowedUntilHours')
      .optional()
      .isInt({ min: 0, max: 168 })
      .withMessage('CancellationPolicy.allowedUntilHours must be between 0 and 168'),
    body('cancellationPolicy.penaltyPercentage')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('CancellationPolicy.penaltyPercentage must be between 0 and 100'),
    body('cancellationPolicy.noShowPenaltyPercentage')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('CancellationPolicy.noShowPenaltyPercentage must be between 0 and 100'),
    body('preparationTime')
      .optional()
      .isInt({ min: 0, max: 120 })
      .withMessage('PreparationTime must be between 0 and 120 minutes'),
    body('cleanupTime')
      .optional()
      .isInt({ min: 0, max: 120 })
      .withMessage('CleanupTime must be between 0 and 120 minutes'),
    body('requiredResources')
      .optional()
      .isArray({ max: 20 })
      .withMessage('RequiredResources must be an array with max 20 items'),
    body('requiredResources.*')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Each required resource must be 2-100 characters'),
    body('contraindications')
      .optional()
      .isArray({ max: 20 })
      .withMessage('Contraindications must be an array with max 20 items'),
    body('contraindications.*')
      .optional()
      .isLength({ min: 2, max: 200 })
      .withMessage('Each contraindication must be 2-200 characters'),
    body('ageRestrictions.minAge')
      .optional()
      .isInt({ min: 0, max: 120 })
      .withMessage('MinAge must be between 0 and 120'),
    body('ageRestrictions.maxAge')
      .optional()
      .isInt({ min: 0, max: 120 })
      .withMessage('MaxAge must be between 0 and 120'),
    body('metadata.color')
      .optional()
      .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
      .withMessage('Color must be a valid hex color code'),
    body('metadata.icon')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('Icon must be 2-50 characters'),
    body('metadata.tags')
      .optional()
      .isArray({ max: 10 })
      .withMessage('Tags must be an array with max 10 items'),
    body('metadata.tags.*')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('Each tag must be 2-50 characters'),
    validateRequest,
  ],
  ServiceController.createService
);

/**
 * @route PUT /services/:serviceId
 * @desc Update service information
 * @access Admin only
 */
router.put(
  '/:serviceId',
  authorize('admin'),
  [
    param('serviceId').isMongoId().withMessage('Invalid service ID'),
    body('name')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be 2-100 characters'),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    body('category')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('Category must be 2-50 characters'),
    body('duration')
      .optional()
      .isInt({ min: 15, max: 480 })
      .withMessage('Duration must be between 15 and 480 minutes'),
    body('price')
      .optional()
      .isFloat({ min: 0, max: 10000 })
      .withMessage('Price must be between 0 and 10000'),
    body('currency')
      .optional()
      .isLength({ min: 3, max: 3 })
      .withMessage('Currency must be 3 characters (ISO code)'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('IsActive must be a boolean'),
    body('requiresApproval')
      .optional()
      .isBoolean()
      .withMessage('RequiresApproval must be a boolean'),
    body('isOnlineAvailable')
      .optional()
      .isBoolean()
      .withMessage('IsOnlineAvailable must be a boolean'),
    body('maxAdvanceBookingDays')
      .optional()
      .isInt({ min: 1, max: 365 })
      .withMessage('MaxAdvanceBookingDays must be between 1 and 365'),
    body('minAdvanceBookingHours')
      .optional()
      .isInt({ min: 0, max: 168 })
      .withMessage('MinAdvanceBookingHours must be between 0 and 168'),
    body('cancellationPolicy.allowedUntilHours')
      .optional()
      .isInt({ min: 0, max: 168 })
      .withMessage('CancellationPolicy.allowedUntilHours must be between 0 and 168'),
    body('cancellationPolicy.penaltyPercentage')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('CancellationPolicy.penaltyPercentage must be between 0 and 100'),
    body('cancellationPolicy.noShowPenaltyPercentage')
      .optional()
      .isFloat({ min: 0, max: 100 })
      .withMessage('CancellationPolicy.noShowPenaltyPercentage must be between 0 and 100'),
    body('preparationTime')
      .optional()
      .isInt({ min: 0, max: 120 })
      .withMessage('PreparationTime must be between 0 and 120 minutes'),
    body('cleanupTime')
      .optional()
      .isInt({ min: 0, max: 120 })
      .withMessage('CleanupTime must be between 0 and 120 minutes'),
    body('requiredResources')
      .optional()
      .isArray({ max: 20 })
      .withMessage('RequiredResources must be an array with max 20 items'),
    body('contraindications')
      .optional()
      .isArray({ max: 20 })
      .withMessage('Contraindications must be an array with max 20 items'),
    body('ageRestrictions.minAge')
      .optional()
      .isInt({ min: 0, max: 120 })
      .withMessage('MinAge must be between 0 and 120'),
    body('ageRestrictions.maxAge')
      .optional()
      .isInt({ min: 0, max: 120 })
      .withMessage('MaxAge must be between 0 and 120'),
    body('metadata.color')
      .optional()
      .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
      .withMessage('Color must be a valid hex color code'),
    body('metadata.icon')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('Icon must be 2-50 characters'),
    body('metadata.tags')
      .optional()
      .isArray({ max: 10 })
      .withMessage('Tags must be an array with max 10 items'),
    validateRequest,
  ],
  ServiceController.updateService
);

/**
 * @route POST /services/:serviceId/deactivate
 * @desc Deactivate service (soft delete)
 * @access Admin only
 */
router.post(
  '/:serviceId/deactivate',
  authorize('admin'),
  [
    param('serviceId').isMongoId().withMessage('Invalid service ID'),
    validateRequest,
  ],
  ServiceController.deactivateService
);

/**
 * @route POST /services/:serviceId/reactivate
 * @desc Reactivate service
 * @access Admin only
 */
router.post(
  '/:serviceId/reactivate',
  authorize('admin'),
  [
    param('serviceId').isMongoId().withMessage('Invalid service ID'),
    validateRequest,
  ],
  ServiceController.reactivateService
);

/**
 * @route POST /services/:serviceId/assign/:professionalId
 * @desc Assign service to professional
 * @access Admin only
 */
router.post(
  '/:serviceId/assign/:professionalId',
  authorize('admin'),
  [
    param('serviceId').isMongoId().withMessage('Invalid service ID'),
    param('professionalId').isMongoId().withMessage('Invalid professional ID'),
    validateRequest,
  ],
  ServiceController.assignServiceToProfessional
);

/**
 * @route DELETE /services/:serviceId/remove/:professionalId
 * @desc Remove service from professional
 * @access Admin only
 */
router.delete(
  '/:serviceId/remove/:professionalId',
  authorize('admin'),
  [
    param('serviceId').isMongoId().withMessage('Invalid service ID'),
    param('professionalId').isMongoId().withMessage('Invalid professional ID'),
    validateRequest,
  ],
  ServiceController.removeServiceFromProfessional
);

/**
 * @route GET /services/professional/:professionalId
 * @desc Get services offered by a specific professional
 * @access Admin, Reception, Professional (own services)
 */
router.get(
  '/professional/:professionalId',
  [
    param('professionalId').isMongoId().withMessage('Invalid professional ID'),
    validateRequest,
  ],
  ServiceController.getServicesByProfessional
);

export default router;

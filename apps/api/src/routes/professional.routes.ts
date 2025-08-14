import { Router } from 'express';
import { body, param, query } from 'express-validator';
import ProfessionalController from '../controllers/professional.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router: Router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route GET /professionals
 * @desc Get all professionals with pagination and filtering
 * @access Admin, Reception, Professional (limited)
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search').optional().isLength({ min: 1, max: 100 }).withMessage('Search must be 1-100 characters'),
    query('specialty').optional().isLength({ min: 2, max: 50 }).withMessage('Specialty must be 2-50 characters'),
    query('consultationType').optional().isIn(['in-person', 'online', 'phone']).withMessage('Invalid consultation type'),
    query('acceptsNewPatients').optional().isBoolean().withMessage('AcceptsNewPatients must be a boolean'),
    query('isActive').optional().isIn(['true', 'false', 'all']).withMessage('IsActive must be true, false, or all'),
    query('sortBy').optional().isIn(['name', 'email', 'createdAt', 'updatedAt']).withMessage('Invalid sortBy field'),
    query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('SortOrder must be asc or desc'),
    validateRequest,
  ],
  ProfessionalController.getProfessionals
);

/**
 * @route GET /professionals/stats
 * @desc Get professional statistics
 * @access Admin, Reception
 */
router.get(
  '/stats',
  authorize('admin', 'reception'),
  ProfessionalController.getProfessionalStats
);

/**
 * @route GET /professionals/:professionalId
 * @desc Get professional by ID with full details
 * @access Admin, Reception, Professional (own profile)
 */
router.get(
  '/:professionalId',
  [
    param('professionalId').isMongoId().withMessage('Invalid professional ID'),
    validateRequest,
  ],
  ProfessionalController.getProfessionalById
);

/**
 * @route POST /professionals
 * @desc Create new professional
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
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('phone')
      .optional()
      .matches(/^(\+34|0034|34)?[6789]\d{8}$/)
      .withMessage('Valid Spanish phone number required'),
    body('licenseNumber')
      .notEmpty()
      .isLength({ min: 5, max: 50 })
      .withMessage('License number is required and must be 5-50 characters'),
    body('specialties')
      .isArray({ min: 1, max: 10 })
      .withMessage('At least one specialty is required (max 10)'),
    body('specialties.*')
      .isLength({ min: 2, max: 100 })
      .withMessage('Each specialty must be 2-100 characters'),
    body('qualifications')
      .optional()
      .isArray({ max: 20 })
      .withMessage('Maximum 20 qualifications allowed'),
    body('qualifications.*.degree')
      .if(body('qualifications').exists())
      .notEmpty()
      .isLength({ min: 2, max: 100 })
      .withMessage('Degree is required and must be 2-100 characters'),
    body('qualifications.*.institution')
      .if(body('qualifications').exists())
      .notEmpty()
      .isLength({ min: 2, max: 100 })
      .withMessage('Institution is required and must be 2-100 characters'),
    body('qualifications.*.year')
      .if(body('qualifications').exists())
      .isInt({ min: 1950, max: new Date().getFullYear() })
      .withMessage('Year must be between 1950 and current year'),
    body('qualifications.*.verified')
      .optional()
      .isBoolean()
      .withMessage('Verified must be a boolean'),
    body('bio')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Bio cannot exceed 1000 characters'),
    body('languages')
      .optional()
      .isArray({ min: 1, max: 10 })
      .withMessage('Languages must be an array with 1-10 items'),
    body('languages.*')
      .if(body('languages').exists())
      .isLength({ min: 2, max: 10 })
      .withMessage('Each language code must be 2-10 characters'),
    body('consultationTypes')
      .isArray({ min: 1, max: 3 })
      .withMessage('At least one consultation type is required'),
    body('consultationTypes.*')
      .isIn(['in-person', 'online', 'phone'])
      .withMessage('Invalid consultation type'),
    body('hourlyRate')
      .optional()
      .isFloat({ min: 0, max: 1000 })
      .withMessage('Hourly rate must be between 0 and 1000'),
    body('currency')
      .optional()
      .isLength({ min: 3, max: 3 })
      .withMessage('Currency must be 3 characters (ISO code)'),
    body('weeklyAvailability')
      .optional()
      .isObject()
      .withMessage('WeeklyAvailability must be an object'),
    body('vacations')
      .optional()
      .isArray({ max: 50 })
      .withMessage('Maximum 50 vacation periods allowed'),
    body('vacations.*.startDate')
      .if(body('vacations').exists())
      .isISO8601()
      .withMessage('Start date must be a valid ISO8601 date'),
    body('vacations.*.endDate')
      .if(body('vacations').exists())
      .isISO8601()
      .withMessage('End date must be a valid ISO8601 date'),
    body('vacations.*.reason')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Vacation reason cannot exceed 200 characters'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('IsActive must be a boolean'),
    validateRequest,
  ],
  ProfessionalController.createProfessional
);

/**
 * @route PUT /professionals/:professionalId
 * @desc Update professional information
 * @access Admin, Professional (own profile)
 */
router.put(
  '/:professionalId',
  [
    param('professionalId').isMongoId().withMessage('Invalid professional ID'),
    body('name')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be 2-100 characters'),
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email is required'),
    body('phone')
      .optional()
      .matches(/^(\+34|0034|34)?[6789]\d{8}$/)
      .withMessage('Valid Spanish phone number required'),
    body('licenseNumber')
      .optional()
      .isLength({ min: 5, max: 50 })
      .withMessage('License number must be 5-50 characters'),
    body('specialties')
      .optional()
      .isArray({ min: 1, max: 10 })
      .withMessage('At least one specialty is required (max 10)'),
    body('specialties.*')
      .if(body('specialties').exists())
      .isLength({ min: 2, max: 100 })
      .withMessage('Each specialty must be 2-100 characters'),
    body('qualifications')
      .optional()
      .isArray({ max: 20 })
      .withMessage('Maximum 20 qualifications allowed'),
    body('bio')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Bio cannot exceed 1000 characters'),
    body('languages')
      .optional()
      .isArray({ min: 1, max: 10 })
      .withMessage('Languages must be an array with 1-10 items'),
    body('consultationTypes')
      .optional()
      .isArray({ min: 1, max: 3 })
      .withMessage('At least one consultation type is required'),
    body('consultationTypes.*')
      .if(body('consultationTypes').exists())
      .isIn(['in-person', 'online', 'phone'])
      .withMessage('Invalid consultation type'),
    body('hourlyRate')
      .optional()
      .isFloat({ min: 0, max: 1000 })
      .withMessage('Hourly rate must be between 0 and 1000'),
    body('currency')
      .optional()
      .isLength({ min: 3, max: 3 })
      .withMessage('Currency must be 3 characters (ISO code)'),
    body('maxPatientsPerDay')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Max patients per day must be between 1 and 50'),
    body('bufferMinutes')
      .optional()
      .isInt({ min: 0, max: 120 })
      .withMessage('Buffer minutes must be between 0 and 120'),
    body('acceptsNewPatients')
      .optional()
      .isBoolean()
      .withMessage('AcceptsNewPatients must be a boolean'),
    body('telehealthSetup')
      .optional()
      .isObject()
      .withMessage('TelehealthSetup must be an object'),
    body('telehealthSetup.platform')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('Platform must be 2-50 characters'),
    body('telehealthSetup.roomId')
      .optional()
      .isLength({ min: 3, max: 100 })
      .withMessage('Room ID must be 3-100 characters'),
    body('telehealthSetup.requirements')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Requirements cannot exceed 500 characters'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('IsActive must be a boolean'),
    validateRequest,
  ],
  ProfessionalController.updateProfessional
);

/**
 * @route POST /professionals/:professionalId/deactivate
 * @desc Deactivate professional (soft delete)
 * @access Admin only
 */
router.post(
  '/:professionalId/deactivate',
  authorize('admin'),
  [
    param('professionalId').isMongoId().withMessage('Invalid professional ID'),
    validateRequest,
  ],
  ProfessionalController.deactivateProfessional
);

/**
 * @route POST /professionals/:professionalId/reactivate
 * @desc Reactivate professional
 * @access Admin only
 */
router.post(
  '/:professionalId/reactivate',
  authorize('admin'),
  [
    param('professionalId').isMongoId().withMessage('Invalid professional ID'),
    validateRequest,
  ],
  ProfessionalController.reactivateProfessional
);

/**
 * @route GET /professionals/:professionalId/availability
 * @desc Get professional availability for calendar integration
 * @access Admin, Reception, Professional (own)
 */
router.get(
  '/:professionalId/availability',
  [
    param('professionalId').isMongoId().withMessage('Invalid professional ID'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid ISO8601 date'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid ISO8601 date'),
    validateRequest,
  ],
  ProfessionalController.getProfessionalAvailability
);

/**
 * @route PUT /professionals/:professionalId/availability
 * @desc Update professional availability
 * @access Admin, Professional (own)
 */
router.put(
  '/:professionalId/availability',
  [
    param('professionalId').isMongoId().withMessage('Invalid professional ID'),
    body('weeklyAvailability')
      .optional()
      .isArray({ max: 7 })
      .withMessage('WeeklyAvailability must be an array with max 7 items'),
    body('weeklyAvailability.*.dayOfWeek')
      .if(body('weeklyAvailability').exists())
      .isInt({ min: 0, max: 6 })
      .withMessage('Day of week must be between 0 (Sunday) and 6 (Saturday)'),
    body('weeklyAvailability.*.startTime')
      .if(body('weeklyAvailability').exists())
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Start time must be in HH:MM format'),
    body('weeklyAvailability.*.endTime')
      .if(body('weeklyAvailability').exists())
      .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('End time must be in HH:MM format'),
    body('weeklyAvailability.*.isAvailable')
      .optional()
      .isBoolean()
      .withMessage('IsAvailable must be a boolean'),
    body('vacations')
      .optional()
      .isArray({ max: 100 })
      .withMessage('Maximum 100 vacation periods allowed'),
    body('vacations.*.startDate')
      .if(body('vacations').exists())
      .isISO8601()
      .withMessage('Start date must be a valid ISO8601 date'),
    body('vacations.*.endDate')
      .if(body('vacations').exists())
      .isISO8601()
      .withMessage('End date must be a valid ISO8601 date'),
    body('vacations.*.reason')
      .optional()
      .isLength({ max: 200 })
      .withMessage('Vacation reason cannot exceed 200 characters'),
    body('bufferMinutes')
      .optional()
      .isInt({ min: 0, max: 120 })
      .withMessage('Buffer minutes must be between 0 and 120'),
    body('maxPatientsPerDay')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Max patients per day must be between 1 and 50'),
    validateRequest,
  ],
  ProfessionalController.updateProfessionalAvailability
);

export default router;

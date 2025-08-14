import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { PatientController } from '../controllers/patient.controller.js';
import { 
  requireAuth, 
  authorize,
  rateLimitPerUser
} from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router: Router = Router();

// Rate limiting instances
const normalRateLimit = rateLimitPerUser(100, 15 * 60 * 1000); // 100 req per 15 min
const strictRateLimit = rateLimitPerUser(20, 15 * 60 * 1000); // 20 req per 15 min

// Validation schemas
const createPatientValidation = [
  body('name')
    .isLength({ min: 2, max: 100 })
    .trim()
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('phone')
    .isMobilePhone(['es-ES'])
    .withMessage('Valid Spanish phone number is required'),
  body('birthDate')
    .optional()
    .isISO8601()
    .withMessage('Valid birth date is required'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
    .withMessage('Valid gender is required'),
  body('address.street')
    .optional()
    .isLength({ max: 200 })
    .trim()
    .withMessage('Street address cannot exceed 200 characters'),
  body('address.city')
    .optional()
    .isLength({ max: 100 })
    .trim()
    .withMessage('City cannot exceed 100 characters'),
  body('address.postalCode')
    .optional()
    .matches(/^\d{5}$/)
    .withMessage('Valid postal code is required (5 digits)'),
  body('address.country')
    .optional()
    .isLength({ max: 100 })
    .trim()
    .withMessage('Country cannot exceed 100 characters'),
  body('emergencyContact.name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .trim()
    .withMessage('Emergency contact name must be between 2 and 100 characters'),
  body('emergencyContact.relationship')
    .optional()
    .isLength({ min: 2, max: 50 })
    .trim()
    .withMessage('Emergency contact relationship must be between 2 and 50 characters'),
  body('emergencyContact.phone')
    .optional()
    .isMobilePhone(['es-ES'])
    .withMessage('Valid emergency contact phone number is required'),
  body('emergencyContact.email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid emergency contact email is required'),
  body('allergies')
    .optional()
    .isArray()
    .withMessage('Allergies must be an array'),
  body('allergies.*')
    .optional()
    .isLength({ min: 1, max: 100 })
    .trim()
    .withMessage('Each allergy must be between 1 and 100 characters'),
  body('medicalConditions')
    .optional()
    .isArray()
    .withMessage('Medical conditions must be an array'),
  body('medicalConditions.*')
    .optional()
    .isLength({ min: 1, max: 100 })
    .trim()
    .withMessage('Each medical condition must be between 1 and 100 characters'),
  body('medications')
    .optional()
    .isArray()
    .withMessage('Medications must be an array'),
  body('medications.*')
    .optional()
    .isLength({ min: 1, max: 100 })
    .trim()
    .withMessage('Each medication must be between 1 and 100 characters'),
  body('assignedProfessionalId')
    .optional()
    .isMongoId()
    .withMessage('Valid professional ID is required'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .isLength({ min: 1, max: 50 })
    .trim()
    .withMessage('Each tag must be between 1 and 50 characters'),
  body('source')
    .optional()
    .isIn(['online', 'referral', 'direct', 'other'])
    .withMessage('Valid source is required'),
  body('referredBy')
    .optional()
    .isLength({ min: 1, max: 200 })
    .trim()
    .withMessage('Referred by must be between 1 and 200 characters'),
];

const updatePatientValidation = [
  param('patientId')
    .isMongoId()
    .withMessage('Valid patient ID is required'),
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .trim()
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('phone')
    .optional()
    .isMobilePhone(['es-ES'])
    .withMessage('Valid Spanish phone number is required'),
  body('birthDate')
    .optional()
    .isISO8601()
    .withMessage('Valid birth date is required'),
  body('gender')
    .optional()
    .isIn(['male', 'female', 'other', 'prefer_not_to_say'])
    .withMessage('Valid gender is required'),
  body('assignedProfessionalId')
    .optional()
    .isMongoId()
    .withMessage('Valid professional ID is required'),
  body('clinicalNotes')
    .optional()
    .isLength({ max: 2000 })
    .trim()
    .withMessage('Clinical notes cannot exceed 2000 characters'),
  body('riskLevel')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Valid risk level is required'),
  body('status')
    .optional()
    .isIn(['active', 'inactive', 'discharged', 'pending'])
    .withMessage('Valid status is required'),
];

const getPatientValidation = [
  param('patientId')
    .isMongoId()
    .withMessage('Valid patient ID is required'),
];

const getPatientsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .isLength({ min: 1, max: 100 })
    .trim()
    .withMessage('Search term must be between 1 and 100 characters'),
  query('assignedProfessionalId')
    .optional()
    .isMongoId()
    .withMessage('Valid professional ID is required'),
  query('tags')
    .optional()
    .isLength({ min: 1, max: 200 })
    .withMessage('Tags filter must be between 1 and 200 characters'),
  query('status')
    .optional()
    .isIn(['active', 'inactive', 'discharged', 'pending', 'all'])
    .withMessage('Valid status filter is required'),
  query('riskLevel')
    .optional()
    .isIn(['low', 'medium', 'high', 'all'])
    .withMessage('Valid risk level filter is required'),
  query('sortBy')
    .optional()
    .isIn(['name', 'email', 'phone', 'createdAt', 'updatedAt', 'status', 'riskLevel'])
    .withMessage('Valid sort field is required'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  query('includeInactive')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('includeInactive must be true or false'),
];

const updateConsentValidation = [
  param('patientId')
    .isMongoId()
    .withMessage('Valid patient ID is required'),
  body('consentType')
    .isIn(['treatmentConsent', 'dataProcessing', 'marketing'])
    .withMessage('Valid consent type is required'),
  body('granted')
    .isBoolean()
    .withMessage('Granted must be a boolean'),
  body('document')
    .optional()
    .isLength({ min: 1, max: 500 })
    .trim()
    .withMessage('Document reference must be between 1 and 500 characters'),
];

// Routes

/**
 * @swagger
 * /api/v1/patients:
 *   get:
 *     summary: Get all patients with pagination and filtering
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', 
  normalRateLimit,
  ...requireAuth,
  getPatientsValidation,
  validateRequest,
  PatientController.getPatients
);

/**
 * @swagger
 * /api/v1/patients/stats:
 *   get:
 *     summary: Get patient statistics
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 */
router.get('/stats', 
  normalRateLimit,
  ...requireAuth,
  authorize('admin', 'reception'),
  PatientController.getPatientStats
);

/**
 * @swagger
 * /api/v1/patients/{patientId}:
 *   get:
 *     summary: Get patient by ID
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:patientId', 
  normalRateLimit,
  ...requireAuth,
  getPatientValidation,
  validateRequest,
  PatientController.getPatientById
);

/**
 * @swagger
 * /api/v1/patients:
 *   post:
 *     summary: Create new patient
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', 
  strictRateLimit,
  ...requireAuth,
  authorize('admin', 'reception'),
  createPatientValidation,
  validateRequest,
  PatientController.createPatient
);

/**
 * @swagger
 * /api/v1/patients/{patientId}:
 *   put:
 *     summary: Update patient
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:patientId', 
  strictRateLimit,
  ...requireAuth,
  updatePatientValidation,
  validateRequest,
  PatientController.updatePatient
);

/**
 * @swagger
 * /api/v1/patients/{patientId}/deactivate:
 *   post:
 *     summary: Deactivate patient (soft delete)
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:patientId/deactivate', 
  strictRateLimit,
  ...requireAuth,
  authorize('admin'),
  getPatientValidation,
  validateRequest,
  PatientController.deactivatePatient
);

/**
 * @swagger
 * /api/v1/patients/{patientId}/reactivate:
 *   post:
 *     summary: Reactivate patient
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:patientId/reactivate', 
  strictRateLimit,
  ...requireAuth,
  authorize('admin'),
  getPatientValidation,
  validateRequest,
  PatientController.reactivatePatient
);

/**
 * @swagger
 * /api/v1/patients/{patientId}/consent:
 *   put:
 *     summary: Update patient consent
 *     tags: [Patients]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:patientId/consent', 
  strictRateLimit,
  ...requireAuth,
  updateConsentValidation,
  validateRequest,
  PatientController.updateConsent
);

export default router;

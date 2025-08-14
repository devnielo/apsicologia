import { Router } from 'express';
import FormController from '../controllers/form.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { body, param, query } from 'express-validator';

const router: Router = Router();

// Form schema validation
const formSchemaValidation = [
  body('name')
    .notEmpty()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Form name is required and cannot exceed 100 characters'),
  body('title')
    .notEmpty()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Form title is required and cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Description cannot exceed 1000 characters'),
  body('version')
    .optional()
    .matches(/^\d+\.\d+\.\d+$/)
    .withMessage('Version must follow semantic versioning (x.y.z)'),
  body('jsonSchema')
    .isObject()
    .withMessage('JSON schema must be a valid object'),
  body('jsonSchema.type')
    .notEmpty()
    .withMessage('JSON schema must have a type property'),
  body('jsonSchema.properties')
    .isObject()
    .withMessage('JSON schema must have properties'),
  body('uiSchema')
    .optional()
    .isObject()
    .withMessage('UI schema must be an object'),
  body('metadata.category')
    .optional()
    .isIn(['intake', 'assessment', 'screening', 'feedback', 'consent', 'registration', 'survey', 'other'])
    .withMessage('Invalid category'),
  body('metadata.estimatedCompletionTime')
    .optional()
    .isInt({ min: 1, max: 240 })
    .withMessage('Estimated completion time must be between 1 and 240 minutes'),
];

// Form response validation
const formResponseValidation = [
  body('responses')
    .isObject()
    .withMessage('Responses must be an object'),
  body('patientId')
    .optional()
    .isMongoId()
    .withMessage('Invalid patient ID'),
  body('appointmentId')
    .optional()
    .isMongoId()
    .withMessage('Invalid appointment ID'),
];

// Query validation
const formQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('category')
    .optional()
    .isIn(['intake', 'assessment', 'screening', 'feedback', 'consent', 'registration', 'survey', 'other'])
    .withMessage('Invalid category'),
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'name', 'title'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
];

// Response query validation
const responseQueryValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('formId')
    .optional()
    .isMongoId()
    .withMessage('Invalid form ID'),
  query('patientId')
    .optional()
    .isMongoId()
    .withMessage('Invalid patient ID'),
  query('appointmentId')
    .optional()
    .isMongoId()
    .withMessage('Invalid appointment ID'),
  query('sortBy')
    .optional()
    .isIn(['submittedAt', 'createdAt'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
];

// Param validation
const formIdValidation = [
  param('formId')
    .isMongoId()
    .withMessage('Invalid form ID'),
];

const responseIdValidation = [
  param('responseId')
    .isMongoId()
    .withMessage('Invalid response ID'),
];

/**
 * @route   POST /api/forms
 * @desc    Create form schema
 * @access  Private (Admin, Professional)
 * @body    {name, title, description?, jsonSchema, uiSchema?, config?, permissions?, metadata?}
 */
router.post(
  '/',
  authenticate,
  authorize(['admin', 'professional'] as any),
  formSchemaValidation,
  validateRequest,
  FormController.createFormSchema
);

/**
 * @route   GET /api/forms
 * @desc    Get all form schemas with pagination and filtering
 * @access  Private (All roles with different access levels)
 * @query   {page?, limit?, category?, isActive?, sortBy?, sortOrder?, search?}
 */
router.get(
  '/',
  authenticate,
  formQueryValidation,
  validateRequest,
  FormController.getFormSchemas
);

/**
 * @route   GET /api/forms/stats
 * @desc    Get form statistics
 * @access  Private (Admin, Reception)
 */
router.get(
  '/stats',
  authenticate,
  authorize(['admin', 'reception'] as any),
  FormController.getFormStats
);

/**
 * @route   GET /api/forms/:formId
 * @desc    Get form schema by ID
 * @access  Private (Based on form permissions)
 * @params  formId - MongoDB ObjectId
 */
router.get(
  '/:formId',
  authenticate,
  formIdValidation,
  validateRequest,
  FormController.getFormSchemaById
);

/**
 * @route   PUT /api/forms/:formId
 * @desc    Update form schema
 * @access  Private (Admin, Professional)
 * @params  formId - MongoDB ObjectId
 * @body    {name?, title?, description?, jsonSchema?, uiSchema?, config?, permissions?, metadata?}
 */
router.put(
  '/:formId',
  authenticate,
  authorize(['admin', 'professional'] as any),
  formIdValidation,
  formSchemaValidation,
  validateRequest,
  FormController.updateFormSchema
);

/**
 * @route   DELETE /api/forms/:formId
 * @desc    Delete form schema (soft delete)
 * @access  Private (Admin only)
 * @params  formId - MongoDB ObjectId
 */
router.delete(
  '/:formId',
  authenticate,
  authorize(['admin'] as any),
  formIdValidation,
  validateRequest,
  FormController.deleteFormSchema
);

/**
 * @route   POST /api/forms/:formId/responses
 * @desc    Submit form response
 * @access  Private (All roles based on form permissions)
 * @params  formId - MongoDB ObjectId
 * @body    {responses, patientId?, appointmentId?}
 */
router.post(
  '/:formId/responses',
  authenticate,
  formIdValidation,
  formResponseValidation,
  validateRequest,
  FormController.submitFormResponse
);

/**
 * @route   GET /api/forms/responses
 * @desc    Get form responses with pagination and filtering
 * @access  Private (Admin, Reception, Professional)
 * @query   {page?, limit?, formId?, patientId?, appointmentId?, sortBy?, sortOrder?}
 */
router.get(
  '/responses',
  authenticate,
  authorize(['admin', 'reception', 'professional'] as any),
  responseQueryValidation,
  validateRequest,
  FormController.getFormResponses
);

/**
 * @route   GET /api/forms/responses/:responseId
 * @desc    Get form response by ID
 * @access  Private (Admin, Reception, Professional with patient access)
 * @params  responseId - MongoDB ObjectId
 */
router.get(
  '/responses/:responseId',
  authenticate,
  authorize(['admin', 'reception', 'professional'] as any),
  responseIdValidation,
  validateRequest,
  FormController.getFormResponseById
);

export default router;

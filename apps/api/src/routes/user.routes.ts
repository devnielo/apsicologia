import { Router } from 'express';
import { body, param, query } from 'express-validator';
import { UserController } from '../controllers/user.controller.js';
import { 
  authenticate, 
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
const createUserValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must be at least 8 characters with uppercase, lowercase, number and special character'),
  body('name')
    .isLength({ min: 2, max: 100 })
    .trim()
    .withMessage('Name must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .isMobilePhone(['es-ES'])
    .withMessage('Valid phone number is required'),
  body('role')
    .isIn(['admin', 'professional', 'reception', 'patient'])
    .withMessage('Valid role is required'),
  body('professionalId')
    .optional()
    .isMongoId()
    .withMessage('Valid professional ID is required'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

const updateUserValidation = [
  param('userId')
    .isMongoId()
    .withMessage('Valid user ID is required'),
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .trim()
    .withMessage('Name must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .isMobilePhone(['es-ES'])
    .withMessage('Valid phone number is required'),
  body('role')
    .optional()
    .isIn(['admin', 'professional', 'reception', 'patient'])
    .withMessage('Valid role is required'),
  body('professionalId')
    .optional()
    .isMongoId()
    .withMessage('Valid professional ID is required'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
  body('preferences')
    .optional()
    .isObject()
    .withMessage('Preferences must be an object'),
];

const getUserValidation = [
  param('userId')
    .isMongoId()
    .withMessage('Valid user ID is required'),
];

const getUsersValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('role')
    .optional()
    .isIn(['admin', 'professional', 'reception', 'patient', 'all'])
    .withMessage('Valid role filter is required'),
  query('isActive')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('isActive must be true or false'),
  query('search')
    .optional()
    .isLength({ min: 1, max: 100 })
    .trim()
    .withMessage('Search term must be between 1 and 100 characters'),
  query('sortBy')
    .optional()
    .isIn(['name', 'email', 'role', 'createdAt', 'updatedAt'])
    .withMessage('Valid sort field is required'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
];

// Routes

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get all users with pagination and filtering
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', 
  normalRateLimit,
  ...requireAuth,
  getUsersValidation,
  validateRequest,
  UserController.getUsers
);

/**
 * @swagger
 * /api/v1/users/stats:
 *   get:
 *     summary: Get user statistics
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/stats', 
  normalRateLimit,
  ...requireAuth,
  authorize('admin', 'reception'),
  UserController.getUserStats
);

/**
 * @swagger
 * /api/v1/users/{userId}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:userId', 
  normalRateLimit,
  ...requireAuth,
  getUserValidation,
  validateRequest,
  UserController.getUserById
);

/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     summary: Create new user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', 
  strictRateLimit,
  ...requireAuth,
  createUserValidation,
  validateRequest,
  UserController.createUser
);

/**
 * @swagger
 * /api/v1/users/{userId}:
 *   put:
 *     summary: Update user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:userId', 
  strictRateLimit,
  ...requireAuth,
  updateUserValidation,
  validateRequest,
  UserController.updateUser
);

/**
 * @swagger
 * /api/v1/users/{userId}:
 *   delete:
 *     summary: Delete or deactivate user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:userId', 
  strictRateLimit,
  ...requireAuth,
  authorize('admin'),
  getUserValidation,
  validateRequest,
  UserController.deleteUser
);

/**
 * @swagger
 * /api/v1/users/{userId}/activate:
 *   post:
 *     summary: Activate user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 */
router.post('/:userId/activate', 
  strictRateLimit,
  ...requireAuth,
  authorize('admin'),
  getUserValidation,
  validateRequest,
  UserController.activateUser
);

export default router;

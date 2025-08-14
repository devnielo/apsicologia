import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import rateLimit from 'express-rate-limit';
import AuthController from '../controllers/auth.controller.js';
import { authenticate, optionalAuth, requireAuth } from '../middleware/auth.js';

const router: Router = Router();

// Rate limiting for authentication routes
const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per window
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later',
    code: 'RATE_LIMIT_AUTH',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const strictAuthRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window for sensitive operations
  message: {
    success: false,
    message: 'Too many attempts, please try again later',
    code: 'RATE_LIMIT_STRICT',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation middleware
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('mfaToken')
    .optional()
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('MFA token must be 6 digits'),
  body('rememberMe')
    .optional()
    .isBoolean()
    .withMessage('Remember me must be a boolean'),
];

const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least 8 characters including uppercase, lowercase, number, and special character'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Valid phone number is required'),
  body('role')
    .optional()
    .isIn(['admin', 'professional', 'reception', 'patient'])
    .withMessage('Invalid role'),
  body('professionalId')
    .optional()
    .isMongoId()
    .withMessage('Valid professional ID is required'),
];

const changePasswordValidation = [
  body('currentPassword')
    .isLength({ min: 8 })
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('New password must contain at least 8 characters including uppercase, lowercase, number, and special character'),
];

const setup2FAValidation = [
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password is required'),
];

const verify2FAValidation = [
  body('token')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('Token must be 6 digits'),
  body('secret')
    .isLength({ min: 16 })
    .withMessage('Secret is required'),
];

const updateProfileValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('phone')
    .optional()
    .isMobilePhone('any')
    .withMessage('Valid phone number is required'),
  body('preferences')
    .optional()
    .isObject()
    .withMessage('Preferences must be an object'),
];

// Validation error handler
const handleValidationErrors = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((error: any) => ({
        field: error.path || error.param || 'unknown',
        message: error.msg,
        value: error.value || undefined,
      })),
    });
  }
  next();
};

// Public routes (no authentication required)

/**
 * @route   POST /api/auth/login
 * @desc    User login with optional 2FA
 * @access  Public
 */
router.post('/login', 
  authRateLimit,
  loginValidation,
  handleValidationErrors,
  AuthController.login
);

/**
 * @route   POST /api/auth/register
 * @desc    User registration (patients can self-register, others require admin)
 * @access  Public/Admin
 */
router.post('/register',
  authRateLimit,
  registerValidation,
  handleValidationErrors,
  optionalAuth, // Allow both authenticated and unauthenticated requests
  AuthController.register
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refresh JWT access token using refresh token
 * @access  Public (requires valid refresh token)
 */
router.post('/refresh',
  authRateLimit,
  AuthController.refreshToken
);

// Protected routes (authentication required)

/**
 * @route   POST /api/auth/logout
 * @desc    User logout (invalidates refresh token)
 * @access  Private
 */
router.post('/logout',
  requireAuth,
  AuthController.logout
);

/**
 * @route   GET /api/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/profile',
  requireAuth,
  AuthController.getProfile
);

/**
 * @route   PUT /api/auth/profile
 * @desc    Update current user profile
 * @access  Private
 */
router.put('/profile',
  requireAuth,
  updateProfileValidation,
  handleValidationErrors,
  AuthController.updateProfile
);

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post('/change-password',
  requireAuth,
  strictAuthRateLimit,
  changePasswordValidation,
  handleValidationErrors,
  AuthController.changePassword
);

// 2FA routes

/**
 * @route   POST /api/auth/2fa/setup
 * @desc    Setup 2FA (generate QR code and secret)
 * @access  Private
 */
router.post('/2fa/setup',
  requireAuth,
  strictAuthRateLimit,
  setup2FAValidation,
  handleValidationErrors,
  AuthController.setup2FA
);

/**
 * @route   POST /api/auth/2fa/verify
 * @desc    Verify and enable 2FA
 * @access  Private
 */
router.post('/2fa/verify',
  requireAuth,
  strictAuthRateLimit,
  verify2FAValidation,
  handleValidationErrors,
  AuthController.verify2FA
);

/**
 * @route   POST /api/auth/2fa/disable
 * @desc    Disable 2FA
 * @access  Private
 */
router.post('/2fa/disable',
  requireAuth,
  strictAuthRateLimit,
  body('password').isLength({ min: 8 }).withMessage('Password is required'),
  handleValidationErrors,
  AuthController.disable2FA
);

// Health check route
/**
 * @route   GET /api/auth/health
 * @desc    Authentication service health check
 * @access  Public
 */
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Authentication service is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

export default router;

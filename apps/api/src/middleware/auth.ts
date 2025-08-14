import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUserDocument } from '../models/User.js';
import { AuditLog } from '../models/AuditLog.js';
import logger from '../config/logger.js';
import env from '../config/env.js';

// Extend Express Request interface
export interface AuthRequest extends Request {
  user?: IUserDocument;
  sessionId?: string;
}

interface JWTPayload {
  userId: string;
  email: string;
  role: 'admin' | 'professional' | 'reception' | 'patient';
  sessionId: string;
  iat: number;
  exp: number;
}

/**
 * Main authentication middleware
 * Validates JWT token and attaches user to request
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token required',
        code: 'TOKEN_MISSING',
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify JWT token
    let decoded: JWTPayload;
    try {
      decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return res.status(401).json({
          success: false,
          message: 'Access token expired',
          code: 'TOKEN_EXPIRED',
        });
      } else if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({
          success: false,
          message: 'Invalid access token',
          code: 'TOKEN_INVALID',
        });
      }
      throw error;
    }

    // Find user by ID
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    // Check if user is still active
    if (!user.isActive) {
      // Log security event
      await logSecurityEvent({
        action: 'access_denied_inactive_user',
        entityType: 'user',
        entityId: user._id.toString(),
        actorId: user._id,
        actorEmail: user.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'failure',
        securityRiskLevel: 'medium',
        sessionId: decoded.sessionId,
      });

      return res.status(403).json({
        success: false,
        message: 'Account is deactivated',
        code: 'ACCOUNT_DEACTIVATED',
      });
    }

    // Check if account is locked
    if ((user as any).isLocked) {
      await logSecurityEvent({
        action: 'access_denied_locked_account',
        entityType: 'user',
        entityId: user._id.toString(),
        actorId: user._id,
        actorEmail: user.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'failure',
        securityRiskLevel: 'high',
        sessionId: decoded.sessionId,
      });

      return res.status(423).json({
        success: false,
        message: 'Account is locked due to suspicious activity',
        code: 'ACCOUNT_LOCKED',
      });
    }

    // Attach user and session to request
    (req as AuthRequest).user = user;
    (req as AuthRequest).sessionId = decoded.sessionId;

    // Update last seen timestamp (throttled to avoid too many DB writes)
    const now = new Date();
    const lastSeen = user.lastLoginAt || new Date(0);
    const timeDiff = now.getTime() - lastSeen.getTime();
    
    // Update only if last seen was more than 5 minutes ago
    if (timeDiff > 5 * 60 * 1000) {
      await User.findByIdAndUpdate(user._id, {
        $set: {
          'activity.lastSeenAt': now,
          'activity.lastIpAddress': req.ip,
        },
      });
    }

    next();
  } catch (error) {
    logger.error('Authentication middleware error:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Authentication service unavailable',
      code: 'AUTH_SERVICE_ERROR',
    });
  }
};

/**
 * Optional authentication middleware
 * Attaches user if token is valid, but doesn't require authentication
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // No token, continue without user
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as JWTPayload;
      const user = await User.findById(decoded.userId);
      
      if (user && user.isActive) {
        (req as AuthRequest).user = user;
        (req as AuthRequest).sessionId = decoded.sessionId;
      }
    } catch (error) {
      // Ignore token errors in optional auth
      logger.debug('Optional auth token error:', error);
    }

    next();
  } catch (error) {
    logger.error('Optional authentication middleware error:', error);
    next(); // Continue even if there's an error
  }
};

/**
 * Role-based authorization middleware factory
 */
export const authorize = (...allowedRoles: Array<'admin' | 'professional' | 'reception' | 'patient'>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authUser = (req as AuthRequest).user;
    
    if (!authUser) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
    }

    if (!allowedRoles.includes(authUser.role)) {
      // Log authorization failure
      logSecurityEvent({
        action: 'authorization_denied',
        entityType: 'user',
        entityId: authUser._id.toString(),
        actorId: authUser._id,
        actorEmail: authUser.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'failure',
        securityRiskLevel: 'medium',
        sessionId: (req as AuthRequest).sessionId,
        errorMessage: `Role ${authUser.role} not authorized for ${req.method} ${req.path}`,
      }).catch(error => logger.error('Failed to log authorization failure:', error));

      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: allowedRoles,
        userRole: authUser.role,
      });
    }

    next();
  };
};

/**
 * Resource ownership authorization
 * Ensures user can only access their own resources or is admin/professional
 */
export const authorizeOwnershipOrRole = (
  resourceUserIdField: string = 'userId',
  allowedRoles: Array<'admin' | 'professional' | 'reception'> = ['admin']
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const authUser = (req as AuthRequest).user;
    
    if (!authUser) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
    }

    // Admin and specified roles can access all resources
    if (allowedRoles.includes(authUser.role as any)) {
      return next();
    }

    // Check resource ownership
    const resourceUserId = req.params[resourceUserIdField] || 
                          req.body[resourceUserIdField] || 
                          req.query[resourceUserIdField];

    if (!resourceUserId) {
      return res.status(400).json({
        success: false,
        message: 'Resource user ID not provided',
        code: 'RESOURCE_USER_ID_MISSING',
      });
    }

    if (resourceUserId !== authUser._id.toString()) {
      // Log unauthorized access attempt
      logSecurityEvent({
        action: 'unauthorized_resource_access',
        entityType: 'user',
        entityId: authUser._id.toString(),
        actorId: authUser._id,
        actorEmail: authUser.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'failure',
        securityRiskLevel: 'high',
        sessionId: (req as AuthRequest).sessionId,
        errorMessage: `User attempted to access resource belonging to ${resourceUserId}`,
      }).catch(error => logger.error('Failed to log unauthorized access:', error));

      return res.status(403).json({
        success: false,
        message: 'Access denied: You can only access your own resources',
        code: 'RESOURCE_ACCESS_DENIED',
      });
    }

    next();
  };
};

/**
 * Professional scope authorization
 * Ensures professional can only access patients assigned to them
 */
export const authorizeProfessionalScope = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const authUser = (req as AuthRequest).user;
    
    if (!authUser) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
    }

    // Admin can access everything
    if (authUser.role === 'admin') {
      return next();
    }

    // Professional can only access their own patients/appointments
    if (authUser.role === 'professional') {
      // Add professional filter to query
      if (req.method === 'GET') {
        req.query.professionalId = authUser.professionalId?.toString();
      } else if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
        req.body.professionalId = authUser.professionalId;
      }
      
      return next();
    }

    // Reception can access all (business logic)
    if (authUser.role === 'reception') {
      return next();
    }

    // Patients can only access their own data (handled by other middleware)
    return res.status(403).json({
      success: false,
      message: 'Insufficient permissions',
      code: 'INSUFFICIENT_PERMISSIONS',
    });
  };
};

/**
 * Rate limiting per user
 */
export const rateLimitPerUser = (maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) => {
  const requestCounts = new Map<string, { count: number; resetTime: number }>();

  return (req: Request, res: Response, next: NextFunction) => {
    const authUser = (req as AuthRequest).user;
    const key = authUser ? `user:${authUser._id}` : `ip:${req.ip}`;
    const now = Date.now();

    const userRequests = requestCounts.get(key);

    if (!userRequests || now > userRequests.resetTime) {
      // Initialize or reset counter
      requestCounts.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return next();
    }

    if (userRequests.count >= maxRequests) {
      // Log rate limit exceeded
      if (authUser) {
        logSecurityEvent({
          action: 'rate_limit_exceeded',
          entityType: 'user',
          entityId: authUser._id.toString(),
          actorId: authUser._id,
          actorEmail: authUser.email,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          status: 'failure',
          securityRiskLevel: 'medium',
          sessionId: (req as AuthRequest).sessionId,
        }).catch(error => logger.error('Failed to log rate limit:', error));
      }

      return res.status(429).json({
        success: false,
        message: 'Too many requests',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: Math.ceil((userRequests.resetTime - now) / 1000),
      });
    }

    // Increment counter
    userRequests.count++;
    next();
  };
};

/**
 * Session validation middleware
 * Ensures the session is still valid
 */
export const validateSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authUser = (req as AuthRequest).user;
    const sessionId = (req as AuthRequest).sessionId;

    if (!authUser || !sessionId) {
      return next(); // Let other middleware handle authentication
    }

    // Check if session is blacklisted (for logout, password change, etc.)
    const isSessionValid = await (authUser as any).isValidSession?.(sessionId);
    if (isSessionValid === false) {
      return res.status(401).json({
        success: false,
        message: 'Session has been invalidated',
        code: 'SESSION_INVALID',
      });
    }

    next();
  } catch (error) {
    logger.error('Session validation error:', error);
    next(); // Continue on error
  }
};

/**
 * Security headers middleware
 */
export const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Set security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  if (env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }

  next();
};

/**
 * Helper function to log security events
 */
async function logSecurityEvent({
  action,
  entityType,
  entityId,
  actorId,
  actorEmail,
  ipAddress,
  userAgent,
  status,
  errorMessage,
  securityRiskLevel,
  sessionId,
}: {
  action: string;
  entityType: string;
  entityId: string;
  actorId?: any;
  actorEmail?: string;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failure' | 'error';
  errorMessage?: string;
  securityRiskLevel: 'none' | 'low' | 'medium' | 'high' | 'critical';
  sessionId?: string;
}) {
  try {
    const auditLog = new AuditLog({
      action,
      entityType,
      entityId,
      actorId,
      actorType: actorId ? 'user' : 'external',
      actorEmail,
      ipAddress,
      userAgent,
      status,
      errorMessage,
      sessionId,
      security: {
        riskLevel: securityRiskLevel,
        authMethod: 'jwt',
        compliance: {
          hipaaRelevant: false,
          gdprRelevant: true,
          requiresRetention: true,
        },
      },
      business: {
        clinicalRelevant: false,
        containsPHI: false,
        dataClassification: 'internal',
      },
      metadata: {
        source: 'auth_middleware',
        priority: securityRiskLevel === 'critical' ? 'critical' : 
                 securityRiskLevel === 'high' ? 'high' : 'medium',
      },
      timestamp: new Date(),
    });

    await auditLog.save();
  } catch (error) {
    logger.error('Failed to log security event:', error);
  }
}

// Export commonly used middleware combinations
export const requireAuth = [authenticate, validateSession];
export const requireAdmin = [authenticate, validateSession, authorize('admin')];
export const requireProfessional = [authenticate, validateSession, authorize('admin', 'professional')];
export const requireReception = [authenticate, validateSession, authorize('admin', 'professional', 'reception')];
export const requirePatient = [authenticate, validateSession, authorize('patient')];

export default {
  authenticate,
  optionalAuth,
  authorize,
  authorizeOwnershipOrRole,
  authorizeProfessionalScope,
  rateLimitPerUser,
  validateSession,
  securityHeaders,
  requireAuth,
  requireAdmin,
  requireProfessional,
  requireReception,
  requirePatient,
};

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { User, IUserDocument } from '../models/User.js';
import { AuditLog } from '../models/AuditLog.js';
import logger from '../config/logger.js';
import env from '../config/env.js';

interface AuthRequest extends Request {
  user?: IUserDocument;
  sessionId?: string;
}

interface LoginRequest {
  email: string;
  password: string;
  mfaToken?: string;
  rememberMe?: boolean;
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: 'admin' | 'professional' | 'reception' | 'patient';
  professionalId?: string;
}

interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

interface ForgotPasswordRequest {
  email: string;
}

interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

interface Setup2FARequest {
  password: string;
}

interface Verify2FARequest {
  token: string;
  secret: string;
}

export class AuthController {
  /**
   * User login with optional 2FA
   */
  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, mfaToken, rememberMe = false } = req.body as LoginRequest;
      const ipAddress = req.ip;
      const userAgent = req.get('User-Agent');

      // Input validation
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required',
        });
      }

      // Find user by email
      const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
      if (!user) {
        // Log failed login attempt
        await AuthController.logSecurityEvent({
          action: 'login_failed',
          entityType: 'user',
          entityId: email,
          actorEmail: email,
          ipAddress,
          userAgent,
          status: 'failure',
          errorMessage: 'Invalid credentials',
          securityRiskLevel: 'medium',
        });

        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Account is deactivated. Please contact support.',
        });
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        // Increment failed login attempts (using the method from the model)
        await user.incLoginAttempts();

        await AuthController.logSecurityEvent({
          action: 'login_failed',
          entityType: 'user',
          entityId: user._id.toString(),
          actorId: user._id,
          actorEmail: user.email,
          ipAddress,
          userAgent,
          status: 'failure',
          errorMessage: 'Invalid password',
          securityRiskLevel: 'medium',
        });

        return res.status(401).json({
          success: false,
          message: 'Invalid credentials',
        });
      }

      // Check if account is locked
      if (user.isLocked) {
        await AuthController.logSecurityEvent({
          action: 'login_attempted_locked_account',
          entityType: 'user',
          entityId: user._id.toString(),
          actorId: user._id,
          actorEmail: user.email,
          ipAddress,
          userAgent,
          status: 'failure',
          errorMessage: 'Account locked due to too many failed attempts',
          securityRiskLevel: 'high',
        });

        return res.status(423).json({
          success: false,
          message: `Account locked. Try again after ${user.lockedUntil}`,
        });
      }

      // Check 2FA if enabled
      if (user.isTwoFactorEnabled) {
        if (!mfaToken) {
          return res.status(200).json({
            success: false,
            requiresMfa: true,
            message: '2FA token required',
          });
        }

        const isValidToken = speakeasy.totp.verify({
          secret: user.twoFactorSecret!,
          encoding: 'base32',
          token: mfaToken,
          window: 2, // Allow 2 time steps tolerance
        });

        if (!isValidToken) {
          await AuthController.logSecurityEvent({
            action: 'mfa_failed',
            entityType: 'user',
            entityId: user._id.toString(),
            actorId: user._id,
            actorEmail: user.email,
            ipAddress,
            userAgent,
            status: 'failure',
            errorMessage: 'Invalid 2FA token',
            securityRiskLevel: 'high',
          });

          return res.status(401).json({
            success: false,
            message: 'Invalid 2FA token',
          });
        }
      }

      // Generate session ID
      const sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Generate JWT tokens
      const accessTokenExpiry = rememberMe ? '7d' : '15m';
      const refreshTokenExpiry = rememberMe ? '30d' : '7d';

      const accessToken = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          role: user.role,
          sessionId,
        },
        env.JWT_SECRET,
        { expiresIn: accessTokenExpiry }
      );

      const refreshToken = jwt.sign(
        {
          userId: user._id,
          sessionId,
          type: 'refresh',
        },
        env.JWT_REFRESH_SECRET,
        { expiresIn: refreshTokenExpiry }
      );

      // Update user login info and reset login attempts on successful login
      user.lastLoginAt = new Date();
      user.lastLoginIP = ipAddress;
      await user.resetLoginAttempts();

      // Log successful login
      await AuthController.logSecurityEvent({
        action: 'login_successful',
        entityType: 'user',
        entityId: user._id.toString(),
        actorId: user._id,
        actorEmail: user.email,
        ipAddress,
        userAgent,
        status: 'success',
        securityRiskLevel: 'none',
        sessionId,
      });

      // Prepare user data (exclude sensitive fields)
      const userData = {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        professionalId: user.professionalId,
        preferences: user.preferences,
        lastLoginAt: user.lastLoginAt,
        hasEnabledMfa: user.isTwoFactorEnabled,
      };

      // Set HTTP-only cookie for refresh token
      res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000, // 30 days or 7 days
      });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: userData,
          accessToken,
          expiresIn: accessTokenExpiry,
        },
      });
    } catch (error) {
      logger.error('Login error:', error);
      next(error);
    }
  }

  /**
   * User registration (admin only for professionals/reception)
   */
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const { email, password, name, phone, role = 'patient', professionalId } = req.body as RegisterRequest;
      const ipAddress = req.ip;
      const userAgent = req.get('User-Agent');

      // Input validation
      if (!email || !password || !name) {
        return res.status(400).json({
          success: false,
          message: 'Email, password, and name are required',
        });
      }

      // Check if user exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User already exists with this email',
        });
      }

      // For non-patient roles, require admin permission
      const authUser = (req as AuthRequest).user;
      if (role !== 'patient' && (!authUser || authUser.role !== 'admin')) {
        return res.status(403).json({
          success: false,
          message: 'Admin permission required to create non-patient users',
        });
      }

      // Create new user
      const user = new User({
        email: email.toLowerCase(),
        password, // Will be hashed by pre-save middleware
        name,
        phone,
        role,
        professionalId: professionalId ? professionalId : undefined,
        isActive: role === 'patient', // Patients are active by default
        registrationInfo: {
          ipAddress,
          userAgent,
          source: 'web_registration',
        },
      });

      await user.save();

      // Log registration
      await AuthController.logSecurityEvent({
        action: 'user_registered',
        entityType: 'user',
        entityId: user._id.toString(),
        actorId: authUser?._id,
        actorEmail: authUser?.email,
        ipAddress,
        userAgent,
        status: 'success',
        securityRiskLevel: 'none',
      });

      // Prepare response data (exclude sensitive fields)
      const userData = {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      };

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: { user: userData },
      });
    } catch (error) {
      logger.error('Registration error:', error);
      next(error);
    }
  }

  /**
   * Refresh JWT access token
   */
  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token required',
        });
      }

      // Verify refresh token
      const decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as any;
      
      // Find user and validate refresh token
      const user = await User.findById(decoded.userId);
      if (!user || !(user as any).isValidRefreshToken(refreshToken)) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token',
        });
      }

      // Generate new access token
      const newAccessToken = jwt.sign(
        {
          userId: user._id,
          email: user.email,
          role: user.role,
          sessionId: decoded.sessionId,
        },
        env.JWT_SECRET,
        { expiresIn: '15m' }
      );

      res.status(200).json({
        success: true,
        data: {
          accessToken: newAccessToken,
          expiresIn: '15m',
        },
      });
    } catch (error) {
      logger.error('Token refresh error:', error);
      
      if (error instanceof jwt.JsonWebTokenError) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token',
        });
      }
      
      next(error);
    }
  }

  /**
   * User logout
   */
  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user;
      const sessionId = (req as AuthRequest).sessionId;
      const refreshToken = req.cookies.refreshToken;

      if (authUser && refreshToken) {
        // Remove refresh token from user
        await (authUser as any).removeRefreshToken(refreshToken);

        // Log logout
        await AuthController.logSecurityEvent({
          action: 'logout',
          entityType: 'user',
          entityId: authUser._id.toString(),
          actorId: authUser._id,
          actorEmail: authUser.email,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          status: 'success',
          securityRiskLevel: 'none',
          sessionId,
        });
      }

      // Clear refresh token cookie
      res.clearCookie('refreshToken');

      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      logger.error('Logout error:', error);
      next(error);
    }
  }

  /**
   * Change password
   */
  static async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const { currentPassword, newPassword } = req.body as ChangePasswordRequest;
      const authUser = (req as AuthRequest).user!;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password and new password are required',
        });
      }

      // Get user with password
      const user = await User.findById(authUser._id).select('+password');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, (user as any).password);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect',
        });
      }

      // Update password
      (user as any).password = newPassword; // Will be hashed by pre-save middleware
      (user as any).passwordChangedAt = new Date();
      
      // Invalidate all refresh tokens to force re-login
      (user as any).refreshTokens = [];
      
      await user.save();

      // Log password change
      await AuthController.logSecurityEvent({
        action: 'password_changed',
        entityType: 'user',
        entityId: user._id.toString(),
        actorId: user._id,
        actorEmail: user.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'success',
        securityRiskLevel: 'low',
      });

      res.status(200).json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      logger.error('Change password error:', error);
      next(error);
    }
  }

  /**
   * Setup 2FA (generate QR code)
   */
  static async setup2FA(req: Request, res: Response, next: NextFunction) {
    try {
      const { password } = req.body as Setup2FARequest;
      const authUser = (req as AuthRequest).user!;

      if (!password) {
        return res.status(400).json({
          success: false,
          message: 'Password is required to setup 2FA',
        });
      }

      // Get user with password
      const user = await User.findById(authUser._id).select('+password');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, (user as any).password);
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid password',
        });
      }

      // Generate secret
      const secret = speakeasy.generateSecret({
        name: `apsicologia (${user.email})`,
        issuer: 'apsicologia',
      });

      // Generate QR code
      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

      // Store secret temporarily (not enabled yet)
      (user as any).twoFactorAuth.tempSecret = secret.base32;
      await user.save();

      res.status(200).json({
        success: true,
        message: '2FA setup initiated',
        data: {
          secret: secret.base32,
          qrCode: qrCodeUrl,
          manualEntryKey: secret.base32,
        },
      });
    } catch (error) {
      logger.error('Setup 2FA error:', error);
      next(error);
    }
  }

  /**
   * Verify and enable 2FA
   */
  static async verify2FA(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, secret } = req.body as Verify2FARequest;
      const authUser = (req as AuthRequest).user!;

      if (!token || !secret) {
        return res.status(400).json({
          success: false,
          message: 'Token and secret are required',
        });
      }

      const user = await User.findById(authUser._id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Verify the token
      const isValidToken = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window: 2,
      });

      if (!isValidToken) {
        return res.status(400).json({
          success: false,
          message: 'Invalid token',
        });
      }

      // Enable 2FA
      (user as any).twoFactorAuth.isEnabled = true;
      (user as any).twoFactorAuth.secret = secret;
      (user as any).twoFactorAuth.backupCodes = (user as any).generateBackupCodes();
      (user as any).twoFactorAuth.tempSecret = undefined;
      
      await user.save();

      // Log 2FA enabled
      await AuthController.logSecurityEvent({
        action: '2fa_enabled',
        entityType: 'user',
        entityId: user._id.toString(),
        actorId: user._id,
        actorEmail: user.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'success',
        securityRiskLevel: 'low',
      });

      res.status(200).json({
        success: true,
        message: '2FA enabled successfully',
        data: {
          backupCodes: (user as any).twoFactorAuth.backupCodes,
        },
      });
    } catch (error) {
      logger.error('Verify 2FA error:', error);
      next(error);
    }
  }

  /**
   * Disable 2FA
   */
  static async disable2FA(req: Request, res: Response, next: NextFunction) {
    try {
      const { password } = req.body;
      const authUser = (req as AuthRequest).user!;

      if (!password) {
        return res.status(400).json({
          success: false,
          message: 'Password is required to disable 2FA',
        });
      }

      // Get user with password
      const user = await User.findById(authUser._id).select('+password');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, (user as any).password);
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Invalid password',
        });
      }

      // Disable 2FA
      (user as any).twoFactorAuth.isEnabled = false;
      (user as any).twoFactorAuth.secret = undefined;
      (user as any).twoFactorAuth.backupCodes = [];
      
      await user.save();

      // Log 2FA disabled
      await AuthController.logSecurityEvent({
        action: '2fa_disabled',
        entityType: 'user',
        entityId: user._id.toString(),
        actorId: user._id,
        actorEmail: user.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'success',
        securityRiskLevel: 'medium',
      });

      res.status(200).json({
        success: true,
        message: '2FA disabled successfully',
      });
    } catch (error) {
      logger.error('Disable 2FA error:', error);
      next(error);
    }
  }

  /**
   * Get current user profile
   */
  static async getProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user!;

      // Get complete user profile
      const user = await User.findById(authUser._id).populate('professionalId');
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      const userData = {
        id: user._id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
        professionalId: user.professionalId,
        preferences: user.preferences,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        has2FA: user.isTwoFactorEnabled,
        profileCompleteness: 100, // Simplified for now
      };

      res.status(200).json({
        success: true,
        data: { user: userData },
      });
    } catch (error) {
      logger.error('Get profile error:', error);
      next(error);
    }
  }

  /**
   * Update user profile
   */
  static async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user!;
      const { name, phone, preferences } = req.body;

      const user = await User.findById(authUser._id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Update allowed fields
      if (name) user.name = name;
      if (phone) user.phone = phone;
      if (preferences) user.preferences = { ...user.preferences, ...preferences };

      await user.save();

      // Log profile update
      await AuthController.logSecurityEvent({
        action: 'profile_updated',
        entityType: 'user',
        entityId: user._id.toString(),
        actorId: user._id,
        actorEmail: user.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'success',
        securityRiskLevel: 'none',
      });

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user: {
            id: user._id,
            name: user.name,
            phone: user.phone,
            preferences: user.preferences,
          },
        },
      });
    } catch (error) {
      logger.error('Update profile error:', error);
      next(error);
    }
  }

  /**
   * Helper method to log security events
   */
  private static async logSecurityEvent({
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
          source: 'auth_controller',
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
}

export default AuthController;

import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { User, IUserDocument } from '../models/User.js';
import { Professional } from '../models/Professional.js';
import { AuditLog } from '../models/AuditLog.js';
import logger from '../config/logger.js';
import { AuthRequest } from '../middleware/auth.js';

interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role: 'admin' | 'professional' | 'reception' | 'patient';
  professionalId?: string;
  isActive?: boolean;
}

interface UpdateUserRequest {
  name?: string;
  phone?: string;
  role?: 'admin' | 'professional' | 'reception' | 'patient';
  professionalId?: string;
  isActive?: boolean;
  preferences?: Record<string, any>;
}

interface UserQuery {
  page?: string;
  limit?: string;
  role?: string;
  isActive?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class UserController {
  /**
   * Get all users with pagination and filtering
   */
  static async getUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user!;
      const {
        page = '1',
        limit = '20',
        role,
        isActive,
        search,
        sortBy = 'createdAt',
        sortOrder = 'desc',
      } = req.query as UserQuery;

      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;

      // Build filter
      const filter: any = {};

      if (role && role !== 'all') {
        filter.role = role;
      }

      if (isActive !== undefined) {
        filter.isActive = isActive === 'true';
      }

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
        ];
      }

      // Professionals can only see their own patients
      if (authUser.role === 'professional' && authUser.professionalId) {
        // Add filter to only show patients assigned to this professional
        const professionalPatients = await User.find({
          role: 'patient',
          professionalId: authUser.professionalId,
        }).select('_id');
        
        const patientIds = professionalPatients.map(p => p._id);
        filter.$and = [
          filter.$and || {},
          {
            $or: [
              { _id: authUser._id }, // Can see themselves
              { _id: { $in: patientIds } }, // Can see their patients
            ],
          },
        ];
      }

      // Build sort
      const sort: any = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Execute queries
      const [users, total] = await Promise.all([
        User.find(filter)
          .populate('professionalId', 'name specialties')
          .sort(sort)
          .skip(skip)
          .limit(limitNum)
          .select('-password -refreshTokens -twoFactorAuth.secret -twoFactorAuth.backupCodes'),
        User.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / limitNum);

      res.status(200).json({
        success: true,
        data: {
          users,
          pagination: {
            currentPage: pageNum,
            totalPages,
            totalUsers: total,
            hasNext: pageNum < totalPages,
            hasPrev: pageNum > 1,
          },
        },
      });
    } catch (error) {
      logger.error('Get users error:', error);
      next(error);
    }
  }

  /**
   * Get user by ID
   */
  static async getUserById(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const authUser = (req as AuthRequest).user!;

      // Check permissions
      if (
        authUser.role !== 'admin' &&
        authUser.role !== 'reception' &&
        userId !== authUser._id.toString()
      ) {
        // Professionals can see their patients
        if (authUser.role === 'professional' && authUser.professionalId) {
          const targetUser = await User.findById(userId);
          if (!targetUser || targetUser.role !== 'patient' || 
              targetUser.professionalId?.toString() !== authUser.professionalId.toString()) {
            return res.status(403).json({
              success: false,
              message: 'Access denied: Cannot view this user',
            });
          }
        } else {
          return res.status(403).json({
            success: false,
            message: 'Access denied: Cannot view this user',
          });
        }
      }

      const user = await User.findById(userId)
        .populate('professionalId', 'name specialties email phone')
        .select('-password -refreshTokens -twoFactorAuth.secret -twoFactorAuth.backupCodes');

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (error) {
      logger.error('Get user by ID error:', error);
      next(error);
    }
  }

  /**
   * Create new user
   */
  static async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user!;
      const { email, password, name, phone, role, professionalId, isActive = true } = req.body as CreateUserRequest;

      // Only admin can create non-patient users
      if (role !== 'patient' && authUser.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Only administrators can create professional accounts',
        });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User already exists with this email',
        });
      }

      // Validate professional ID if provided
      if (professionalId) {
        const professional = await Professional.findById(professionalId);
        if (!professional) {
          return res.status(400).json({
            success: false,
            message: 'Invalid professional ID',
          });
        }
      }

      // Create user
      const userData = {
        email: email.toLowerCase(),
        password,
        name,
        phone,
        role,
        professionalId: professionalId || undefined,
        isActive,
        registrationInfo: {
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          source: 'admin_created',
        },
      };

      const user = new User(userData);
      await user.save();

      // Log user creation
      await AuditLog.create({
        action: 'user_created',
        entityType: 'user',
        entityId: user._id.toString(),
        actorId: authUser._id,
        actorType: 'user',
        actorEmail: authUser.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'success',
        changes: [
          {
            field: 'role',
            newValue: user.role,
            changeType: 'create',
          },
          {
            field: 'email',
            newValue: user.email,
            changeType: 'create',
          },
        ],
        metadata: {
          source: 'user_controller',
          customFields: {
            role: user.role,
            email: user.email,
          },
        },
        alerting: {
          threshold: 'medium',
          channels: ['email', 'slack'],
        },
        retention: {
          policy: 'default',
          duration: '7y',
        },
        related: [
          { type: 'user', id: user._id.toString() },
          { type: 'user', id: authUser._id.toString() },
        ],
        timestamp: new Date(),
      });

      // Remove sensitive data from response
      const userResponse = user.toObject();
      delete (userResponse as any).password;
      delete (userResponse as any).refreshTokens;
      delete (userResponse as any).twoFactorAuth;

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: { user: userResponse },
      });
    } catch (error) {
      logger.error('Create user error:', error);
      next(error);
    }
  }

  /**
   * Update user
   */
  static async updateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const authUser = (req as AuthRequest).user!;
      const updateData = req.body as UpdateUserRequest;

      // Find user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Check permissions
      const canUpdate = 
        authUser.role === 'admin' ||
        (authUser.role === 'reception' && ['patient', 'reception'].includes(user.role)) ||
        (authUser._id.toString() === userId && !updateData.role && !updateData.isActive);

      if (!canUpdate) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot update this user',
        });
      }

      // Store original values for audit
      const originalValues = {
        name: user.name,
        phone: user.phone,
        role: user.role,
        professionalId: user.professionalId,
        isActive: user.isActive,
        preferences: user.preferences,
      };

      // Validate professional ID if changing
      if (updateData.professionalId && updateData.professionalId !== user.professionalId?.toString()) {
        const professional = await Professional.findById(updateData.professionalId);
        if (!professional) {
          return res.status(400).json({
            success: false,
            message: 'Invalid professional ID',
          });
        }
      }

      // Update allowed fields
      if (updateData.name !== undefined) user.name = updateData.name;
      if (updateData.phone !== undefined) user.phone = updateData.phone;
      if (updateData.preferences !== undefined) {
        user.preferences = { ...user.preferences, ...updateData.preferences };
      }

      // Only admin and reception can change these
      if (authUser.role === 'admin' || authUser.role === 'reception') {
        if (updateData.role !== undefined) user.role = updateData.role;
        if (updateData.professionalId !== undefined) {
          user.professionalId = updateData.professionalId 
            ? new Types.ObjectId(updateData.professionalId) 
            : undefined;
        }
        if (updateData.isActive !== undefined) user.isActive = updateData.isActive;
      }

      await user.save();

      // Build changes object for audit
      const changes: any = {};
      Object.keys(originalValues).forEach(key => {
        const originalValue = (originalValues as any)[key];
        const newValue = (user as any)[key];
        if (JSON.stringify(originalValue) !== JSON.stringify(newValue)) {
          changes[key] = { from: originalValue, to: newValue };
        }
      });

      // Log user update if there were changes
      if (Object.keys(changes).length > 0) {
        await AuditLog.create({
          action: 'user_updated',
          entityType: 'user',
          entityId: user._id.toString(),
          actorId: authUser._id,
          actorType: 'user',
          actorEmail: authUser.email,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          status: 'success',
          changes: Object.keys(changes).map(field => ({
            field,
            oldValue: changes[field].from,
            newValue: changes[field].to,
            changeType: 'update',
          })),
          metadata: {
            source: 'user_controller',
            priority: 'medium',
          },
          timestamp: new Date(),
        });
      }

      // Populate and return updated user
      const updatedUser = await User.findById(userId)
        .populate('professionalId', 'name specialties')
        .select('-password -refreshTokens -twoFactorAuth.secret -twoFactorAuth.backupCodes');

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: { user: updatedUser },
      });
    } catch (error) {
      logger.error('Update user error:', error);
      next(error);
    }
  }

  /**
   * Delete/Deactivate user
   */
  static async deleteUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const authUser = (req as AuthRequest).user!;
      const { permanent = false } = req.query;

      // Find user
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      // Check permissions
      if (authUser.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Only administrators can delete users',
        });
      }

      // Prevent self-deletion
      if (user._id.toString() === authUser._id.toString()) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete your own account',
        });
      }

      let message: string;
      let action: string;
      const isPermanentDelete = permanent === 'true';

      if (isPermanentDelete) {
        // Check if user has related data that would prevent deletion
        // This is where you'd check for appointments, payments, etc.
        // For now, we'll just mark as deleted
        user.isActive = false;
        user.email = `deleted_${Date.now()}_${user.email}`;
        await user.save();
        
        message = 'User permanently deleted';
        action = 'user_permanently_deleted';
      } else {
        // Soft delete - just deactivate
        user.isActive = false;
        await user.save();
        
        message = 'User deactivated successfully';
        action = 'user_deactivated';
      }

      // Log user deletion/deactivation
      await AuditLog.create({
        action,
        entityType: 'user',
        entityId: user._id.toString(),
        actorId: authUser._id,
        actorType: 'user',
        actorEmail: authUser.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'success',
        changes: [
          {
            field: 'isActive',
            oldValue: true,
            newValue: false,
            changeType: 'update',
          },
          {
            field: 'deletedAt',
            oldValue: null,
            newValue: new Date(),
            changeType: 'update',
          },
          {
            field: 'permanentDelete',
            oldValue: false,
            newValue: isPermanentDelete,
            changeType: 'update',
          },
        ],
        metadata: {
          source: 'user_controller',
          customFields: {
            userId: user._id.toString(),
            email: user.email,
          },
        },
        alerting: {
          threshold: 'high',
          channels: ['email', 'slack'],
        },
        retention: {
          policy: 'user_data',
          duration: '7y',
        },
        related: [
          { type: 'user', id: user._id.toString() },
          { type: 'user', id: authUser._id.toString() },
        ],
        timestamp: new Date(),
      });

      res.status(200).json({
        success: true,
        message,
      });
    } catch (error) {
      logger.error('Delete user error:', error);
      next(error);
    }
  }

  /**
   * Get user statistics
   */
  static async getUserStats(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user!;

      // Only admin and reception can see stats
      if (authUser.role !== 'admin' && authUser.role !== 'reception') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Insufficient permissions',
        });
      }

      const [
        totalUsers,
        activeUsers,
        usersByRole,
        recentUsers,
      ] = await Promise.all([
        User.countDocuments(),
        User.countDocuments({ isActive: true }),
        User.aggregate([
          { $group: { _id: '$role', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        User.find({ isActive: true })
          .sort({ createdAt: -1 })
          .limit(10)
          .select('name email role createdAt')
          .populate('professionalId', 'name'),
      ]);

      const stats = {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
        byRole: usersByRole.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {} as Record<string, number>),
        recent: recentUsers,
      };

      res.status(200).json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      logger.error('Get user stats error:', error);
      next(error);
    }
  }

  /**
   * Activate/Reactivate user
   */
  static async activateUser(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;
      const authUser = (req as AuthRequest).user!;

      // Only admin can activate users
      if (authUser.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Only administrators can activate users',
        });
      }

      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found',
        });
      }

      if (user.isActive) {
        return res.status(400).json({
          success: false,
          message: 'User is already active',
        });
      }

      user.isActive = true;
      await user.save();

      // Log user activation
      await AuditLog.create({
        action: 'user_activated',
        entityType: 'user',
        entityId: user._id.toString(),
        actorId: authUser._id,
        actorType: 'user',
        actorEmail: authUser.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'success',
        changes: [
          {
            field: 'isActive',
            oldValue: false,
            newValue: true,
            changeType: 'update',
          },
        ],
        metadata: {
          source: 'user_controller',
          priority: 'medium',
        },
        timestamp: new Date(),
      });

      res.status(200).json({
        success: true,
        message: 'User activated successfully',
      });
    } catch (error) {
      logger.error('Activate user error:', error);
      next(error);
    }
  }
}

export default UserController;

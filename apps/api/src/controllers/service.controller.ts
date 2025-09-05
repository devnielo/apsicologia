import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Service, IServiceDocument } from '../models/Service.js';
import { Professional } from '../models/Professional.js';
import { AuditLog } from '../models/AuditLog.js';
import logger from '../config/logger.js';
import { AuthRequest } from '../middleware/auth.js';

interface CreateServiceRequest {
  name: string;
  description?: string;
  durationMinutes: number;
  price: number;
  currency?: string;
  color?: string;
  category?: string;
  tags?: string[];
  isOnlineAvailable?: boolean;
  requiresApproval?: boolean;
  availableTo?: string[]; // Professional IDs
  isPubliclyBookable?: boolean;
  settings?: {
    maxAdvanceBookingDays?: number;
    minAdvanceBookingHours?: number;
    allowSameDayBooking?: boolean;
    bufferBefore?: number;
    bufferAfter?: number;
    maxConcurrentBookings?: number;
    requiresIntake?: boolean;
    intakeFormId?: string;
  };
  preparation?: {
    instructions?: string;
    requiredDocuments?: string[];
    recommendedDuration?: number;
  };
  followUp?: {
    instructions?: string;
    scheduledTasks?: string[];
    recommendedGap?: number;
  };
}

interface UpdateServiceRequest {
  name?: string;
  description?: string;
  durationMinutes?: number;
  price?: number;
  currency?: string;
  color?: string;
  category?: string;
  tags?: string[];
  isActive?: boolean;
  isOnlineAvailable?: boolean;
  requiresApproval?: boolean;
  isPubliclyBookable?: boolean;
  settings?: Partial<CreateServiceRequest['settings']>;
  preparation?: Partial<CreateServiceRequest['preparation']>;
  followUp?: Partial<CreateServiceRequest['followUp']>;
}

interface ServiceQuery {
  page?: string;
  limit?: string;
  search?: string;
  category?: string;
  isActive?: string;
  isPubliclyBookable?: string;
  isOnlineAvailable?: string;
  minPrice?: string;
  maxPrice?: string;
  minDuration?: string;
  maxDuration?: string;
  professionalId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  include?: string;
}

export class ServiceController {
  /**
   * Get all services with pagination and filtering
   */
  static async getServices(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user!;
      const {
        page = '1',
        limit = '20',
        search,
        category,
        isActive,
        isPubliclyBookable,
        isOnlineAvailable,
        minPrice,
        maxPrice,
        minDuration,
        maxDuration,
        professionalId,
        sortBy = 'name',
        sortOrder = 'asc',
        include,
      } = req.query as ServiceQuery;

      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;

      // Build filter
      const filter: any = { deletedAt: null };

      // Apply filters based on query params
      if (search) {
        filter.$text = { $search: search };
      }

      if (category) {
        filter.category = new RegExp(category, 'i');
      }

      if (isActive !== undefined) {
        filter.isActive = isActive === 'true';
      }

      if (isPubliclyBookable !== undefined) {
        filter.isPubliclyBookable = isPubliclyBookable === 'true';
      }

      if (isOnlineAvailable !== undefined) {
        filter.isOnlineAvailable = isOnlineAvailable === 'true';
      }

      if (minPrice || maxPrice) {
        filter.price = {};
        if (minPrice) filter.price.$gte = parseFloat(minPrice);
        if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
      }

      if (minDuration || maxDuration) {
        filter.durationMinutes = {};
        if (minDuration) filter.durationMinutes.$gte = parseInt(minDuration, 10);
        if (maxDuration) filter.durationMinutes.$lte = parseInt(maxDuration, 10);
      }

      if (professionalId) {
        filter.$or = [
          { availableTo: { $size: 0 } }, // Available to all
          { availableTo: new Types.ObjectId(professionalId) }
        ];
      }

      // Apply role-based filtering
      if (authUser.role === 'professional') {
        // Professional can only see services available to them or all
        filter.$or = [
          { availableTo: { $size: 0 } },
          { availableTo: authUser.professionalId }
        ];
      } else if (authUser.role === 'patient') {
        // Patients can only see active, publicly bookable services
        filter.isActive = true;
        filter.isPubliclyBookable = true;
      }

      // Build sort
      const sort: any = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Execute queries
      let query = Service.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum);

      // Add population based on include parameter
      if (include) {
        const includeFields = include.split(',');
        
        if (includeFields.includes('professionals') && authUser.role !== 'patient') {
          query = query.populate('availableTo', 'name title specialties');
        }
      }

      const [services, total] = await Promise.all([
        query.exec(),
        Service.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / limitNum);

      res.status(200).json({
        success: true,
        data: {
          services,
          pagination: {
            currentPage: pageNum,
            totalPages,
            totalServices: total,
            hasNext: pageNum < totalPages,
            hasPrev: pageNum > 1,
          },
        },
      });
    } catch (error) {
      logger.error('Get services error:', error);
      next(error);
    }
  }

  /**
   * Get service by ID with full details
   */
  static async getServiceById(req: Request, res: Response, next: NextFunction) {
    try {
      const { serviceId } = req.params;
      const authUser = (req as AuthRequest).user!;
      const { include } = req.query;

      const service = await Service.findOne({ 
        _id: serviceId, 
        deletedAt: null 
      }).populate('availableTo', 'name title specialties');

      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Service not found',
        });
      }

      // Check if user can access this service
      const canAccess = 
        authUser.role === 'admin' ||
        authUser.role === 'reception' ||
        (authUser.role === 'professional' && (
          service.availableTo.length === 0 || 
          service.availableTo.some((prof: any) => prof._id.toString() === authUser.professionalId?.toString())
        )) ||
        (authUser.role === 'patient' && service.isActive && service.isPubliclyBookable);

      if (!canAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Service not available to you',
        });
      }

      let responseData: any = service.toObject();

      // Filter sensitive data for patients
      if (authUser.role === 'patient') {
        delete responseData.stats;
        delete responseData.availableTo;
      }

      // Optionally include additional data
      let additionalData: any = {};

      if (include && authUser.role !== 'patient') {
        const includeFields = include.toString().split(',');

        if (includeFields.includes('usage')) {
          // Get service usage statistics
          const { Appointment } = await import('../models/Appointment.js');
          
          const usageStats = await Appointment.aggregate([
            { 
              $match: { 
                serviceId: new Types.ObjectId(serviceId),
                deletedAt: null,
                startTime: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
              }
            },
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalRevenue: { $sum: '$pricing.totalAmount' },
              }
            }
          ]);

          additionalData.usageStats = usageStats;
        }

        if (includeFields.includes('professionals')) {
          // Get professionals offering this service
          const professionals = await Professional.find({
            services: new Types.ObjectId(serviceId),
            status: 'active',
            isActive: true,
          }).select('name title specialties');

          additionalData.professionals = professionals;
        }
      }

      res.status(200).json({
        success: true,
        data: {
          service: responseData,
          ...additionalData,
        },
      });
    } catch (error) {
      logger.error('Get service by ID error:', error);
      next(error);
    }
  }

  /**
   * Create new service
   */
  static async createService(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user!;

      // Only admin can create services
      if (authUser.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Only administrators can create services',
        });
      }

      const serviceData = req.body as CreateServiceRequest;

      // Validate professional IDs if provided
      if (serviceData.availableTo && serviceData.availableTo.length > 0) {
        const professionals = await Professional.find({
          _id: { $in: serviceData.availableTo.map(id => new Types.ObjectId(id)) },
          isActive: true,
        });

        if (professionals.length !== serviceData.availableTo.length) {
          return res.status(404).json({
            success: false,
            message: 'One or more professionals not found',
          });
        }
      }

      // Create service
      const service = new Service({
        name: serviceData.name,
        description: serviceData.description,
        durationMinutes: serviceData.durationMinutes,
        price: serviceData.price,
        currency: serviceData.currency || 'EUR',
        color: serviceData.color,
        category: serviceData.category,
        tags: serviceData.tags || [],
        isOnlineAvailable: serviceData.isOnlineAvailable ?? true,
        requiresApproval: serviceData.requiresApproval ?? false,
        availableTo: serviceData.availableTo?.map(id => new Types.ObjectId(id)) || [],
        isPubliclyBookable: serviceData.isPubliclyBookable ?? true,
        priceDetails: {
          basePrice: serviceData.price,
        },
        settings: {
          maxAdvanceBookingDays: serviceData.settings?.maxAdvanceBookingDays ?? 30,
          minAdvanceBookingHours: serviceData.settings?.minAdvanceBookingHours ?? 2,
          allowSameDayBooking: serviceData.settings?.allowSameDayBooking ?? true,
          bufferBefore: serviceData.settings?.bufferBefore ?? 0,
          bufferAfter: serviceData.settings?.bufferAfter ?? 0,
          maxConcurrentBookings: serviceData.settings?.maxConcurrentBookings ?? 1,
          requiresIntake: serviceData.settings?.requiresIntake ?? false,
          intakeFormId: serviceData.settings?.intakeFormId ? new Types.ObjectId(serviceData.settings.intakeFormId) : undefined,
        },
        preparation: serviceData.preparation,
        followUp: serviceData.followUp,
        stats: {
          totalBookings: 0,
          completedBookings: 0,
          cancelledBookings: 0,
          totalRevenue: 0,
        },
      });

      await service.save();

      // Log service creation
      await AuditLog.create({
        action: 'service_created',
        entityType: 'service',
        entityId: service._id.toString(),
        actorId: authUser._id,
        actorType: 'user',
        actorEmail: authUser.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'success',
        changes: {
          created: {
            name: service.name,
            price: service.price,
            duration: service.durationMinutes,
            category: service.category,
          },
        },
        security: {
          riskLevel: 'low',
          authMethod: 'jwt',
          compliance: {
            hipaaRelevant: false,
            gdprRelevant: false,
            requiresRetention: false,
          },
        },
        business: {
          clinicalRelevant: true,
          containsPHI: false,
          dataClassification: 'internal',
        },
        metadata: {
          source: 'service_controller',
          priority: 'low',
        },
        timestamp: new Date(),
      });

      await service.populate('availableTo', 'name title specialties');

      res.status(201).json({
        success: true,
        message: 'Service created successfully',
        data: { service },
      });
    } catch (error) {
      logger.error('Create service error:', error);
      next(error);
    }
  }

  /**
   * Update service
   */
  static async updateService(req: Request, res: Response, next: NextFunction) {
    try {
      const { serviceId } = req.params;
      const authUser = (req as AuthRequest).user!;
      const updateData = req.body as UpdateServiceRequest;

      // Only admin can update services
      if (authUser.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Only administrators can update services',
        });
      }

      const service = await Service.findById(serviceId);
      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Service not found',
        });
      }

      // Store original data for audit
      const originalData = service.toObject();

      // Apply updates
      if (updateData.name) service.name = updateData.name;
      if (updateData.description !== undefined) service.description = updateData.description;
      if (updateData.durationMinutes) service.durationMinutes = updateData.durationMinutes;
      if (updateData.price !== undefined) {
        service.price = updateData.price;
        service.priceDetails.basePrice = updateData.price;
      }
      if (updateData.currency) service.currency = updateData.currency;
      if (updateData.color) service.color = updateData.color;
      if (updateData.category !== undefined) service.category = updateData.category;
      if (updateData.tags) service.tags = updateData.tags;
      if (updateData.isActive !== undefined) service.isActive = updateData.isActive;
      if (updateData.isOnlineAvailable !== undefined) service.isOnlineAvailable = updateData.isOnlineAvailable;
      if (updateData.requiresApproval !== undefined) service.requiresApproval = updateData.requiresApproval;
      if (updateData.isPubliclyBookable !== undefined) service.isPubliclyBookable = updateData.isPubliclyBookable;

      // Update settings
      if (updateData.settings) {
        const updatedSettings = { ...service.settings };
        Object.keys(updateData.settings).forEach(key => {
          if (key === 'intakeFormId' && updateData.settings![key as keyof typeof updateData.settings]) {
            const value = updateData.settings![key as keyof typeof updateData.settings];
            if (typeof value === 'string') {
              updatedSettings.intakeFormId = new Types.ObjectId(value);
            } else if (value && typeof value === 'object' && 'toString' in value) {
              updatedSettings.intakeFormId = value as Types.ObjectId;
            }
          } else {
            (updatedSettings as any)[key] = updateData.settings![key as keyof typeof updateData.settings];
          }
        });
        service.settings = updatedSettings;
      }

      // Update preparation
      if (updateData.preparation) {
        service.preparation = { ...service.preparation, ...updateData.preparation };
      }

      // Update follow-up
      if (updateData.followUp) {
        service.followUp = { ...service.followUp, ...updateData.followUp };
      }

      await service.save();

      // Log service update
      await AuditLog.create({
        action: 'service_updated',
        entityType: 'service',
        entityId: service._id.toString(),
        actorId: authUser._id,
        actorType: 'user',
        actorEmail: authUser.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'success',
        changes: {
          before: originalData,
          after: service.toObject(),
          fieldsChanged: Object.keys(updateData),
        },
        security: {
          riskLevel: 'low',
          authMethod: 'jwt',
          compliance: {
            hipaaRelevant: false,
            gdprRelevant: false,
            requiresRetention: false,
          },
        },
        business: {
          clinicalRelevant: true,
          containsPHI: false,
          dataClassification: 'internal',
        },
        metadata: {
          source: 'service_controller',
          priority: 'low',
        },
        timestamp: new Date(),
      });

      await service.populate('availableTo', 'name title specialties');

      res.status(200).json({
        success: true,
        message: 'Service updated successfully',
        data: { service },
      });
    } catch (error) {
      logger.error('Update service error:', error);
      next(error);
    }
  }

  /**
   * Add professional to service
   */
  static async addProfessional(req: Request, res: Response, next: NextFunction) {
    try {
      const { serviceId } = req.params;
      const { professionalId } = req.body;
      const authUser = (req as AuthRequest).user!;

      // Only admin can modify professional assignments
      if (authUser.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Only administrators can assign professionals to services',
        });
      }

      const [service, professional] = await Promise.all([
        Service.findById(serviceId),
        Professional.findById(professionalId),
      ]);

      if (!service || !professional) {
        return res.status(404).json({
          success: false,
          message: 'Service or professional not found',
        });
      }

      // Add professional to service
      if (!service.availableTo.includes(new Types.ObjectId(professionalId))) {
        service.availableTo.push(new Types.ObjectId(professionalId));
        await service.save();
      }
      
      // Add service to professional
      if (!professional.services.includes(new Types.ObjectId(serviceId))) {
        professional.services.push(new Types.ObjectId(serviceId));
        await professional.save();
      }

      res.status(200).json({
        success: true,
        message: 'Professional added to service successfully',
        data: { service },
      });
    } catch (error) {
      logger.error('Add professional to service error:', error);
      next(error);
    }
  }

  /**
   * Remove professional from service
   */
  static async removeProfessional(req: Request, res: Response, next: NextFunction) {
    try {
      const { serviceId, professionalId } = req.params;
      const authUser = (req as AuthRequest).user!;

      // Only admin can modify professional assignments
      if (authUser.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Only administrators can remove professionals from services',
        });
      }

      const [service, professional] = await Promise.all([
        Service.findById(serviceId),
        Professional.findById(professionalId),
      ]);

      if (!service || !professional) {
        return res.status(404).json({
          success: false,
          message: 'Service or professional not found',
        });
      }

      // Remove professional from service
      service.availableTo = service.availableTo.filter(id => !id.equals(new Types.ObjectId(professionalId)));
      await service.save();
      
      // Remove service from professional
      professional.services = professional.services.filter(id => !id.equals(new Types.ObjectId(serviceId)));
      await professional.save();

      res.status(200).json({
        success: true,
        message: 'Professional removed from service successfully',
        data: { service },
      });
    } catch (error) {
      logger.error('Remove professional from service error:', error);
      next(error);
    }
  }

  /**
   * Get service categories
   */
  static async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await Service.distinct('category', { 
        isActive: true, 
        deletedAt: null,
        category: { $ne: null } 
      });

      res.status(200).json({
        success: true,
        data: { categories },
      });
    } catch (error) {
      logger.error('Get service categories error:', error);
      next(error);
    }
  }

  /**
   * Get service statistics
   */
  static async getServiceStats(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user!;

      // Only admin and reception can view service statistics
      if (authUser.role !== 'admin' && authUser.role !== 'reception') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot view service statistics',
        });
      }

      const [totalStats, categoryStats, popularServices] = await Promise.all([
        // Total service statistics
        Service.aggregate([
          { $match: { deletedAt: null } },
          {
            $group: {
              _id: null,
              totalServices: { $sum: 1 },
              activeServices: { $sum: { $cond: ['$isActive', 1, 0] } },
              publicServices: { $sum: { $cond: ['$isPubliclyBookable', 1, 0] } },
              onlineServices: { $sum: { $cond: ['$isOnlineAvailable', 1, 0] } },
              averagePrice: { $avg: '$price' },
              averageDuration: { $avg: '$durationMinutes' },
              totalRevenue: { $sum: '$stats.totalRevenue' },
            }
          }
        ]),

        // Statistics by category
        Service.aggregate([
          { $match: { deletedAt: null, isActive: true } },
          {
            $group: {
              _id: '$category',
              count: { $sum: 1 },
              averagePrice: { $avg: '$price' },
              totalBookings: { $sum: '$stats.totalBookings' },
            }
          },
          { $sort: { count: -1 } }
        ]),

        // Most popular services
        Service.aggregate([
          { $match: { deletedAt: null, isActive: true } },
          { $sort: { 'stats.totalBookings': -1 } },
          { $limit: 10 },
          {
            $project: {
              name: 1,
              category: 1,
              price: 1,
              'stats.totalBookings': 1,
              'stats.totalRevenue': 1,
              'stats.averageRating': 1,
            }
          }
        ]),
      ]);

      res.status(200).json({
        success: true,
        data: {
          overview: totalStats[0] || {},
          byCategory: categoryStats,
          popular: popularServices,
        },
      });
    } catch (error) {
      logger.error('Get service stats error:', error);
      next(error);
    }
  }

  /**
   * Soft delete service
   */
  static async deleteService(req: Request, res: Response, next: NextFunction) {
    try {
      const { serviceId } = req.params;
      const authUser = (req as AuthRequest).user!;

      // Only admin can delete services
      if (authUser.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Only administrators can delete services',
        });
      }

      const service = await Service.findById(serviceId);
      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Service not found',
        });
      }

      // Check if service has active appointments
      const { Appointment } = await import('../models/Appointment.js');
      const activeAppointments = await Appointment.countDocuments({
        serviceId: new Types.ObjectId(serviceId),
        status: { $in: ['pending', 'confirmed', 'in_progress'] },
        deletedAt: null,
      });

      if (activeAppointments > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete service with ${activeAppointments} active appointments. Please cancel or complete them first.`,
        });
      }

      // Soft delete - mark as inactive and set deletedAt
      service.isActive = false;
      service.deletedAt = new Date();
      await service.save();

      // Log service deletion
      await AuditLog.create({
        action: 'service_deleted',
        entityType: 'service',
        entityId: service._id.toString(),
        actorId: authUser._id,
        actorType: 'user',
        actorEmail: authUser.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'success',
        changes: {
          deletedAt: new Date(),
          serviceName: service.name,
          activeAppointmentsChecked: true,
        },
        security: {
          riskLevel: 'medium',
          authMethod: 'jwt',
          compliance: {
            hipaaRelevant: false,
            gdprRelevant: false,
            requiresRetention: false,
          },
        },
        business: {
          clinicalRelevant: true,
          containsPHI: false,
          dataClassification: 'internal',
        },
        metadata: {
          source: 'service_controller',
          priority: 'medium',
        },
        timestamp: new Date(),
      });

      res.status(200).json({
        success: true,
        message: 'Service deleted successfully',
      });
    } catch (error) {
      logger.error('Delete service error:', error);
      next(error);
    }
  }
}

export default ServiceController;

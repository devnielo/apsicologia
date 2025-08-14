import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Service, IServiceDocument } from '../models/Service.js';
import { Professional } from '../models/Professional.js';
import { Appointment } from '../models/Appointment.js';
import { AuditLog } from '../models/AuditLog.js';
import logger from '../config/logger.js';
import { AuthRequest } from '../middleware/auth.js';

interface CreateServiceRequest {
  name: string;
  description?: string;
  category: string;
  duration: number; // in minutes
  price: number;
  currency?: string;
  isActive?: boolean;
  requiresApproval?: boolean;
  isOnlineAvailable?: boolean;
  maxAdvanceBookingDays?: number;
  minAdvanceBookingHours?: number;
  cancellationPolicy?: {
    allowedUntilHours: number;
    penaltyPercentage: number;
    noShowPenaltyPercentage: number;
  };
  preparationTime?: number;
  cleanupTime?: number;
  requiredResources?: string[];
  contraindications?: string[];
  ageRestrictions?: {
    minAge?: number;
    maxAge?: number;
  };
  metadata?: {
    color?: string;
    icon?: string;
    tags?: string[];
  };
}

interface UpdateServiceRequest {
  name?: string;
  description?: string;
  category?: string;
  duration?: number;
  price?: number;
  currency?: string;
  isActive?: boolean;
  requiresApproval?: boolean;
  isOnlineAvailable?: boolean;
  maxAdvanceBookingDays?: number;
  minAdvanceBookingHours?: number;
  cancellationPolicy?: {
    allowedUntilHours: number;
    penaltyPercentage: number;
    noShowPenaltyPercentage: number;
  };
  preparationTime?: number;
  cleanupTime?: number;
  requiredResources?: string[];
  contraindications?: string[];
  ageRestrictions?: {
    minAge?: number;
    maxAge?: number;
  };
  metadata?: {
    color?: string;
    icon?: string;
    tags?: string[];
  };
}

interface ServiceQuery {
  page?: string;
  limit?: string;
  search?: string;
  category?: string;
  isActive?: string;
  isOnlineAvailable?: string;
  professionalId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
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
        isActive = 'true',
        isOnlineAvailable,
        professionalId,
        sortBy = 'name',
        sortOrder = 'asc',
      } = req.query as ServiceQuery;

      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;

      // Build filter
      const filter: any = {};

      // Apply query filters
      if (isActive !== 'all') {
        filter.isActive = isActive === 'true';
      }

      if (category) {
        filter.category = category;
      }

      if (isOnlineAvailable !== undefined) {
        filter.isOnlineAvailable = isOnlineAvailable === 'true';
      }

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { category: { $regex: search, $options: 'i' } },
          { 'metadata.tags': { $regex: search, $options: 'i' } },
        ];
      }

      // Build sort
      const sort: any = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Execute queries
      const [services, total] = await Promise.all([
        Service.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limitNum)
          .populate('createdBy', 'name email'),
        Service.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / limitNum);

      // If professionalId is specified, add professional-specific data
      let servicesWithProfessionalData = services;
      if (professionalId) {
        const professional = await Professional.findById(professionalId);
        if (professional) {
          servicesWithProfessionalData = services.map((service: any) => {
            const serviceObj = service.toObject();
            serviceObj.isOfferedByProfessional = professional.services.includes(service._id);
            return serviceObj;
          });
        }
      }

      res.status(200).json({
        success: true,
        data: {
          services: servicesWithProfessionalData,
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

      const service = await Service.findById(serviceId)
        .populate('createdBy', 'name email');

      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Service not found',
        });
      }

      // Get professionals offering this service
      const professionals = await Professional.find({
        services: service._id,
        isActive: true,
        status: 'active'
      }).select('name specialties email');

      // Get appointment statistics for this service
      const appointmentStats = await Appointment.aggregate([
        { $match: { serviceId: service._id } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      res.status(200).json({
        success: true,
        data: { 
          service,
          professionals,
          stats: {
            appointments: appointmentStats,
            professionalCount: professionals.length
          }
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
      const serviceData = req.body as CreateServiceRequest;

      // Only admin can create services (professionals can request via different endpoint)
      if (authUser.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Only administrators can create services',
        });
      }

      // Check if service with same name already exists
      const existingService = await Service.findOne({ 
        name: serviceData.name.trim(),
        isActive: true
      });
      if (existingService) {
        return res.status(409).json({
          success: false,
          message: 'Service already exists with this name',
        });
      }

      // Create service
      const service = new Service({
        ...serviceData,
        name: serviceData.name.trim(),
        currency: serviceData.currency || 'EUR',
        isActive: serviceData.isActive ?? true,
        requiresApproval: serviceData.requiresApproval ?? false,
        isOnlineAvailable: serviceData.isOnlineAvailable ?? true,
        maxAdvanceBookingDays: serviceData.maxAdvanceBookingDays ?? 30,
        minAdvanceBookingHours: serviceData.minAdvanceBookingHours ?? 2,
        preparationTime: serviceData.preparationTime ?? 0,
        cleanupTime: serviceData.cleanupTime ?? 0,
        createdBy: authUser._id,
        metadata: {
          color: serviceData.metadata?.color || '#3B82F6',
          icon: serviceData.metadata?.icon || 'calendar',
          tags: serviceData.metadata?.tags || [],
        },
        cancellationPolicy: serviceData.cancellationPolicy || {
          allowedUntilHours: 24,
          penaltyPercentage: 0,
          noShowPenaltyPercentage: 100,
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
            category: service.category,
            durationMinutes: service.durationMinutes,
            price: service.price,
            currency: service.currency,
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
   * Update service information
   */
  static async updateService(req: Request, res: Response, next: NextFunction) {
    try {
      const { serviceId } = req.params;
      const authUser = (req as AuthRequest).user!;
      const updateData = req.body as UpdateServiceRequest;

      // Find service
      const service = await Service.findById(serviceId);
      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Service not found',
        });
      }

      // Only admin can update services
      if (authUser.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Only administrators can update services',
        });
      }

      // Store original values for audit
      const originalValues = {
        name: service.name,
        durationMinutes: service.durationMinutes,
        price: service.price,
        isActive: service.isActive,
        isOnlineAvailable: service.isOnlineAvailable,
      };

      // Check name uniqueness if changing
      if (updateData.name && updateData.name.trim() !== service.name) {
        const existingService = await Service.findOne({ 
          name: updateData.name.trim(),
          isActive: true,
          _id: { $ne: serviceId }
        });
        if (existingService) {
          return res.status(409).json({
            success: false,
            message: 'Another service already exists with this name',
          });
        }
      }

      // Update service fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof UpdateServiceRequest] !== undefined) {
          if (key === 'name') {
            (service as any)[key] = updateData.name?.trim();
          } else {
            (service as any)[key] = updateData[key as keyof UpdateServiceRequest];
          }
        }
      });

      await service.save();

      // Build changes object for audit
      const changes: any = {};
      Object.keys(originalValues).forEach(key => {
        const originalValue = (originalValues as any)[key];
        const newValue = (service as any)[key];
        if (JSON.stringify(originalValue) !== JSON.stringify(newValue)) {
          changes[key] = { from: originalValue, to: newValue };
        }
      });

      // Log service update if there were changes
      if (Object.keys(changes).length > 0) {
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
          changes,
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
      }

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
   * Deactivate service
   */
  static async deactivateService(req: Request, res: Response, next: NextFunction) {
    try {
      const { serviceId } = req.params;
      const authUser = (req as AuthRequest).user!;

      // Only admin can deactivate services
      if (authUser.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Only administrators can deactivate services',
        });
      }

      const service = await Service.findById(serviceId);
      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Service not found',
        });
      }

      if (!service.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Service is already deactivated',
        });
      }

      // Check if service has upcoming appointments
      const upcomingAppointments = await Appointment.countDocuments({
        serviceId: service._id,
        start: { $gte: new Date() },
        status: { $in: ['scheduled', 'confirmed'] }
      });

      if (upcomingAppointments > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot deactivate service with ${upcomingAppointments} upcoming appointments. Please reschedule them first.`,
        });
      }

      service.isActive = false;
      await service.save();

      // Remove service from all professionals
      await Professional.updateMany(
        { services: service._id },
        { $pull: { services: service._id } }
      );

      // Log service deactivation
      await AuditLog.create({
        action: 'service_deactivated',
        entityType: 'service',
        entityId: service._id.toString(),
        actorId: authUser._id,
        actorType: 'user',
        actorEmail: authUser.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'success',
        changes: {
          isActive: { from: true, to: false },
          removedFromProfessionals: true,
        },
        business: {
          clinicalRelevant: true,
          containsPHI: false,
          dataClassification: 'internal',
        },
        metadata: {
          source: 'service_controller',
          priority: 'high',
        },
        timestamp: new Date(),
      });

      res.status(200).json({
        success: true,
        message: 'Service deactivated successfully',
      });
    } catch (error) {
      logger.error('Deactivate service error:', error);
      next(error);
    }
  }

  /**
   * Reactivate service
   */
  static async reactivateService(req: Request, res: Response, next: NextFunction) {
    try {
      const { serviceId } = req.params;
      const authUser = (req as AuthRequest).user!;

      // Only admin can reactivate services
      if (authUser.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Only administrators can reactivate services',
        });
      }

      const service = await Service.findById(serviceId);
      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Service not found',
        });
      }

      if (service.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Service is already active',
        });
      }

      service.isActive = true;
      await service.save();

      res.status(200).json({
        success: true,
        message: 'Service reactivated successfully',
      });
    } catch (error) {
      logger.error('Reactivate service error:', error);
      next(error);
    }
  }

  /**
   * Get service statistics
   */
  static async getServiceStats(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user!;

      // Only admin and reception can see comprehensive stats
      if (authUser.role !== 'admin' && authUser.role !== 'reception') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Insufficient permissions',
        });
      }

      const [
        totalServices,
        activeServices,
        onlineAvailableServices,
        servicesByCategory,
        servicesByPrice,
        mostPopularServices,
        revenueByService,
      ] = await Promise.all([
        Service.countDocuments(),
        Service.countDocuments({ isActive: true }),
        Service.countDocuments({ isActive: true, isOnlineAvailable: true }),
        Service.aggregate([
          { $match: { isActive: true } },
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        Service.aggregate([
          { $match: { isActive: true } },
          {
            $bucket: {
              groupBy: '$price',
              boundaries: [0, 50, 100, 150, 200, 1000],
              default: '200+',
              output: {
                count: { $sum: 1 },
                avgDuration: { $avg: '$duration' }
              }
            }
          }
        ]),
        Appointment.aggregate([
          { $match: { status: { $in: ['completed', 'confirmed'] } } },
          { $group: { _id: '$serviceId', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: 'services',
              localField: '_id',
              foreignField: '_id',
              as: 'service'
            }
          },
          { $unwind: '$service' },
          {
            $project: {
              serviceName: '$service.name',
              category: '$service.category',
              appointmentCount: '$count'
            }
          }
        ]),
        Appointment.aggregate([
          { 
            $match: { 
              status: { $in: ['completed', 'paid'] },
              createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
            } 
          },
          {
            $lookup: {
              from: 'services',
              localField: 'serviceId',
              foreignField: '_id',
              as: 'service'
            }
          },
          { $unwind: '$service' },
          {
            $group: {
              _id: '$serviceId',
              serviceName: { $first: '$service.name' },
              totalRevenue: { $sum: '$service.price' },
              appointmentCount: { $sum: 1 }
            }
          },
          { $sort: { totalRevenue: -1 } },
          { $limit: 10 }
        ])
      ]);

      const stats = {
        total: totalServices,
        active: activeServices,
        inactive: totalServices - activeServices,
        onlineAvailable: onlineAvailableServices,
        byCategory: servicesByCategory,
        byPrice: servicesByPrice,
        mostPopular: mostPopularServices,
        revenueByService,
      };

      res.status(200).json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      logger.error('Get service stats error:', error);
      next(error);
    }
  }

  /**
   * Assign service to professional
   */
  static async assignServiceToProfessional(req: Request, res: Response, next: NextFunction) {
    try {
      const { serviceId, professionalId } = req.params;
      const authUser = (req as AuthRequest).user!;

      // Only admin can assign services to professionals
      if (authUser.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Only administrators can assign services',
        });
      }

      const [service, professional] = await Promise.all([
        Service.findById(serviceId),
        Professional.findById(professionalId)
      ]);

      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Service not found',
        });
      }

      if (!professional) {
        return res.status(404).json({
          success: false,
          message: 'Professional not found',
        });
      }

      if (!service.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Cannot assign inactive service',
        });
      }

      if (!professional.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Cannot assign service to inactive professional',
        });
      }

      // Check if already assigned
      if (professional.services.includes(service._id)) {
        return res.status(400).json({
          success: false,
          message: 'Service is already assigned to this professional',
        });
      }

      // Add service to professional
      professional.services.push(service._id);
      await professional.save();

      res.status(200).json({
        success: true,
        message: 'Service assigned to professional successfully',
      });
    } catch (error) {
      logger.error('Assign service to professional error:', error);
      next(error);
    }
  }

  /**
   * Remove service from professional
   */
  static async removeServiceFromProfessional(req: Request, res: Response, next: NextFunction) {
    try {
      const { serviceId, professionalId } = req.params;
      const authUser = (req as AuthRequest).user!;

      // Only admin can remove services from professionals
      if (authUser.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Only administrators can remove services',
        });
      }

      const professional = await Professional.findById(professionalId);
      if (!professional) {
        return res.status(404).json({
          success: false,
          message: 'Professional not found',
        });
      }

      // Check if service is assigned
      if (!professional.services.includes(new mongoose.Types.ObjectId(serviceId))) {
        return res.status(400).json({
          success: false,
          message: 'Service is not assigned to this professional',
        });
      }

      // Check if professional has upcoming appointments with this service
      const upcomingAppointments = await Appointment.countDocuments({
        serviceId,
        professionalId,
        start: { $gte: new Date() },
        status: { $in: ['scheduled', 'confirmed'] }
      });

      if (upcomingAppointments > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot remove service with ${upcomingAppointments} upcoming appointments. Please reschedule them first.`,
        });
      }

      // Remove service from professional
      professional.services = professional.services.filter(
        (id: any) => !id.equals(serviceId)
      );
      await professional.save();

      res.status(200).json({
        success: true,
        message: 'Service removed from professional successfully',
      });
    } catch (error) {
      logger.error('Remove service from professional error:', error);
      next(error);
    }
  }

  /**
   * Get services offered by a specific professional
   */
  static async getServicesByProfessional(req: Request, res: Response, next: NextFunction) {
    try {
      const { professionalId } = req.params;
      const authUser = (req as AuthRequest).user!;

      const professional = await Professional.findById(professionalId)
        .populate({
          path: 'services',
          match: { isActive: true },
          select: 'name description category duration price currency isOnlineAvailable metadata'
        });

      if (!professional) {
        return res.status(404).json({
          success: false,
          message: 'Professional not found',
        });
      }

      // Check permissions
      const canView = 
        authUser.role === 'admin' ||
        authUser.role === 'reception' ||
        (authUser.role === 'professional' && authUser.professionalId?.toString() === professionalId);

      if (!canView) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot view this professional services',
        });
      }

      res.status(200).json({
        success: true,
        data: {
          professional: {
            id: professional._id,
            name: professional.name,
            specialties: professional.specialties
          },
          services: professional.services
        },
      });
    } catch (error) {
      logger.error('Get services by professional error:', error);
      next(error);
    }
  }
}

export default ServiceController;

import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Professional, IProfessionalDocument } from '../models/Professional.js';
import { User } from '../models/User.js';
import { Service } from '../models/Service.js';
import { Room } from '../models/Room.js';
import { Appointment } from '../models/Appointment.js';
import { Patient } from '../models/Patient.js';
import { AuditLog } from '../models/AuditLog.js';
import logger from '../config/logger.js';
import { AuthRequest } from '../middleware/auth.js';

interface CreateProfessionalRequest {
  // Basic Information
  name: string;
  email: string;
  phone?: string;
  title: string;
  licenseNumber?: string;
  specialties: string[];
  bio?: string;
  yearsOfExperience?: number;

  // Services and Scheduling
  services: string[];
  defaultServiceDuration?: number;
  bufferMinutes?: number;
  timezone?: string;

  // Availability
  weeklyAvailability: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }[];

  // Rooms
  assignedRooms?: string[];
  defaultRoom?: string;

  // Settings
  settings?: {
    allowOnlineBooking?: boolean;
    requireApproval?: boolean;
    maxAdvanceBookingDays?: number;
    minAdvanceBookingHours?: number;
    allowSameDayBooking?: boolean;
    automaticConfirmation?: boolean;
    sendReminders?: boolean;
    reminderSettings?: {
      email24h?: boolean;
      email2h?: boolean;
      sms24h?: boolean;
      sms2h?: boolean;
    };
  };

  // Contact Information
  contactInfo?: {
    website?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
  };

  // Billing
  billingSettings?: {
    defaultPaymentMethod?: 'cash' | 'card' | 'transfer';
    acceptsOnlinePayments?: boolean;
    paymentMethods?: string[];
    taxRate?: number;
  };

  // Status
  status?: 'active' | 'inactive' | 'on_leave' | 'suspended';
  isAcceptingNewPatients?: boolean;
  maxPatientsPerDay?: number;

  // Create user account?
  createUserAccount?: boolean;
  userPassword?: string;
}

interface ProfessionalQuery {
  page?: string;
  limit?: string;
  search?: string;
  specialty?: string;
  status?: string;
  acceptingPatients?: string;
  serviceId?: string;
  roomId?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  include?: string;
}

interface VacationRequest {
  startDate: string;
  endDate: string;
  reason?: string;
  isRecurring?: boolean;
  recurrencePattern?: string;
}

interface AvailabilityRequest {
  weeklyAvailability: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }[];
}

export class ProfessionalController {
  /**
   * Get all professionals (simple list for dropdowns)
   */
  static async getAllProfessionals(req: Request, res: Response, next: NextFunction) {
    try {
      const professionals = await Professional.find({})
        .select('_id name email specialties')
        .sort({ name: 1 });

      console.log('Found professionals:', professionals.length);
      
      res.json({
        success: true,
        data: professionals
      });
    } catch (error) {
      logger.error('Error getting all professionals:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener profesionales'
      });
    }
  }

  /**
   * Get all professionals with pagination and filtering
   */
  static async getProfessionals(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user!;
      const {
        page = '1',
        limit = '20',
        search,
        specialty,
        status,
        acceptingPatients,
        serviceId,
        roomId,
        sortBy = 'name',
        sortOrder = 'asc',
        include,
      } = req.query as ProfessionalQuery;

      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;

      // Build filter
      const filter: any = { isActive: true };

      // Only admin and reception can see all professionals
      // Professionals can only see themselves and other active professionals
      if (authUser.role === 'professional') {
        // Professional can see all active professionals (for scheduling coordination)
        filter.status = { $ne: 'suspended' };
      }

      // Apply query filters
      if (status && authUser.role !== 'professional') {
        filter.status = status;
      }

      if (specialty) {
        filter.specialties = { $in: [specialty] };
      }

      if (acceptingPatients) {
        filter.isAcceptingNewPatients = acceptingPatients === 'true';
      }

      if (serviceId) {
        filter.services = new Types.ObjectId(serviceId);
      }

      if (roomId) {
        filter.assignedRooms = new Types.ObjectId(roomId);
      }

      // Text search
      if (search) {
        filter.$text = { $search: search };
      }

      // Build sort
      const sort: any = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Build query with population
      let query = Professional.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .populate('userId', 'email lastLogin twoFactorEnabled')
        .populate('services', 'name description duration price')
        .populate('assignedRooms', 'name type location capacity')
        .populate('defaultRoom', 'name type location');

      // Add additional population based on include parameter
      if (include) {
        const includeFields = include.split(',');
        if (includeFields.includes('stats')) {
          // Stats are already in the document, no additional population needed
        }
      }

      // Execute queries
      const [professionals, total] = await Promise.all([
        query.exec(),
        Professional.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / limitNum);

      res.status(200).json({
        success: true,
        data: {
          professionals,
          pagination: {
            currentPage: pageNum,
            totalPages,
            totalProfessionals: total,
            hasNext: pageNum < totalPages,
            hasPrev: pageNum > 1,
          },
        },
      });
    } catch (error) {
      logger.error('Get professionals error:', error);
      next(error);
    }
  }

  /**
   * Get professional by ID with full details
   */
  static async getProfessionalById(req: Request, res: Response, next: NextFunction) {
    try {
      const { professionalId } = req.params;
      const authUser = (req as AuthRequest).user!;
      const { include } = req.query;

      const professional = await Professional.findOne({ 
        _id: professionalId, 
        isActive: true 
      })
        .populate('userId', 'email lastLogin twoFactorEnabled preferences')
        .populate('services', 'name description duration price category')
        .populate('assignedRooms', 'name type location capacity equipment')
        .populate('defaultRoom', 'name type location capacity equipment')
        .exec();

      if (!professional) {
        return res.status(404).json({
          success: false,
          message: 'Professional not found',
        });
      }

      // Check permissions - professionals can only see themselves and basic info of others
      const canViewDetails = 
        authUser.role === 'admin' ||
        authUser.role === 'reception' ||
        authUser.professionalId?.toString() === professional._id.toString();

      let responseData: any = professional.toJSON();

      // If professional is viewing another professional, hide sensitive info
      if (authUser.role === 'professional' && !canViewDetails) {
        responseData = {
          _id: professional._id,
          name: professional.name,
          title: professional.title,
          specialties: professional.specialties,
          bio: professional.bio,
          services: professional.services,
          assignedRooms: professional.assignedRooms,
          status: professional.status,
          isAcceptingNewPatients: professional.isAcceptingNewPatients,
          contactInfo: professional.contactInfo,
        };
      }

      // Optionally include additional data
      let additionalData: any = {};

      if (include && canViewDetails) {
        const includeFields = include.toString().split(',');

        if (includeFields.includes('patients')) {
          // Get patients assigned to this professional
          additionalData.patients = await Patient.find({
            $or: [
              { 'clinicalInfo.primaryProfessional': professional._id },
              { 'clinicalInfo.assignedProfessionals': professional._id },
            ],
            status: 'active',
            deletedAt: null,
          })
            .select('personalInfo.fullName contactInfo.email contactInfo.phone status')
            .limit(50)
            .sort({ 'personalInfo.fullName': 1 });
        }

        if (includeFields.includes('schedule')) {
          // Get upcoming appointments
          const startDate = new Date();
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + 30); // Next 30 days

          additionalData.upcomingAppointments = await Appointment.find({
            professionalId: professional._id,
            start: { $gte: startDate, $lte: endDate },
            status: { $in: ['scheduled', 'confirmed'] },
          })
            .populate('patientId', 'personalInfo.fullName')
            .populate('serviceId', 'name duration')
            .populate('roomId', 'name type')
            .sort({ start: 1 })
            .limit(20);
        }

        if (includeFields.includes('analytics')) {
          // Calculate advanced analytics
          const now = new Date();
          const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          
          const [monthlyStats, yearlyStats] = await Promise.all([
            Appointment.aggregate([
              {
                $match: {
                  professionalId: professional._id,
                  start: { $gte: firstDayOfMonth },
                }
              },
              {
                $group: {
                  _id: '$status',
                  count: { $sum: 1 },
                  revenue: { $sum: '$amount' },
                }
              }
            ]),
            Appointment.aggregate([
              {
                $match: {
                  professionalId: professional._id,
                  start: { $gte: new Date(now.getFullYear(), 0, 1) },
                }
              },
              {
                $group: {
                  _id: {
                    month: { $month: '$start' },
                    status: '$status'
                  },
                  count: { $sum: 1 },
                  revenue: { $sum: '$amount' },
                }
              }
            ])
          ]);

          additionalData.analytics = {
            monthlyStats,
            yearlyStats,
          };
        }
      }

      res.status(200).json({
        success: true,
        data: {
          professional: responseData,
          ...additionalData,
        },
      });
    } catch (error) {
      logger.error('Get professional by ID error:', error);
      next(error);
    }
  }

  /**
   * Create new professional
   */
  static async createProfessional(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user!;
      const professionalData = req.body as CreateProfessionalRequest;

      // Only admin can create professionals
      if (authUser.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Only administrators can create professionals',
        });
      }

      // Check if email already exists
      const existingProfessional = await Professional.findOne({ 
        email: professionalData.email.toLowerCase(), 
        isActive: true 
      });
      if (existingProfessional) {
        return res.status(409).json({
          success: false,
          message: 'A professional with this email already exists',
        });
      }

      // Create user account for professional if requested
      let userAccount = null;
      if (professionalData.createUserAccount) {
        const tempPassword = professionalData.userPassword || 
          Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12);
        
        try {
          userAccount = new User({
            email: professionalData.email,
            password: tempPassword, // Will be hashed by pre-save middleware
            role: 'professional',
            name: professionalData.name,
            phone: professionalData.phone,
            isActive: true,
            emailVerified: false,
            createdBy: authUser._id,
          });

          await userAccount.save();
          logger.info(`User account created for professional ${professionalData.email}`);
        } catch (userError) {
          logger.error('Failed to create user account for professional:', userError);
          return res.status(400).json({
            success: false,
            message: 'Failed to create user account for professional',
          });
        }
      }

      // Prepare professional data
      const professionalPayload: any = {
        userId: userAccount ? userAccount._id : undefined,
        name: professionalData.name,
        email: professionalData.email,
        phone: professionalData.phone,
        title: professionalData.title,
        licenseNumber: professionalData.licenseNumber,
        specialties: professionalData.specialties || [],
        bio: professionalData.bio,
        yearsOfExperience: professionalData.yearsOfExperience,
        services: professionalData.services?.map(id => new Types.ObjectId(id)) || [],
        defaultServiceDuration: professionalData.defaultServiceDuration || 50,
        bufferMinutes: professionalData.bufferMinutes || 10,
        timezone: professionalData.timezone || 'Europe/Madrid',
        weeklyAvailability: professionalData.weeklyAvailability || [],
        assignedRooms: professionalData.assignedRooms?.map(id => new Types.ObjectId(id)) || [],
        defaultRoom: professionalData.defaultRoom ? new Types.ObjectId(professionalData.defaultRoom) : undefined,
        settings: {
          allowOnlineBooking: professionalData.settings?.allowOnlineBooking ?? true,
          requireApproval: professionalData.settings?.requireApproval ?? false,
          maxAdvanceBookingDays: professionalData.settings?.maxAdvanceBookingDays ?? 30,
          minAdvanceBookingHours: professionalData.settings?.minAdvanceBookingHours ?? 2,
          allowSameDayBooking: professionalData.settings?.allowSameDayBooking ?? true,
          automaticConfirmation: professionalData.settings?.automaticConfirmation ?? true,
          sendReminders: professionalData.settings?.sendReminders ?? true,
          reminderSettings: {
            email24h: professionalData.settings?.reminderSettings?.email24h ?? true,
            email2h: professionalData.settings?.reminderSettings?.email2h ?? false,
            sms24h: professionalData.settings?.reminderSettings?.sms24h ?? false,
            sms2h: professionalData.settings?.reminderSettings?.sms2h ?? false,
          },
        },
        contactInfo: professionalData.contactInfo || {},
        billingSettings: {
          defaultPaymentMethod: professionalData.billingSettings?.defaultPaymentMethod || 'cash',
          acceptsOnlinePayments: professionalData.billingSettings?.acceptsOnlinePayments || false,
          paymentMethods: professionalData.billingSettings?.paymentMethods || [],
          taxRate: professionalData.billingSettings?.taxRate,
        },
        status: professionalData.status || 'active',
        isAcceptingNewPatients: professionalData.isAcceptingNewPatients ?? true,
        maxPatientsPerDay: professionalData.maxPatientsPerDay,
        stats: {
          totalPatients: 0,
          activePatients: 0,
          totalAppointments: 0,
        },
      };

      // Create professional
      const professional = new Professional(professionalPayload);
      await professional.save();

      // Update user with professional ID if user was created
      if (userAccount) {
        userAccount.professionalId = professional._id;
        await userAccount.save();
      }

      // Log professional creation
      await AuditLog.create({
        action: 'professional_created',
        entityType: 'professional',
        entityId: professional._id.toString(),
        actorId: authUser._id,
        actorType: 'user',
        actorEmail: authUser.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'success',
        changes: {
          created: {
            name: professional.name,
            email: professional.email,
            title: professional.title,
            specialties: professional.specialties,
            userAccountCreated: !!userAccount,
          },
        },
        security: {
          riskLevel: 'medium',
          authMethod: 'jwt',
          compliance: {
            hipaaRelevant: true,
            gdprRelevant: true,
            requiresRetention: true,
          },
        },
        business: {
          clinicalRelevant: true,
          containsPHI: false,
          dataClassification: 'internal',
        },
        metadata: {
          source: 'professional_controller',
          priority: 'medium',
        },
        timestamp: new Date(),
      });

      // Populate references before returning
      await professional.populate([
        { path: 'services', select: 'name description duration price' },
        { path: 'assignedRooms', select: 'name type location' },
        { path: 'userId', select: 'email lastLogin' }
      ]);

      res.status(201).json({
        success: true,
        message: 'Professional created successfully',
        data: {
          professional,
          userAccount: userAccount ? {
            id: userAccount._id,
            email: userAccount.email,
            role: userAccount.role,
          } : null,
        },
      });
    } catch (error) {
      logger.error('Create professional error:', error);
      next(error);
    }
  }

  /**
   * Update professional information
   */
  static async updateProfessional(req: Request, res: Response, next: NextFunction) {
    try {
      const { professionalId } = req.params;
      const authUser = (req as AuthRequest).user!;
      const updateData = req.body;

      // Find professional
      const professional = await Professional.findById(professionalId);
      if (!professional) {
        return res.status(404).json({
          success: false,
          message: 'Professional not found',
        });
      }

      // Check permissions
      const canUpdate = 
        authUser.role === 'admin' ||
        (authUser.role === 'professional' && authUser.professionalId?.toString() === professionalId);

      if (!canUpdate) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot update this professional',
        });
      }

      // Store original data for audit log
      const originalData = professional.toObject();

      // Apply updates (restrict certain fields based on role)
      if (authUser.role === 'professional') {
        // Professionals can only update certain fields
        const allowedFields = [
          'bio', 'contactInfo', 'settings', 'weeklyAvailability',
          'isAcceptingNewPatients', 'maxPatientsPerDay'
        ];
        
        const filteredUpdateData: any = {};
        allowedFields.forEach(field => {
          if (updateData[field] !== undefined) {
            filteredUpdateData[field] = updateData[field];
          }
        });
        
        Object.assign(professional, filteredUpdateData);
      } else {
        // Admin can update everything
        Object.assign(professional, updateData);
      }

      await professional.save();

      // Log professional update
      await AuditLog.create({
        action: 'professional_updated',
        entityType: 'professional',
        entityId: professional._id.toString(),
        actorId: authUser._id,
        actorType: 'user',
        actorEmail: authUser.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'success',
        changes: {
          before: originalData,
          after: professional.toObject(),
          fieldsChanged: Object.keys(updateData),
        },
        security: {
          riskLevel: 'low',
          authMethod: 'jwt',
          compliance: {
            hipaaRelevant: true,
            gdprRelevant: false,
            requiresRetention: true,
          },
        },
        business: {
          clinicalRelevant: true,
          containsPHI: false,
          dataClassification: 'internal',
        },
        metadata: {
          source: 'professional_controller',
          priority: 'low',
        },
        timestamp: new Date(),
      });

      // Populate and return updated professional
      await professional.populate([
        { path: 'services', select: 'name description duration price' },
        { path: 'assignedRooms', select: 'name type location' }
      ]);

      res.status(200).json({
        success: true,
        message: 'Professional updated successfully',
        data: { professional },
      });
    } catch (error) {
      logger.error('Update professional error:', error);
      next(error);
    }
  }

  /**
   * Add service to professional
   */
  static async addService(req: Request, res: Response, next: NextFunction) {
    try {
      const { professionalId } = req.params;
      const { serviceId } = req.body;
      const authUser = (req as AuthRequest).user!;

      // Check permissions
      const canUpdate = 
        authUser.role === 'admin' ||
        (authUser.role === 'professional' && authUser.professionalId?.toString() === professionalId);

      if (!canUpdate) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot modify this professional',
        });
      }

      const professional = await Professional.findById(professionalId);
      if (!professional) {
        return res.status(404).json({
          success: false,
          message: 'Professional not found',
        });
      }

      // Verify service exists
      const service = await Service.findById(serviceId);
      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Service not found',
        });
      }

      // Add service if not already present
      if (!professional.services.includes(new Types.ObjectId(serviceId))) {
        professional.services.push(new Types.ObjectId(serviceId));
        await professional.save();
      }
      await professional.populate('services', 'name description duration price');

      res.status(200).json({
        success: true,
        message: 'Service added successfully',
        data: { professional },
      });
    } catch (error) {
      logger.error('Add service error:', error);
      next(error);
    }
  }

  /**
   * Remove service from professional
   */
  static async removeService(req: Request, res: Response, next: NextFunction) {
    try {
      const { professionalId, serviceId } = req.params;
      const authUser = (req as AuthRequest).user!;

      // Check permissions
      const canUpdate = 
        authUser.role === 'admin' ||
        (authUser.role === 'professional' && authUser.professionalId?.toString() === professionalId);

      if (!canUpdate) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot modify this professional',
        });
      }

      const professional = await Professional.findById(professionalId);
      if (!professional) {
        return res.status(404).json({
          success: false,
          message: 'Professional not found',
        });
      }

      // Remove service from the array
      professional.services = professional.services.filter((id: any) => !id.equals(new Types.ObjectId(serviceId)));
      await professional.save();
      await professional.populate('services', 'name description duration price');

      res.status(200).json({
        success: true,
        message: 'Service removed successfully',
        data: { professional },
      });
    } catch (error) {
      logger.error('Remove service error:', error);
      next(error);
    }
  }

  /**
   * Add vacation/absence period
   */
  static async addVacation(req: Request, res: Response, next: NextFunction) {
    try {
      const { professionalId } = req.params;
      const { startDate, endDate, reason, isRecurring, recurrencePattern } = req.body as VacationRequest;
      const authUser = (req as AuthRequest).user!;

      // Check permissions
      const canUpdate = 
        authUser.role === 'admin' ||
        authUser.role === 'reception' ||
        (authUser.role === 'professional' && authUser.professionalId?.toString() === professionalId);

      if (!canUpdate) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot modify this professional',
        });
      }

      const professional = await Professional.findById(professionalId);
      if (!professional) {
        return res.status(404).json({
          success: false,
          message: 'Professional not found',
        });
      }

      // Add vacation period
      professional.vacations.push({
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        isRecurring: isRecurring || false,
        recurrencePattern,
      } as any);
      await professional.save();

      res.status(200).json({
        success: true,
        message: 'Vacation period added successfully',
        data: { professional },
      });
    } catch (error) {
      logger.error('Add vacation error:', error);
      next(error);
    }
  }

  /**
   * Remove vacation/absence period
   */
  static async removeVacation(req: Request, res: Response, next: NextFunction) {
    try {
      const { professionalId, vacationId } = req.params;
      const authUser = (req as AuthRequest).user!;

      // Check permissions
      const canUpdate = 
        authUser.role === 'admin' ||
        authUser.role === 'reception' ||
        (authUser.role === 'professional' && authUser.professionalId?.toString() === professionalId);

      if (!canUpdate) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot modify this professional',
        });
      }

      const professional = await Professional.findById(professionalId);
      if (!professional) {
        return res.status(404).json({
          success: false,
          message: 'Professional not found',
        });
      }

      // Remove vacation period from the array
      professional.vacations = professional.vacations.filter((v: any) => v._id?.toString() !== vacationId);
      await professional.save();

      res.status(200).json({
        success: true,
        message: 'Vacation period removed successfully',
        data: { professional },
      });
    } catch (error) {
      logger.error('Remove vacation error:', error);
      next(error);
    }
  }

  /**
   * Update availability schedule
   */
  static async updateAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const { professionalId } = req.params;
      const { weeklyAvailability } = req.body as AvailabilityRequest;
      const authUser = (req as AuthRequest).user!;

      // Check permissions
      const canUpdate = 
        authUser.role === 'admin' ||
        authUser.role === 'reception' ||
        (authUser.role === 'professional' && authUser.professionalId?.toString() === professionalId);

      if (!canUpdate) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot modify this professional',
        });
      }

      const professional = await Professional.findById(professionalId);
      if (!professional) {
        return res.status(404).json({
          success: false,
          message: 'Professional not found',
        });
      }

      professional.weeklyAvailability = weeklyAvailability;
      await professional.save();

      res.status(200).json({
        success: true,
        message: 'Availability updated successfully',
        data: { professional },
      });
    } catch (error) {
      logger.error('Update availability error:', error);
      next(error);
    }
  }

  /**
   * Get professional availability for a date range
   */
  static async getAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const { professionalId } = req.params;
      const { startDate, endDate, serviceId } = req.query;
      const authUser = (req as AuthRequest).user!;

      const professional = await Professional.findById(professionalId);
      if (!professional) {
        return res.status(404).json({
          success: false,
          message: 'Professional not found',
        });
      }

      // Build availability data for date range
      const start = startDate ? new Date(startDate as string) : new Date();
      const end = endDate ? new Date(endDate as string) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

      const availability: any[] = [];
      const currentDate = new Date(start);

      while (currentDate <= end) {
        // Check availability for this date
        const dayOfWeek = currentDate.getDay();
        const weeklyAvail = professional.weeklyAvailability.find((a: any) => a.dayOfWeek === dayOfWeek);
        
        let isAvailable = false;
        let hours = null;
        
        if (weeklyAvail && weeklyAvail.isAvailable) {
          // Check if date falls within any vacation period
          const isOnVacation = professional.vacations.some((vacation: any) => {
            return currentDate >= vacation.startDate && currentDate <= vacation.endDate;
          });
          
          isAvailable = !isOnVacation;
          
          if (isAvailable) {
            hours = {
              start: weeklyAvail.startTime,
              end: weeklyAvail.endTime,
            };
          }
        }

        availability.push({
          date: currentDate.toISOString().split('T')[0],
          isAvailable,
          hours,
          dayOfWeek: currentDate.getDay(),
        });

        currentDate.setDate(currentDate.getDate() + 1);
      }

      res.status(200).json({
        success: true,
        data: { availability },
      });
    } catch (error) {
      logger.error('Get availability error:', error);
      next(error);
    }
  }

  /**
   * Get professional statistics
   */
  static async getProfessionalStats(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user!;
      const { professionalId, startDate, endDate } = req.query;

      // Check permissions
      const canViewStats = 
        authUser.role === 'admin' ||
        authUser.role === 'reception' ||
        (authUser.role === 'professional' && 
         (!professionalId || authUser.professionalId?.toString() === professionalId));

      if (!canViewStats) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot view these statistics',
        });
      }

      // Build filter
      const matchFilter: any = {};
      if (professionalId) {
        matchFilter._id = new Types.ObjectId(professionalId as string);
      } else if (authUser.role === 'professional') {
        matchFilter._id = new Types.ObjectId(authUser.professionalId!);
      }

      matchFilter.isActive = true;

      const [
        professionalStats,
        appointmentStats,
        patientStats,
        revenueStats,
      ] = await Promise.all([
        Professional.aggregate([
          { $match: matchFilter },
          { $group: {
            _id: '$status',
            count: { $sum: 1 },
            acceptingPatients: { $sum: { $cond: ['$isAcceptingNewPatients', 1, 0] } },
          }},
        ]),
        Appointment.aggregate([
          { 
            $match: {
              ...(professionalId ? { professionalId: new Types.ObjectId(professionalId as string) } : {}),
              ...(authUser.role === 'professional' ? { professionalId: new Types.ObjectId(authUser.professionalId!) } : {}),
              ...(startDate ? { start: { $gte: new Date(startDate as string) } } : {}),
              ...(endDate ? { start: { $lte: new Date(endDate as string) } } : {}),
            }
          },
          { $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalRevenue: { $sum: '$amount' },
          }},
        ]),
        Patient.aggregate([
          { 
            $match: {
              ...(professionalId ? { 
                $or: [
                  { 'clinicalInfo.primaryProfessional': new Types.ObjectId(professionalId as string) },
                  { 'clinicalInfo.assignedProfessionals': new Types.ObjectId(professionalId as string) },
                ]
              } : {}),
              ...(authUser.role === 'professional' ? {
                $or: [
                  { 'clinicalInfo.primaryProfessional': new Types.ObjectId(authUser.professionalId!) },
                  { 'clinicalInfo.assignedProfessionals': new Types.ObjectId(authUser.professionalId!) },
                ]
              } : {}),
              deletedAt: null,
            }
          },
          { $group: {
            _id: '$status',
            count: { $sum: 1 },
          }},
        ]),
        Appointment.aggregate([
          { 
            $match: {
              ...(professionalId ? { professionalId: new Types.ObjectId(professionalId as string) } : {}),
              ...(authUser.role === 'professional' ? { professionalId: new Types.ObjectId(authUser.professionalId!) } : {}),
              status: 'completed',
              ...(startDate ? { start: { $gte: new Date(startDate as string) } } : {}),
              ...(endDate ? { start: { $lte: new Date(endDate as string) } } : {}),
            }
          },
          { $group: {
            _id: {
              year: { $year: '$start' },
              month: { $month: '$start' },
            },
            revenue: { $sum: '$amount' },
            appointments: { $sum: 1 },
          }},
          { $sort: { '_id.year': -1, '_id.month': -1 } },
          { $limit: 12 },
        ]),
      ]);

      const stats = {
        professionals: professionalStats,
        appointments: appointmentStats,
        patients: patientStats,
        revenue: revenueStats,
      };

      res.status(200).json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      logger.error('Get professional stats error:', error);
      next(error);
    }
  }

  /**
   * Deactivate professional (soft delete)
   */
  static async deactivateProfessional(req: Request, res: Response, next: NextFunction) {
    try {
      const { professionalId } = req.params;
      const authUser = (req as AuthRequest).user!;

      // Only admin can deactivate professionals
      if (authUser.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Only administrators can deactivate professionals',
        });
      }

      const professional = await Professional.findById(professionalId);
      if (!professional) {
        return res.status(404).json({
          success: false,
          message: 'Professional not found',
        });
      }

      // Check for active appointments
      const activeAppointments = await Appointment.countDocuments({
        professionalId: professional._id,
        status: { $in: ['scheduled', 'confirmed'] },
        start: { $gte: new Date() },
      });

      if (activeAppointments > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot deactivate professional with ${activeAppointments} active future appointments. Please reschedule or cancel them first.`,
        });
      }

      professional.status = 'inactive';
      professional.isActive = false;
      professional.deletedAt = new Date();
      await professional.save();

      // Also deactivate associated user account
      if (professional.userId) {
        await User.findByIdAndUpdate(professional.userId, {
          isActive: false,
          deletedAt: new Date(),
        });
      }

      // Log professional deactivation
      await AuditLog.create({
        action: 'professional_deactivated',
        entityType: 'professional',
        entityId: professional._id.toString(),
        actorId: authUser._id,
        actorType: 'user',
        actorEmail: authUser.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'success',
        changes: {
          status: { from: 'active', to: 'inactive' },
          isActive: { from: true, to: false },
          deletedAt: { from: null, to: new Date() },
        },
        security: {
          riskLevel: 'high',
          authMethod: 'jwt',
          compliance: {
            hipaaRelevant: true,
            gdprRelevant: false,
            requiresRetention: true,
          },
        },
        business: {
          clinicalRelevant: true,
          containsPHI: false,
          dataClassification: 'internal',
        },
        metadata: {
          source: 'professional_controller',
          priority: 'high',
        },
        timestamp: new Date(),
      });

      res.status(200).json({
        success: true,
        message: 'Professional deactivated successfully',
      });
    } catch (error) {
      logger.error('Deactivate professional error:', error);
      next(error);
    }
  }
}

export default ProfessionalController;

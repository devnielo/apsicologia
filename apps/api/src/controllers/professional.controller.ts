import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Professional, IProfessionalDocument } from '../models/Professional.js';
import { User } from '../models/User.js';
import { Patient } from '../models/Patient.js';
import { AuditLog } from '../models/AuditLog.js';
import logger from '../config/logger.js';
import { AuthRequest } from '../middleware/auth.js';

interface CreateProfessionalRequest {
  name: string;
  email?: string;
  phone?: string;
  licenseNumber: string;
  specialties: string[];
  qualifications?: {
    degree: string;
    institution: string;
    year: number;
    verified?: boolean;
  }[];
  bio?: string;
  languages?: string[];
  consultationTypes: ('in-person' | 'online' | 'phone')[];
  hourlyRate?: number;
  currency?: string;
  weeklyAvailability?: {
    monday?: { start: string; end: string; }[];
    tuesday?: { start: string; end: string; }[];
    wednesday?: { start: string; end: string; }[];
    thursday?: { start: string; end: string; }[];
    friday?: { start: string; end: string; }[];
    saturday?: { start: string; end: string; }[];
    sunday?: { start: string; end: string; }[];
  };
  vacations?: {
    startDate: Date;
    endDate: Date;
    reason?: string;
  }[];
  isActive?: boolean;
}

interface UpdateProfessionalRequest {
  name?: string;
  email?: string;
  phone?: string;
  licenseNumber?: string;
  specialties?: string[];
  qualifications?: {
    degree: string;
    institution: string;
    year: number;
    verified?: boolean;
  }[];
  bio?: string;
  languages?: string[];
  consultationTypes?: ('in-person' | 'online' | 'phone')[];
  hourlyRate?: number;
  currency?: string;
  weeklyAvailability?: {
    monday?: { start: string; end: string; }[];
    tuesday?: { start: string; end: string; }[];
    wednesday?: { start: string; end: string; }[];
    thursday?: { start: string; end: string; }[];
    friday?: { start: string; end: string; }[];
    saturday?: { start: string; end: string; }[];
    sunday?: { start: string; end: string; }[];
  };
  maxPatientsPerDay?: number;
  bufferMinutes?: number;
  acceptsNewPatients?: boolean;
  telehealthSetup?: {
    platform?: string;
    roomId?: string;
    requirements?: string;
  };
  isActive?: boolean;
}

interface ProfessionalQuery {
  page?: string;
  limit?: string;
  search?: string;
  specialty?: string;
  consultationType?: string;
  acceptsNewPatients?: string;
  isActive?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class ProfessionalController {
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
        consultationType,
        acceptsNewPatients,
        isActive = 'true',
        sortBy = 'name',
        sortOrder = 'asc',
      } = req.query as ProfessionalQuery;

      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;

      // Build filter
      const filter: any = {};

      // Role-based filtering
      if (authUser.role === 'professional') {
        // Professionals can only see themselves and colleagues in same specialty
        filter.$or = [
          { _id: authUser.professionalId },
          { specialties: { $in: [] } }, // Will be populated if user has specialties
        ];

        // Get user's specialties to show colleagues
        if (authUser.professionalId) {
          const userProfessional = await Professional.findById(authUser.professionalId);
          if (userProfessional) {
            filter.$or[1].specialties.$in = userProfessional.specialties;
          }
        }
      }

      // Apply query filters
      if (isActive !== 'all') {
        filter.isActive = isActive === 'true';
      }

      if (specialty) {
        filter.specialties = { $in: [specialty] };
      }

      if (consultationType) {
        filter.consultationTypes = { $in: [consultationType] };
      }

      if (acceptsNewPatients !== undefined) {
        filter.acceptsNewPatients = acceptsNewPatients === 'true';
      }

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { specialties: { $regex: search, $options: 'i' } },
          { licenseNumber: { $regex: search, $options: 'i' } },
        ];
      }

      // Build sort
      const sort: any = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Execute queries
      const [professionals, total] = await Promise.all([
        Professional.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limitNum)
          .select('-weeklyAvailability -vacations'), // Exclude heavy fields from list
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

      const professional = await Professional.findById(professionalId);

      if (!professional) {
        return res.status(404).json({
          success: false,
          message: 'Professional not found',
        });
      }

      // Check permissions - professionals can only see themselves unless admin/reception
      const canView = 
        authUser.role === 'admin' ||
        authUser.role === 'reception' ||
        (authUser.role === 'professional' && authUser.professionalId?.toString() === professionalId);

      if (!canView) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot view this professional',
        });
      }

      // Get patient count for this professional
      const patientCount = await Patient.countDocuments({
        assignedProfessionals: professional._id,
        isActive: true
      });

      res.status(200).json({
        success: true,
        data: { 
          professional,
          patientCount
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

      // Check if professional with same license number already exists
      const existingProfessional = await Professional.findOne({ 
        licenseNumber: professionalData.licenseNumber 
      });
      if (existingProfessional) {
        return res.status(409).json({
          success: false,
          message: 'Professional already exists with this license number',
        });
      }

      // Check email uniqueness if provided
      if (professionalData.email) {
        const existingEmail = await Professional.findOne({ 
          email: professionalData.email.toLowerCase() 
        });
        if (existingEmail) {
          return res.status(409).json({
            success: false,
            message: 'Professional already exists with this email',
          });
        }
      }

      // Create professional
      const professional = new Professional({
        ...professionalData,
        email: professionalData.email?.toLowerCase(),
        isActive: professionalData.isActive ?? true,
        isAcceptingNewPatients: true,
        maxPatientsPerDay: 8,
        bufferMinutes: 15,
        title: 'Psicólogo/a',
        status: 'active',
        userId: new Types.ObjectId(), // Temporary, will be updated if user is created
      });

      await professional.save();

      // Create corresponding user account if email is provided
      let userAccount = null;
      if (professionalData.email) {
        try {
          const temporaryPassword = Math.random().toString(36).slice(-8);
          userAccount = new User({
            email: professionalData.email.toLowerCase(),
            password: temporaryPassword,
            name: professionalData.name,
            phone: professionalData.phone,
            role: 'professional',
            professionalId: professional._id,
            isActive: true,
            registrationInfo: {
              ipAddress: req.ip,
              userAgent: req.get('User-Agent'),
              source: 'professional_created',
            },
            preferences: {
              language: professionalData.languages?.[0] || 'es',
              notifications: {
                email: true,
                sms: false,
                push: true,
              },
            },
          });

          await userAccount.save();

          logger.info(`Professional user account created with temporary password: ${temporaryPassword}`, {
            professionalId: professional._id,
            email: professionalData.email,
          });
        } catch (userError) {
          logger.error('Failed to create user account for professional:', userError);
        }
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
            licenseNumber: professional.licenseNumber,
            specialties: professional.specialties,
            userAccountCreated: !!userAccount,
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

      res.status(201).json({
        success: true,
        message: 'Professional created successfully',
        data: { 
          professional,
          userAccountCreated: !!userAccount 
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
      const updateData = req.body as UpdateProfessionalRequest;

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

      // Store original values for audit
      const originalValues = {
        name: professional.name,
        email: professional.email,
        specialties: professional.specialties,
        status: professional.status,
        isAcceptingNewPatients: professional.isAcceptingNewPatients,
        isActive: professional.isActive,
      };

      // Check license number uniqueness if changing
      if (updateData.licenseNumber && updateData.licenseNumber !== professional.licenseNumber) {
        const existingProfessional = await Professional.findOne({ 
          licenseNumber: updateData.licenseNumber,
          _id: { $ne: professionalId }
        });
        if (existingProfessional) {
          return res.status(409).json({
            success: false,
            message: 'Another professional already exists with this license number',
          });
        }
      }

      // Check email uniqueness if changing
      if (updateData.email && updateData.email !== professional.email) {
        const existingEmail = await Professional.findOne({ 
          email: updateData.email.toLowerCase(),
          _id: { $ne: professionalId }
        });
        if (existingEmail) {
          return res.status(409).json({
            success: false,
            message: 'Another professional already exists with this email',
          });
        }
      }

      // Update professional fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key as keyof UpdateProfessionalRequest] !== undefined) {
          if (key === 'email' && updateData.email) {
            (professional as any)[key] = updateData.email.toLowerCase();
          } else {
            (professional as any)[key] = updateData[key as keyof UpdateProfessionalRequest];
          }
        }
      });

      professional.updatedAt = new Date();
      await professional.save();

      // Update corresponding user account if exists
      if (updateData.email || updateData.name || updateData.phone) {
        const userAccount = await User.findOne({ professionalId: professional._id });
        if (userAccount) {
          if (updateData.email) userAccount.email = updateData.email.toLowerCase();
          if (updateData.name) userAccount.name = updateData.name;
          if (updateData.phone) userAccount.phone = updateData.phone;
          await userAccount.save();
        }
      }

      // Build changes object for audit
      const changes: any = {};
      Object.keys(originalValues).forEach(key => {
        const originalValue = (originalValues as any)[key];
        const newValue = (professional as any)[key];
        if (JSON.stringify(originalValue) !== JSON.stringify(newValue)) {
          changes[key] = { from: originalValue, to: newValue };
        }
      });

      // Log professional update if there were changes
      if (Object.keys(changes).length > 0) {
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
          changes,
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
      }

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
   * Deactivate professional
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

      if (!professional.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Professional is already deactivated',
        });
      }

      // Check if professional has active patients
      const activePatientCount = await Patient.countDocuments({
        assignedProfessionals: professional._id,
        isActive: true
      });

      if (activePatientCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot deactivate professional with ${activePatientCount} active patients. Please reassign patients first.`,
        });
      }

      professional.isActive = false;
      professional.isAcceptingNewPatients = false;
      professional.updatedAt = new Date();
      await professional.save();

      // Also deactivate corresponding user account
      const userAccount = await User.findOne({ professionalId: professional._id });
      if (userAccount) {
        userAccount.isActive = false;
        await userAccount.save();
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
          isActive: { from: true, to: false },
          isAcceptingNewPatients: { from: professional.isAcceptingNewPatients, to: false },
          userAccountDeactivated: !!userAccount,
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

  /**
   * Reactivate professional
   */
  static async reactivateProfessional(req: Request, res: Response, next: NextFunction) {
    try {
      const { professionalId } = req.params;
      const authUser = (req as AuthRequest).user!;

      // Only admin can reactivate professionals
      if (authUser.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Only administrators can reactivate professionals',
        });
      }

      const professional = await Professional.findById(professionalId);
      if (!professional) {
        return res.status(404).json({
          success: false,
          message: 'Professional not found',
        });
      }

      if (professional.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Professional is already active',
        });
      }

      professional.isActive = true;
      professional.updatedAt = new Date();
      await professional.save();

      // Also reactivate corresponding user account
      const userAccount = await User.findOne({ professionalId: professional._id });
      if (userAccount) {
        userAccount.isActive = true;
        await userAccount.save();
      }

      res.status(200).json({
        success: true,
        message: 'Professional reactivated successfully',
      });
    } catch (error) {
      logger.error('Reactivate professional error:', error);
      next(error);
    }
  }

  /**
   * Get professional statistics
   */
  static async getProfessionalStats(req: Request, res: Response, next: NextFunction) {
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
        totalProfessionals,
        activeProfessionals,
        acceptingNewPatients,
        professionalsBySpecialty,
        professionalsByConsultationType,
        topProfessionalsByPatients,
      ] = await Promise.all([
        Professional.countDocuments(),
        Professional.countDocuments({ isActive: true }),
        Professional.countDocuments({ isActive: true, acceptsNewPatients: true }),
        Professional.aggregate([
          { $match: { isActive: true } },
          { $unwind: '$specialties' },
          { $group: { _id: '$specialties', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        Professional.aggregate([
          { $match: { isActive: true } },
          { $unwind: '$consultationTypes' },
          { $group: { _id: '$consultationTypes', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        Professional.aggregate([
          { $match: { isActive: true } },
          { $lookup: {
            from: 'patients',
            let: { professionalId: '$_id' },
            pipeline: [
              { $match: {
                $expr: { $in: ['$$professionalId', '$assignedProfessionals'] },
                isActive: true
              }},
              { $count: 'patientCount' }
            ],
            as: 'patientInfo'
          }},
          { $project: {
            name: 1,
            specialties: 1,
            patientCount: { $ifNull: [{ $arrayElemAt: ['$patientInfo.patientCount', 0] }, 0] }
          }},
          { $sort: { patientCount: -1 } },
          { $limit: 10 },
        ]),
      ]);

      const stats = {
        total: totalProfessionals,
        active: activeProfessionals,
        inactive: totalProfessionals - activeProfessionals,
        acceptingNewPatients,
        bySpecialty: professionalsBySpecialty,
        byConsultationType: professionalsByConsultationType,
        topByPatients: topProfessionalsByPatients,
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
   * Get professional availability for calendar integration
   */
  static async getProfessionalAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const { professionalId } = req.params;
      const authUser = (req as AuthRequest).user!;
      const { startDate, endDate } = req.query;

      const professional = await Professional.findById(professionalId);
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
          message: 'Access denied: Cannot view this professional availability',
        });
      }

      // Return availability data for calendar integration
      const availability = {
        weeklyAvailability: professional.weeklyAvailability,
        vacations: professional.vacations,
        bufferMinutes: professional.bufferMinutes,
        maxPatientsPerDay: professional.maxPatientsPerDay,
        consultationTypes: professional.consultationTypes,
        telehealthSetup: professional.telehealthSetup,
      };

      res.status(200).json({
        success: true,
        data: { availability },
      });
    } catch (error) {
      logger.error('Get professional availability error:', error);
      next(error);
    }
  }

  /**
   * Update professional availability
   */
  static async updateProfessionalAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const { professionalId } = req.params;
      const authUser = (req as AuthRequest).user!;
      const { weeklyAvailability, vacations, bufferMinutes, maxPatientsPerDay } = req.body;

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
          message: 'Access denied: Cannot update this professional availability',
        });
      }

      // Update availability fields
      if (weeklyAvailability) professional.weeklyAvailability = weeklyAvailability;
      if (vacations) professional.vacations = vacations;
      if (bufferMinutes !== undefined) professional.bufferMinutes = bufferMinutes;
      if (maxPatientsPerDay !== undefined) professional.maxPatientsPerDay = maxPatientsPerDay;

      professional.updatedAt = new Date();
      await professional.save();

      res.status(200).json({
        success: true,
        message: 'Professional availability updated successfully',
        data: { 
          availability: {
            weeklyAvailability: professional.weeklyAvailability,
            vacations: professional.vacations,
            bufferMinutes: professional.bufferMinutes,
            maxPatientsPerDay: professional.maxPatientsPerDay,
          }
        },
      });
    } catch (error) {
      logger.error('Update professional availability error:', error);
      next(error);
    }
  }
}

export default ProfessionalController;

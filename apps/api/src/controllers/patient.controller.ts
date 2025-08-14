import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Patient, IPatientDocument } from '../models/Patient.js';
import { User } from '../models/User.js';
import { Professional } from '../models/Professional.js';
import { AuditLog } from '../models/AuditLog.js';
import logger from '../config/logger.js';
import { AuthRequest } from '../middleware/auth.js';

interface CreatePatientRequest {
  name: string;
  email: string;
  phone: string;
  birthDate?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  allergies?: string[];
  medicalConditions?: string[];
  medications?: string[];
  assignedProfessionalId?: string;
  tags?: string[];
  source?: 'online' | 'referral' | 'direct' | 'other';
  referredBy?: string;
}

interface UpdatePatientRequest {
  name?: string;
  email?: string;
  phone?: string;
  birthDate?: Date;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  address?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
  };
  emergencyContact?: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  allergies?: string[];
  medicalConditions?: string[];
  medications?: string[];
  assignedProfessionalId?: string;
  tags?: string[];
  clinicalNotes?: string;
  riskLevel?: 'low' | 'medium' | 'high';
  status?: 'active' | 'inactive' | 'discharged' | 'pending';
}

interface PatientQuery {
  page?: string;
  limit?: string;
  search?: string;
  assignedProfessionalId?: string;
  tags?: string;
  status?: string;
  riskLevel?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  includeInactive?: string;
}

export class PatientController {
  /**
   * Get all patients with pagination, filtering, and role-based access control
   */
  static async getPatients(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user!;
      const {
        page = '1',
        limit = '20',
        search,
        assignedProfessionalId,
        tags,
        status,
        riskLevel,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        includeInactive = 'false',
      } = req.query as PatientQuery;

      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;

      // Build filter based on user role and permissions
      const filter: any = {};

      // Role-based filtering
      if (authUser.role === 'professional' && authUser.professionalId) {
        filter.assignedProfessionals = authUser.professionalId;
      }

      // Apply query filters
      if (assignedProfessionalId && (authUser.role === 'admin' || authUser.role === 'reception')) {
        filter.assignedProfessionals = new Types.ObjectId(assignedProfessionalId);
      }

      if (status) {
        filter.status = status;
      }

      if (riskLevel) {
        filter.riskLevel = riskLevel;
      }

      if (includeInactive !== 'true') {
        filter.isActive = true;
      }

      if (tags) {
        const tagArray = tags.split(',').map(tag => tag.trim());
        filter.tags = { $in: tagArray };
      }

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
          { phone: { $regex: search, $options: 'i' } },
          { 'emergencyContact.name': { $regex: search, $options: 'i' } },
        ];
      }

      // Build sort
      const sort: any = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Execute queries
      const [patients, total] = await Promise.all([
        Patient.find(filter)
          .populate('assignedProfessionals', 'name specialties')
          .populate('primaryProfessional', 'name specialties')
          .sort(sort)
          .skip(skip)
          .limit(limitNum),
        Patient.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / limitNum);

      res.status(200).json({
        success: true,
        data: {
          patients,
          pagination: {
            currentPage: pageNum,
            totalPages,
            totalPatients: total,
            hasNext: pageNum < totalPages,
            hasPrev: pageNum > 1,
          },
        },
      });
    } catch (error) {
      logger.error('Get patients error:', error);
      next(error);
    }
  }

  /**
   * Get patient by ID with role-based access control
   */
  static async getPatientById(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId } = req.params;
      const authUser = (req as AuthRequest).user!;

      // Find patient
      const patient = await Patient.findById(patientId)
        .populate('assignedProfessionals', 'name specialties email phone')
        .populate('primaryProfessional', 'name specialties email phone');

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found',
        });
      }

      // Check permissions
      const canView = 
        authUser.role === 'admin' ||
        authUser.role === 'reception' ||
        (authUser.role === 'professional' && 
         patient.assignedProfessionals.some(prof => prof._id.toString() === authUser.professionalId?.toString())) ||
        (authUser.role === 'patient' && patient.userId?.toString() === authUser._id.toString());

      if (!canView) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot view this patient',
        });
      }

      res.status(200).json({
        success: true,
        data: { patient },
      });
    } catch (error) {
      logger.error('Get patient by ID error:', error);
      next(error);
    }
  }

  /**
   * Create new patient
   */
  static async createPatient(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user!;
      const patientData = req.body as CreatePatientRequest;

      // Only admin and reception can create patients
      if (authUser.role !== 'admin' && authUser.role !== 'reception') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Only administrators and reception can create patients',
        });
      }

      // Validate assigned professional if provided
      if (patientData.assignedProfessionalId) {
        const professional = await Professional.findById(patientData.assignedProfessionalId);
        if (!professional) {
          return res.status(400).json({
            success: false,
            message: 'Invalid assigned professional ID',
          });
        }
      }

      // Check if patient with same email already exists
      const existingPatient = await Patient.findOne({ 
        email: patientData.email.toLowerCase(),
        isActive: true
      });
      if (existingPatient) {
        return res.status(409).json({
          success: false,
          message: 'Patient already exists with this email',
        });
      }

      // Create patient data
      const createData: any = {
        name: patientData.name,
        email: patientData.email.toLowerCase(),
        phone: patientData.phone,
        birthDate: patientData.birthDate,
        gender: patientData.gender,
        address: patientData.address,
        emergencyContact: patientData.emergencyContact,
        allergies: patientData.allergies || [],
        medicalConditions: patientData.medicalConditions || [],
        medications: patientData.medications || [],
        tags: patientData.tags || [],
        source: patientData.source || 'direct',
        referredBy: patientData.referredBy,
        assignedProfessionals: patientData.assignedProfessionalId ? [patientData.assignedProfessionalId] : [],
        primaryProfessional: patientData.assignedProfessionalId,
        status: 'pending',
        riskLevel: 'low',
        isActive: true,
        consents: {
          treatmentConsent: {
            granted: false,
          },
          dataProcessing: {
            granted: true,
            grantedAt: new Date(),
          },
          marketing: {
            granted: false,
          },
        },
      };

      // Create patient
      const patient = new Patient(createData);
      await patient.save();

      // Create corresponding user account
      let userAccount = null;
      try {
        const temporaryPassword = Math.random().toString(36).slice(-8);
        userAccount = new User({
          email: patientData.email.toLowerCase(),
          password: temporaryPassword,
          name: patientData.name,
          phone: patientData.phone,
          role: 'patient',
          patientId: patient._id,
          isActive: true,
          registrationInfo: {
            ipAddress: req.ip,
            userAgent: req.get('User-Agent'),
            source: 'patient_created',
          },
          preferences: {
            language: 'es',
            notifications: {
              email: true,
              sms: false,
              push: false,
            },
          },
        });

        await userAccount.save();

        // Update patient with userId
        patient.userId = userAccount._id;
        await patient.save();

        logger.info(`Patient user account created with temporary password: ${temporaryPassword}`, {
          patientId: patient._id,
          email: patientData.email,
        });
      } catch (userError) {
        logger.error('Failed to create user account for patient:', userError);
      }

      // Log patient creation
      await AuditLog.create({
        action: 'patient_created',
        entityType: 'patient',
        entityId: patient._id.toString(),
        actorId: authUser._id,
        actorType: 'user',
        actorEmail: authUser.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'success',
        changes: {
          created: {
            name: patient.name,
            email: patient.email,
            assignedProfessionals: patient.assignedProfessionals,
            userAccountCreated: !!userAccount,
          },
        },
        business: {
          clinicalRelevant: true,
          containsPHI: true,
          dataClassification: 'confidential',
        },
        metadata: {
          source: 'patient_controller',
          priority: 'medium',
        },
        timestamp: new Date(),
      });

      // Populate response
      await patient.populate('assignedProfessionals', 'name specialties');
      await patient.populate('primaryProfessional', 'name specialties');

      res.status(201).json({
        success: true,
        message: 'Patient created successfully',
        data: { 
          patient,
          userAccountCreated: !!userAccount 
        },
      });
    } catch (error) {
      logger.error('Create patient error:', error);
      next(error);
    }
  }

  /**
   * Update patient information
   */
  static async updatePatient(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId } = req.params;
      const authUser = (req as AuthRequest).user!;
      const updateData = req.body as UpdatePatientRequest;

      // Find patient
      const patient = await Patient.findById(patientId);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found',
        });
      }

      // Check permissions
      const canUpdate = 
        authUser.role === 'admin' ||
        authUser.role === 'reception' ||
        (authUser.role === 'professional' && 
         patient.assignedProfessionals.some(prof => prof.toString() === authUser.professionalId?.toString()));

      if (!canUpdate) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot update this patient',
        });
      }

      // Store original values for audit
      const originalValues = {
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        status: patient.status,
        riskLevel: patient.riskLevel,
        assignedProfessionals: patient.assignedProfessionals,
      };

      // Validate assigned professional if changing
      if (updateData.assignedProfessionalId) {
        const professional = await Professional.findById(updateData.assignedProfessionalId);
        if (!professional) {
          return res.status(400).json({
            success: false,
            message: 'Invalid assigned professional ID',
          });
        }
      }

      // Check email uniqueness if changing
      if (updateData.email && updateData.email !== patient.email) {
        const existingPatient = await Patient.findOne({ 
          email: updateData.email.toLowerCase(),
          _id: { $ne: patientId },
          isActive: true
        });
        if (existingPatient) {
          return res.status(409).json({
            success: false,
            message: 'Another patient already exists with this email',
          });
        }
      }

      // Update patient fields
      if (updateData.name) patient.name = updateData.name;
      if (updateData.email) patient.email = updateData.email.toLowerCase();
      if (updateData.phone) patient.phone = updateData.phone;
      if (updateData.birthDate) patient.birthDate = updateData.birthDate;
      if (updateData.gender) patient.gender = updateData.gender;
      if (updateData.address) patient.address = updateData.address;
      if (updateData.emergencyContact) patient.emergencyContact = updateData.emergencyContact;
      if (updateData.allergies) patient.allergies = updateData.allergies;
      if (updateData.medicalConditions) patient.medicalConditions = updateData.medicalConditions;
      if (updateData.medications) patient.medications = updateData.medications;
      if (updateData.tags) patient.tags = updateData.tags;
      if (updateData.clinicalNotes) patient.clinicalNotes = updateData.clinicalNotes;
      if (updateData.riskLevel) patient.riskLevel = updateData.riskLevel;
      if (updateData.status) patient.status = updateData.status;
      
      if (updateData.assignedProfessionalId) {
        patient.assignedProfessionals = [new Types.ObjectId(updateData.assignedProfessionalId)];
        patient.primaryProfessional = new Types.ObjectId(updateData.assignedProfessionalId);
      }

      await patient.save();

      // Update corresponding user account if exists
      if (updateData.email || updateData.name || updateData.phone) {
        const userAccount = await User.findOne({ patientId: patient._id });
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
        const newValue = (patient as any)[key];
        if (JSON.stringify(originalValue) !== JSON.stringify(newValue)) {
          changes[key] = { from: originalValue, to: newValue };
        }
      });

      // Log patient update if there were changes
      if (Object.keys(changes).length > 0) {
        await AuditLog.create({
          action: 'patient_updated',
          entityType: 'patient',
          entityId: patient._id.toString(),
          actorId: authUser._id,
          actorType: 'user',
          actorEmail: authUser.email,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
          status: 'success',
          changes,
          business: {
            clinicalRelevant: true,
            containsPHI: true,
            dataClassification: 'confidential',
          },
          metadata: {
            source: 'patient_controller',
            priority: 'medium',
          },
          timestamp: new Date(),
        });
      }

      // Populate and return updated patient
      await patient.populate('assignedProfessionals', 'name specialties');
      await patient.populate('primaryProfessional', 'name specialties');

      res.status(200).json({
        success: true,
        message: 'Patient updated successfully',
        data: { patient },
      });
    } catch (error) {
      logger.error('Update patient error:', error);
      next(error);
    }
  }

  /**
   * Deactivate patient (soft delete)
   */
  static async deactivatePatient(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId } = req.params;
      const authUser = (req as AuthRequest).user!;

      // Only admin can deactivate patients
      if (authUser.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Only administrators can deactivate patients',
        });
      }

      const patient = await Patient.findById(patientId);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found',
        });
      }

      if (!patient.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Patient is already deactivated',
        });
      }

      patient.isActive = false;
      patient.deletedAt = new Date();
      await patient.save();

      // Also deactivate corresponding user account
      const userAccount = await User.findOne({ patientId: patient._id });
      if (userAccount) {
        userAccount.isActive = false;
        await userAccount.save();
      }

      // Log patient deactivation
      await AuditLog.create({
        action: 'patient_deactivated',
        entityType: 'patient',
        entityId: patient._id.toString(),
        actorId: authUser._id,
        actorType: 'user',
        actorEmail: authUser.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'success',
        changes: {
          isActive: { from: true, to: false },
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
          containsPHI: true,
          dataClassification: 'confidential',
        },
        metadata: {
          source: 'patient_controller',
          priority: 'high',
        },
        timestamp: new Date(),
      });

      res.status(200).json({
        success: true,
        message: 'Patient deactivated successfully',
      });
    } catch (error) {
      logger.error('Deactivate patient error:', error);
      next(error);
    }
  }

  /**
   * Reactivate patient
   */
  static async reactivatePatient(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId } = req.params;
      const authUser = (req as AuthRequest).user!;

      // Only admin can reactivate patients
      if (authUser.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Only administrators can reactivate patients',
        });
      }

      const patient = await Patient.findById(patientId);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found',
        });
      }

      if (patient.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Patient is already active',
        });
      }

      patient.isActive = true;
      patient.deletedAt = undefined;
      await patient.save();

      // Also reactivate corresponding user account
      const userAccount = await User.findOne({ patientId: patient._id });
      if (userAccount) {
        userAccount.isActive = true;
        await userAccount.save();
      }

      res.status(200).json({
        success: true,
        message: 'Patient reactivated successfully',
      });
    } catch (error) {
      logger.error('Reactivate patient error:', error);
      next(error);
    }
  }

  /**
   * Get patient statistics
   */
  static async getPatientStats(req: Request, res: Response, next: NextFunction) {
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
        totalPatients,
        activePatients,
        patientsByStatus,
        patientsByRisk,
        recentPatients,
      ] = await Promise.all([
        Patient.countDocuments(),
        Patient.countDocuments({ isActive: true }),
        Patient.aggregate([
          { $match: { isActive: true } },
          { $group: { _id: '$status', count: { $sum: 1 } }},
          { $sort: { count: -1 } },
        ]),
        Patient.aggregate([
          { $match: { isActive: true } },
          { $group: { _id: '$riskLevel', count: { $sum: 1 } }},
          { $sort: { count: -1 } },
        ]),
        Patient.find({ isActive: true })
          .sort({ createdAt: -1 })
          .limit(10)
          .select('name email phone status riskLevel createdAt')
          .populate('primaryProfessional', 'name'),
      ]);

      const stats = {
        total: totalPatients,
        active: activePatients,
        inactive: totalPatients - activePatients,
        byStatus: patientsByStatus,
        byRisk: patientsByRisk,
        recent: recentPatients,
      };

      res.status(200).json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      logger.error('Get patient stats error:', error);
      next(error);
    }
  }

  /**
   * Update consent for patient
   */
  static async updateConsent(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId } = req.params;
      const authUser = (req as AuthRequest).user!;
      const { consentType, granted, document } = req.body;

      const patient = await Patient.findById(patientId);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found',
        });
      }

      // Check permissions
      const canUpdate = 
        authUser.role === 'admin' ||
        authUser.role === 'reception' ||
        (authUser.role === 'professional' && 
         patient.assignedProfessionals.some(prof => prof.toString() === authUser.professionalId?.toString()));

      if (!canUpdate) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot update this patient',
        });
      }

      // Update consent manually
      if (patient.consents && patient.consents[consentType as keyof typeof patient.consents]) {
        (patient.consents as any)[consentType] = {
          granted,
          grantedAt: granted ? new Date() : undefined,
          document
        };
        await patient.save();
      }

      res.status(200).json({
        success: true,
        message: 'Consent updated successfully',
        data: { 
          patient: {
            _id: patient._id,
            consents: patient.consents
          }
        },
      });
    } catch (error) {
      logger.error('Update consent error:', error);
      next(error);
    }
  }
}

export default PatientController;

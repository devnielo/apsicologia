import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Patient, IPatientDocument } from '../models/Patient.js';
import { User } from '../models/User.js';
import { Appointment } from '../models/Appointment.js';
import { Invoice } from '../models/Invoice.js';
import { File } from '../models/File.js';
import { AuditLog } from '../models/AuditLog.js';
import logger from '../config/logger.js';
import { AuthRequest } from '../middleware/auth.js';

interface CreatePatientRequest {
  // Personal Information
  personalInfo: {
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: 'male' | 'female' | 'non-binary' | 'other' | 'prefer-not-to-say';
    nationality?: string;
    idNumber?: string;
    idType?: 'dni' | 'nie' | 'passport' | 'other';
    maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed' | 'separated' | 'domestic-partner';
    occupation?: string;
    employer?: string;
  };
  
  // Contact Information
  contactInfo: {
    email: string;
    phone: string;
    alternativePhone?: string;
    preferredContactMethod?: 'email' | 'phone' | 'sms' | 'whatsapp';
    address: {
      street: string;
      city: string;
      postalCode: string;
      state?: string;
      country?: string;
    };
  };
  
  // Emergency Contact
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  
  // Clinical Information
  clinicalInfo?: {
    primaryProfessional?: string;
    assignedProfessionals?: string[];
    medicalHistory?: {
      conditions?: string[];
      allergies?: any[];
      medications?: any[];
    };
    currentTreatment?: {
      treatmentPlan?: string;
      goals?: string[];
      startDate?: string;
      expectedDuration?: string;
      frequency?: string;
      notes?: string;
    };
  };
  
  // Insurance Information
  insurance?: {
    hasInsurance?: boolean;
    primaryInsurance?: {
      provider: string;
      policyNumber: string;
      groupNumber?: string;
      policyHolder: string;
      relationshipToPolicyHolder: 'self' | 'spouse' | 'child' | 'other';
      effectiveDate: string;
      expirationDate?: string;
      copayAmount?: number;
      deductibleAmount?: number;
      coveragePercentage?: number;
      mentalHealthBenefit?: boolean;
      sessionLimit?: number;
      authorizationRequired?: boolean;
      authorizationNumber?: string;
      notes?: string;
    };
    paymentMethod?: 'insurance' | 'self-pay' | 'sliding-scale' | 'pro-bono';
  };
  
  // Preferences
  preferences?: {
    language?: string;
    communicationPreferences?: {
      appointmentReminders?: boolean;
      reminderMethods?: ('email' | 'sms' | 'phone' | 'push')[];
      reminderTiming?: number[];
      newsletters?: boolean;
      marketingCommunications?: boolean;
    };
    appointmentPreferences?: {
      preferredTimes?: any[];
      preferredProfessionals?: string[];
      sessionFormat?: 'in-person' | 'video' | 'phone' | 'any';
      sessionDuration?: number;
      bufferBetweenSessions?: number;
      notes?: string;
    };
  };
  
  // GDPR Consent
  gdprConsent: {
    dataProcessing: {
      consented: boolean;
      consentDate: string;
      consentMethod: 'verbal' | 'written' | 'digital';
      consentVersion?: string;
      notes?: string;
    };
    marketingCommunications?: {
      consented?: boolean;
      consentDate?: string;
      method?: 'verbal' | 'written' | 'digital';
    };
    dataSharing?: {
      healthcareProfessionals?: boolean;
      insuranceProviders?: boolean;
      emergencyContacts?: boolean;
      researchPurposes?: boolean;
      consentDate?: string;
    };
  };
  
  // Referral Information
  referral?: {
    source?: 'self' | 'physician' | 'family' | 'friend' | 'insurance' | 'online' | 'other';
    referringPhysician?: {
      name: string;
      specialty?: string;
      phone?: string;
      email?: string;
      notes?: string;
    };
    referringPerson?: string;
    referralDate?: string;
    referralReason?: string;
    referralNotes?: string;
  };
  
  // Initial tags
  tags?: {
    name: string;
    category: 'clinical' | 'administrative' | 'billing' | 'custom';
    color?: string;
  }[];
  
  // Create user account for patient portal?
  createUserAccount?: boolean;
  sendWelcomeEmail?: boolean;
}

interface PatientQuery {
  page?: string;
  limit?: string;
  search?: string;
  status?: string;
  professionalId?: string;
  tags?: string;
  age?: string;
  ageRange?: string;
  gender?: string;
  language?: string;
  hasInsurance?: string;
  paymentMethod?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  include?: string; // For populating related data
}

export class PatientController {
  /**
   * Get all patients with pagination and filtering
   */
  static async getPatients(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user!;
      const {
        page = '1',
        limit = '20',
        search,
        status,
        professionalId,
        tags,
        age,
        ageRange,
        gender,
        language,
        hasInsurance,
        paymentMethod,
        dateFrom,
        dateTo,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        include,
      } = req.query as PatientQuery;

      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;

      // Build filter
      const filter: any = { deletedAt: null };

      // Role-based filtering
      if (authUser.role === 'professional') {
        filter.$or = [
          { 'clinicalInfo.primaryProfessional': new Types.ObjectId(authUser.professionalId) },
          { 'clinicalInfo.assignedProfessionals': new Types.ObjectId(authUser.professionalId) },
        ];
      } else if (authUser.role === 'patient') {
        // Patients can only see their own record
        const patient = await Patient.findOne({ userId: authUser._id });
        if (patient) {
          filter._id = patient._id;
        } else {
          return res.status(200).json({
            success: true,
            data: {
              patients: [],
              pagination: {
                currentPage: pageNum,
                totalPages: 0,
                totalPatients: 0,
                hasNext: false,
                hasPrev: false,
              },
            },
          });
        }
      }

      // Apply query filters
      if (status) filter.status = status;
      
      if (professionalId && authUser.role !== 'professional') {
        filter.$or = [
          { 'clinicalInfo.primaryProfessional': new Types.ObjectId(professionalId) },
          { 'clinicalInfo.assignedProfessionals': new Types.ObjectId(professionalId) },
        ];
      }
      
      if (tags) {
        const tagArray = tags.split(',');
        filter['tags.name'] = { $in: tagArray };
      }
      
      if (age) {
        filter['personalInfo.age'] = parseInt(age, 10);
      } else if (ageRange) {
        const [minAge, maxAge] = ageRange.split('-').map(Number);
        filter['personalInfo.age'] = { $gte: minAge, $lte: maxAge };
      }
      
      if (gender) filter['personalInfo.gender'] = gender;
      if (language) filter['preferences.language'] = language;
      
      if (hasInsurance) {
        filter['insurance.hasInsurance'] = hasInsurance === 'true';
      }
      
      if (paymentMethod) filter['insurance.paymentMethod'] = paymentMethod;
      
      if (dateFrom || dateTo) {
        filter.createdAt = {};
        if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
        if (dateTo) filter.createdAt.$lte = new Date(dateTo);
      }

      // Text search across multiple fields
      if (search) {
        filter.$or = [
          { 'personalInfo.fullName': { $regex: search, $options: 'i' } },
          { 'personalInfo.firstName': { $regex: search, $options: 'i' } },
          { 'personalInfo.lastName': { $regex: search, $options: 'i' } },
          { 'contactInfo.email': { $regex: search, $options: 'i' } },
          { 'contactInfo.phone': { $regex: search, $options: 'i' } },
          { 'personalInfo.idNumber': { $regex: search, $options: 'i' } },
        ];
      }

      // Build sort
      const sort: any = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Build query with optional population
      let query = Patient.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum);

      // Add population based on include parameter
      if (include) {
        const includeFields = include.split(',');
        if (includeFields.includes('primaryProfessional')) {
          query = query.populate('clinicalInfo.primaryProfessional', 'name specialties');
        }
        if (includeFields.includes('assignedProfessionals')) {
          query = query.populate('clinicalInfo.assignedProfessionals', 'name specialties');
        }
        if (includeFields.includes('userAccount')) {
          query = query.populate('userId', 'email lastLogin twoFactorEnabled');
        }
      }

      // Execute queries
      const [patients, total] = await Promise.all([
        query.exec(),
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
   * Get patient by ID with full details
   */
  static async getPatientById(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId } = req.params;
      const authUser = (req as AuthRequest).user!;
      const { include } = req.query;

      // Build query with population
      let query = Patient.findOne({ _id: patientId, deletedAt: null })
        .populate('clinicalInfo.primaryProfessional', 'name specialties licenseNumber')
        .populate('clinicalInfo.assignedProfessionals', 'name specialties')
        .populate('userId', 'email lastLogin twoFactorEnabled preferences');

      const patient = await query.exec();

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
        (authUser.role === 'professional' && (
          authUser.professionalId?.toString() === patient.clinicalInfo.primaryProfessional?.toString() ||
          patient.clinicalInfo.assignedProfessionals.some((profId: any) => 
            profId.toString() === authUser.professionalId?.toString()
          )
        )) ||
        (authUser.role === 'patient' && patient.userId?.toString() === authUser._id.toString());

      if (!canView) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot view this patient',
        });
      }

      // Optionally include related data
      let additionalData: any = {};

      if (include) {
        const includeFields = include.toString().split(',');

        if (includeFields.includes('appointments')) {
          additionalData.appointments = await Appointment.find({ 
            patientId: patient._id 
          })
            .sort({ createdAt: -1 })
            .limit(10)
            .populate('professionalId', 'name')
            .populate('serviceId', 'name duration');
        }

        if (includeFields.includes('invoices')) {
          additionalData.invoices = await Invoice.find({ 
            patientId: patient._id 
          })
            .sort({ issueDate: -1 })
            .limit(10);
        }

        if (includeFields.includes('files')) {
          additionalData.files = await File.find({
            ownerType: 'patient',
            ownerId: patient._id,
          })
            .sort({ createdAt: -1 })
            .limit(20);
        }

        if (includeFields.includes('statistics')) {
          const [appointmentStats, invoiceStats] = await Promise.all([
            Appointment.aggregate([
              { $match: { patientId: patient._id } },
              { $group: {
                _id: '$status',
                count: { $sum: 1 }
              }}
            ]),
            Invoice.aggregate([
              { $match: { patientId: patient._id } },
              { $group: {
                _id: null,
                totalAmount: { $sum: '$totals.total' },
                paidAmount: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$totals.total', 0] } },
                invoiceCount: { $sum: 1 }
              }}
            ])
          ]);

          additionalData.statistics = {
            appointments: appointmentStats,
            invoices: invoiceStats[0] || { totalAmount: 0, paidAmount: 0, invoiceCount: 0 }
          };
        }
      }

      res.status(200).json({
        success: true,
        data: { 
          patient,
          ...additionalData
        },
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

      // Only admin, reception, and professionals can create patients
      if (!['admin', 'reception', 'professional'].includes(authUser.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot create patients',
        });
      }

      // Check if email already exists
      const existingPatient = await (Patient as any).findByEmail(patientData.contactInfo.email);
      if (existingPatient) {
        return res.status(409).json({
          success: false,
          message: 'A patient with this email already exists',
        });
      }

      // Check if ID number already exists (if provided)
      if (patientData.personalInfo.idNumber && patientData.personalInfo.idType) {
        const existingByIdNumber = await (Patient as any).findByIdNumber(
          patientData.personalInfo.idNumber,
          patientData.personalInfo.idType
        );
        if (existingByIdNumber) {
          return res.status(409).json({
            success: false,
            message: 'A patient with this ID number already exists',
          });
        }
      }

      // Prepare patient data
      const patientPayload: any = {
        personalInfo: {
          ...patientData.personalInfo,
          dateOfBirth: new Date(patientData.personalInfo.dateOfBirth),
          fullName: `${patientData.personalInfo.firstName} ${patientData.personalInfo.lastName}`.trim(),
          age: 0, // Will be calculated by the pre-save middleware
        },
        contactInfo: patientData.contactInfo,
        emergencyContact: patientData.emergencyContact,
        clinicalInfo: {
          primaryProfessional: patientData.clinicalInfo?.primaryProfessional ? 
            new Types.ObjectId(patientData.clinicalInfo.primaryProfessional) : undefined,
          assignedProfessionals: patientData.clinicalInfo?.assignedProfessionals?.map(
            id => new Types.ObjectId(id)
          ) || [],
          medicalHistory: patientData.clinicalInfo?.medicalHistory || {
            conditions: [],
            medications: [],
            allergies: [],
            surgeries: [],
            hospitalizations: [],
          },
          mentalHealthHistory: {
            previousTreatments: [],
            diagnoses: [],
            riskFactors: [],
          },
          currentTreatment: patientData.clinicalInfo?.currentTreatment ? {
            ...patientData.clinicalInfo.currentTreatment,
            startDate: patientData.clinicalInfo.currentTreatment.startDate ?
              new Date(patientData.clinicalInfo.currentTreatment.startDate) : new Date(),
          } : {
            goals: [],
            startDate: new Date(),
          },
        },
        insurance: patientData.insurance || {
          hasInsurance: false,
          paymentMethod: 'self-pay',
        },
        preferences: {
          language: patientData.preferences?.language || 'es',
          communicationPreferences: {
            appointmentReminders: patientData.preferences?.communicationPreferences?.appointmentReminders ?? true,
            reminderMethods: patientData.preferences?.communicationPreferences?.reminderMethods || ['email'],
            reminderTiming: patientData.preferences?.communicationPreferences?.reminderTiming || [24, 2],
            newsletters: patientData.preferences?.communicationPreferences?.newsletters ?? false,
            marketingCommunications: patientData.preferences?.communicationPreferences?.marketingCommunications ?? false,
          },
          appointmentPreferences: patientData.preferences?.appointmentPreferences || {
            preferredTimes: [],
            preferredProfessionals: [],
            sessionFormat: 'in-person',
            sessionDuration: 50,
          },
          portalAccess: {
            enabled: patientData.createUserAccount || false,
            twoFactorEnabled: false,
            loginNotifications: true,
          },
        },
        gdprConsent: {
          dataProcessing: {
            consented: patientData.gdprConsent.dataProcessing.consented,
            consentDate: new Date(patientData.gdprConsent.dataProcessing.consentDate),
            consentMethod: patientData.gdprConsent.dataProcessing.consentMethod,
            consentVersion: patientData.gdprConsent.dataProcessing.consentVersion || '1.0',
            witnessedBy: authUser._id,
            notes: patientData.gdprConsent.dataProcessing.notes,
          },
          marketingCommunications: {
            consented: patientData.gdprConsent.marketingCommunications?.consented || false,
            consentDate: patientData.gdprConsent.marketingCommunications?.consentDate ?
              new Date(patientData.gdprConsent.marketingCommunications.consentDate) : undefined,
            method: patientData.gdprConsent.marketingCommunications?.method || 'digital',
          },
          dataSharing: {
            healthcareProfessionals: patientData.gdprConsent.dataSharing?.healthcareProfessionals ?? true,
            insuranceProviders: patientData.gdprConsent.dataSharing?.insuranceProviders ?? false,
            emergencyContacts: patientData.gdprConsent.dataSharing?.emergencyContacts ?? true,
            researchPurposes: patientData.gdprConsent.dataSharing?.researchPurposes ?? false,
            consentDate: patientData.gdprConsent.dataSharing?.consentDate ?
              new Date(patientData.gdprConsent.dataSharing.consentDate) : new Date(),
          },
          rightToErasure: {
            requested: false,
          },
          dataPortability: {},
        },
        referral: patientData.referral || {},
        tags: [],
        status: 'active',
        relationships: [],
        statistics: {
          totalAppointments: 0,
          completedAppointments: 0,
          cancelledAppointments: 0,
          noShowAppointments: 0,
          totalInvoiceAmount: 0,
          totalPaidAmount: 0,
        },
        administrativeNotes: [],
        episodes: [],
        createdBy: authUser._id,
      };

      // Convert insurance dates if provided
      if (patientData.insurance?.primaryInsurance) {
        patientPayload.insurance.primaryInsurance = {
          ...patientData.insurance.primaryInsurance,
          effectiveDate: new Date(patientData.insurance.primaryInsurance.effectiveDate),
          expirationDate: patientData.insurance.primaryInsurance.expirationDate ?
            new Date(patientData.insurance.primaryInsurance.expirationDate) : undefined,
        };
      }

      // Create patient
      const patient = new Patient(patientPayload);
      await patient.save();

      // Add initial tags if provided
      if (patientData.tags && patientData.tags.length > 0) {
        for (const tag of patientData.tags) {
          await patient.addTag(tag.name, tag.category, authUser._id);
        }
      }

      // Create user account for patient portal if requested
      let userAccount = null;
      if (patientData.createUserAccount) {
        try {
          const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
          
          userAccount = new User({
            email: patientData.contactInfo.email,
            password: tempPassword, // Will be hashed by pre-save middleware
            role: 'patient',
            name: `${patientData.personalInfo.firstName} ${patientData.personalInfo.lastName}`,
            phone: patientData.contactInfo.phone,
            isActive: true,
            emailVerified: false,
            createdBy: authUser._id,
          });

          await userAccount.save();

          // Link user account to patient
          patient.userId = userAccount._id;
          await patient.save();

          // TODO: Send welcome email with temporary password (implement email service)
          if (patientData.sendWelcomeEmail) {
            logger.info(`Welcome email should be sent to ${patientData.contactInfo.email} with temp password: ${tempPassword}`);
          }
        } catch (userError) {
          logger.warn('Failed to create user account for patient:', userError);
          // Continue without user account, don't fail patient creation
        }
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
            name: patient.personalInfo.fullName,
            email: patient.contactInfo.email,
            phone: patient.contactInfo.phone,
            gdprConsent: patient.gdprConsent.dataProcessing.consented,
            userAccountCreated: !!userAccount,
          },
        },
        security: {
          riskLevel: 'low',
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
          priority: 'medium',
        },
        timestamp: new Date(),
      });

      // Populate references before returning
      await patient.populate([
        { path: 'clinicalInfo.primaryProfessional', select: 'name specialties' },
        { path: 'clinicalInfo.assignedProfessionals', select: 'name specialties' },
        { path: 'userId', select: 'email lastLogin' }
      ]);

      res.status(201).json({
        success: true,
        message: 'Patient created successfully',
        data: { 
          patient,
          userAccount: userAccount ? {
            id: userAccount._id,
            email: userAccount.email,
            role: userAccount.role,
          } : null,
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
      const updateData = req.body;

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
        (authUser.role === 'professional' && (
          authUser.professionalId?.toString() === patient.clinicalInfo.primaryProfessional?.toString() ||
          patient.clinicalInfo.assignedProfessionals.some((profId: any) => 
            profId.toString() === authUser.professionalId?.toString()
          )
        ));

      if (!canUpdate) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot update this patient',
        });
      }

      // Store original data for audit log
      const originalData = patient.toObject();

      // Apply updates
      Object.assign(patient, updateData);
      patient.lastModifiedBy = authUser._id;

      // Recalculate computed fields if necessary
      if (updateData.personalInfo?.dateOfBirth || updateData.personalInfo?.firstName || updateData.personalInfo?.lastName) {
        patient.personalInfo.age = patient.calculateAge();
        patient.personalInfo.fullName = patient.getFullName();
      }

      await patient.save();

      // Log patient update
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
        changes: {
          before: originalData,
          after: patient.toObject(),
          fieldsChanged: Object.keys(updateData),
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
          priority: 'medium',
        },
        timestamp: new Date(),
      });

      // Populate and return updated patient
      await patient.populate([
        { path: 'clinicalInfo.primaryProfessional', select: 'name specialties' },
        { path: 'clinicalInfo.assignedProfessionals', select: 'name specialties' }
      ]);

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
   * Search patients with advanced filters
   */
  static async searchPatients(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user!;
      const { query, limit = '10' } = req.query;

      // Only admin, reception, and professionals can search patients
      if (!['admin', 'reception', 'professional'].includes(authUser.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot search patients',
        });
      }

      if (!query || query.toString().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'Search query must be at least 2 characters',
        });
      }

      const limitNum = Math.min(parseInt(limit.toString(), 10), 50); // Max 50 results

      // Use static method for search
      let searchResults = (Patient as any).searchPatients(query.toString(), limitNum);

      // Apply professional filter if needed
      if (authUser.role === 'professional') {
        searchResults = searchResults.where({
          $or: [
            { 'clinicalInfo.primaryProfessional': new Types.ObjectId(authUser.professionalId) },
            { 'clinicalInfo.assignedProfessionals': new Types.ObjectId(authUser.professionalId) },
          ],
        });
      }

      const patients = await searchResults
        .select('personalInfo contactInfo clinicalInfo.primaryProfessional status')
        .populate('clinicalInfo.primaryProfessional', 'name')
        .exec();

      res.status(200).json({
        success: true,
        data: { patients },
      });
    } catch (error) {
      logger.error('Search patients error:', error);
      next(error);
    }
  }

  /**
   * Add tag to patient
   */
  static async addPatientTag(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId } = req.params;
      const { name, category, color } = req.body;
      const authUser = (req as AuthRequest).user!;

      // Only admin, reception, and professionals can add tags
      if (!['admin', 'reception', 'professional'].includes(authUser.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot add tags to patients',
        });
      }

      const patient = await Patient.findById(patientId);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found',
        });
      }

      // Check permissions for professionals
      if (authUser.role === 'professional') {
        const canAccess = 
          authUser.professionalId?.toString() === patient.clinicalInfo.primaryProfessional?.toString() ||
          patient.clinicalInfo.assignedProfessionals.some((profId: any) => 
            profId.toString() === authUser.professionalId?.toString()
          );

        if (!canAccess) {
          return res.status(403).json({
            success: false,
            message: 'Access denied: Cannot add tags to this patient',
          });
        }
      }

      await patient.addTag(name, category, authUser._id);

      res.status(200).json({
        success: true,
        message: 'Tag added successfully',
        data: { patient },
      });
    } catch (error) {
      logger.error('Add patient tag error:', error);
      next(error);
    }
  }

  /**
   * Remove tag from patient
   */
  static async removePatientTag(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId, tagName } = req.params;
      const authUser = (req as AuthRequest).user!;

      // Only admin, reception, and professionals can remove tags
      if (!['admin', 'reception', 'professional'].includes(authUser.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot remove tags from patients',
        });
      }

      const patient = await Patient.findById(patientId);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found',
        });
      }

      // Check permissions for professionals
      if (authUser.role === 'professional') {
        const canAccess = 
          authUser.professionalId?.toString() === patient.clinicalInfo.primaryProfessional?.toString() ||
          patient.clinicalInfo.assignedProfessionals.some((profId: any) => 
            profId.toString() === authUser.professionalId?.toString()
          );

        if (!canAccess) {
          return res.status(403).json({
            success: false,
            message: 'Access denied: Cannot remove tags from this patient',
          });
        }
      }

      await patient.removeTag(tagName);

      res.status(200).json({
        success: true,
        message: 'Tag removed successfully',
        data: { patient },
      });
    } catch (error) {
      logger.error('Remove patient tag error:', error);
      next(error);
    }
  }

  /**
   * Export patient data (GDPR compliance)
   */
  static async exportPatientData(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId } = req.params;
      const authUser = (req as AuthRequest).user!;

      const patient = await Patient.findById(patientId);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found',
        });
      }

      // Check permissions - patient can export own data, admin/reception can export any
      const canExport = 
        authUser.role === 'admin' ||
        authUser.role === 'reception' ||
        (authUser.role === 'patient' && patient.userId?.toString() === authUser._id.toString());

      if (!canExport) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot export this patient data',
        });
      }

      // Export data and update GDPR logs
      const exportedData = await patient.exportData();

      // Log data export
      await AuditLog.create({
        action: 'patient_data_exported',
        entityType: 'patient',
        entityId: patient._id.toString(),
        actorId: authUser._id,
        actorType: 'user',
        actorEmail: authUser.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'success',
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
          gdprRequest: true,
        },
        timestamp: new Date(),
      });

      res.status(200).json({
        success: true,
        message: 'Patient data exported successfully',
        data: exportedData,
      });
    } catch (error) {
      logger.error('Export patient data error:', error);
      next(error);
    }
  }

  /**
   * Soft delete patient (GDPR compliance)
   */
  static async deletePatient(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId } = req.params;
      const authUser = (req as AuthRequest).user!;

      // Only admin can delete patients
      if (authUser.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Only administrators can delete patients',
        });
      }

      const patient = await Patient.findById(patientId);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found',
        });
      }

      // Check if patient has active appointments or unpaid invoices
      const [activeAppointments, unpaidInvoices] = await Promise.all([
        Appointment.countDocuments({
          patientId: patient._id,
          status: { $in: ['scheduled', 'confirmed'] },
          start: { $gte: new Date() },
        }),
        Invoice.countDocuments({
          patientId: patient._id,
          status: { $in: ['sent', 'viewed', 'partially_paid'] },
        }),
      ]);

      if (activeAppointments > 0 || unpaidInvoices > 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete patient with active appointments or unpaid invoices. Please resolve these first.',
        });
      }

      // Soft delete patient
      await patient.softDelete();

      // Deactivate user account if exists
      if (patient.userId) {
        await User.findByIdAndUpdate(patient.userId, {
          isActive: false,
          deletedAt: new Date(),
        });
      }

      // Log patient deletion
      await AuditLog.create({
        action: 'patient_deleted',
        entityType: 'patient',
        entityId: patient._id.toString(),
        actorId: authUser._id,
        actorType: 'user',
        actorEmail: authUser.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'success',
        changes: {
          deletedAt: { from: null, to: new Date() },
          name: patient.personalInfo.fullName,
          email: patient.contactInfo.email,
        },
        security: {
          riskLevel: 'high',
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
        message: 'Patient deleted successfully',
      });
    } catch (error) {
      logger.error('Delete patient error:', error);
      next(error);
    }
  }

  /**
   * Get patient statistics
   */
  static async getPatientStats(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user!;
      const { professionalId, startDate, endDate } = req.query;

      // Only admin, reception, and professionals can see stats
      if (!['admin', 'reception', 'professional'].includes(authUser.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Insufficient permissions',
        });
      }

      // Build filter for professional scope
      const matchFilter: any = { deletedAt: null };
      if (authUser.role === 'professional') {
        matchFilter.$or = [
          { 'clinicalInfo.primaryProfessional': new Types.ObjectId(authUser.professionalId) },
          { 'clinicalInfo.assignedProfessionals': new Types.ObjectId(authUser.professionalId) },
        ];
      } else if (professionalId) {
        matchFilter.$or = [
          { 'clinicalInfo.primaryProfessional': new Types.ObjectId(professionalId as string) },
          { 'clinicalInfo.assignedProfessionals': new Types.ObjectId(professionalId as string) },
        ];
      }

      // Add date filter if provided
      if (startDate || endDate) {
        matchFilter.createdAt = {};
        if (startDate) matchFilter.createdAt.$gte = new Date(startDate as string);
        if (endDate) matchFilter.createdAt.$lte = new Date(endDate as string);
      }

      const [
        totalPatients,
        patientsByStatus,
        patientsByAge,
        patientsByGender,
        patientsByLanguage,
        patientsByPaymentMethod,
        monthlyNewPatients,
      ] = await Promise.all([
        Patient.countDocuments(matchFilter),
        Patient.aggregate([
          { $match: matchFilter },
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ]),
        Patient.aggregate([
          { $match: matchFilter },
          { $bucket: {
            groupBy: '$personalInfo.age',
            boundaries: [0, 18, 35, 50, 65, 100],
            default: 'unknown',
            output: { count: { $sum: 1 } }
          }},
        ]),
        Patient.aggregate([
          { $match: matchFilter },
          { $group: { _id: '$personalInfo.gender', count: { $sum: 1 } } },
        ]),
        Patient.aggregate([
          { $match: matchFilter },
          { $group: { _id: '$preferences.language', count: { $sum: 1 } } },
        ]),
        Patient.aggregate([
          { $match: matchFilter },
          { $group: { _id: '$insurance.paymentMethod', count: { $sum: 1 } } },
        ]),
        Patient.aggregate([
          { $match: matchFilter },
          { $group: {
            _id: { 
              year: { $year: '$createdAt' }, 
              month: { $month: '$createdAt' } 
            },
            newPatients: { $sum: 1 },
          }},
          { $sort: { '_id.year': -1, '_id.month': -1 } },
          { $limit: 12 },
        ]),
      ]);

      const stats = {
        total: totalPatients,
        byStatus: patientsByStatus,
        byAgeGroup: patientsByAge,
        byGender: patientsByGender,
        byLanguage: patientsByLanguage,
        byPaymentMethod: patientsByPaymentMethod,
        monthlyTrend: monthlyNewPatients,
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
   * Fix fullName field for all patients (temporary endpoint)
   */
  static async fixPatientNames(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user!;
      
      // Only allow admin users to run this fix
      if (authUser.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Only admin users can run this operation',
        });
      }

      // Get all patients that need fullName update
      const patients = await Patient.find({ deletedAt: null });
      
      let updatedCount = 0;
      
      for (const patient of patients) {
        // Calculate the correct fullName
        const correctFullName = `${patient.personalInfo.firstName} ${patient.personalInfo.lastName}`.trim();
        
        // Update if different or missing
        if (patient.personalInfo.fullName !== correctFullName) {
          patient.personalInfo.fullName = correctFullName;
          patient.personalInfo.age = patient.calculateAge();
          await patient.save();
          updatedCount++;
        }
      }

      res.status(200).json({
        success: true,
        message: `Successfully updated ${updatedCount} patient records`,
        data: {
          totalPatients: patients.length,
          updatedPatients: updatedCount,
        },
      });
    } catch (error) {
      logger.error('Fix patient names error:', error);
      next(error);
    }
  }
}

export default PatientController;

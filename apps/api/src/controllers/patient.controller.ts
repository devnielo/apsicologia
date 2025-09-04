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
  
  // Payment Information
  payment?: {
    preferredMethod?: 'cash' | 'card' | 'transfer' | 'online';
    billingNotes?: string;
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
      thirdPartyProviders?: boolean;
      emergencyContacts?: boolean;
      researchPurposes?: boolean;
      consentDate?: string;
    };
  };
  
  // Referral Information
  referral?: {
    source?: 'self' | 'physician' | 'family' | 'friend' | 'online' | 'other';
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
  status?: string | string[];
  professionalId?: string;
  tags?: string | string[];
  ageMin?: string | number;
  ageMax?: string | number;
  gender?: string | string[];
  contact?: string; // For searching in phone and email
  language?: string;
  paymentMethod?: string | string[];
  dateFrom?: string; // ISO date
  dateTo?: string; // ISO date
  dateField?: string; // 'createdAt' | 'updatedAt'
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
        ageMin,
        ageMax,
        gender,
        contact,
        language,
        paymentMethod,
        dateFrom,
        dateTo,
        dateField,
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
      if (status) {
        // Handle both single status and array of statuses
        if (Array.isArray(status)) {
          filter.status = { $in: status };
        } else if (typeof status === 'string' && status.includes(',')) {
          filter.status = { $in: status.split(',') };
        } else {
          filter.status = status;
        }
      }
      
      if (professionalId && authUser.role !== 'professional') {
        filter.$or = [
          { 'clinicalInfo.primaryProfessional': new Types.ObjectId(professionalId) },
          { 'clinicalInfo.assignedProfessionals': new Types.ObjectId(professionalId) },
        ];
      }
      
      if (tags) {
        let tagArray: string[];
        if (Array.isArray(tags)) {
          tagArray = tags;
        } else {
          tagArray = tags.split(',');
        }
        filter.tags = { $in: tagArray };
      }
      
      // Age range filtering
      if (ageMin || ageMax) {
        const ageFilter: any = {};
        
        if (ageMin) {
          const minAge = parseInt(String(ageMin), 10);
          if (!isNaN(minAge)) {
            ageFilter.$gte = minAge;
          }
        }
        
        if (ageMax) {
          const maxAge = parseInt(String(ageMax), 10);
          if (!isNaN(maxAge)) {
            ageFilter.$lte = maxAge;
          }
        }
        
        if (Object.keys(ageFilter).length > 0) {
          filter['personalInfo.age'] = ageFilter;
        }
      }
      
      if (gender) {
        // Handle both single gender and array of genders
        if (Array.isArray(gender)) {
          filter['personalInfo.gender'] = { $in: gender };
        } else if (typeof gender === 'string' && gender.includes(',')) {
          filter['personalInfo.gender'] = { $in: gender.split(',') };
        } else {
          filter['personalInfo.gender'] = gender;
        }
      }
      
      if (contact) {
        // Search in phone and email fields
        const contactFilters = [
          { 'contactInfo.phone': { $regex: contact, $options: 'i' } },
          { 'contactInfo.email': { $regex: contact, $options: 'i' } }
        ];
        
        if (filter.$or) {
          filter.$and = [
            { $or: filter.$or },
            { $or: contactFilters }
          ];
          delete filter.$or;
        } else {
          filter.$or = contactFilters;
        }
      }
      
      if (language) filter['preferences.language'] = language;
      
      
      if (paymentMethod) {
        if (Array.isArray(paymentMethod)) {
          filter['payment.preferredMethod'] = { $in: paymentMethod };
        } else if (typeof paymentMethod === 'string' && paymentMethod.includes(',')) {
          filter['payment.preferredMethod'] = { $in: paymentMethod.split(',') };
        } else {
          filter['payment.preferredMethod'] = paymentMethod;
        }
      }
      
      // Support both createdAt and updatedAt date filtering
      if (dateFrom || dateTo) {
        const dateField = sortBy === 'updatedAt' || req.query.dateField === 'updatedAt' ? 'updatedAt' : 'createdAt';
        filter[dateField] = {};
        if (dateFrom) {
          const fromDate = new Date(dateFrom);
          if (!isNaN(fromDate.getTime())) {
            filter[dateField].$gte = fromDate;
          }
        }
        if (dateTo) {
          const toDate = new Date(dateTo);
          if (!isNaN(toDate.getTime())) {
            // Add end of day to include the entire date
            toDate.setHours(23, 59, 59, 999);
            filter[dateField].$lte = toDate;
          }
        }
      }

      // Text search across multiple fields
      if (search) {
        const searchFilters = [
          { 'personalInfo.fullName': { $regex: search, $options: 'i' } },
          { 'personalInfo.firstName': { $regex: search, $options: 'i' } },
          { 'personalInfo.lastName': { $regex: search, $options: 'i' } },
          { 'contactInfo.email': { $regex: search, $options: 'i' } },
          { 'contactInfo.phone': { $regex: search, $options: 'i' } },
          { 'personalInfo.idNumber': { $regex: search, $options: 'i' } },
        ];
        
        if (filter.$or) {
          filter.$and = [
            { $or: filter.$or },
            { $or: searchFilters }
          ];
          delete filter.$or;
        } else if (filter.$and) {
          filter.$and.push({ $or: searchFilters });
        } else {
          filter.$or = searchFilters;
        }
      }

      // Build query
      let query = Patient.find(filter)
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip(skip)
        .limit(limitNum)
        .populate('clinicalInfo.primaryProfessional', 'name specialties licenseNumber')
        .populate('clinicalInfo.assignedProfessionals', 'name specialties');

      // Add additional population based on include parameter
      if (include) {
        const includeFields = include.split(',');
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
            total,
            page: pageNum,
            limit: limitNum,
            totalPages,
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
        payment: patientData.payment || {
          preferredMethod: 'cash',
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
            thirdPartyProviders: patientData.gdprConsent.dataSharing?.thirdPartyProviders ?? false,
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
        changes: [
          {
            field: 'patient_record',
            changeType: 'create',
            newValue: {
              name: patient.personalInfo.fullName,
              email: patient.contactInfo.email,
              phone: patient.contactInfo.phone,
              gdprConsent: patient.gdprConsent.dataProcessing.consented,
              userAccountCreated: !!userAccount,
            },
          },
        ],
        afterState: patient.toObject(),
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
          customFields: {},
          tags: ['patient_creation'],
          priority: 'medium',
          source: 'patient_controller',
        },
        alerting: {
          triggeredRules: [],
          notificationStatus: {
            email: false,
            sms: false,
            slack: false,
            webhook: false,
            dashboard: false,
          },
        },
        retention: {
          category: 'patient_records',
          retentionPeriod: 84,
        },
        related: {
          childLogIds: [],
          correlatedLogs: [],
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

      // Find the patient to check permissions first
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

      // Use findByIdAndUpdate with $set to update only the provided fields
      // This prevents validation errors for fields not included in the update payload
      const updatedPatient = await Patient.findByIdAndUpdate(
        patientId,
        { $set: updateData },
        { new: true, runValidators: true, context: 'query' }
      );

      if (!updatedPatient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found after update (should not happen if found initially)',
        });
      }

      logger.info('AuditLog data before creation:', {
        action: 'patient_updated',
        entityType: 'patient',
        entityId: updatedPatient._id.toString(),
        actorId: authUser._id,
        actorType: 'user',
        actorEmail: authUser.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'success',
        changes: [
          {
            field: 'patient_record',
            changeType: 'update',
            oldValue: patient.toObject(),
            newValue: updatedPatient.toObject(),
          },
        ],
        afterState: updatedPatient.toObject(),
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
          customFields: {},
          tags: ['patient_update'],
          priority: 'medium',
          source: 'patient_controller',
        },
        alerting: {
          triggeredRules: [],
          notificationStatus: {
            email: false,
            sms: false,
            slack: false,
            webhook: false,
            dashboard: false,
          },
        },
        retention: {
          category: 'patient_records',
          retentionPeriod: 84,
        },
        related: {
          childLogIds: [],
          correlatedLogs: [],
        },
        timestamp: new Date(),
      });

      // Log patient update
      await AuditLog.create({
        action: 'patient_updated',
        entityType: 'patient',
        entityId: updatedPatient._id.toString(),
        actorId: authUser._id,
        actorType: 'user',
        actorEmail: authUser.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'success',
        changes: [
          {
            field: 'patient_record',
            changeType: 'update',
            oldValue: patient.toObject(),
            newValue: updatedPatient.toObject(),
          },
        ],
        afterState: updatedPatient.toObject(),
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
          customFields: {},
          tags: ['patient_update'],
          priority: 'medium',
          source: 'patient_controller',
        },
        alerting: {
          triggeredRules: [],
          notificationStatus: {
            email: false,
            sms: false,
            slack: false,
            webhook: false,
            dashboard: false,
          },
        },
        retention: {
          category: 'patient_records',
          retentionPeriod: 84,
        },
        related: {
          childLogIds: [],
          correlatedLogs: [],
        },
        timestamp: new Date(),
      });

      res.status(200).json({
        success: true,
        message: 'Patient updated successfully',
        data: { patient: updatedPatient },
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
        .select('personalInfo contactInfo clinicalInfo.primaryProfessional clinicalInfo.assignedProfessionals status')
        .populate('clinicalInfo.primaryProfessional', 'name')
        .populate('clinicalInfo.assignedProfessionals', 'name')
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
          patient.clinicalInfo.assignedProfessionals.some((profId: any) => 
            profId.toString() === authUser.professionalId?.toString()
          );

        if (!canAccess) {
          return res.status(403).json({
            success: false,
            message: 'Access denied: Cannot view this patient\'s statistics',
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
          patient.clinicalInfo.assignedProfessionals.some((profId: any) => 
            profId.toString() === authUser.professionalId?.toString()
          );

        if (!canAccess) {
          return res.status(403).json({
            success: false,
            message: 'Access denied: Cannot remove this patient\'s tag',
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
        changes: [
          {
            field: 'deletedAt',
            oldValue: null,
            newValue: new Date(),
            changeType: 'update',
          },
          {
            field: 'name',
            oldValue: patient.personalInfo.fullName,
            newValue: null,
            changeType: 'delete',
          },
          {
            field: 'email',
            oldValue: patient.contactInfo.email,
            newValue: null,
            changeType: 'delete',
          },
        ],
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
          { $group: { _id: '$payment.preferredMethod', count: { $sum: 1 } } },
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

  /**
   * Add a new session to patient's current treatment
   */
  static async addSession(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId } = req.params;
      const authUser = (req as AuthRequest).user!;
      const sessionData = req.body;

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
        (authUser.role === 'professional' && (
          authUser.professionalId?.toString() === patient.clinicalInfo.primaryProfessional?.toString() ||
          patient.clinicalInfo.assignedProfessionals.some((profId: any) => 
            profId.toString() === authUser.professionalId?.toString()
          )
        ));

      if (!canUpdate) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot add sessions to this patient',
        });
      }

      // Generate unique session ID
      const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const newSession = {
        sessionId,
        date: new Date(sessionData.date),
        duration: sessionData.duration,
        type: sessionData.type || 'individual',
        status: sessionData.status || 'completed',
        professionalId: authUser.professionalId || authUser._id,
        notes: sessionData.notes || '',
        objectives: sessionData.objectives || [],
        homework: sessionData.homework || '',
        nextSessionPlan: sessionData.nextSessionPlan || '',
        mood: sessionData.mood || {},
        progress: sessionData.progress || {},
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Initialize sessions array if it doesn't exist
      if (!patient.clinicalInfo.currentTreatment.sessions) {
        patient.clinicalInfo.currentTreatment.sessions = [];
      }

      patient.clinicalInfo.currentTreatment.sessions.push(newSession);
      await patient.save();

      res.status(201).json({
        success: true,
        message: 'Session added successfully',
        data: { session: newSession },
      });
    } catch (error) {
      logger.error('Add session error:', error);
      next(error);
    }
  }

  /**
   * Update an existing session
   */
  static async updateSession(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId, sessionId } = req.params;
      const authUser = (req as AuthRequest).user!;
      const updateData = req.body;

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
        (authUser.role === 'professional' && (
          authUser.professionalId?.toString() === patient.clinicalInfo.primaryProfessional?.toString() ||
          patient.clinicalInfo.assignedProfessionals.some((profId: any) => 
            profId.toString() === authUser.professionalId?.toString()
          )
        ));

      if (!canUpdate) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot update sessions for this patient',
        });
      }

      // Ensure sessions array exists
      if (!patient.clinicalInfo.currentTreatment.sessions) {
        patient.clinicalInfo.currentTreatment.sessions = [];
      }

      // Find and update the session
      const sessionIndex = patient.clinicalInfo.currentTreatment.sessions.findIndex(
        session => session.sessionId === sessionId
      );

      if (sessionIndex === -1 || sessionIndex === undefined) {
        return res.status(404).json({
          success: false,
          message: 'Session not found',
        });
      }

      // Ensure sessions array exists
      if (!patient.clinicalInfo.currentTreatment.sessions) {
        patient.clinicalInfo.currentTreatment.sessions = [];
      }

      // Update session data
      const updatedSession = {
        ...patient.clinicalInfo.currentTreatment.sessions[sessionIndex],
        ...updateData,
        updatedAt: new Date(),
      };

      patient.clinicalInfo.currentTreatment.sessions[sessionIndex] = updatedSession;
      await patient.save();

      res.status(200).json({
        success: true,
        message: 'Session updated successfully',
        data: { session: updatedSession },
      });
    } catch (error) {
      logger.error('Update session error:', error);
      next(error);
    }
  }

  /**
   * Get sessions for a patient
   */
  static async getSessions(req: Request, res: Response, next: NextFunction) {
    try {
      const { patientId } = req.params;
      const authUser = (req as AuthRequest).user!;
      const { limit = '10', offset = '0' } = req.query;

      const patient = await Patient.findById(patientId)
        .populate('clinicalInfo.currentTreatment.sessions.professionalId', 'name specialties');

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
        ));

      if (!canView) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot view sessions for this patient',
        });
      }

      const sessions = patient.clinicalInfo.currentTreatment.sessions || [];
      const sortedSessions = sessions
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(parseInt(offset.toString()), parseInt(offset.toString()) + parseInt(limit.toString()));

      res.status(200).json({
        success: true,
        data: {
          sessions: sortedSessions,
          total: sessions.length,
        },
      });
    } catch (error) {
      logger.error('Get sessions error:', error);
      next(error);
    }
  }
}

export default PatientController;

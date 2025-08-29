import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { FormSchema } from '../models/FormSchema.js';
import { FormResponse } from '../models/FormResponse.js';
import { Patient } from '../models/Patient.js';
import { AuditLog } from '../models/AuditLog.js';
import logger from '../config/logger.js';
import { AuthRequest } from '../middleware/auth.js';

export class FormController {
  /**
   * Create form schema
   */
  static async createFormSchema(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user!;
      const formData = req.body;

      // Only admin and professionals can create forms
      if (authUser.role !== 'admin' && authUser.role !== 'professional') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot create forms',
        });
      }

      const formSchema = new FormSchema({
        ...formData,
        createdBy: authUser._id,
        lastModifiedBy: authUser._id,
      });

      await formSchema.save();

      // Log form creation
      await AuditLog.create({
        action: 'form_created',
        entityType: 'form_schema',
        entityId: formSchema._id.toString(),
        actorId: authUser._id,
        actorType: 'user',
        actorEmail: authUser.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'success',
        changes: [
          {
            field: 'title',
            newValue: formSchema.title,
            changeType: 'create',
          },
          {
            field: 'category',
            newValue: formSchema.metadata.category,
            changeType: 'create',
          },
          {
            field: 'isActive',
            newValue: formSchema.config.isActive,
            changeType: 'create',
          },
        ],
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
          containsPHI: false,
          dataClassification: 'internal',
        },
        metadata: {
          source: 'form_controller',
          priority: 'medium',
        },
        timestamp: new Date(),
      });

      res.status(201).json({
        success: true,
        message: 'Form schema created successfully',
        data: { form: formSchema },
      });
    } catch (error) {
      logger.error('Create form schema error:', error);
      next(error);
    }
  }

  /**
   * Get all form schemas
   */
  static async getFormSchemas(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user!;
      const {
        page = '1',
        limit = '20',
        category,
        isActive,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search,
      } = req.query;

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      // Build filter
      const filter: any = { deletedAt: null };

      if (category) {
        filter.category = category;
      }

      if (isActive !== undefined) {
        filter.isActive = isActive === 'true';
      }

      if (search) {
        filter.$or = [
          { title: new RegExp(search as string, 'i') },
          { description: new RegExp(search as string, 'i') },
          { tags: { $in: [new RegExp(search as string, 'i')] } },
        ];
      }

      // Patient users can only see active forms
      if (authUser.role === 'patient') {
        filter.isActive = true;
        filter.isPublic = true;
      }

      // Build sort
      const sort: any = {};
      sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

      const [forms, total] = await Promise.all([
        FormSchema.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limitNum)
          .populate('createdBy', 'name email')
          .populate('lastModifiedBy', 'name email')
          .exec(),
        FormSchema.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / limitNum);

      res.status(200).json({
        success: true,
        data: {
          forms,
          pagination: {
            currentPage: pageNum,
            totalPages,
            totalForms: total,
            hasNext: pageNum < totalPages,
            hasPrev: pageNum > 1,
          },
        },
      });
    } catch (error) {
      logger.error('Get form schemas error:', error);
      next(error);
    }
  }

  /**
   * Get form schema by ID
   */
  static async getFormSchemaById(req: Request, res: Response, next: NextFunction) {
    try {
      const { formId } = req.params;
      const authUser = (req as AuthRequest).user!;

      const form = await FormSchema.findOne({ _id: formId, deletedAt: null })
        .populate('createdBy', 'name email')
        .populate('lastModifiedBy', 'name email')
        .exec();

      if (!form) {
        return res.status(404).json({
          success: false,
          message: 'Form not found',
        });
      }

      // Check access - patients can only see active public forms
      if (authUser.role === 'patient' && (!form.config.isActive || !form.permissions.canView.includes('patient'))) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Form not available',
        });
      }

      res.status(200).json({
        success: true,
        data: { form },
      });
    } catch (error) {
      logger.error('Get form schema by ID error:', error);
      next(error);
    }
  }

  /**
   * Update form schema
   */
  static async updateFormSchema(req: Request, res: Response, next: NextFunction) {
    try {
      const { formId } = req.params;
      const authUser = (req as AuthRequest).user!;
      const updateData = req.body;

      // Only admin and professionals can update forms
      if (authUser.role !== 'admin' && authUser.role !== 'professional') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot update forms',
        });
      }

      const form = await FormSchema.findOne({ _id: formId, deletedAt: null });
      if (!form) {
        return res.status(404).json({
          success: false,
          message: 'Form not found',
        });
      }

      // Store original data for audit
      const originalData = form.toObject();

      // Update form
      Object.assign(form, updateData, {
        lastModifiedBy: authUser._id,
        lastModifiedAt: new Date(),
        version: form.version + 1,
      });

      await form.save();

      // Log form update
      await AuditLog.create({
        action: 'form_updated',
        entityType: 'form_schema',
        entityId: form._id.toString(),
        actorId: authUser._id,
        actorType: 'user',
        actorEmail: authUser.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'success',
        changes: Object.keys(updateData).map(field => ({
          field,
          oldValue: originalData[field],
          newValue: form.get(field),
          changeType: 'update',
        })),
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
          source: 'form_controller',
          priority: 'medium',
        },
        timestamp: new Date(),
      });

      res.status(200).json({
        success: true,
        message: 'Form schema updated successfully',
        data: { form },
      });
    } catch (error) {
      logger.error('Update form schema error:', error);
      next(error);
    }
  }

  /**
   * Delete form schema (soft delete)
   */
  static async deleteFormSchema(req: Request, res: Response, next: NextFunction) {
    try {
      const { formId } = req.params;
      const authUser = (req as AuthRequest).user!;

      // Only admin can delete forms
      if (authUser.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot delete forms',
        });
      }

      const form = await FormSchema.findOne({ _id: formId, deletedAt: null });
      if (!form) {
        return res.status(404).json({
          success: false,
          message: 'Form not found',
        });
      }

      // Soft delete
      form.deletedAt = new Date();
      form.config.isActive = false;
      await form.save();

      // Log form deletion
      await AuditLog.create({
        action: 'form_deleted',
        entityType: 'form_schema',
        entityId: form._id.toString(),
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
             field: 'title',
             oldValue: form.title,
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
          containsPHI: false,
          dataClassification: 'internal',
        },
        metadata: {
          source: 'form_controller',
          priority: 'high',
        },
        timestamp: new Date(),
      });

      res.status(200).json({
        success: true,
        message: 'Form schema deleted successfully',
      });
    } catch (error) {
      logger.error('Delete form schema error:', error);
      next(error);
    }
  }

  /**
   * Submit form response
   */
  static async submitFormResponse(req: Request, res: Response, next: NextFunction) {
    try {
      const { formId } = req.params;
      const authUser = (req as AuthRequest).user!;
      const responseData = req.body;

      const form = await FormSchema.findOne({ _id: formId, deletedAt: null, 'config.isActive': true });
      if (!form) {
        return res.status(404).json({
          success: false,
          message: 'Form not found or inactive',
        });
      }

      // Find patient if user is patient role
      let patientId = responseData.patientId;
      if (authUser.role === 'patient') {
        const patient = await Patient.findOne({ 'contactInfo.email': authUser.email });
        if (!patient) {
          return res.status(404).json({
            success: false,
            message: 'Patient profile not found',
          });
        }
        patientId = patient._id;
      }

      // Create form response
      const formResponse = new FormResponse({
        formSchemaId: form._id,
        patientId: patientId ? new Types.ObjectId(patientId) : undefined,
        appointmentId: responseData.appointmentId ? new Types.ObjectId(responseData.appointmentId) : undefined,
        submittedBy: authUser._id,
        responses: responseData.responses,
        metadata: {
          userAgent: req.get('User-Agent'),
          ipAddress: req.ip,
          submissionSource: 'api',
          formVersion: form.version,
        },
        status: 'completed',
      });

      await formResponse.save();

      // Update form statistics
      form.analytics.totalSubmissions = (form.analytics.totalSubmissions || 0) + 1;
      form.analytics.lastSubmissionAt = new Date();
      await form.save();

      // Log form response submission
      await AuditLog.create({
        action: 'form_response_submitted',
        entityType: 'form_response',
        entityId: formResponse._id.toString(),
        actorId: authUser._id,
        actorType: 'user',
        actorEmail: authUser.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'success',
        changes: [
          {
            field: 'formSchemaId',
            newValue: form._id,
            changeType: 'create',
          },
          {
            field: 'patientId',
            newValue: formResponse.patientId,
            changeType: 'create',
          },
          {
            field: 'submittedAt',
            newValue: formResponse.submittedAt,
            changeType: 'create',
          },
        ],
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
          containsPHI: patientId ? true : false,
          dataClassification: patientId ? 'confidential' : 'internal',
        },
        metadata: {
          source: 'form_controller',
          priority: 'medium',
          formTitle: form.title,
        },
        timestamp: new Date(),
      });

      res.status(201).json({
        success: true,
        message: 'Form response submitted successfully',
        data: { response: formResponse },
      });
    } catch (error) {
      logger.error('Submit form response error:', error);
      next(error);
    }
  }

  /**
   * Get form responses
   */
  static async getFormResponses(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user!;
      const {
        formId,
        patientId,
        appointmentId,
        page = '1',
        limit = '20',
        sortBy = 'submittedAt',
        sortOrder = 'desc',
      } = req.query;

      // Only admin, reception, and professionals can view responses
      if (authUser.role === 'patient') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot view form responses',
        });
      }

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      // Build filter
      const filter: any = { deletedAt: null };

      if (formId) {
        filter.formSchemaId = new Types.ObjectId(formId as string);
      }

      if (patientId) {
        filter.patientId = new Types.ObjectId(patientId as string);
      }

      if (appointmentId) {
        filter.appointmentId = new Types.ObjectId(appointmentId as string);
      }

      // Professional can only see responses for their patients
      if (authUser.role === 'professional') {
        const professionalPatients = await Patient.find({
          'clinicalInfo.assignedProfessionals': authUser.professionalId,
          deletedAt: null,
        }).select('_id');
        
        const patientIds = professionalPatients.map(p => p._id);
        filter.patientId = { $in: patientIds };
      }

      // Build sort
      const sort: any = {};
      sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

      const [responses, total] = await Promise.all([
        FormResponse.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limitNum)
          .populate('formSchemaId', 'title category')
          .populate('patientId', 'personalInfo.fullName')
          .populate('appointmentId', 'start')
          .populate('submittedBy', 'name email')
          .exec(),
        FormResponse.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / limitNum);

      res.status(200).json({
        success: true,
        data: {
          responses,
          pagination: {
            currentPage: pageNum,
            totalPages,
            totalResponses: total,
            hasNext: pageNum < totalPages,
            hasPrev: pageNum > 1,
          },
        },
      });
    } catch (error) {
      logger.error('Get form responses error:', error);
      next(error);
    }
  }

  /**
   * Get form response by ID
   */
  static async getFormResponseById(req: Request, res: Response, next: NextFunction) {
    try {
      const { responseId } = req.params;
      const authUser = (req as AuthRequest).user!;

      // Only admin, reception, and professionals can view responses
      if (authUser.role === 'patient') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot view form responses',
        });
      }

      const response = await FormResponse.findOne({ _id: responseId, deletedAt: null })
        .populate('formSchemaId', 'title category jsonSchema uiSchema')
        .populate('patientId', 'personalInfo.fullName contactInfo.email')
        .populate('appointmentId', 'start end')
        .populate('submittedBy', 'name email')
        .exec();

      if (!response) {
        return res.status(404).json({
          success: false,
          message: 'Form response not found',
        });
      }

      // Professional can only see responses for their patients
      if (authUser.role === 'professional' && response.patientId) {
        const patient = await Patient.findById(response.patientId);
        if (!patient || !patient.clinicalInfo.assignedProfessionals?.includes(authUser.professionalId!)) {
          return res.status(403).json({
            success: false,
            message: 'Access denied: Cannot view this form response',
          });
        }
      }

      res.status(200).json({
        success: true,
        data: { response },
      });
    } catch (error) {
      logger.error('Get form response by ID error:', error);
      next(error);
    }
  }

  /**
   * Get form statistics
   */
  static async getFormStats(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user!;

      // Only admin and reception can view form statistics
      if (authUser.role !== 'admin' && authUser.role !== 'reception') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot view form statistics',
        });
      }

      const [
        totalForms,
        activeForms,
        totalResponses,
        formStats,
        categoryStats,
        recentResponses,
      ] = await Promise.all([
        FormSchema.countDocuments({ deletedAt: null }),
        FormSchema.countDocuments({ deletedAt: null, isActive: true }),
        FormResponse.countDocuments({ deletedAt: null }),
        
        FormSchema.aggregate([
          { $match: { deletedAt: null } },
          { $lookup: {
            from: 'formresponses',
            localField: '_id',
            foreignField: 'formSchemaId',
            as: 'responses',
          }},
          { $project: {
            title: 1,
            isActive: 1,
            responseCount: { $size: '$responses' },
            lastResponseAt: 1,
          }},
          { $sort: { responseCount: -1 } },
          { $limit: 10 },
        ]),

        FormSchema.aggregate([
          { $match: { deletedAt: null } },
          { $group: {
            _id: '$category',
            count: { $sum: 1 },
            activeCount: {
              $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] },
            },
          }},
          { $sort: { count: -1 } },
        ]),

        FormResponse.find({ deletedAt: null })
          .sort({ submittedAt: -1 })
          .limit(10)
          .populate('formSchemaId', 'title')
          .populate('patientId', 'personalInfo.fullName')
          .select('submittedAt status'),
      ]);

      res.status(200).json({
        success: true,
        data: {
          overview: {
            totalForms,
            activeForms,
            totalResponses,
            averageResponsesPerForm: totalForms > 0 ? totalResponses / totalForms : 0,
          },
          topForms: formStats,
          byCategory: categoryStats,
          recentResponses,
        },
      });
    } catch (error) {
      logger.error('Get form stats error:', error);
      next(error);
    }
  }
}

export default FormController;

import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Note } from '../models/Note.js';
import { Patient } from '../models/Patient.js';
import { Appointment } from '../models/Appointment.js';
import { AuditLog } from '../models/AuditLog.js';
import logger from '../config/logger.js';
import { AuthRequest } from '../middleware/auth.js';

export class NoteController {
  /**
   * Create clinical note
   */
  static async createNote(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user!;
      const noteData = req.body;

      // Only admin, reception, and professionals can create notes
      if (authUser.role === 'patient') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot create clinical notes',
        });
      }

      // Verify patient exists and user has access
      if (noteData.patientId) {
        const patient = await Patient.findById(noteData.patientId);
        if (!patient || patient.deletedAt) {
          return res.status(404).json({
            success: false,
            message: 'Patient not found',
          });
        }

        // Professional can only create notes for their assigned patients
        if (authUser.role === 'professional') {
        const hasAccess = (patient.clinicalInfo.assignedProfessionals?.includes(authUser.professionalId!) ?? false) ||
                         (patient.clinicalInfo.primaryProfessional?.equals(authUser.professionalId!) ?? false);
          
          if (!hasAccess) {
            return res.status(403).json({
              success: false,
              message: 'Access denied: Cannot create notes for this patient',
            });
          }
        }
      }

      // Verify appointment exists if specified
      if (noteData.appointmentId) {
        const appointment = await Appointment.findById(noteData.appointmentId);
        if (!appointment || appointment.deletedAt) {
          return res.status(404).json({
            success: false,
            message: 'Appointment not found',
          });
        }
      }

      const note = new Note({
        ...noteData,
        professionalId: authUser.professionalId || authUser._id,
        status: noteData.status || 'draft',
      });

      // Add audit log entry
      note.auditLog.push({
        action: 'note_created',
        performedBy: authUser._id,
        performedAt: new Date(),
        details: 'Note created',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
      });

      await note.save();

      // Populate references
      await note.populate([
        { path: 'patientId', select: 'personalInfo.fullName' },
        { path: 'appointmentId', select: 'start end serviceId' },
        { path: 'createdBy', select: 'name email' },
      ]);

      // Log note creation
      await AuditLog.create({
        action: 'note_created',
        entityType: 'note',
        entityId: note._id.toString(),
        actorId: authUser._id,
        actorType: 'user',
        actorEmail: authUser.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'success',
        changes: {
          created: {
            type: note.type,
            category: note.category,
            patientId: note.patientId,
            appointmentId: note.appointmentId,
            status: note.status,
          },
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
          source: 'note_controller',
          priority: 'high',
        },
        timestamp: new Date(),
      });

      res.status(201).json({
        success: true,
        message: 'Clinical note created successfully',
        data: { note },
      });
    } catch (error) {
      logger.error('Create note error:', error);
      next(error);
    }
  }

  /**
   * Get notes with pagination and filtering
   */
  static async getNotes(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user!;
      const {
        page = '1',
        limit = '20',
        patientId,
        appointmentId,
        type,
        category,
        status,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        search,
        startDate,
        endDate,
      } = req.query;

      // Patients cannot access notes
      if (authUser.role === 'patient') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot view clinical notes',
        });
      }

      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const skip = (pageNum - 1) * limitNum;

      // Build filter
      const filter: any = { deletedAt: null };

      if (patientId) {
        filter.patientId = new Types.ObjectId(patientId as string);
      }

      if (appointmentId) {
        filter.appointmentId = new Types.ObjectId(appointmentId as string);
      }

      if (type) {
        filter.type = type;
      }

      if (category) {
        filter.category = category;
      }

      if (status) {
        filter.status = status;
      }

      if (search) {
        filter.$or = [
          { title: new RegExp(search as string, 'i') },
          { 'content.text': new RegExp(search as string, 'i') },
          { tags: { $in: [new RegExp(search as string, 'i')] } },
        ];
      }

      if (startDate || endDate) {
        filter.createdAt = {};
        if (startDate) {
          filter.createdAt.$gte = new Date(startDate as string);
        }
        if (endDate) {
          filter.createdAt.$lte = new Date(endDate as string);
        }
      }

      // Professional can only see notes for their patients
      if (authUser.role === 'professional') {
        const professionalPatients = await Patient.find({
          $or: [
            { 'clinicalInfo.primaryProfessional': authUser.professionalId },
            { 'clinicalInfo.assignedProfessionals': authUser.professionalId },
          ],
          deletedAt: null,
        }).select('_id');
        
        const patientIds = professionalPatients.map(p => p._id);
        filter.patientId = { $in: patientIds };
      }

      // Build sort
      const sort: any = {};
      sort[sortBy as string] = sortOrder === 'asc' ? 1 : -1;

      const [notes, total] = await Promise.all([
        Note.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limitNum)
          .populate('patientId', 'personalInfo.fullName')
          .populate('appointmentId', 'start end serviceId')
          .populate('createdBy', 'name email')
          .populate('lastModifiedBy', 'name email')
          .select('-content.delta') // Exclude large delta content for list view
          .exec(),
        Note.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / limitNum);

      res.status(200).json({
        success: true,
        data: {
          notes,
          pagination: {
            currentPage: pageNum,
            totalPages,
            totalNotes: total,
            hasNext: pageNum < totalPages,
            hasPrev: pageNum > 1,
          },
        },
      });
    } catch (error) {
      logger.error('Get notes error:', error);
      next(error);
    }
  }

  /**
   * Get note by ID
   */
  static async getNoteById(req: Request, res: Response, next: NextFunction) {
    try {
      const { noteId } = req.params;
      const authUser = (req as AuthRequest).user!;

      // Patients cannot access notes
      if (authUser.role === 'patient') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot view clinical notes',
        });
      }

      const note = await Note.findOne({ _id: noteId, deletedAt: null })
        .populate('patientId', 'personalInfo.fullName contactInfo.email')
        .populate('appointmentId', 'start end serviceId')
        .populate('createdBy', 'name email')
        .populate('lastModifiedBy', 'name email')
        .exec();

      if (!note) {
        return res.status(404).json({
          success: false,
          message: 'Note not found',
        });
      }

      // Professional can only see notes for their patients
      if (authUser.role === 'professional' && note.patientId) {
        const patient = await Patient.findById(note.patientId);
        if (!patient) {
          return res.status(404).json({
            success: false,
            message: 'Associated patient not found',
          });
        }

        const hasAccess = (patient.clinicalInfo.assignedProfessionals?.includes(authUser.professionalId!) ?? false) ||
                         (patient.clinicalInfo.primaryProfessional?.equals(authUser.professionalId!) ?? false);
        
        if (!hasAccess) {
          return res.status(403).json({
            success: false,
            message: 'Access denied: Cannot view this note',
          });
        }
      }

      res.status(200).json({
        success: true,
        data: { note },
      });
    } catch (error) {
      logger.error('Get note by ID error:', error);
      next(error);
    }
  }

  /**
   * Update note
   */
  static async updateNote(req: Request, res: Response, next: NextFunction) {
    try {
      const { noteId } = req.params;
      const authUser = (req as AuthRequest).user!;
      const updateData = req.body;

      // Patients cannot update notes
      if (authUser.role === 'patient') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot update clinical notes',
        });
      }

      const note = await Note.findOne({ _id: noteId, deletedAt: null });
      if (!note) {
        return res.status(404).json({
          success: false,
          message: 'Note not found',
        });
      }

      // Check if note is locked/signed
      if (note.status === 'locked' || note.status === 'signed') {
        return res.status(403).json({
          success: false,
          message: 'Cannot update: Note is locked or signed',
        });
      }

      // Professional can only update notes for their patients or their own notes
      if (authUser.role === 'professional') {
        const isOwner = note.professionalId.equals(authUser.professionalId!);
        let hasPatientAccess = false;

        if (note.patientId && !isOwner) {
          const patient = await Patient.findById(note.patientId);
          if (patient) {
            hasPatientAccess = patient.clinicalInfo.assignedProfessionals?.includes(authUser.professionalId!) ||
                             patient.clinicalInfo.primaryProfessional?.equals(authUser.professionalId!);
          }
        }

        if (!isOwner && !hasPatientAccess) {
          return res.status(403).json({
            success: false,
            message: 'Access denied: Cannot update this note',
          });
        }
      }

      // Store original data for audit
      const originalData = note.toObject();

      // Create version backup if content changed significantly
      if (updateData.content && JSON.stringify(updateData.content) !== JSON.stringify(note.content)) {
        // Use the versioning system from the model
        const amendmentId = `AMD-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        note.versioning.amendments.push({
          amendmentId,
          amendedAt: new Date(),
          amendedBy: authUser._id,
          reason: updateData.changeReason || 'Content updated',
          description: 'Note content updated',
          originalContent: note.content,
          amendedContent: updateData.content,
        });
        
        note.versioning.version += 1;
      }

      // Update note
      Object.assign(note, updateData);

      // Add audit log entry
      note.auditLog.push({
        action: 'note_updated',
        performedBy: authUser._id,
        performedAt: new Date(),
        details: 'Note updated',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        fieldChanges: Object.keys(updateData).map(field => ({
          field,
          oldValue: (originalData as any)[field],
          newValue: updateData[field],
        })),
      });

      await note.save();

      // Populate references
      await note.populate([
        { path: 'patientId', select: 'personalInfo.fullName' },
        { path: 'appointmentId', select: 'start end serviceId' },
        { path: 'createdBy', select: 'name email' },
        { path: 'lastModifiedBy', select: 'name email' },
      ]);

      // Log note update
      await AuditLog.create({
        action: 'note_updated',
        entityType: 'note',
        entityId: note._id.toString(),
        actorId: authUser._id,
        actorType: 'user',
        actorEmail: authUser.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'success',
        changes: {
          before: originalData,
          after: note.toObject(),
          fieldsChanged: Object.keys(updateData),
          versionCreated: updateData.content ? true : false,
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
          source: 'note_controller',
          priority: 'high',
        },
        timestamp: new Date(),
      });

      res.status(200).json({
        success: true,
        message: 'Note updated successfully',
        data: { note },
      });
    } catch (error) {
      logger.error('Update note error:', error);
      next(error);
    }
  }

  /**
   * Delete note (soft delete)
   */
  static async deleteNote(req: Request, res: Response, next: NextFunction) {
    try {
      const { noteId } = req.params;
      const authUser = (req as AuthRequest).user!;

      // Only admin can delete notes
      if (authUser.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Only administrators can delete notes',
        });
      }

      const note = await Note.findOne({ _id: noteId, deletedAt: null });
      if (!note) {
        return res.status(404).json({
          success: false,
          message: 'Note not found',
        });
      }

      // Check if note is locked/signed (extra protection)
      if (note.status === 'locked' || note.status === 'signed') {
        return res.status(403).json({
          success: false,
          message: 'Cannot delete: Note is locked or signed',
        });
      }

      // Soft delete
      note.deletedAt = new Date();
      await note.save();

      // Log note deletion
      await AuditLog.create({
        action: 'note_deleted',
        entityType: 'note',
        entityId: note._id.toString(),
        actorId: authUser._id,
        actorType: 'user',
        actorEmail: authUser.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'success',
        changes: {
          deletedAt: new Date(),
          title: note.title,
          type: note.type,
          patientId: note.patientId,
        },
        security: {
          riskLevel: 'critical',
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
          source: 'note_controller',
          priority: 'critical',
        },
        timestamp: new Date(),
      });

      res.status(200).json({
        success: true,
        message: 'Note deleted successfully',
      });
    } catch (error) {
      logger.error('Delete note error:', error);
      next(error);
    }
  }

  /**
   * Sign note (using model method)
   */
  static async signNote(req: Request, res: Response, next: NextFunction) {
    try {
      const { noteId } = req.params;
      const authUser = (req as AuthRequest).user!;
      const { signatureMethod = 'electronic', location } = req.body;

      // Only professionals can sign notes
      if (authUser.role !== 'professional' && authUser.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Only professionals can sign notes',
        });
      }

      const note = await Note.findOne({ _id: noteId, deletedAt: null });
      if (!note) {
        return res.status(404).json({
          success: false,
          message: 'Note not found',
        });
      }

      if (note.signature?.isSigned) {
        return res.status(400).json({
          success: false,
          message: 'Note is already signed',
        });
      }

      // Professional can only sign their own notes or notes for their patients
      if (authUser.role === 'professional') {
        const isOwner = note.professionalId.equals(authUser.professionalId!);
        let hasPatientAccess = false;

        if (note.patientId && !isOwner) {
          const patient = await Patient.findById(note.patientId);
          if (patient) {
            hasPatientAccess = patient.clinicalInfo.assignedProfessionals?.includes(authUser.professionalId!) ||
                             patient.clinicalInfo.primaryProfessional?.equals(authUser.professionalId!);
          }
        }

        if (!isOwner && !hasPatientAccess) {
          return res.status(403).json({
            success: false,
            message: 'Access denied: Cannot sign this note',
          });
        }
      }

      // Use the model's sign method
      await note.signNote(authUser._id, signatureMethod, location);

      // Populate references
      await note.populate([
        { path: 'signature.signedBy', select: 'name email' },
      ]);

      res.status(200).json({
        success: true,
        message: 'Note signed successfully',
        data: { note },
      });
    } catch (error) {
      logger.error('Sign note error:', error);
      next(error);
    }
  }

  /**
   * Get note templates
   */
  static async getNoteTemplates(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user!;

      // Patients cannot access templates
      if (authUser.role === 'patient') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot access note templates',
        });
      }

      const templates = await Note.find({
        isTemplate: true,
        deletedAt: null,
      }).sort({ category: 1, title: 1 });

      res.status(200).json({
        success: true,
        data: { templates },
      });
    } catch (error) {
      logger.error('Get note templates error:', error);
      next(error);
    }
  }

  /**
   * Get note statistics
   */
  static async getNoteStats(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user!;

      // Only admin and reception can view note statistics
      if (authUser.role !== 'admin' && authUser.role !== 'reception') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot view note statistics',
        });
      }

      const [
        totalNotes,
        signedNotes,
        draftNotes,
        notesByType,
        notesByCategory,
        recentNotes,
      ] = await Promise.all([
        Note.countDocuments({ deletedAt: null, isTemplate: { $ne: true } }),
        Note.countDocuments({ deletedAt: null, status: 'signed', isTemplate: { $ne: true } }),
        Note.countDocuments({ deletedAt: null, status: 'draft', isTemplate: { $ne: true } }),
        
        Note.aggregate([
          { $match: { deletedAt: null, isTemplate: { $ne: true } } },
          { $group: { _id: '$type', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),

        Note.aggregate([
          { $match: { deletedAt: null, isTemplate: { $ne: true } } },
          { $group: { _id: '$category', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),

        Note.find({ deletedAt: null, isTemplate: { $ne: true } })
          .sort({ createdAt: -1 })
          .limit(10)
          .populate('patientId', 'personalInfo.fullName')
          .populate('createdBy', 'name')
          .select('title type category status createdAt'),
      ]);

      res.status(200).json({
        success: true,
        data: {
          overview: {
            totalNotes,
            signedNotes,
            draftNotes,
            signatureRate: totalNotes > 0 ? (signedNotes / totalNotes) * 100 : 0,
          },
          byType: notesByType,
          byCategory: notesByCategory,
          recentNotes,
        },
      });
    } catch (error) {
      logger.error('Get note stats error:', error);
      next(error);
    }
  }
}

export default NoteController;

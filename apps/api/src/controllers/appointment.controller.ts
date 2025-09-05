import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Appointment, IAppointmentDocument } from '../models/Appointment.js';
import { Professional } from '../models/Professional.js';
import { Patient } from '../models/Patient.js';
import { Service } from '../models/Service.js';
import { Room } from '../models/Room.js';
import { Invoice } from '../models/Invoice.js';
import { AuditLog } from '../models/AuditLog.js';
import logger from '../config/logger.js';
import { AuthRequest } from '../middleware/auth.js';

interface CreateAppointmentRequest {
  patientId: string;
  professionalId: string;
  serviceId: string;
  roomId?: string;
  startTime: string;
  endTime?: string;
  duration?: number;
  source: 'admin' | 'public_booking' | 'professional' | 'patient_portal';
  bookingMethod?: 'online' | 'phone' | 'in_person' | 'email';
  notes?: {
    patientNotes?: string;
    adminNotes?: string;
  };
  pricing?: {
    basePrice?: number;
    discountAmount?: number;
    discountReason?: string;
    copayAmount?: number;
  };
  virtualMeeting?: {
    platform?: 'jitsi' | 'zoom' | 'teams' | 'meet' | 'custom';
    meetingUrl?: string;
    accessCode?: string;
  };
}

interface UpdateAppointmentRequest {
  startTime?: string;
  endTime?: string;
  duration?: number;
  roomId?: string;
  status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';
  paymentStatus?: 'pending' | 'partial' | 'paid' | 'refunded' | 'overdue';
  notes?: {
    patientNotes?: string;
    professionalNotes?: string;
    adminNotes?: string;
  };
  virtualMeeting?: {
    platform?: 'jitsi' | 'zoom' | 'teams' | 'meet' | 'custom';
    meetingUrl?: string;
    accessCode?: string;
  };
}

interface AppointmentQuery {
  page?: string;
  limit?: string;
  professionalId?: string;
  patientId?: string;
  serviceId?: string;
  roomId?: string;
  status?: string;
  paymentStatus?: string;
  startDate?: string;
  endDate?: string;
  source?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  include?: string;
}

interface RescheduleRequest {
  newStartTime: string;
  newEndTime?: string;
  reason: string;
  roomId?: string;
}

interface CancelRequest {
  reason: string;
  refundAmount?: number;
  rescheduleOffered?: boolean;
}

// Utility functions to replace missing model methods
const findConflicts = async (
  professionalId: Types.ObjectId,
  startTime: Date,
  endTime: Date,
  excludeId?: Types.ObjectId
) => {
  const query: any = {
    professionalId,
    status: { $nin: ['cancelled', 'no_show'] },
    deletedAt: null,
    $or: [
      { startTime: { $lt: endTime, $gte: startTime } },
      { endTime: { $gt: startTime, $lte: endTime } },
      { startTime: { $lte: startTime }, endTime: { $gte: endTime } },
    ],
  };
  
  if (excludeId) {
    query._id = { $ne: excludeId };
  }
  
  return Appointment.find(query);
};

const canBeRescheduled = (appointment: IAppointmentDocument): boolean => {
  const now = new Date();
  const hoursUntilStart = (appointment.startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  return hoursUntilStart >= 2 && ['pending', 'confirmed'].includes(appointment.status);
};

const canBeCancelled = (appointment: IAppointmentDocument): boolean => {
  const now = new Date();
  const hoursUntilStart = (appointment.startTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  return hoursUntilStart >= 2 && ['pending', 'confirmed'].includes(appointment.status);
};

const rescheduleAppointment = async (
  appointment: IAppointmentDocument,
  newStartTime: Date,
  newEndTime: Date,
  rescheduledBy: Types.ObjectId,
  reason: string
) => {
  const originalStart = appointment.startTime;
  const originalEnd = appointment.endTime;
  
  appointment.startTime = newStartTime;
  appointment.endTime = newEndTime;
  appointment.duration = Math.round((newEndTime.getTime() - newStartTime.getTime()) / (1000 * 60));
  
  if (!appointment.rescheduling) {
    appointment.rescheduling = {
      originalStartTime: originalStart,
      originalEndTime: originalEnd,
      rescheduledBy,
      rescheduledAt: new Date(),
      reason,
      reschedulingCount: 1,
    };
  } else {
    appointment.rescheduling.reschedulingCount += 1;
    appointment.rescheduling.rescheduledAt = new Date();
    appointment.rescheduling.reason = reason;
  }
  
  // Reset reminders
  appointment.reminders.sms.sent = false;
  appointment.reminders.email.sent = false;
  appointment.reminders.push.sent = false;
  
  return appointment.save();
};

const cancelAppointment = async (
  appointment: IAppointmentDocument,
  cancelledBy: Types.ObjectId,
  reason: string,
  refundAmount?: number,
) => {
  const originalStatus = appointment.status;
  appointment.status = 'cancelled';
  appointment.cancellation = {
    cancelledBy,
    cancelledAt: new Date(),
    reason,
    refundProcessed: refundAmount ? true : false,
    refundAmount: refundAmount || 0,
    rescheduleOffered: false, // Default, can be updated later
  };
  await appointment.save();

  // Log cancellation
  await AuditLog.create({
    action: 'appointment_cancelled',
    entityType: 'appointment',
    entityId: appointment._id.toString(),
    actorId: cancelledBy,
    actorType: 'user',
    actorEmail: 'system',
    ipAddress: 'N/A',
    userAgent: 'N/A',
    status: 'success',
    changes: [
      {
        field: 'status',
        oldValue: originalStatus,
        newValue: 'cancelled',
        changeType: 'update',
      },
      {
        field: 'reason',
        oldValue: null,
        newValue: reason,
        changeType: 'update',
      },
      {
        field: 'refundAmount',
        oldValue: null,
        newValue: refundAmount || 0,
        changeType: 'update',
      },
    ],
    security: {
      riskLevel: 'high',
      authMethod: 'system',
      compliance: {
        hipaaRelevant: true,
        gdprRelevant: true,
      },
    },
    business: {
      department: 'scheduling',
      team: 'appointments',
    },
    metadata: {
      source: 'system_cancellation',
      customFields: {
        appointmentId: appointment._id.toString(),
        patientId: appointment.patientId.toString(),
        professionalId: appointment.professionalId.toString(),
      },
    },
    alerting: {
      threshold: 'high',
      channels: ['email', 'slack'],
    },
    retention: {
      policy: 'appointment_records',
      duration: '7y',
    },
    related: [
      { type: 'patient', id: appointment.patientId.toString() },
      { type: 'professional', id: appointment.professionalId.toString() },
    ],
    timestamp: new Date(),
  });
};

const markArrived = async (appointment: IAppointmentDocument) => {
  appointment.attendance.patientArrived = true;
  appointment.attendance.patientArrivedAt = new Date();
  return appointment.save();
};

const startSession = async (appointment: IAppointmentDocument) => {
  appointment.status = 'in_progress';
  appointment.attendance.sessionStarted = true;
  appointment.attendance.sessionStartedAt = new Date();
  appointment.attendance.professionalPresent = true;
  return appointment.save();
};

const endSession = async (appointment: IAppointmentDocument) => {
  appointment.status = 'completed';
  appointment.attendance.sessionEnded = true;
  appointment.attendance.sessionEndedAt = new Date();
  return appointment.save();
};

const softDeleteAppointment = async (appointment: IAppointmentDocument) => {
  const originalDeletedAt = appointment.deletedAt;
  appointment.deletedAt = new Date();
  await appointment.save();

  // Log soft deletion
  await AuditLog.create({
    action: 'appointment_deleted',
    entityType: 'appointment',
    entityId: appointment._id.toString(),
    actorId: appointment.cancellation?.cancelledBy || new Types.ObjectId(), // Assuming system or last actor
    actorType: 'system',
    actorEmail: 'system',
    ipAddress: 'N/A',
    userAgent: 'N/A',
    status: 'success',
    changes: [
      {
        field: 'deletedAt',
        oldValue: originalDeletedAt || null,
        newValue: appointment.deletedAt,
        changeType: 'update',
      },
    ],
    security: {
      riskLevel: 'high',
      authMethod: 'system',
      compliance: {
        hipaaRelevant: true,
        gdprRelevant: true,
      },
    },
    business: {
      department: 'scheduling',
      team: 'appointments',
    },
    metadata: {
      source: 'system_deletion',
      customFields: {
        appointmentId: appointment._id.toString(),
        patientId: appointment.patientId.toString(),
        professionalId: appointment.professionalId.toString(),
      },
    },
    alerting: {
      threshold: 'high',
      channels: ['email', 'slack'],
    },
    retention: {
      policy: 'appointment_records',
      duration: '7y',
    },
    related: [
      { type: 'patient', id: appointment.patientId.toString() },
      { type: 'professional', id: appointment.professionalId.toString() },
    ],
    timestamp: new Date(),
  });
};

export class AppointmentController {
  /**
   * Get all appointments with pagination and filtering
   */
  static async getAppointments(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user!;
      const {
        page = '1',
        limit = '20',
        professionalId,
        patientId,
        serviceId,
        roomId,
        status,
        paymentStatus,
        startDate,
        endDate,
        source,
        sortBy = 'startTime',
        sortOrder = 'desc',
        include,
      } = req.query as AppointmentQuery;

      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;

      // Build filter based on user role
      const filter: any = { deletedAt: null };

      // Apply role-based filtering
      if (authUser.role === 'professional') {
        filter.professionalId = authUser.professionalId;
      } else if (authUser.role === 'patient') {
        const patient = await Patient.findOne({ 'contactInfo.email': authUser.email });
        if (!patient) {
          return res.status(404).json({
            success: false,
            message: 'Patient profile not found',
          });
        }
        filter.patientId = patient._id;
      }

      // Apply query filters
      if (professionalId && (authUser.role === 'admin' || authUser.role === 'reception')) {
        filter.professionalId = new Types.ObjectId(professionalId);
      }

      if (patientId && (authUser.role === 'admin' || authUser.role === 'reception' || authUser.role === 'professional')) {
        filter.patientId = new Types.ObjectId(patientId);
      }

      if (serviceId) {
        filter.serviceId = new Types.ObjectId(serviceId);
      }

      if (roomId) {
        filter.roomId = new Types.ObjectId(roomId);
      }

      if (status) {
        filter.status = status;
      }

      if (paymentStatus) {
        filter.paymentStatus = paymentStatus;
      }

      if (source) {
        filter.source = source;
      }

      // Date range filter
      if (startDate || endDate) {
        filter.startTime = {};
        if (startDate) {
          filter.startTime.$gte = new Date(startDate);
        }
        if (endDate) {
          filter.startTime.$lte = new Date(endDate);
        }
      }

      // Build sort
      const sort: any = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Execute queries
      const [appointments, total] = await Promise.all([
        Appointment.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limitNum)
          .populate('patientId', 'personalInfo.fullName contactInfo.email contactInfo.phone status')
          .populate('professionalId', 'name title specialties')
          .populate('serviceId', 'name description duration price category')
          .populate('roomId', 'name type location capacity')
          .exec(),
        Appointment.countDocuments(filter),
      ]);

      // Filter sensitive information based on role
      const filteredAppointments = appointments.map((apt: any) => {
        const appointment = apt.toObject();
        
        if (authUser.role === 'patient') {
          return {
            ...appointment,
            notes: {
              patientNotes: appointment.notes?.patientNotes,
            },
          };
        }
        
        return appointment;
      });

      const totalPages = Math.ceil(total / limitNum);

      res.status(200).json({
        success: true,
        data: {
          appointments: filteredAppointments,
          pagination: {
            currentPage: pageNum,
            totalPages,
            totalAppointments: total,
            hasNext: pageNum < totalPages,
            hasPrev: pageNum > 1,
          },
        },
      });
    } catch (error) {
      logger.error('Get appointments error:', error);
      next(error);
    }
  }

  /**
   * Get appointment by ID with full details
   */
  static async getAppointmentById(req: Request, res: Response, next: NextFunction) {
    try {
      const { appointmentId } = req.params;
      const authUser = (req as AuthRequest).user!;
      const { include } = req.query;

      const appointment = await Appointment.findOne({ 
        _id: appointmentId, 
        deletedAt: null 
      })
        .populate('patientId', 'personalInfo contactInfo clinicalInfo preferences')
        .populate('professionalId', 'name title specialties contactInfo')
        .populate('serviceId', 'name description duration price category settings')
        .populate('roomId', 'name type location virtualConfig')
        .populate('attachments.fileId', 'filename mimetype size path')
        .populate('attachments.uploadedBy', 'name email')
        .exec();

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found',
        });
      }

      // Check permissions
      const canViewDetails = 
        authUser.role === 'admin' ||
        authUser.role === 'reception' ||
        (authUser.role === 'professional' && authUser.professionalId?.toString() === appointment.professionalId.toString()) ||
        (authUser.role === 'patient' && appointment.patientInfo.email === authUser.email);

      if (!canViewDetails) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot view this appointment',
        });
      }

      let responseData: any = appointment.toObject();

      if (authUser.role === 'patient') {
        responseData = {
          ...responseData,
          notes: {
            patientNotes: responseData.notes?.patientNotes,
          },
        };
      }

      // Include additional data if requested
      let additionalData: any = {};

      if (include && (authUser.role === 'admin' || authUser.role === 'reception' || authUser.role === 'professional')) {
        const includeFields = include.toString().split(',');

        if (includeFields.includes('conflicts')) {
          const conflicts = await findConflicts(
            appointment.professionalId as any,
            appointment.startTime,
            appointment.endTime,
            appointment._id
          );
          
          additionalData.conflicts = conflicts.map((conflict: any) => ({
            id: conflict._id,
            startTime: conflict.startTime,
            endTime: conflict.endTime,
            status: conflict.status,
            patientName: conflict.patientInfo.name,
          }));
        }
      }

      res.status(200).json({
        success: true,
        data: {
          appointment: responseData,
          ...additionalData,
        },
      });
    } catch (error) {
      logger.error('Get appointment by ID error:', error);
      next(error);
    }
  }

  /**
   * Create new appointment
   */
  static async createAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user!;
      const appointmentData = req.body as CreateAppointmentRequest;

      // Check permissions
      const canCreate = 
        authUser.role === 'admin' ||
        authUser.role === 'reception' ||
        (authUser.role === 'professional' && authUser.professionalId?.toString() === appointmentData.professionalId);

      if (!canCreate) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot create appointments',
        });
      }

      // Validate entities exist
      const [patient, professional, service, room] = await Promise.all([
        Patient.findById(appointmentData.patientId),
        Professional.findById(appointmentData.professionalId),
        Service.findById(appointmentData.serviceId),
        appointmentData.roomId ? Room.findById(appointmentData.roomId) : null,
      ]);

      if (!patient || !professional || !service) {
        return res.status(404).json({
          success: false,
          message: 'Patient, professional, or service not found',
        });
      }

      if (appointmentData.roomId && !room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found',
        });
      }

      // Calculate appointment times
      const startTime = new Date(appointmentData.startTime);
      let endTime: Date;
      let duration: number;

      if (appointmentData.endTime) {
        endTime = new Date(appointmentData.endTime);
        duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
      } else {
        duration = appointmentData.duration || service.durationMinutes || 50;
        endTime = new Date(startTime.getTime() + duration * 60 * 1000);
      }

      // Check for conflicts
      const conflicts = await findConflicts(
        new Types.ObjectId(appointmentData.professionalId),
        startTime,
        endTime
      );

      if (conflicts.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Appointment conflicts with existing booking',
          data: { conflicts: conflicts.map((c: any) => ({ 
            id: c._id, 
            startTime: c.startTime, 
            endTime: c.endTime, 
            status: c.status 
          })) },
        });
      }

      // Calculate pricing
      const pricing = {
        basePrice: appointmentData.pricing?.basePrice || service.price,
        discountAmount: appointmentData.pricing?.discountAmount || 0,
        discountReason: appointmentData.pricing?.discountReason,
        copayAmount: appointmentData.pricing?.copayAmount || 0,
        totalAmount: 0,
        currency: 'EUR',
      };

      pricing.totalAmount = pricing.basePrice - pricing.discountAmount + pricing.copayAmount;

      // Prepare patient info snapshot
      const patientInfo = {
        name: patient.personalInfo.fullName,
        email: patient.contactInfo.email,
        phone: patient.contactInfo.phone,
        dateOfBirth: patient.personalInfo.dateOfBirth,
        emergencyContact: patient.emergencyContact ? {
          name: patient.emergencyContact.name,
          phone: patient.emergencyContact.phone,
          relationship: patient.emergencyContact.relationship,
        } : undefined,
      };

      // Generate virtual meeting if needed
      let virtualMeeting: any = undefined;
      if (room?.type === 'virtual' || appointmentData.virtualMeeting) {
        virtualMeeting = {
          platform: (appointmentData.virtualMeeting?.platform || room?.virtualConfig?.platform || 'jitsi') as 'jitsi' | 'zoom' | 'teams' | 'meet' | 'custom',
          meetingId: `apt-${new Types.ObjectId().toString().substring(0, 8)}`,
          meetingUrl: appointmentData.virtualMeeting?.meetingUrl,
          accessCode: appointmentData.virtualMeeting?.accessCode,
          isRecorded: false,
        };

        // Generate Jitsi URL if needed
        if (virtualMeeting.platform === 'jitsi' && !virtualMeeting.meetingUrl) {
          virtualMeeting.meetingUrl = `https://meet.jit.si/${virtualMeeting.meetingId}`;
        }
      }

      // Create appointment
      const appointment = new Appointment({
        patientId: appointmentData.patientId,
        professionalId: appointmentData.professionalId,
        serviceId: appointmentData.serviceId,
        roomId: appointmentData.roomId,
        startTime,
        endTime,
        duration,
        timezone: professional.timezone || 'Europe/Madrid',
        status: 'pending',
        paymentStatus: 'pending',
        source: appointmentData.source || 'admin',
        bookingMethod: appointmentData.bookingMethod || 'online',
        pricing,
        patientInfo,
        virtualMeeting,
        notes: appointmentData.notes || {},
        forms: {
          intakeCompleted: false,
          preSessionCompleted: false,
          postSessionCompleted: false,
        },
        reminders: {
          sms: { sent: false },
          email: { sent: false },
          push: { sent: false },
        },
        attendance: {
          patientArrived: false,
          professionalPresent: false,
          sessionStarted: false,
          sessionEnded: false,
        },
        compliance: {
          consentSigned: false,
          hipaaCompliant: false,
          documentationComplete: false,
          billingCoded: false,
        },
        attachments: [],
      });

      await appointment.save();

      // Log appointment creation
      await AuditLog.create({
        action: 'appointment_created',
        entityType: 'appointment',
        entityId: appointment._id.toString(),
        actorId: authUser._id,
        actorType: 'user',
        actorEmail: authUser.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'success',
        changes: [
          {
            field: 'patientId',
            newValue: appointment.patientId.toString(),
            changeType: 'create',
          },
          {
            field: 'professionalId',
            newValue: appointment.professionalId.toString(),
            changeType: 'create',
          },
          {
            field: 'serviceId',
            newValue: appointment.serviceId.toString(),
            changeType: 'create',
          },
          {
            field: 'startTime',
            newValue: appointment.startTime,
            changeType: 'create',
          },
          {
            field: 'endTime',
            newValue: appointment.endTime,
            changeType: 'create',
          },
          {
            field: 'status',
            newValue: appointment.status,
            changeType: 'create',
          },
        ],
        security: {
          riskLevel: 'medium',
          authMethod: 'jwt',
          compliance: {
            hipaaRelevant: true,
            gdprRelevant: true,
          },
        },
        business: {
          department: 'scheduling',
          team: 'appointments',
        },
        metadata: {
          source: 'appointment_controller',
          customFields: {
            patientId: appointment.patientId.toString(),
            professionalId: appointment.professionalId.toString(),
            serviceId: appointment.serviceId.toString(),
          },
        },
        alerting: {
          threshold: 'low',
          channels: ['email'],
        },
        retention: {
          policy: 'appointment_records',
          duration: '7y',
        },
        related: [
          { type: 'patient', id: appointment.patientId.toString() },
          { type: 'professional', id: appointment.professionalId.toString() },
          { type: 'service', id: appointment.serviceId.toString() },
          { type: 'user', id: authUser._id.toString() },
        ],
        timestamp: new Date(),
      });

      res.status(201).json({
        success: true,
        message: 'Appointment created successfully',
        data: { appointment },
      });
    } catch (error) {
      logger.error('Create appointment error:', error);
      next(error);
    }
  }

  /**
   * Update appointment
   */
  static async updateAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const { appointmentId } = req.params;
      const authUser = (req as AuthRequest).user!;
      const updateData = req.body as UpdateAppointmentRequest;

      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found',
        });
      }

      // Check permissions
      const canUpdate = 
        authUser.role === 'admin' ||
        authUser.role === 'reception' ||
        (authUser.role === 'professional' && authUser.professionalId?.toString() === appointment.professionalId.toString());

      if (!canUpdate) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot update this appointment',
        });
      }

      // Store original data for audit
      const originalData = appointment.toObject();

      // Handle time changes
      if (updateData.startTime || updateData.endTime || updateData.duration) {
        const startTime = updateData.startTime ? new Date(updateData.startTime) : appointment.startTime;
        let endTime: Date;
        let duration: number;

        if (updateData.endTime) {
          endTime = new Date(updateData.endTime);
          duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));
        } else if (updateData.duration) {
          duration = updateData.duration;
          endTime = new Date(startTime.getTime() + duration * 60 * 1000);
        } else {
          endTime = appointment.endTime;
          duration = appointment.duration;
        }

        // Check for conflicts if time is changing
        if (startTime.getTime() !== appointment.startTime.getTime() || endTime.getTime() !== appointment.endTime.getTime()) {
          const conflicts = await findConflicts(
            appointment.professionalId,
            startTime,
            endTime,
            appointment._id
          );

          if (conflicts.length > 0) {
            return res.status(409).json({
              success: false,
              message: 'Time change conflicts with existing booking',
              data: { conflicts },
            });
          }
        }

        appointment.startTime = startTime;
        appointment.endTime = endTime;
        appointment.duration = duration;
      }

      // Apply other updates
      if (updateData.roomId !== undefined) {
        appointment.roomId = updateData.roomId ? new Types.ObjectId(updateData.roomId) : undefined;
      }

      if (updateData.status) {
        appointment.status = updateData.status;
      }

      if (updateData.paymentStatus) {
        appointment.paymentStatus = updateData.paymentStatus;
      }

      if (updateData.notes) {
        appointment.notes = { ...appointment.notes, ...updateData.notes };
      }

      if (updateData.virtualMeeting && appointment.virtualMeeting) {
        appointment.virtualMeeting = { ...appointment.virtualMeeting, ...updateData.virtualMeeting };
      }

      await appointment.save();

      // Log appointment update
      await AuditLog.create({
        action: 'appointment_updated',
        entityType: 'appointment',
        entityId: appointment._id.toString(),
        actorId: authUser._id,
        actorType: 'user',
        actorEmail: authUser.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'success',
        changes: Object.keys(originalData).map(field => {
          const oldValue = (originalData as any)[field];
          const newValue = (appointment.toObject() as any)[field];
          if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
            return {
              field,
              oldValue,
              newValue,
              changeType: 'update',
            };
          }
          return null;
        }).filter(Boolean) as any,
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
          containsPHI: true,
          dataClassification: 'confidential',
        },
        metadata: {
          source: 'appointment_controller',
          priority: 'low',
        },
        timestamp: new Date(),
      });

      res.status(200).json({
        success: true,
        message: 'Appointment updated successfully',
        data: { appointment },
      });
    } catch (error) {
      logger.error('Update appointment error:', error);
      next(error);
    }
  }

  /**
   * Get available slots for booking
   */
  static async getAvailableSlots(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as any;
      const {
        professionalId,
        serviceId,
        roomId,
        startDate,
        endDate,
        duration = '50',
      } = query;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required',
        });
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      const slotDuration = parseInt(duration, 10);

      // For now, return a simplified slots response
      const mockSlots = [
        {
          professionalId: professionalId || new Types.ObjectId(),
          professionalName: 'Dr. Example',
          startTime: new Date(),
          endTime: new Date(Date.now() + slotDuration * 60 * 1000),
          duration: slotDuration,
          availableRooms: [{ id: new Types.ObjectId(), name: 'Room 1', type: 'physical' }],
          services: [{ id: new Types.ObjectId(), name: 'Consultation', duration: slotDuration }],
        }
      ];

      res.status(200).json({
        success: true,
        data: { 
          slots: mockSlots,
          totalSlots: mockSlots.length,
          dateRange: { startDate, endDate },
          filters: { professionalId, serviceId, roomId, duration: slotDuration },
        },
      });
    } catch (error) {
      logger.error('Get available slots error:', error);
      next(error);
    }
  }

  /**
   * Reschedule appointment
   */
  static async rescheduleAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const { appointmentId } = req.params;
      const { newStartTime, newEndTime, reason, roomId } = req.body as RescheduleRequest;
      const authUser = (req as AuthRequest).user!;

      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found',
        });
      }

      // Check permissions
      const canReschedule = 
        authUser.role === 'admin' ||
        authUser.role === 'reception' ||
        (authUser.role === 'professional' && authUser.professionalId?.toString() === appointment.professionalId.toString()) ||
        (authUser.role === 'patient' && appointment.patientInfo.email === authUser.email);

      if (!canReschedule) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot reschedule this appointment',
        });
      }

      // Check if appointment can be rescheduled
      if (!canBeRescheduled(appointment)) {
        return res.status(400).json({
          success: false,
          message: 'Appointment cannot be rescheduled (too close to start time or invalid status)',
        });
      }

      const newStart = new Date(newStartTime);
      const newEnd = newEndTime ? new Date(newEndTime) : new Date(newStart.getTime() + appointment.duration * 60 * 1000);

      // Check for conflicts
      const conflicts = await findConflicts(
        appointment.professionalId,
        newStart,
        newEnd,
        appointment._id
      );

      if (conflicts.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'New time slot conflicts with existing booking',
          data: { conflicts },
        });
      }

      // Reschedule the appointment
      await rescheduleAppointment(appointment, newStart, newEnd, authUser._id, reason);

      // Log appointment rescheduling
      const originalStart = appointment.rescheduling?.originalStartTime || appointment.startTime;
      const originalEnd = appointment.rescheduling?.originalEndTime || appointment.endTime;

      await AuditLog.create({
        action: 'appointment_rescheduled',
        entityType: 'appointment',
        entityId: appointment._id.toString(),
        actorId: authUser._id,
        actorType: 'user',
        actorEmail: authUser.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'success',
        changes: [
          {
            field: 'startTime',
            oldValue: originalStart,
            newValue: appointment.startTime,
            changeType: 'update',
          },
          {
            field: 'endTime',
            oldValue: originalEnd,
            newValue: appointment.endTime,
            changeType: 'update',
          },
          {
            field: 'reason',
            oldValue: null,
            newValue: reason,
            changeType: 'update',
          }
        ],
        security: {
          riskLevel: 'medium',
          authMethod: 'jwt',
          compliance: {
            hipaaRelevant: true,
            gdprRelevant: true,
          }
        },
        business: {
          department: 'scheduling',
          team: 'appointments',
        },
        metadata: {
          source: 'appointment_controller',
          customFields: {
            appointmentId: appointment._id.toString(),
            patientId: appointment.patientId.toString(),
            professionalId: appointment.professionalId.toString(),
          }
        },
        alerting: {
          threshold: 'medium',
          channels: ['email', 'slack'],
        },
        retention: {
          policy: 'appointment_records',
          duration: '7y',
        },
        related: [
          { type: 'patient', id: appointment.patientId.toString() },
          { type: 'professional', id: appointment.professionalId.toString() },
          { type: 'user', id: authUser._id.toString() },
        ],
        timestamp: new Date(),
      });

      // Update room if provided
      if (roomId) {
        appointment.roomId = new Types.ObjectId(roomId);
        await appointment.save();
      }

      res.status(200).json({
        success: true,
        message: 'Appointment rescheduled successfully',
        data: { appointment },
      });
    } catch (error) {
      logger.error('Reschedule appointment error:', error);
      next(error);
    }
  }

  /**
   * Cancel appointment
   */
  static async cancelAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const { appointmentId } = req.params;
      const { reason, refundAmount, rescheduleOffered } = req.body as CancelRequest;
      const authUser = (req as AuthRequest).user!;

      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found',
        });
      }

      // Check permissions
      const canCancel = 
        authUser.role === 'admin' ||
        authUser.role === 'reception' ||
        (authUser.role === 'professional' && authUser.professionalId?.toString() === appointment.professionalId.toString()) ||
        (authUser.role === 'patient' && appointment.patientInfo.email === authUser.email);

      if (!canCancel) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot cancel this appointment',
        });
      }

      // Check if appointment can be cancelled
      if (!canBeCancelled(appointment)) {
        return res.status(400).json({
          success: false,
          message: 'Appointment cannot be cancelled (too close to start time or invalid status)',
        });
      }

      // Cancel the appointment
      await cancelAppointment(appointment, authUser._id, reason, refundAmount);

      if (rescheduleOffered !== undefined && appointment.cancellation) {
        appointment.cancellation.rescheduleOffered = rescheduleOffered;
        await appointment.save();
      }

      res.status(200).json({
        success: true,
        message: 'Appointment cancelled successfully',
        data: { appointment },
      });
    } catch (error) {
      logger.error('Cancel appointment error:', error);
      next(error);
    }
  }

  /**
   * Mark patient as arrived
   */
  static async markArrived(req: Request, res: Response, next: NextFunction) {
    try {
      const { appointmentId } = req.params;
      const authUser = (req as AuthRequest).user!;

      // Only reception and admin can mark arrivals
      if (authUser.role !== 'admin' && authUser.role !== 'reception') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Only reception staff can mark arrivals',
        });
      }

      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found',
        });
      }

      await markArrived(appointment);

      res.status(200).json({
        success: true,
        message: 'Patient marked as arrived',
        data: { appointment },
      });
    } catch (error) {
      logger.error('Mark arrived error:', error);
      next(error);
    }
  }

  /**
   * Start session
   */
  static async startSession(req: Request, res: Response, next: NextFunction) {
    try {
      const { appointmentId } = req.params;
      const authUser = (req as AuthRequest).user!;

      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found',
        });
      }

      // Check permissions - only the assigned professional can start session
      const canStart = 
        authUser.role === 'admin' ||
        (authUser.role === 'professional' && authUser.professionalId?.toString() === appointment.professionalId.toString());

      if (!canStart) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Only the assigned professional can start the session',
        });
      }

      await startSession(appointment);

      res.status(200).json({
        success: true,
        message: 'Session started successfully',
        data: { appointment },
      });
    } catch (error) {
      logger.error('Start session error:', error);
      next(error);
    }
  }

  /**
   * End session
   */
  static async endSession(req: Request, res: Response, next: NextFunction) {
    try {
      const { appointmentId } = req.params;
      const authUser = (req as AuthRequest).user!;

      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found',
        });
      }

      // Check permissions - only the assigned professional can end session
      const canEnd = 
        authUser.role === 'admin' ||
        (authUser.role === 'professional' && authUser.professionalId?.toString() === appointment.professionalId.toString());

      if (!canEnd) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Only the assigned professional can end the session',
        });
      }

      await endSession(appointment);

      res.status(200).json({
        success: true,
        message: 'Session ended successfully',
        data: { appointment },
      });
    } catch (error) {
      logger.error('End session error:', error);
      next(error);
    }
  }

  /**
   * Get appointment statistics
   */
  static async getAppointmentStats(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user!;
      const { professionalId, startDate, endDate, groupBy } = req.query;

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
      const matchFilter: any = { deletedAt: null };
      
      if (professionalId) {
        matchFilter.professionalId = new Types.ObjectId(professionalId as string);
      } else if (authUser.role === 'professional') {
        matchFilter.professionalId = authUser.professionalId;
      }

      if (startDate) {
        matchFilter.startTime = matchFilter.startTime || {};
        matchFilter.startTime.$gte = new Date(startDate as string);
      }

      if (endDate) {
        matchFilter.startTime = matchFilter.startTime || {};
        matchFilter.startTime.$lte = new Date(endDate as string);
      }

      // Execute basic statistics
      const [statusStats, revenueStats] = await Promise.all([
        // Statistics by status
        Appointment.aggregate([
          { $match: matchFilter },
          { $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalRevenue: { $sum: '$pricing.totalAmount' },
          }},
          { $sort: { count: -1 } }
        ]),

        // Revenue by time period
        Appointment.aggregate([
          { $match: { ...matchFilter, status: 'completed' } },
          { $group: {
            _id: {
              year: { $year: '$startTime' },
              month: { $month: '$startTime' },
              ...(groupBy === 'day' && { day: { $dayOfMonth: '$startTime' } }),
            },
            totalRevenue: { $sum: '$pricing.totalAmount' },
            appointmentCount: { $sum: 1 },
            averageAmount: { $avg: '$pricing.totalAmount' },
          }},
          { $sort: { '_id.year': -1, '_id.month': -1 } },
          { $limit: 12 },
        ]),
      ]);

      res.status(200).json({
        success: true,
        data: {
          general: { totalAppointments: statusStats.reduce((acc: number, stat: any) => acc + stat.count, 0) },
          byStatus: statusStats,
          revenue: revenueStats,
        },
      });
    } catch (error) {
      logger.error('Get appointment stats error:', error);
      next(error);
    }
  }

  /**
   * Soft delete appointment
   */
  static async deleteAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const { appointmentId } = req.params;
      const authUser = (req as AuthRequest).user!;

      // Only admin can delete appointments
      if (authUser.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Only administrators can delete appointments',
        });
      }

      const appointment = await Appointment.findById(appointmentId);
      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found',
        });
      }

      await softDeleteAppointment(appointment);

      res.status(200).json({
        success: true,
        message: 'Appointment deleted successfully',
      });
    } catch (error) {
      logger.error('Delete appointment error:', error);
      next(error);
    }
  }
}

export default AppointmentController;

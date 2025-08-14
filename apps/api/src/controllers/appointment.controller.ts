import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Appointment } from '../models/Appointment.js';
import { Patient } from '../models/Patient.js';
import { Professional } from '../models/Professional.js';
import { Service } from '../models/Service.js';
import { Room } from '../models/Room.js';
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
  timezone?: string;
  status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';
  paymentStatus?: 'pending' | 'partial' | 'paid' | 'refunded' | 'overdue';
  source?: 'admin' | 'public_booking' | 'professional' | 'patient_portal';
  bookingMethod?: 'online' | 'phone' | 'in_person' | 'email';
  notes?: {
    patientNotes?: string;
    professionalNotes?: string;
    adminNotes?: string;
  };
  virtualMeeting?: {
    platform: 'jitsi' | 'zoom' | 'teams' | 'meet' | 'custom';
    meetingId?: string;
    meetingUrl?: string;
    accessCode?: string;
    isRecorded?: boolean;
  };
}

interface UpdateAppointmentRequest {
  startTime?: string;
  endTime?: string;
  duration?: number;
  status?: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' | 'no_show' | 'rescheduled';
  paymentStatus?: 'pending' | 'partial' | 'paid' | 'refunded' | 'overdue';
  roomId?: string;
  notes?: {
    patientNotes?: string;
    professionalNotes?: string;
    adminNotes?: string;
  };
}

interface AppointmentQuery {
  page?: string;
  limit?: string;
  search?: string;
  patientId?: string;
  professionalId?: string;
  serviceId?: string;
  roomId?: string;
  status?: string;
  paymentStatus?: string;
  source?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class AppointmentController {
  /**
   * Get all appointments with pagination, filtering and population
   */
  static async getAppointments(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user!;
      const {
        page = '1',
        limit = '20',
        search,
        patientId,
        professionalId,
        serviceId,
        roomId,
        status,
        paymentStatus,
        source,
        startDate,
        endDate,
        sortBy = 'startTime',
        sortOrder = 'asc',
      } = req.query as AppointmentQuery;

      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;

      // Build filter based on user role and permissions
      const filter: any = { deletedAt: null };

      // Role-based filtering
      if (authUser.role === 'professional' && authUser.professionalId) {
        filter.professionalId = authUser.professionalId;
      } else if (authUser.role === 'patient' && authUser.patientId) {
        filter.patientId = authUser.patientId;
      }

      // Apply query filters
      if (patientId && (authUser.role === 'admin' || authUser.role === 'reception')) {
        filter.patientId = new mongoose.Types.ObjectId(patientId);
      }

      if (professionalId && (authUser.role === 'admin' || authUser.role === 'reception')) {
        filter.professionalId = new mongoose.Types.ObjectId(professionalId);
      }

      if (serviceId) {
        filter.serviceId = new mongoose.Types.ObjectId(serviceId);
      }

      if (roomId) {
        filter.roomId = new mongoose.Types.ObjectId(roomId);
      }

      if (status) {
        const statuses = status.split(',');
        filter.status = { $in: statuses };
      }

      if (paymentStatus) {
        const paymentStatuses = paymentStatus.split(',');
        filter.paymentStatus = { $in: paymentStatuses };
      }

      if (source) {
        filter.source = source;
      }

      // Date range filtering
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        filter.startTime = { $gte: start, $lte: end };
      } else if (startDate) {
        filter.startTime = { $gte: new Date(startDate) };
      } else if (endDate) {
        filter.startTime = { $lte: new Date(endDate) };
      }

      // Text search
      if (search) {
        filter.$or = [
          { 'patientInfo.name': { $regex: search, $options: 'i' } },
          { 'patientInfo.email': { $regex: search, $options: 'i' } },
          { 'notes.patientNotes': { $regex: search, $options: 'i' } },
          { 'notes.professionalNotes': { $regex: search, $options: 'i' } },
          { 'notes.adminNotes': { $regex: search, $options: 'i' } },
        ];
      }

      // Build sort
      const sort: any = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Execute query with population
      const [appointments, total] = await Promise.all([
        Appointment.find(filter)
          .populate('patientId', 'name email phone')
          .populate('professionalId', 'name specialties email')
          .populate('serviceId', 'name duration price category')
          .populate('roomId', 'name type location')
          .sort(sort)
          .skip(skip)
          .limit(limitNum)
          .lean(),
        Appointment.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / limitNum);

      res.status(200).json({
        success: true,
        data: {
          appointments,
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

      const appointment = await Appointment.findOne({
        _id: appointmentId,
        deletedAt: null,
      })
        .populate('patientId', 'name email phone')
        .populate('professionalId', 'name specialties email phone')
        .populate('serviceId', 'name description duration price category')
        .populate('roomId', 'name type location capacity features');

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found',
        });
      }

      // Check permissions
      if (authUser.role === 'professional' && 
          authUser.professionalId?.toString() !== appointment.professionalId._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You can only view your own appointments',
        });
      }

      if (authUser.role === 'patient' && 
          authUser.patientId?.toString() !== appointment.patientId._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You can only view your own appointments',
        });
      }

      // Generate virtual meeting URL if applicable
      let virtualMeetingUrl = null;
      if (appointment.virtualMeeting) {
        if (appointment.virtualMeeting.platform === 'jitsi') {
          const meetingId = appointment.virtualMeeting.meetingId || 
            `apt-${appointment._id.toString().substring(0, 8)}`;
          virtualMeetingUrl = `https://meet.jit.si/${meetingId}`;
        } else {
          virtualMeetingUrl = appointment.virtualMeeting.meetingUrl || null;
        }
      }

      res.status(200).json({
        success: true,
        data: {
          appointment: {
            ...appointment.toObject(),
            virtualMeetingUrl,
          },
        },
      });
    } catch (error) {
      logger.error('Get appointment by ID error:', error);
      next(error);
    }
  }

  /**
   * Create new appointment with conflict detection
   */
  static async createAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user!;
      const appointmentData = req.body as CreateAppointmentRequest;

      // Validate required entities exist
      const [patient, professional, service, room] = await Promise.all([
        Patient.findOne({ _id: appointmentData.patientId, isActive: true }),
        Professional.findOne({ _id: appointmentData.professionalId, status: 'active' }),
        Service.findOne({ _id: appointmentData.serviceId, isActive: true }),
        appointmentData.roomId ? Room.findOne({ _id: appointmentData.roomId, isActive: true }) : null,
      ]);

      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found or inactive',
        });
      }

      if (!professional) {
        return res.status(404).json({
          success: false,
          message: 'Professional not found or inactive',
        });
      }

      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Service not found or inactive',
        });
      }

      if (appointmentData.roomId && !room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found or inactive',
        });
      }

      // Calculate appointment times
      const startTime = new Date(appointmentData.startTime);
      const duration = appointmentData.duration || service.durationMinutes || 60;
      const endTime = appointmentData.endTime 
        ? new Date(appointmentData.endTime)
        : new Date(startTime.getTime() + duration * 60 * 1000);

      // Check for conflicts
      const conflicts = await Appointment.find({
        professionalId: new mongoose.Types.ObjectId(appointmentData.professionalId),
        startTime: { $lt: endTime },
        endTime: { $gt: startTime },
        status: { $nin: ['cancelled', 'no_show'] },
        deletedAt: null,
      });

      if (conflicts.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Professional is not available at the selected time',
          conflicts: conflicts.map((c: any) => ({
            id: c._id,
            startTime: c.startTime,
            endTime: c.endTime,
            status: c.status,
          })),
        });
      }

      // Check room conflicts if room is specified
      if (room) {
        const roomConflicts = await Appointment.find({
          roomId: room._id,
          startTime: { $lt: endTime },
          endTime: { $gt: startTime },
          status: { $nin: ['cancelled', 'no_show'] },
          deletedAt: null,
        });

        if (roomConflicts.length > 0) {
          return res.status(409).json({
            success: false,
            message: 'Room is not available at the selected time',
          });
        }
      }

      // Prepare virtual meeting configuration
      let virtualMeeting = null;
      if (appointmentData.virtualMeeting) {
        const meetingId = `apt-${new mongoose.Types.ObjectId().toString().substring(0, 8)}`;
        virtualMeeting = {
          platform: appointmentData.virtualMeeting.platform || 'jitsi',
          meetingId,
          meetingUrl: appointmentData.virtualMeeting.meetingUrl,
          accessCode: appointmentData.virtualMeeting.accessCode,
          isRecorded: appointmentData.virtualMeeting.isRecorded || false,
        };
      }

      // Prepare patient info snapshot (using basic fields that exist)
      const patientInfo = {
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
      };

      // Prepare pricing
      const pricing = {
        basePrice: service.price,
        discountAmount: 0,
        totalAmount: service.price,
        currency: service.currency || 'EUR',
      };

      // Create appointment
      const appointment = new Appointment({
        patientId: appointmentData.patientId,
        professionalId: appointmentData.professionalId,
        serviceId: appointmentData.serviceId,
        roomId: appointmentData.roomId || null,
        startTime,
        endTime,
        duration,
        timezone: appointmentData.timezone || 'Europe/Madrid',
        status: appointmentData.status || 'pending',
        paymentStatus: appointmentData.paymentStatus || 'pending',
        source: appointmentData.source || 'admin',
        bookingMethod: appointmentData.bookingMethod || 'online',
        virtualMeeting,
        pricing,
        notes: appointmentData.notes || {},
        patientInfo,
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
          insuranceClaimed: false,
        },
        metadata: {
          sessionType: 'follow_up',
        },
      });

      await appointment.save();

      // Populate for response
      await appointment.populate([
        { path: 'patientId', select: 'name email phone' },
        { path: 'professionalId', select: 'name specialties' },
        { path: 'serviceId', select: 'name duration price' },
        { path: 'roomId', select: 'name type location' },
      ]);

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
        changes: {
          created: {
            patientId: appointment.patientId,
            professionalId: appointment.professionalId,
            serviceId: appointment.serviceId,
            startTime: appointment.startTime,
            endTime: appointment.endTime,
            status: appointment.status,
            source: appointment.source,
          },
        },
        business: {
          clinicalRelevant: true,
          containsPHI: true,
          dataClassification: 'restricted',
        },
        metadata: {
          source: 'appointment_controller',
          priority: 'high',
        },
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
   * Update appointment with validation
   */
  static async updateAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const { appointmentId } = req.params;
      const authUser = (req as AuthRequest).user!;
      const updateData = req.body as UpdateAppointmentRequest;

      // Find appointment
      const appointment = await Appointment.findOne({
        _id: appointmentId,
        deletedAt: null,
      });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found',
        });
      }

      // Check permissions
      if (authUser.role === 'professional' && 
          authUser.professionalId?.toString() !== appointment.professionalId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You can only update your own appointments',
        });
      }

      // Store original values for audit
      const originalValues = {
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        status: appointment.status,
        paymentStatus: appointment.paymentStatus,
        roomId: appointment.roomId,
      };

      // Update fields
      if (updateData.startTime) {
        appointment.startTime = new Date(updateData.startTime);
      }

      if (updateData.endTime) {
        appointment.endTime = new Date(updateData.endTime);
      }

      if (updateData.duration) {
        appointment.duration = updateData.duration;
      }

      if (updateData.status) {
        appointment.status = updateData.status;
      }

      if (updateData.paymentStatus) {
        appointment.paymentStatus = updateData.paymentStatus;
      }

      if (updateData.roomId !== undefined) {
        appointment.roomId = updateData.roomId ? new mongoose.Types.ObjectId(updateData.roomId) : undefined;
      }

      if (updateData.notes) {
        appointment.notes = { ...appointment.notes, ...updateData.notes };
      }

      await appointment.save();

      // Build changes object for audit
      const changes: any = {};
      Object.keys(originalValues).forEach((key) => {
        const originalValue = (originalValues as any)[key];
        const newValue = (appointment as any)[key];
        if (JSON.stringify(originalValue) !== JSON.stringify(newValue)) {
          changes[key] = { from: originalValue, to: newValue };
        }
      });

      // Log appointment update if there were changes
      if (Object.keys(changes).length > 0) {
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
          changes,
          business: {
            clinicalRelevant: true,
            containsPHI: true,
            dataClassification: 'restricted',
          },
          metadata: {
            source: 'appointment_controller',
            priority: 'high',
          },
          timestamp: new Date(),
        });
      }

      // Populate for response
      await appointment.populate([
        { path: 'patientId', select: 'name email phone' },
        { path: 'professionalId', select: 'name specialties' },
        { path: 'serviceId', select: 'name duration price' },
        { path: 'roomId', select: 'name type location' },
      ]);

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
   * Cancel appointment
   */
  static async cancelAppointment(req: Request, res: Response, next: NextFunction) {
    try {
      const { appointmentId } = req.params;
      const { reason } = req.body;
      const authUser = (req as AuthRequest).user!;

      const appointment = await Appointment.findOne({
        _id: appointmentId,
        deletedAt: null,
      });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found',
        });
      }

      // Check permissions
      if (authUser.role === 'professional' && 
          authUser.professionalId?.toString() !== appointment.professionalId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You can only cancel your own appointments',
        });
      }

      if (authUser.role === 'patient' && 
          authUser.patientId?.toString() !== appointment.patientId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You can only cancel your own appointments',
        });
      }

      // Update appointment status
      appointment.status = 'cancelled';
      if (reason) {
        if (!appointment.notes) {
          appointment.notes = {};
        }
        appointment.notes.adminNotes = (appointment.notes.adminNotes || '') + `\nCancelled: ${reason}`;
      }

      await appointment.save();

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
   * Get appointment statistics
   */
  static async getAppointmentStats(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user!;
      const { professionalId, startDate, endDate } = req.query;

      // Only admin, reception, and professionals can see stats
      if (authUser.role !== 'admin' && authUser.role !== 'reception' && authUser.role !== 'professional') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Insufficient permissions',
        });
      }

      // Build filter
      const filter: any = { deletedAt: null };
      
      if (authUser.role === 'professional' && authUser.professionalId) {
        filter.professionalId = authUser.professionalId;
      } else if (professionalId) {
        filter.professionalId = new mongoose.Types.ObjectId(professionalId as string);
      }

      if (startDate && endDate) {
        filter.startTime = {
          $gte: new Date(startDate as string),
          $lte: new Date(endDate as string),
        };
      }

      // Get statistics using aggregation
      const stats = await Appointment.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalAppointments: { $sum: 1 },
            pendingAppointments: {
              $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
            },
            confirmedAppointments: {
              $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
            },
            completedAppointments: {
              $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
            },
            cancelledAppointments: {
              $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] }
            },
            noShowAppointments: {
              $sum: { $cond: [{ $eq: ['$status', 'no_show'] }, 1, 0] }
            },
            totalRevenue: {
              $sum: '$pricing.totalAmount'
            },
            averageRevenue: {
              $avg: '$pricing.totalAmount'
            }
          }
        }
      ]);

      res.status(200).json({
        success: true,
        data: { stats: stats[0] || {} },
      });
    } catch (error) {
      logger.error('Get appointment stats error:', error);
      next(error);
    }
  }

  /**
   * Get upcoming appointments for reminders
   */
  static async getUpcomingAppointments(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user!;
      const { hours = '24' } = req.query;

      // Only admin and reception can see all upcoming appointments
      if (authUser.role !== 'admin' && authUser.role !== 'reception') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Insufficient permissions',
        });
      }

      const hoursNum = parseInt(hours as string, 10);
      const now = new Date();
      const futureTime = new Date(now.getTime() + hoursNum * 60 * 60 * 1000);

      const appointments = await Appointment.find({
        startTime: { $gte: now, $lte: futureTime },
        status: { $in: ['pending', 'confirmed'] },
        deletedAt: null,
      })
        .populate('patientId', 'name email phone')
        .populate('professionalId', 'name email')
        .sort({ startTime: 1 });

      res.status(200).json({
        success: true,
        data: { appointments },
      });
    } catch (error) {
      logger.error('Get upcoming appointments error:', error);
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

      const appointment = await Appointment.findOne({
        _id: appointmentId,
        deletedAt: null,
      });

      if (!appointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found',
        });
      }

      // Soft delete
      appointment.deletedAt = new Date();
      await appointment.save();

      // Log deletion
      await AuditLog.create({
        action: 'appointment_deleted',
        entityType: 'appointment',
        entityId: appointment._id.toString(),
        actorId: authUser._id,
        actorType: 'user',
        actorEmail: authUser.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'success',
        changes: {
          deletedAt: { from: null, to: new Date() },
        },
        business: {
          clinicalRelevant: true,
          containsPHI: true,
          dataClassification: 'restricted',
        },
        metadata: {
          source: 'appointment_controller',
          priority: 'high',
        },
        timestamp: new Date(),
      });

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

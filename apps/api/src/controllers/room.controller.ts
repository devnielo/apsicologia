import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Room, IRoomDocument } from '../models/Room.js';
import { Professional } from '../models/Professional.js';
import { AuditLog } from '../models/AuditLog.js';
import logger from '../config/logger.js';
import { AuthRequest } from '../middleware/auth.js';

interface CreateRoomRequest {
  name: string;
  type: 'physical' | 'virtual';
  description?: string;
  location?: string;
  capacity?: number;
  equipment?: string[];
  amenities?: string[];
  accessibility?: {
    wheelchairAccessible: boolean;
    hearingLoopAvailable: boolean;
    brailleSignage: boolean;
    notes?: string;
  };
  virtualConfig?: {
    platform: 'jitsi' | 'zoom' | 'teams' | 'meet' | 'custom';
    maxParticipants?: number;
    recordingEnabled?: boolean;
    waitingRoomEnabled?: boolean;
    passwordProtected?: boolean;
    customUrl?: string;
    settings?: Record<string, any>;
  };
  operatingHours?: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }[];
  bookingSettings?: {
    requiresApproval?: boolean;
    maxAdvanceBookingDays?: number;
    minBookingDuration?: number;
    maxBookingDuration?: number;
    bufferBetweenBookings?: number;
  };
}

interface UpdateRoomRequest {
  name?: string;
  description?: string;
  location?: string;
  capacity?: number;
  equipment?: string[];
  amenities?: string[];
  isActive?: boolean;
  accessibility?: Partial<CreateRoomRequest['accessibility']>;
  virtualConfig?: Partial<CreateRoomRequest['virtualConfig']>;
  operatingHours?: CreateRoomRequest['operatingHours'];
  bookingSettings?: Partial<CreateRoomRequest['bookingSettings']>;
}

interface RoomQuery {
  page?: string;
  limit?: string;
  search?: string;
  type?: 'physical' | 'virtual';
  isActive?: string;
  location?: string;
  minCapacity?: string;
  maxCapacity?: string;
  equipment?: string;
  accessibility?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  include?: string;
}

interface MaintenanceRequest {
  type: 'cleaning' | 'repair' | 'inspection' | 'upgrade' | 'other';
  description: string;
  scheduledDate: string;
  estimatedDuration?: number;
  assignedTo?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
}

export class RoomController {
  /**
   * Get all rooms with pagination and filtering
   */
  static async getRooms(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user!;
      const {
        page = '1',
        limit = '20',
        search,
        type,
        isActive,
        location,
        minCapacity,
        maxCapacity,
        equipment,
        accessibility,
        sortBy = 'name',
        sortOrder = 'asc',
        include,
      } = req.query as RoomQuery;

      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;

      // Build filter
      const filter: any = { deletedAt: null };

      // Apply filters based on query params
      if (search) {
        filter.$or = [
          { name: new RegExp(search, 'i') },
          { description: new RegExp(search, 'i') },
          { location: new RegExp(search, 'i') },
        ];
      }

      if (type) {
        filter.type = type;
      }

      if (isActive !== undefined) {
        filter.isActive = isActive === 'true';
      }

      if (location) {
        filter.location = new RegExp(location, 'i');
      }

      if (minCapacity || maxCapacity) {
        filter.capacity = {};
        if (minCapacity) filter.capacity.$gte = parseInt(minCapacity, 10);
        if (maxCapacity) filter.capacity.$lte = parseInt(maxCapacity, 10);
      }

      if (equipment) {
        filter.equipment = { $in: [new RegExp(equipment, 'i')] };
      }

      if (accessibility === 'wheelchair') {
        filter['accessibility.wheelchairAccessible'] = true;
      }

      // Apply role-based filtering
      if (authUser.role === 'professional') {
        // Professionals can only see rooms assigned to them or public rooms
        const professional = await Professional.findOne({ userId: authUser._id });
        if (professional) {
          filter.$or = [
            { _id: { $in: professional.assignedRooms } },
            { isPublic: true },
          ];
        }
      } else if (authUser.role === 'patient') {
        // Patients can only see public virtual rooms (for joining sessions)
        filter.type = 'virtual';
        filter.isActive = true;
        filter.isPublic = true;
      }

      // Build sort
      const sort: any = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Execute queries
      let query = Room.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum);

      // Add population based on include parameter
      if (include && authUser.role !== 'patient') {
        const includeFields = include.split(',');
        
        if (includeFields.includes('assignments')) {
          // Get professionals assigned to this room
          query = query.populate({
            path: 'assignedProfessionals',
            select: 'name title specialties',
            match: { isActive: true },
          });
        }
      }

      const [rooms, total] = await Promise.all([
        query.exec(),
        Room.countDocuments(filter),
      ]);

      // Filter sensitive data for patients
      const filteredRooms = rooms.map((room: any) => {
        const roomData = room.toObject();
        
        if (authUser.role === 'patient') {
          return {
            id: roomData._id,
            name: roomData.name,
            type: roomData.type,
            capacity: roomData.capacity,
            virtualConfig: roomData.type === 'virtual' ? {
              platform: roomData.virtualConfig?.platform,
              maxParticipants: roomData.virtualConfig?.maxParticipants,
            } : undefined,
          };
        }
        
        return roomData;
      });

      const totalPages = Math.ceil(total / limitNum);

      res.status(200).json({
        success: true,
        data: {
          rooms: filteredRooms,
          pagination: {
            currentPage: pageNum,
            totalPages,
            totalRooms: total,
            hasNext: pageNum < totalPages,
            hasPrev: pageNum > 1,
          },
        },
      });
    } catch (error) {
      logger.error('Get rooms error:', error);
      next(error);
    }
  }

  /**
   * Get room by ID with full details
   */
  static async getRoomById(req: Request, res: Response, next: NextFunction) {
    try {
      const { roomId } = req.params;
      const authUser = (req as AuthRequest).user!;
      const { include } = req.query;

      const room = await Room.findOne({ 
        _id: roomId, 
        deletedAt: null 
      });

      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found',
        });
      }

      // Check permissions
      let canAccess = authUser.role === 'admin' || authUser.role === 'reception';
      
      if (!canAccess && authUser.role === 'professional') {
        const professional = await Professional.findOne({ userId: authUser._id });
        canAccess = professional?.assignedRooms.includes(room._id as any) || room.isBookable;
      }
      
      if (!canAccess && authUser.role === 'patient') {
        canAccess = room.type === 'virtual' && room.isActive && room.isBookable;
      }

      if (!canAccess) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot access this room',
        });
      }

      let responseData: any = room.toObject();

      // Filter sensitive data for patients
      if (authUser.role === 'patient') {
        responseData = {
          id: responseData._id,
          name: responseData.name,
          type: responseData.type,
          capacity: responseData.capacity,
          virtualConfig: responseData.type === 'virtual' ? {
            platform: responseData.virtualConfig?.platform,
            maxParticipants: responseData.virtualConfig?.maxParticipants,
          } : undefined,
        };
      }

      // Optionally include additional data
      let additionalData: any = {};

      if (include && authUser.role !== 'patient') {
        const includeFields = include.toString().split(',');

        if (includeFields.includes('usage')) {
          // Get room usage statistics
          const { Appointment } = await import('../models/Appointment.js');
          
          const usageStats = await Appointment.aggregate([
            { 
              $match: { 
                roomId: new Types.ObjectId(roomId),
                deletedAt: null,
                startTime: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
              }
            },
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 },
                totalHours: { $sum: { $divide: ['$duration', 60] } },
              }
            }
          ]);

          additionalData.usageStats = usageStats;
        }

        if (includeFields.includes('assignments')) {
          // Get professionals assigned to this room
          const assignedProfessionals = await Professional.find({
            assignedRooms: new Types.ObjectId(roomId),
            isActive: true,
          }).select('name title specialties');

          additionalData.assignedProfessionals = assignedProfessionals;
        }

        if (includeFields.includes('schedule')) {
          // Get upcoming appointments in this room
          const { Appointment } = await import('../models/Appointment.js');
          
          const upcomingAppointments = await Appointment.find({
            roomId: new Types.ObjectId(roomId),
            startTime: { $gte: new Date() },
            status: { $in: ['pending', 'confirmed'] },
            deletedAt: null,
          })
            .sort({ startTime: 1 })
            .limit(10)
            .populate('professionalId', 'name')
            .populate('serviceId', 'name duration')
            .select('startTime endTime status');

          additionalData.upcomingAppointments = upcomingAppointments;
        }
      }

      res.status(200).json({
        success: true,
        data: {
          room: responseData,
          ...additionalData,
        },
      });
    } catch (error) {
      logger.error('Get room by ID error:', error);
      next(error);
    }
  }

  /**
   * Create new room
   */
  static async createRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user!;

      // Only admin can create rooms
      if (authUser.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Only administrators can create rooms',
        });
      }

      const roomData = req.body as CreateRoomRequest;

      // Create room
      const room = new Room({
        name: roomData.name,
        type: roomData.type,
        description: roomData.description,
        location: roomData.location,
        capacity: roomData.capacity || (roomData.type === 'virtual' ? 50 : 2),
        equipment: roomData.equipment || [],
        amenities: roomData.amenities || [],
        accessibility: {
          wheelchairAccessible: roomData.accessibility?.wheelchairAccessible ?? false,
          hearingLoopAvailable: roomData.accessibility?.hearingLoopAvailable ?? false,
          brailleSignage: roomData.accessibility?.brailleSignage ?? false,
          notes: roomData.accessibility?.notes,
        },
        virtualConfig: roomData.type === 'virtual' ? {
          platform: roomData.virtualConfig?.platform || 'jitsi',
          maxParticipants: roomData.virtualConfig?.maxParticipants || 50,
          recordingEnabled: roomData.virtualConfig?.recordingEnabled ?? false,
          waitingRoomEnabled: roomData.virtualConfig?.waitingRoomEnabled ?? false,
          passwordProtected: roomData.virtualConfig?.passwordProtected ?? false,
          customUrl: roomData.virtualConfig?.customUrl,
          settings: roomData.virtualConfig?.settings || {},
        } : undefined,
        operatingHours: roomData.operatingHours || [
          // Default 24/7 for virtual rooms, business hours for physical
          ...(roomData.type === 'virtual' ? 
            Array.from({ length: 7 }, (_, i) => ({
              dayOfWeek: i,
              startTime: '00:00',
              endTime: '23:59',
              isAvailable: true,
            })) :
            [
              { dayOfWeek: 1, startTime: '08:00', endTime: '18:00', isAvailable: true },
              { dayOfWeek: 2, startTime: '08:00', endTime: '18:00', isAvailable: true },
              { dayOfWeek: 3, startTime: '08:00', endTime: '18:00', isAvailable: true },
              { dayOfWeek: 4, startTime: '08:00', endTime: '18:00', isAvailable: true },
              { dayOfWeek: 5, startTime: '08:00', endTime: '18:00', isAvailable: true },
              { dayOfWeek: 6, startTime: '09:00', endTime: '13:00', isAvailable: false },
              { dayOfWeek: 0, startTime: '09:00', endTime: '13:00', isAvailable: false },
            ]
          )
        ],
        bookingSettings: {
          requiresApproval: roomData.bookingSettings?.requiresApproval ?? false,
          maxAdvanceBookingDays: roomData.bookingSettings?.maxAdvanceBookingDays ?? 30,
          minBookingDuration: roomData.bookingSettings?.minBookingDuration ?? 30,
          maxBookingDuration: roomData.bookingSettings?.maxBookingDuration ?? 240,
          bufferBetweenBookings: roomData.bookingSettings?.bufferBetweenBookings ?? 10,
        },
        maintenance: {
          lastCleaned: new Date(),
          lastInspected: new Date(),
          scheduledMaintenance: [],
          maintenanceHistory: [],
        },
        usage: {
          totalBookings: 0,
          totalHours: 0,
          averageRating: 0,
          lastUsed: null,
        },
        isActive: true,
        isPublic: roomData.type === 'virtual',
      });

      await room.save();

      // Log room creation
      await AuditLog.create({
        action: 'room_created',
        entityType: 'room',
        entityId: room._id.toString(),
        actorId: authUser._id,
        actorType: 'user',
        actorEmail: authUser.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'success',
        changes: {
          created: {
            name: room.name,
            type: room.type,
            location: room.location,
            capacity: room.capacity,
          },
        },
        security: {
          riskLevel: 'low',
          authMethod: 'jwt',
          compliance: {
            hipaaRelevant: false,
            gdprRelevant: false,
            requiresRetention: false,
          },
        },
        business: {
          clinicalRelevant: true,
          containsPHI: false,
          dataClassification: 'internal',
        },
        metadata: {
          source: 'room_controller',
          priority: 'low',
        },
        timestamp: new Date(),
      });

      res.status(201).json({
        success: true,
        message: 'Room created successfully',
        data: { room },
      });
    } catch (error) {
      logger.error('Create room error:', error);
      next(error);
    }
  }

  /**
   * Update room
   */
  static async updateRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const { roomId } = req.params;
      const authUser = (req as AuthRequest).user!;
      const updateData = req.body as UpdateRoomRequest;

      // Only admin can update rooms
      if (authUser.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Only administrators can update rooms',
        });
      }

      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found',
        });
      }

      // Store original data for audit
      const originalData = room.toObject();

      // Apply updates
      if (updateData.name) room.name = updateData.name;
      if (updateData.description !== undefined) room.description = updateData.description;
      if (updateData.location !== undefined) room.location = updateData.location as any;
      if (updateData.capacity) room.capacity = updateData.capacity;
      if (updateData.equipment) room.equipment = updateData.equipment;
      if (updateData.amenities) room.amenities = updateData.amenities;
      if (updateData.isActive !== undefined) room.isActive = updateData.isActive;

      // Update accessibility
      if (updateData.accessibility) {
        room.accessibility = { ...room.accessibility, ...updateData.accessibility };
      }

      // Update virtual config
      if (updateData.virtualConfig && room.type === 'virtual') {
        const updatedVirtualConfig = { ...room.virtualConfig, ...updateData.virtualConfig };
        if (updatedVirtualConfig.platform && updatedVirtualConfig.waitingRoom !== undefined && updatedVirtualConfig.recordingEnabled !== undefined && updatedVirtualConfig.maxParticipants !== undefined) {
          room.virtualConfig = updatedVirtualConfig as any;
        }
      }

      // Update operating hours
      if (updateData.operatingHours) {
        room.operatingHours = updateData.operatingHours;
      }

      // Update booking settings
      if (updateData.bookingSettings) {
        // Note: bookingSettings property doesn't exist in Room model, skipping update
      }

      await room.save();

      // Log room update
      await AuditLog.create({
        action: 'room_updated',
        entityType: 'room',
        entityId: room._id.toString(),
        actorId: authUser._id,
        actorType: 'user',
        actorEmail: authUser.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'success',
        changes: {
          before: originalData,
          after: room.toObject(),
          fieldsChanged: Object.keys(updateData),
        },
        security: {
          riskLevel: 'low',
          authMethod: 'jwt',
          compliance: {
            hipaaRelevant: false,
            gdprRelevant: false,
            requiresRetention: false,
          },
        },
        business: {
          clinicalRelevant: true,
          containsPHI: false,
          dataClassification: 'internal',
        },
        metadata: {
          source: 'room_controller',
          priority: 'low',
        },
        timestamp: new Date(),
      });

      res.status(200).json({
        success: true,
        message: 'Room updated successfully',
        data: { room },
      });
    } catch (error) {
      logger.error('Update room error:', error);
      next(error);
    }
  }

  /**
   * Schedule maintenance
   */
  static async scheduleMaintenance(req: Request, res: Response, next: NextFunction) {
    try {
      const { roomId } = req.params;
      const authUser = (req as AuthRequest).user!;
      const maintenanceData = req.body as MaintenanceRequest;

      // Only admin and reception can schedule maintenance
      if (authUser.role !== 'admin' && authUser.role !== 'reception') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Only administrators and reception can schedule maintenance',
        });
      }

      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found',
        });
      }

      // Add maintenance to schedule
      const maintenance = {
        startDate: new Date(maintenanceData.scheduledDate),
        endDate: new Date(new Date(maintenanceData.scheduledDate).getTime() + (maintenanceData.estimatedDuration || 60) * 60000),
        reason: `${maintenanceData.type}: ${maintenanceData.description}`,
        isRecurring: false,
      };

      if (!room.maintenanceSchedule) room.maintenanceSchedule = [];
      room.maintenanceSchedule.push(maintenance);
      await room.save();

      res.status(200).json({
        success: true,
        message: 'Maintenance scheduled successfully',
        data: { maintenance },
      });
    } catch (error) {
      logger.error('Schedule maintenance error:', error);
      next(error);
    }
  }

  /**
   * Get room availability
   */
  static async getRoomAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const { roomId } = req.params;
      const { startDate, endDate } = req.query;
      const authUser = (req as AuthRequest).user!;

      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required',
        });
      }

      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found',
        });
      }

      const start = new Date(startDate as string);
      const end = new Date(endDate as string);

      // Get existing appointments
      const { Appointment } = await import('../models/Appointment.js');
      
      const appointments = await Appointment.find({
        roomId: new Types.ObjectId(roomId),
        startTime: { $gte: start, $lte: end },
        status: { $nin: ['cancelled', 'no_show'] },
        deletedAt: null,
      }).sort({ startTime: 1 });

      // Get scheduled maintenance
      const scheduledMaintenance = room.maintenanceSchedule?.filter(
        (m: any) => m.scheduledDate >= start && m.scheduledDate <= end && m.status === 'scheduled'
      );

      // Calculate available time slots
      const availability = [];
      const currentDate = new Date(start);

      while (currentDate <= end) {
        const dayOfWeek = currentDate.getDay();
        const operatingHours = room.operatingHours?.find(
          (oh: any) => oh.dayOfWeek === dayOfWeek && oh.isAvailable
        );

        if (operatingHours) {
          availability.push({
            date: new Date(currentDate),
            dayOfWeek,
            startTime: operatingHours.startTime,
            endTime: operatingHours.endTime,
            isAvailable: true,
            conflicts: appointments.filter((apt: any) => 
              apt.startTime.toDateString() === currentDate.toDateString()
            ),
            maintenance: scheduledMaintenance?.filter((m: any) => 
              m.scheduledDate.toDateString() === currentDate.toDateString()
            ),
          });
        } else {
          availability.push({
            date: new Date(currentDate),
            dayOfWeek,
            isAvailable: false,
            reason: 'Not in operating hours',
          });
        }

        currentDate.setDate(currentDate.getDate() + 1);
      }

      res.status(200).json({
        success: true,
        data: {
          room: {
            id: room._id,
            name: room.name,
            type: room.type,
            capacity: room.capacity,
          },
          dateRange: { startDate, endDate },
          availability,
        },
      });
    } catch (error) {
      logger.error('Get room availability error:', error);
      next(error);
    }
  }

  /**
   * Get room statistics
   */
  static async getRoomStats(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user!;

      // Only admin and reception can view room statistics
      if (authUser.role !== 'admin' && authUser.role !== 'reception') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot view room statistics',
        });
      }

      const [totalStats, typeStats, utilizationStats] = await Promise.all([
        // Total room statistics
        Room.aggregate([
          { $match: { deletedAt: null } },
          {
            $group: {
              _id: null,
              totalRooms: { $sum: 1 },
              activeRooms: { $sum: { $cond: ['$isActive', 1, 0] } },
              physicalRooms: { $sum: { $cond: [{ $eq: ['$type', 'physical'] }, 1, 0] } },
              virtualRooms: { $sum: { $cond: [{ $eq: ['$type', 'virtual'] }, 1, 0] } },
              totalCapacity: { $sum: '$capacity' },
              averageCapacity: { $avg: '$capacity' },
              accessibleRooms: { $sum: { $cond: ['$accessibility.wheelchairAccessible', 1, 0] } },
            }
          }
        ]),

        // Statistics by type
        Room.aggregate([
          { $match: { deletedAt: null, isActive: true } },
          {
            $group: {
              _id: '$type',
              count: { $sum: 1 },
              totalCapacity: { $sum: '$capacity' },
              averageCapacity: { $avg: '$capacity' },
              totalUsage: { $sum: '$usage.totalHours' },
            }
          }
        ]),

        // Room utilization
        Room.aggregate([
          { $match: { deletedAt: null, isActive: true } },
          { $sort: { 'usage.totalHours': -1 } },
          { $limit: 10 },
          {
            $project: {
              name: 1,
              type: 1,
              capacity: 1,
              'usage.totalBookings': 1,
              'usage.totalHours': 1,
              'usage.averageRating': 1,
            }
          }
        ]),
      ]);

      res.status(200).json({
        success: true,
        data: {
          overview: totalStats[0] || {},
          byType: typeStats,
          mostUtilized: utilizationStats,
        },
      });
    } catch (error) {
      logger.error('Get room stats error:', error);
      next(error);
    }
  }

  /**
   * Soft delete room
   */
  static async deleteRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const { roomId } = req.params;
      const authUser = (req as AuthRequest).user!;

      // Only admin can delete rooms
      if (authUser.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Only administrators can delete rooms',
        });
      }

      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found',
        });
      }

      // Check if room has active appointments
      const { Appointment } = await import('../models/Appointment.js');
      const activeAppointments = await Appointment.countDocuments({
        roomId: new Types.ObjectId(roomId),
        status: { $in: ['pending', 'confirmed', 'in_progress'] },
        deletedAt: null,
      });

      if (activeAppointments > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete room with ${activeAppointments} active appointments. Please reschedule or complete them first.`,
        });
      }

      // Soft delete
      room.deletedAt = new Date();
      room.isActive = false;
      await room.save();

      // Remove room from professional assignments
      await Professional.updateMany(
        { assignedRooms: room._id },
        { $pull: { assignedRooms: room._id } }
      );

      // Log room deletion
      await AuditLog.create({
        action: 'room_deleted',
        entityType: 'room',
        entityId: room._id.toString(),
        actorId: authUser._id,
        actorType: 'user',
        actorEmail: authUser.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'success',
        changes: {
          deletedAt: new Date(),
          roomName: room.name,
          roomType: room.type,
          activeAppointmentsChecked: true,
        },
        security: {
          riskLevel: 'medium',
          authMethod: 'jwt',
          compliance: {
            hipaaRelevant: false,
            gdprRelevant: false,
            requiresRetention: false,
          },
        },
        business: {
          clinicalRelevant: true,
          containsPHI: false,
          dataClassification: 'internal',
        },
        metadata: {
          source: 'room_controller',
          priority: 'medium',
        },
        timestamp: new Date(),
      });

      res.status(200).json({
        success: true,
        message: 'Room deleted successfully',
      });
    } catch (error) {
      logger.error('Delete room error:', error);
      next(error);
    }
  }
}

export default RoomController;

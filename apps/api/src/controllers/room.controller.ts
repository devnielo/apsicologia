import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Room, IRoomDocument } from '../models/Room.js';
import { Appointment } from '../models/Appointment.js';
import { AuditLog } from '../models/AuditLog.js';
import logger from '../config/logger.js';
import { AuthRequest } from '../middleware/auth.js';

interface CreateRoomRequest {
  name: string;
  description?: string;
  type: 'physical' | 'virtual';
  capacity: number;
  location?: string;
  floor?: string;
  building?: string;
  isActive?: boolean;
  features?: string[];
  equipment?: string[];
  accessibility?: {
    wheelchairAccessible: boolean;
    hearingLoop: boolean;
    visualAids: boolean;
  };
  virtualConfig?: {
    platform: 'jitsi' | 'zoom' | 'teams' | 'custom';
    roomId?: string;
    meetingUrl?: string;
    accessCode?: string;
    settings?: {
      recordingEnabled: boolean;
      chatEnabled: boolean;
      screenSharingEnabled: boolean;
      waitingRoomEnabled: boolean;
      maxParticipants: number;
    };
  };
  bookingRules?: {
    minBookingDuration: number;
    maxBookingDuration: number;
    bufferBetweenBookings: number;
    allowBackToBack: boolean;
    advanceBookingDays: number;
  };
  contactInfo?: {
    phone?: string;
    email?: string;
    emergencyContact?: string;
  };
  metadata?: {
    color?: string;
    icon?: string;
    tags?: string[];
  };
}

interface UpdateRoomRequest {
  name?: string;
  description?: string;
  type?: 'physical' | 'virtual';
  capacity?: number;
  location?: string;
  floor?: string;
  building?: string;
  isActive?: boolean;
  features?: string[];
  equipment?: string[];
  accessibility?: {
    wheelchairAccessible: boolean;
    hearingLoop: boolean;
    visualAids: boolean;
  };
  virtualConfig?: {
    platform: 'jitsi' | 'zoom' | 'teams' | 'custom';
    roomId?: string;
    meetingUrl?: string;
    accessCode?: string;
    settings?: {
      recordingEnabled: boolean;
      chatEnabled: boolean;
      screenSharingEnabled: boolean;
      waitingRoomEnabled: boolean;
      maxParticipants: number;
    };
  };
  bookingRules?: {
    minBookingDuration: number;
    maxBookingDuration: number;
    bufferBetweenBookings: number;
    allowBackToBack: boolean;
    advanceBookingDays: number;
  };
  contactInfo?: {
    phone?: string;
    email?: string;
    emergencyContact?: string;
  };
  metadata?: {
    color?: string;
    icon?: string;
    tags?: string[];
  };
}

interface RoomQuery {
  page?: string;
  limit?: string;
  search?: string;
  type?: 'physical' | 'virtual';
  isActive?: string;
  floor?: string;
  building?: string;
  capacity?: string;
  available?: string; // Check availability for specific date range
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
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
        isActive = 'true',
        floor,
        building,
        capacity,
        available,
        startDate,
        endDate,
        sortBy = 'name',
        sortOrder = 'asc',
      } = req.query as RoomQuery;

      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;

      // Build filter
      const filter: any = {};

      // Apply query filters
      if (isActive !== 'all') {
        filter.isActive = isActive === 'true';
      }

      if (type) {
        filter.type = type;
      }

      if (floor) {
        filter.floor = floor;
      }

      if (building) {
        filter.building = { $regex: building, $options: 'i' };
      }

      if (capacity) {
        const capacityNum = parseInt(capacity, 10);
        filter.capacity = { $gte: capacityNum };
      }

      if (search) {
        filter.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } },
          { building: { $regex: search, $options: 'i' } },
          { features: { $regex: search, $options: 'i' } },
          { 'metadata.tags': { $regex: search, $options: 'i' } },
        ];
      }

      // Build sort
      const sort: any = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Execute base query
      let roomsQuery = Room.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limitNum);

      const [rooms, total] = await Promise.all([
        roomsQuery.exec(),
        Room.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / limitNum);

      // If availability check is requested
      let roomsWithAvailability = rooms;
      if (available === 'true' && startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);

        const roomsAvailability = await Promise.all(
          rooms.map(async (room: any) => {
            // Check for overlapping appointments
            const overlappingAppointments = await Appointment.countDocuments({
              roomId: room._id,
              $or: [
                {
                  startTime: { $lt: end },
                  endTime: { $gt: start },
                },
              ],
              status: { $in: ['scheduled', 'confirmed'] },
            });

            const roomObj = room.toObject();
            roomObj.isAvailable = overlappingAppointments === 0;
            return roomObj;
          })
        );

        roomsWithAvailability = roomsAvailability;
      }

      res.status(200).json({
        success: true,
        data: {
          rooms: roomsWithAvailability,
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

      const room = await Room.findById(roomId);

      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found',
        });
      }

      // Get room usage statistics
      const [
        totalAppointments,
        activeAppointments,
        upcomingAppointments,
        utilizationStats,
      ] = await Promise.all([
        Appointment.countDocuments({ roomId: room._id }),
        Appointment.countDocuments({
          roomId: room._id,
          status: { $in: ['scheduled', 'confirmed'] },
        }),
        Appointment.countDocuments({
          roomId: room._id,
          startTime: { $gte: new Date() },
          status: { $in: ['scheduled', 'confirmed'] },
        }),
        Appointment.aggregate([
          {
            $match: {
              roomId: room._id,
              createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
            },
          },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$startTime' },
              },
              count: { $sum: 1 },
              duration: {
                $sum: { $divide: [{ $subtract: ['$endTime', '$startTime'] }, 60000] }, // minutes
              },
            },
          },
          { $sort: { _id: 1 } },
        ]),
      ]);

      res.status(200).json({
        success: true,
        data: {
          room,
          stats: {
            totalAppointments,
            activeAppointments,
            upcomingAppointments,
            utilizationStats,
          },
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
      const roomData = req.body as CreateRoomRequest;

      // Only admin can create rooms
      if (authUser.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Only administrators can create rooms',
        });
      }

      // Check if room with same name already exists
      const existingRoom = await Room.findOne({
        name: roomData.name.trim(),
        isActive: true,
      });
      if (existingRoom) {
        return res.status(409).json({
          success: false,
          message: 'Room already exists with this name',
        });
      }

      // Validate virtual room configuration
      if (roomData.type === 'virtual' && roomData.virtualConfig) {
        const { platform, roomId } = roomData.virtualConfig;
        
        if (platform === 'jitsi' && roomId) {
          // Check if Jitsi room ID is already in use
          const existingJitsiRoom = await Room.findOne({
            'virtualConfig.platform': 'jitsi',
            'virtualConfig.roomId': roomId,
            isActive: true,
          });
          
          if (existingJitsiRoom) {
            return res.status(409).json({
              success: false,
              message: 'Jitsi room ID is already in use',
            });
          }
        }
      }

      // Create room
      const room = new Room({
        ...roomData,
        name: roomData.name.trim(),
        isActive: roomData.isActive ?? true,
        features: roomData.features || [],
        equipment: roomData.equipment || [],
        accessibility: {
          wheelchairAccessible: roomData.accessibility?.wheelchairAccessible ?? false,
          hearingLoop: roomData.accessibility?.hearingLoop ?? false,
          visualAids: roomData.accessibility?.visualAids ?? false,
        },
        bookingRules: roomData.bookingRules || {
          minBookingDuration: 30,
          maxBookingDuration: 480,
          bufferBetweenBookings: 0,
          allowBackToBack: true,
          advanceBookingDays: 30,
        },
        metadata: {
          color: roomData.metadata?.color || '#10B981',
          icon: roomData.metadata?.icon || 'building',
          tags: roomData.metadata?.tags || [],
        },
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
            capacity: room.capacity,
            location: room.location,
            isActive: room.isActive,
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
   * Update room information
   */
  static async updateRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const { roomId } = req.params;
      const authUser = (req as AuthRequest).user!;
      const updateData = req.body as UpdateRoomRequest;

      // Find room
      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found',
        });
      }

      // Only admin can update rooms
      if (authUser.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Only administrators can update rooms',
        });
      }

      // Store original values for audit
      const originalValues = {
        name: room.name,
        type: room.type,
        capacity: room.capacity,
        location: room.location,
        isActive: room.isActive,
      };

      // Check name uniqueness if changing
      if (updateData.name && updateData.name.trim() !== room.name) {
        const existingRoom = await Room.findOne({
          name: updateData.name.trim(),
          isActive: true,
          _id: { $ne: roomId },
        });
        if (existingRoom) {
          return res.status(409).json({
            success: false,
            message: 'Another room already exists with this name',
          });
        }
      }

      // Validate virtual room configuration if updating
      if (updateData.type === 'virtual' && updateData.virtualConfig) {
        const { platform, roomId: virtRoomId } = updateData.virtualConfig;
        
        if (platform === 'jitsi' && virtRoomId) {
          const existingJitsiRoom = await Room.findOne({
            'virtualConfig.platform': 'jitsi',
            'virtualConfig.roomId': virtRoomId,
            isActive: true,
            _id: { $ne: roomId },
          });
          
          if (existingJitsiRoom) {
            return res.status(409).json({
              success: false,
              message: 'Jitsi room ID is already in use',
            });
          }
        }
      }

      // Update room fields
      Object.keys(updateData).forEach((key) => {
        if (updateData[key as keyof UpdateRoomRequest] !== undefined) {
          if (key === 'name') {
            (room as any)[key] = updateData.name?.trim();
          } else {
            (room as any)[key] = updateData[key as keyof UpdateRoomRequest];
          }
        }
      });

      await room.save();

      // Build changes object for audit
      const changes: any = {};
      Object.keys(originalValues).forEach((key) => {
        const originalValue = (originalValues as any)[key];
        const newValue = (room as any)[key];
        if (JSON.stringify(originalValue) !== JSON.stringify(newValue)) {
          changes[key] = { from: originalValue, to: newValue };
        }
      });

      // Log room update if there were changes
      if (Object.keys(changes).length > 0) {
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
          changes,
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
      }

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
   * Deactivate room
   */
  static async deactivateRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const { roomId } = req.params;
      const authUser = (req as AuthRequest).user!;

      // Only admin can deactivate rooms
      if (authUser.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Only administrators can deactivate rooms',
        });
      }

      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found',
        });
      }

      if (!room.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Room is already deactivated',
        });
      }

      // Check if room has upcoming appointments
      const upcomingAppointments = await Appointment.countDocuments({
        roomId: room._id,
        startTime: { $gte: new Date() },
        status: { $in: ['scheduled', 'confirmed'] },
      });

      if (upcomingAppointments > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot deactivate room with ${upcomingAppointments} upcoming appointments. Please reschedule them first.`,
        });
      }

      room.isActive = false;
      await room.save();

      // Log room deactivation
      await AuditLog.create({
        action: 'room_deactivated',
        entityType: 'room',
        entityId: room._id.toString(),
        actorId: authUser._id,
        actorType: 'user',
        actorEmail: authUser.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'success',
        changes: {
          isActive: { from: true, to: false },
        },
        business: {
          clinicalRelevant: true,
          containsPHI: false,
          dataClassification: 'internal',
        },
        metadata: {
          source: 'room_controller',
          priority: 'high',
        },
        timestamp: new Date(),
      });

      res.status(200).json({
        success: true,
        message: 'Room deactivated successfully',
      });
    } catch (error) {
      logger.error('Deactivate room error:', error);
      next(error);
    }
  }

  /**
   * Reactivate room
   */
  static async reactivateRoom(req: Request, res: Response, next: NextFunction) {
    try {
      const { roomId } = req.params;
      const authUser = (req as AuthRequest).user!;

      // Only admin can reactivate rooms
      if (authUser.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Only administrators can reactivate rooms',
        });
      }

      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found',
        });
      }

      if (room.isActive) {
        return res.status(400).json({
          success: false,
          message: 'Room is already active',
        });
      }

      room.isActive = true;
      await room.save();

      res.status(200).json({
        success: true,
        message: 'Room reactivated successfully',
      });
    } catch (error) {
      logger.error('Reactivate room error:', error);
      next(error);
    }
  }

  /**
   * Get room availability for specific date range
   */
  static async getRoomAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const { roomId } = req.params;
      const { startDate, endDate } = req.query;

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

      // Get all appointments in the date range
      const appointments = await Appointment.find({
        roomId: room._id,
        $or: [
          {
            startTime: { $lt: end },
            endTime: { $gt: start },
          },
        ],
        status: { $in: ['scheduled', 'confirmed'] },
      })
        .populate('patientId', 'name email')
        .populate('professionalId', 'name')
        .populate('serviceId', 'name duration')
        .sort({ startTime: 1 });

      // Calculate available slots
      const totalMinutes = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60));
      const bookedMinutes = appointments.reduce((total, apt) => {
        const aptStart = new Date(Math.max(apt.startTime.getTime(), start.getTime()));
        const aptEnd = new Date(Math.min(apt.endTime.getTime(), end.getTime()));
        return total + Math.max(0, (aptEnd.getTime() - aptStart.getTime()) / (1000 * 60));
      }, 0);

      const availableMinutes = totalMinutes - bookedMinutes;
      const utilizationRate = totalMinutes > 0 ? (bookedMinutes / totalMinutes) * 100 : 0;

      res.status(200).json({
        success: true,
        data: {
          room: {
            id: room._id,
            name: room.name,
            type: room.type,
            capacity: room.capacity,
          },
          period: {
            start,
            end,
            totalMinutes,
          },
          availability: {
            isAvailable: availableMinutes > 0,
            availableMinutes,
            bookedMinutes,
            utilizationRate: Math.round(utilizationRate * 100) / 100,
          },
          appointments: appointments.map((apt) => ({
            id: apt._id,
            start: apt.startTime,
            end: apt.endTime,
            patient: apt.patientId,
            professional: apt.professionalId,
            service: apt.serviceId,
            status: apt.status,
          })),
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

      // Only admin and reception can see comprehensive stats
      if (authUser.role !== 'admin' && authUser.role !== 'reception') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Insufficient permissions',
        });
      }

      const [
        totalRooms,
        activeRooms,
        physicalRooms,
        virtualRooms,
        roomsByCapacity,
        roomsByFloor,
        mostUsedRooms,
        utilizationStats,
      ] = await Promise.all([
        Room.countDocuments(),
        Room.countDocuments({ isActive: true }),
        Room.countDocuments({ isActive: true, type: 'physical' }),
        Room.countDocuments({ isActive: true, type: 'virtual' }),
        Room.aggregate([
          { $match: { isActive: true } },
          {
            $bucket: {
              groupBy: '$capacity',
              boundaries: [1, 5, 10, 20, 50],
              default: '50+',
              output: {
                count: { $sum: 1 },
              },
            },
          },
        ]),
        Room.aggregate([
          { $match: { isActive: true, type: 'physical' } },
          { $group: { _id: '$floor', count: { $sum: 1 } } },
          { $sort: { _id: 1 } },
        ]),
        Appointment.aggregate([
          {
            $match: {
              status: { $in: ['completed', 'confirmed'] },
              createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }, // Last 30 days
            },
          },
          { $group: { _id: '$roomId', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from: 'rooms',
              localField: '_id',
              foreignField: '_id',
              as: 'room',
            },
          },
          { $unwind: '$room' },
          {
            $project: {
              roomName: '$room.name',
              roomType: '$room.type',
              appointmentCount: '$count',
            },
          },
        ]),
        Room.aggregate([
          { $match: { isActive: true } },
          {
            $lookup: {
              from: 'appointments',
              let: { roomId: '$_id' },
              pipeline: [
                {
                  $match: {
                    $expr: { $eq: ['$roomId', '$$roomId'] },
                    status: { $in: ['completed', 'confirmed'] },
                    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
                  },
                },
                {
                  $group: {
                    _id: null,
                    totalTime: {
                      $sum: { $divide: [{ $subtract: ['$endTime', '$startTime'] }, 60000] },
                    }, // minutes
                    count: { $sum: 1 },
                  },
                },
              ],
              as: 'usage',
            },
          },
          {
            $project: {
              name: 1,
              type: 1,
              capacity: 1,
              utilizationMinutes: { $ifNull: [{ $arrayElemAt: ['$usage.totalTime', 0] }, 0] },
              appointmentCount: { $ifNull: [{ $arrayElemAt: ['$usage.count', 0] }, 0] },
            },
          },
        ]),
      ]);

      const stats = {
        total: totalRooms,
        active: activeRooms,
        inactive: totalRooms - activeRooms,
        byType: {
          physical: physicalRooms,
          virtual: virtualRooms,
        },
        byCapacity: roomsByCapacity,
        byFloor: roomsByFloor,
        mostUsed: mostUsedRooms,
        utilization: utilizationStats,
      };

      res.status(200).json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      logger.error('Get room stats error:', error);
      next(error);
    }
  }

  /**
   * Generate Jitsi meeting link for virtual room
   */
  static async generateJitsiLink(req: Request, res: Response, next: NextFunction) {
    try {
      const { roomId } = req.params;
      const authUser = (req as AuthRequest).user!;

      const room = await Room.findById(roomId);
      if (!room) {
        return res.status(404).json({
          success: false,
          message: 'Room not found',
        });
      }

      if (room.type !== 'virtual') {
        return res.status(400).json({
          success: false,
          message: 'Room is not a virtual room',
        });
      }

      if (!room.virtualConfig || room.virtualConfig.platform !== 'jitsi') {
        return res.status(400).json({
          success: false,
          message: 'Room is not configured for Jitsi',
        });
      }

      // Generate unique meeting room name
      const meetingRoomId = room.virtualConfig.roomId || `apsicologia-${room._id.toString().slice(-8)}`;
      const jitsiBaseUrl = process.env.JITSI_BASE_URL || 'https://meet.jit.si';
      const meetingUrl = `${jitsiBaseUrl}/${meetingRoomId}`;

      // Update room with meeting URL if not set
      if (!room.virtualConfig.meetingUrl) {
        room.virtualConfig.meetingUrl = meetingUrl;
        room.virtualConfig.roomId = meetingRoomId;
        await room.save();
      }

      res.status(200).json({
        success: true,
        data: {
          meetingUrl,
          roomId: meetingRoomId,
          settings: room.virtualConfig.settings,
        },
      });
    } catch (error) {
      logger.error('Generate Jitsi link error:', error);
      next(error);
    }
  }
}

export default RoomController;

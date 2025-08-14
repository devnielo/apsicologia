import { Router } from 'express';
import RoomController from '../controllers/room.controller.js';
import { authenticate } from '../middleware/auth.js';

const router: Router = Router();

/**
 * @route   GET /api/v1/rooms
 * @desc    Get all rooms with pagination and filtering
 * @access  Private (All roles with different access levels)
 * @query   page, limit, search, type, isActive, location, minCapacity, maxCapacity, equipment, accessibility, sortBy, sortOrder, include
 */
router.get(
  '/',
  authenticate,
  RoomController.getRooms
);

/**
 * @route   GET /api/v1/rooms/stats
 * @desc    Get room statistics
 * @access  Private (Admin, Reception only)
 */
router.get(
  '/stats',
  authenticate,
  RoomController.getRoomStats
);

/**
 * @route   GET /api/v1/rooms/:roomId
 * @desc    Get room by ID with full details
 * @access  Private (All roles with access restrictions)
 * @params  roomId
 * @query   include - Optional: usage, assignments, schedule
 */
router.get(
  '/:roomId',
  authenticate,
  RoomController.getRoomById
);

/**
 * @route   GET /api/v1/rooms/:roomId/availability
 * @desc    Get room availability for a date range
 * @access  Private (All roles)
 * @params  roomId
 * @query   startDate, endDate (required)
 */
router.get(
  '/:roomId/availability',
  authenticate,
  RoomController.getRoomAvailability
);

/**
 * @route   POST /api/v1/rooms
 * @desc    Create new room
 * @access  Private (Admin only)
 * @body    Complete room data
 */
router.post(
  '/',
  authenticate,
  RoomController.createRoom
);

/**
 * @route   PUT /api/v1/rooms/:roomId
 * @desc    Update room details
 * @access  Private (Admin only)
 * @params  roomId
 * @body    Partial room data
 */
router.put(
  '/:roomId',
  authenticate,
  RoomController.updateRoom
);

/**
 * @route   POST /api/v1/rooms/:roomId/maintenance
 * @desc    Schedule room maintenance
 * @access  Private (Admin, Reception only)
 * @params  roomId
 * @body    Maintenance details
 */
router.post(
  '/:roomId/maintenance',
  authenticate,
  RoomController.scheduleMaintenance
);

/**
 * @route   DELETE /api/v1/rooms/:roomId
 * @desc    Soft delete room (admin only)
 * @access  Private (Admin only)
 * @params  roomId
 */
router.delete(
  '/:roomId',
  authenticate,
  RoomController.deleteRoom
);

export default router;

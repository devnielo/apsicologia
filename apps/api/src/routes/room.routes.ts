import { Router } from 'express';
import { body, param, query } from 'express-validator';
import RoomController from '../controllers/room.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router: Router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route GET /rooms
 * @desc Get all rooms with pagination and filtering
 * @access Admin, Reception, Professional (limited view)
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search').optional().isLength({ min: 1, max: 100 }).withMessage('Search must be 1-100 characters'),
    query('type').optional().isIn(['physical', 'virtual']).withMessage('Type must be physical or virtual'),
    query('isActive').optional().isIn(['true', 'false', 'all']).withMessage('IsActive must be true, false, or all'),
    query('floor').optional().isLength({ min: 1, max: 10 }).withMessage('Floor must be 1-10 characters'),
    query('building').optional().isLength({ min: 1, max: 100 }).withMessage('Building must be 1-100 characters'),
    query('capacity').optional().isInt({ min: 1, max: 1000 }).withMessage('Capacity must be between 1 and 1000'),
    query('available').optional().isBoolean().withMessage('Available must be a boolean'),
    query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO8601 date'),
    query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO8601 date'),
    query('sortBy').optional().isIn(['name', 'type', 'capacity', 'createdAt']).withMessage('Invalid sortBy field'),
    query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('SortOrder must be asc or desc'),
    validateRequest,
  ],
  RoomController.getRooms
);

/**
 * @route GET /rooms/stats
 * @desc Get room statistics
 * @access Admin, Reception
 */
router.get(
  '/stats',
  authorize('admin', 'reception'),
  RoomController.getRoomStats
);

/**
 * @route GET /rooms/:roomId
 * @desc Get room by ID with full details
 * @access Admin, Reception, Professional
 */
router.get(
  '/:roomId',
  [
    param('roomId').isMongoId().withMessage('Invalid room ID'),
    validateRequest,
  ],
  authorize('admin', 'reception', 'professional'),
  RoomController.getRoomById
);

/**
 * @route GET /rooms/:roomId/availability
 * @desc Get room availability for specific date range
 * @access Admin, Reception, Professional
 */
router.get(
  '/:roomId/availability',
  [
    param('roomId').isMongoId().withMessage('Invalid room ID'),
    query('startDate').notEmpty().isISO8601().withMessage('Start date is required and must be valid ISO8601'),
    query('endDate').notEmpty().isISO8601().withMessage('End date is required and must be valid ISO8601'),
    validateRequest,
  ],
  authorize('admin', 'reception', 'professional'),
  RoomController.getRoomAvailability
);

/**
 * @route POST /rooms/:roomId/jitsi-link
 * @desc Generate Jitsi meeting link for virtual room
 * @access Admin, Reception, Professional
 */
router.post(
  '/:roomId/jitsi-link',
  [
    param('roomId').isMongoId().withMessage('Invalid room ID'),
    validateRequest,
  ],
  authorize('admin', 'reception', 'professional'),
  RoomController.generateJitsiLink
);

/**
 * @route POST /rooms
 * @desc Create new room
 * @access Admin only
 */
router.post(
  '/',
  authorize('admin'),
  [
    body('name')
      .notEmpty()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name is required and must be 2-100 characters'),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    body('type')
      .isIn(['physical', 'virtual'])
      .withMessage('Type must be physical or virtual'),
    body('capacity')
      .isInt({ min: 1, max: 1000 })
      .withMessage('Capacity must be between 1 and 1000'),
    body('location')
      .optional()
      .isLength({ min: 2, max: 200 })
      .withMessage('Location must be 2-200 characters'),
    body('floor')
      .optional()
      .isLength({ min: 1, max: 10 })
      .withMessage('Floor must be 1-10 characters'),
    body('building')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Building must be 2-100 characters'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('IsActive must be a boolean'),
    body('features')
      .optional()
      .isArray({ max: 20 })
      .withMessage('Features must be an array with max 20 items'),
    body('features.*')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Each feature must be 2-100 characters'),
    body('equipment')
      .optional()
      .isArray({ max: 50 })
      .withMessage('Equipment must be an array with max 50 items'),
    body('equipment.*')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Each equipment item must be 2-100 characters'),
    body('accessibility.wheelchairAccessible')
      .optional()
      .isBoolean()
      .withMessage('WheelchairAccessible must be a boolean'),
    body('accessibility.hearingLoop')
      .optional()
      .isBoolean()
      .withMessage('HearingLoop must be a boolean'),
    body('accessibility.visualAids')
      .optional()
      .isBoolean()
      .withMessage('VisualAids must be a boolean'),
    body('virtualConfig.platform')
      .optional()
      .isIn(['jitsi', 'zoom', 'teams', 'custom'])
      .withMessage('Platform must be jitsi, zoom, teams, or custom'),
    body('virtualConfig.roomId')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Room ID must be 2-100 characters'),
    body('virtualConfig.meetingUrl')
      .optional()
      .isURL()
      .withMessage('Meeting URL must be a valid URL'),
    body('virtualConfig.accessCode')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('Access code must be 2-50 characters'),
    body('virtualConfig.settings.recordingEnabled')
      .optional()
      .isBoolean()
      .withMessage('RecordingEnabled must be a boolean'),
    body('virtualConfig.settings.chatEnabled')
      .optional()
      .isBoolean()
      .withMessage('ChatEnabled must be a boolean'),
    body('virtualConfig.settings.screenSharingEnabled')
      .optional()
      .isBoolean()
      .withMessage('ScreenSharingEnabled must be a boolean'),
    body('virtualConfig.settings.waitingRoomEnabled')
      .optional()
      .isBoolean()
      .withMessage('WaitingRoomEnabled must be a boolean'),
    body('virtualConfig.settings.maxParticipants')
      .optional()
      .isInt({ min: 2, max: 1000 })
      .withMessage('MaxParticipants must be between 2 and 1000'),
    body('bookingRules.minBookingDuration')
      .optional()
      .isInt({ min: 15, max: 480 })
      .withMessage('MinBookingDuration must be between 15 and 480 minutes'),
    body('bookingRules.maxBookingDuration')
      .optional()
      .isInt({ min: 30, max: 960 })
      .withMessage('MaxBookingDuration must be between 30 and 960 minutes'),
    body('bookingRules.bufferBetweenBookings')
      .optional()
      .isInt({ min: 0, max: 120 })
      .withMessage('BufferBetweenBookings must be between 0 and 120 minutes'),
    body('bookingRules.allowBackToBack')
      .optional()
      .isBoolean()
      .withMessage('AllowBackToBack must be a boolean'),
    body('bookingRules.advanceBookingDays')
      .optional()
      .isInt({ min: 1, max: 365 })
      .withMessage('AdvanceBookingDays must be between 1 and 365'),
    body('contactInfo.phone')
      .optional()
      .isMobilePhone('any')
      .withMessage('Phone must be a valid phone number'),
    body('contactInfo.email')
      .optional()
      .isEmail()
      .withMessage('Email must be a valid email address'),
    body('contactInfo.emergencyContact')
      .optional()
      .isMobilePhone('any')
      .withMessage('Emergency contact must be a valid phone number'),
    body('metadata.color')
      .optional()
      .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
      .withMessage('Color must be a valid hex color code'),
    body('metadata.icon')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('Icon must be 2-50 characters'),
    body('metadata.tags')
      .optional()
      .isArray({ max: 10 })
      .withMessage('Tags must be an array with max 10 items'),
    body('metadata.tags.*')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('Each tag must be 2-50 characters'),
    validateRequest,
  ],
  RoomController.createRoom
);

/**
 * @route PUT /rooms/:roomId
 * @desc Update room information
 * @access Admin only
 */
router.put(
  '/:roomId',
  authorize('admin'),
  [
    param('roomId').isMongoId().withMessage('Invalid room ID'),
    body('name')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Name must be 2-100 characters'),
    body('description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Description cannot exceed 500 characters'),
    body('type')
      .optional()
      .isIn(['physical', 'virtual'])
      .withMessage('Type must be physical or virtual'),
    body('capacity')
      .optional()
      .isInt({ min: 1, max: 1000 })
      .withMessage('Capacity must be between 1 and 1000'),
    body('location')
      .optional()
      .isLength({ min: 2, max: 200 })
      .withMessage('Location must be 2-200 characters'),
    body('floor')
      .optional()
      .isLength({ min: 1, max: 10 })
      .withMessage('Floor must be 1-10 characters'),
    body('building')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Building must be 2-100 characters'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('IsActive must be a boolean'),
    body('features')
      .optional()
      .isArray({ max: 20 })
      .withMessage('Features must be an array with max 20 items'),
    body('equipment')
      .optional()
      .isArray({ max: 50 })
      .withMessage('Equipment must be an array with max 50 items'),
    body('accessibility.wheelchairAccessible')
      .optional()
      .isBoolean()
      .withMessage('WheelchairAccessible must be a boolean'),
    body('accessibility.hearingLoop')
      .optional()
      .isBoolean()
      .withMessage('HearingLoop must be a boolean'),
    body('accessibility.visualAids')
      .optional()
      .isBoolean()
      .withMessage('VisualAids must be a boolean'),
    body('virtualConfig.platform')
      .optional()
      .isIn(['jitsi', 'zoom', 'teams', 'custom'])
      .withMessage('Platform must be jitsi, zoom, teams, or custom'),
    body('virtualConfig.roomId')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Room ID must be 2-100 characters'),
    body('virtualConfig.meetingUrl')
      .optional()
      .isURL()
      .withMessage('Meeting URL must be a valid URL'),
    body('virtualConfig.accessCode')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('Access code must be 2-50 characters'),
    body('virtualConfig.settings.recordingEnabled')
      .optional()
      .isBoolean()
      .withMessage('RecordingEnabled must be a boolean'),
    body('virtualConfig.settings.chatEnabled')
      .optional()
      .isBoolean()
      .withMessage('ChatEnabled must be a boolean'),
    body('virtualConfig.settings.screenSharingEnabled')
      .optional()
      .isBoolean()
      .withMessage('ScreenSharingEnabled must be a boolean'),
    body('virtualConfig.settings.waitingRoomEnabled')
      .optional()
      .isBoolean()
      .withMessage('WaitingRoomEnabled must be a boolean'),
    body('virtualConfig.settings.maxParticipants')
      .optional()
      .isInt({ min: 2, max: 1000 })
      .withMessage('MaxParticipants must be between 2 and 1000'),
    body('bookingRules.minBookingDuration')
      .optional()
      .isInt({ min: 15, max: 480 })
      .withMessage('MinBookingDuration must be between 15 and 480 minutes'),
    body('bookingRules.maxBookingDuration')
      .optional()
      .isInt({ min: 30, max: 960 })
      .withMessage('MaxBookingDuration must be between 30 and 960 minutes'),
    body('bookingRules.bufferBetweenBookings')
      .optional()
      .isInt({ min: 0, max: 120 })
      .withMessage('BufferBetweenBookings must be between 0 and 120 minutes'),
    body('bookingRules.allowBackToBack')
      .optional()
      .isBoolean()
      .withMessage('AllowBackToBack must be a boolean'),
    body('bookingRules.advanceBookingDays')
      .optional()
      .isInt({ min: 1, max: 365 })
      .withMessage('AdvanceBookingDays must be between 1 and 365'),
    body('contactInfo.phone')
      .optional()
      .isMobilePhone('any')
      .withMessage('Phone must be a valid phone number'),
    body('contactInfo.email')
      .optional()
      .isEmail()
      .withMessage('Email must be a valid email address'),
    body('contactInfo.emergencyContact')
      .optional()
      .isMobilePhone('any')
      .withMessage('Emergency contact must be a valid phone number'),
    body('metadata.color')
      .optional()
      .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
      .withMessage('Color must be a valid hex color code'),
    body('metadata.icon')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('Icon must be 2-50 characters'),
    body('metadata.tags')
      .optional()
      .isArray({ max: 10 })
      .withMessage('Tags must be an array with max 10 items'),
    validateRequest,
  ],
  RoomController.updateRoom
);

/**
 * @route POST /rooms/:roomId/deactivate
 * @desc Deactivate room (soft delete)
 * @access Admin only
 */
router.post(
  '/:roomId/deactivate',
  authorize('admin'),
  [
    param('roomId').isMongoId().withMessage('Invalid room ID'),
    validateRequest,
  ],
  RoomController.deactivateRoom
);

/**
 * @route POST /rooms/:roomId/reactivate
 * @desc Reactivate room
 * @access Admin only
 */
router.post(
  '/:roomId/reactivate',
  authorize('admin'),
  [
    param('roomId').isMongoId().withMessage('Invalid room ID'),
    validateRequest,
  ],
  RoomController.reactivateRoom
);

export default router;

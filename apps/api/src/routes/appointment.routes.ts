import { Router } from 'express';
import { body, param, query } from 'express-validator';
import AppointmentController from '../controllers/appointment.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';

const router: Router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * @route GET /appointments
 * @desc Get all appointments with pagination and filtering
 * @access Admin, Reception, Professional (own appointments), Patient (own appointments)
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('search').optional().isLength({ min: 1, max: 100 }).withMessage('Search must be 1-100 characters'),
    query('patientId').optional().isMongoId().withMessage('Invalid patient ID'),
    query('professionalId').optional().isMongoId().withMessage('Invalid professional ID'),
    query('serviceId').optional().isMongoId().withMessage('Invalid service ID'),
    query('roomId').optional().isMongoId().withMessage('Invalid room ID'),
    query('status').optional().isIn(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled']).withMessage('Invalid status'),
    query('paymentStatus').optional().isIn(['pending', 'partial', 'paid', 'refunded', 'overdue']).withMessage('Invalid payment status'),
    query('source').optional().isIn(['admin', 'public_booking', 'professional', 'patient_portal']).withMessage('Invalid source'),
    query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO8601 date'),
    query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO8601 date'),
    query('sortBy').optional().isIn(['startTime', 'endTime', 'status', 'paymentStatus', 'createdAt']).withMessage('Invalid sortBy field'),
    query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('SortOrder must be asc or desc'),
    validateRequest,
  ],
  AppointmentController.getAppointments
);

/**
 * @route GET /appointments/stats
 * @desc Get appointment statistics
 * @access Admin, Reception, Professional (own stats)
 */
router.get(
  '/stats',
  [
    query('professionalId').optional().isMongoId().withMessage('Invalid professional ID'),
    query('startDate').optional().isISO8601().withMessage('Start date must be a valid ISO8601 date'),
    query('endDate').optional().isISO8601().withMessage('End date must be a valid ISO8601 date'),
    validateRequest,
  ],
  authorize('admin', 'reception', 'professional'),
  AppointmentController.getAppointmentStats
);

/**
 * @route GET /appointments/upcoming
 * @desc Get upcoming appointments for reminders
 * @access Admin, Reception
 */
router.get(
  '/upcoming',
  [
    query('hours').optional().isInt({ min: 1, max: 168 }).withMessage('Hours must be between 1 and 168 (7 days)'),
    validateRequest,
  ],
  authorize('admin', 'reception'),
  AppointmentController.getUpcomingAppointments
);

/**
 * @route GET /appointments/:appointmentId
 * @desc Get appointment by ID with full details
 * @access Admin, Reception, Professional (own appointments), Patient (own appointments)
 */
router.get(
  '/:appointmentId',
  [
    param('appointmentId').isMongoId().withMessage('Invalid appointment ID'),
    validateRequest,
  ],
  AppointmentController.getAppointmentById
);

/**
 * @route POST /appointments
 * @desc Create new appointment
 * @access Admin, Reception, Professional
 */
router.post(
  '/',
  authorize('admin', 'reception', 'professional'),
  [
    body('patientId')
      .notEmpty()
      .isMongoId()
      .withMessage('Valid patient ID is required'),
    body('professionalId')
      .notEmpty()
      .isMongoId()
      .withMessage('Valid professional ID is required'),
    body('serviceId')
      .notEmpty()
      .isMongoId()
      .withMessage('Valid service ID is required'),
    body('roomId')
      .optional()
      .isMongoId()
      .withMessage('Invalid room ID'),
    body('startTime')
      .notEmpty()
      .isISO8601()
      .withMessage('Valid start time is required'),
    body('endTime')
      .optional()
      .isISO8601()
      .withMessage('End time must be a valid ISO8601 date'),
    body('duration')
      .optional()
      .isInt({ min: 15, max: 480 })
      .withMessage('Duration must be between 15 and 480 minutes'),
    body('timezone')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('Timezone must be 1-50 characters'),
    body('status')
      .optional()
      .isIn(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled'])
      .withMessage('Invalid status'),
    body('paymentStatus')
      .optional()
      .isIn(['pending', 'partial', 'paid', 'refunded', 'overdue'])
      .withMessage('Invalid payment status'),
    body('source')
      .optional()
      .isIn(['admin', 'public_booking', 'professional', 'patient_portal'])
      .withMessage('Invalid source'),
    body('bookingMethod')
      .optional()
      .isIn(['online', 'phone', 'in_person', 'email'])
      .withMessage('Invalid booking method'),
    body('notes.patientNotes')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Patient notes cannot exceed 1000 characters'),
    body('notes.professionalNotes')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Professional notes cannot exceed 1000 characters'),
    body('notes.adminNotes')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Admin notes cannot exceed 1000 characters'),
    body('virtualMeeting.platform')
      .optional()
      .isIn(['jitsi', 'zoom', 'teams', 'meet', 'custom'])
      .withMessage('Invalid virtual meeting platform'),
    body('virtualMeeting.meetingId')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Meeting ID must be 2-100 characters'),
    body('virtualMeeting.meetingUrl')
      .optional()
      .isURL()
      .withMessage('Meeting URL must be a valid URL'),
    body('virtualMeeting.accessCode')
      .optional()
      .isLength({ min: 2, max: 50 })
      .withMessage('Access code must be 2-50 characters'),
    body('virtualMeeting.isRecorded')
      .optional()
      .isBoolean()
      .withMessage('IsRecorded must be a boolean'),
    validateRequest,
  ],
  AppointmentController.createAppointment
);

/**
 * @route PUT /appointments/:appointmentId
 * @desc Update appointment
 * @access Admin, Reception, Professional (own appointments)
 */
router.put(
  '/:appointmentId',
  [
    param('appointmentId').isMongoId().withMessage('Invalid appointment ID'),
    body('startTime')
      .optional()
      .isISO8601()
      .withMessage('Start time must be a valid ISO8601 date'),
    body('endTime')
      .optional()
      .isISO8601()
      .withMessage('End time must be a valid ISO8601 date'),
    body('duration')
      .optional()
      .isInt({ min: 15, max: 480 })
      .withMessage('Duration must be between 15 and 480 minutes'),
    body('status')
      .optional()
      .isIn(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show', 'rescheduled'])
      .withMessage('Invalid status'),
    body('paymentStatus')
      .optional()
      .isIn(['pending', 'partial', 'paid', 'refunded', 'overdue'])
      .withMessage('Invalid payment status'),
    body('roomId')
      .optional()
      .isMongoId()
      .withMessage('Invalid room ID'),
    body('notes.patientNotes')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Patient notes cannot exceed 1000 characters'),
    body('notes.professionalNotes')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Professional notes cannot exceed 1000 characters'),
    body('notes.adminNotes')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Admin notes cannot exceed 1000 characters'),
    validateRequest,
  ],
  authorize('admin', 'reception', 'professional'),
  AppointmentController.updateAppointment
);

/**
 * @route POST /appointments/:appointmentId/cancel
 * @desc Cancel appointment
 * @access Admin, Reception, Professional (own appointments), Patient (own appointments)
 */
router.post(
  '/:appointmentId/cancel',
  [
    param('appointmentId').isMongoId().withMessage('Invalid appointment ID'),
    body('reason')
      .optional()
      .isLength({ min: 5, max: 500 })
      .withMessage('Cancellation reason must be 5-500 characters'),
    validateRequest,
  ],
  AppointmentController.cancelAppointment
);

/**
 * @route DELETE /appointments/:appointmentId
 * @desc Soft delete appointment
 * @access Admin only
 */
router.delete(
  '/:appointmentId',
  authorize('admin'),
  [
    param('appointmentId').isMongoId().withMessage('Invalid appointment ID'),
    validateRequest,
  ],
  AppointmentController.deleteAppointment
);

export default router;

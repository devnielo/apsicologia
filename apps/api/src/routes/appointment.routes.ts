import { Router } from 'express';
import AppointmentController from '../controllers/appointment.controller.js';
import { authenticate } from '../middleware/auth.js';

const router: Router = Router();

/**
 * @route   GET /api/v1/appointments
 * @desc    Get all appointments with pagination and filtering
 * @access  Private (All roles with different access levels)
 * @query   page, limit, professionalId, patientId, serviceId, roomId, status, paymentStatus, startDate, endDate, source, sortBy, sortOrder, include
 */
router.get(
  '/',
  authenticate,
  AppointmentController.getAppointments
);

/**
 * @route   GET /api/v1/appointments/stats
 * @desc    Get appointment statistics
 * @access  Private (Admin, Reception, Professional for own stats)
 * @query   professionalId, startDate, endDate, groupBy
 */
router.get(
  '/stats',
  authenticate,
  AppointmentController.getAppointmentStats
);

/**
 * @route   GET /api/v1/appointments/slots
 * @desc    Get available appointment slots
 * @access  Private (All roles)
 * @query   professionalId, serviceId, roomId, startDate, endDate, duration
 */
router.get(
  '/slots',
  authenticate,
  AppointmentController.getAvailableSlots
);

/**
 * @route   GET /api/v1/appointments/:appointmentId
 * @desc    Get appointment by ID with full details
 * @access  Private (Admin, Reception, Professional self, Patient self)
 * @params  appointmentId
 * @query   include - Optional: conflicts, similar
 */
router.get(
  '/:appointmentId',
  authenticate,
  AppointmentController.getAppointmentById
);

/**
 * @route   POST /api/v1/appointments
 * @desc    Create new appointment
 * @access  Private (Admin, Reception, Professional for own schedule)
 * @body    Complete appointment data
 */
router.post(
  '/',
  authenticate,
  AppointmentController.createAppointment
);

/**
 * @route   PUT /api/v1/appointments/:appointmentId
 * @desc    Update appointment details
 * @access  Private (Admin, Reception, Professional self)
 * @params  appointmentId
 * @body    Partial appointment data
 */
router.put(
  '/:appointmentId',
  authenticate,
  AppointmentController.updateAppointment
);

/**
 * @route   POST /api/v1/appointments/:appointmentId/reschedule
 * @desc    Reschedule an appointment
 * @access  Private (Admin, Reception, Professional self, Patient self with restrictions)
 * @params  appointmentId
 * @body    { newStartTime, newEndTime?, reason, roomId? }
 */
router.post(
  '/:appointmentId/reschedule',
  authenticate,
  AppointmentController.rescheduleAppointment
);

/**
 * @route   POST /api/v1/appointments/:appointmentId/cancel
 * @desc    Cancel an appointment
 * @access  Private (Admin, Reception, Professional self, Patient self with restrictions)
 * @params  appointmentId
 * @body    { reason, refundAmount?, rescheduleOffered? }
 */
router.post(
  '/:appointmentId/cancel',
  authenticate,
  AppointmentController.cancelAppointment
);

/**
 * @route   POST /api/v1/appointments/:appointmentId/arrived
 * @desc    Mark patient as arrived
 * @access  Private (Admin, Reception only)
 * @params  appointmentId
 */
router.post(
  '/:appointmentId/arrived',
  authenticate,
  AppointmentController.markArrived
);

/**
 * @route   POST /api/v1/appointments/:appointmentId/start-session
 * @desc    Start appointment session
 * @access  Private (Admin, Professional self only)
 * @params  appointmentId
 */
router.post(
  '/:appointmentId/start-session',
  authenticate,
  AppointmentController.startSession
);

/**
 * @route   POST /api/v1/appointments/:appointmentId/end-session
 * @desc    End appointment session
 * @access  Private (Admin, Professional self only)
 * @params  appointmentId
 */
router.post(
  '/:appointmentId/end-session',
  authenticate,
  AppointmentController.endSession
);

/**
 * @route   DELETE /api/v1/appointments/:appointmentId
 * @desc    Soft delete appointment (admin only)
 * @access  Private (Admin only)
 * @params  appointmentId
 */
router.delete(
  '/:appointmentId',
  authenticate,
  AppointmentController.deleteAppointment
);

export default router;

import { Router } from 'express';
import ProfessionalController from '../controllers/professional.controller.js';
import { authenticate } from '../middleware/auth.js';

const router: Router = Router();

/**
 * @route   GET /api/v1/professionals
 * @desc    Get all professionals with pagination and filtering
 * @access  Private (Admin, Reception, Professional)
 * @query   page, limit, search, specialty, status, acceptingPatients, serviceId, roomId, sortBy, sortOrder, include
 */
router.get(
  '/',
  authenticate,
  ProfessionalController.getProfessionals
);

/**
 * @route   GET /api/v1/professionals/stats
 * @desc    Get professional statistics
 * @access  Private (Admin, Reception, Professional for own stats)
 * @query   professionalId, startDate, endDate
 */
router.get(
  '/stats',
  authenticate,
  ProfessionalController.getProfessionalStats
);

/**
 * @route   GET /api/v1/professionals/:professionalId
 * @desc    Get professional by ID with full details
 * @access  Private (Admin, Reception, Professional self or basic info)
 * @params  professionalId
 * @query   include (optional) - comma-separated: patients,schedule,analytics
 */
router.get(
  '/:professionalId',
  authenticate,
  ProfessionalController.getProfessionalById
);

/**
 * @route   POST /api/v1/professionals
 * @desc    Create new professional
 * @access  Private (Admin only)
 * @body    Professional data with optional user account creation
 */
router.post(
  '/',
  authenticate,
  ProfessionalController.createProfessional
);

/**
 * @route   PUT /api/v1/professionals/:professionalId
 * @desc    Update professional information
 * @access  Private (Admin, Professional self with restrictions)
 * @params  professionalId
 * @body    Partial professional data
 */
router.put(
  '/:professionalId',
  authenticate,
  ProfessionalController.updateProfessional
);

/**
 * @route   POST /api/v1/professionals/:professionalId/services
 * @desc    Add service to professional
 * @access  Private (Admin, Professional self)
 * @params  professionalId
 * @body    { serviceId }
 */
router.post(
  '/:professionalId/services',
  authenticate,
  ProfessionalController.addService
);

/**
 * @route   DELETE /api/v1/professionals/:professionalId/services/:serviceId
 * @desc    Remove service from professional
 * @access  Private (Admin, Professional self)
 * @params  professionalId, serviceId
 */
router.delete(
  '/:professionalId/services/:serviceId',
  authenticate,
  ProfessionalController.removeService
);

/**
 * @route   POST /api/v1/professionals/:professionalId/vacations
 * @desc    Add vacation/absence period
 * @access  Private (Admin, Reception, Professional self)
 * @params  professionalId
 * @body    { startDate, endDate, reason?, isRecurring?, recurrencePattern? }
 */
router.post(
  '/:professionalId/vacations',
  authenticate,
  ProfessionalController.addVacation
);

/**
 * @route   DELETE /api/v1/professionals/:professionalId/vacations/:vacationId
 * @desc    Remove vacation/absence period
 * @access  Private (Admin, Reception, Professional self)
 * @params  professionalId, vacationId
 */
router.delete(
  '/:professionalId/vacations/:vacationId',
  authenticate,
  ProfessionalController.removeVacation
);

/**
 * @route   PUT /api/v1/professionals/:professionalId/availability
 * @desc    Update availability schedule
 * @access  Private (Admin, Reception, Professional self)
 * @params  professionalId
 * @body    { weeklyAvailability }
 */
router.put(
  '/:professionalId/availability',
  authenticate,
  ProfessionalController.updateAvailability
);

/**
 * @route   GET /api/v1/professionals/:professionalId/availability
 * @desc    Get professional availability for a date range
 * @access  Private (All authenticated users)
 * @params  professionalId
 * @query   startDate?, endDate?, serviceId?
 */
router.get(
  '/:professionalId/availability',
  authenticate,
  ProfessionalController.getAvailability
);

/**
 * @route   DELETE /api/v1/professionals/:professionalId
 * @desc    Deactivate professional (soft delete)
 * @access  Private (Admin only)
 * @params  professionalId
 */
router.delete(
  '/:professionalId',
  authenticate,
  ProfessionalController.deactivateProfessional
);

export default router;

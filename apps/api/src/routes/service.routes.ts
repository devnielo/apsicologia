import { Router } from 'express';
import ServiceController from '../controllers/service.controller.js';
import { authenticate } from '../middleware/auth.js';

const router: Router = Router();

/**
 * @route   GET /api/v1/services
 * @desc    Get all services with pagination and filtering
 * @access  Private (All roles with different access levels)
 * @query   page, limit, search, category, isActive, isPubliclyBookable, isOnlineAvailable, minPrice, maxPrice, minDuration, maxDuration, professionalId, sortBy, sortOrder, include
 */
router.get(
  '/',
  authenticate,
  ServiceController.getServices
);

/**
 * @route   GET /api/v1/services/categories
 * @desc    Get all service categories
 * @access  Private (All roles)
 */
router.get(
  '/categories',
  authenticate,
  ServiceController.getCategories
);

/**
 * @route   GET /api/v1/services/stats
 * @desc    Get service statistics
 * @access  Private (Admin, Reception only)
 */
router.get(
  '/stats',
  authenticate,
  ServiceController.getServiceStats
);

/**
 * @route   GET /api/v1/services/:serviceId
 * @desc    Get service by ID with full details
 * @access  Private (All roles with access restrictions)
 * @params  serviceId
 * @query   include - Optional: usage, professionals
 */
router.get(
  '/:serviceId',
  authenticate,
  ServiceController.getServiceById
);

/**
 * @route   POST /api/v1/services
 * @desc    Create new service
 * @access  Private (Admin only)
 * @body    Complete service data
 */
router.post(
  '/',
  authenticate,
  ServiceController.createService
);

/**
 * @route   PUT /api/v1/services/:serviceId
 * @desc    Update service details
 * @access  Private (Admin only)
 * @params  serviceId
 * @body    Partial service data
 */
router.put(
  '/:serviceId',
  authenticate,
  ServiceController.updateService
);

/**
 * @route   POST /api/v1/services/:serviceId/professionals
 * @desc    Add professional to service
 * @access  Private (Admin only)
 * @params  serviceId
 * @body    { professionalId }
 */
router.post(
  '/:serviceId/professionals',
  authenticate,
  ServiceController.addProfessional
);

/**
 * @route   DELETE /api/v1/services/:serviceId/professionals/:professionalId
 * @desc    Remove professional from service
 * @access  Private (Admin only)
 * @params  serviceId, professionalId
 */
router.delete(
  '/:serviceId/professionals/:professionalId',
  authenticate,
  ServiceController.removeProfessional
);

/**
 * @route   DELETE /api/v1/services/:serviceId
 * @desc    Soft delete service (admin only)
 * @access  Private (Admin only)
 * @params  serviceId
 */
router.delete(
  '/:serviceId',
  authenticate,
  ServiceController.deleteService
);

export default router;

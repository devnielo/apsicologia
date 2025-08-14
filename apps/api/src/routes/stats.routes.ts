import { Router } from 'express';
import StatsController from '../controllers/stats.controller.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router: Router = Router();

/**
 * @swagger
 * /api/v1/stats/dashboard:
 *   get:
 *     summary: Get comprehensive dashboard statistics
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for statistics (ISO 8601)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for statistics (ISO 8601)
 *       - in: query
 *         name: professionalId
 *         schema:
 *           type: string
 *         description: Filter by professional ID
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, quarter, year]
 *           default: month
 *         description: Time period for aggregation
 *       - in: query
 *         name: timezone
 *         schema:
 *           type: string
 *           default: Europe/Madrid
 *         description: Timezone for date calculations
 *     responses:
 *       200:
 *         description: Dashboard statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     period:
 *                       type: string
 *                     dateRange:
 *                       type: object
 *                       properties:
 *                         start:
 *                           type: string
 *                           format: date-time
 *                         end:
 *                           type: string
 *                           format: date-time
 *                     kpis:
 *                       type: object
 *                       properties:
 *                         totalAppointments:
 *                           type: number
 *                         completionRate:
 *                           type: number
 *                         cancellationRate:
 *                           type: number
 *                         noShowRate:
 *                           type: number
 *                         totalRevenue:
 *                           type: number
 *                         paidRevenue:
 *                           type: number
 *                         pendingRevenue:
 *                           type: number
 *                         collectionRate:
 *                           type: number
 *                         newPatients:
 *                           type: number
 *                         activePatients:
 *                           type: number
 *                     charts:
 *                       type: object
 *                       properties:
 *                         appointmentTrends:
 *                           type: array
 *                         revenueByService:
 *                           type: array
 *                         professionalPerformance:
 *                           type: array
 *                         patientRiskDistribution:
 *                           type: object
 *                     tables:
 *                       type: object
 *                       properties:
 *                         upcomingAppointments:
 *                           type: array
 *                         recentActivities:
 *                           type: array
 *                         topServices:
 *                           type: array
 *       403:
 *         description: Access denied - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get('/dashboard', authenticate, authorize('admin', 'reception', 'professional'), StatsController.getDashboardStats);

/**
 * @swagger
 * /api/v1/stats/appointments:
 *   get:
 *     summary: Get appointment analytics
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for analytics
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for analytics
 *       - in: query
 *         name: professionalId
 *         schema:
 *           type: string
 *         description: Filter by professional ID
 *       - in: query
 *         name: serviceId
 *         schema:
 *           type: string
 *         description: Filter by service ID
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [hour, day, week, month]
 *           default: day
 *         description: Time grouping for analytics
 *     responses:
 *       200:
 *         description: Appointment analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     timeline:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           data:
 *                             type: array
 *                           totalAppointments:
 *                             type: number
 *                     statusDistribution:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           count:
 *                             type: number
 *                           percentage:
 *                             type: number
 *                     groupBy:
 *                       type: string
 *       403:
 *         description: Access denied
 *       500:
 *         description: Internal server error
 */
router.get('/appointments', authenticate, authorize('admin', 'reception', 'professional'), StatsController.getAppointmentAnalytics);

/**
 * @swagger
 * /api/v1/stats/revenue:
 *   get:
 *     summary: Get revenue analytics
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for revenue analytics
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for revenue analytics
 *       - in: query
 *         name: professionalId
 *         schema:
 *           type: string
 *         description: Filter by professional ID
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [day, week, month, quarter]
 *           default: month
 *         description: Time grouping for revenue analytics
 *     responses:
 *       200:
 *         description: Revenue analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     timeline:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                           currencies:
 *                             type: array
 *                           totalInvoices:
 *                             type: number
 *                     serviceBreakdown:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: object
 *                           totalRevenue:
 *                             type: number
 *                           quantity:
 *                             type: number
 *                           avgPrice:
 *                             type: number
 *                     groupBy:
 *                       type: string
 *       403:
 *         description: Access denied - patients cannot access revenue analytics
 *       500:
 *         description: Internal server error
 */
router.get('/revenue', authenticate, authorize('admin', 'reception', 'professional'), StatsController.getRevenueAnalytics);

/**
 * @swagger
 * /api/v1/stats/patients:
 *   get:
 *     summary: Get patient analytics
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Patient analytics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     ageDistribution:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: Age group (e.g., "25-34")
 *                           count:
 *                             type: number
 *                     riskDistribution:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: Risk level (low, medium, high)
 *                           count:
 *                             type: number
 *                     statusDistribution:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: Patient status
 *                           count:
 *                             type: number
 *                     registrationTrends:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: Month (YYYY-MM)
 *                           count:
 *                             type: number
 *                     appointmentFrequency:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           _id:
 *                             type: string
 *                             description: Frequency range (e.g., "1-2")
 *                           count:
 *                             type: number
 *       403:
 *         description: Access denied - insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get('/patients', authenticate, authorize('admin', 'reception', 'professional'), StatsController.getPatientAnalytics);

/**
 * @swagger
 * /api/v1/stats/export:
 *   get:
 *     summary: Export statistics report
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *           default: json
 *         description: Export format
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for export
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for export
 *       - in: query
 *         name: professionalId
 *         schema:
 *           type: string
 *         description: Filter by professional ID
 *       - in: query
 *         name: period
 *         schema:
 *           type: string
 *           enum: [day, week, month, quarter, year]
 *           default: month
 *         description: Time period for aggregation
 *     responses:
 *       200:
 *         description: Statistics report exported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     report:
 *                       type: object
 *                       description: Complete statistics report
 *                     exportedAt:
 *                       type: string
 *                       format: date-time
 *                     exportFormat:
 *                       type: string
 *           text/csv:
 *             schema:
 *               type: string
 *               description: CSV format statistics report
 *       403:
 *         description: Access denied - only admin and reception can export
 *       500:
 *         description: Internal server error
 */
router.get('/export', authenticate, authorize('admin', 'reception'), StatsController.exportStatsReport);

export default router;

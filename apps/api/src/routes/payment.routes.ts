import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller.js';
import { authenticate } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validation.js';
import { z } from '@apsicologia/shared/validations';

const router: Router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Validation schemas
const createPaymentSchema = z.object({
  body: z.object({
    invoiceId: z.string().min(1, 'Invoice ID is required'),
    method: z.enum(['cash', 'card', 'transfer', 'stripe', 'paypal', 'check'], {
      required_error: 'Payment method is required',
      invalid_type_error: 'Invalid payment method',
    }),
    amount: z.number().positive('Amount must be positive'),
    currency: z.enum(['EUR', 'USD', 'GBP']).optional(),
    reference: z.string().max(100, 'Reference cannot exceed 100 characters').optional(),
    notes: z.string().max(500, 'Notes cannot exceed 500 characters').optional(),
    paidAt: z.string().datetime().optional().or(z.date().optional()),
    stripePaymentIntentId: z.string().optional(),
  }),
});

const refundPaymentSchema = z.object({
  body: z.object({
    reason: z.string().min(1, 'Refund reason is required').max(500, 'Reason cannot exceed 500 characters'),
    amount: z.number().positive('Refund amount must be positive').optional(),
  }),
  params: z.object({
    paymentId: z.string().min(1, 'Payment ID is required'),
  }),
});

const paymentParamsSchema = z.object({
  params: z.object({
    paymentId: z.string().min(1, 'Payment ID is required'),
  }),
});

const paymentQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional(),
    limit: z.string().regex(/^\d+$/).optional(),
    search: z.string().max(100).optional(),
    invoiceId: z.string().optional(),
    patientId: z.string().optional(),
    professionalId: z.string().optional(),
    method: z.enum(['cash', 'card', 'transfer', 'stripe', 'paypal', 'check', 'online', 'insurance']).optional(),
    status: z.enum([
      'pending', 'processing', 'completed', 'failed', 
      'cancelled', 'refunded', 'partially_refunded'
    ]).optional(),
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional(),
    minAmount: z.string().regex(/^\d*\.?\d*$/).optional(),
    maxAmount: z.string().regex(/^\d*\.?\d*$/).optional(),
    currency: z.enum(['EUR', 'USD', 'GBP']).optional(),
    sortBy: z.enum([
      'paymentDate', 'amount', 'method', 'status', 'createdAt'
    ]).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
  }).optional(),
});

const statsQuerySchema = z.object({
  query: z.object({
    professionalId: z.string().optional(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }).optional(),
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       required:
 *         - paymentNumber
 *         - patientId
 *         - method
 *         - amount
 *         - currency
 *         - status
 *         - paymentDate
 *         - customer
 *         - metadata
 *       properties:
 *         _id:
 *           type: string
 *           description: Payment unique identifier
 *         paymentNumber:
 *           type: string
 *           description: Payment reference number
 *         invoiceId:
 *           type: string
 *           description: Related invoice ID
 *         appointmentId:
 *           type: string
 *           description: Related appointment ID
 *         patientId:
 *           type: string
 *           description: Patient ID
 *         professionalId:
 *           type: string
 *           description: Professional ID
 *         method:
 *           type: string
 *           enum: [cash, card, transfer, check, online, insurance, paypal, stripe]
 *           description: Payment method
 *         processor:
 *           type: string
 *           enum: [stripe, paypal, redsys, bizum, internal]
 *           description: Payment processor
 *         amount:
 *           type: number
 *           description: Payment amount
 *         currency:
 *           type: string
 *           enum: [EUR, USD, GBP]
 *           description: Payment currency
 *         status:
 *           type: string
 *           enum: [pending, processing, completed, failed, cancelled, refunded, partially_refunded]
 *           description: Payment status
 *         paymentDate:
 *           type: string
 *           format: date-time
 *           description: When the payment was made
 *         processedAt:
 *           type: string
 *           format: date-time
 *           description: When the payment was processed
 *         details:
 *           type: object
 *           properties:
 *             reference:
 *               type: string
 *               description: Payment reference
 *             description:
 *               type: string
 *               description: Payment description
 *             cardLast4:
 *               type: string
 *               description: Last 4 digits of card (if card payment)
 *             cardBrand:
 *               type: string
 *               description: Card brand (if card payment)
 *         fees:
 *           type: object
 *           properties:
 *             gatewayFee:
 *               type: number
 *               description: Gateway processing fee
 *             processingFee:
 *               type: number
 *               description: Processing fee
 *             platformFee:
 *               type: number
 *               description: Platform fee
 *             totalFees:
 *               type: number
 *               description: Total fees
 *             netAmount:
 *               type: number
 *               description: Net amount after fees
 *         customer:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *               description: Customer name
 *             email:
 *               type: string
 *               description: Customer email
 *             phone:
 *               type: string
 *               description: Customer phone
 *         metadata:
 *           type: object
 *           properties:
 *             source:
 *               type: string
 *               enum: [appointment, invoice, subscription, manual]
 *               description: Payment source
 *             channel:
 *               type: string
 *               enum: [online, app, pos, phone, admin]
 *               description: Payment channel
 *             notes:
 *               type: string
 *               description: Additional notes
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 * 
 *     CreatePaymentRequest:
 *       type: object
 *       required:
 *         - invoiceId
 *         - method
 *         - amount
 *       properties:
 *         invoiceId:
 *           type: string
 *           description: Invoice ID to pay
 *         method:
 *           type: string
 *           enum: [cash, card, transfer, stripe, paypal, check]
 *           description: Payment method
 *         amount:
 *           type: number
 *           minimum: 0.01
 *           description: Payment amount
 *         currency:
 *           type: string
 *           enum: [EUR, USD, GBP]
 *           description: Payment currency
 *         reference:
 *           type: string
 *           maxLength: 100
 *           description: Payment reference
 *         notes:
 *           type: string
 *           maxLength: 500
 *           description: Payment notes
 *         paidAt:
 *           type: string
 *           format: date-time
 *           description: Payment date/time
 *         stripePaymentIntentId:
 *           type: string
 *           description: Stripe payment intent ID (if Stripe payment)
 * 
 *     RefundPaymentRequest:
 *       type: object
 *       required:
 *         - reason
 *       properties:
 *         reason:
 *           type: string
 *           minLength: 1
 *           maxLength: 500
 *           description: Reason for refund
 *         amount:
 *           type: number
 *           minimum: 0.01
 *           description: Refund amount (defaults to full payment amount)
 * 
 *     PaymentStats:
 *       type: object
 *       properties:
 *         total:
 *           type: number
 *           description: Total number of payments
 *         byMethod:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *                 description: Payment method
 *               count:
 *                 type: number
 *                 description: Count of payments
 *               totalAmount:
 *                 type: number
 *                 description: Total amount for this method
 *         byStatus:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *                 description: Payment status
 *               count:
 *                 type: number
 *                 description: Count of payments
 *               totalAmount:
 *                 type: number
 *                 description: Total amount for this status
 *         revenue:
 *           type: object
 *           properties:
 *             totalRevenue:
 *               type: number
 *               description: Total revenue
 *             averagePayment:
 *               type: number
 *               description: Average payment amount
 *             completedRevenue:
 *               type: number
 *               description: Revenue from completed payments
 *             refundedAmount:
 *               type: number
 *               description: Total refunded amount
 *         refunds:
 *           type: object
 *           properties:
 *             totalRefunds:
 *               type: number
 *               description: Total refund amount
 *             refundCount:
 *               type: number
 *               description: Number of refunds
 *             averageRefund:
 *               type: number
 *               description: Average refund amount
 *         monthlyTrend:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: object
 *                 properties:
 *                   year:
 *                     type: number
 *                   month:
 *                     type: number
 *               totalRevenue:
 *                 type: number
 *               paymentCount:
 *                 type: number
 *               averagePayment:
 *                 type: number
 */

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment management operations
 */

/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: Get all payments with pagination and filtering
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           maxLength: 100
 *         description: Search in payment references, notes, and methods
 *       - in: query
 *         name: invoiceId
 *         schema:
 *           type: string
 *         description: Filter by invoice ID
 *       - in: query
 *         name: patientId
 *         schema:
 *           type: string
 *         description: Filter by patient ID
 *       - in: query
 *         name: professionalId
 *         schema:
 *           type: string
 *         description: Filter by professional ID
 *       - in: query
 *         name: method
 *         schema:
 *           type: string
 *           enum: [cash, card, transfer, stripe, paypal, check, online, insurance]
 *         description: Filter by payment method
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, failed, cancelled, refunded, partially_refunded]
 *         description: Filter by payment status
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter payments from this date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter payments to this date
 *       - in: query
 *         name: minAmount
 *         schema:
 *           type: number
 *         description: Minimum payment amount
 *       - in: query
 *         name: maxAmount
 *         schema:
 *           type: number
 *         description: Maximum payment amount
 *       - in: query
 *         name: currency
 *         schema:
 *           type: string
 *           enum: [EUR, USD, GBP]
 *         description: Filter by currency
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [paymentDate, amount, method, status, createdAt]
 *           default: paymentDate
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Payments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     payments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Payment'
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: number
 *                         totalPages:
 *                           type: number
 *                         totalPayments:
 *                           type: number
 *                         hasNext:
 *                           type: boolean
 *                         hasPrev:
 *                           type: boolean
 *       400:
 *         description: Bad request - Invalid query parameters
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get('/', validateRequest(paymentQuerySchema), PaymentController.getPayments);

/**
 * @swagger
 * /api/payments/{paymentId}:
 *   get:
 *     summary: Get payment by ID
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     responses:
 *       200:
 *         description: Payment retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     payment:
 *                       $ref: '#/components/schemas/Payment'
 *       400:
 *         description: Bad request - Invalid payment ID
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Cannot view this payment
 *       404:
 *         description: Payment not found
 *       500:
 *         description: Internal server error
 */
router.get('/:paymentId', validateRequest(paymentParamsSchema), PaymentController.getPaymentById);

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Create new payment (manual registration)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePaymentRequest'
 *     responses:
 *       201:
 *         description: Payment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Payment registered successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     payment:
 *                       $ref: '#/components/schemas/Payment'
 *       400:
 *         description: Bad request - Invalid payment data or invoice already paid
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Cannot create payments
 *       404:
 *         description: Invoice not found
 *       500:
 *         description: Internal server error
 */
router.post('/', validateRequest(createPaymentSchema), PaymentController.createPayment);

/**
 * @swagger
 * /api/payments/{paymentId}/refund:
 *   post:
 *     summary: Refund payment (admin only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID to refund
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RefundPaymentRequest'
 *     responses:
 *       200:
 *         description: Payment refunded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Payment refunded successfully
 *                 data:
 *                   type: object
 *                   properties:
 *                     refund:
 *                       $ref: '#/components/schemas/Payment'
 *                     originalPayment:
 *                       $ref: '#/components/schemas/Payment'
 *       400:
 *         description: Bad request - Cannot refund payment or invalid refund amount
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Only administrators can refund payments
 *       404:
 *         description: Payment not found
 *       500:
 *         description: Internal server error
 */
router.post('/:paymentId/refund', validateRequest(refundPaymentSchema), PaymentController.refundPayment);

/**
 * @swagger
 * /api/payments/stats:
 *   get:
 *     summary: Get payment statistics
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: professionalId
 *         schema:
 *           type: string
 *         description: Filter stats by professional ID (admin/reception only)
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for stats calculation
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for stats calculation
 *     responses:
 *       200:
 *         description: Payment statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       $ref: '#/components/schemas/PaymentStats'
 *       400:
 *         description: Bad request - Invalid query parameters
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       500:
 *         description: Internal server error
 */
router.get('/stats', validateRequest(statsQuerySchema), PaymentController.getPaymentStats);

export default router;

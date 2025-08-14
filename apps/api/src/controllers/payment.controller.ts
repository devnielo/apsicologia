import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Payment, IPaymentDocument } from '../models/Payment.js';
import { Invoice } from '../models/Invoice.js';
import { Patient } from '../models/Patient.js';
import { Appointment } from '../models/Appointment.js';
import { AuditLog } from '../models/AuditLog.js';
import logger from '../config/logger.js';
import { AuthRequest } from '../middleware/auth.js';

interface CreatePaymentRequest {
  invoiceId: string;
  method: 'cash' | 'card' | 'transfer' | 'stripe' | 'paypal' | 'check';
  amount: number;
  currency?: string;
  reference?: string;
  notes?: string;
  paidAt?: Date;
  stripePaymentIntentId?: string;
}

interface PaymentQuery {
  page?: string;
  limit?: string;
  search?: string;
  invoiceId?: string;
  patientId?: string;
  professionalId?: string;
  method?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  minAmount?: string;
  maxAmount?: string;
  currency?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class PaymentController {
  /**
   * Get all payments with pagination and filtering
   */
  static async getPayments(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user!;
      const {
        page = '1',
        limit = '20',
        search,
        invoiceId,
        patientId,
        professionalId,
        method,
        status,
        dateFrom,
        dateTo,
        minAmount,
        maxAmount,
        currency,
        sortBy = 'paymentDate',
        sortOrder = 'desc',
      } = req.query as PaymentQuery;

      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;

      // Build filter with base constraints
      const filter: any = {};

      // Role-based filtering
      if (authUser.role === 'professional') {
        // Only payments for invoices created by this professional
        const invoices = await Invoice.find({ professionalId: authUser.professionalId }).select('_id');
        filter.invoiceId = { $in: invoices.map(inv => inv._id) };
      } else if (authUser.role === 'patient') {
        // Only payments for invoices belonging to this patient
        const patient = await Patient.findOne({ userId: authUser._id });
        if (patient) {
          const invoices = await Invoice.find({ patientId: patient._id }).select('_id');
          filter.invoiceId = { $in: invoices.map(inv => inv._id) };
        } else {
          return res.status(200).json({
            success: true,
            data: {
              payments: [],
              pagination: {
                currentPage: pageNum,
                totalPages: 0,
                totalPayments: 0,
                hasNext: false,
                hasPrev: false,
              },
            },
          });
        }
      }

      // Apply query filters
      if (invoiceId) filter.invoiceId = new Types.ObjectId(invoiceId);
      if (method) filter.method = method;
      if (status) filter.status = status;
      if (dateFrom || dateTo) {
        filter.paymentDate = {};
        if (dateFrom) filter.paymentDate.$gte = new Date(dateFrom);
        if (dateTo) filter.paymentDate.$lte = new Date(dateTo);
      }
      if (minAmount || maxAmount) {
        filter.amount = {};
        if (minAmount) filter.amount.$gte = parseFloat(minAmount);
        if (maxAmount) filter.amount.$lte = parseFloat(maxAmount);
      }
      if (currency) filter.currency = currency;

      // Text search
      if (search) {
        filter.$or = [
          { 'details.reference': { $regex: search, $options: 'i' } },
          { 'metadata.notes': { $regex: search, $options: 'i' } },
          { method: { $regex: search, $options: 'i' } },
        ];
      }

      // Apply additional filters for specific relations
      if (patientId && authUser.role !== 'patient') {
        const patientInvoices = await Invoice.find({ patientId }).select('_id');
        const patientInvoiceIds = patientInvoices.map(inv => inv._id);
        filter.invoiceId = filter.invoiceId 
          ? { $in: filter.invoiceId.$in.filter((id: Types.ObjectId) => 
              patientInvoiceIds.some(pid => pid.equals(id))
            )}
          : { $in: patientInvoiceIds };
      }

      if (professionalId && authUser.role !== 'professional') {
        const professionalInvoices = await Invoice.find({ professionalId }).select('_id');
        const professionalInvoiceIds = professionalInvoices.map(inv => inv._id);
        filter.invoiceId = filter.invoiceId 
          ? { $in: filter.invoiceId.$in.filter((id: Types.ObjectId) => 
              professionalInvoiceIds.some(pid => pid.equals(id))
            )}
          : { $in: professionalInvoiceIds };
      }

      // Build sort
      const sort: any = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Execute queries with population
      const [payments, total] = await Promise.all([
        Payment.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limitNum)
          .populate({
            path: 'invoiceId',
            select: 'invoiceNumber series customer totals status',
            populate: [
              { path: 'patientId', select: 'personalInfo contactInfo' },
              { path: 'professionalId', select: 'name specialties' },
            ],
          }),
        Payment.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / limitNum);

      res.status(200).json({
        success: true,
        data: {
          payments,
          pagination: {
            currentPage: pageNum,
            totalPages,
            totalPayments: total,
            hasNext: pageNum < totalPages,
            hasPrev: pageNum > 1,
          },
        },
      });
    } catch (error) {
      logger.error('Get payments error:', error);
      next(error);
    }
  }

  /**
   * Get payment by ID
   */
  static async getPaymentById(req: Request, res: Response, next: NextFunction) {
    try {
      const { paymentId } = req.params;
      const authUser = (req as AuthRequest).user!;

      const payment = await Payment.findById(paymentId).populate({
        path: 'invoiceId',
        select: 'invoiceNumber series customer totals status patientId professionalId',
        populate: [
          { path: 'patientId', select: 'personalInfo contactInfo' },
          { path: 'professionalId', select: 'name specialties licenseNumber' },
        ],
      });

      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found',
        });
      }

      // Check permissions
      const invoice = payment.invoiceId as any;
      const canView = 
        authUser.role === 'admin' ||
        authUser.role === 'reception' ||
        (authUser.role === 'professional' && authUser.professionalId?.toString() === invoice.professionalId?._id?.toString());

      if (!canView && authUser.role === 'patient') {
        const patient = await Patient.findOne({ userId: authUser._id });
        if (!patient || patient._id.toString() !== invoice.patientId?._id?.toString()) {
          return res.status(403).json({
            success: false,
            message: 'Access denied: Cannot view this payment',
          });
        }
      } else if (!canView) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot view this payment',
        });
      }

      res.status(200).json({
        success: true,
        data: { payment },
      });
    } catch (error) {
      logger.error('Get payment by ID error:', error);
      next(error);
    }
  }

  /**
   * Create new payment (manual registration)
   */
  static async createPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user!;
      const paymentData = req.body as CreatePaymentRequest;

      // Only admin, reception, and professionals can create manual payments
      if (!['admin', 'reception', 'professional'].includes(authUser.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot create payments',
        });
      }

      // Validate invoice exists and is not already fully paid
      const invoice = await Invoice.findById(paymentData.invoiceId).populate('patientId', 'personalInfo contactInfo');
      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found',
        });
      }

      if (invoice.status === 'paid') {
        return res.status(400).json({
          success: false,
          message: 'Invoice is already fully paid',
        });
      }

      if (['cancelled', 'refunded'].includes(invoice.status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot add payment to ${invoice.status} invoice`,
        });
      }

      // If professional role, verify they can access this invoice
      if (authUser.role === 'professional') {
        if (!invoice.professionalId || invoice.professionalId.toString() !== authUser.professionalId?.toString()) {
          return res.status(403).json({
            success: false,
            message: 'Access denied: Cannot create payments for invoices not assigned to you',
          });
        }
      }

      // Validate payment amount
      const remainingAmount = invoice.totals.total - invoice.totals.amountPaid;
      if (paymentData.amount > remainingAmount + 0.01) { // Allow small rounding tolerance
        return res.status(400).json({
          success: false,
          message: `Payment amount (${paymentData.amount}) exceeds remaining balance (${remainingAmount.toFixed(2)})`,
        });
      }

      if (paymentData.amount <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Payment amount must be greater than zero',
        });
      }

      // Generate payment number
      const paymentNumber = await (Payment as any).generatePaymentNumber();

      // Create payment record
      const payment = new Payment({
        invoiceId: invoice._id,
        patientId: (invoice as any).patientId._id,
        professionalId: invoice.professionalId,
        paymentNumber,
        method: paymentData.method,
        amount: paymentData.amount,
        currency: paymentData.currency || invoice.totals.currency,
        status: 'completed',
        paymentDate: paymentData.paidAt || new Date(),
        processedAt: new Date(),
        details: {
          reference: paymentData.reference || '',
          description: `Payment for invoice ${invoice.invoiceNumber}`,
        },
        fees: {
          gatewayFee: 0,
          processingFee: 0,
          platformFee: 0,
          totalFees: 0,
          netAmount: paymentData.amount,
        },
        customer: {
          name: (invoice as any).patientId?.personalInfo?.name || 'Unknown',
          email: (invoice as any).patientId?.contactInfo?.email || '',
          phone: (invoice as any).patientId?.contactInfo?.phone || '',
        },
        metadata: {
          source: 'invoice',
          channel: 'admin',
          notes: paymentData.notes || '',
        },
      });

      await payment.save();

      // Update invoice payment status and totals
      const newAmountPaid = invoice.totals.amountPaid + paymentData.amount;
      const newAmountDue = invoice.totals.total - newAmountPaid;

      invoice.totals.amountPaid = newAmountPaid;
      invoice.totals.amountDue = newAmountDue;

      // Update invoice status based on payment
      if (newAmountDue <= 0.01) { // Account for floating point precision
        invoice.status = 'paid';
        invoice.payment.paidAt = new Date();
      } else if (newAmountPaid > 0) {
        invoice.status = 'partially_paid';
      }

      await invoice.save();

      // Update related appointments if any
      if (invoice.appointmentIds && invoice.appointmentIds.length > 0) {
        const appointmentStatus = invoice.status === 'paid' ? 'paid' : 'partial_payment';
        await Appointment.updateMany(
          { _id: { $in: invoice.appointmentIds } },
          { paymentStatus: appointmentStatus }
        );
      }

      // Log payment creation
      await AuditLog.create({
        action: 'payment_created',
        entityType: 'payment',
        entityId: payment._id.toString(),
        actorId: authUser._id,
        actorType: 'user',
        actorEmail: authUser.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'success',
        changes: {
          created: {
            paymentId: payment._id.toString(),
            invoiceId: invoice._id.toString(),
            amount: payment.amount,
            method: payment.method,
            currency: payment.currency,
          },
          invoiceUpdates: {
            previousStatus: 'partially_paid',
            newStatus: invoice.status,
            previousAmountPaid: newAmountPaid - paymentData.amount,
            newAmountPaid: newAmountPaid,
          },
        },
        business: {
          clinicalRelevant: false,
          containsPHI: true,
          dataClassification: 'confidential',
        },
        metadata: {
          source: 'payment_controller',
          priority: 'high',
        },
        timestamp: new Date(),
      });

      // Populate and return the created payment
      await payment.populate({
        path: 'invoiceId',
        select: 'invoiceNumber series customer totals status',
        populate: [
          { path: 'patientId', select: 'personalInfo contactInfo' },
          { path: 'professionalId', select: 'name specialties' },
        ],
      });

      res.status(201).json({
        success: true,
        message: 'Payment registered successfully',
        data: { payment },
      });
    } catch (error) {
      logger.error('Create payment error:', error);
      next(error);
    }
  }

  /**
   * Refund payment (admin only)
   */
  static async refundPayment(req: Request, res: Response, next: NextFunction) {
    try {
      const { paymentId } = req.params;
      const authUser = (req as AuthRequest).user!;
      const { reason, amount } = req.body;

      // Only admin can refund payments
      if (authUser.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Only administrators can refund payments',
        });
      }

      const payment = await Payment.findById(paymentId).populate('invoiceId');
      if (!payment) {
        return res.status(404).json({
          success: false,
          message: 'Payment not found',
        });
      }

      if (payment.status !== 'completed') {
        return res.status(400).json({
          success: false,
          message: `Cannot refund payment with status: ${payment.status}`,
        });
      }

      const refundAmount = amount || payment.amount;
      if (refundAmount > payment.amount) {
        return res.status(400).json({
          success: false,
          message: 'Refund amount cannot exceed original payment amount',
        });
      }

      // Generate unique payment number for refund
      const refundPaymentNumber = await (Payment as any).generatePaymentNumber();

      // Create refund payment record
      const refund = new Payment({
        invoiceId: payment.invoiceId,
        patientId: payment.patientId,
        professionalId: payment.professionalId,
        paymentNumber: refundPaymentNumber,
        method: payment.method,
        amount: -refundAmount, // Negative amount for refund
        currency: payment.currency,
        status: 'completed',
        paymentDate: new Date(),
        processedAt: new Date(),
        details: {
          reference: `REFUND-${payment.details.reference}`,
          description: `Refund for payment ${payment.paymentNumber}. Reason: ${reason}`,
        },
        fees: {
          gatewayFee: 0,
          processingFee: 0,
          platformFee: 0,
          totalFees: 0,
          netAmount: refundAmount,
        },
        customer: payment.customer,
        metadata: {
          source: 'manual',
          channel: 'admin',
          notes: `Refund - ${reason}`,
        },
      });

      await refund.save();

      // Update original payment status
      if (refundAmount === payment.amount) {
        payment.status = 'refunded';
      } else {
        payment.status = 'partially_refunded';
      }
      await payment.save();

      // Update invoice totals
      const invoice = payment.invoiceId as any;
      invoice.totals.amountPaid -= refundAmount;
      invoice.totals.amountDue += refundAmount;

      // Update invoice status
      if (invoice.totals.amountPaid <= 0) {
        invoice.status = invoice.status === 'paid' ? 'sent' : invoice.status;
      } else if (invoice.totals.amountDue > 0.01) {
        invoice.status = 'partially_paid';
      }

      await invoice.save();

      // Log refund
      await AuditLog.create({
        action: 'payment_refunded',
        entityType: 'payment',
        entityId: payment._id.toString(),
        actorId: authUser._id,
        actorType: 'user',
        actorEmail: authUser.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'success',
        changes: {
          refund: {
            refundId: refund._id.toString(),
            originalPaymentId: payment._id.toString(),
            refundAmount: refundAmount,
            reason: reason,
          },
          paymentStatus: { from: 'completed', to: payment.status },
          invoiceUpdates: {
            newAmountPaid: invoice.totals.amountPaid,
            newStatus: invoice.status,
          },
        },
        security: {
          riskLevel: 'high',
          authMethod: 'jwt',
          compliance: {
            hipaaRelevant: false,
            gdprRelevant: true,
            requiresRetention: true,
          },
        },
        business: {
          clinicalRelevant: false,
          containsPHI: true,
          dataClassification: 'confidential',
        },
        metadata: {
          source: 'payment_controller',
          priority: 'high',
        },
        timestamp: new Date(),
      });

      res.status(200).json({
        success: true,
        message: 'Payment refunded successfully',
        data: { 
          refund,
          originalPayment: payment,
        },
      });
    } catch (error) {
      logger.error('Refund payment error:', error);
      next(error);
    }
  }

  /**
   * Get payment statistics
   */
  static async getPaymentStats(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user!;
      const { professionalId, startDate, endDate } = req.query;

      // Only admin, reception, and professionals can see stats
      if (!['admin', 'reception', 'professional'].includes(authUser.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Insufficient permissions',
        });
      }

      // Build match filter for payments
      const matchFilter: any = {};
      
      // Role-based filtering
      if (authUser.role === 'professional') {
        const invoices = await Invoice.find({ professionalId: authUser.professionalId }).select('_id');
        matchFilter.invoiceId = { $in: invoices.map(inv => inv._id) };
      } else if (professionalId) {
        const invoices = await Invoice.find({ professionalId }).select('_id');
        matchFilter.invoiceId = { $in: invoices.map(inv => inv._id) };
      }

      // Add date filter if provided
      if (startDate || endDate) {
        matchFilter.paymentDate = {};
        if (startDate) matchFilter.paymentDate.$gte = new Date(startDate as string);
        if (endDate) matchFilter.paymentDate.$lte = new Date(endDate as string);
      }

      const [
        totalPayments,
        paymentsByMethod,
        paymentsByStatus,
        revenueStats,
        monthlyRevenue,
      ] = await Promise.all([
        Payment.countDocuments(matchFilter),
        Payment.aggregate([
          { $match: matchFilter },
          { $group: { _id: '$method', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } },
          { $sort: { count: -1 } },
        ]),
        Payment.aggregate([
          { $match: matchFilter },
          { $group: { _id: '$status', count: { $sum: 1 }, totalAmount: { $sum: '$amount' } } },
          { $sort: { count: -1 } },
        ]),
        Payment.aggregate([
          { $match: { ...matchFilter, amount: { $gt: 0 } } }, // Only positive payments (exclude refunds)
          { $group: {
            _id: null,
            totalRevenue: { $sum: '$amount' },
            averagePayment: { $avg: '$amount' },
            completedRevenue: { 
              $sum: { 
                $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] 
              }
            },
            refundedAmount: { 
              $sum: { 
                $cond: [{ $eq: ['$status', 'refunded'] }, '$amount', 0] 
              }
            },
          }},
        ]),
        Payment.aggregate([
          { $match: { ...matchFilter, amount: { $gt: 0 } } },
          { $group: {
            _id: { 
              year: { $year: '$paymentDate' }, 
              month: { $month: '$paymentDate' } 
            },
            totalRevenue: { $sum: '$amount' },
            paymentCount: { $sum: 1 },
            averagePayment: { $avg: '$amount' },
          }},
          { $sort: { '_id.year': -1, '_id.month': -1 } },
          { $limit: 12 },
        ]),
      ]);

      // Also get refund statistics
      const refundStats = await Payment.aggregate([
        { $match: { ...matchFilter, amount: { $lt: 0 } } }, // Only negative payments (refunds)
        { $group: {
          _id: null,
          totalRefunds: { $sum: { $abs: '$amount' } },
          refundCount: { $sum: 1 },
          averageRefund: { $avg: { $abs: '$amount' } },
        }},
      ]);

      const stats = {
        total: totalPayments,
        byMethod: paymentsByMethod,
        byStatus: paymentsByStatus,
        revenue: revenueStats[0] || {
          totalRevenue: 0,
          averagePayment: 0,
          completedRevenue: 0,
          refundedAmount: 0,
        },
        refunds: refundStats[0] || {
          totalRefunds: 0,
          refundCount: 0,
          averageRefund: 0,
        },
        monthlyTrend: monthlyRevenue,
      };

      res.status(200).json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      logger.error('Get payment stats error:', error);
      next(error);
    }
  }
}

export default PaymentController;

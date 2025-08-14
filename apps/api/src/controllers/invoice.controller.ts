import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Invoice, IInvoiceDocument } from '../models/Invoice.js';
import { Payment } from '../models/Payment.js';
import { Patient } from '../models/Patient.js';
import { Appointment } from '../models/Appointment.js';
import { Service } from '../models/Service.js';
import { Professional } from '../models/Professional.js';
import { AuditLog } from '../models/AuditLog.js';
import logger from '../config/logger.js';
import { AuthRequest } from '../middleware/auth.js';

interface CreateInvoiceRequest {
  patientId: string;
  appointmentId?: string;
  items: {
    serviceId: string;
    description: string;
    quantity: number;
    unitPrice: number;
    discount?: {
      amount?: number;
      percentage?: number;
      reason?: string;
    };
    taxRate?: number;
  }[];
  series?: string;
  dueDate?: Date;
  serviceDate?: Date;
  notes?: {
    internal?: string;
    customer?: string;
    payment?: string;
    insurance?: string;
  };
  currency?: string;
}

interface InvoiceQuery {
  page?: string;
  limit?: string;
  search?: string;
  patientId?: string;
  professionalId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  minAmount?: string;
  maxAmount?: string;
  currency?: string;
  series?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export class InvoiceController {
  /**
   * Get all invoices with pagination and filtering
   */
  static async getInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user!;
      const {
        page = '1',
        limit = '20',
        search,
        patientId,
        professionalId,
        status,
        dateFrom,
        dateTo,
        dueDateFrom,
        dueDateTo,
        minAmount,
        maxAmount,
        currency,
        series,
        sortBy = 'issueDate',
        sortOrder = 'desc',
      } = req.query as InvoiceQuery;

      const pageNum = parseInt(page, 10);
      const limitNum = parseInt(limit, 10);
      const skip = (pageNum - 1) * limitNum;

      // Build filter
      const filter: any = { deletedAt: null };

      // Role-based filtering
      if (authUser.role === 'professional') {
        filter.professionalId = new Types.ObjectId(authUser.professionalId);
      } else if (authUser.role === 'patient') {
        const patient = await Patient.findOne({ userId: authUser._id });
        if (patient) {
          filter.patientId = patient._id;
        } else {
          return res.status(200).json({
            success: true,
            data: {
              invoices: [],
              pagination: {
                currentPage: pageNum,
                totalPages: 0,
                totalInvoices: 0,
                hasNext: false,
                hasPrev: false,
              },
            },
          });
        }
      }

      // Apply query filters
      if (patientId) filter.patientId = new Types.ObjectId(patientId);
      if (professionalId && authUser.role !== 'professional') {
        filter.professionalId = new Types.ObjectId(professionalId);
      }
      if (status) filter.status = status;
      if (dateFrom || dateTo) {
        filter.issueDate = {};
        if (dateFrom) filter.issueDate.$gte = new Date(dateFrom);
        if (dateTo) filter.issueDate.$lte = new Date(dateTo);
      }
      if (dueDateFrom || dueDateTo) {
        filter.dueDate = {};
        if (dueDateFrom) filter.dueDate.$gte = new Date(dueDateFrom);
        if (dueDateTo) filter.dueDate.$lte = new Date(dueDateTo);
      }
      if (minAmount || maxAmount) {
        filter['totals.total'] = {};
        if (minAmount) filter['totals.total'].$gte = parseFloat(minAmount);
        if (maxAmount) filter['totals.total'].$lte = parseFloat(maxAmount);
      }
      if (currency) filter['totals.currency'] = currency;
      if (series) filter.series = series;

      if (search) {
        filter.$or = [
          { invoiceNumber: { $regex: search, $options: 'i' } },
          { 'customer.name': { $regex: search, $options: 'i' } },
          { 'customer.email': { $regex: search, $options: 'i' } },
          { 'items.description': { $regex: search, $options: 'i' } },
        ];
      }

      // Build sort
      const sort: any = {};
      sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

      // Execute queries with population
      const [invoices, total] = await Promise.all([
        Invoice.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limitNum)
          .populate('patientId', 'personalInfo contactInfo')
          .populate('professionalId', 'name specialties'),
        Invoice.countDocuments(filter),
      ]);

      const totalPages = Math.ceil(total / limitNum);

      res.status(200).json({
        success: true,
        data: {
          invoices,
          pagination: {
            currentPage: pageNum,
            totalPages,
            totalInvoices: total,
            hasNext: pageNum < totalPages,
            hasPrev: pageNum > 1,
          },
        },
      });
    } catch (error) {
      logger.error('Get invoices error:', error);
      next(error);
    }
  }

  /**
   * Get invoice by ID with full details
   */
  static async getInvoiceById(req: Request, res: Response, next: NextFunction) {
    try {
      const { invoiceId } = req.params;
      const authUser = (req as AuthRequest).user!;

      const invoice = await Invoice.findOne({ _id: invoiceId, deletedAt: null })
        .populate('patientId', 'personalInfo contactInfo')
        .populate('professionalId', 'name specialties licenseNumber');

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found',
        });
      }

      // Check permissions
      const canView = 
        authUser.role === 'admin' ||
        authUser.role === 'reception' ||
        (authUser.role === 'professional' && authUser.professionalId?.toString() === invoice.professionalId?.toString());

      if (!canView && authUser.role === 'patient') {
        const patient = await Patient.findOne({ userId: authUser._id });
        if (!patient || patient._id.toString() !== invoice.patientId?.toString()) {
          return res.status(403).json({
            success: false,
            message: 'Access denied: Cannot view this invoice',
          });
        }
      } else if (!canView) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot view this invoice',
        });
      }

      // Get payments for this invoice
      const payments = await Payment.find({ invoiceId: invoice._id }).sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: { 
          invoice,
          payments
        },
      });
    } catch (error) {
      logger.error('Get invoice by ID error:', error);
      next(error);
    }
  }

  /**
   * Create new invoice
   */
  static async createInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user!;
      const invoiceData = req.body as CreateInvoiceRequest;

      // Only admin, reception, and professionals can create invoices
      if (!['admin', 'reception', 'professional'].includes(authUser.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot create invoices',
        });
      }

      // Validate patient exists
      const patient = await Patient.findById(invoiceData.patientId);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found',
        });
      }

      // If professional role, can only create invoices for their patients
      if (authUser.role === 'professional') {
        const isAssigned = patient.clinicalInfo.assignedProfessionals?.some(
          (profId: any) => profId.toString() === authUser.professionalId?.toString()
        );
        if (!isAssigned) {
          return res.status(403).json({
            success: false,
            message: 'Access denied: Cannot create invoices for patients not assigned to you',
          });
        }
      }

      // Validate appointment if provided
      let appointment = null;
      let appointmentIds: Types.ObjectId[] = [];
      if (invoiceData.appointmentId) {
        appointment = await Appointment.findById(invoiceData.appointmentId);
        if (!appointment) {
          return res.status(404).json({
            success: false,
            message: 'Appointment not found',
          });
        }
        
        // Verify appointment belongs to patient
        if (appointment.patientId.toString() !== invoiceData.patientId) {
          return res.status(400).json({
            success: false,
            message: 'Appointment does not belong to the specified patient',
          });
        }
        appointmentIds = [appointment._id];
      }

      // Get professional ID
      let professionalId = null;
      if (appointment) {
        professionalId = appointment.professionalId;
      } else if (authUser.professionalId) {
        professionalId = authUser.professionalId;
      }

      // Generate invoice number
      const series = invoiceData.series || 'FAC';
      const invoiceNumber = await (Invoice as any).generateInvoiceNumber(series);

      // Prepare customer information from patient
      const customer = {
        name: (patient as any).personalInfo?.name || 'N/A',
        email: (patient as any).contactInfo?.email || '',
        phone: (patient as any).contactInfo?.phone || '',
        address: {
          street: (patient as any).contactInfo?.address?.street || '',
          city: (patient as any).contactInfo?.address?.city || '',
          postalCode: (patient as any).contactInfo?.address?.postalCode || '',
          state: (patient as any).contactInfo?.address?.state || '',
          country: (patient as any).contactInfo?.address?.country || 'Spain',
        },
      };

      // Process items with service details
      const processedItems = await Promise.all(
        invoiceData.items.map(async (item) => {
          const service = await Service.findById(item.serviceId);
          const professional = professionalId ? await Professional.findById(professionalId) : null;
          
          return {
            serviceId: new Types.ObjectId(item.serviceId),
            appointmentId: appointment?._id,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: {
              amount: item.discount?.amount || 0,
              percentage: item.discount?.percentage || 0,
              reason: item.discount?.reason || '',
            },
            subtotal: item.quantity * item.unitPrice,
            taxRate: item.taxRate || 21, // Default Spanish VAT
            taxAmount: 0, // Will be calculated by the model
            total: 0, // Will be calculated by the model
            serviceDetails: {
              name: service?.name || item.description,
              duration: service?.durationMinutes || 60,
              date: invoiceData.serviceDate || new Date(),
              professionalName: professional?.name || 'N/A',
            },
          };
        })
      );

      // Create invoice
      const invoice = new Invoice({
        invoiceNumber,
        series,
        patientId: patient._id,
        professionalId,
        appointmentIds,
        issueDate: new Date(),
        dueDate: invoiceData.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        serviceDate: invoiceData.serviceDate || new Date(),
        status: 'draft',
        customer,
        items: processedItems,
        totals: {
          subtotal: 0,
          totalDiscount: 0,
          subtotalAfterDiscount: 0,
          totalTax: 0,
          total: 0,
          amountPaid: 0,
          amountDue: 0,
          currency: invoiceData.currency || 'EUR',
        },
        notes: invoiceData.notes || {},
        createdBy: authUser._id,
      });

      // Calculate totals using model method
      invoice.calculateTotals();
      await invoice.save();

      // Update appointment payment status if linked
      if (appointment) {
        appointment.paymentStatus = 'pending';
        await appointment.save();
      }

      // Log invoice creation
      await AuditLog.create({
        action: 'invoice_created',
        entityType: 'invoice',
        entityId: invoice._id.toString(),
        actorId: authUser._id,
        actorType: 'user',
        actorEmail: authUser.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'success',
        changes: {
          created: {
            invoiceNumber: invoice.invoiceNumber,
            patientId: invoice.patientId.toString(),
            appointmentIds: invoice.appointmentIds?.map(id => id.toString()) || [],
            totalAmount: invoice.totals.total,
            currency: invoice.totals.currency,
          },
        },
        business: {
          clinicalRelevant: false,
          containsPHI: true,
          dataClassification: 'confidential',
        },
        metadata: {
          source: 'invoice_controller',
          priority: 'medium',
        },
        timestamp: new Date(),
      });

      // Populate and return the created invoice
      await invoice.populate([
        { path: 'patientId', select: 'personalInfo contactInfo' },
        { path: 'professionalId', select: 'name specialties' }
      ]);

      res.status(201).json({
        success: true,
        message: 'Invoice created successfully',
        data: { invoice },
      });
    } catch (error) {
      logger.error('Create invoice error:', error);
      next(error);
    }
  }

  /**
   * Send invoice to patient
   */
  static async sendInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const { invoiceId } = req.params;
      const authUser = (req as AuthRequest).user!;

      const invoice = await Invoice.findById(invoiceId);
      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found',
        });
      }

      // Check permissions
      const canSend = 
        authUser.role === 'admin' ||
        authUser.role === 'reception' ||
        (authUser.role === 'professional' && authUser.professionalId?.toString() === invoice.professionalId?.toString());

      if (!canSend) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot send this invoice',
        });
      }

      // Cannot send cancelled or refunded invoices
      if (['cancelled', 'refunded'].includes(invoice.status)) {
        return res.status(400).json({
          success: false,
          message: `Cannot send invoice with status: ${invoice.status}`,
        });
      }

      // Use model method to mark as sent
      await invoice.markAsSent(invoice.customer.email);

      res.status(200).json({
        success: true,
        message: 'Invoice sent successfully',
        data: { invoice },
      });
    } catch (error) {
      logger.error('Send invoice error:', error);
      next(error);
    }
  }

  /**
   * Cancel invoice
   */
  static async cancelInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const { invoiceId } = req.params;
      const authUser = (req as AuthRequest).user!;
      const { reason } = req.body;

      const invoice = await Invoice.findById(invoiceId);
      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found',
        });
      }

      // Only admin can cancel invoices
      if (authUser.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Only administrators can cancel invoices',
        });
      }

      // Cannot cancel already paid invoices
      if (invoice.status === 'paid') {
        return res.status(400).json({
          success: false,
          message: 'Cannot cancel a paid invoice. Please create a refund instead.',
        });
      }

      if (invoice.status === 'cancelled') {
        return res.status(400).json({
          success: false,
          message: 'Invoice is already cancelled',
        });
      }

      // Use model method to cancel
      await invoice.cancel(authUser._id, reason || 'Cancelled by administrator');

      // Update linked appointments payment status
      if (invoice.appointmentIds && invoice.appointmentIds.length > 0) {
        await Appointment.updateMany(
          { _id: { $in: invoice.appointmentIds } },
          { paymentStatus: 'pending' } // Reset to pending instead of cancelled
        );
      }

      // Log invoice cancellation
      await AuditLog.create({
        action: 'invoice_cancelled',
        entityType: 'invoice',
        entityId: invoice._id.toString(),
        actorId: authUser._id,
        actorType: 'user',
        actorEmail: authUser.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'success',
        changes: {
          status: { from: 'sent', to: 'cancelled' },
          reason: reason,
        },
        security: {
          riskLevel: 'medium',
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
          source: 'invoice_controller',
          priority: 'high',
        },
        timestamp: new Date(),
      });

      res.status(200).json({
        success: true,
        message: 'Invoice cancelled successfully',
      });
    } catch (error) {
      logger.error('Cancel invoice error:', error);
      next(error);
    }
  }

  /**
   * Get invoice statistics
   */
  static async getInvoiceStats(req: Request, res: Response, next: NextFunction) {
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

      // Build filter for professional scope
      const matchFilter: any = { deletedAt: null };
      if (authUser.role === 'professional') {
        matchFilter.professionalId = new Types.ObjectId(authUser.professionalId);
      } else if (professionalId) {
        matchFilter.professionalId = new Types.ObjectId(professionalId as string);
      }

      // Add date filter if provided
      if (startDate || endDate) {
        matchFilter.issueDate = {};
        if (startDate) matchFilter.issueDate.$gte = new Date(startDate as string);
        if (endDate) matchFilter.issueDate.$lte = new Date(endDate as string);
      }

      const [
        totalInvoices,
        invoicesByStatus,
        revenueStats,
        overdueInvoices,
        monthlyRevenue,
      ] = await Promise.all([
        Invoice.countDocuments(matchFilter),
        Invoice.aggregate([
          { $match: matchFilter },
          { $group: { _id: '$status', count: { $sum: 1 }, totalAmount: { $sum: '$totals.total' } } },
          { $sort: { count: -1 } },
        ]),
        Invoice.aggregate([
          { $match: matchFilter },
          { $group: {
            _id: null,
            totalRevenue: { $sum: '$totals.total' },
            averageInvoice: { $avg: '$totals.total' },
            paidRevenue: { 
              $sum: { 
                $cond: [{ $eq: ['$status', 'paid'] }, '$totals.total', 0] 
              }
            },
            pendingRevenue: { 
              $sum: { 
                $cond: [
                  { $in: ['$status', ['sent', 'viewed', 'partially_paid']] }, 
                  '$totals.total', 
                  0
                ] 
              }
            },
          }},
        ]),
        Invoice.countDocuments({
          ...matchFilter,
          status: { $in: ['sent', 'viewed', 'partially_paid'] },
          dueDate: { $lt: new Date() }
        }),
        Invoice.aggregate([
          { $match: matchFilter },
          { $group: {
            _id: { 
              year: { $year: '$issueDate' }, 
              month: { $month: '$issueDate' } 
            },
            totalRevenue: { $sum: '$totals.total' },
            invoiceCount: { $sum: 1 },
            paidRevenue: { 
              $sum: { 
                $cond: [{ $eq: ['$status', 'paid'] }, '$totals.total', 0] 
              }
            },
          }},
          { $sort: { '_id.year': -1, '_id.month': -1 } },
          { $limit: 12 },
        ]),
      ]);

      const stats = {
        total: totalInvoices,
        byStatus: invoicesByStatus,
        revenue: revenueStats[0] || {
          totalRevenue: 0,
          averageInvoice: 0,
          paidRevenue: 0,
          pendingRevenue: 0,
        },
        overdueCount: overdueInvoices,
        monthlyTrend: monthlyRevenue,
      };

      res.status(200).json({
        success: true,
        data: { stats },
      });
    } catch (error) {
      logger.error('Get invoice stats error:', error);
      next(error);
    }
  }

  /**
   * Update invoice (only draft invoices)
   */
  static async updateInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const { invoiceId } = req.params;
      const authUser = (req as AuthRequest).user!;
      const updateData = req.body;

      const invoice = await Invoice.findById(invoiceId);
      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found',
        });
      }

      // Check permissions
      const canUpdate = 
        authUser.role === 'admin' ||
        authUser.role === 'reception' ||
        (authUser.role === 'professional' && authUser.professionalId?.toString() === invoice.professionalId?.toString());

      if (!canUpdate) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot update this invoice',
        });
      }

      // Can only update draft invoices
      if (invoice.status !== 'draft') {
        return res.status(400).json({
          success: false,
          message: 'Can only update draft invoices',
        });
      }

      // Store original data for audit
      const originalData = {
        items: invoice.items,
        totals: invoice.totals,
        notes: invoice.notes,
        dueDate: invoice.dueDate,
      };

      // Update allowed fields
      if (updateData.items) {
        const processedItems = await Promise.all(
          updateData.items.map(async (item: any) => {
            const service = await Service.findById(item.serviceId);
            const professional = invoice.professionalId ? await Professional.findById(invoice.professionalId) : null;
            
            return {
              serviceId: new Types.ObjectId(item.serviceId),
              appointmentId: item.appointmentId ? new Types.ObjectId(item.appointmentId) : undefined,
              description: item.description,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discount: {
                amount: item.discount?.amount || 0,
                percentage: item.discount?.percentage || 0,
                reason: item.discount?.reason || '',
              },
              subtotal: item.quantity * item.unitPrice,
              taxRate: item.taxRate || 21,
              taxAmount: 0,
              total: 0,
              serviceDetails: {
                name: service?.name || item.description,
                duration: service?.durationMinutes || 60,
                date: updateData.serviceDate || invoice.serviceDate,
                professionalName: professional?.name || 'N/A',
              },
            };
          })
        );
        invoice.items = processedItems;
      }

      if (updateData.dueDate) {
        invoice.dueDate = new Date(updateData.dueDate);
      }

      if (updateData.serviceDate) {
        invoice.serviceDate = new Date(updateData.serviceDate);
      }

      if (updateData.notes) {
        invoice.notes = { ...invoice.notes, ...updateData.notes };
      }

      // Recalculate totals
      invoice.calculateTotals();
      invoice.updatedAt = new Date();
      await invoice.save();

      // Log invoice update
      await AuditLog.create({
        action: 'invoice_updated',
        entityType: 'invoice',
        entityId: invoice._id.toString(),
        actorId: authUser._id,
        actorType: 'user',
        actorEmail: authUser.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'success',
        changes: {
          before: originalData,
          after: {
            items: invoice.items,
            totals: invoice.totals,
            notes: invoice.notes,
            dueDate: invoice.dueDate,
          },
        },
        business: {
          clinicalRelevant: false,
          containsPHI: true,
          dataClassification: 'confidential',
        },
        metadata: {
          source: 'invoice_controller',
          priority: 'medium',
        },
        timestamp: new Date(),
      });

      // Populate and return updated invoice
      await invoice.populate([
        { path: 'patientId', select: 'personalInfo contactInfo' },
        { path: 'professionalId', select: 'name specialties' }
      ]);

      res.status(200).json({
        success: true,
        message: 'Invoice updated successfully',
        data: { invoice },
      });
    } catch (error) {
      logger.error('Update invoice error:', error);
      next(error);
    }
  }

  /**
   * Generate PDF for invoice
   */
  static async generateInvoicePDF(req: Request, res: Response, next: NextFunction) {
    try {
      const { invoiceId } = req.params;
      const authUser = (req as AuthRequest).user!;

      const invoice = await Invoice.findById(invoiceId)
        .populate('patientId', 'personalInfo contactInfo')
        .populate('professionalId', 'name specialties licenseNumber');

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found',
        });
      }

      // Check permissions
      const canView = 
        authUser.role === 'admin' ||
        authUser.role === 'reception' ||
        (authUser.role === 'professional' && authUser.professionalId?.toString() === invoice.professionalId?.toString());

      if (!canView && authUser.role === 'patient') {
        const patient = await Patient.findOne({ userId: authUser._id });
        if (!patient || patient._id.toString() !== invoice.patientId?.toString()) {
          return res.status(403).json({
            success: false,
            message: 'Access denied: Cannot generate PDF for this invoice',
          });
        }
      } else if (!canView) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot generate PDF for this invoice',
        });
      }

      // For now, generate a simple PDF placeholder (would use a real PDF library like puppeteer or pdf-lib)
      const pdfContent = `Invoice ${invoice.invoiceNumber}\nTotal: ${invoice.totals.total} ${invoice.totals.currency}`;
      const pdfBuffer = Buffer.from(pdfContent);

      // Update invoice with PDF URL/path if needed
      if (!invoice.document.pdfUrl) {
        // In a real implementation, you'd save the PDF to storage and update the URL
        invoice.document.pdfUrl = `/api/v1/invoices/${invoice._id}/pdf`;
        invoice.document.pdfGeneratedAt = new Date();
        invoice.document.isGenerated = true;
        await invoice.save();
      }

      // Set headers for PDF download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="Factura-${invoice.invoiceNumber}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      res.status(200).send(pdfBuffer);
    } catch (error) {
      logger.error('Generate invoice PDF error:', error);
      next(error);
    }
  }

  /**
   * Duplicate invoice (create copy as draft)
   */
  static async duplicateInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const { invoiceId } = req.params;
      const authUser = (req as AuthRequest).user!;

      const originalInvoice = await Invoice.findById(invoiceId);
      if (!originalInvoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found',
        });
      }

      // Check permissions
      const canDuplicate = 
        authUser.role === 'admin' ||
        authUser.role === 'reception' ||
        (authUser.role === 'professional' && authUser.professionalId?.toString() === originalInvoice.professionalId?.toString());

      if (!canDuplicate) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot duplicate this invoice',
        });
      }

      // Generate new invoice number
      const invoiceNumber = await (Invoice as any).generateInvoiceNumber(originalInvoice.series);

      // Create duplicate with new number and draft status
      const duplicateInvoice = new Invoice({
        ...originalInvoice.toObject(),
        _id: undefined,
        invoiceNumber,
        status: 'draft',
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        sentAt: undefined,
        paidAt: undefined,
        pdfUrl: undefined,
        createdBy: authUser._id,
        createdAt: undefined,
        updatedAt: undefined,
      });

      // Recalculate totals
      duplicateInvoice.calculateTotals();
      await duplicateInvoice.save();

      // Log invoice duplication
      await AuditLog.create({
        action: 'invoice_duplicated',
        entityType: 'invoice',
        entityId: duplicateInvoice._id.toString(),
        actorId: authUser._id,
        actorType: 'user',
        actorEmail: authUser.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'success',
        changes: {
          originalInvoiceId: originalInvoice._id.toString(),
          originalInvoiceNumber: originalInvoice.invoiceNumber,
          duplicateInvoiceNumber: duplicateInvoice.invoiceNumber,
        },
        business: {
          clinicalRelevant: false,
          containsPHI: true,
          dataClassification: 'confidential',
        },
        metadata: {
          source: 'invoice_controller',
          priority: 'medium',
        },
        timestamp: new Date(),
      });

      // Populate and return the duplicate
      await duplicateInvoice.populate([
        { path: 'patientId', select: 'personalInfo contactInfo' },
        { path: 'professionalId', select: 'name specialties' }
      ]);

      res.status(201).json({
        success: true,
        message: 'Invoice duplicated successfully',
        data: { invoice: duplicateInvoice },
      });
    } catch (error) {
      logger.error('Duplicate invoice error:', error);
      next(error);
    }
  }

  /**
   * Export invoices to CSV
   */
  static async exportInvoices(req: Request, res: Response, next: NextFunction) {
    try {
      const authUser = (req as AuthRequest).user!;
      const { format = 'csv', ...queryParams } = req.query;

      // Only admin and reception can export
      if (!['admin', 'reception'].includes(authUser.role)) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Cannot export invoices',
        });
      }

      // Build filter using same logic as getInvoices
      const filter: any = { deletedAt: null };

      // Apply query filters (reusing logic from getInvoices)
      if (queryParams.patientId) filter.patientId = new Types.ObjectId(queryParams.patientId as string);
      if (queryParams.professionalId) filter.professionalId = new Types.ObjectId(queryParams.professionalId as string);
      if (queryParams.status) filter.status = queryParams.status;
      
      if (queryParams.dateFrom || queryParams.dateTo) {
        filter.issueDate = {};
        if (queryParams.dateFrom) filter.issueDate.$gte = new Date(queryParams.dateFrom as string);
        if (queryParams.dateTo) filter.issueDate.$lte = new Date(queryParams.dateTo as string);
      }

      if (queryParams.search) {
        filter.$or = [
          { invoiceNumber: { $regex: queryParams.search, $options: 'i' } },
          { 'customer.name': { $regex: queryParams.search, $options: 'i' } },
        ];
      }

      // Get invoices for export (no pagination)
      const invoices = await Invoice.find(filter)
        .populate('patientId', 'personalInfo contactInfo')
        .populate('professionalId', 'name')
        .sort({ issueDate: -1 });

      if (format === 'csv') {
        // Generate CSV content
        const csvHeader = [
          'Invoice Number',
          'Patient Name',
          'Professional',
          'Issue Date',
          'Due Date',
          'Service Date',
          'Status',
          'Subtotal',
          'Tax',
          'Total',
          'Currency',
          'Items'
        ].join(',');

        const csvRows = invoices.map(invoice => {
          const patient = invoice.patientId as any;
          const professional = invoice.professionalId as any;
          
          return [
            invoice.invoiceNumber,
            `"${patient?.personalInfo?.name || 'N/A'}"`,
            `"${professional?.name || 'N/A'}"`,
            invoice.issueDate.toISOString().split('T')[0],
            invoice.dueDate.toISOString().split('T')[0],
            invoice.serviceDate.toISOString().split('T')[0],
            invoice.status,
            invoice.totals.subtotal.toFixed(2),
            invoice.totals.totalTax.toFixed(2),
            invoice.totals.total.toFixed(2),
            invoice.totals.currency,
            `"${invoice.items.map(item => item.description).join('; ')}"`,
          ].join(',');
        });

        const csvContent = [csvHeader, ...csvRows].join('\n');

        // Set CSV headers
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', 'attachment; filename="invoices_export.csv"');

        res.status(200).send(csvContent);
      } else {
        // Return JSON export
        res.status(200).json({
          success: true,
          data: { 
            invoices: invoices,
            exportedAt: new Date(),
            totalRecords: invoices.length,
          },
        });
      }

      // Log export action
      await AuditLog.create({
        action: 'invoices_exported',
        entityType: 'invoice',
        entityId: 'bulk_export',
        actorId: authUser._id,
        actorType: 'user',
        actorEmail: authUser.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'success',
        changes: {
          format,
          recordCount: invoices.length,
          filters: queryParams,
        },
        security: {
          riskLevel: 'medium',
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
          source: 'invoice_controller',
          priority: 'medium',
        },
        timestamp: new Date(),
      });
    } catch (error) {
      logger.error('Export invoices error:', error);
      next(error);
    }
  }

  /**
   * Delete invoice (soft delete)
   */
  static async deleteInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const { invoiceId } = req.params;
      const authUser = (req as AuthRequest).user!;

      // Only admin can delete invoices
      if (authUser.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied: Only administrators can delete invoices',
        });
      }

      const invoice = await Invoice.findById(invoiceId);
      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: 'Invoice not found',
        });
      }

      // Cannot delete paid invoices
      if (invoice.status === 'paid') {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete paid invoices for compliance reasons',
        });
      }

      // Use model method for soft delete
      await invoice.softDelete();

      // Log invoice deletion
      await AuditLog.create({
        action: 'invoice_deleted',
        entityType: 'invoice',
        entityId: invoice._id.toString(),
        actorId: authUser._id,
        actorType: 'user',
        actorEmail: authUser.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        status: 'success',
        changes: {
          deletedAt: { from: null, to: new Date() },
          invoiceNumber: invoice.invoiceNumber,
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
          source: 'invoice_controller',
          priority: 'high',
        },
        timestamp: new Date(),
      });

      res.status(200).json({
        success: true,
        message: 'Invoice deleted successfully',
      });
    } catch (error) {
      logger.error('Delete invoice error:', error);
      next(error);
    }
  }
}

export default InvoiceController;

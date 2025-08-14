import { Router } from 'express';
import { InvoiceController } from '../controllers/invoice.controller.js';
import auth from '../middleware/auth.js';

const router: Router = Router();

// All invoice routes require authentication
router.use(auth.authenticate);

/**
 * @route   GET /api/v1/invoices
 * @desc    Get all invoices with pagination and filtering
 * @access  Private (Admin, Reception, Professional, Patient - filtered)
 */
router.get('/', InvoiceController.getInvoices);

/**
 * @route   GET /api/v1/invoices/stats
 * @desc    Get invoice statistics
 * @access  Private (Admin, Reception, Professional)
 */
router.get('/stats', InvoiceController.getInvoiceStats);

/**
 * @route   GET /api/v1/invoices/:invoiceId
 * @desc    Get invoice by ID with full details
 * @access  Private (Admin, Reception, Professional - own, Patient - own)
 */
router.get('/:invoiceId', InvoiceController.getInvoiceById);

/**
 * @route   POST /api/v1/invoices
 * @desc    Create new invoice
 * @access  Private (Admin, Reception, Professional)
 */
router.post('/', InvoiceController.createInvoice);

/**
 * @route   POST /api/v1/invoices/:invoiceId/send
 * @desc    Send invoice to patient
 * @access  Private (Admin, Reception, Professional - own)
 */
router.post('/:invoiceId/send', InvoiceController.sendInvoice);

/**
 * @route   POST /api/v1/invoices/:invoiceId/cancel
 * @desc    Cancel invoice
 * @access  Private (Admin only)
 */
router.post('/:invoiceId/cancel', InvoiceController.cancelInvoice);

/**
 * @route   DELETE /api/v1/invoices/:invoiceId
 * @desc    Delete invoice (soft delete)
 * @access  Private (Admin only)
 */
router.delete('/:invoiceId', InvoiceController.deleteInvoice);

export default router;

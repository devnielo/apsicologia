import { Router } from 'express';
// Import route modules
import authRoutes from './auth.routes.js';
import userRoutes from './user.routes.js';
import patientRoutes from './patient.routes.js';
import professionalRoutes from './professional.routes.js';
import serviceRoutes from './service.routes.js';
import roomRoutes from './room.routes.js';
import fileRoutes from './file.routes.js';
import formRoutes from './form.routes.js';
import noteRoutes from './note.routes.js';
import appointmentRoutes from './appointment.routes.js';
import invoiceRoutes from './invoice.routes.js';
import paymentRoutes from './payment.routes.js';
import statsRoutes from './stats.routes.js';

const router: Router = Router();

// API version prefix
const API_VERSION = '/v1';

// Health check for the entire API
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'apsicologia API is healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Mount route modules - Core functionality enabled
router.use(`${API_VERSION}/auth`, authRoutes);
router.use(`${API_VERSION}/users`, userRoutes);
router.use(`${API_VERSION}/patients`, patientRoutes);
router.use(`${API_VERSION}/professionals`, professionalRoutes);
router.use(`${API_VERSION}/services`, serviceRoutes);
router.use(`${API_VERSION}/rooms`, roomRoutes);

// Advanced features - Now enabled
router.use(`${API_VERSION}/files`, fileRoutes);
router.use(`${API_VERSION}/forms`, formRoutes);
router.use(`${API_VERSION}/notes`, noteRoutes);
router.use(`${API_VERSION}/appointments`, appointmentRoutes);
router.use(`${API_VERSION}/invoices`, invoiceRoutes);
router.use(`${API_VERSION}/payments`, paymentRoutes);
router.use(`${API_VERSION}/stats`, statsRoutes);

// API info route
router.get('/info', (req, res) => {
  res.status(200).json({
    name: 'apsicologia API',
    version: '1.0.0',
    description: 'Complete psychology clinic management system',
    endpoints: {
      health: '/api/health',
      auth: `/api${API_VERSION}/auth`,
      users: `/api${API_VERSION}/users`,
      patients: `/api${API_VERSION}/patients`,
      professionals: `/api${API_VERSION}/professionals`,
      services: `/api${API_VERSION}/services`,
      rooms: `/api${API_VERSION}/rooms`,
      files: `/api${API_VERSION}/files`,
      forms: `/api${API_VERSION}/forms`,
      notes: `/api${API_VERSION}/notes`,
      appointments: `/api${API_VERSION}/appointments`,
      invoices: `/api${API_VERSION}/invoices`,
      payments: `/api${API_VERSION}/payments`,
      stats: `/api${API_VERSION}/stats`,
    },
    features: [
      'JWT Authentication with 2FA',
      'Role-based Access Control',
      'Comprehensive Audit Logging',
      'Rate Limiting',
      'Input Validation',
      'Security Headers',
      'File Management with Cloud Storage',
      'Dynamic Forms System',
      'Clinical Notes Management',
      'Appointment Scheduling',
      'Billing & Invoicing',
      'Payment Processing',
      'Analytics & Statistics',
    ],
  });
});

export default router;

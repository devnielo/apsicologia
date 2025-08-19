import { Router } from 'express';
import PatientController from '../controllers/patient.controller.js';
import { authenticate } from '../middleware/auth.js';

const router: Router = Router();

// Routes

/**
 * @route   GET /api/v1/patients
 * @desc    Get all patients with pagination and filtering
 * @access  Private (Admin, Reception, Professional)
 * @query   page, limit, search, status, professionalId, tags, etc.
 */
router.get(
  '/',
  authenticate,
  PatientController.getPatients
);

/**
 * @route   GET /api/v1/patients/search
 * @desc    Search patients with advanced filters
 * @access  Private (Admin, Reception, Professional)
 * @query   query (required), limit
 */
router.get(
  '/search',
  authenticate,
  PatientController.searchPatients
);

/**
 * @route   GET /api/v1/patients/stats
 * @desc    Get patient statistics
 * @access  Private (Admin, Reception, Professional)
 * @query   professionalId, startDate, endDate
 */
router.get(
  '/stats',
  authenticate,
  PatientController.getPatientStats
);

/**
 * @route   POST /api/v1/patients/fix-names
 * @desc    Fix fullName field for all patients (temporary endpoint)
 * @access  Private (Admin only)
 */
router.post(
  '/fix-names',
  authenticate,
  PatientController.fixPatientNames
);

/**
 * @route   GET /api/v1/patients/:patientId
 * @desc    Get patient by ID with full details
 * @access  Private (Admin, Reception, Professional, Patient self)
 * @params  patientId
 * @query   include (optional) - comma-separated: appointments,invoices,files,statistics
 */
router.get(
  '/:patientId',
  authenticate,
  PatientController.getPatientById
);

/**
 * @route   POST /api/v1/patients
 * @desc    Create new patient
 * @access  Private (Admin, Reception, Professional)
 * @body    Full patient data with GDPR consent
 */
router.post(
  '/',
  authenticate,
  PatientController.createPatient
);

/**
 * @route   PUT /api/v1/patients/:patientId
 * @desc    Update patient information
 * @access  Private (Admin, Reception, Professional with access)
 * @params  patientId
 * @body    Partial patient data
 */
router.put(
  '/:patientId',
  authenticate,
  PatientController.updatePatient
);

/**
 * @route   POST /api/v1/patients/:patientId/tags
 * @desc    Add tag to patient
 * @access  Private (Admin, Reception, Professional with access)
 * @params  patientId
 * @body    { name, category, color? }
 */
router.post(
  '/:patientId/tags',
  authenticate,
  PatientController.addPatientTag
);

/**
 * @route   DELETE /api/v1/patients/:patientId/tags/:tagName
 * @desc    Remove tag from patient
 * @access  Private (Admin, Reception, Professional with access)
 * @params  patientId, tagName
 */
router.delete(
  '/:patientId/tags/:tagName',
  authenticate,
  PatientController.removePatientTag
);

/**
 * @route   GET /api/v1/patients/:patientId/export
 * @desc    Export patient data (GDPR compliance)
 * @access  Private (Admin, Reception, Patient self)
 * @params  patientId
 */
router.get(
  '/:patientId/export',
  authenticate,
  PatientController.exportPatientData
);

/**
 * @route   DELETE /api/v1/patients/:patientId
 * @desc    Soft delete patient (GDPR compliance)
 * @access  Private (Admin only)
 * @params  patientId
 */
router.delete(
  '/:patientId',
  authenticate,
  PatientController.deletePatient
);

export default router;

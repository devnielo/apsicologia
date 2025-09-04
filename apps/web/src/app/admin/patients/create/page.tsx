'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, Download, MoreVertical, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

// Import the same components used in the details page
import { PatientSidebar } from '../[id]/components/PatientSidebar';
import { PersonalInfoSection } from '../[id]/components/PersonalInfoSection';
import ClinicalSection from '../[id]/components/ClinicalSection';
import PreferencesSection from '../[id]/components/PreferencesSection';
import { AdministrativeSection } from '../[id]/components/AdministrativeSection';
import { SessionsSection } from '../[id]/components/SessionsSection';

export default function CreatePatientPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('personal');
  const [editingSection, setEditingSection] = useState<string | null>('all'); // All fields in edit mode
  const [editData, setEditData] = useState<any>({});
  const [validationErrors, setValidationErrors] = useState<any>({});
  const [showValidation, setShowValidation] = useState(false);

  // Edit handling functions
  const handleEdit = (section: string, data: any) => {
    setEditingSection(section);
    setEditData(data);
  };

  // Constants for data transformation
  const SECTION_NAMES = {
    PERSONAL_INFO: 'personalInfo',
    CONTACT_INFO: 'contactInfo',
    EMERGENCY_CONTACT: 'emergencyContact',
    MEDICAL_HISTORY: 'medicalHistory',
    MENTAL_HEALTH_HISTORY: 'mentalHealthHistory',
    TREATMENT_PLAN: 'treatmentPlan',
    COMMUNICATION: 'communication',
    APPOINTMENTS: 'appointments',
    PORTAL: 'portal',
    PRIVACY: 'privacy',
    BILLING: 'billing',
    TAGS: 'tags',
    ADMINISTRATIVE_NOTES: 'administrativeNotes'
  } as const;

  // Create a default patient object with all required fields
  const [newPatient, setNewPatient] = useState({
    personalInfo: {
      firstName: '',
      lastName: '',
      fullName: '',
      dateOfBirth: '',
      age: 0,
      gender: 'prefer-not-to-say',
      nationality: 'Española',
      idNumber: '',
      idType: 'dni',
      maritalStatus: 'single',
      occupation: '',
      employer: '',
      profilePicture: ''
    },
    contactInfo: {
      email: '',
      phone: '',
      alternativePhone: '',
      preferredContactMethod: 'email',
      address: {
        street: '',
        city: '',
        postalCode: '',
        state: '',
        country: 'España'
      }
    },
    emergencyContact: {
      name: '',
      relationship: '',
      phone: '',
      email: ''
    },
    clinicalInfo: {
      primaryProfessional: null,
      assignedProfessionals: [],
      medicalHistory: {
        conditions: [],
        medications: [],
        allergies: [],
        surgeries: [],
        notes: ''
      },
      mentalHealthHistory: {
        diagnoses: [],
        previousTreatments: [],
        currentStatus: 'active',
        severity: 'mild',
        notes: ''
      },
      currentTreatment: {
        treatmentPlan: '',
        goals: [],
        startDate: new Date(),
        expectedDuration: '',
        frequency: '',
        notes: '',
        sessions: []
      }
    },
    billing: {
      paymentMethod: 'stripe',
      stripeCustomerId: '',
      preferredPaymentMethod: 'card',
      billingNotes: ''
    },
    preferences: {
      language: 'es',
      communicationPreferences: {
        appointmentReminders: true,
        reminderMethods: ['email'],
        reminderTiming: [24, 2],
        newsletters: false,
        marketingCommunications: false
      },
      appointmentPreferences: {
        preferredTimes: [],
        sessionFormat: 'in-person',
        sessionDuration: 50,
        bufferBetweenSessions: 15,
        notes: ''
      },
      portalAccess: {
        enabled: true,
        lastLogin: undefined,
        passwordLastChanged: undefined,
        twoFactorEnabled: false,
        loginNotifications: true
      }
    },
    gdprConsent: {
      dataProcessing: {
        consented: false,
        consentDate: new Date(),
        consentMethod: 'digital',
        consentVersion: '2.1',
        witnessedBy: undefined,
        notes: ''
      },
      marketingCommunications: {
        consented: false,
        consentDate: undefined,
        withdrawnDate: undefined,
        method: 'digital'
      },
      dataSharing: {
        healthcareProfessionals: true,
        emergencyContacts: true,
        researchPurposes: false,
        consentDate: new Date()
      },
      rightToErasure: {
        requested: false,
        requestDate: undefined,
        processedDate: undefined,
        processedBy: undefined,
        retentionReason: undefined,
        notes: undefined
      },
      dataPortability: {
        lastExportDate: undefined,
        exportFormat: undefined,
        exportedBy: undefined
      }
    },
    signedConsentDocuments: [],
    tags: [],
    status: 'active',
    relationships: [],
    referral: {
      source: 'self',
      referringPhysician: undefined,
      referringPerson: '',
      referralDate: undefined,
      referralReason: '',
      referralNotes: ''
    },
    statistics: {
      totalAppointments: 0,
      completedAppointments: 0,
      cancelledAppointments: 0,
      noShowAppointments: 0,
      firstAppointmentDate: undefined,
      lastAppointmentDate: undefined,
      totalInvoiceAmount: 0,
      totalPaidAmount: 0,
      averageSessionRating: undefined
    },
    administrativeNotes: []
  });

  // Comprehensive validation function
  const validatePatient = () => {
    const errors: any = {};
    
    // Personal Info - Required fields
    if (!newPatient.personalInfo.firstName?.trim()) {
      errors.firstName = 'El nombre es obligatorio';
    }
    if (!newPatient.personalInfo.lastName?.trim()) {
      errors.lastName = 'Los apellidos son obligatorios';
    }
    if (!newPatient.personalInfo.dateOfBirth) {
      errors.dateOfBirth = 'La fecha de nacimiento es obligatoria';
    }
    if (!newPatient.personalInfo.gender || newPatient.personalInfo.gender === 'prefer-not-to-say') {
      errors.gender = 'El género es obligatorio';
    }
    if (!newPatient.personalInfo.idNumber?.trim()) {
      errors.idNumber = 'El número de identificación es obligatorio';
    }

    // Contact Info - Required fields
    if (!newPatient.contactInfo.email?.trim()) {
      errors.email = 'El email es obligatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newPatient.contactInfo.email)) {
      errors.email = 'El formato del email no es válido';
    }
    if (!newPatient.contactInfo.phone?.trim()) {
      errors.phone = 'El teléfono es obligatorio';
    }
    if (!newPatient.contactInfo.address.street?.trim()) {
      errors.street = 'La dirección es obligatoria';
    }
    if (!newPatient.contactInfo.address.city?.trim()) {
      errors.city = 'La ciudad es obligatoria';
    }
    if (!newPatient.contactInfo.address.postalCode?.trim()) {
      errors.postalCode = 'El código postal es obligatorio';
    }

    // Emergency Contact - Required fields
    if (!newPatient.emergencyContact.name?.trim()) {
      errors.emergencyContactName = 'El nombre del contacto de emergencia es obligatorio';
    }
    if (!newPatient.emergencyContact.relationship?.trim()) {
      errors.emergencyContactRelationship = 'La relación del contacto de emergencia es obligatoria';
    }
    if (!newPatient.emergencyContact.phone?.trim()) {
      errors.emergencyContactPhone = 'El teléfono del contacto de emergencia es obligatorio';
    }

    // GDPR Consent - Required
    if (!newPatient.gdprConsent.dataProcessing.consented) {
      errors.gdprDataProcessing = 'El consentimiento para el procesamiento de datos es obligatorio';
    }

    return errors;
  };

  // Handle save for creation (similar to edit page but creates instead of updates)
  const handleSave = async (section: string) => {
    try {
      let updatedPatient = { ...newPatient };
      
      switch (section) {
        case SECTION_NAMES.PERSONAL_INFO:
          updatedPatient.personalInfo = {
            ...updatedPatient.personalInfo,
            ...editData,
            fullName: `${editData.firstName || ''} ${editData.lastName || ''}`.trim(),
            age: editData.dateOfBirth ? new Date().getFullYear() - new Date(editData.dateOfBirth).getFullYear() : 0
          };
          break;
          
        case SECTION_NAMES.CONTACT_INFO:
          updatedPatient.contactInfo = {
            ...updatedPatient.contactInfo,
            email: editData.email,
            phone: editData.phone,
            alternativePhone: editData.alternativePhone,
            preferredContactMethod: editData.preferredContactMethod,
            address: {
              ...updatedPatient.contactInfo.address,
              street: editData.street,
              city: editData.city,
              postalCode: editData.postalCode,
              state: editData.state,
              country: editData.country
            }
          };
          break;
          
        case SECTION_NAMES.EMERGENCY_CONTACT:
          updatedPatient.emergencyContact = {
            ...updatedPatient.emergencyContact,
            ...editData
          };
          break;
          
        case SECTION_NAMES.MEDICAL_HISTORY:
          updatedPatient.clinicalInfo.medicalHistory = {
            ...updatedPatient.clinicalInfo.medicalHistory,
            ...editData
          };
          break;
          
        case SECTION_NAMES.MENTAL_HEALTH_HISTORY:
          updatedPatient.clinicalInfo.mentalHealthHistory = {
            ...updatedPatient.clinicalInfo.mentalHealthHistory,
            ...editData
          };
          break;
          
        case SECTION_NAMES.TREATMENT_PLAN:
          updatedPatient.clinicalInfo.currentTreatment = {
            ...updatedPatient.clinicalInfo.currentTreatment,
            ...editData
          };
          break;
          
        case 'professionals':
          updatedPatient.clinicalInfo = {
            ...updatedPatient.clinicalInfo,
            primaryProfessional: editData.primaryProfessional || null,
            assignedProfessionals: editData.assignedProfessionals || []
          };
          break;

        case SECTION_NAMES.COMMUNICATION:
          updatedPatient.contactInfo.preferredContactMethod = editData.preferredContactMethod;
          updatedPatient.preferences.language = editData.language;
          updatedPatient.preferences.communicationPreferences = {
            ...updatedPatient.preferences.communicationPreferences,
            appointmentReminders: editData.appointmentReminders,
            reminderMethods: editData.reminderMethods,
            newsletters: editData.newsletters,
            marketingCommunications: editData.marketingCommunications
          };
          break;
          
        case SECTION_NAMES.APPOINTMENTS:
          updatedPatient.preferences.appointmentPreferences = {
            ...updatedPatient.preferences.appointmentPreferences,
            ...editData
          };
          break;
          
        case SECTION_NAMES.PORTAL:
          updatedPatient.preferences.portalAccess = {
            ...updatedPatient.preferences.portalAccess,
            ...editData
          };
          break;
          
        case SECTION_NAMES.PRIVACY:
          updatedPatient.gdprConsent = {
            ...updatedPatient.gdprConsent,
            ...editData
          };
          break;
          
        case SECTION_NAMES.BILLING:
          updatedPatient.billing = {
            ...updatedPatient.billing,
            ...editData
          };
          break;
          
        case SECTION_NAMES.TAGS:
          updatedPatient.tags = editData.tags || [];
          break;
          
        case SECTION_NAMES.ADMINISTRATIVE_NOTES:
          updatedPatient.administrativeNotes = editData.administrativeNotes || [];
          break;
      }
      
      setNewPatient(updatedPatient);
      
      // Validate after each save and update validation errors
      const errors = validatePatient();
      setValidationErrors(errors);
      
      // Don't reset editing section - keep all fields editable
      setEditData({});
      
      toast({
        title: 'Información actualizada',
        description: 'Los datos se han guardado correctamente'
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la información',
        variant: 'destructive'
      });
    }
  };

  const handleCancel = () => {
    // Don't reset editing section - keep all fields editable
    setEditData({});
  };

  // Create patient mutation
  const createPatientMutation = useMutation({
    mutationFn: async (patientData: any) => {
      const response = await api.patients.create(patientData);
      return response.data.data;
    },
    onSuccess: (data) => {
      toast({
        title: "Paciente creado",
        description: "El paciente ha sido creado exitosamente.",
      });
      router.push(`/admin/patients/${(data as any)?._id || (data as any)?.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error al crear paciente",
        description: error.response?.data?.message || "Ha ocurrido un error inesperado.",
        variant: "destructive",
      });
    },
  });

  // Handle final creation with comprehensive validation
  const handleCreatePatient = () => {
    const errors = validatePatient();
    setValidationErrors(errors);
    setShowValidation(true);

    if (Object.keys(errors).length > 0) {
      // Group errors by section for better user feedback
      const errorsBySection = {
        personal: ['firstName', 'lastName', 'dateOfBirth', 'gender', 'idNumber'],
        contact: ['email', 'phone', 'street', 'city', 'postalCode'],
        emergency: ['emergencyContactName', 'emergencyContactRelationship', 'emergencyContactPhone'],
        gdpr: ['gdprDataProcessing']
      };

      const sectionsWithErrors = [];
      if (errorsBySection.personal.some(field => errors[field])) sectionsWithErrors.push('Información Personal');
      if (errorsBySection.contact.some(field => errors[field])) sectionsWithErrors.push('Información de Contacto');
      if (errorsBySection.emergency.some(field => errors[field])) sectionsWithErrors.push('Contacto de Emergencia');
      if (errorsBySection.gdpr.some(field => errors[field])) sectionsWithErrors.push('Consentimiento GDPR');

      // Navigate to first tab with errors
      if (errorsBySection.personal.some(field => errors[field]) || 
          errorsBySection.contact.some(field => errors[field]) || 
          errorsBySection.emergency.some(field => errors[field])) {
        setActiveTab('personal');
      } else if (errorsBySection.gdpr.some(field => errors[field])) {
        setActiveTab('admin');
      }

      toast({
        title: "Formulario incompleto",
        description: `Hay errores en: ${sectionsWithErrors.join(', ')}. Por favor, complete todos los campos obligatorios.`,
        variant: "destructive",
      });
      return;
    }

    createPatientMutation.mutate(newPatient);
  };

  const patient = newPatient;
  const fullName = `${patient.personalInfo?.firstName || ''} ${patient.personalInfo?.lastName || ''}`.trim() || 'Nuevo Paciente';

  return (
    <div className="h-full bg-background flex overflow-hidden">
      {/* Sidebar */}
      <div className="bg-card border-r border-border h-full overflow-hidden flex-shrink-0 flex flex-col">
        <div className="p-4 border-b border-border flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin/patients')}
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
        <div className="flex-1 overflow-hidden p-4">
          <PatientSidebar patient={patient} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-background flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-foreground">
                {fullName}
              </h1>
              <Badge variant="outline" className="text-xs">
                Nuevo
              </Badge>
            </div>
            
            <Button
              onClick={handleCreatePatient}
              disabled={createPatientMutation.isPending}
              className="min-w-[120px]"
            >
              {createPatientMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Crear Paciente
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Tabs Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <div className="border-b border-border/30 sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
                <div className="flex space-x-8 px-1">
                  <button
                    onClick={() => setActiveTab('personal')}
                    className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors duration-200 ${
                      activeTab === 'personal'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                    }`}
                  >
                    Details
                  </button>
                  <button
                    onClick={() => setActiveTab('clinical')}
                    className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors duration-200 ${
                      activeTab === 'clinical'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                    }`}
                  >
                    Clinical
                  </button>
                  <button
                    onClick={() => setActiveTab('preferences')}
                    className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors duration-200 ${
                      activeTab === 'preferences'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                    }`}
                  >
                    Preferences
                  </button>
                  <button
                    onClick={() => setActiveTab('admin')}
                    className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors duration-200 ${
                      activeTab === 'admin'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                    }`}
                  >
                    Admin
                  </button>
                </div>
              </div>

              <TabsContent value="personal" className="mt-2">
                <PersonalInfoSection
                  patient={patient}
                  editingSection={editingSection}
                  editData={editData}
                  onEdit={handleEdit}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  setEditData={setEditData}
                  validationErrors={validationErrors}
                  showValidation={showValidation}
                  isCreating={true}
                />
              </TabsContent>

              <TabsContent value="clinical" className="mt-2">
                <ClinicalSection
                  patient={patient}
                  editingSection={editingSection}
                  editData={editData}
                  onEdit={handleEdit}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  setEditData={setEditData}
                  validationErrors={validationErrors}
                  showValidation={showValidation}
                  isCreating={true}
                />
              </TabsContent>

              <TabsContent value="preferences" className="mt-2">
                <PreferencesSection
                  patient={patient}
                  editingSection={editingSection}
                  editData={editData}
                  onEdit={handleEdit}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  setEditData={setEditData}
                  validationErrors={validationErrors}
                  showValidation={showValidation}
                  isCreating={true}
                />
              </TabsContent>

              <TabsContent value="admin" className="mt-2">
                <AdministrativeSection
                  patient={patient}
                  editingSection={editingSection}
                  editData={editData}
                  onEdit={handleEdit}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  setEditData={setEditData}
                  validationErrors={validationErrors}
                  showValidation={showValidation}
                  isCreating={true}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

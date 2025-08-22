'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { Patient, PatientFormData } from '../types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  AlertTriangle,
  Heart,
  Shield,
  CreditCard,
  Settings,
  Users,
  Stethoscope,
  Clock,
  UserCheck,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Esquema de validación con Zod basado en el modelo completo del backend
const patientSchema = z.object({
  personalInfo: z.object({
    firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
    dateOfBirth: z.date().optional(),
    gender: z.enum(['male', 'female', 'non-binary', 'other', 'prefer-not-to-say']),
    nationality: z.string().optional(),
    idNumber: z.string().optional(),
    idType: z.enum(['dni', 'nie', 'passport', 'other']).optional(),
    occupation: z.string().optional(),
    employer: z.string().optional(),
    maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed', 'separated', 'domestic-partner']).optional(),
  }),
  contactInfo: z.object({
    email: z.string().email('Email inválido'),
    phone: z.string().min(9, 'El teléfono debe tener al menos 9 dígitos'),
    alternativePhone: z.string().optional(),
    preferredContactMethod: z.enum(['phone', 'email', 'sms', 'whatsapp']),
    address: z.object({
      street: z.string().min(1, 'La dirección es requerida'),
      city: z.string().min(1, 'La ciudad es requerida'),
      postalCode: z.string().min(5, 'Código postal inválido'),
      state: z.string().optional(),
      country: z.string().min(1, 'El país es requerido'),
    }),
  }),
  emergencyContact: z.object({
    name: z.string().min(1, 'El nombre del contacto de emergencia es requerido'),
    relationship: z.string().min(1, 'La relación es requerida'),
    phone: z.string().min(9, 'El teléfono debe tener al menos 9 dígitos'),
    email: z.string().email().optional().or(z.literal('')),
  }),
  clinicalInfo: z.object({
    medicalHistory: z.object({
      conditions: z.array(z.string()).optional(),
      medications: z.array(z.object({
        name: z.string(),
        dosage: z.string(),
        frequency: z.string(),
        prescribedBy: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
        active: z.boolean().optional(),
        notes: z.string().optional(),
      })).optional(),
      allergies: z.array(z.object({
        type: z.enum(['medication', 'food', 'environmental', 'other']),
        allergen: z.string(),
        severity: z.enum(['mild', 'moderate', 'severe']),
        reaction: z.string(),
        notes: z.string().optional(),
      })).optional(),
      surgeries: z.array(z.object({
        procedure: z.string(),
        date: z.date(),
        hospital: z.string().optional(),
        surgeon: z.string().optional(),
        notes: z.string().optional(),
      })).optional(),
      hospitalizations: z.array(z.object({
        reason: z.string(),
        admissionDate: z.date(),
        dischargeDate: z.date().optional(),
        hospital: z.string(),
        notes: z.string().optional(),
      })).optional(),
    }).optional(),
    mentalHealthHistory: z.object({
      previousTreatments: z.array(z.object({
        type: z.enum(['therapy', 'medication', 'hospitalization', 'other']),
        provider: z.string().optional(),
        startDate: z.date(),
        endDate: z.date().optional(),
        reason: z.string(),
        outcome: z.string().optional(),
        notes: z.string().optional(),
      })).optional(),
      diagnoses: z.array(z.object({
        condition: z.string(),
        diagnosedBy: z.string().optional(),
        diagnosisDate: z.date(),
        icdCode: z.string().optional(),
        status: z.enum(['active', 'resolved', 'in-remission', 'chronic']).optional(),
        severity: z.enum(['mild', 'moderate', 'severe']).optional(),
        notes: z.string().optional(),
      })).optional(),
      riskFactors: z.array(z.object({
        factor: z.string(),
        level: z.enum(['low', 'moderate', 'high']),
        notes: z.string().optional(),
        assessedDate: z.date(),
      })).optional(),
    }).optional(),
    currentTreatment: z.object({
      treatmentPlan: z.string().optional(),
      goals: z.array(z.string()).optional(),
      startDate: z.date().optional(),
      expectedDuration: z.string().optional(),
      frequency: z.string().optional(),
      notes: z.string().optional(),
    }).optional(),
  }).optional(),
  insurance: z.object({
    hasInsurance: z.boolean().optional(),
    paymentMethod: z.enum(['insurance', 'self-pay', 'sliding-scale', 'pro-bono']).optional(),
    primaryInsurance: z.object({
      provider: z.string().optional(),
      policyNumber: z.string().optional(),
      groupNumber: z.string().optional(),
      policyHolder: z.string().optional(),
      relationshipToPolicyHolder: z.enum(['self', 'spouse', 'child', 'other']).optional(),
      effectiveDate: z.date().optional(),
      expirationDate: z.date().optional(),
      copayAmount: z.number().optional(),
      deductibleAmount: z.number().optional(),
      coveragePercentage: z.number().optional(),
      mentalHealthBenefit: z.boolean().optional(),
      sessionLimit: z.number().optional(),
      sessionsUsed: z.number().optional(),
      authorizationRequired: z.boolean().optional(),
      authorizationNumber: z.string().optional(),
      notes: z.string().optional(),
    }).optional(),
    secondaryInsurance: z.object({
      provider: z.string().optional(),
      policyNumber: z.string().optional(),
      groupNumber: z.string().optional(),
      policyHolder: z.string().optional(),
      relationshipToPolicyHolder: z.enum(['self', 'spouse', 'child', 'other']).optional(),
      effectiveDate: z.date().optional(),
      expirationDate: z.date().optional(),
      copayAmount: z.number().optional(),
      deductibleAmount: z.number().optional(),
      coveragePercentage: z.number().optional(),
    }).optional(),
    financialAssistance: z.object({
      approved: z.boolean().optional(),
      discountPercentage: z.number().optional(),
      reason: z.string().optional(),
      validUntil: z.date().optional(),
    }).optional(),
  }).optional(),
  preferences: z.object({
    language: z.enum(['es', 'en', 'ca', 'eu', 'gl']).optional(),
    communicationPreferences: z.object({
      appointmentReminders: z.boolean().optional(),
      reminderMethods: z.array(z.enum(['email', 'sms', 'phone', 'push'])).optional(),
      reminderTiming: z.array(z.number()).optional(),
      newsletters: z.boolean().optional(),
      marketingCommunications: z.boolean().optional(),
    }).optional(),
    appointmentPreferences: z.object({
      preferredTimes: z.array(z.object({
        dayOfWeek: z.number().min(0).max(6),
        startTime: z.string(),
        endTime: z.string(),
      })).optional(),
      preferredProfessionals: z.array(z.string()).optional(),
      sessionFormat: z.enum(['in-person', 'video', 'phone', 'any']).optional(),
      sessionDuration: z.number().optional(),
      bufferBetweenSessions: z.number().optional(),
      notes: z.string().optional(),
    }).optional(),
    portalAccess: z.object({
      enabled: z.boolean().optional(),
      lastLogin: z.date().optional(),
      passwordLastChanged: z.date().optional(),
      twoFactorEnabled: z.boolean().optional(),
      loginNotifications: z.boolean().optional(),
    }).optional(),
  }).optional(),
  gdprConsent: z.object({
    dataProcessing: z.object({
      consented: z.boolean(),
      consentDate: z.date(),
      consentMethod: z.enum(['verbal', 'written', 'digital']),
      consentVersion: z.string().optional(),
      witnessedBy: z.string().optional(),
      notes: z.string().optional(),
    }),
    marketingCommunications: z.object({
      consented: z.boolean().optional(),
      consentDate: z.date().optional(),
      withdrawnDate: z.date().optional(),
      method: z.enum(['verbal', 'written', 'digital']).optional(),
    }).optional(),
    dataSharing: z.object({
      healthcareProfessionals: z.boolean().optional(),
      insuranceProviders: z.boolean().optional(),
      emergencyContacts: z.boolean().optional(),
      researchPurposes: z.boolean().optional(),
      consentDate: z.date(),
    }),
  }),
  status: z.enum(['active', 'inactive', 'discharged', 'transferred', 'deceased']).optional(),
  referral: z.object({
    source: z.enum(['self', 'physician', 'family', 'friend', 'insurance', 'online', 'other']).optional(),
    referringPhysician: z.object({
      name: z.string().optional(),
      specialty: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      notes: z.string().optional(),
    }).optional(),
    referringPerson: z.string().optional(),
    referralDate: z.date().optional(),
    referralReason: z.string().optional(),
    referralNotes: z.string().optional(),
  }).optional(),
});

type FormData = z.infer<typeof patientSchema>;

export default function PatientDetailsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  
  const patientId = searchParams.get('id');
  const isNewPatient = !patientId;
  const [isEditing, setIsEditing] = useState(isNewPatient);

  // Query para obtener el paciente (solo si no es nuevo)
  const {
    data: patient,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['patient', patientId],
    queryFn: async () => {
      console.log('🔍 Fetching patient with ID:', patientId);
      try {
        const response = await api.patients.get(patientId!);
        console.log('📦 API Response:', response);
        console.log('📦 API Response Data:', response.data);
        // La API devuelve { data: { patient: {...} } }, necesitamos extraer el paciente
        const patientData = response.data.data?.patient || response.data.data;
        console.log('📦 Extracted Patient Data:', patientData);
        return patientData;
      } catch (err) {
        console.error('❌ Error fetching patient:', err);
        throw err;
      }
    },
    enabled: !isNewPatient && !!patientId,
  });

  // Formulario
  const form = useForm<FormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      personalInfo: {
        firstName: '',
        lastName: '',
        dateOfBirth: undefined,
        gender: 'prefer-not-to-say',
        nationality: 'Española',
        idNumber: '',
        idType: 'dni',
        occupation: '',
        maritalStatus: 'single',
        employer: '',
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
          country: 'España',
        },
      },
      emergencyContact: {
        name: '',
        relationship: '',
        phone: '',
        email: '',
      },
      clinicalInfo: {
        medicalHistory: {
          conditions: [],
          medications: [],
          allergies: [],
          surgeries: [],
          hospitalizations: [],
        },
        mentalHealthHistory: {
          previousTreatments: [],
          diagnoses: [],
          riskFactors: [],
        },
        currentTreatment: {
          treatmentPlan: '',
          goals: [],
          startDate: undefined,
          expectedDuration: '',
          frequency: '',
          notes: '',
        },
      },
      insurance: {
        hasInsurance: false,
        paymentMethod: 'self-pay',
        primaryInsurance: undefined,
        secondaryInsurance: undefined,
        financialAssistance: undefined,
      },
      preferences: {
        language: 'es',
        communicationPreferences: {
          appointmentReminders: true,
          reminderMethods: ['email'],
          reminderTiming: [24],
          newsletters: false,
          marketingCommunications: false,
        },
        appointmentPreferences: {
          preferredTimes: [],
          preferredProfessionals: [],
          sessionFormat: 'in-person',
          sessionDuration: 50,
          bufferBetweenSessions: 0,
          notes: '',
        },
        portalAccess: {
          enabled: false,
          twoFactorEnabled: false,
          loginNotifications: true,
        },
      },
      gdprConsent: {
        dataProcessing: {
          consented: false,
          consentDate: new Date(),
          consentMethod: 'digital',
          consentVersion: '1.0',
          notes: '',
        },
        marketingCommunications: {
          consented: false,
          method: 'digital',
        },
        dataSharing: {
          healthcareProfessionals: true,
          insuranceProviders: false,
          emergencyContacts: true,
          researchPurposes: false,
          consentDate: new Date(),
        },
      },
      status: 'active',
      referral: {
        source: undefined,
        referralDate: undefined,
        referralReason: '',
        referralNotes: '',
      },
    },
  });

  // Debugging information
  console.log('🔧 Debug Info:', {
    patientId,
    isNewPatient,
    isLoading,
    error: error?.message,
    patient,
    isEditing,
  });

  // Cargar datos del paciente en el formulario y establecer modo visualización
  useEffect(() => {
    console.log('📝 useEffect triggered:', { patient, isNewPatient });
    if (patient && !isNewPatient) {
      console.log('✅ Cargando datos del paciente:', patient);
      console.log('🔍 Patient keys:', Object.keys(patient));
      console.log('🔍 Patient structure:', JSON.stringify(patient, null, 2));
      setIsEditing(false); // Cambiar a modo visualización cuando se carga un paciente
      
      // Mapear todos los datos del modelo completo del backend
      form.reset({
        personalInfo: {
          firstName: patient.personalInfo?.firstName ?? '',
          lastName: patient.personalInfo?.lastName ?? '',
          dateOfBirth: patient.personalInfo?.dateOfBirth ? new Date(patient.personalInfo.dateOfBirth) : undefined,
          gender: patient.personalInfo?.gender ?? 'prefer-not-to-say',
          nationality: patient.personalInfo?.nationality ?? '',
          idNumber: patient.personalInfo?.idNumber ?? '',
          idType: patient.personalInfo?.idType ?? 'dni',
          occupation: patient.personalInfo?.occupation ?? '',
          employer: patient.personalInfo?.employer ?? '',
          maritalStatus: patient.personalInfo?.maritalStatus ?? 'single',
        },
        contactInfo: {
          email: patient.contactInfo?.email ?? '',
          phone: patient.contactInfo?.phone ?? '',
          alternativePhone: patient.contactInfo?.alternativePhone ?? '',
          preferredContactMethod: patient.contactInfo?.preferredContactMethod ?? 'email',
          address: {
            street: patient.contactInfo?.address?.street ?? '',
            city: patient.contactInfo?.address?.city ?? '',
            postalCode: patient.contactInfo?.address?.postalCode ?? '',
            state: patient.contactInfo?.address?.state ?? '',
            country: patient.contactInfo?.address?.country ?? 'España',
          },
        },
        emergencyContact: {
          name: patient.emergencyContact?.name ?? '',
          relationship: patient.emergencyContact?.relationship ?? '',
          phone: patient.emergencyContact?.phone ?? '',
          email: patient.emergencyContact?.email ?? '',
        },
        clinicalInfo: {
          medicalHistory: {
            conditions: patient.clinicalInfo?.medicalHistory?.conditions ?? [],
            medications: patient.clinicalInfo?.medicalHistory?.medications ?? [],
            allergies: patient.clinicalInfo?.medicalHistory?.allergies ?? [],
            surgeries: patient.clinicalInfo?.medicalHistory?.surgeries ?? [],
            hospitalizations: patient.clinicalInfo?.medicalHistory?.hospitalizations ?? [],
          },
          mentalHealthHistory: {
            previousTreatments: patient.clinicalInfo?.mentalHealthHistory?.previousTreatments ?? [],
            diagnoses: patient.clinicalInfo?.mentalHealthHistory?.diagnoses ?? [],
            riskFactors: patient.clinicalInfo?.mentalHealthHistory?.riskFactors ?? [],
          },
          currentTreatment: {
            treatmentPlan: patient.clinicalInfo?.currentTreatment?.treatmentPlan ?? '',
            goals: patient.clinicalInfo?.currentTreatment?.goals ?? [],
            startDate: patient.clinicalInfo?.currentTreatment?.startDate ? new Date(patient.clinicalInfo.currentTreatment.startDate) : undefined,
            expectedDuration: patient.clinicalInfo?.currentTreatment?.expectedDuration ?? '',
            frequency: patient.clinicalInfo?.currentTreatment?.frequency ?? '',
            notes: patient.clinicalInfo?.currentTreatment?.notes ?? '',
          },
        },
        insurance: {
          hasInsurance: patient.insurance?.hasInsurance ?? false,
          paymentMethod: patient.insurance?.paymentMethod ?? 'self-pay',
          primaryInsurance: patient.insurance?.primaryInsurance ? {
            provider: patient.insurance.primaryInsurance.provider ?? '',
            policyNumber: patient.insurance.primaryInsurance.policyNumber ?? '',
            groupNumber: patient.insurance.primaryInsurance.groupNumber ?? '',
            policyHolder: patient.insurance.primaryInsurance.policyHolder ?? '',
            relationshipToPolicyHolder: patient.insurance.primaryInsurance.relationshipToPolicyHolder ?? 'self',
            effectiveDate: patient.insurance.primaryInsurance.effectiveDate ? new Date(patient.insurance.primaryInsurance.effectiveDate) : undefined,
            expirationDate: patient.insurance.primaryInsurance.expirationDate ? new Date(patient.insurance.primaryInsurance.expirationDate) : undefined,
            copayAmount: patient.insurance.primaryInsurance.copayAmount ?? 0,
            deductibleAmount: patient.insurance.primaryInsurance.deductibleAmount ?? 0,
            coveragePercentage: patient.insurance.primaryInsurance.coveragePercentage ?? 0,
            mentalHealthBenefit: patient.insurance.primaryInsurance.mentalHealthBenefit ?? false,
            sessionLimit: patient.insurance.primaryInsurance.sessionLimit ?? 0,
            sessionsUsed: patient.insurance.primaryInsurance.sessionsUsed ?? 0,
            authorizationRequired: patient.insurance.primaryInsurance.authorizationRequired ?? false,
            authorizationNumber: patient.insurance.primaryInsurance.authorizationNumber ?? '',
            notes: patient.insurance.primaryInsurance.notes ?? '',
          } : undefined,
          secondaryInsurance: patient.insurance?.secondaryInsurance,
          financialAssistance: patient.insurance?.financialAssistance,
        },
        preferences: {
          language: patient.preferences?.language ?? 'es',
          communicationPreferences: {
            appointmentReminders: patient.preferences?.communicationPreferences?.appointmentReminders ?? true,
            reminderMethods: patient.preferences?.communicationPreferences?.reminderMethods ?? ['email'],
            reminderTiming: patient.preferences?.communicationPreferences?.reminderTiming ?? [24],
            newsletters: patient.preferences?.communicationPreferences?.newsletters ?? false,
            marketingCommunications: patient.preferences?.communicationPreferences?.marketingCommunications ?? false,
          },
          appointmentPreferences: {
            preferredTimes: patient.preferences?.appointmentPreferences?.preferredTimes ?? [],
            preferredProfessionals: patient.preferences?.appointmentPreferences?.preferredProfessionals ?? [],
            sessionFormat: patient.preferences?.appointmentPreferences?.sessionFormat ?? 'in-person',
            sessionDuration: patient.preferences?.appointmentPreferences?.sessionDuration ?? 50,
            bufferBetweenSessions: patient.preferences?.appointmentPreferences?.bufferBetweenSessions ?? 0,
            notes: patient.preferences?.appointmentPreferences?.notes ?? '',
          },
          portalAccess: {
            enabled: patient.preferences?.portalAccess?.enabled ?? false,
            lastLogin: patient.preferences?.portalAccess?.lastLogin ? new Date(patient.preferences.portalAccess.lastLogin) : undefined,
            passwordLastChanged: patient.preferences?.portalAccess?.passwordLastChanged ? new Date(patient.preferences.portalAccess.passwordLastChanged) : undefined,
            twoFactorEnabled: patient.preferences?.portalAccess?.twoFactorEnabled ?? false,
            loginNotifications: patient.preferences?.portalAccess?.loginNotifications ?? true,
          },
        },
        gdprConsent: {
          dataProcessing: {
            consented: patient.gdprConsent?.dataProcessing?.consented ?? false,
            consentDate: patient.gdprConsent?.dataProcessing?.consentDate ? new Date(patient.gdprConsent.dataProcessing.consentDate) : new Date(),
            consentMethod: patient.gdprConsent?.dataProcessing?.consentMethod ?? 'digital',
            consentVersion: patient.gdprConsent?.dataProcessing?.consentVersion ?? '1.0',
            witnessedBy: patient.gdprConsent?.dataProcessing?.witnessedBy ?? '',
            notes: patient.gdprConsent?.dataProcessing?.notes ?? '',
          },
          marketingCommunications: {
            consented: patient.gdprConsent?.marketingCommunications?.consented ?? false,
            consentDate: patient.gdprConsent?.marketingCommunications?.consentDate ? new Date(patient.gdprConsent.marketingCommunications.consentDate) : undefined,
            withdrawnDate: patient.gdprConsent?.marketingCommunications?.withdrawnDate ? new Date(patient.gdprConsent.marketingCommunications.withdrawnDate) : undefined,
            method: patient.gdprConsent?.marketingCommunications?.method ?? 'digital',
          },
          dataSharing: {
            healthcareProfessionals: patient.gdprConsent?.dataSharing?.healthcareProfessionals ?? true,
            insuranceProviders: patient.gdprConsent?.dataSharing?.insuranceProviders ?? false,
            emergencyContacts: patient.gdprConsent?.dataSharing?.emergencyContacts ?? true,
            researchPurposes: patient.gdprConsent?.dataSharing?.researchPurposes ?? false,
            consentDate: patient.gdprConsent?.dataSharing?.consentDate ? new Date(patient.gdprConsent.dataSharing.consentDate) : new Date(),
          },
        },
        status: patient.status ?? 'active',
        referral: {
          source: patient.referral?.source,
          referringPhysician: patient.referral?.referringPhysician,
          referringPerson: patient.referral?.referringPerson ?? '',
          referralDate: patient.referral?.referralDate ? new Date(patient.referral.referralDate) : undefined,
          referralReason: patient.referral?.referralReason ?? '',
          referralNotes: patient.referral?.referralNotes ?? '',
        },
      });
      
      console.log('✅ Datos del paciente cargados completamente en el formulario');
    } else {
      console.log('❌ No se cargaron datos:', { patient: !!patient, isNewPatient });
    }
  }, [patient, isNewPatient, form]);

  // Mutación para crear
  const createMutation = useMutation({
    mutationFn: (data: FormData) => api.patients.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Paciente creado exitosamente');
      router.push(`/admin/patients/${response.data.data.id}`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al crear paciente');
    },
  });

  // Mutación para actualizar
  const updateMutation = useMutation({
    mutationFn: (data: FormData) => api.patients.update(patientId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', patientId] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Paciente actualizado exitosamente');
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al actualizar paciente');
    },
  });

  const onSubmit = (data: FormData) => {
    if (isNewPatient) {
      createMutation.mutate(data);
    } else {
      updateMutation.mutate(data);
    }
  };

  if (isLoading && !isNewPatient) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if ((error || !patient) && !isNewPatient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error al cargar paciente</h2>
        <Button onClick={() => router.back()} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            size="sm"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Button>
          
          <div className="flex items-center space-x-4">
            {!isNewPatient && (
              <Avatar className="h-12 w-12">
                <AvatarImage src={patient?.personalInfo?.profilePicture} />
                <AvatarFallback>
                  {patient?.personalInfo?.firstName?.charAt(0)}{patient?.personalInfo?.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
            )}
            <div>
              <h1 className="text-2xl font-bold">
                {isNewPatient 
                  ? 'Nuevo Paciente' 
                  : patient?.personalInfo?.fullName || 'Sin nombre'
                }
              </h1>
              {!isNewPatient && (
                <p className="text-muted-foreground">
                  ID: {patient?.id?.slice(-8) || 'N/A'}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {!isNewPatient && (
            <Badge variant={patient?.status === 'active' ? 'default' : 'secondary'}>
              {patient?.status === 'active' ? 'Activo' : 'Inactivo'}
            </Badge>
          )}
          
          {!isEditing && !isNewPatient ? (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button
                onClick={() => {
                  if (isNewPatient) {
                    router.back();
                  } else {
                    setIsEditing(false);
                  }
                }}
                variant="outline"
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button
                onClick={form.handleSubmit(onSubmit)}
                disabled={updateMutation.isPending || createMutation.isPending}
              >
                <Save className="mr-2 h-4 w-4" />
                {isNewPatient ? 'Crear Paciente' : 'Guardar'}
              </Button>
            </div>
          )}
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="personal" className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Personal</span>
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex items-center gap-1">
                <Phone className="h-4 w-4" />
                <span className="hidden sm:inline">Contacto</span>
              </TabsTrigger>
              <TabsTrigger value="emergency" className="flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                <span className="hidden sm:inline">Emergencia</span>
              </TabsTrigger>
              <TabsTrigger value="clinical" className="flex items-center gap-1">
                <Stethoscope className="h-4 w-4" />
                <span className="hidden sm:inline">Clínica</span>
              </TabsTrigger>
              <TabsTrigger value="insurance" className="flex items-center gap-1">
                <CreditCard className="h-4 w-4" />
                <span className="hidden sm:inline">Seguros</span>
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-1">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Preferencias</span>
              </TabsTrigger>
              <TabsTrigger value="gdpr" className="flex items-center gap-1">
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">GDPR</span>
              </TabsTrigger>
              <TabsTrigger value="referral" className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Referencias</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab 1: Información Personal */}
            <TabsContent value="personal" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Información Personal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="personalInfo.firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre *</FormLabel>
                          <FormControl>
                            {isEditing ? (
                              <Input {...field} />
                            ) : (
                              <div className="px-3 py-2 bg-muted rounded-md">{field.value || 'No especificado'}</div>
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="personalInfo.lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Apellidos *</FormLabel>
                          <FormControl>
                            {isEditing ? (
                              <Input {...field} />
                            ) : (
                              <div className="px-3 py-2 bg-muted rounded-md">{field.value || 'No especificado'}</div>
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="personalInfo.dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de Nacimiento</FormLabel>
                          <FormControl>
                            {isEditing ? (
                              <Input type="date" {...field} value={field.value ? field.value.toISOString().split('T')[0] : ''} onChange={(e) => field.onChange(new Date(e.target.value))} />
                            ) : (
                              <div className="px-3 py-2 bg-muted rounded-md">
                                {field.value ? field.value.toLocaleDateString('es-ES') : 'No especificada'}
                                {field.value && ` (${new Date().getFullYear() - field.value.getFullYear()} años)`}
                              </div>
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="personalInfo.gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Género</FormLabel>
                          <FormControl>
                            {isEditing ? (
                              <Select onValueChange={field.onChange} value={field.value}>
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="male">Masculino</SelectItem>
                                  <SelectItem value="female">Femenino</SelectItem>
                                  <SelectItem value="non-binary">No binario</SelectItem>
                                  <SelectItem value="other">Otro</SelectItem>
                                  <SelectItem value="prefer-not-to-say">Prefiero no decir</SelectItem>
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="px-3 py-2 bg-muted rounded-md">
                                {field.value === 'male' ? 'Masculino' : 
                                 field.value === 'female' ? 'Femenino' : 
                                 field.value === 'non-binary' ? 'No binario' :
                                 field.value === 'other' ? 'Otro' : 'Prefiero no decir'}
                              </div>
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="personalInfo.nationality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nacionalidad</FormLabel>
                          <FormControl>
                            {isEditing ? (
                              <Input {...field} value={field.value || ''} />
                            ) : (
                              <div className="px-3 py-2 bg-muted rounded-md">{field.value || 'No especificada'}</div>
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="personalInfo.idNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de Identificación</FormLabel>
                          <FormControl>
                            {isEditing ? (
                              <Input {...field} value={field.value || ''} />
                            ) : (
                              <div className="px-3 py-2 bg-muted rounded-md">{field.value || 'No especificado'}</div>
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="personalInfo.occupation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Ocupación</FormLabel>
                          <FormControl>
                            {isEditing ? (
                              <Input {...field} value={field.value || ''} />
                            ) : (
                              <div className="px-3 py-2 bg-muted rounded-md">{field.value || 'No especificada'}</div>
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="personalInfo.employer"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Empleador</FormLabel>
                          <FormControl>
                            {isEditing ? (
                              <Input {...field} value={field.value || ''} />
                            ) : (
                              <div className="px-3 py-2 bg-muted rounded-md">{field.value || 'No especificado'}</div>
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="personalInfo.maritalStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado Civil</FormLabel>
                        <FormControl>
                          {isEditing ? (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="single">Soltero/a</SelectItem>
                                <SelectItem value="married">Casado/a</SelectItem>
                                <SelectItem value="divorced">Divorciado/a</SelectItem>
                                <SelectItem value="widowed">Viudo/a</SelectItem>
                                <SelectItem value="separated">Separado/a</SelectItem>
                                <SelectItem value="domestic-partner">Pareja de hecho</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="px-3 py-2 bg-muted rounded-md">
                              {field.value === 'single' ? 'Soltero/a' :
                               field.value === 'married' ? 'Casado/a' :
                               field.value === 'divorced' ? 'Divorciado/a' :
                               field.value === 'widowed' ? 'Viudo/a' :
                               field.value === 'separated' ? 'Separado/a' :
                               field.value === 'domestic-partner' ? 'Pareja de hecho' : 'No especificado'}
                            </div>
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 2: Información de Contacto */}
            <TabsContent value="contact" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Phone className="mr-2 h-5 w-5" />
                    Información de Contacto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="contactInfo.email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contactInfo.phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teléfono *</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="contactInfo.alternativePhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teléfono alternativo</FormLabel>
                          <FormControl>
                            <Input {...field} value={field.value || ''} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

            {/* Dirección */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  Dirección
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="contactInfo.address.street"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dirección *</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <FormField
                    control={form.control}
                    name="contactInfo.address.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ciudad *</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactInfo.address.postalCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código Postal *</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactInfo.address.state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Provincia</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactInfo.address.country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>País *</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Contacto de Emergencia */}
            <Card>
              <CardHeader>
                <CardTitle>Contacto de Emergencia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="emergencyContact.name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre completo *</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="emergencyContact.relationship"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Relación *</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ej: Padre, Madre, Hermano/a..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="emergencyContact.phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono *</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="emergencyContact.email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
            </TabsContent>

            {/* Tab 3: Contacto de Emergencia */}
            <TabsContent value="emergency" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    Contacto de Emergencia
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="emergencyContact.name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre completo *</FormLabel>
                          <FormControl>
                            {isEditing ? (
                              <Input {...field} value={field.value || ''} />
                            ) : (
                              <div className="px-3 py-2 bg-muted rounded-md">{field.value || 'No especificado'}</div>
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="emergencyContact.relationship"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Relación *</FormLabel>
                          <FormControl>
                            {isEditing ? (
                              <Input {...field} placeholder="Ej: Padre, Madre, Hermano/a..." />
                            ) : (
                              <div className="px-3 py-2 bg-muted rounded-md">{field.value || 'No especificado'}</div>
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="emergencyContact.phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teléfono *</FormLabel>
                          <FormControl>
                            {isEditing ? (
                              <Input {...field} value={field.value || ''} />
                            ) : (
                              <div className="px-3 py-2 bg-muted rounded-md">{field.value || 'No especificado'}</div>
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="emergencyContact.email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            {isEditing ? (
                              <Input type="email" {...field} />
                            ) : (
                              <div className="px-3 py-2 bg-muted rounded-md">{field.value || 'No especificado'}</div>
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 4: Información Clínica */}
            <TabsContent value="clinical" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Stethoscope className="mr-2 h-5 w-5" />
                    Información Clínica
                  </CardTitle>
                  <CardDescription>Historial médico y de salud mental</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!isEditing ? (
                    <div className="text-muted-foreground">Información clínica disponible en modo edición</div>
                  ) : (
                    <div className="text-sm text-muted-foreground">Los campos de historial clínico se pueden gestionar en detalle desde el historial del paciente</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 5: Seguros */}
            <TabsContent value="insurance" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Información de Seguros
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="insurance.hasInsurance"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          {isEditing ? (
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                              className="h-4 w-4"
                            />
                          ) : (
                            <div className="px-3 py-2 bg-muted rounded-md">
                              {field.value ? 'Tiene seguro' : 'Sin seguro'}
                            </div>
                          )}
                        </FormControl>
                        <FormLabel className="!mt-0">Tiene seguro médico</FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="insurance.paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Método de pago</FormLabel>
                        <FormControl>
                          {isEditing ? (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="insurance">Seguro médico</SelectItem>
                                <SelectItem value="self-pay">Pago directo</SelectItem>
                                <SelectItem value="sliding-scale">Escala variable</SelectItem>
                                <SelectItem value="pro-bono">Pro bono</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="px-3 py-2 bg-muted rounded-md">
                              {field.value === 'insurance' ? 'Seguro médico' :
                               field.value === 'self-pay' ? 'Pago directo' :
                               field.value === 'sliding-scale' ? 'Escala variable' :
                               field.value === 'pro-bono' ? 'Pro bono' : 'No especificado'}
                            </div>
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 6: Preferencias */}
            <TabsContent value="preferences" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="mr-2 h-5 w-5" />
                    Preferencias
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="preferences.language"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Idioma preferido</FormLabel>
                        <FormControl>
                          {isEditing ? (
                            <Select onValueChange={field.onChange} value={field.value}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="es">Español</SelectItem>
                                <SelectItem value="en">Inglés</SelectItem>
                                <SelectItem value="ca">Catalán</SelectItem>
                                <SelectItem value="eu">Euskera</SelectItem>
                                <SelectItem value="gl">Gallego</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="px-3 py-2 bg-muted rounded-md">
                              {field.value === 'es' ? 'Español' :
                               field.value === 'en' ? 'Inglés' :
                               field.value === 'ca' ? 'Catalán' :
                               field.value === 'eu' ? 'Euskera' :
                               field.value === 'gl' ? 'Gallego' : 'Español'}
                            </div>
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 7: GDPR */}
            <TabsContent value="gdpr" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="mr-2 h-5 w-5" />
                    Consentimiento GDPR
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="gdprConsent.dataProcessing.consented"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          {isEditing ? (
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                              className="h-4 w-4"
                            />
                          ) : (
                            <div className="px-3 py-2 bg-muted rounded-md">
                              {field.value ? '✓ Consentimiento otorgado' : '✗ Sin consentimiento'}
                            </div>
                          )}
                        </FormControl>
                        <FormLabel className="!mt-0">Consiente el procesamiento de datos personales</FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gdprConsent.dataSharing.healthcareProfessionals"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2">
                        <FormControl>
                          {isEditing ? (
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                              className="h-4 w-4"
                            />
                          ) : (
                            <div className="px-3 py-2 bg-muted rounded-md">
                              {field.value ? '✓ Autorizado' : '✗ No autorizado'}
                            </div>
                          )}
                        </FormControl>
                        <FormLabel className="!mt-0">Compartir con profesionales sanitarios</FormLabel>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tab 8: Referencias */}
            <TabsContent value="referral" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="mr-2 h-5 w-5" />
                    Información de Referencia
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="referral.source"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fuente de referencia</FormLabel>
                        <FormControl>
                          {isEditing ? (
                            <Select onValueChange={field.onChange} value={field.value || ''}>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione una opción" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="self">Auto-referido</SelectItem>
                                <SelectItem value="physician">Médico</SelectItem>
                                <SelectItem value="family">Familia</SelectItem>
                                <SelectItem value="friend">Amigo</SelectItem>
                                <SelectItem value="insurance">Seguro</SelectItem>
                                <SelectItem value="online">Online</SelectItem>
                                <SelectItem value="other">Otro</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <div className="px-3 py-2 bg-muted rounded-md">
                              {field.value === 'self' ? 'Auto-referido' :
                               field.value === 'physician' ? 'Médico' :
                               field.value === 'family' ? 'Familia' :
                               field.value === 'friend' ? 'Amigo' :
                               field.value === 'insurance' ? 'Seguro' :
                               field.value === 'online' ? 'Online' :
                               field.value === 'other' ? 'Otro' : 'No especificado'}
                            </div>
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>

    </div>
  );
}

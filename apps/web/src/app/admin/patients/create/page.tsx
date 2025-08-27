'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { PatientCompactForm } from '@/components/admin/patient-compact-form';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeftIcon, 
  UserPlusIcon,
  FileTextIcon,
  SaveIcon,
  XIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function CreatePatientPage() {
  const router = useRouter();
  const { toast } = useToast();

  const createPatientMutation = useMutation({
    mutationFn: async (patientData: any) => {
      // Transform compact form data to match backend Patient model
      const transformedData = {
        personalInfo: {
          ...patientData.personalInfo,
          nationality: 'Española',
          placeOfBirth: patientData.contactInfo.address.city,
          occupation: 'No especificado',
          maritalStatus: 'single',
        },
        contactInfo: {
          ...patientData.contactInfo,
          alternativePhone: '',
          preferredContactMethod: 'email',
        },
        emergencyContact: {
          ...patientData.emergencyContact,
          email: '',
          address: patientData.contactInfo.address,
          isPrimaryContact: true,
        },
        clinicalInfo: {
          medicalHistory: {
            conditions: patientData.clinicalInfo?.primaryConcerns || [],
            medications: patientData.clinicalInfo?.currentMedications?.map((med: string) => ({
              name: med,
              dosage: 'No especificado',
              frequency: 'No especificado',
              startDate: new Date(),
              active: true,
              prescribedBy: 'No especificado'
            })) || [],
            allergies: patientData.clinicalInfo?.hasAllergies && patientData.clinicalInfo?.allergies ? 
              patientData.clinicalInfo.allergies.map((allergy: string) => ({
                type: 'other',
                allergen: allergy,
                severity: 'mild',
                reaction: 'No especificado'
              })) : [],
            surgeries: [],
            hospitalizations: []
          },
          mentalHealthHistory: {
            previousTreatments: [],
            diagnoses: [],
            riskFactors: []
          },
          currentTreatment: {
            goals: patientData.clinicalInfo?.primaryConcerns || [],
            startDate: new Date(),
            treatmentPlan: 'Plan inicial en desarrollo'
          }
        },
        insurance: {
          ...patientData.insurance,
          primaryInsurance: patientData.insurance.hasInsurance ? {
            provider: patientData.insurance.primaryProvider || '',
            policyNumber: patientData.insurance.policyNumber || '',
            policyHolder: `${patientData.personalInfo.firstName} ${patientData.personalInfo.lastName}`,
            relationshipToPolicyHolder: 'self',
            effectiveDate: new Date(),
            mentalHealthBenefit: true,
            authorizationRequired: false,
          } : undefined,
        },
        preferences: {
          language: patientData.preferences.language,
          communicationPreferences: {
            appointmentReminders: patientData.preferences.reminderEnabled,
            reminderMethods: ['email'],
            reminderTiming: [24, 2],
            newsletters: false,
            marketingCommunications: patientData.gdprConsent.marketingConsented,
          },
          appointmentPreferences: {
            preferredTimes: [],
            preferredProfessionals: [],
            sessionFormat: patientData.preferences.sessionFormat,
            sessionDuration: 50,
            notes: '',
          },
          portalAccess: {
            enabled: true,
            twoFactorEnabled: false,
            loginNotifications: true,
          },
        },
        gdprConsent: {
          dataProcessing: {
            consented: patientData.gdprConsent.dataProcessingConsented,
            consentDate: patientData.gdprConsent.consentDate,
            consentMethod: 'digital',
            consentVersion: '1.0',
          },
          marketingCommunications: {
            consented: patientData.gdprConsent.marketingConsented,
            consentDate: patientData.gdprConsent.marketingConsented ? patientData.gdprConsent.consentDate : undefined,
            method: 'digital',
          },
          dataSharing: {
            healthcareProfessionals: true,
            insuranceProviders: patientData.insurance.hasInsurance,
            emergencyContacts: true,
            consentDate: patientData.gdprConsent.consentDate,
          },
          rightToErasure: {
            requested: false,
          },
          dataPortability: {},
        },
        tags: patientData.tags.map((tagName: string) => ({
          name: tagName,
          category: 'administrative',
          addedBy: 'current-user-id', // This would be set by the API
          addedDate: new Date(),
        })),
        status: patientData.status,
        relationships: [],
        referral: {
          source: 'self',
        },
        statistics: {
          totalAppointments: 0,
          completedAppointments: 0,
          cancelledAppointments: 0,
          noShowAppointments: 0,
          totalInvoiceAmount: 0,
          totalPaidAmount: 0,
        },
        administrativeNotes: patientData.adminNotes ? [{
          noteId: `note-${Date.now()}`,
          content: patientData.adminNotes,
          category: 'general',
          isPrivate: false,
          addedBy: 'current-user-id',
          addedDate: new Date(),
        }] : [],
        profilePicture: patientData.personalInfo.profilePicture,
      };

      const response = await api.patients.create(transformedData);
      return response.data.data; // API wraps data in ApiResponse structure
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

  const handleSubmit = (patientData: any) => {
    createPatientMutation.mutate(patientData);
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/admin/patients')}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Crear Nuevo Paciente</h1>
            <p className="text-muted-foreground">
              Complete la información del nuevo paciente
            </p>
          </div>
        </div>
        
        {/* Status Badge */}
        <Badge variant="outline" className="flex items-center gap-2">
          <UserPlusIcon className="h-4 w-4" />
          Nuevo Registro
        </Badge>
      </div>


      {/* Create Patient Form Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileTextIcon className="h-5 w-5" />
            Información del Paciente
          </CardTitle>
          <CardDescription>
            Complete todos los campos requeridos para crear el perfil del paciente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PatientCompactForm
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={createPatientMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}

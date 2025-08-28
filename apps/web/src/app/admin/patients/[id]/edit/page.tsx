'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowLeftIcon, 
  EditIcon, 
  CalendarIcon, 
  UserIcon, 
  ClockIcon,
  KeyIcon,
  UserXIcon,
  TrashIcon,
  CogIcon
} from 'lucide-react';
import api from '@/lib/api';
import { PatientCompactForm } from '@/components/admin/patient-compact-form';
import { calculateAge } from '@/lib/utils';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface EditPatientPageProps {
  params: {
    id: string;
  };
}

export default function EditPatientPage({ params }: EditPatientPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Fetch patient data
  const { data: patient, isLoading, error } = useQuery({
    queryKey: ['patient', params.id],
    queryFn: async () => {
      const response = await api.patients.get(params.id);
      return response.data.data.patient;
    },
  });

  // Update patient mutation
  const updatePatientMutation = useMutation({
    mutationFn: async (patientData: any) => {
      // Direct update with minimal transformation for existing patient
      const updateData = {
        personalInfo: {
          ...patientData.personalInfo,
          fullName: `${patientData.personalInfo.firstName} ${patientData.personalInfo.lastName}`
        },
        contactInfo: patientData.contactInfo,
        emergencyContact: patientData.emergencyContact,
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
          currentTreatment: {
            goals: patientData.clinicalInfo?.primaryConcerns || [],
            startDate: new Date(),
            treatmentPlan: 'Plan en desarrollo'
          }
        },
        billing: patientData.billing,
        preferences: {
          language: patientData.preferences?.language || 'es',
          communicationPreferences: {
            appointmentReminders: patientData.preferences?.reminderEnabled ?? true,
            reminderMethods: ['email'],
            reminderTiming: [24, 2],
            newsletters: false,
            marketingCommunications: patientData.gdprConsent?.marketingConsented ?? false
          },
          appointmentPreferences: {
            preferredTimes: [],
            preferredProfessionals: [],
            sessionFormat: patientData.preferences?.sessionFormat || 'in-person',
            sessionDuration: 50,
            notes: ''
          }
        },
        gdprConsent: {
          dataProcessing: {
            consented: patientData.gdprConsent?.dataProcessingConsented ?? false,
            consentDate: patientData.gdprConsent?.consentDate || new Date(),
            consentMethod: 'digital',
            consentVersion: '1.0'
          },
          marketingCommunications: {
            consented: patientData.gdprConsent?.marketingConsented ?? false,
            consentDate: patientData.gdprConsent?.consentDate || new Date(),
            method: 'digital'
          },
          dataSharing: {
            consented: false,
            consentDate: new Date(),
            method: 'digital'
          }
        },
        tags: patientData.tags?.map((tag: string) => ({
          name: tag,
          category: 'administrative',
          addedBy: '507f1f77bcf86cd799439011', // Valid ObjectId
          addedDate: new Date()
        })) || [],
        status: patientData.status,
        lastModifiedBy: null
      };

      const response = await api.patients.update(params.id, updateData);
      return response.data.data;
    },
    onSuccess: () => {
      toast({
        title: "Paciente actualizado",
        description: "Los datos del paciente han sido actualizados exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['patient', params.id] });
      router.push(`/admin/patients/${params.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error al actualizar paciente",
        description: error.response?.data?.message || "Ha ocurrido un error inesperado.",
        variant: "destructive",
      });
    },
  });

  // Reset password mutation (placeholder - implement when API endpoint exists)
  const resetPasswordMutation = useMutation({
    mutationFn: async (): Promise<{ temporaryPassword: string }> => {
      // TODO: Implement reset password endpoint
      throw new Error('Reset password not implemented yet');
    },
    onSuccess: (data) => {
      toast({
        title: "Contraseña restablecida",
        description: `Nueva contraseña temporal: ${data.temporaryPassword}`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error al restablecer contraseña",
        description: error.message || "Ha ocurrido un error inesperado.",
        variant: "destructive",
      });
    },
  });

  // Deactivate patient mutation
  const deactivatePatientMutation = useMutation({
    mutationFn: async () => {
      const response = await api.patients.update(params.id, { status: 'inactive' });
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Paciente desactivado",
        description: "El paciente ha sido desactivado exitosamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['patient', params.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Error al desactivar paciente",
        description: error.response?.data?.message || "Ha ocurrido un error inesperado.",
        variant: "destructive",
      });
    },
  });

  // Soft delete patient mutation (change status to 'deleted')
  const deletePatientMutation = useMutation({
    mutationFn: async () => {
      const response = await api.patients.update(params.id, { 
        status: 'deleted',
        lastModifiedBy: 'current-user-id' // TODO: Get actual user ID from auth context
      });
      return response.data;
    },
    onSuccess: () => {
      toast({
        title: "Paciente eliminado",
        description: "El paciente ha sido marcado como eliminado. Sus datos se conservan para auditoría.",
      });
      queryClient.invalidateQueries({ queryKey: ['patient', params.id] });
      router.push('/admin/patients');
    },
    onError: (error: any) => {
      toast({
        title: "Error al eliminar paciente",
        description: error.response?.data?.message || "Ha ocurrido un error inesperado.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (patientData: any) => {
    updatePatientMutation.mutate(patientData);
  };

  const handleCancel = () => {
    router.push(`/admin/patients/${params.id}`);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-20" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Paciente no encontrado</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Cast patient data to avoid TypeScript errors
  const patientData = patient as any;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'discharged': return 'outline';
      case 'transferred': return 'destructive';
      case 'deleted': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header with Admin Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/admin/patients/${params.id}`)}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Editar Paciente</h1>
            <p className="text-muted-foreground">
              Modificar información del paciente
            </p>
          </div>
        </div>

        {/* Admin Actions Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">Acciones Admin</Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem 
              onClick={() => resetPasswordMutation.mutate()}
              disabled={resetPasswordMutation.isPending}
            >
              <KeyIcon className="h-4 w-4 mr-2" />
              Restablecer Contraseña
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => deactivatePatientMutation.mutate()}
              disabled={deactivatePatientMutation.isPending}
            >
              <UserXIcon className="h-4 w-4 mr-2" />
              Desactivar Paciente
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Eliminar Paciente
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>


      <Separator />

      {/* Edit Patient Form Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <EditIcon className="h-5 w-5" />
            Editar Paciente
          </CardTitle>
          <CardDescription>
            Modifique la información del paciente según sea necesario
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PatientCompactForm
            patient={{
              id: patientData?.id || patientData?._id,
              personalInfo: {
                firstName: patientData?.personalInfo?.firstName || '',
                lastName: patientData?.personalInfo?.lastName || '',
                dateOfBirth: patientData?.personalInfo?.dateOfBirth ? new Date(patientData.personalInfo.dateOfBirth) : new Date(),
                gender: patientData?.personalInfo?.gender || 'other',
                profilePicture: patientData?.profilePicture || '',
              },
              contactInfo: {
                email: patientData?.contactInfo?.email || '',
                phone: patientData?.contactInfo?.phone || '',
                address: {
                  street: patientData?.contactInfo?.address?.street || '',
                  city: patientData?.contactInfo?.address?.city || '',
                  state: patientData?.contactInfo?.address?.state || '',
                  postalCode: patientData?.contactInfo?.address?.postalCode || '',
                  country: patientData?.contactInfo?.address?.country || 'España',
                },
              },
              emergencyContact: {
                name: patientData?.emergencyContact?.name || '',
                relationship: patientData?.emergencyContact?.relationship || '',
                phone: patientData?.emergencyContact?.phone || '',
              },
              clinicalInfo: {
                medicalHistory: patientData?.clinicalInfo?.medicalHistory || '',
                mentalHealthHistory: patientData?.clinicalInfo?.mentalHealthHistory || '',
              },
              billing: {
                paymentMethod: patientData?.billing?.paymentMethod || 'stripe',
                preferredPaymentMethod: patientData?.billing?.preferredPaymentMethod || 'card',
                stripeCustomerId: patientData?.billing?.stripeCustomerId || '',
                billingNotes: patientData?.billing?.billingNotes || '',
              },
              gdprConsent: {
                dataProcessingConsented: patientData?.gdprConsent?.dataProcessing?.consented || false,
                marketingConsented: patientData?.gdprConsent?.marketingCommunications?.consented || false,
                consentDate: patientData?.gdprConsent?.dataProcessing?.consentDate ? new Date(patientData.gdprConsent.dataProcessing.consentDate) : new Date(),
              },
              tags: patientData.tags || [],
              status: patientData?.status || 'active',
              adminNotes: '',
            }}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isLoading={updatePatientMutation.isPending}
          />
        </CardContent>
      </Card>

      {/* Delete Confirmation Modal */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar paciente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción marcará al paciente como eliminado. Esta acción no se puede deshacer.
              <br />
              <br />
              <strong>Paciente:</strong> {patientData?.personalInfo?.firstName} {patientData?.personalInfo?.lastName}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletePatientMutation.mutate()}
              disabled={deletePatientMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deletePatientMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

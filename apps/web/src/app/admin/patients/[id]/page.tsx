'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { calculateAge } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeftIcon, 
  EditIcon, 
  PhoneIcon, 
  MailIcon, 
  MapPinIcon,
  CalendarIcon,
  HeartIcon,
  ShieldIcon,
  UserIcon,
  ClockIcon
} from 'lucide-react';

interface PatientDetailsPageProps {
  params: {
    id: string;
  };
}

export default function PatientDetailsPage({ params }: PatientDetailsPageProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  const { data: patient, isLoading, error } = useQuery({
    queryKey: ['patient', params.id],
    queryFn: async () => {
      const response = await api.patients.get(params.id);
      return response.data.data.patient;
    },
  });

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

  if (error || !patient) {
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/admin/patients')}>
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Detalles del Paciente</h1>
            <p className="text-muted-foreground">
              Información completa y administración
            </p>
          </div>
        </div>
        <Button onClick={() => router.push(`/admin/patients/${params.id}/edit`)}>
          <EditIcon className="h-4 w-4 mr-2" />
          Editar
        </Button>
      </div>

      {/* Patient Summary Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={patientData.personalInfo?.profilePicture || undefined} />
              <AvatarFallback className="text-2xl">
                {patientData.personalInfo?.firstName?.[0]}{patientData.personalInfo?.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">{patientData.personalInfo?.firstName} {patientData.personalInfo?.lastName}</h1>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant={getStatusColor(patientData.status)}>
                  {patientData.status}
                </Badge>
                <Badge variant="outline">
                  <span>Edad: {calculateAge(patientData.personalInfo?.dateOfBirth)} años</span>
                  <span>Género: {patientData.personalInfo?.gender}</span>
                </Badge>
                {patientData.tags?.map((tag: any, idx: number) => (
                  <Badge key={idx} variant="secondary">
                    {tag.name}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="text-right space-y-1">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ClockIcon className="h-4 w-4" />
                Creado: {new Date(patientData.createdAt).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <UserIcon className="h-4 w-4" />
                ID: {patientData._id?.slice(-8)}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Detailed Information Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="contact">Contacto</TabsTrigger>
          <TabsTrigger value="clinical">Clínico</TabsTrigger>
          <TabsTrigger value="billing">Facturación</TabsTrigger>
          <TabsTrigger value="notes">Notas</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  Información Personal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Fecha de Nacimiento</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(patientData.personalInfo?.dateOfBirth).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Género</p>
                  <p className="text-sm text-muted-foreground">
                    {patientData.personalInfo?.gender}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Nacionalidad</p>
                  <p className="text-sm text-muted-foreground">
                    {patientData.personalInfo?.nationality || 'No especificada'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Ocupación</p>
                  <p className="text-sm text-muted-foreground">
                    {patientData.personalInfo?.occupation || 'No especificada'}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Estadísticas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Total Citas</p>
                  <p className="text-sm text-muted-foreground">
                    {patientData.statistics?.totalAppointments || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Citas Completadas</p>
                  <p className="text-sm text-muted-foreground">
                    {patientData.statistics?.completedAppointments || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Primera Cita</p>
                  <p className="text-sm text-muted-foreground">
                    {patientData.statistics?.firstAppointmentDate 
                      ? new Date(patientData.statistics.firstAppointmentDate).toLocaleDateString()
                      : 'No registrada'
                    }
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PhoneIcon className="h-5 w-5" />
                  Información de Contacto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <MailIcon className="h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">Email</p>
                    <p className="text-sm text-muted-foreground">
                      {patientData.contactInfo?.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <PhoneIcon className="h-4 w-4" />
                  <div>
                    <p className="text-sm font-medium">Teléfono</p>
                    <p className="text-sm text-muted-foreground">
                      {patientData.contactInfo?.phone}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <MapPinIcon className="h-4 w-4 mt-1" />
                  <div>
                    <p className="text-sm font-medium">Dirección</p>
                    <p className="text-sm text-muted-foreground">
                      {patientData.contactInfo?.address?.street}<br />
                      {patientData.contactInfo?.address?.city}, {patientData.contactInfo?.address?.state}<br />
                      {patientData.contactInfo?.address?.postalCode}, {patientData.contactInfo?.address?.country}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card>
              <CardHeader>
                <CardTitle>Contacto de Emergencia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium">Nombre</p>
                  <p className="text-sm text-muted-foreground">
                    {patientData.emergencyContact?.name || 'No especificado'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Relación</p>
                  <p className="text-sm text-muted-foreground">
                    {patientData.emergencyContact?.relationship || 'No especificada'}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Teléfono</p>
                  <p className="text-sm text-muted-foreground">
                    {patientData.emergencyContact?.phone || 'No especificado'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clinical" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <HeartIcon className="h-5 w-5" />
                  Información Clínica
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Preocupaciones Principales</p>
                  <div className="flex flex-wrap gap-1">
                    {(patientData.clinicalInfo?.medicalHistory?.conditions?.length > 0 || 
                      patientData.clinicalInfo?.currentTreatment?.goals?.length > 0) ? (
                      [...(patientData.clinicalInfo?.medicalHistory?.conditions || []), 
                       ...(patientData.clinicalInfo?.currentTreatment?.goals || [])]
                       .filter((item: string) => item) // Remove empty strings
                       .map((concern: string, idx: number) => (
                        <Badge key={idx} variant="outline">{concern}</Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No especificadas</p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Medicación Actual</p>
                  <div className="flex flex-wrap gap-1">
                    {patientData.clinicalInfo?.medicalHistory?.medications?.length > 0 ? (
                      patientData.clinicalInfo.medicalHistory.medications.map((med: any, idx: number) => (
                        <Badge key={idx} variant="secondary">
                          {typeof med === 'string' ? med : med.name}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">Ninguna</p>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm font-medium mb-2">Alergias</p>
                  {patientData.clinicalInfo?.medicalHistory?.allergies?.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {patientData.clinicalInfo.medicalHistory.allergies.map((allergy: any, idx: number) => (
                        <Badge key={idx} variant="destructive">
                          {typeof allergy === 'string' ? allergy : allergy.allergen}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Sin alergias conocidas</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldIcon className="h-5 w-5" />
                Información de Facturación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Método de Pago</p>
                <p className="text-sm text-muted-foreground">
                  {patientData.insurance?.paymentMethod || 'No especificado'}
                </p>
              </div>
              <div>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <span>ID: {patientData._id}</span>
                  <Badge variant={patientData.status === 'active' ? 'default' : 'secondary'}>
                    {patientData.status === 'active' ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
                <p className="text-sm font-medium">¿Tiene Seguro?</p>
                <Badge variant={patientData.insurance?.hasInsurance ? 'default' : 'secondary'}>
                  {patientData.insurance?.hasInsurance ? 'Sí' : 'No'}
                </Badge>
              </div>
              {patientData.insurance?.hasInsurance && patientData.insurance?.primaryInsurance && (
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium">Proveedor de Seguro</p>
                    <p className="text-sm text-muted-foreground">
                      {patientData.insurance.primaryInsurance.provider}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Número de Póliza</p>
                    <p className="text-sm text-muted-foreground">
                      {patientData.insurance.primaryInsurance.policyNumber}
                    </p>
                  </div>
                </div>
              )}
              <div>
                <p className="text-sm font-medium">Total Facturado</p>
                <p className="text-sm text-muted-foreground">
                  €{patientData.statistics?.totalInvoiceAmount?.toFixed(2) || '0.00'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Total Pagado</p>
                <p className="text-sm text-muted-foreground">
                  €{patientData.statistics?.totalPaidAmount?.toFixed(2) || '0.00'}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notas Administrativas</CardTitle>
            </CardHeader>
            <CardContent>
              {patientData.administrativeNotes?.length > 0 ? (
                <div>
                  {patientData.administrativeNotes.map((note: any, idx: number) => (
                    <div key={idx} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{note.category}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(note.addedDate).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm">{note.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No hay notas administrativas.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

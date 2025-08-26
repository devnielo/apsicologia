'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';

// Icons
import { ArrowLeft, User, Save, Edit2, Phone, Shield, FileText, Settings, Users } from 'lucide-react';

// Constants
import { GENDER_OPTIONS, MARITAL_STATUS_OPTIONS } from '@apsicologia/shared/constants';

// Validation Schema
const patientSchema = z.object({
  personalInfo: z.object({
    firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(50, 'El nombre no puede exceder 50 caracteres').trim(),
    lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres').max(50, 'El apellido no puede exceder 50 caracteres').trim(),
    dateOfBirth: z.date({ required_error: 'La fecha de nacimiento es requerida', invalid_type_error: 'Debe ser una fecha válida' }).refine(date => date <= new Date(), { message: 'La fecha de nacimiento no puede ser futura' }),
    gender: z.enum(['male', 'female', 'non-binary', 'other', 'prefer-not-to-say'], { required_error: 'El género es requerido' }),
    nationality: z.string().optional(),
    idNumber: z.string().optional(),
    maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed', 'separated', 'domestic-partnership']).optional(),
  }),
  contactInfo: z.object({
    email: z.string().email('Formato de email inválido').optional(),
    phone: z.string().min(9, 'Número de teléfono inválido').optional(),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional(),
    }).optional(),
  }),
  emergencyContact: z.object({
    name: z.string().optional(),
    relationship: z.string().optional(),
    phone: z.string().optional(),
  }).optional(),
  clinicalInfo: z.object({
    currentTreatment: z.object({
      treatmentPlan: z.string().optional(),
      frequency: z.string().optional(),
      notes: z.string().optional(),
    }).optional(),
  }).optional(),
  insurance: z.object({
    hasInsurance: z.boolean().optional(),
    paymentMethod: z.enum(['insurance', 'self-pay', 'sliding-scale', 'pro-bono']).optional(),
  }).optional(),
  preferences: z.object({
    language: z.enum(['es', 'en', 'ca', 'eu', 'gl']).optional(),
  }).optional(),
  gdprConsent: z.object({
    dataProcessing: z.object({
      consented: z.boolean().default(false),
      consentDate: z.date().optional(),
    }),
    dataSharing: z.object({
      consented: z.boolean().default(false),
      consentDate: z.date().optional(),
    }),
  }),
  referral: z.object({
    source: z.string().optional(),
    referringPerson: z.string().optional(),
    referralDate: z.date().optional(),
    referralReason: z.string().optional(),
    referralNotes: z.string().optional(),
  }).optional(),
});

type FormData = z.infer<typeof patientSchema>;

function PatientFormPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  
  const patientId = searchParams.get('id');
  const isNewPatient = !patientId;
  const [isEditing, setIsEditing] = useState(isNewPatient);

  const form = useForm<FormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      personalInfo: {
        firstName: '',
        lastName: '',
        dateOfBirth: undefined,
        gender: undefined,
        nationality: '',
        idNumber: '',
        maritalStatus: undefined,
      },
      contactInfo: {
        email: '',
        phone: '',
        address: {
          street: '',
          city: '',
          postalCode: '',
          country: 'España',
        },
      },
      emergencyContact: {
        name: '',
        relationship: '',
        phone: '',
      },
      clinicalInfo: {
        currentTreatment: {
          treatmentPlan: '',
          frequency: '',
          notes: '',
        },
      },
      insurance: {
        hasInsurance: false,
        paymentMethod: undefined,
      },
      preferences: {
        language: 'es',
      },
      gdprConsent: {
        dataProcessing: {
          consented: false,
          consentDate: undefined,
        },
        dataSharing: {
          consented: false,
          consentDate: undefined,
        },
      },
      referral: {
        source: '',
        referringPerson: '',
        referralDate: undefined,
        referralReason: '',
        referralNotes: '',
      },
    },
  });

  const onSubmit = async (data: FormData) => {
    console.log('Form data:', data);
    // TODO: Implement API call
  };

  return (
    <div className="container mx-auto py-6 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-6">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin">Admin</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/admin/patients">Pacientes</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{isNewPatient ? 'Nuevo Paciente' : 'Editar Paciente'}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
            
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src="" />
                <AvatarFallback className="text-lg">
                  {form.watch('personalInfo.firstName')?.[0] || 'P'}
                  {form.watch('personalInfo.lastName')?.[0] || ''}
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isNewPatient ? 'Nuevo Paciente' : `${form.watch('personalInfo.firstName') || 'Paciente'} ${form.watch('personalInfo.lastName') || ''}`}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  {isNewPatient ? (
                    <Badge variant="secondary">Nuevo</Badge>
                  ) : (
                    <Badge variant="outline">Activo</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isNewPatient && (
              <Button
                variant="outline"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Edit2 className="h-4 w-4 mr-2" />
                {isEditing ? 'Cancelar' : 'Editar'}
              </Button>
            )}
            
            {isEditing && (
              <Button onClick={form.handleSubmit(onSubmit)}>
                <Save className="h-4 w-4 mr-2" />
                {isNewPatient ? 'Crear Paciente' : 'Guardar Cambios'}
              </Button>
            )}
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="personal" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Personal
              </TabsTrigger>
              <TabsTrigger value="clinical" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Clínico
              </TabsTrigger>
              <TabsTrigger value="contacts" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Contactos
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Preferencias
              </TabsTrigger>
              <TabsTrigger value="gdpr" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                GDPR
              </TabsTrigger>
              <TabsTrigger value="referral" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Referencia
              </TabsTrigger>
            </TabsList>

            {/* Personal Details Tab */}
            <TabsContent value="personal" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Información Personal</CardTitle>
                  <CardDescription>
                    Datos básicos del paciente
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="personalInfo.firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre</FormLabel>
                          <FormControl>
                            {isEditing ? (
                              <Input {...field} placeholder="Nombre del paciente" />
                            ) : (
                              <div className="h-10 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center text-sm">
                                {field.value || 'No especificado'}
                              </div>
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
                          <FormLabel>Apellidos</FormLabel>
                          <FormControl>
                            {isEditing ? (
                              <Input {...field} placeholder="Apellidos del paciente" />
                            ) : (
                              <div className="h-10 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center text-sm">
                                {field.value || 'No especificado'}
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
                                  <SelectValue placeholder="Seleccionar género" />
                                </SelectTrigger>
                                <SelectContent>
                                  {GENDER_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="h-10 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center text-sm">
                                {GENDER_OPTIONS.find(opt => opt.value === field.value)?.label || 'No especificado'}
                              </div>
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
                                  <SelectValue placeholder="Seleccionar estado civil" />
                                </SelectTrigger>
                                <SelectContent>
                                  {MARITAL_STATUS_OPTIONS.map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            ) : (
                              <div className="h-10 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center text-sm">
                                {MARITAL_STATUS_OPTIONS.find(opt => opt.value === field.value)?.label || 'No especificado'}
                              </div>
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

            {/* Clinical Info Tab */}
            <TabsContent value="clinical" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Información Clínica</CardTitle>
                  <CardDescription>
                    Historial médico y tratamiento actual
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="clinicalInfo.currentTreatment.treatmentPlan"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plan de Tratamiento</FormLabel>
                        <FormControl>
                          {isEditing ? (
                            <Textarea {...field} placeholder="Descripción del plan de tratamiento" />
                          ) : (
                            <div className="min-h-[80px] px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-sm">
                              {field.value || 'No especificado'}
                            </div>
                          )}
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="clinicalInfo.currentTreatment.frequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frecuencia de Sesiones</FormLabel>
                        <FormControl>
                          {isEditing ? (
                            <Input {...field} placeholder="Ej: Semanal, quincenal" />
                          ) : (
                            <div className="h-10 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center text-sm">
                              {field.value || 'No especificado'}
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

            {/* Contact Info Tab */}
            <TabsContent value="contacts" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-gray-900">Información de Contacto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="contactInfo.email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            {isEditing ? (
                              <Input {...field} type="email" placeholder="email@ejemplo.com" />
                            ) : (
                              <div className="h-10 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center text-sm">
                                {field.value || 'No especificado'}
                              </div>
                            )}
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contactInfo.phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teléfono</FormLabel>
                          <FormControl>
                            {isEditing ? (
                              <Input {...field} placeholder="+34 600 000 000" />
                            ) : (
                              <div className="h-10 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md flex items-center text-sm">
                                {field.value || 'No especificado'}
                              </div>
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

            {/* Other tabs would follow similar pattern... */}
            <TabsContent value="preferences">
              <Card>
                <CardHeader>
                  <CardTitle>Preferencias</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Configuración de preferencias del paciente</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="gdpr">
              <Card>
                <CardHeader>
                  <CardTitle>Consentimientos GDPR</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Gestión de consentimientos y privacidad</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="referral">
              <Card>
                <CardHeader>
                  <CardTitle>Información de Referencia</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Datos sobre cómo llegó el paciente</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </form>
      </Form>
    </div>
  );
}

export default PatientFormPage;
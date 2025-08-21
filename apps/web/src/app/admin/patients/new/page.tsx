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
} from 'lucide-react';

// Esquema de validación con Zod
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
    maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed']).optional(),
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
        return response.data.data;
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
      console.log('🔍 personalInfo:', patient.personalInfo);
      console.log('🔍 contactInfo:', patient.contactInfo);
      console.log('🔍 emergencyContact:', patient.emergencyContact);
      setIsEditing(false); // Cambiar a modo visualización cuando se carga un paciente
      form.reset({
        personalInfo: {
          firstName: patient.personalInfo?.firstName ?? '',
          lastName: patient.personalInfo?.lastName ?? '',
          dateOfBirth: patient.personalInfo?.dateOfBirth ? new Date(patient.personalInfo.dateOfBirth) : undefined,
          gender: patient.personalInfo?.gender ?? 'prefer-not-to-say',
          nationality: patient.personalInfo?.nationality ?? 'Española',
          idNumber: patient.personalInfo?.idNumber ?? '',
          idType: patient.personalInfo?.idType ?? 'dni',
          occupation: patient.personalInfo?.occupation ?? '',
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
      });
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

      {isEditing ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Información Personal */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="mr-2 h-5 w-5" />
                    Información Personal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="personalInfo.firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre *</FormLabel>
                          <FormControl>
                            <Input {...field} />
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
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="personalInfo.gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Género</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male">Masculino</SelectItem>
                              <SelectItem value="female">Femenino</SelectItem>
                              <SelectItem value="non-binary">No binario</SelectItem>
                              <SelectItem value="other">Otro</SelectItem>
                              <SelectItem value="prefer-not-to-say">Prefiero no decir</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="personalInfo.nationality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nacionalidad</FormLabel>
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

              {/* Información de Contacto */}
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
            </div>

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
          </form>
        </Form>
      ) : !isNewPatient && patient ? (
        /* Modo Visualización */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Información Personal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Información Personal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Nombre completo</Label>
                  <p className="text-sm">{patient.personalInfo?.fullName || 'No disponible'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Edad</Label>
                  <p className="text-sm">{patient.personalInfo?.age || 'No disponible'} años</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Género</Label>
                  <p className="text-sm">{patient.personalInfo?.gender || 'No especificado'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Nacionalidad</Label>
                  <p className="text-sm">{patient.personalInfo?.nationality || 'No disponible'}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Información de Contacto */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Phone className="mr-2 h-5 w-5" />
                Contacto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                <p className="text-sm">{patient.contactInfo?.email || 'No disponible'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Teléfono</Label>
                <p className="text-sm">{patient.contactInfo?.phone || 'No disponible'}</p>
              </div>
              {patient.contactInfo?.address && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Dirección</Label>
                  <p className="text-sm">
                    {patient.contactInfo.address.street}, {patient.contactInfo.address.city}, {patient.contactInfo.address.country}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Heart, 
  FileText,
  Save,
  X,
  Upload,
  Camera
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const patientSchema = z.object({
  personalInfo: z.object({
    firstName: z.string().min(1, 'El nombre es requerido'),
    lastName: z.string().min(1, 'Los apellidos son requeridos'),
    dateOfBirth: z.string().min(1, 'La fecha de nacimiento es requerida'),
    gender: z.enum(['male', 'female', 'non-binary', 'other', 'prefer-not-to-say']),
    idNumber: z.string().optional(),
    nationality: z.string().optional(),
    occupation: z.string().optional(),
    maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed', 'separated', 'domestic-partnership']).optional(),
  }),
  contactInfo: z.object({
    email: z.string().email('Email inválido'),
    phone: z.string().min(1, 'El teléfono es requerido'),
    alternativePhone: z.string().optional(),
    preferredContactMethod: z.enum(['email', 'phone', 'sms', 'whatsapp']),
    address: z.object({
      street: z.string().min(1, 'La dirección es requerida'),
      city: z.string().min(1, 'La ciudad es requerida'),
      postalCode: z.string().min(1, 'El código postal es requerido'),
      state: z.string().optional(),
      country: z.string().default('España'),
    }),
  }),
  emergencyContact: z.object({
    name: z.string().min(1, 'El nombre del contacto de emergencia es requerido'),
    relationship: z.string().min(1, 'La relación es requerida'),
    phone: z.string().min(1, 'El teléfono del contacto de emergencia es requerido'),
    email: z.string().email().optional().or(z.literal('')),
  }),
  status: z.enum(['active', 'inactive', 'discharged', 'transferred', 'deceased']).default('active'),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface Patient {
  _id?: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    fullName: string;
    dateOfBirth: Date;
    age: number;
    gender: string;
    profilePicture?: string;
    idNumber?: string;
    nationality?: string;
    occupation?: string;
    maritalStatus?: string;
  };
  contactInfo: {
    email: string;
    phone: string;
    alternativePhone?: string;
    preferredContactMethod: string;
    address: {
      street: string;
      city: string;
      postalCode: string;
      state?: string;
      country: string;
    };
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient?: Patient | null;
  onSave: (data: PatientFormData) => Promise<void>;
  isLoading?: boolean;
}

const genderOptions = [
  { value: 'male', label: 'Masculino' },
  { value: 'female', label: 'Femenino' },
  { value: 'non-binary', label: 'No binario' },
  { value: 'other', label: 'Otro' },
  { value: 'prefer-not-to-say', label: 'Prefiere no decir' },
];

const maritalStatusOptions = [
  { value: 'single', label: 'Soltero/a' },
  { value: 'married', label: 'Casado/a' },
  { value: 'divorced', label: 'Divorciado/a' },
  { value: 'widowed', label: 'Viudo/a' },
  { value: 'separated', label: 'Separado/a' },
  { value: 'domestic-partnership', label: 'Pareja de hecho' },
];

const contactMethodOptions = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Teléfono' },
  { value: 'sms', label: 'SMS' },
  { value: 'whatsapp', label: 'WhatsApp' },
];

const statusOptions = [
  { value: 'active', label: 'Activo' },
  { value: 'inactive', label: 'Inactivo' },
  { value: 'discharged', label: 'Alta médica' },
  { value: 'transferred', label: 'Transferido' },
  { value: 'deceased', label: 'Fallecido' },
];

export function PatientModal({ 
  isOpen, 
  onClose, 
  patient, 
  onSave, 
  isLoading = false 
}: PatientModalProps) {
  const [activeTab, setActiveTab] = useState('personal');
  const isEditing = !!patient;

  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      personalInfo: {
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        gender: 'prefer-not-to-say',
        idNumber: '',
        nationality: 'Española',
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
      status: 'active',
    },
  });

  // Cargar datos del paciente si estamos editando
  useEffect(() => {
    if (patient && isOpen) {
      form.reset({
        personalInfo: {
          firstName: patient.personalInfo.firstName,
          lastName: patient.personalInfo.lastName,
          dateOfBirth: format(new Date(patient.personalInfo.dateOfBirth), 'yyyy-MM-dd'),
          gender: patient.personalInfo.gender as any,
          idNumber: patient.personalInfo.idNumber || '',
          nationality: patient.personalInfo.nationality || 'Española',
          occupation: patient.personalInfo.occupation || '',
          maritalStatus: patient.personalInfo.maritalStatus as any || 'single',
        },
        contactInfo: {
          email: patient.contactInfo.email,
          phone: patient.contactInfo.phone,
          alternativePhone: patient.contactInfo.alternativePhone || '',
          preferredContactMethod: patient.contactInfo.preferredContactMethod as any,
          address: {
            street: patient.contactInfo.address.street,
            city: patient.contactInfo.address.city,
            postalCode: patient.contactInfo.address.postalCode,
            state: patient.contactInfo.address.state || '',
            country: patient.contactInfo.address.country,
          },
        },
        emergencyContact: {
          name: patient.emergencyContact.name,
          relationship: patient.emergencyContact.relationship,
          phone: patient.emergencyContact.phone,
          email: patient.emergencyContact.email || '',
        },
        status: patient.status as any,
      });
    } else if (!isOpen) {
      form.reset();
      setActiveTab('personal');
    }
  }, [patient, isOpen, form]);

  const handleSubmit = async (data: PatientFormData) => {
    try {
      await onSave(data);
      onClose();
    } catch (error) {
      console.error('Error al guardar paciente:', error);
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
              <User className="h-4 w-4 text-primary" />
            </div>
            {isEditing ? 'Editar Paciente' : 'Nuevo Paciente'}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Modifica la información del paciente. Los campos marcados con * son obligatorios.'
              : 'Completa la información del nuevo paciente. Los campos marcados con * son obligatorios.'
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="personal" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Personal
                </TabsTrigger>
                <TabsTrigger value="contact" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Contacto
                </TabsTrigger>
                <TabsTrigger value="emergency" className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Emergencia
                </TabsTrigger>
                <TabsTrigger value="status" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Estado
                </TabsTrigger>
              </TabsList>

              {/* Información Personal */}
              <TabsContent value="personal" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Información Personal</CardTitle>
                    <CardDescription>
                      Datos básicos de identificación del paciente
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Avatar y nombre */}
                    <div className="flex items-center gap-4">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={patient?.personalInfo.profilePicture} />
                        <AvatarFallback className="text-lg bg-gradient-to-br from-primary/20 to-primary/10">
                          {form.watch('personalInfo.firstName') && form.watch('personalInfo.lastName')
                            ? getInitials(form.watch('personalInfo.firstName'), form.watch('personalInfo.lastName'))
                            : <Camera className="h-6 w-6 text-muted-foreground" />
                          }
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Button type="button" variant="outline" size="sm">
                          <Upload className="mr-2 h-4 w-4" />
                          Subir foto
                        </Button>
                        <p className="text-xs text-muted-foreground mt-1">
                          JPG, PNG o GIF. Máximo 2MB.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="personalInfo.firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre *</FormLabel>
                            <FormControl>
                              <Input placeholder="Nombre del paciente" {...field} />
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
                              <Input placeholder="Apellidos del paciente" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="personalInfo.dateOfBirth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha de Nacimiento *</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
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
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar género" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {genderOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="personalInfo.idNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>DNI/NIE</FormLabel>
                            <FormControl>
                              <Input placeholder="12345678A" {...field} />
                            </FormControl>
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
                              <Input placeholder="Española" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="personalInfo.occupation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Profesión</FormLabel>
                            <FormControl>
                              <Input placeholder="Profesión del paciente" {...field} />
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
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar estado civil" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {maritalStatusOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Información de Contacto */}
              <TabsContent value="contact" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Información de Contacto</CardTitle>
                    <CardDescription>
                      Datos de contacto y dirección del paciente
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="contactInfo.email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="email@ejemplo.com" {...field} />
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
                            <FormLabel>Teléfono *</FormLabel>
                            <FormControl>
                              <Input placeholder="+34 600 000 000" {...field} />
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
                            <FormLabel>Teléfono Alternativo</FormLabel>
                            <FormControl>
                              <Input placeholder="+34 600 000 000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="contactInfo.preferredContactMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Método de Contacto Preferido</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Seleccionar método" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {contactMethodOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-sm font-medium">Dirección</h4>
                      <div className="grid grid-cols-1 gap-4">
                        <FormField
                          control={form.control}
                          name="contactInfo.address.street"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Dirección *</FormLabel>
                              <FormControl>
                                <Input placeholder="Calle, número, piso, puerta" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <FormField
                            control={form.control}
                            name="contactInfo.address.city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Ciudad *</FormLabel>
                                <FormControl>
                                  <Input placeholder="Ciudad" {...field} />
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
                                  <Input placeholder="28001" {...field} />
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
                                  <Input placeholder="Madrid" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="contactInfo.address.country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>País</FormLabel>
                              <FormControl>
                                <Input placeholder="España" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Contacto de Emergencia */}
              <TabsContent value="emergency" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Contacto de Emergencia</CardTitle>
                    <CardDescription>
                      Persona a contactar en caso de emergencia
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="emergencyContact.name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre Completo *</FormLabel>
                            <FormControl>
                              <Input placeholder="Nombre del contacto de emergencia" {...field} />
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
                              <Input placeholder="Padre, madre, cónyuge, hermano/a..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="emergencyContact.phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Teléfono *</FormLabel>
                            <FormControl>
                              <Input placeholder="+34 600 000 000" {...field} />
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
                              <Input type="email" placeholder="email@ejemplo.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Estado */}
              <TabsContent value="status" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Estado del Paciente</CardTitle>
                    <CardDescription>
                      Estado actual del paciente en el sistema
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="max-w-xs">
                                <SelectValue placeholder="Seleccionar estado" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {statusOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            El estado determina si el paciente aparece en las búsquedas activas
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Botones de acción */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                <Save className="mr-2 h-4 w-4" />
                {isLoading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear Paciente')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { TagInput } from "@/components/ui/tag-input"
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, UserIcon, PhoneIcon, HeartIcon, ShieldIcon, CogIcon } from 'lucide-react';
import {
  COUNTRIES,
  SPAIN_PROVINCES,
  GENDER_OPTIONS,
  OCCUPATION_OPTIONS,
  MARITAL_STATUS_OPTIONS,
  EMERGENCY_CONTACT_RELATIONSHIP_OPTIONS,
  PAYMENT_METHOD_OPTIONS,
  PATIENT_STATUS_OPTIONS,
  SESSION_FORMAT_OPTIONS,
  COMMON_CONCERNS,
  COMMON_MEDICATIONS,
  COMMON_ALLERGIES
} from '../../../../../packages/shared/src/constants/form-options';
import { calculateAge } from '@/lib/utils';

// Optimized Zod schema aligned with backend Patient model
const compactPatientSchema = z.object({
  // Essential personal info
  personalInfo: z.object({
    firstName: z.string().min(2).max(50),
    lastName: z.string().min(2).max(50),
    dateOfBirth: z.date(),
    gender: z.enum(['male', 'female', 'non-binary', 'other', 'prefer-not-to-say']),
    profilePicture: z.string().optional(),
  }),

  // Contact essentials
  contactInfo: z.object({
    email: z.string().email().toLowerCase(),
    phone: z.string().min(9),
    address: z.object({
      street: z.string().min(5),
      city: z.string().min(2),
      state: z.string().min(2),
      postalCode: z.string().min(5),
      country: z.string().default('España'),
    }),
  }),

  // Emergency contact (simplified)
  emergencyContact: z.object({
    name: z.string().min(2),
    relationship: z.string(),
    phone: z.string().min(9),
  }),

  // Clinical essentials
  clinicalInfo: z.object({
    primaryConcerns: z.array(z.string()).default([]),
    currentMedications: z.array(z.string()).default([]),
    allergies: z.array(z.string()).default([]),
    hasAllergies: z.boolean().default(false),
  }),

  // Billing and payment
  billing: z.object({
    paymentMethod: z.enum(['stripe', 'cash']).default('stripe'),
    preferredPaymentMethod: z.enum(['card', 'cash']).default('card'),
    stripeCustomerId: z.string().optional(),
    billingNotes: z.string().optional(),
  }),

  // Basic preferences
  preferences: z.object({
    language: z.string().default('es'),
    sessionFormat: z.enum(['in-person', 'video', 'phone', 'any']).default('in-person'),
    reminderEnabled: z.boolean().default(true),
  }),

  // GDPR essentials
  gdprConsent: z.object({
    dataProcessingConsented: z.boolean(),
    consentDate: z.date(),
    marketingConsented: z.boolean().default(false),
  }),

  // Status and tags
  status: z.enum(['active', 'inactive', 'discharged', 'transferred']).default('active'),
  tags: z.array(z.string()).optional().default([]),
  
  // Admin notes
  adminNotes: z.string().optional(),
});

type CompactPatientFormData = z.infer<typeof compactPatientSchema>;

interface PatientCompactFormProps {
  patient?: any;
  onSubmit: (data: CompactPatientFormData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function PatientCompactForm({
  patient,
  onSubmit,
  onCancel,
  isLoading = false
}: PatientCompactFormProps) {
  const [activeTab, setActiveTab] = useState('personal');

  const form = useForm<CompactPatientFormData>({
    resolver: zodResolver(compactPatientSchema),
    defaultValues: patient ? {
      personalInfo: {
        firstName: patient.personalInfo?.firstName || '',
        lastName: patient.personalInfo?.lastName || '',
        dateOfBirth: patient.personalInfo?.dateOfBirth ? new Date(patient.personalInfo.dateOfBirth) : new Date(),
        gender: patient.personalInfo?.gender || 'prefer-not-to-say',
        profilePicture: patient.profilePicture,
      },
      contactInfo: {
        email: patient.contactInfo?.email || '',
        phone: patient.contactInfo?.phone || '',
        address: {
          street: patient.contactInfo?.address?.street || '',
          city: patient.contactInfo?.address?.city || '',
          state: patient.contactInfo?.address?.state || '',
          postalCode: patient.contactInfo?.address?.postalCode || '',
          country: patient.contactInfo?.address?.country || 'España',
        },
      },
      emergencyContact: {
        name: patient.emergencyContact?.name || '',
        relationship: patient.emergencyContact?.relationship || '',
        phone: patient.emergencyContact?.phone || '',
      },
      clinicalInfo: {
        primaryConcerns: patient.clinicalInfo?.primaryConcerns || [],
        currentMedications: patient.clinicalInfo?.currentMedications || [],
        allergies: patient.clinicalInfo?.allergies || [],
        hasAllergies: patient.clinicalInfo?.hasAllergies || false,
      },
      billing: {
        paymentMethod: patient.billing?.paymentMethod || 'stripe',
        preferredPaymentMethod: patient.billing?.preferredPaymentMethod || 'card',
        stripeCustomerId: patient.billing?.stripeCustomerId,
        billingNotes: patient.billing?.billingNotes,
      },
      preferences: {
        language: patient.preferences?.language || 'es',
        sessionFormat: patient.preferences?.appointmentPreferences?.sessionFormat || 'in-person',
        reminderEnabled: patient.preferences?.communicationPreferences?.appointmentReminders ?? true,
      },
      gdprConsent: {
        dataProcessingConsented: patient.gdprConsent?.dataProcessing?.consented || false,
        consentDate: patient.gdprConsent?.dataProcessing?.consentDate ? new Date(patient.gdprConsent.dataProcessing.consentDate) : new Date(),
        marketingConsented: patient.gdprConsent?.marketingCommunications?.consented || false,
      },
      status: patient.status || 'active',
      tags: Array.isArray(patient.tags) ? patient.tags.filter(tag => typeof tag === 'string') : [],
      adminNotes: patient.administrativeNotes?.[0]?.content || '',
    } : {
      personalInfo: {
        firstName: '',
        lastName: '',
        dateOfBirth: new Date(),
        gender: 'prefer-not-to-say',
      },
      contactInfo: {
        email: '',
        phone: '',
        address: {
          street: '',
          city: '',
          state: '',
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
        primaryConcerns: [],
        currentMedications: [],
        allergies: [],
        hasAllergies: false,
      },
      billing: {
        paymentMethod: 'stripe',
        preferredPaymentMethod: 'card',
      },
      preferences: {
        language: 'es',
        sessionFormat: 'in-person',
        reminderEnabled: true,
      },
      gdprConsent: {
        dataProcessingConsented: false,
        consentDate: new Date(),
        marketingConsented: false,
      },
      status: 'active',
      tags: [],
    }
  });

  const handleSubmit = (data: CompactPatientFormData) => {
    console.log('🚀 PatientCompactForm handleSubmit called with data:', data);
    onSubmit(data);
  };

  const handleSubmitError = (errors: any) => {
    console.error('❌ PatientCompactForm submission failed with errors:', errors);
    console.error('❌ Form state:', {
      isValid: form.formState.isValid,
      isSubmitting: form.formState.isSubmitting,
      isSubmitted: form.formState.isSubmitted,
      isDirty: form.formState.isDirty,
      errors: form.formState.errors
    });
    const formData = form.getValues();
    console.error('❌ Current form data:', formData);
    console.error('❌ Tags in form data:', formData.tags);
    if (patient) {
      console.error('❌ Original patient tags:', patient.tags);
    }
  };

  // Auto-navigate to tab with validation errors
  useEffect(() => {
    const errors = form.formState.errors;
    const hasErrors = Object.keys(errors).length > 0;
    
    if (hasErrors && form.formState.isSubmitted) {
      // Map error paths to tab names
      const errorToTabMap: Record<string, string> = {
        'personalInfo': 'personal',
        'contactInfo': 'contact', 
        'emergencyContact': 'emergency',
        'clinicalInfo': 'clinical',
        'billing': 'billing',
        'preferences': 'settings',
        'gdprConsent': 'settings'
      };
      
      // Find first error and navigate to corresponding tab
      for (const errorPath of Object.keys(errors)) {
        const tabName = errorToTabMap[errorPath];
        if (tabName && tabName !== activeTab) {
          setActiveTab(tabName);
          break;
        }
      }
    }
  }, [form.formState.errors, form.formState.isSubmitted]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit, handleSubmitError)} className="space-y-6">
        
        {/* Header with Avatar */}
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={form.watch('personalInfo.profilePicture')} />
                <AvatarFallback className="text-lg">
                  {form.watch('personalInfo.firstName')?.[0]}{form.watch('personalInfo.lastName')?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <CardTitle className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5" />
                  Información del Paciente
                </CardTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant={form.watch('status') === 'active' ? 'default' : 'secondary'}>
                    {form.watch('status')}
                  </Badge>
                  {patient && patient.id && (
                    <Badge variant="outline">
                      ID: {patient.id}
                    </Badge>
                  )}
                  {form.watch('personalInfo.dateOfBirth') && (
                    <Badge variant="secondary">
                      Edad: {calculateAge(form.watch('personalInfo.dateOfBirth'))} años
                    </Badge>
                  )}
                  {form.watch('personalInfo.gender') && (
                    <Badge variant="secondary">
                      Género: {GENDER_OPTIONS.find((g) => g.value === form.watch('personalInfo.gender'))?.label || form.watch('personalInfo.gender')}
                    </Badge>
                  )}
                  {form.watch('tags')?.map((tag, idx) => (
                    <Badge key={idx} variant="outline">{tag}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Compact Tabbed Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="personal" className="flex items-center gap-1">
              <UserIcon className="h-4 w-4" />
              Personal
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-1">
              <PhoneIcon className="h-4 w-4" />
              Contacto
            </TabsTrigger>
            <TabsTrigger value="emergency" className="flex items-center gap-1">
              <CalendarIcon className="h-4 w-4" />
              Emergencia
            </TabsTrigger>
            <TabsTrigger value="clinical" className="flex items-center gap-1">
              <HeartIcon className="h-4 w-4" />
              Clínico
            </TabsTrigger>
            <TabsTrigger value="billing" className="flex items-center gap-1">
              <ShieldIcon className="h-4 w-4" />
              Facturación
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-1">
              <CogIcon className="h-4 w-4" />
              Config
            </TabsTrigger>
          </TabsList>

          {/* Personal Info Tab */}
          <TabsContent value="personal" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="personalInfo.firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
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
                        <FormLabel>Apellidos</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                        <FormLabel>Fecha de Nacimiento</FormLabel>
                        <FormControl>
                          <Input
                            type="date"
                            value={field.value ? field.value.toISOString().split('T')[0] : ''}
                            onChange={(e) => field.onChange(new Date(e.target.value))}
                          />
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
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {GENDER_OPTIONS.map((option) => (
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

          {/* Contact Info Tab */}
          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contactInfo.email"
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
                  <FormField
                    control={form.control}
                    name="contactInfo.phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactInfo.address.street"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Dirección</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactInfo.address.city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ciudad</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                        <FormLabel>Código Postal</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Emergency Contact Tab */}
          <TabsContent value="emergency" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="emergencyContact.name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre Contacto</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
                        <FormLabel>Relación</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar relación" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {EMERGENCY_CONTACT_RELATIONSHIP_OPTIONS.map((option) => (
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
                    name="emergencyContact.phone"
                    render={({ field }) => (
                      <FormItem className="col-span-2">
                        <FormLabel>Teléfono</FormLabel>
                        <FormControl>
                          <Input {...field} />
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
          <TabsContent value="clinical" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="clinicalInfo.hasAllergies"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <FormLabel>¿Tiene alergias?</FormLabel>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="clinicalInfo.currentMedications"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medicación Actual</FormLabel>
                          <FormControl>
                            <TagInput
                              value={field.value || []}
                              onChange={field.onChange}
                              placeholder="Buscar medicación o añadir nueva..."
                              suggestions={[...COMMON_MEDICATIONS]}
                              maxTags={10}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="clinicalInfo.primaryConcerns"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preocupaciones Principales</FormLabel>
                          <FormControl>
                            <TagInput
                              value={field.value || []}
                              onChange={field.onChange}
                              placeholder="Buscar preocupación o añadir nueva..."
                              suggestions={[...COMMON_CONCERNS]}
                              maxTags={8}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="clinicalInfo.allergies"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alergias</FormLabel>
                          <FormControl>
                            <TagInput
                              value={field.value || []}
                              onChange={field.onChange}
                              placeholder="Buscar alergia o añadir nueva..."
                              suggestions={[...COMMON_ALLERGIES]}
                              maxTags={12}
                            />
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

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="billing.paymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Método de Pago Principal</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="stripe">Tarjeta de Crédito (Stripe)</SelectItem>
                            <SelectItem value="cash">Pago en Efectivo</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="billing.preferredPaymentMethod"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Método Preferido</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="card">Tarjeta</SelectItem>
                            <SelectItem value="cash">Efectivo</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {form.watch('billing.paymentMethod') === 'stripe' && (
                    <FormField
                      control={form.control}
                      name="billing.stripeCustomerId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ID Cliente Stripe (Opcional)</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="cus_..." />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                  <FormField
                    control={form.control}
                    name="billing.billingNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notas de Facturación (Opcional)</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Notas adicionales sobre facturación..." />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado del Paciente</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PATIENT_STATUS_OPTIONS.map((option) => (
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
                    name="preferences.sessionFormat"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Formato de Sesión Preferido</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {SESSION_FORMAT_OPTIONS.map((option) => (
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
                    name="preferences.reminderEnabled"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <FormLabel>Recordatorios de Cita</FormLabel>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="gdprConsent.dataProcessingConsented"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between">
                        <FormLabel>Consentimiento RGPD</FormLabel>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="adminNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notas Administrativas</FormLabel>
                        <FormControl>
                          <Textarea 
                            {...field} 
                            placeholder="Notas internas para uso administrativo..."
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Guardando...' : patient ? 'Actualizar' : 'Crear Paciente'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

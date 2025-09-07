'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Save, X } from 'lucide-react';
import { api } from '@/lib/api';

// Import all sections
import { ProfessionalInfoSection } from '../components/ProfessionalInfoSection';
import { AvailabilitySection } from '../components/AvailabilitySection';
import { ServicesSection } from '../components/ServicesSection';
import { ContactSection } from '../components/ContactSection';
import { BillingSection } from '../components/BillingSection';
import { VacationsSection } from '../components/VacationsSection';
import { RoomsSection } from '../components/RoomsSection';
import { ProfilePictureSection } from '../components/ProfilePictureSection';
import { ScheduleSection } from '../components/ScheduleSection';

// Types
type SectionName = 'basicInfo' | 'contactInfo' | 'availability' | 'services' | 'billing' | 'vacations' | 'rooms' | 'profilePicture' | 'schedule';

const SECTION_NAMES = {
  BASIC_INFO: 'basicInfo' as const,
  CONTACT_INFO: 'contactInfo' as const,
  AVAILABILITY: 'availability' as const,
  SERVICES: 'services' as const,
  BILLING: 'billing' as const,
  VACATIONS: 'vacations' as const,
  ROOMS: 'rooms' as const,
  PROFILE_PICTURE: 'profilePicture' as const,
  SCHEDULE: 'schedule' as const,
};

interface ProfessionalFormData {
  // Basic Info
  name: string;
  email: string;
  phone?: string;
  title: string;
  bio?: string;
  licenseNumber?: string;
  specialties: string[];
  yearsOfExperience?: number;
  profilePicture?: string;
  status: 'active' | 'inactive' | 'on_leave' | 'suspended';
  isAcceptingNewPatients: boolean;
  maxPatientsPerDay?: number;
  address?: string;
  
  // Services
  assignedServices: Array<{
    serviceId: string;
    customPrice?: number;
    isActive: boolean;
  }>;
  
  // Availability
  weeklyAvailability: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }>;
  
  // Billing
  billingSettings: {
    defaultPaymentMethod: 'cash' | 'card' | 'transfer' | 'insurance';
    acceptsInsurance: boolean;
    insuranceProviders: string[];
    taxRate?: number;
  };
  
  // Vacations
  vacations: Array<{
    startDate: Date;
    endDate: Date;
    reason?: string;
    isRecurring?: boolean;
    recurrencePattern?: string;
  }>;
  
  // Rooms
  assignedRooms: string[];
  defaultRoom?: string;
  
  // Schedule
  schedule: {
    sessionDuration: number;
    breakBetweenSessions: number;
    weeklySchedule: {
      monday: { isActive: boolean; timeSlots: Array<{ start: string; end: string; }> };
      tuesday: { isActive: boolean; timeSlots: Array<{ start: string; end: string; }> };
      wednesday: { isActive: boolean; timeSlots: Array<{ start: string; end: string; }> };
      thursday: { isActive: boolean; timeSlots: Array<{ start: string; end: string; }> };
      friday: { isActive: boolean; timeSlots: Array<{ start: string; end: string; }> };
      saturday: { isActive: boolean; timeSlots: Array<{ start: string; end: string; }> };
      sunday: { isActive: boolean; timeSlots: Array<{ start: string; end: string; }> };
    };
  };
  
  // Settings
  settings: {
    allowOnlineBooking: boolean;
    requireApproval: boolean;
    maxAdvanceBookingDays: number;
    minAdvanceBookingHours: number;
    allowSameDayBooking: boolean;
    automaticConfirmation: boolean;
    sendReminders: boolean;
    reminderSettings: {
      email24h: boolean;
      email2h: boolean;
      sms24h: boolean;
      sms2h: boolean;
    };
  };
  
  // Time management
  bufferMinutes: number;
  timezone: string;
  defaultServiceDuration: number;
}

const getDefaultFormData = (): ProfessionalFormData => ({
  name: '',
  email: '',
  phone: '',
  title: 'Psicólogo',
  bio: '',
  licenseNumber: '',
  specialties: [],
  yearsOfExperience: 0,
  profilePicture: '',
  status: 'active',
  isAcceptingNewPatients: true,
  maxPatientsPerDay: 8,
  
  address: '',
  
  assignedServices: [],
  
  weeklyAvailability: [
    { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isAvailable: true },
    { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isAvailable: true },
    { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isAvailable: true },
    { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isAvailable: true },
    { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', isAvailable: true },
    { dayOfWeek: 6, startTime: '09:00', endTime: '13:00', isAvailable: false },
    { dayOfWeek: 0, startTime: '09:00', endTime: '13:00', isAvailable: false },
  ],
  
  billingSettings: {
    defaultPaymentMethod: 'cash',
    acceptsInsurance: false,
    insuranceProviders: [],
    taxRate: 21,
  },
  
  vacations: [],
  assignedRooms: [],
  defaultRoom: '',
  
  schedule: {
    sessionDuration: 60,
    breakBetweenSessions: 15,
    weeklySchedule: {
      monday: { isActive: true, timeSlots: [{ start: '09:00', end: '17:00' }] },
      tuesday: { isActive: true, timeSlots: [{ start: '09:00', end: '17:00' }] },
      wednesday: { isActive: true, timeSlots: [{ start: '09:00', end: '17:00' }] },
      thursday: { isActive: true, timeSlots: [{ start: '09:00', end: '17:00' }] },
      friday: { isActive: true, timeSlots: [{ start: '09:00', end: '17:00' }] },
      saturday: { isActive: false, timeSlots: [] },
      sunday: { isActive: false, timeSlots: [] }
    }
  },
  
  settings: {
    allowOnlineBooking: true,
    requireApproval: false,
    maxAdvanceBookingDays: 30,
    minAdvanceBookingHours: 2,
    allowSameDayBooking: true,
    automaticConfirmation: true,
    sendReminders: true,
    reminderSettings: {
      email24h: true,
      email2h: false,
      sms24h: false,
      sms2h: false,
    },
  },
  
  bufferMinutes: 10,
  timezone: 'Europe/Madrid',
  defaultServiceDuration: 55,
});

export default function ProfessionalFormPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  
  // Determine if we're in create or edit mode
  const professionalId = params.id?.[0];
  const isCreateMode = !professionalId;
  
  // State
  const [formData, setFormData] = useState<ProfessionalFormData>(getDefaultFormData());
  const [editingSection, setEditingSection] = useState<SectionName | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showValidation, setShowValidation] = useState(false);
  const [activeTab, setActiveTab] = useState('basicInfo');

  // Fetch professional data if in edit mode
  const { data: professionalData, isLoading, error } = useQuery({
    queryKey: ['professional', professionalId],
    queryFn: async () => {
      if (!professionalId) return null;
      const response = await api.professionals.get(professionalId);
      return response.data.data;
    },
    enabled: !isCreateMode,
  });

  // Create professional mutation
  const createProfessionalMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await api.professionals.create(data);
      return response.data;
    },
    onSuccess: (responseData) => {
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
      toast({
        title: 'Éxito',
        description: 'Profesional creado correctamente',
      });
      router.push('/admin/professionals');
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo crear el profesional',
        variant: 'destructive'
      });
    }
  });

  // Update professional mutation
  const updateProfessionalMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.professionals.update(id, data);
      return response.data;
    },
    onSuccess: (responseData) => {
      const updatedProfessional = responseData.data?.professional || responseData.data;
      queryClient.setQueryData(['professional', professionalId], updatedProfessional);
      queryClient.invalidateQueries({ queryKey: ['professional', professionalId] });
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
      setEditingSection(null);
      setValidationErrors([]);
      setShowValidation(false);
      toast({
        title: 'Éxito',
        description: 'Profesional actualizado correctamente',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'No se pudo actualizar el profesional',
        variant: 'destructive'
      });
    }
  });

  // Initialize form data when professional data is loaded
  useEffect(() => {
    if (professionalData && !isCreateMode) {
      setFormData({
        name: professionalData.name || '',
        email: professionalData.email || '',
        phone: professionalData.phone || '',
        title: professionalData.title || 'Psicólogo',
        bio: professionalData.bio || '',
        licenseNumber: professionalData.licenseNumber || '',
        specialties: professionalData.specialties || [],
        yearsOfExperience: professionalData.yearsOfExperience || 0,
        profilePicture: professionalData.profilePicture || '',
        status: professionalData.status || 'active',
        isAcceptingNewPatients: professionalData.isAcceptingNewPatients ?? true,
        maxPatientsPerDay: professionalData.maxPatientsPerDay || 8,
        
        address: professionalData.address || '',
        
        assignedServices: professionalData.assignedServices?.map((as: any) => ({
          serviceId: as.serviceId?.id || as.serviceId,
          customPrice: as.customPrice,
          isActive: as.isActive ?? true,
        })) || [],
        
        weeklyAvailability: professionalData.weeklyAvailability || getDefaultFormData().weeklyAvailability,
        
        billingSettings: professionalData.billingSettings || getDefaultFormData().billingSettings,
        
        vacations: professionalData.vacations || [],
        assignedRooms: professionalData.assignedRooms?.map((room: any) => room.id || room) || [],
        defaultRoom: professionalData.defaultRoom?.id || professionalData.defaultRoom || '',
        
        schedule: professionalData.schedule || getDefaultFormData().schedule,
        
        settings: professionalData.settings || getDefaultFormData().settings,
        
        bufferMinutes: professionalData.bufferMinutes || 10,
        timezone: professionalData.timezone || 'Europe/Madrid',
        defaultServiceDuration: professionalData.defaultServiceDuration || 55,
      });
    }
  }, [professionalData, isCreateMode]);

  const handleEdit = (section: SectionName, data: any) => {
    setEditingSection(section);
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleSave = async (section: SectionName, data: any) => {
    try {
      setShowValidation(true);
      
      // Basic validation
      const errors: string[] = [];
      
      if (section === SECTION_NAMES.BASIC_INFO) {
        if (!data.name?.trim()) errors.push('El nombre es requerido');
        if (!data.email?.trim()) errors.push('El email es requerido');
      }
      
      if (errors.length > 0) {
        setValidationErrors(errors);
        return;
      }

      // Update form data
      const updatedFormData = { ...formData, ...data };
      setFormData(updatedFormData);

      if (isCreateMode) {
        // In create mode, just update local state
        setEditingSection(null);
        setValidationErrors([]);
        setShowValidation(false);
      } else {
        // In edit mode, save to backend
        await updateProfessionalMutation.mutateAsync({
          id: professionalId!,
          data: data
        });
      }
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: 'Error',
        description: 'No se pudo guardar la información',
        variant: 'destructive'
      });
    }
  };

  const handleCancel = () => {
    setEditingSection(null);
    setValidationErrors([]);
    setShowValidation(false);
  };

  const handleSubmit = async () => {
    try {
      // Validate required fields
      const errors: string[] = [];
      if (!formData.name?.trim()) errors.push('El nombre es requerido');
      if (!formData.email?.trim()) errors.push('El email es requerido');
      
      if (errors.length > 0) {
        setValidationErrors(errors);
        setShowValidation(true);
        setActiveTab('basicInfo');
        return;
      }

      await createProfessionalMutation.mutateAsync(formData);
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  if (isLoading && !isCreateMode) {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="w-80 p-4">
          <Skeleton className="h-96 w-full" />
        </div>
        <div className="flex-1 p-4">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error && !isCreateMode) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-foreground mb-2">
            Error al cargar el profesional
          </h1>
          <p className="text-muted-foreground mb-4 text-sm">
            No se pudo cargar la información del profesional.
          </p>
          <Button size="sm" onClick={() => router.push('/admin/professionals')} className="medical-button-primary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a profesionales
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border/30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-14 items-center px-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin/professionals')}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-foreground">
              {isCreateMode ? 'Crear Profesional' : `Editar: ${formData.name || 'Profesional'}`}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isCreateMode ? 'Complete la información del nuevo profesional' : 'Modifique la información del profesional'}
            </p>
          </div>

          {isCreateMode && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/admin/professionals')}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={createProfessionalMutation.isPending}
                className="medical-button-primary"
              >
                <Save className="h-4 w-4 mr-2" />
                {createProfessionalMutation.isPending ? 'Guardando...' : 'Crear Profesional'}
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex">
        {/* Sidebar */}
        <div className="w-80 border-r border-border/30 bg-muted/30 p-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="w-full">
            <TabsList className="grid w-full grid-cols-1 h-auto bg-transparent p-0 space-y-1">
              <TabsTrigger value="basicInfo" className="w-full justify-start data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Información Básica
              </TabsTrigger>
              <TabsTrigger value="contactInfo" className="w-full justify-start data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Información de Contacto
              </TabsTrigger>
              <TabsTrigger value="availability" className="w-full justify-start data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Disponibilidad
              </TabsTrigger>
              <TabsTrigger value="services" className="w-full justify-start data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Servicios
              </TabsTrigger>
              <TabsTrigger value="billing" className="w-full justify-start data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Facturación
              </TabsTrigger>
              <TabsTrigger value="rooms" className="w-full justify-start data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Salas
              </TabsTrigger>
              <TabsTrigger value="vacations" className="w-full justify-start data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Vacaciones
              </TabsTrigger>
              <TabsTrigger value="profilePicture" className="w-full justify-start data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Foto de Perfil
              </TabsTrigger>
              <TabsTrigger value="schedule" className="w-full justify-start data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Horarios
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsContent value="basicInfo" className="mt-0">
              <ProfessionalInfoSection
                professional={formData as any}
                isEditing={editingSection === SECTION_NAMES.BASIC_INFO || isCreateMode}
                editData={formData}
                onEdit={(data) => handleEdit(SECTION_NAMES.BASIC_INFO, data)}
                onSave={(data) => handleSave(SECTION_NAMES.BASIC_INFO, data)}
                validationErrors={validationErrors}
                showValidation={showValidation}
                isCreateMode={isCreateMode}
              />
            </TabsContent>

            <TabsContent value="contactInfo" className="mt-0">
              <ContactSection
                professional={formData as any}
                isEditing={editingSection === SECTION_NAMES.CONTACT_INFO || isCreateMode}
                editData={{ phone: formData.phone || '', email: formData.email || '', address: formData.address || '' }}
                onEdit={(data) => handleEdit(SECTION_NAMES.CONTACT_INFO, data)}
                onSave={(data) => handleSave(SECTION_NAMES.CONTACT_INFO, data)}
                validationErrors={validationErrors}
                showValidation={showValidation}
                isCreateMode={isCreateMode}
              />
            </TabsContent>

            <TabsContent value="availability" className="mt-0">
              <AvailabilitySection
                professional={formData as any}
                isEditing={editingSection === SECTION_NAMES.AVAILABILITY || isCreateMode}
                editData={formData.weeklyAvailability}
                onEdit={(data) => handleEdit(SECTION_NAMES.AVAILABILITY, { weeklyAvailability: data })}
                onSave={(data) => handleSave(SECTION_NAMES.AVAILABILITY, { weeklyAvailability: data })}
                validationErrors={validationErrors}
                showValidation={showValidation}
                isCreateMode={isCreateMode}
              />
            </TabsContent>

            <TabsContent value="services" className="mt-0">
              <ServicesSection
                professional={formData as any}
                isEditing={editingSection === SECTION_NAMES.SERVICES || isCreateMode}
                editData={formData.assignedServices}
                onEdit={(data) => handleEdit(SECTION_NAMES.SERVICES, { assignedServices: data })}
                onSave={(data) => handleSave(SECTION_NAMES.SERVICES, { assignedServices: data })}
                validationErrors={validationErrors}
                showValidation={showValidation}
                isCreateMode={isCreateMode}
              />
            </TabsContent>

            <TabsContent value="billing" className="mt-0">
              <BillingSection
                professional={formData as any}
                isEditing={editingSection === SECTION_NAMES.BILLING || isCreateMode}
                editData={formData.billingSettings}
                onEdit={(data) => handleEdit(SECTION_NAMES.BILLING, { billingSettings: data })}
                onSave={(data) => handleSave(SECTION_NAMES.BILLING, { billingSettings: data })}
                validationErrors={validationErrors}
                showValidation={showValidation}
                isCreateMode={isCreateMode}
              />
            </TabsContent>

            <TabsContent value="rooms" className="mt-0">
              <RoomsSection
                professional={formData as any}
                isEditing={editingSection === SECTION_NAMES.ROOMS || isCreateMode}
                editData={{ assignedRooms: formData.assignedRooms, defaultRoom: formData.defaultRoom }}
                onEdit={(data) => handleEdit(SECTION_NAMES.ROOMS, data)}
                onSave={(data) => handleSave(SECTION_NAMES.ROOMS, data)}
                validationErrors={validationErrors}
                showValidation={showValidation}
                isCreateMode={isCreateMode}
              />
            </TabsContent>

            <TabsContent value="vacations" className="mt-0">
              <VacationsSection
                professional={formData as any}
                isEditing={editingSection === SECTION_NAMES.VACATIONS || isCreateMode}
                editData={formData.vacations}
                onEdit={(data) => handleEdit(SECTION_NAMES.VACATIONS, { vacations: data })}
                onSave={(data) => handleSave(SECTION_NAMES.VACATIONS, { vacations: data })}
                validationErrors={validationErrors}
                showValidation={showValidation}
                isCreateMode={isCreateMode}
              />
            </TabsContent>

            <TabsContent value="profilePicture" className="mt-0">
              <ProfilePictureSection
                professional={formData as any}
                isEditing={editingSection === SECTION_NAMES.PROFILE_PICTURE || isCreateMode}
                editData={{ profilePicture: formData.profilePicture }}
                onEdit={(data) => handleEdit(SECTION_NAMES.PROFILE_PICTURE, data)}
                onSave={(data) => handleSave(SECTION_NAMES.PROFILE_PICTURE, data)}
                validationErrors={validationErrors}
                showValidation={showValidation}
                isCreateMode={isCreateMode}
              />
            </TabsContent>

            <TabsContent value="schedule" className="mt-0">
              <ScheduleSection
                professional={formData as any}
                isEditing={editingSection === SECTION_NAMES.SCHEDULE || isCreateMode}
                editData={{
                  maxPatientsPerDay: formData.maxPatientsPerDay || 8,
                  sessionDuration: formData.schedule.sessionDuration,
                  breakBetweenSessions: formData.schedule.breakBetweenSessions,
                  weeklySchedule: formData.schedule.weeklySchedule
                }}
                onEdit={(data) => handleEdit(SECTION_NAMES.SCHEDULE, {
                  maxPatientsPerDay: data.maxPatientsPerDay,
                  schedule: {
                    sessionDuration: data.sessionDuration,
                    breakBetweenSessions: data.breakBetweenSessions,
                    weeklySchedule: data.weeklySchedule
                  }
                })}
                onSave={(data) => handleSave(SECTION_NAMES.SCHEDULE, {
                  maxPatientsPerDay: data.maxPatientsPerDay,
                  schedule: {
                    sessionDuration: data.sessionDuration,
                    breakBetweenSessions: data.breakBetweenSessions,
                    weeklySchedule: data.weeklySchedule
                  }
                })}
                validationErrors={validationErrors}
                showValidation={showValidation}
                isCreateMode={isCreateMode}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

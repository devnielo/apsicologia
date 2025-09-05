'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, Save, X, User, Settings, Clock, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiClient } from '@/lib/api';
import type { IProfessional, IProfessionalCreateInput } from '@shared/types/professional';

// Import section components
import { ProfessionalInfoSection } from '../[id]/components/ProfessionalInfoSection';
import { ServicesSection } from '../[id]/components/ServicesSection';
import { AvailabilitySection } from '../[id]/components/AvailabilitySection';

type ValidationErrors = Record<string, string[]>;

const createDefaultProfessional = (): Partial<IProfessional> => ({
  name: '',
  email: '',
  phone: '',
  title: '',
  bio: '',
  specialties: [],
  yearsOfExperience: 0,
  status: 'active',
  isAcceptingNewPatients: true,
  address: '',
  services: [],
  rooms: [],
  weeklyAvailability: [],
  vacations: [],
  breaks: [],
  timezone: 'Europe/Madrid',
  bufferMinutes: 15,
  telehealthEnabled: false,
  isActive: true,
  color: '#3B82F6',
  languages: ['es'],
  currency: 'EUR',
  acceptsOnlinePayments: true,
  paymentMethods: ['cash', 'card'],
  totalReviews: 0,
  totalAppointments: 0,
  completionRate: 0,
  stats: {
    totalPatients: 0,
    activePatients: 0,
    totalAppointments: 0,
    completedAppointments: 0,
    cancelledAppointments: 0,
    noShowAppointments: 0,
    averageRating: 0,
    totalReviews: 0,
    completionRate: 0,
  },
});

export default function CreateProfessionalPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [professional, setProfessional] = useState<Partial<IProfessional>>(createDefaultProfessional());
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [showValidation, setShowValidation] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  // Create professional mutation
  const createMutation = useMutation({
    mutationFn: async (data: Partial<IProfessional>) => {
      const response = await apiClient.post('/professionals', data);
      return response.data;
    },
    onSuccess: (newProfessional) => {
      toast({
        title: 'Profesional creado',
        description: 'El profesional se ha creado correctamente.',
      });
      router.push(`/admin/professionals/${newProfessional._id}`);
    },
    onError: (error: any) => {
      console.error('Error creating professional:', error);
      
      if (error.response?.data?.errors) {
        setValidationErrors(error.response.data.errors);
        setShowValidation(true);
        
        // Navigate to first tab with errors
        const errorTabs = Object.keys(error.response.data.errors);
        if (errorTabs.length > 0) {
          const firstErrorTab = getTabForField(errorTabs[0]);
          if (firstErrorTab) {
            setActiveTab(firstErrorTab);
          }
        }
      }
      
      toast({
        title: 'Error al crear profesional',
        description: error.response?.data?.message || 'No se pudo crear el profesional.',
        variant: 'destructive',
      });
    },
  });

  const getTabForField = (field: string): string | null => {
    if (['name', 'email', 'phone', 'title', 'bio', 'specialties', 'yearsOfExperience', 'status', 'isAcceptingNewPatients', 'address'].includes(field)) {
      return 'info';
    }
    if (field === 'services') {
      return 'services';
    }
    if (field === 'weeklyAvailability') {
      return 'availability';
    }
    return null;
  };

  const handleEdit = useCallback((section: string, data: any) => {
    setProfessional((prev: Partial<IProfessional>) => ({
      ...prev,
      [section]: data,
    }));
  }, []);

  const handleSave = useCallback((section: string, data: any) => {
    // For creation, we just update the local state
    handleEdit(section, data);
  }, [handleEdit]);

  const validateRequired = useCallback(() => {
    const errors: ValidationErrors = {};
    
    // Required fields validation
    if (!professional.name?.trim()) {
      errors.name = ['El nombre es obligatorio'];
    }
    
    if (!professional.email?.trim()) {
      errors.email = ['El email es obligatorio'];
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(professional.email)) {
      errors.email = ['El formato del email no es válido'];
    }
    
    if (!professional.title?.trim()) {
      errors.title = ['El título profesional es obligatorio'];
    }
    
    if (!professional.specialties || professional.specialties.length === 0) {
      errors.specialties = ['Debe seleccionar al menos una especialidad'];
    }
    
    // Validate availability if any
    if (professional.weeklyAvailability && professional.weeklyAvailability.length > 0) {
      const availabilityErrors: string[] = [];
      professional.weeklyAvailability.forEach((day: any, dayIndex: number) => {
        day.timeSlots.forEach((slot: any, slotIndex: number) => {
          if (slot.startTime >= slot.endTime) {
            availabilityErrors.push(`Día ${dayIndex + 1}, Horario ${slotIndex + 1}: La hora de inicio debe ser anterior a la hora de fin`);
          }
        });
      });
      if (availabilityErrors.length > 0) {
        errors.weeklyAvailability = availabilityErrors;
      }
    }
    
    return errors;
  }, [professional]);

  const handleCreate = useCallback(async () => {
    const errors = validateRequired();
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      setShowValidation(true);
      
      // Navigate to first tab with errors
      const errorTabs = Object.keys(errors);
      if (errorTabs.length > 0) {
        const firstErrorTab = getTabForField(errorTabs[0]);
        if (firstErrorTab) {
          setActiveTab(firstErrorTab);
        }
      }
      
      toast({
        title: 'Errores de validación',
        description: 'Por favor, corrige los errores antes de continuar.',
        variant: 'destructive',
      });
      
      return;
    }
    
    await createMutation.mutateAsync(professional);
  }, [professional, validateRequired, createMutation, toast]);

  const handleCancel = useCallback(() => {
    router.back();
  }, [router]);

  const getValidationErrorsForSection = (section: string) => {
    return validationErrors[section] || [];
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Crear Nuevo Profesional</h1>
            <p className="text-muted-foreground">
              Completa la información del profesional
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={createMutation.isPending}
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button
            onClick={handleCreate}
            disabled={createMutation.isPending}
          >
            <Save className="h-4 w-4 mr-2" />
            {createMutation.isPending ? 'Creando...' : 'Crear Profesional'}
          </Button>
        </div>
      </div>

      {/* Form Tabs */}
      <Card>
        <CardContent className="pt-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="info" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Información
                {(getValidationErrorsForSection('name').length > 0 ||
                  getValidationErrorsForSection('email').length > 0 ||
                  getValidationErrorsForSection('title').length > 0 ||
                  getValidationErrorsForSection('specialties').length > 0 ||
                  false) && (
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                )}
              </TabsTrigger>
              <TabsTrigger value="services" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Servicios
                {getValidationErrorsForSection('services').length > 0 && (
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                )}
              </TabsTrigger>
              <TabsTrigger value="availability" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Disponibilidad
                {getValidationErrorsForSection('weeklyAvailability').length > 0 && (
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                )}
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="mt-6">
              <ProfessionalInfoSection
                professional={professional as IProfessional}
                isEditing={true}
                editData={professional}
                onEdit={(data) => handleEdit('info', data)}
                onSave={(data) => handleSave('info', data)}
                validationErrors={[
                  ...getValidationErrorsForSection('name'),
                  ...getValidationErrorsForSection('email'),
                  ...getValidationErrorsForSection('title'),
                  ...getValidationErrorsForSection('specialties'),
                ]}
                showValidation={showValidation}
              />
            </TabsContent>
            
            <TabsContent value="services" className="mt-6">
              <ServicesSection
                professional={professional as any}
                isEditing={true}
                editData={professional.services || [] as any}
                onEdit={(data) => handleEdit('services', data)}
                onSave={(data) => handleSave('services', data)}
                validationErrors={getValidationErrorsForSection('services')}
                showValidation={showValidation}
              />
            </TabsContent>
            
            <TabsContent value="availability" className="mt-6">
              <AvailabilitySection
                professional={professional as IProfessional}
                isEditing={true}
                editData={professional.weeklyAvailability || []}
                onEdit={(data) => handleEdit('weeklyAvailability', data)}
                onSave={(data) => handleSave('weeklyAvailability', data)}
                validationErrors={getValidationErrorsForSection('weeklyAvailability')}
                showValidation={showValidation}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Resumen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium mb-2">Información Básica</p>
              <div className="space-y-1 text-muted-foreground">
                <p>Nombre: {professional.name || 'Sin especificar'}</p>
                <p>Email: {professional.email || 'Sin especificar'}</p>
                <p>Título: {professional.title || 'Sin especificar'}</p>
                <p>Especialidades: {professional.specialties?.length || 0}</p>
              </div>
            </div>
            
            <div>
              <p className="font-medium mb-2">Servicios y Configuración</p>
              <div className="space-y-1 text-muted-foreground">
                <p>Servicios asignados: {professional.services?.length || 0}</p>
                <p>Acepta nuevos pacientes: {professional.isAcceptingNewPatients ? 'Sí' : 'No'}</p>
                <p>Estado: {professional.status}</p>
                <p>Buffer entre citas: {professional.bufferMinutes || 0} min</p>
              </div>
            </div>
            
            <div>
              <p className="font-medium mb-2">Disponibilidad</p>
              <div className="space-y-1 text-muted-foreground">
                <p>Días configurados: {professional.weeklyAvailability?.length || 0}</p>
                <p>
                  Total horarios: {professional.weeklyAvailability?.reduce((acc: number, day: any) => acc + day.timeSlots.length, 0) || 0}
                </p>
                <p>Zona horaria: {professional.timezone || 'No especificada'}</p>
                <p>Telemedicina: {professional.telehealthEnabled ? 'Habilitada' : 'Deshabilitada'}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

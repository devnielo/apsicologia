'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
// Removed Tabs components - using custom navigation like [id] page
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import type { IProfessional } from '@shared/types/professional';

// Import unified components from [id]/components
import { ProfessionalInfoSection } from '../[id]/components/ProfessionalInfoSection';
import { AvailabilitySection } from '../[id]/components/AvailabilitySection';
import { ServicesSection } from '../[id]/components/ServicesSection';
import { BillingSection } from '../[id]/components/BillingSection';
import { RoomsSection } from '../[id]/components/RoomsSection';
import { ProfilePictureSection } from '../[id]/components/ProfilePictureSection';
import { ScheduleSection } from '../[id]/components/ScheduleSection';
// Sidebar component for consistent layout
import { ProfessionalSidebar } from '../[id]/components/ProfessionalSidebar';
import { MoreVertical, Download } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

type ValidationErrors = Record<string, string[]>;

// Section names constants
const SECTION_NAMES = {
  BASIC_INFO: 'basic_info',
  PROFESSIONAL_INFO: 'professional_info',
  AVAILABILITY: 'availability',
  SERVICES: 'services',
  BILLING: 'billing',
  ROOMS: 'rooms',
  PROFILE_PICTURE: 'profile_picture',
  SCHEDULE: 'schedule',
  SETTINGS: 'settings'
} as const;

export default function CreateProfessionalPage() {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // State for form data and validation
  const [formData, setFormData] = useState<Partial<IProfessional>>({});
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [showValidation, setShowValidation] = useState(false);
  const [activeTab, setActiveTab] = useState('basic-info');

  // Create professional mutation
  const createProfessionalMutation = useMutation({
    mutationFn: async (data: Partial<IProfessional>) => {
      const response = await api.professionals.create(data);
      return response.data;
    },
    onSuccess: (data) => {
      toast({
        title: 'Profesional creado',
        description: 'El profesional ha sido creado exitosamente.',
      });
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
      router.push(`/admin/professionals/${data.data.id}`);
    },
    onError: (error: any) => {
      console.error('Error creating professional:', error);
      
      if (error.response?.data?.errors) {
        setValidationErrors(error.response.data.errors);
        setShowValidation(true);
      }
      
      toast({
        title: 'Error al crear',
        description: error.response?.data?.message || 'Ocurrió un error al crear el profesional.',
        variant: 'destructive',
      });
    },
  });

  // Handle section save
  const handleSave = (section: string, data: any) => {
    console.log(`Saving ${section}:`, data);
    
    setFormData(prev => ({
      ...prev,
      ...data
    }));

    // Clear validation errors for this section
    setValidationErrors(prev => ({
      ...prev,
      [section]: []
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    setShowValidation(true);
    
    if (Object.keys(validationErrors).some(key => validationErrors[key]?.length > 0)) {
      toast({
        title: 'Errores de validación',
        description: 'Por favor, corrija los errores antes de continuar.',
        variant: 'destructive',
      });
      return;
    }

    await createProfessionalMutation.mutateAsync(formData);
  };

  const handleBack = () => {
    router.push('/admin/professionals');
  };

  const isLoading = createProfessionalMutation.isPending;

  return (
    <div className="h-full bg-background flex overflow-hidden">
      {/* Sidebar */}
      <div className="bg-card border-r border-border h-full overflow-hidden flex-shrink-0 flex flex-col">
        <div className="p-4 border-b border-border flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
        <div className="flex-1 overflow-hidden p-4">
          <ProfessionalSidebar 
            professional={formData as any}
            onProfilePictureUpdate={(base64Image) => handleSave(SECTION_NAMES.PROFILE_PICTURE, { avatar: base64Image })}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-background flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-foreground">
                Crear Profesional
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                size="sm"
                className="medical-button-primary"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Creando...' : 'Crear Profesional'}
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline" className="text-muted-foreground hover:text-foreground">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="text-foreground">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Tabs Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="">
              <div className="border-b border-border/30 sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
                <div className="flex space-x-6 px-1 overflow-x-auto">
                  <button
                    onClick={() => setActiveTab('basic-info')}
                    className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors duration-200 whitespace-nowrap ${
                      activeTab === 'basic-info'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                    }`}
                  >
                    Información
                  </button>
                  <button
                    onClick={() => setActiveTab('availability')}
                    className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors duration-200 whitespace-nowrap ${
                      activeTab === 'availability'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                    }`}
                  >
                    Disponibilidad
                  </button>
                  <button
                    onClick={() => setActiveTab('services')}
                    className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors duration-200 whitespace-nowrap ${
                      activeTab === 'services'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                    }`}
                  >
                    Servicios
                  </button>
                  <button
                    onClick={() => setActiveTab('billing')}
                    className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors duration-200 whitespace-nowrap ${
                      activeTab === 'billing'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                    }`}
                  >
                    Facturación
                  </button>
                  <button
                    onClick={() => setActiveTab('rooms')}
                    className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors duration-200 whitespace-nowrap ${
                      activeTab === 'rooms'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                    }`}
                  >
                    Salas
                  </button>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors duration-200 whitespace-nowrap ${
                      activeTab === 'profile'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                    }`}
                  >
                    Perfil
                  </button>
                  <button
                    onClick={() => setActiveTab('schedule')}
                    className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors duration-200 whitespace-nowrap ${
                      activeTab === 'schedule'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                    }`}
                  >
                    Horarios
                  </button>
                </div>
              </div>

              <div className="mt-6">

                {/* Basic Information */}
                {activeTab === 'basic-info' && (
                  <div className="space-y-6">
                    <ProfessionalInfoSection
                      professional={formData as any}
                      isEditing={true}
                      editData={{}}
                      onEdit={() => {}}
                      onSave={(data) => handleSave(SECTION_NAMES.PROFESSIONAL_INFO, data)}
                      validationErrors={(validationErrors.professional_info || []) as string[]}
                      showValidation={showValidation}
                    />
                  </div>
                )}

                {/* Availability */}
                {activeTab === 'availability' && (
                  <div className="space-y-6">
                    <AvailabilitySection
                      professional={formData as any}
                      isEditing={true}
                      editData={{}}
                      onEdit={() => {}}
                      onSave={(data) => handleSave(SECTION_NAMES.AVAILABILITY, data)}
                      validationErrors={(validationErrors.availability || []) as string[]}
                      showValidation={showValidation}
                    />
                  </div>
                )}

                {/* Services */}
                {activeTab === 'services' && (
                  <div className="space-y-6">
                    <ServicesSection
                      professional={formData as any}
                      isEditing={true}
                      editData={[]}
                      onEdit={() => {}}
                      onSave={(data) => handleSave(SECTION_NAMES.SERVICES, { assignedServices: data })}
                      validationErrors={validationErrors as any}
                      showValidation={showValidation}
                    />
                  </div>
                )}

                {/* Billing */}
                {activeTab === 'billing' && (
                  <div className="space-y-6">
                    <BillingSection
                      professional={formData as any}
                      isEditing={true}
                      editData={{}}
                      onEdit={() => {}}
                      onSave={(data) => handleSave(SECTION_NAMES.BILLING, data)}
                      validationErrors={(validationErrors.billing || []) as string[]}
                      showValidation={showValidation}
                    />
                  </div>
                )}

                {/* Rooms */}
                {activeTab === 'rooms' && (
                  <div className="space-y-6">
                    <RoomsSection
                      professional={formData as any}
                      isEditing={true}
                      editData={{ assignedRooms: [] }}
                      onEdit={() => {}}
                      onSave={(data) => handleSave(SECTION_NAMES.ROOMS, data)}
                      validationErrors={(validationErrors.rooms || []) as string[]}
                      showValidation={showValidation}
                    />
                  </div>
                )}

                {/* Profile Picture */}
                {activeTab === 'profile' && (
                  <div className="space-y-6">
                    <ProfilePictureSection
                      professional={formData as any}
                      isEditing={true}
                      editData={{}}
                      onEdit={() => {}}
                      onSave={(data) => handleSave(SECTION_NAMES.PROFILE_PICTURE, data)}
                      validationErrors={(validationErrors.profile_picture || []) as string[]}
                      showValidation={showValidation}
                    />
                  </div>
                )}

                {/* Schedule */}
                {activeTab === 'schedule' && (
                  <div className="space-y-6">
                    <ScheduleSection
                      professional={formData as any}
                      isEditing={true}
                      editData={{} as any}
                      onEdit={() => {}}
                      onSave={(data) => handleSave(SECTION_NAMES.SCHEDULE, data)}
                      validationErrors={(validationErrors.schedule || []) as string[]}
                      showValidation={showValidation}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

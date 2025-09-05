'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, MoreVertical, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import type { IProfessional } from '@shared/types/professional';

// Import section components
import { ProfessionalSidebar } from './components/ProfessionalSidebar';
import { ProfessionalInfoSection } from './components/ProfessionalInfoSection';
import { AvailabilitySection } from './components/AvailabilitySection';
import { ServicesSection } from './components/ServicesSection';
import { StatsSection } from './components/StatsSection';

type ValidationErrors = Record<string, string[]>;

// Section names constants
const SECTION_NAMES = {
  BASIC_INFO: 'basic_info',
  CONTACT_INFO: 'contact_info',
  PROFESSIONAL_INFO: 'professional_info',
  AVAILABILITY: 'availability',
  SERVICES: 'services',
  SETTINGS: 'settings'
} as const;

type SectionName = typeof SECTION_NAMES[keyof typeof SECTION_NAMES];

export default function ProfessionalDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [editingSection, setEditingSection] = useState<SectionName | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showValidation, setShowValidation] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  const fetchProfessional = async (id: string) => {
    try {
      const response = await api.professionals.get(id);
      return response.data.data?.professional;
    } catch (error) {
      console.error('Error fetching professional:', error);
      throw error;
    }
  };

  // Fetch professional data
  const { data: professionalData, isLoading, error } = useQuery<IProfessional>({
    queryKey: ['professional', params.id],
    queryFn: () => fetchProfessional(params.id as string),
    enabled: !!params.id,
  });

  // Update professional mutation
  const updateProfessionalMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.professionals.update(id, data);
      return response.data;
    },
    onSuccess: (responseData) => {
      // Extract the professional data from the API response
      const updatedProfessional = responseData.data?.professional || responseData.data;
      queryClient.setQueryData(['professional', params.id], updatedProfessional);
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
      setEditingSection(null);
      setEditData({});
      setValidationErrors([]);
      setShowValidation(false);
      toast({
        title: 'Éxito',
        description: 'Información actualizada correctamente'
      });
    },
    onError: (error: any) => {
      console.error('Error updating professional:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la información',
        variant: 'destructive'
      });
    },
  });

  const handleEdit = (section: SectionName, initialData: any) => {
    if (initialData === null) {
      // Cancel editing
      setEditingSection(null);
      setEditData({});
      setValidationErrors([]);
      setShowValidation(false);
    } else {
      // Start editing - allow empty arrays for availability section
      setEditingSection(section);
      setEditData(initialData);
      setValidationErrors([]);
      setShowValidation(false);
    }
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

      // Structure data according to section
      let structuredData: any = {};
      
      switch (section) {
        case SECTION_NAMES.BASIC_INFO:
          structuredData = {
            name: data.name,
            title: data.title,
            bio: data.bio,
            email: data.email,
            phone: data.phone,
            specialties: data.specialties || [],
            status: data.status,
            licenseNumber: data.licenseNumber,
            yearsOfExperience: data.yearsOfExperience,
            languages: data.languages || [],
            isAcceptingNewPatients: data.isAcceptingNewPatients
          };
          break;
          
        case SECTION_NAMES.CONTACT_INFO:
          structuredData = {
            email: data.email,
            phone: data.phone,
            address: data.address
          };
          break;
          
        case SECTION_NAMES.PROFESSIONAL_INFO:
          structuredData = {
            bio: data.bio,
            contactInfo: data.contactInfo || {},
            settings: data.settings || {},
            weeklyAvailability: data.weeklyAvailability || [],
            isAcceptingNewPatients: data.isAcceptingNewPatients,
            maxPatientsPerDay: data.maxPatientsPerDay
          };
          break;
          
        case SECTION_NAMES.AVAILABILITY:
          // Transform frontend format to backend format using shared utilities
          const { transformFrontendToBackend } = await import('@shared/utils/availability');
          
          // Ensure data is in the correct format for transformation
          let availabilityData = [];
          if (Array.isArray(data)) {
            availabilityData = data;
          } else if (data && Array.isArray(data.weeklyAvailability)) {
            availabilityData = data.weeklyAvailability;
          } else if (data && typeof data === 'object') {
            // If data is an object with availability properties, extract them
            availabilityData = Object.values(data).filter(item => 
              item && typeof item === 'object' && 'dayOfWeek' in item
            );
          }
          
          const transformedAvailability = transformFrontendToBackend(availabilityData);

          structuredData = {
            weeklyAvailability: transformedAvailability,
            timeZone: (data && data.timeZone) || 'Europe/Madrid',
            bufferTime: (data && data.bufferTime) || 10
          };
          break;
          
        case SECTION_NAMES.SERVICES:
          structuredData = {
            assignedServices: data.assignedServices || []
          };
          break;
          
        case SECTION_NAMES.SETTINGS:
          structuredData = {
            ...data
          };
          break;
          
        default:
          structuredData = data;
          break;
      }
      
      console.log('Structured data for backend:', structuredData);
      
      await updateProfessionalMutation.mutateAsync({
        id: params.id as string,
        data: structuredData
      });
      
      setEditingSection(null);
      setEditData({});
      setValidationErrors([]);
      setShowValidation(false);
      
      toast({
        title: 'Éxito',
        description: 'Información actualizada correctamente'
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la información',
        variant: 'destructive'
      });
    }
  };

  const handleCancel = () => {
    setEditingSection(null);
    setEditData({});
    setValidationErrors([]);
    setShowValidation(false);
  };

  if (isLoading) {
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

  if (error || !professionalData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-foreground mb-2">
            {error ? 'Error al cargar el profesional' : 'Profesional no encontrado'}
          </h1>
          <p className="text-muted-foreground mb-4 text-sm">
            {error ? 'No se pudo cargar la información del profesional.' : 'El profesional que buscas no existe o ha sido eliminado.'}
          </p>
          <Button size="sm" onClick={() => router.push('/admin/professionals')} className="medical-button-primary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a profesionales
          </Button>
        </div>
      </div>
    );
  }

  const professional = professionalData;
  const fullName = professional?.name || 'Profesional';

  return (
    <div className="h-full bg-background flex overflow-hidden">
      {/* Sidebar */}
      <div className="bg-card border-r border-border h-full overflow-hidden flex-shrink-0 flex flex-col">
        <div className="p-4 border-b border-border flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin/professionals')}
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
        <div className="flex-1 overflow-hidden p-4">
          <ProfessionalSidebar professional={professionalData} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-background flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-foreground">
                Detalles del Profesional
              </h1>
            </div>
            
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

        {/* Tabs Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <div className="border-b border-border/30 sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
                <div className="flex space-x-8 px-1">
                  <button
                    onClick={() => setActiveTab('info')}
                    className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors duration-200 ${
                      activeTab === 'info'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                    }`}
                  >
                    Información
                  </button>
                  <button
                    onClick={() => setActiveTab('availability')}
                    className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors duration-200 ${
                      activeTab === 'availability'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                    }`}
                  >
                    Disponibilidad
                  </button>
                  <button
                    onClick={() => setActiveTab('services')}
                    className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors duration-200 ${
                      activeTab === 'services'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                    }`}
                  >
                    Servicios
                  </button>
                  <button
                    onClick={() => setActiveTab('stats')}
                    className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors duration-200 ${
                      activeTab === 'stats'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                    }`}
                  >
                    Estadísticas
                  </button>
                </div>
              </div>

              <TabsContent value="info" className="mt-2">
                <ProfessionalInfoSection
                  professional={professionalData}
                  isEditing={editingSection === SECTION_NAMES.BASIC_INFO}
                  editData={editData}
                  onEdit={(data) => handleEdit(SECTION_NAMES.BASIC_INFO, data)}
                  onSave={(data) => handleSave(SECTION_NAMES.BASIC_INFO, data)}
                  validationErrors={validationErrors}
                  showValidation={showValidation}
                />
              </TabsContent>

              <TabsContent value="availability" className="mt-2">
                <AvailabilitySection
                  professional={professionalData}
                  isEditing={editingSection === SECTION_NAMES.AVAILABILITY}
                  editData={editingSection === SECTION_NAMES.AVAILABILITY ? editData : professionalData?.weeklyAvailability || []}
                  onEdit={(data) => handleEdit(SECTION_NAMES.AVAILABILITY, data)}
                  onSave={(data) => handleSave(SECTION_NAMES.AVAILABILITY, { weeklyAvailability: data })}
                  validationErrors={validationErrors}
                  showValidation={showValidation}
                />
              </TabsContent>

              <TabsContent value="services" className="mt-2">
                <ServicesSection
                  professional={professionalData}
                  isEditing={editingSection === SECTION_NAMES.SERVICES}
                  editData={editingSection === SECTION_NAMES.SERVICES ? editData : (professionalData as any)?.assignedServices || []}
                  onEdit={(data) => handleEdit(SECTION_NAMES.SERVICES, data)}
                  onSave={(data) => handleSave(SECTION_NAMES.SERVICES, { assignedServices: data })}
                  validationErrors={validationErrors}
                  showValidation={showValidation}
                />
              </TabsContent>

              <TabsContent value="stats" className="mt-2">
                <StatsSection
                  professional={professionalData}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

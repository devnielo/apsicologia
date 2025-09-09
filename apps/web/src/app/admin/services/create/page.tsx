'use client';

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import api from '@/lib/api';
import { ServiceFormData } from '../types';
import { ServiceSidebar } from '../components/ServiceSidebar';
import { ServiceInfoSection } from '../[id]/components/ServiceInfoSection';
import { ServiceSettingsSection } from '../[id]/components/ServiceSettingsSection';
import { useAuth } from '@/lib/auth-context';

type TabKey = 'info' | 'settings';

interface TabItem {
  key: TabKey;
  label: string;
  description: string;
}

const tabs: TabItem[] = [
  {
    key: 'info',
    label: 'Información',
    description: 'Datos básicos del servicio'
  },
  {
    key: 'settings',
    label: 'Configuración',
    description: 'Configuración avanzada y seguimiento'
  }
];

export default function CreateServicePage() {
  const router = useRouter();
  const { user } = useAuth();
  // Always in editing mode for creation

  // Role-based access control - only admin and reception can create services
  if (!user || !['admin', 'reception'].includes(user.role)) {
    router.push('/admin/dashboard');
    return null;
  }

  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState<TabKey>('info');
  const [editingSection, setEditingSection] = useState<TabKey | null>('info');
  const [formData, setFormData] = useState<ServiceFormData>({
    // Basic information
    name: '',
    description: '',
    durationMinutes: 60,
    price: 70,
    currency: 'EUR',
    
    // Visual and categorization
    color: '#3B82F6',
    category: '',
    tags: [],
    imageUrl: '',
    
    // Availability settings
    isActive: true,
    isOnlineAvailable: true,
    requiresApproval: false,
    isPubliclyBookable: true,
    
    // Professional restrictions
    availableTo: [],
    
    // Pricing details
    priceDetails: {
      basePrice: 70,
      discounts: []
    },
    
    // Service configuration
    settings: {
      maxAdvanceBookingDays: 30,
      minAdvanceBookingHours: 2,
      allowSameDayBooking: true,
      bufferBefore: 5,
      bufferAfter: 5,
      maxConcurrentBookings: 1,
      requiresIntake: false,
    },
    
    // Preparation and follow-up
    preparation: {
      instructions: '',
      requiredDocuments: [],
      recommendedDuration: 0,
    },
    followUp: {
      instructions: '',
      scheduledTasks: [],
      recommendedGap: 7,
    }
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (data: ServiceFormData) => {
      // Sync price with priceDetails.basePrice
      const payload = {
        ...data,
        priceDetails: {
          ...data.priceDetails,
          basePrice: data.price
        }
      };
      
      const response = await api.services.create(payload);
      return response.data.data;
    },
    onSuccess: (newService) => {
      toast.success('Servicio creado exitosamente');
      queryClient.invalidateQueries({ queryKey: ['services'] });
      router.push(`/admin/services/${newService.data?.id || newService.id}`);
    },
    onError: (error: any) => {
      console.error('Error creating service:', error);
      toast.error(error?.response?.data?.message || 'Error al crear el servicio');
    },
  });

  // Event handlers
  const handleEdit = useCallback((section: TabKey) => {
    setEditingSection(section);
    setActiveTab(section);
  }, []);

  const handleSave = useCallback((section: TabKey, data: Partial<ServiceFormData>) => {
    setFormData(prev => {
      const updated = { ...prev, ...data };
      
      // Sync price with priceDetails.basePrice when price changes
      if (data.price !== undefined) {
        updated.priceDetails = {
          ...updated.priceDetails,
          basePrice: data.price
        };
      }
      
      return updated;
    });
    
    // Don't close editing in create mode - keep it open for continuous editing
  }, []);

  const handleCancel = useCallback(() => {
    // In create mode, canceling means going back to services list
    router.push('/admin/services');
  }, [router]);

  const handleCreateService = useCallback(() => {
    createMutation.mutate(formData);
  }, [formData, createMutation]);

  const isEditing = (section: TabKey) => editingSection === section;

  // Create a preview service object for the sidebar
  const previewService = formData.name ? {
    id: 'new',
    name: formData.name,
    description: formData.description,
    durationMinutes: formData.durationMinutes,
    price: formData.price,
    currency: formData.currency,
    color: formData.color,
    category: formData.category,
    tags: formData.tags,
    isActive: formData.isActive,
    isOnlineAvailable: formData.isOnlineAvailable,
    requiresApproval: formData.requiresApproval,
    isPubliclyBookable: formData.isPubliclyBookable,
    availableTo: formData.availableTo,
    priceDetails: formData.priceDetails,
    settings: formData.settings,
    preparation: formData.preparation,
    followUp: formData.followUp,
    stats: {
      totalBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
      totalRevenue: 0
    },
    createdAt: new Date(),
    updatedAt: new Date()
  } : undefined;

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <ServiceSidebar 
        service={previewService}
        isLoading={false}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  Crear Nuevo Servicio
                </h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Configura un nuevo servicio para tu clínica
                </p>
              </div>
              
              {/* Create Button */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCancel}
                  disabled={createMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCreateService}
                  disabled={createMutation.isPending || !formData.name.trim()}
                  className="px-6 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createMutation.isPending ? 'Creando...' : 'Crear Servicio'}
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                    ${activeTab === tab.key
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }
                  `}
                >
                  <div className="flex flex-col items-start">
                    <span>{tab.label}</span>
                    <span className="text-xs opacity-75">
                      {tab.description}
                    </span>
                  </div>
                  
                  {/* Active indicator */}
                  {activeTab === tab.key && (
                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-primary-foreground rounded-full" />
                  )}
                  
                  {/* Editing indicator */}
                  {isEditing(tab.key) && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
            <div className="max-w-4xl">
              {activeTab === 'info' && (
                <ServiceInfoSection
                  service={previewService}
                  isEditing={true} // Always editing in create mode
                  editData={formData}
                  onEdit={() => handleEdit('info')}
                  onSave={(data) => handleSave('info', data)}
                  onCancel={handleCancel}
                />
              )}
              
              {activeTab === 'settings' && (
                <ServiceSettingsSection
                  service={previewService}
                  isEditing={true} // Always editing in create mode
                  editData={formData}
                  onEdit={() => handleEdit('settings')}
                  onSave={(data) => handleSave('settings', data)}
                  onCancel={handleCancel}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

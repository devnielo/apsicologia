'use client';

import { useRouter } from 'next/navigation';
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { notFound } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import api from '@/lib/api';
import { Service, ServiceFormData } from '../types';
import { ServiceSidebar } from '../components/ServiceSidebar';
import ServiceInfoSection from './components/ServiceInfoSection';
import { ServiceSettingsSection } from './components/ServiceSettingsSection';

interface ServicePageProps {
  params: {
    id: string;
  };
}

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

export default function ServiceDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Role-based access control - only admin and reception can access service details
  if (!user || !['admin', 'reception'].includes(user.role)) {
    router.push('/admin/dashboard');
    return null;
  }

  const [activeTab, setActiveTab] = useState<TabKey>('info');
  const [editingSection, setEditingSection] = useState<TabKey | null>(null);
  const [editData, setEditData] = useState<Partial<ServiceFormData>>({});

  // Fetch service data
  const {
    data: service,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['service', params.id],
    queryFn: async () => {
      const response = await api.services.get(params.id);
      console.log('Service API Response:', response.data);
      // Handle nested response structure: response.data.data.service
      const responseData = response.data as any;
      return responseData.data?.service || responseData.service || responseData.data;
    },
    retry: (failureCount, error: any) => {
      // Don't retry on 404
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 3;
    }
  });

  // Handle 404
  if (isError && (error as any)?.response?.status === 404) {
    notFound();
  }

  // Event handlers
  const handleEdit = useCallback((section: TabKey) => {
    setEditingSection(section);
    setActiveTab(section);
  }, []);

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: async (data: Partial<ServiceFormData>) => {
      await api.services.update(params.id, data);
    },
    onSuccess: () => {
      toast.success('Servicio actualizado correctamente');
      // Invalidate both specific service and services list
      queryClient.invalidateQueries({ queryKey: ['service', params.id] });
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setEditingSection(null);
      setEditData({});
    },
    onError: (error: any) => {
      console.error('Error updating service:', error);
      toast.error(error?.response?.data?.message || 'Error al actualizar el servicio');
    },
  });

  const handleSave = useCallback((section: TabKey, data: Partial<ServiceFormData>) => {
    updateMutation.mutate(data);
  }, [updateMutation]);

  const handleCancel = useCallback(() => {
    setEditingSection(null);
    setEditData({});
  }, []);

  const isEditing = (section: TabKey) => editingSection === section;

  return (
    <div className="h-full bg-background flex overflow-hidden">
      {/* Sidebar */}
      <div className="bg-card border-r border-border h-full overflow-hidden flex-shrink-0 flex flex-col">
        <ServiceSidebar 
          service={service}
          isLoading={isLoading}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-background flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-foreground">
                {isLoading ? (
                  <div className="h-6 bg-muted animate-pulse rounded w-48" />
                ) : (
                  'Detalles del Servicio'
                )}
              </h1>
            </div>
          </div>
        </div>

        {/* Tabs Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="">

            {/* Tabs */}
            <div className="border-b border-border/30 sticky top-0 z-10 bg-background/95 backdrop-blur-sm">
              <div className="flex space-x-6 px-1 overflow-x-auto">
                {tabs.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    disabled={isLoading}
                    className={`py-3 px-1 text-sm font-medium border-b-2 transition-colors duration-200 whitespace-nowrap ${
                      activeTab === tab.key
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
                    } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {tab.label}
                    {/* Editing indicator */}
                    {isEditing(tab.key) && (
                      <div className="ml-2 inline-block w-2 h-2 bg-primary rounded-full animate-pulse" />
                    )}
                  </button>
                ))}
              </div>
            </div>

              {isLoading ? (
                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-2">
                          <div className="h-4 bg-muted animate-pulse rounded w-32" />
                          <div className="h-3 bg-muted animate-pulse rounded w-48" />
                        </div>
                        <div className="h-8 bg-muted animate-pulse rounded w-20" />
                      </div>
                      <div className="space-y-3">
                        <div className="h-3 bg-muted animate-pulse rounded" />
                        <div className="h-3 bg-muted animate-pulse rounded w-3/4" />
                        <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="max-w-4xl">
                  {activeTab === 'info' && (
                    <ServiceInfoSection
                      service={service}
                      serviceId={params.id}
                      isEditing={isEditing('info')}
                      editData={editData}
                      onEdit={() => handleEdit('info')}
                      onSave={(data: Partial<ServiceFormData>) => handleSave('info', data)}
                      onCancel={handleCancel}
                    />
                  )}
                  
                  {activeTab === 'settings' && (
                    <ServiceSettingsSection
                      service={service}
                      serviceId={params.id}
                      isEditing={isEditing('settings')}
                      editData={editData}
                      onEdit={() => handleEdit('settings')}
                      onSave={(data) => handleSave('settings', data)}
                      onCancel={handleCancel}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

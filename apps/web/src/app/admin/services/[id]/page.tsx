'use client';

import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import api from '@/lib/api';
import { Service, ServiceFormData } from '../types';
import { ServiceSidebar } from '../components/ServiceSidebar';
import { ServiceInfoSection } from './components/ServiceInfoSection';
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

export default function ServicePage({ params }: ServicePageProps) {
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
      const response = await api.get(`/services/${params.id}`);
      return response.data;
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

  const handleSave = useCallback((section: TabKey, data: Partial<ServiceFormData>) => {
    setEditData(prev => ({ ...prev, ...data }));
    setEditingSection(null);
  }, []);

  const handleCancel = useCallback(() => {
    setEditingSection(null);
    setEditData({});
  }, []);

  const isEditing = (section: TabKey) => editingSection === section;

  return (
    <div className="h-full flex">
      {/* Sidebar */}
      <ServiceSidebar 
        service={service}
        isLoading={isLoading}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  {isLoading ? (
                    <div className="h-6 bg-muted animate-pulse rounded w-48" />
                  ) : (
                    service?.name || 'Servicio'
                  )}
                </h1>
                {!isLoading && service?.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {service.description}
                  </p>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  disabled={isLoading}
                  className={`
                    relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200
                    ${activeTab === tab.key
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }
                    ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
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
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-6">
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
                    isEditing={isEditing('info')}
                    editData={editData}
                    onEdit={() => handleEdit('info')}
                    onSave={(data) => handleSave('info', data)}
                    onCancel={handleCancel}
                  />
                )}
                
                {activeTab === 'settings' && (
                  <ServiceSettingsSection
                    service={service}
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
  );
}

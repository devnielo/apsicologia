'use client';

import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Save, Edit, X, Plus, Trash2, DollarSign, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { apiClient } from '@/lib/api';

import type { IProfessional } from '@shared/types/professional';
import type { IService } from '@shared/types/service';

interface ProfessionalService {
  serviceId: string;
  customPrice?: number;
  isActive: boolean;
}

interface ServicesSectionProps {
  professional: IProfessional;
  isEditing: boolean;
  editData: ProfessionalService[];
  onEdit: (data: ProfessionalService[] | null) => void;
  onSave: (data: ProfessionalService[]) => void;
  validationErrors: string[];
  showValidation: boolean;
  isCreateMode?: boolean;
}

export function ServicesSection({
  professional,
  isEditing,
  editData,
  onEdit,
  onSave,
  validationErrors,
  showValidation,
  isCreateMode = false
}: ServicesSectionProps) {
  const [localData, setLocalData] = useState<ProfessionalService[]>(() => {
    if (isEditing && Array.isArray(editData) && editData.length > 0) {
      return editData;
    }
    
    // Prefer assignedServices if available, fallback to services
    const assignedServices = professional?.assignedServices || [];
    if (assignedServices.length > 0) {
      return assignedServices.map((assignedService: any) => ({
        serviceId: assignedService.serviceId?.id || assignedService.serviceId,
        customPrice: assignedService.customPrice,
        isActive: assignedService.isActive !== undefined ? assignedService.isActive : true,
      }));
    }
    
    // Fallback to services array for backward compatibility
    const services = professional?.services || [];
    return services.map((service: any) => {
      if (typeof service === 'string') {
        return {
          serviceId: service,
          isActive: true,
        };
      }
      // If service is a populated object, extract the ID
      if (service && typeof service === 'object' && service.id) {
        return {
          serviceId: service.id,
          customPrice: service.customPrice,
          isActive: service.isActive !== undefined ? service.isActive : true,
        };
      }
      return service;
    });
  });
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');

  // Fetch available services
  const { data: availableServices, isLoading: servicesLoading } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const response = await apiClient.get('/services');
      // The API returns services in response.data.data.services
      return response.data.data?.services || [];
    },
  });

  // Update localData when professional data or editing state changes
  useEffect(() => {
    if (!isEditing && professional) {
      // Prefer assignedServices if available, fallback to services
      const assignedServices = professional?.assignedServices || [];
      if (assignedServices.length > 0) {
        const services = assignedServices.map((assignedService: any) => ({
          serviceId: assignedService.serviceId?.id || assignedService.serviceId,
          customPrice: assignedService.customPrice,
          isActive: assignedService.isActive !== undefined ? assignedService.isActive : true,
        }));
        setLocalData(services);
      } else if (professional?.services) {
        // Fallback to services array for backward compatibility
        const services = professional.services.map((service: any) => {
          if (typeof service === 'string') {
            return {
              serviceId: service,
              isActive: true,
            };
          }
          // If service is a populated object, extract the ID
          if (service && typeof service === 'object' && service.id) {
            return {
              serviceId: service.id,
              customPrice: service.customPrice,
              isActive: service.isActive !== undefined ? service.isActive : true,
            };
          }
          return service;
        });
        setLocalData(services);
      }
    } else if (isEditing && Array.isArray(editData)) {
      // In edit mode, respect the editData even if it's empty
      setLocalData(editData);
    }
  }, [professional?.assignedServices, professional?.services, isEditing, editData]);

  const handleLocalChange = useCallback((updatedServices: ProfessionalService[]) => {
    setLocalData(updatedServices);
    onEdit(updatedServices);
  }, [onEdit]);

  const handleSave = useCallback(() => {
    onSave(localData);
  }, [localData, onSave]);

  const handleAddService = useCallback(() => {
    if (!selectedServiceId) return;
    
    // Check if service is already added
    if (localData.some(ps => ps.serviceId === selectedServiceId)) return;
    
    const newService: ProfessionalService = {
      serviceId: selectedServiceId,
      isActive: true,
    };
    
    const updatedServices = [...localData, newService];
    handleLocalChange(updatedServices);
    setSelectedServiceId('');
  }, [localData, selectedServiceId, handleLocalChange]);

  const handleRemoveService = useCallback((serviceId: string) => {
    const updatedServices = localData.filter(ps => ps.serviceId !== serviceId);
    handleLocalChange(updatedServices);
  }, [localData, handleLocalChange]);

  const handleToggleActive = useCallback((serviceId: string) => {
    const updatedServices = localData.map(ps => 
      ps.serviceId === serviceId 
        ? { ...ps, isActive: !ps.isActive }
        : ps
    );
    handleLocalChange(updatedServices);
  }, [localData, handleLocalChange]);

  const handleCustomPriceChange = useCallback((serviceId: string, price: string) => {
    const numericPrice = price === '' ? undefined : parseFloat(price);
    const updatedServices = localData.map(ps => 
      ps.serviceId === serviceId 
        ? { ...ps, customPrice: numericPrice }
        : ps
    );
    handleLocalChange(updatedServices);
  }, [localData, handleLocalChange]);

  const getServiceById = (serviceId: string) => {
    // First check if professional.assignedServices contains populated service objects
    if (professional?.assignedServices) {
      const assignedService = professional.assignedServices.find((as: any) => 
        (as.serviceId?.id === serviceId || as.serviceId === serviceId)
      );
      if (assignedService && assignedService.serviceId && typeof assignedService.serviceId === 'object') {
        return assignedService.serviceId;
      }
    }
    
    // Then check if professional.services contains populated service objects
    if (professional?.services) {
      const populatedService = professional.services.find((s: any) => 
        (typeof s === 'object' && s.id === serviceId)
      );
      if (populatedService) {
        return populatedService;
      }
    }
    
    // Finally check available services from the API
    return availableServices?.find((service: any) => service.id === serviceId);
  };

  const getAvailableServicesToAdd = () => {
    if (!availableServices) return [];
    return availableServices.filter((service: any) => 
      !localData.some(ps => ps.serviceId === service.id) && service.isActive
    );
  };

  const formatDuration = (minutes: number) => {
    if (!minutes || isNaN(minutes)) return 'No especificada';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  if (servicesLoading) {
    return (
      <div className="bg-card border border-border rounded-lg">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-base font-medium text-foreground">Servicios</h3>
        </div>
        <div className="p-4 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Servicios Asignados */}
      <div className="pb-4 border-b border-border/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-primary" />
            Servicios Asignados
          </h3>
          {!isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Prefer assignedServices if available, fallback to services
                const assignedServices = professional?.assignedServices || [];
                let initialData: ProfessionalService[] = [];
                
                if (assignedServices.length > 0) {
                  initialData = assignedServices.map((assignedService: any) => ({
                    serviceId: assignedService.serviceId?.id || assignedService.serviceId,
                    customPrice: assignedService.customPrice,
                    isActive: assignedService.isActive !== undefined ? assignedService.isActive : true,
                  }));
                } else {
                  // Fallback to services array for backward compatibility
                  const services = professional.services || [];
                  initialData = services.map((service: any) => {
                    if (typeof service === 'string') {
                      return {
                        serviceId: service,
                        isActive: true,
                      };
                    }
                    // If service is a populated object, extract the ID
                    if (service && typeof service === 'object' && service.id) {
                      return {
                        serviceId: service.id,
                        customPrice: service.customPrice,
                        isActive: service.isActive !== undefined ? service.isActive : true,
                      };
                    }
                    return service;
                  });
                }
                
                setLocalData(initialData);
                onEdit(initialData);
              }}
              className="text-muted-foreground hover:text-foreground h-6 w-6 p-0"
            >
              <Edit className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className="text-green-600 hover:text-green-700 h-6 w-6 p-0"
              >
                <Save className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Reset to original services data
                  const services = professional.services || [];
                  const originalData: ProfessionalService[] = services.map((service: any) => {
                    if (typeof service === 'string') {
                      return {
                        serviceId: service,
                        isActive: true,
                      };
                    }
                    // If service is a populated object, extract the ID
                    if (service && typeof service === 'object' && service.id) {
                      return {
                        serviceId: service.id,
                        customPrice: service.customPrice,
                        isActive: service.isActive !== undefined ? service.isActive : true,
                      };
                    }
                    return service;
                  });
                  setLocalData(originalData);
                  onEdit(null);
                }}
                className="text-muted-foreground hover:text-foreground h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {localData.length === 0 ? (
          <p className="text-sm text-muted-foreground py-8 text-center">
            No hay servicios asignados
          </p>
        ) : (
          <div className="space-y-3">
            {localData.map((professionalService) => {
              const service = getServiceById(professionalService.serviceId);
              if (!service) return null;
              
              return (
                <div key={`${service.id}-${professionalService.isActive}`} className="border rounded-lg p-4 bg-background">
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        {service.imageUrl ? (
                          <img 
                            src={service.imageUrl} 
                            alt={service.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div 
                            className="w-12 h-12 rounded-lg flex items-center justify-center" 
                            style={{ backgroundColor: service.color || '#6B7280' }}
                          >
                            <span className="text-white text-xs font-medium">
                              {service.name.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div>
                          <h4 className="font-medium text-gray-900">{service.name}</h4>
                          <p className="text-sm text-gray-500">{service.description}</p>
                        </div>
                      </div>
                    </div>
                    
                    {isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveService(professionalService.serviceId)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {professionalService.isActive ? (
                          <Badge variant="default" className="text-xs px-2 py-0.5">
                            Activo
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs px-2 py-0.5">
                            Inactivo
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span>Duración: {formatDuration(service.durationMinutes)}</span>
                        <span>•</span>
                        <span>Precio base: {formatPrice(service.price || 0)}</span>
                        {professionalService.customPrice && (
                          <>
                            <span>•</span>
                            <span className="font-medium text-foreground">
                              Precio personalizado: {formatPrice(professionalService.customPrice)}
                            </span>
                          </>
                        )}
                      </div>
                      
                      {isEditing && (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={professionalService.isActive}
                              onCheckedChange={(checked) => handleToggleActive(professionalService.serviceId)}
                            />
                            <span className="text-sm text-muted-foreground">
                              {professionalService.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Label htmlFor={`price-${professionalService.serviceId}`} className="text-sm">
                              Precio personalizado:
                            </Label>
                            <Input
                              id={`price-${professionalService.serviceId}`}
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder={service.price?.toString() || '0'}
                              value={professionalService.customPrice || ''}
                              onChange={(e) => handleCustomPriceChange(professionalService.serviceId, e.target.value)}
                              className="h-8 text-sm w-24"
                            />
                            <span className="text-sm text-muted-foreground">€</span>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveService(professionalService.serviceId)}
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {isEditing && getAvailableServicesToAdd().length > 0 && (
          <div className="mt-4 p-3 border rounded-lg bg-muted/30">
            <h4 className="text-xs font-medium mb-2">Agregar Servicio</h4>
            <div className="flex items-center gap-2">
              <Select
                value={selectedServiceId}
                onValueChange={setSelectedServiceId}
              >
                <SelectTrigger className="flex-1 h-8 text-xs">
                  <SelectValue placeholder="Seleccionar servicio..." />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableServicesToAdd().map((service: any) => (
                    <SelectItem key={service.id} value={service.id}>
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs">{service.name}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {service.category}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleAddService}
                disabled={!selectedServiceId}
                size="sm"
                className="h-8 px-3 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Agregar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

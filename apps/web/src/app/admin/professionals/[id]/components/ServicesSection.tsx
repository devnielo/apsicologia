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
}

export function ServicesSection({
  professional,
  isEditing,
  editData,
  onEdit,
  onSave,
  validationErrors,
  showValidation,
}: ServicesSectionProps) {
  const [localData, setLocalData] = useState<ProfessionalService[]>(
    Array.isArray(editData) ? editData : []
  );
  const [selectedServiceId, setSelectedServiceId] = useState<string>('');

  // Fetch available services
  const { data: availableServices, isLoading: servicesLoading } = useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const response = await apiClient.get('/services');
      return response.data.services || [];
    },
  });

  useEffect(() => {
    setLocalData(Array.isArray(editData) ? editData : []);
  }, [editData]);

  const handleLocalChange = useCallback((updatedServices: ProfessionalService[]) => {
    setLocalData(updatedServices);
    onEdit(updatedServices);
  }, [onEdit]);

  const handleEdit = () => {
    // Convert string array to ProfessionalService array if needed
    const services = professional.services || [];
    const initialData: ProfessionalService[] = services.map((service: any) => {
      if (typeof service === 'string') {
        return {
          serviceId: service,
          isActive: true,
        };
      }
      return service;
    });
    setLocalData(initialData);
    onEdit(initialData);
  };

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

  const handleSave = useCallback(() => {
    onSave(localData);
  }, [localData, onSave]);

  const getServiceById = (serviceId: string): IService | undefined => {
    return availableServices?.find((s: IService) => s._id === serviceId);
  };

  const getAvailableServicesToAdd = () => {
    if (!availableServices) return [];
    return availableServices.filter((service: IService) => 
      !localData.some(ps => ps.serviceId === service._id) && service.isActive
    );
  };

  const formatDuration = (minutes: number) => {
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
                const services = professional.services || [];
                const initialData: ProfessionalService[] = services.map((service: any) => {
                  if (typeof service === 'string') {
                    return {
                      serviceId: service,
                      isActive: true,
                    };
                  }
                  return service;
                });
                setLocalData(initialData);
                onEdit(initialData);
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <Edit className="h-4 w-4" />
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className="text-green-600 hover:text-green-700"
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
                    return service;
                  });
                  setLocalData(originalData);
                  onEdit(null);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        {localData.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p className="text-sm">No hay servicios asignados</p>
            {isEditing && (
              <p className="text-xs mt-1">
                Usa el formulario de abajo para agregar servicios
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {localData.map((professionalService) => {
              const service = getServiceById(professionalService.serviceId);
              if (!service) return null;

              const effectivePrice = professionalService.customPrice ?? service.price;

              return (
                <div key={professionalService.serviceId} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{service.name}</h4>
                        <Badge variant="outline">{service.category}</Badge>
                        {!professionalService.isActive && (
                          <Badge variant="secondary">Inactivo</Badge>
                        )}
                      </div>
                      
                      {service.description && (
                        <span className="text-sm text-muted-foreground">
                          {service.description}
                        </span>
                      )}
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Duración: {formatDuration(service.duration)}</span>
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
                        <div className="flex items-center gap-4 pt-2">
                          <div className="flex items-center space-x-2">
                            <Label htmlFor={`active-${professionalService.serviceId}`} className="text-sm">
                              Activo
                            </Label>
                            <Switch
                              id={`active-${professionalService.serviceId}`}
                              checked={professionalService.isActive}
                              onCheckedChange={() => handleToggleActive(professionalService.serviceId)}
                            />
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Label htmlFor={`price-${professionalService.serviceId}`} className="text-sm">
                              Precio personalizado:
                            </Label>
                            <div className="relative">
                              <DollarSign className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                id={`price-${professionalService.serviceId}`}
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder={service.price?.toString() || '0'}
                                value={professionalService.customPrice || ''}
                                onChange={(e) => handleCustomPriceChange(professionalService.serviceId, e.target.value)}
                                className="pl-8 w-32"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    {isEditing && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveService(professionalService.serviceId)}
                        className="text-red-500 hover:text-red-700"
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
          <div className="border-t pt-4 space-y-3">
            <h4 className="font-medium">Agregar Servicio</h4>
            <div className="flex gap-2">
              <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Seleccionar servicio..." />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableServicesToAdd().map((service: IService) => (
                    <SelectItem key={service._id} value={service._id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{service.name}</span>
                        <span className="text-sm text-muted-foreground ml-2">
                          {formatPrice(service.price || 0)} • {formatDuration(service.duration)}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddService}
                disabled={!selectedServiceId}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {isEditing && getAvailableServicesToAdd().length === 0 && localData.length > 0 && (
          <div className="border-t pt-4">
            <p className="text-sm text-muted-foreground text-center">
              Todos los servicios disponibles ya están asignados
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

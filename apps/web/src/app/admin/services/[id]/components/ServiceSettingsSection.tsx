'use client';

import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Edit, Save, X, Cog, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Service, ServiceFormData } from '../../types';
import { cn } from '@/lib/utils';

interface ServiceSettingsSectionProps {
  service?: Service;
  isEditing?: boolean;
  editData?: Partial<ServiceFormData>;
  onEdit?: () => void;
  onSave?: (data: Partial<ServiceFormData>) => void;
  onCancel?: () => void;
  className?: string;
}

export function ServiceSettingsSection({ 
  service, 
  isEditing, 
  editData, 
  onEdit, 
  onSave, 
  onCancel,
  className 
}: ServiceSettingsSectionProps) {
  const queryClient = useQueryClient();
  const [localData, setLocalData] = useState<Partial<ServiceFormData>>({});
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showValidation, setShowValidation] = useState(false);

  // Initialize local data when editing starts
  useEffect(() => {
    if (isEditing && service) {
      setLocalData({
        settings: {
          maxAdvanceBookingDays: service.settings?.maxAdvanceBookingDays || 30,
          minAdvanceBookingHours: service.settings?.minAdvanceBookingHours || 2,
          allowSameDayBooking: service.settings?.allowSameDayBooking ?? true,
          bufferBefore: service.settings?.bufferBefore || 0,
          bufferAfter: service.settings?.bufferAfter || 0,
          maxConcurrentBookings: service.settings?.maxConcurrentBookings || 1,
          requiresIntake: service.settings?.requiresIntake ?? false,
          intakeFormId: service.settings?.intakeFormId || '',
        },
        preparation: {
          instructions: service.preparation?.instructions || '',
          requiredDocuments: service.preparation?.requiredDocuments || [],
          recommendedDuration: service.preparation?.recommendedDuration || 0,
        },
        followUp: {
          instructions: service.followUp?.instructions || '',
          scheduledTasks: service.followUp?.scheduledTasks || [],
          recommendedGap: service.followUp?.recommendedGap || 7,
        },
        ...editData
      });
    }
  }, [isEditing, service, editData]);

  // Validation function
  const validateData = useCallback((data: Partial<ServiceFormData>): string[] => {
    const errors: string[] = [];
    
    if (data.settings?.maxAdvanceBookingDays && 
        (data.settings.maxAdvanceBookingDays < 1 || data.settings.maxAdvanceBookingDays > 365)) {
      errors.push('Los días de reserva anticipada deben estar entre 1 y 365');
    }
    
    if (data.settings?.minAdvanceBookingHours && 
        (data.settings.minAdvanceBookingHours < 0 || data.settings.minAdvanceBookingHours > 168)) {
      errors.push('Las horas mínimas de reserva deben estar entre 0 y 168');
    }
    
    if (data.settings?.bufferBefore && 
        (data.settings.bufferBefore < 0 || data.settings.bufferBefore > 120)) {
      errors.push('El buffer antes debe estar entre 0 y 120 minutos');
    }
    
    if (data.settings?.bufferAfter && 
        (data.settings.bufferAfter < 0 || data.settings.bufferAfter > 120)) {
      errors.push('El buffer después debe estar entre 0 y 120 minutos');
    }
    
    if (data.settings?.maxConcurrentBookings && 
        (data.settings.maxConcurrentBookings < 1 || data.settings.maxConcurrentBookings > 10)) {
      errors.push('Las reservas concurrentes deben estar entre 1 y 10');
    }
    
    return errors;
  }, []);

  // Handle field changes
  const handleChange = useCallback((field: string, value: any) => {
    setLocalData(prev => {
      const newData = { ...prev };
      
      // Handle nested field paths (e.g., 'settings.bufferBefore')
      const fieldParts = field.split('.');
      let current = newData;
      
      for (let i = 0; i < fieldParts.length - 1; i++) {
        const part = fieldParts[i];
        if (!current[part as keyof typeof current]) {
          (current as any)[part] = {};
        }
        current = (current as any)[part];
      }
      
      const finalField = fieldParts[fieldParts.length - 1];
      (current as any)[finalField] = value;
      
      // Clear validation errors when user starts typing
      if (showValidation) {
        const newErrors = validateData(newData);
        setValidationErrors(newErrors);
      }
      
      return newData;
    });
  }, [showValidation, validateData]);

  // Handle array fields
  const handleArrayChange = useCallback((field: string, value: string) => {
    const array = value.split('\n').map(item => item.trim()).filter(Boolean);
    handleChange(field, array);
  }, [handleChange]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: Partial<ServiceFormData>) => {
      if (!service?.id) throw new Error('Service ID is required');
      
      const response = await api.put(`/services/${service.id}`, data);
      return response.data;
    },
    onSuccess: (updatedService) => {
      toast.success('Configuración del servicio actualizada');
      queryClient.setQueryData(['service', service?.id], updatedService);
      queryClient.invalidateQueries({ queryKey: ['services'] });
      onSave?.(localData);
      setShowValidation(false);
    },
    onError: (error: any) => {
      console.error('Error updating service settings:', error);
      toast.error(error?.response?.data?.message || 'Error al actualizar la configuración');
    },
  });

  // Handle save
  const handleSave = useCallback(() => {
    const errors = validateData(localData);
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      setShowValidation(true);
      toast.error('Por favor corrige los errores antes de guardar');
      return;
    }
    
    saveMutation.mutate(localData);
  }, [localData, validateData, saveMutation]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    setLocalData({});
    setValidationErrors([]);
    setShowValidation(false);
    onCancel?.();
  }, [onCancel]);

  const getFieldError = (field: string) => {
    if (!showValidation) return null;
    return validationErrors.find((error: string) => error.toLowerCase().includes(field.toLowerCase()));
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Configuración del Servicio */}
      <div className="flex items-center justify-between py-4 border-b border-border/30">
        <div>
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Cog className="h-4 w-4 text-primary" />
            Configuración del Servicio
          </h3>
          <p className="text-sm text-muted-foreground">
            Configuración de reservas, buffers y requisitos especiales.
          </p>
        </div>
        {!isEditing ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={saveMutation.isPending}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {saveMutation.isPending ? 'Guardando...' : 'Guardar'}
            </Button>
          </div>
        )}
      </div>

      {/* Form Fields */}
      <div className="py-4 space-y-8">
        {/* Configuración de Reservas */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Configuración de Reservas
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Días máximos de anticipación */}
            <div className="space-y-2">
              <Label htmlFor="maxAdvanceBookingDays" className="text-sm font-medium">
                Días máximos de anticipación
              </Label>
              {!isEditing ? (
                <p className="text-sm text-foreground py-2">
                  {service?.settings?.maxAdvanceBookingDays || 30} días
                </p>
              ) : (
                <>
                  <Input
                    id="maxAdvanceBookingDays"
                    type="number"
                    min="1"
                    max="365"
                    value={localData.settings?.maxAdvanceBookingDays || ''}
                    onChange={(e) => handleChange('settings.maxAdvanceBookingDays', parseInt(e.target.value) || 0)}
                    className={cn(getFieldError('días de reserva') && "border-red-500")}
                  />
                  {getFieldError('días de reserva') && (
                    <p className="text-xs text-red-600">{getFieldError('días de reserva')}</p>
                  )}
                </>
              )}
            </div>

            {/* Horas mínimas de anticipación */}
            <div className="space-y-2">
              <Label htmlFor="minAdvanceBookingHours" className="text-sm font-medium">
                Horas mínimas de anticipación
              </Label>
              {!isEditing ? (
                <p className="text-sm text-foreground py-2">
                  {service?.settings?.minAdvanceBookingHours || 2} horas
                </p>
              ) : (
                <>
                  <Input
                    id="minAdvanceBookingHours"
                    type="number"
                    min="0"
                    max="168"
                    value={localData.settings?.minAdvanceBookingHours || ''}
                    onChange={(e) => handleChange('settings.minAdvanceBookingHours', parseInt(e.target.value) || 0)}
                    className={cn(getFieldError('horas mínimas') && "border-red-500")}
                  />
                  {getFieldError('horas mínimas') && (
                    <p className="text-xs text-red-600">{getFieldError('horas mínimas')}</p>
                  )}
                </>
              )}
            </div>

            {/* Buffer antes */}
            <div className="space-y-2">
              <Label htmlFor="bufferBefore" className="text-sm font-medium">
                Buffer antes (minutos)
              </Label>
              {!isEditing ? (
                <p className="text-sm text-foreground py-2">
                  {service?.settings?.bufferBefore || 0} minutos
                </p>
              ) : (
                <>
                  <Input
                    id="bufferBefore"
                    type="number"
                    min="0"
                    max="120"
                    value={localData.settings?.bufferBefore || ''}
                    onChange={(e) => handleChange('settings.bufferBefore', parseInt(e.target.value) || 0)}
                    className={cn(getFieldError('buffer antes') && "border-red-500")}
                  />
                  {getFieldError('buffer antes') && (
                    <p className="text-xs text-red-600">{getFieldError('buffer antes')}</p>
                  )}
                </>
              )}
            </div>

            {/* Buffer después */}
            <div className="space-y-2">
              <Label htmlFor="bufferAfter" className="text-sm font-medium">
                Buffer después (minutos)
              </Label>
              {!isEditing ? (
                <p className="text-sm text-foreground py-2">
                  {service?.settings?.bufferAfter || 0} minutos
                </p>
              ) : (
                <>
                  <Input
                    id="bufferAfter"
                    type="number"
                    min="0"
                    max="120"
                    value={localData.settings?.bufferAfter || ''}
                    onChange={(e) => handleChange('settings.bufferAfter', parseInt(e.target.value) || 0)}
                    className={cn(getFieldError('buffer después') && "border-red-500")}
                  />
                  {getFieldError('buffer después') && (
                    <p className="text-xs text-red-600">{getFieldError('buffer después')}</p>
                  )}
                </>
              )}
            </div>

            {/* Reservas concurrentes máximas */}
            <div className="space-y-2">
              <Label htmlFor="maxConcurrentBookings" className="text-sm font-medium">
                Reservas concurrentes máximas
              </Label>
              {!isEditing ? (
                <p className="text-sm text-foreground py-2">
                  {service?.settings?.maxConcurrentBookings || 1}
                </p>
              ) : (
                <>
                  <Input
                    id="maxConcurrentBookings"
                    type="number"
                    min="1"
                    max="10"
                    value={localData.settings?.maxConcurrentBookings || ''}
                    onChange={(e) => handleChange('settings.maxConcurrentBookings', parseInt(e.target.value) || 0)}
                    className={cn(getFieldError('reservas concurrentes') && "border-red-500")}
                  />
                  {getFieldError('reservas concurrentes') && (
                    <p className="text-xs text-red-600">{getFieldError('reservas concurrentes')}</p>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Switches */}
          <div className="space-y-3">
            {/* Permitir reservas el mismo día */}
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <Label className="text-sm font-medium">Permitir reservas el mismo día</Label>
                <p className="text-xs text-muted-foreground">
                  Los pacientes pueden reservar para el día actual
                </p>
              </div>
              {!isEditing ? (
                <span className="text-sm text-foreground">
                  {service?.settings?.allowSameDayBooking ? 'Sí' : 'No'}
                </span>
              ) : (
                <Switch
                  checked={localData.settings?.allowSameDayBooking ?? true}
                  onCheckedChange={(checked) => handleChange('settings.allowSameDayBooking', checked)}
                />
              )}
            </div>

            {/* Requiere formulario de admisión */}
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <Label className="text-sm font-medium">Requiere formulario de admisión</Label>
                <p className="text-xs text-muted-foreground">
                  El paciente debe completar un formulario antes de la cita
                </p>
              </div>
              {!isEditing ? (
                <span className="text-sm text-foreground">
                  {service?.settings?.requiresIntake ? 'Sí' : 'No'}
                </span>
              ) : (
                <Switch
                  checked={localData.settings?.requiresIntake ?? false}
                  onCheckedChange={(checked) => handleChange('settings.requiresIntake', checked)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Preparación */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-primary" />
            Preparación
          </h4>
          
          {/* Instrucciones de preparación */}
          <div className="space-y-2">
            <Label htmlFor="preparationInstructions" className="text-sm font-medium">
              Instrucciones de preparación
            </Label>
            {!isEditing ? (
              <p className="text-sm text-foreground py-2 whitespace-pre-wrap">
                {service?.preparation?.instructions || 'No especificadas'}
              </p>
            ) : (
              <Textarea
                id="preparationInstructions"
                value={localData.preparation?.instructions || ''}
                onChange={(e) => handleChange('preparation.instructions', e.target.value)}
                placeholder="Instrucciones para que el paciente se prepare antes de la sesión..."
                rows={3}
                maxLength={1000}
              />
            )}
          </div>

          {/* Documentos requeridos */}
          <div className="space-y-2">
            <Label htmlFor="requiredDocuments" className="text-sm font-medium">
              Documentos requeridos
            </Label>
            {!isEditing ? (
              <div className="py-2">
                {service?.preparation?.requiredDocuments && service.preparation.requiredDocuments.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1 text-sm text-foreground">
                    {service.preparation.requiredDocuments.map((doc, index) => (
                      <li key={index}>{doc}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No se requieren documentos</p>
                )}
              </div>
            ) : (
              <>
                <Textarea
                  id="requiredDocuments"
                  value={(localData.preparation?.requiredDocuments || []).join('\n')}
                  onChange={(e) => handleArrayChange('preparation.requiredDocuments', e.target.value)}
                  placeholder="DNI&#10;Informe médico previo&#10;Historial clínico"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Un documento por línea
                </p>
              </>
            )}
          </div>

          {/* Duración recomendada de preparación */}
          <div className="space-y-2">
            <Label htmlFor="recommendedDuration" className="text-sm font-medium">
              Tiempo recomendado de preparación (minutos)
            </Label>
            {!isEditing ? (
              <p className="text-sm text-foreground py-2">
                {service?.preparation?.recommendedDuration || 0} minutos
              </p>
            ) : (
              <Input
                id="recommendedDuration"
                type="number"
                min="0"
                max="120"
                value={localData.preparation?.recommendedDuration || ''}
                onChange={(e) => handleChange('preparation.recommendedDuration', parseInt(e.target.value) || 0)}
                placeholder="15"
              />
            )}
          </div>
        </div>

        {/* Seguimiento */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-primary" />
            Seguimiento
          </h4>
          
          {/* Instrucciones de seguimiento */}
          <div className="space-y-2">
            <Label htmlFor="followUpInstructions" className="text-sm font-medium">
              Instrucciones de seguimiento
            </Label>
            {!isEditing ? (
              <p className="text-sm text-foreground py-2 whitespace-pre-wrap">
                {service?.followUp?.instructions || 'No especificadas'}
              </p>
            ) : (
              <Textarea
                id="followUpInstructions"
                value={localData.followUp?.instructions || ''}
                onChange={(e) => handleChange('followUp.instructions', e.target.value)}
                placeholder="Instrucciones para el paciente después de la sesión..."
                rows={3}
                maxLength={1000}
              />
            )}
          </div>

          {/* Tareas programadas */}
          <div className="space-y-2">
            <Label htmlFor="scheduledTasks" className="text-sm font-medium">
              Tareas programadas
            </Label>
            {!isEditing ? (
              <div className="py-2">
                {service?.followUp?.scheduledTasks && service.followUp.scheduledTasks.length > 0 ? (
                  <ul className="list-disc list-inside space-y-1 text-sm text-foreground">
                    {service.followUp.scheduledTasks.map((task, index) => (
                      <li key={index}>{task}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No hay tareas programadas</p>
                )}
              </div>
            ) : (
              <>
                <Textarea
                  id="scheduledTasks"
                  value={(localData.followUp?.scheduledTasks || []).join('\n')}
                  onChange={(e) => handleArrayChange('followUp.scheduledTasks', e.target.value)}
                  placeholder="Enviar cuestionario de seguimiento&#10;Programar próxima cita&#10;Revisar progreso"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  Una tarea por línea
                </p>
              </>
            )}
          </div>

          {/* Intervalo recomendado hasta la siguiente cita */}
          <div className="space-y-2">
            <Label htmlFor="recommendedGap" className="text-sm font-medium">
              Intervalo recomendado hasta la siguiente cita (días)
            </Label>
            {!isEditing ? (
              <p className="text-sm text-foreground py-2">
                {service?.followUp?.recommendedGap || 7} días
              </p>
            ) : (
              <Input
                id="recommendedGap"
                type="number"
                min="0"
                max="365"
                value={localData.followUp?.recommendedGap || ''}
                onChange={(e) => handleChange('followUp.recommendedGap', parseInt(e.target.value) || 0)}
                placeholder="7"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

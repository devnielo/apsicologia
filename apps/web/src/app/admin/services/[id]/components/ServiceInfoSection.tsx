'use client';

import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Edit, Save, X, User, Settings, Palette } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Service, ServiceFormData } from '../../types';
import { cn } from '@/lib/utils';

interface ServiceInfoSectionProps {
  service?: Service;
  isEditing?: boolean;
  editData?: Partial<ServiceFormData>;
  onEdit?: () => void;
  onSave?: (data: Partial<ServiceFormData>) => void;
  onCancel?: () => void;
  className?: string;
}

const colorOptions = [
  { value: '#3B82F6', label: 'Azul', class: 'bg-blue-500' },
  { value: '#EF4444', label: 'Rojo', class: 'bg-red-500' },
  { value: '#10B981', label: 'Verde', class: 'bg-green-500' },
  { value: '#F59E0B', label: 'Amarillo', class: 'bg-yellow-500' },
  { value: '#8B5CF6', label: 'Púrpura', class: 'bg-purple-500' },
  { value: '#06B6D4', label: 'Cian', class: 'bg-cyan-500' },
  { value: '#84CC16', label: 'Lima', class: 'bg-lime-500' },
  { value: '#F97316', label: 'Naranja', class: 'bg-orange-500' },
  { value: '#EC4899', label: 'Rosa', class: 'bg-pink-500' },
  { value: '#6B7280', label: 'Gris', class: 'bg-gray-500' },
];

const categoryOptions = [
  'Terapia',
  'Consulta',
  'Evaluación',
  'Seguimiento',
  'Grupal',
  'Especializada'
];

const currencyOptions = [
  { value: 'EUR', label: 'Euro (€)' },
  { value: 'USD', label: 'Dólar ($)' },
  { value: 'GBP', label: 'Libra (£)' }
];

export function ServiceInfoSection({ 
  service, 
  isEditing, 
  editData, 
  onEdit, 
  onSave, 
  onCancel,
  className 
}: ServiceInfoSectionProps) {
  const queryClient = useQueryClient();
  const [localData, setLocalData] = useState<Partial<ServiceFormData>>({});
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [showValidation, setShowValidation] = useState(false);

  // Initialize local data when editing starts
  useEffect(() => {
    if (isEditing && service) {
      setLocalData({
        name: service.name,
        description: service.description || '',
        durationMinutes: service.durationMinutes,
        price: service.price,
        currency: service.currency,
        color: service.color || '#3B82F6',
        category: service.category || '',
        tags: service.tags || [],
        isActive: service.isActive,
        isOnlineAvailable: service.isOnlineAvailable,
        requiresApproval: service.requiresApproval,
        isPubliclyBookable: service.isPubliclyBookable,
        ...editData
      });
    }
  }, [isEditing, service, editData]);

  // Validation function
  const validateData = useCallback((data: Partial<ServiceFormData>): string[] => {
    const errors: string[] = [];
    
    if (!data.name?.trim()) {
      errors.push('El nombre es obligatorio');
    }
    
    if (!data.durationMinutes || data.durationMinutes < 15) {
      errors.push('La duración debe ser de al menos 15 minutos');
    }
    
    if (data.durationMinutes && data.durationMinutes > 480) {
      errors.push('La duración no puede exceder 8 horas');
    }
    
    if (!data.price || data.price < 0) {
      errors.push('El precio debe ser mayor o igual a 0');
    }
    
    if (!data.currency) {
      errors.push('La moneda es obligatoria');
    }
    
    return errors;
  }, []);

  // Handle field changes
  const handleChange = useCallback((field: keyof ServiceFormData, value: any) => {
    setLocalData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Clear validation errors when user starts typing
      if (showValidation) {
        const newErrors = validateData(newData);
        setValidationErrors(newErrors);
      }
      
      return newData;
    });
  }, [showValidation, validateData]);

  // Handle tags
  const handleTagsChange = useCallback((tagsString: string) => {
    const tags = tagsString.split(',').map(tag => tag.trim()).filter(Boolean);
    handleChange('tags', tags);
  }, [handleChange]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (data: Partial<ServiceFormData>) => {
      if (!service?.id) throw new Error('Service ID is required');
      
      const response = await api.put(`/services/${service.id}`, data);
      return response.data;
    },
    onSuccess: (updatedService) => {
      toast.success('Información del servicio actualizada');
      queryClient.setQueryData(['service', service?.id], updatedService);
      queryClient.invalidateQueries({ queryKey: ['services'] });
      onSave?.(localData);
      setShowValidation(false);
    },
    onError: (error: any) => {
      console.error('Error updating service:', error);
      toast.error(error?.response?.data?.message || 'Error al actualizar el servicio');
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
    return validationErrors.find((error: string) => error.includes(field));
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Información del Servicio */}
      <div className="flex items-center justify-between py-4 border-b border-border/30">
        <div>
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Settings className="h-4 w-4 text-primary" />
            Información del Servicio
          </h3>
          <p className="text-sm text-muted-foreground">
            Información básica del servicio, como nombre, descripción, duración y precio.
          </p>
        </div>
        {!isEditing ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              const initialData = {
                name: service?.name || '',
                description: service?.description || '',
                durationMinutes: service?.durationMinutes || 60,
                price: service?.price || 0,
                currency: service?.currency || 'EUR',
                color: service?.color || '#3B82F6',
                category: service?.category || '',
                tags: service?.tags || [],
                isActive: service?.isActive ?? true,
                isOnlineAvailable: service?.isOnlineAvailable ?? true,
                requiresApproval: service?.requiresApproval ?? false,
                isPubliclyBookable: service?.isPubliclyBookable ?? true,
              };
              setLocalData(initialData);
              onEdit?.();
            }}
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
      <div className="py-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nombre */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium">
              Nombre del servicio *
            </Label>
            {!isEditing ? (
              <p className="text-sm text-foreground py-2">
                {service?.name || 'No especificado'}
              </p>
            ) : (
              <>
                <Input
                  id="name"
                  value={localData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Ej: Terapia Individual"
                  className={cn(getFieldError('nombre') && "border-red-500")}
                />
                {getFieldError('nombre') && (
                  <p className="text-xs text-red-600">{getFieldError('nombre')}</p>
                )}
              </>
            )}
          </div>

          {/* Categoría */}
          <div className="space-y-2">
            <Label htmlFor="category" className="text-sm font-medium">
              Categoría
            </Label>
            {!isEditing ? (
              <p className="text-sm text-foreground py-2">
                {service?.category ? (
                  <Badge variant="secondary">{service.category}</Badge>
                ) : 'No especificada'}
              </p>
            ) : (
              <Select 
                value={localData.category || ''} 
                onValueChange={(value) => handleChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Sin categoría</SelectItem>
                  {categoryOptions.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Duración */}
          <div className="space-y-2">
            <Label htmlFor="duration" className="text-sm font-medium">
              Duración (minutos) *
            </Label>
            {!isEditing ? (
              <p className="text-sm text-foreground py-2">
                {service?.durationMinutes ? (
                  <>
                    {Math.floor(service.durationMinutes / 60) > 0 && 
                      `${Math.floor(service.durationMinutes / 60)}h `}
                    {service.durationMinutes % 60 > 0 && 
                      `${service.durationMinutes % 60}min`}
                  </>
                ) : 'No especificada'}
              </p>
            ) : (
              <>
                <Input
                  id="duration"
                  type="number"
                  min="15"
                  max="480"
                  value={localData.durationMinutes || ''}
                  onChange={(e) => handleChange('durationMinutes', parseInt(e.target.value) || 0)}
                  placeholder="60"
                  className={cn(getFieldError('duración') && "border-red-500")}
                />
                {getFieldError('duración') && (
                  <p className="text-xs text-red-600">{getFieldError('duración')}</p>
                )}
              </>
            )}
          </div>

          {/* Precio */}
          <div className="space-y-2">
            <Label htmlFor="price" className="text-sm font-medium">
              Precio *
            </Label>
            {!isEditing ? (
              <p className="text-sm text-foreground py-2">
                {service?.price !== undefined ? 
                  `€${service.price.toFixed(2)} ${service.currency}` : 'No especificado'}
              </p>
            ) : (
              <div className="flex gap-2">
                <Input
                  id="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={localData.price || ''}
                  onChange={(e) => handleChange('price', parseFloat(e.target.value) || 0)}
                  placeholder="70.00"
                  className={cn("flex-1", getFieldError('precio') && "border-red-500")}
                />
                <Select 
                  value={localData.currency || 'EUR'} 
                  onValueChange={(value) => handleChange('currency', value)}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currencyOptions.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {getFieldError('precio') && (
              <p className="text-xs text-red-600">{getFieldError('precio')}</p>
            )}
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label htmlFor="color" className="text-sm font-medium">
              Color identificativo
            </Label>
            {!isEditing ? (
              <div className="flex items-center gap-2 py-2">
                <div 
                  className="w-6 h-6 rounded-full border-2 border-border"
                  style={{ backgroundColor: service?.color || '#6B7280' }}
                />
                <span className="text-sm text-foreground">
                  {colorOptions.find(c => c.value === service?.color)?.label || 'Personalizado'}
                </span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => handleChange('color', color.value)}
                    className={cn(
                      "w-8 h-8 rounded-full border-2 transition-all",
                      localData.color === color.value 
                        ? "border-foreground scale-110" 
                        : "border-border hover:scale-105",
                      color.class
                    )}
                    title={color.label}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags" className="text-sm font-medium">
              Tags
            </Label>
            {!isEditing ? (
              <div className="py-2">
                {service?.tags && service.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {service.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Sin tags</p>
                )}
              </div>
            ) : (
              <>
                <Input
                  id="tags"
                  value={(localData.tags || []).join(', ')}
                  onChange={(e) => handleTagsChange(e.target.value)}
                  placeholder="terapia, individual, online (separados por comas)"
                />
                <p className="text-xs text-muted-foreground">
                  Separar múltiples tags con comas
                </p>
              </>
            )}
          </div>
        </div>

        {/* Descripción - Full width */}
        <div className="space-y-2 mt-6">
          <Label htmlFor="description" className="text-sm font-medium">
            Descripción
          </Label>
          {!isEditing ? (
            <p className="text-sm text-foreground py-2 whitespace-pre-wrap">
              {service?.description || 'No especificada'}
            </p>
          ) : (
            <Textarea
              id="description"
              value={localData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Descripción detallada del servicio..."
              rows={3}
              maxLength={500}
            />
          )}
        </div>

        {/* Configuración de disponibilidad */}
        <div className="space-y-4 mt-6">
          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Palette className="h-4 w-4 text-primary" />
            Configuración de Disponibilidad
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Estado activo */}
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <Label className="text-sm font-medium">Servicio activo</Label>
                <p className="text-xs text-muted-foreground">
                  El servicio está disponible para reservas
                </p>
              </div>
              {!isEditing ? (
                <Badge variant={service?.isActive ? "default" : "secondary"}>
                  {service?.isActive ? 'Activo' : 'Inactivo'}
                </Badge>
              ) : (
                <Switch
                  checked={localData.isActive ?? true}
                  onCheckedChange={(checked) => handleChange('isActive', checked)}
                />
              )}
            </div>

            {/* Disponibilidad online */}
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <Label className="text-sm font-medium">Disponible online</Label>
                <p className="text-xs text-muted-foreground">
                  Puede realizarse por videollamada
                </p>
              </div>
              {!isEditing ? (
                <Badge variant={service?.isOnlineAvailable ? "default" : "secondary"}>
                  {service?.isOnlineAvailable ? 'Sí' : 'No'}
                </Badge>
              ) : (
                <Switch
                  checked={localData.isOnlineAvailable ?? true}
                  onCheckedChange={(checked) => handleChange('isOnlineAvailable', checked)}
                />
              )}
            </div>

            {/* Requiere aprobación */}
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <Label className="text-sm font-medium">Requiere aprobación</Label>
                <p className="text-xs text-muted-foreground">
                  Las reservas deben ser aprobadas manualmente
                </p>
              </div>
              {!isEditing ? (
                <Badge variant={service?.requiresApproval ? "destructive" : "default"}>
                  {service?.requiresApproval ? 'Sí' : 'No'}
                </Badge>
              ) : (
                <Switch
                  checked={localData.requiresApproval ?? false}
                  onCheckedChange={(checked) => handleChange('requiresApproval', checked)}
                />
              )}
            </div>

            {/* Públicamente reservable */}
            <div className="flex items-center justify-between p-3 border border-border rounded-lg">
              <div>
                <Label className="text-sm font-medium">Públicamente reservable</Label>
                <p className="text-xs text-muted-foreground">
                  Los pacientes pueden reservar directamente
                </p>
              </div>
              {!isEditing ? (
                <Badge variant={service?.isPubliclyBookable ? "default" : "secondary"}>
                  {service?.isPubliclyBookable ? 'Sí' : 'No'}
                </Badge>
              ) : (
                <Switch
                  checked={localData.isPubliclyBookable ?? true}
                  onCheckedChange={(checked) => handleChange('isPubliclyBookable', checked)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

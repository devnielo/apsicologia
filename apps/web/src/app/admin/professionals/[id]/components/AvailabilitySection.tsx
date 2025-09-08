'use client';

import { useState, useCallback, useEffect } from 'react';
import { Save, Edit, X, Plus, Trash2, Clock, Calendar, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { IProfessional } from '@shared/types/professional';
import { transformBackendToFrontend } from '@shared/utils/availability';

interface TimeSlot {
  startTime: string;
  endTime: string;
}

interface WeeklyAvailability {
  dayOfWeek: number;
  startTime?: string;
  endTime?: string;
  isAvailable?: boolean;
  timeSlots?: TimeSlot[];
}

interface Vacation {
  startDate: Date;
  endDate: Date;
  reason?: string;
  isRecurring?: boolean;
  recurrencePattern?: string;
}

interface AvailabilitySectionProps {
  professional: IProfessional;
  isEditing: boolean;
  editData: any;
  onEdit: (data: any) => void;
  onSave: (data: any) => void;
  validationErrors: string[];
  showValidation: boolean;
}

const DAYS_OF_WEEK = [
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
  { value: 0, label: 'Domingo' },
];

const TIME_OPTIONS = Array.from({ length: 24 * 2 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = (i % 2) * 30;
  const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
  return time;
});

// Convert backend format to frontend format
const convertBackendToFrontend = (backendData: any[]) => {
  // If already in frontend format (has timeSlots), return as is
  if (backendData.length > 0 && backendData[0].timeSlots) {
    return backendData;
  }
  
  // Use shared utility for proper conversion (handles grouping by day)
  return transformBackendToFrontend(backendData);
};

export function AvailabilitySection({
  professional,
  isEditing,
  editData,
  onEdit,
  onSave,
  validationErrors,
  showValidation,
}: AvailabilitySectionProps) {

  const [localData, setLocalData] = useState<any[]>(() => {
    if (isEditing && Array.isArray(editData) && editData.length > 0) {
      return convertBackendToFrontend(editData);
    }
    const data = professional?.weeklyAvailability || [];
    return convertBackendToFrontend(data);
  });

  // Vacations state
  const [localVacations, setLocalVacations] = useState<Vacation[]>(() => {
    if (isEditing && editData?.vacations) {
      return editData.vacations.map((v: any) => ({
        ...v,
        startDate: new Date(v.startDate),
        endDate: new Date(v.endDate)
      }));
    }
    return professional?.vacations?.map((v: any) => ({
      ...v,
      startDate: new Date(v.startDate),
      endDate: new Date(v.endDate)
    })) || [];
  });

  const [newVacation, setNewVacation] = useState<Partial<Vacation>>({
    startDate: new Date(),
    endDate: new Date(),
    reason: '',
    isRecurring: false,
    recurrencePattern: ''
  });

  const handleLocalChange = useCallback((updatedAvailability: any[]) => {
    setLocalData(updatedAvailability);
    onEdit({ weeklyAvailability: updatedAvailability, vacations: localVacations });
  }, [onEdit, localVacations]);

  const handleVacationsChange = useCallback((updatedVacations: Vacation[]) => {
    setLocalVacations(updatedVacations);
    onEdit({ weeklyAvailability: localData, vacations: updatedVacations });
  }, [onEdit, localData]);

  // Update localData when professional data or editing state changes
  useEffect(() => {
    if (!isEditing && professional?.weeklyAvailability) {
      const convertedData = convertBackendToFrontend(professional.weeklyAvailability);
      setLocalData(convertedData);
    } else if (isEditing && Array.isArray(editData)) {
      // In edit mode, respect the editData even if it's empty
      if (editData.length > 0) {
        const convertedData = convertBackendToFrontend(editData);
        setLocalData(convertedData);
      } else {
        // Keep empty array if user deleted all slots
        setLocalData([]);
      }
    }
    // Remove the fallback that reloads from professional.weeklyAvailability in edit mode
  }, [professional?.weeklyAvailability, isEditing, editData]);

  const handleEdit = () => {
    const initialAvailability = convertBackendToFrontend(professional.weeklyAvailability || []);
    const initialVacations = professional?.vacations?.map((v: any) => ({
      ...v,
      startDate: new Date(v.startDate),
      endDate: new Date(v.endDate)
    })) || [];
    
    setLocalData(initialAvailability);
    setLocalVacations(initialVacations);
    onEdit({ weeklyAvailability: initialAvailability, vacations: initialVacations });
  };

  const handleAddDay = useCallback((dayOfWeek: number) => {
    const existingDay = localData.find(d => d.dayOfWeek === dayOfWeek);
    if (existingDay) return;

    const newDay: WeeklyAvailability = {
      dayOfWeek,
      timeSlots: [{ startTime: '09:00', endTime: '17:00' }],
    };

    const updatedData = [...localData, newDay].sort((a, b) => {
      // Sort by day of week (Monday first)
      const aDay = a.dayOfWeek === 0 ? 7 : a.dayOfWeek;
      const bDay = b.dayOfWeek === 0 ? 7 : b.dayOfWeek;
      return aDay - bDay;
    });

    handleLocalChange(updatedData);
  }, [localData, handleLocalChange]);

  const handleRemoveDay = useCallback((dayOfWeek: number) => {
    const updatedData = localData.filter(d => d.dayOfWeek !== dayOfWeek);
    handleLocalChange(updatedData);
  }, [localData, handleLocalChange]);

  const handleAddTimeSlot = useCallback((dayOfWeek: number) => {
    const updatedData = localData.map(day => {
      if (day.dayOfWeek === dayOfWeek) {
        const newSlot: TimeSlot = { startTime: '09:00', endTime: '10:00' };
        return { ...day, timeSlots: [...(day.timeSlots || []), newSlot] };
      }
      return day;
    });
    handleLocalChange(updatedData);
  }, [localData, handleLocalChange]);

  const handleRemoveTimeSlot = useCallback((dayOfWeek: number, slotIndex: number) => {
    const updatedData = localData.map(day => {
      if (day.dayOfWeek === dayOfWeek) {
        const updatedTimeSlots = (day.timeSlots || []).filter((_: any, index: number) => index !== slotIndex);
        return { ...day, timeSlots: updatedTimeSlots };
      }
      return day;
    });
    handleLocalChange(updatedData);
  }, [localData, handleLocalChange]);

  const handleTimeSlotChange = useCallback((
    dayOfWeek: number,
    slotIndex: number,
    field: 'startTime' | 'endTime',
    value: string
  ) => {
    const updatedData = localData.map(day => {
      if (day.dayOfWeek === dayOfWeek) {
        const updatedTimeSlots = (day.timeSlots || []).map((slot: any, index: number) => {
          if (index === slotIndex) {
            return { ...slot, [field]: value };
          }
          return slot;
        });
        return { ...day, timeSlots: updatedTimeSlots };
      }
      return day;
    });
    handleLocalChange(updatedData);
  }, [localData, handleLocalChange]);

  const handleSave = useCallback(() => {
    onSave({ weeklyAvailability: localData, vacations: localVacations });
  }, [localData, localVacations, onSave]);

  // Vacation handlers with auto-save
  const addVacation = () => {
    if (newVacation.startDate && newVacation.endDate) {
      const vacation: Vacation = {
        startDate: newVacation.startDate,
        endDate: newVacation.endDate,
        reason: newVacation.reason || '',
        isRecurring: newVacation.isRecurring || false,
        recurrencePattern: newVacation.recurrencePattern || ''
      };
      
      const updatedVacations = [...localVacations, vacation];
      setLocalVacations(updatedVacations);
      
      // Auto-save immediately
      onSave({ weeklyAvailability: localData, vacations: updatedVacations });
      
      // Reset form
      setNewVacation({
        startDate: new Date(),
        endDate: new Date(),
        reason: '',
        isRecurring: false,
        recurrencePattern: ''
      });
    }
  };

  const removeVacation = (index: number) => {
    const updatedVacations = localVacations.filter((_, i) => i !== index);
    setLocalVacations(updatedVacations);
    
    // Auto-save immediately
    onSave({ weeklyAvailability: localData, vacations: updatedVacations });
  };

  const formatDateRange = (startDate: Date, endDate: Date) => {
    const start = format(startDate, 'dd MMM yyyy', { locale: es });
    const end = format(endDate, 'dd MMM yyyy', { locale: es });
    return `${start} - ${end}`;
  };

  const getDayLabel = (dayOfWeek: number) => {
    return DAYS_OF_WEEK.find(d => d.value === dayOfWeek)?.label || `Día ${dayOfWeek}`;
  };

  const getAvailableDays = () => {
    return DAYS_OF_WEEK.filter(day => !localData.some(d => d.dayOfWeek === day.value));
  };

  const formatTimeRange = (startTime: string, endTime: string) => {
    return `${startTime} - ${endTime}`;
  };

  const isValidTimeSlot = (slot: TimeSlot) => {
    return slot.startTime < slot.endTime;
  };

  return (
    <div className="space-y-2">
      {/* Disponibilidad Semanal */}
      <div className="py-4 border-b border-border/30">
        <div className="flex items-center justify-between mb-1.5">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Disponibilidad Semanal
          </h3>
          {!isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const initialData = professional.weeklyAvailability || [];
                setLocalData(initialData);
                onEdit(initialData);
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className="text-green-600 hover:text-green-700"
              >
                <Save className="h-4 w-4 mr-1" />
                Guardar
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Reset to original data
                  const originalAvailability = professional.weeklyAvailability || [];
                  const originalVacations = professional?.vacations?.map((v: any) => ({
                    ...v,
                    startDate: new Date(v.startDate),
                    endDate: new Date(v.endDate)
                  })) || [];
                  
                  setLocalData(originalAvailability);
                  setLocalVacations(originalVacations);
                  onEdit(null);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-1" />
                Cancelar
              </Button>
            </div>
          )}
        </div>
        {localData.length === 0 ? (
          <div className="text-center py-4">
            <Clock className="h-6 w-6 mx-auto text-muted-foreground mb-1.5" />
            <p className="text-sm text-muted-foreground mb-1">No hay horarios configurados</p>
            {isEditing && (
              <p className="text-xs text-muted-foreground">
                Usa el formulario de abajo para agregar días de trabajo
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {localData.map((dayAvailability, dayIndex) => (
              <div key={`${dayAvailability.dayOfWeek}-${dayIndex}`} className="border border-border/50 rounded-sm p-2 bg-background/50">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div>
                    <h4 className="font-semibold text-sm">{getDayLabel(dayAvailability.dayOfWeek)}</h4>
                  </div>
                  {isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveDay(dayAvailability.dayOfWeek)}
                      className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>

                <div className="space-y-1">
                  {(dayAvailability.timeSlots || []).map((slot: any, slotIndex: number) => (
                    <div key={slotIndex} className="bg-muted/30 rounded-md p-2">
                      {isEditing ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <Select
                              value={slot.startTime}
                              onValueChange={(value) => handleTimeSlotChange(
                                dayAvailability.dayOfWeek,
                                slotIndex,
                                'startTime',
                                value
                              )}
                            >
                              <SelectTrigger className="w-20 h-7 text-xs flex-shrink-0">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="max-h-48">
                                {TIME_OPTIONS.map((time) => (
                                  <SelectItem key={time} value={time} className="text-xs">
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            
                            <span className="text-muted-foreground text-xs">-</span>
                            
                            <Select
                              value={slot.endTime}
                              onValueChange={(value) => handleTimeSlotChange(
                                dayAvailability.dayOfWeek,
                                slotIndex,
                                'endTime',
                                value
                              )}
                            >
                              <SelectTrigger className="w-20 h-7 text-xs flex-shrink-0">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="max-h-48">
                                {TIME_OPTIONS.map((time) => (
                                  <SelectItem key={time} value={time} className="text-xs">
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveTimeSlot(dayAvailability.dayOfWeek, slotIndex)}
                              className="text-red-500 hover:text-red-700 h-5 w-5 p-0 flex-shrink-0"
                              disabled={dayAvailability.timeSlots.length === 1}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          {!isValidTimeSlot(slot) && (
                            <p className="text-xs text-red-500">
                              Horario inválido
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs font-medium">
                              {formatTimeRange(slot.startTime, slot.endTime)}
                            </span>
                          </div>
                          <Badge variant="secondary" className="text-xs px-1.5 py-0">
                            {(() => {
                              const start = new Date(`2000-01-01T${slot.startTime}:00`);
                              const end = new Date(`2000-01-01T${slot.endTime}:00`);
                              const diff = (end.getTime() - start.getTime()) / (1000 * 60);
                              return `${Math.floor(diff / 60)}h ${diff % 60}min`;
                            })()} 
                          </Badge>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isEditing && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleAddTimeSlot(dayAvailability.dayOfWeek)}
                      className="w-full mt-1 h-7 text-xs"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Agregar Horario
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {isEditing && getAvailableDays().length > 0 && (
          <div className="border-t pt-2 space-y-1.5">
            <h4 className="text-sm font-medium">Agregar Día</h4>
            <div className="flex flex-wrap gap-1">
              {getAvailableDays().map((day) => (
                <Button
                  key={day.value}
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddDay(day.value)}
                  className="h-7 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {day.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        {showValidation && validationErrors.length > 0 && (
          <div className="space-y-1">
            {validationErrors.map((error, index) => (
              <p key={index} className="text-sm text-red-500">{error}</p>
            ))}
          </div>
        )}

      </div>

      {/* Vacaciones y Ausencias */}
      <div className="py-4 border-b border-border/30">
        <div className="flex items-center justify-between mb-1.5">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            Vacaciones y Ausencias
          </h3>
        </div>

        {/* Add New Vacation Form - More Compact */}
        {isEditing && (
          <div className="p-2 border border-dashed border-border rounded-md space-y-2.5 mb-2.5">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" />
              Agregar Período
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {/* Start Date */}
              <div className="space-y-1">
                <Label className="text-sm font-medium">Fecha de Inicio</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal h-8 text-sm"
                    >
                      <CalendarDays className="mr-2 h-3 w-3" />
                      {newVacation.startDate ? format(newVacation.startDate, 'dd MMM yyyy', { locale: es }) : 'Seleccionar'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={newVacation.startDate}
                      onSelect={(date) => setNewVacation(prev => ({ ...prev, startDate: date || new Date() }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* End Date */}
              <div className="space-y-1">
                <Label className="text-sm font-medium">Fecha de Fin</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal h-8 text-sm"
                    >
                      <CalendarDays className="mr-2 h-3 w-3" />
                      {newVacation.endDate ? format(newVacation.endDate, 'dd MMM yyyy', { locale: es }) : 'Seleccionar'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <CalendarComponent
                      mode="single"
                      selected={newVacation.endDate}
                      onSelect={(date) => setNewVacation(prev => ({ ...prev, endDate: date || new Date() }))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Reason - More Compact */}
            <div className="space-y-1">
              <Label className="text-sm font-medium">Motivo (Opcional)</Label>
              <Input
                placeholder="Vacaciones, formación, etc."
                value={newVacation.reason || ''}
                onChange={(e) => setNewVacation(prev => ({ ...prev, reason: e.target.value }))}
                className="h-8 text-sm"
              />
            </div>

            {/* Recurring - More Compact */}
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">¿Recurrente?</Label>
                <p className="text-xs text-muted-foreground">
                  Se repetirá cada año
                </p>
              </div>
              <Switch
                checked={newVacation.isRecurring || false}
                onCheckedChange={(checked) => setNewVacation(prev => ({ ...prev, isRecurring: checked }))}
              />
            </div>

            <Button
              onClick={addVacation}
              disabled={!newVacation.startDate || !newVacation.endDate}
              className="w-full h-8 text-sm"
            >
              <Plus className="h-3 w-3 mr-2" />
              Agregar y Guardar
            </Button>
          </div>
        )}

        {/* Vacations List - More Compact */}
        <div className="space-y-1.5">
          <h4 className="text-sm font-medium text-foreground">
            Períodos Programados ({localVacations.length})
          </h4>
          
          {localVacations.length === 0 ? (
            <div className="p-4 text-center border border-dashed border-border rounded-md">
              <CalendarDays className="h-5 w-5 text-muted-foreground mx-auto mb-1.5" />
              <p className="text-xs text-muted-foreground">
                No hay vacaciones programadas
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {localVacations.map((vacation, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2.5 border border-border rounded-md bg-background"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-1.5 mb-1">
                      <CalendarDays className="h-3 w-3 text-primary" />
                      <span className="font-medium text-xs">
                        {formatDateRange(vacation.startDate, vacation.endDate)}
                      </span>
                      {vacation.isRecurring && (
                        <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                          Recurrente
                        </span>
                      )}
                    </div>
                    {vacation.reason && (
                      <p className="text-xs text-muted-foreground ml-4">
                        {vacation.reason}
                      </p>
                    )}
                  </div>
                  
                  {isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeVacation(index)}
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

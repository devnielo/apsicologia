'use client';

import { useState, useCallback, useEffect } from 'react';
import { Save, Edit, X, Plus, Trash2, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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

interface AvailabilitySectionProps {
  professional: IProfessional;
  isEditing: boolean;
  editData: any;
  onEdit: (data: any) => void;
  onSave: (data: any) => void;
  validationErrors: string[];
  showValidation: boolean;
  isCreateMode?: boolean;
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
  isCreateMode = false
}: AvailabilitySectionProps) {

  const [localData, setLocalData] = useState<any[]>(() => {
    if (isEditing && Array.isArray(editData) && editData.length > 0) {
      return convertBackendToFrontend(editData);
    }
    const data = professional?.weeklyAvailability || [];
    return convertBackendToFrontend(data);
  });

  const handleLocalChange = useCallback((updatedAvailability: any[]) => {
    setLocalData(updatedAvailability);
    onEdit(updatedAvailability);
  }, [onEdit]);

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
    const initialData = convertBackendToFrontend(professional.weeklyAvailability || []);
    setLocalData(initialData);
    onEdit(initialData);
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
    onSave(localData);
  }, [localData, onSave]);

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
    <div className="space-y-4">
      {/* Disponibilidad Semanal */}
      <div className="pb-4 border-b border-border/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
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
                  // Reset to original availability data
                  const originalData = professional.weeklyAvailability || [];
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
          <div className="text-center py-8">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No hay horarios configurados</p>
            {isEditing && (
              <p className="text-sm text-muted-foreground">
                Usa el formulario de abajo para agregar días de trabajo
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {localData.map((dayAvailability, dayIndex) => (
              <div key={`${dayAvailability.dayOfWeek}-${dayIndex}`} className="border border-border/50 rounded-lg p-4 bg-background/50">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
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

                <div className="space-y-2">
                  {(dayAvailability.timeSlots || []).map((slot: any, slotIndex: number) => (
                    <div key={slotIndex} className="bg-muted/30 rounded-md p-2">
                      {isEditing ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Select
                              value={slot.startTime}
                              onValueChange={(value) => handleTimeSlotChange(
                                dayAvailability.dayOfWeek,
                                slotIndex,
                                'startTime',
                                value
                              )}
                            >
                              <SelectTrigger className="w-20 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {TIME_OPTIONS.map((time) => (
                                  <SelectItem key={time} value={time}>
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
                              <SelectTrigger className="w-20 h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {TIME_OPTIONS.map((time) => (
                                  <SelectItem key={time} value={time}>
                                    {time}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveTimeSlot(dayAvailability.dayOfWeek, slotIndex)}
                              className="text-red-500 hover:text-red-700 h-6 w-6 p-0"
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
                          <div className="flex items-center gap-2">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs font-medium">
                              {formatTimeRange(slot.startTime, slot.endTime)}
                            </span>
                          </div>
                          <Badge variant="secondary" className="text-xs px-2 py-0">
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
                      className="w-full mt-2 h-8 text-xs"
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
          <div className="border-t pt-4 space-y-3">
            <h4 className="font-medium">Agregar Día</h4>
            <div className="flex flex-wrap gap-2">
              {getAvailableDays().map((day) => (
                <Button
                  key={day.value}
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddDay(day.value)}
                >
                  <Plus className="h-4 w-4 mr-1" />
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
    </div>
  );
}

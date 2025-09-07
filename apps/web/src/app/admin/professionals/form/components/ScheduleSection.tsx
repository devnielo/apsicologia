'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Edit, Save, X, Clock, Calendar } from 'lucide-react';

interface TimeSlot {
  start: string;
  end: string;
}

interface DaySchedule {
  isActive: boolean;
  timeSlots: TimeSlot[];
}

interface ScheduleData {
  maxPatientsPerDay: number;
  sessionDuration: number;
  breakBetweenSessions: number;
  weeklySchedule: {
    monday: DaySchedule;
    tuesday: DaySchedule;
    wednesday: DaySchedule;
    thursday: DaySchedule;
    friday: DaySchedule;
    saturday: DaySchedule;
    sunday: DaySchedule;
  };
}

interface ScheduleSectionProps {
  professional: any;
  isEditing: boolean;
  editData: ScheduleData;
  onEdit: (data: ScheduleData) => void;
  onSave: (data: ScheduleData) => void;
  validationErrors: string[];
  showValidation: boolean;
  isCreateMode?: boolean;
}

const DAYS_OF_WEEK = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' }
];

const DEFAULT_SCHEDULE: ScheduleData = {
  maxPatientsPerDay: 8,
  sessionDuration: 60,
  breakBetweenSessions: 15,
  weeklySchedule: {
    monday: { isActive: true, timeSlots: [{ start: '09:00', end: '17:00' }] },
    tuesday: { isActive: true, timeSlots: [{ start: '09:00', end: '17:00' }] },
    wednesday: { isActive: true, timeSlots: [{ start: '09:00', end: '17:00' }] },
    thursday: { isActive: true, timeSlots: [{ start: '09:00', end: '17:00' }] },
    friday: { isActive: true, timeSlots: [{ start: '09:00', end: '17:00' }] },
    saturday: { isActive: false, timeSlots: [] },
    sunday: { isActive: false, timeSlots: [] }
  }
};

export function ScheduleSection({
  professional,
  isEditing,
  editData,
  onEdit,
  onSave,
  validationErrors,
  showValidation,
  isCreateMode = false
}: ScheduleSectionProps) {
  const [localData, setLocalData] = useState<ScheduleData>(() => {
    if (isEditing && editData) {
      return editData;
    }
    
    const professionalSchedule = professional?.schedule || {};
    return {
      maxPatientsPerDay: professional?.maxPatientsPerDay || DEFAULT_SCHEDULE.maxPatientsPerDay,
      sessionDuration: professionalSchedule.sessionDuration || DEFAULT_SCHEDULE.sessionDuration,
      breakBetweenSessions: professionalSchedule.breakBetweenSessions || DEFAULT_SCHEDULE.breakBetweenSessions,
      weeklySchedule: {
        ...DEFAULT_SCHEDULE.weeklySchedule,
        ...professionalSchedule.weeklySchedule
      }
    };
  });

  // Update localData when professional data or editing state changes
  useEffect(() => {
    if (!isEditing && professional) {
      const professionalSchedule = professional?.schedule || {};
      setLocalData({
        maxPatientsPerDay: professional?.maxPatientsPerDay || DEFAULT_SCHEDULE.maxPatientsPerDay,
        sessionDuration: professionalSchedule.sessionDuration || DEFAULT_SCHEDULE.sessionDuration,
        breakBetweenSessions: professionalSchedule.breakBetweenSessions || DEFAULT_SCHEDULE.breakBetweenSessions,
        weeklySchedule: {
          ...DEFAULT_SCHEDULE.weeklySchedule,
          ...professionalSchedule.weeklySchedule
        }
      });
    } else if (isEditing && editData) {
      setLocalData(editData);
    }
  }, [professional, isEditing, editData]);

  const handleLocalChange = useCallback((updatedData: ScheduleData) => {
    setLocalData(updatedData);
    onEdit(updatedData);
  }, [onEdit]);

  const handleSave = useCallback(() => {
    onSave(localData);
  }, [localData, onSave]);

  const handleEdit = () => {
    const professionalSchedule = professional?.schedule || {};
    const initialData: ScheduleData = {
      maxPatientsPerDay: professional?.maxPatientsPerDay || DEFAULT_SCHEDULE.maxPatientsPerDay,
      sessionDuration: professionalSchedule.sessionDuration || DEFAULT_SCHEDULE.sessionDuration,
      breakBetweenSessions: professionalSchedule.breakBetweenSessions || DEFAULT_SCHEDULE.breakBetweenSessions,
      weeklySchedule: {
        ...DEFAULT_SCHEDULE.weeklySchedule,
        ...professionalSchedule.weeklySchedule
      }
    };
    setLocalData(initialData);
    onEdit(initialData);
  };

  const handleGeneralSettingChange = (field: keyof Pick<ScheduleData, 'maxPatientsPerDay' | 'sessionDuration' | 'breakBetweenSessions'>, value: number) => {
    handleLocalChange({
      ...localData,
      [field]: value
    });
  };

  const handleDayToggle = (dayKey: string, isActive: boolean) => {
    handleLocalChange({
      ...localData,
      weeklySchedule: {
        ...localData.weeklySchedule,
        [dayKey]: {
          ...localData.weeklySchedule[dayKey as keyof typeof localData.weeklySchedule],
          isActive,
          timeSlots: isActive ? localData.weeklySchedule[dayKey as keyof typeof localData.weeklySchedule].timeSlots : []
        }
      }
    });
  };

  const handleTimeSlotChange = (dayKey: string, slotIndex: number, field: 'start' | 'end', value: string) => {
    const daySchedule = localData.weeklySchedule[dayKey as keyof typeof localData.weeklySchedule];
    const updatedTimeSlots = [...daySchedule.timeSlots];
    updatedTimeSlots[slotIndex] = {
      ...updatedTimeSlots[slotIndex],
      [field]: value
    };

    handleLocalChange({
      ...localData,
      weeklySchedule: {
        ...localData.weeklySchedule,
        [dayKey]: {
          ...daySchedule,
          timeSlots: updatedTimeSlots
        }
      }
    });
  };

  const addTimeSlot = (dayKey: string) => {
    const daySchedule = localData.weeklySchedule[dayKey as keyof typeof localData.weeklySchedule];
    const newTimeSlot: TimeSlot = { start: '09:00', end: '17:00' };

    handleLocalChange({
      ...localData,
      weeklySchedule: {
        ...localData.weeklySchedule,
        [dayKey]: {
          ...daySchedule,
          timeSlots: [...daySchedule.timeSlots, newTimeSlot]
        }
      }
    });
  };

  const removeTimeSlot = (dayKey: string, slotIndex: number) => {
    const daySchedule = localData.weeklySchedule[dayKey as keyof typeof localData.weeklySchedule];
    const updatedTimeSlots = daySchedule.timeSlots.filter((_, index) => index !== slotIndex);

    handleLocalChange({
      ...localData,
      weeklySchedule: {
        ...localData.weeklySchedule,
        [dayKey]: {
          ...daySchedule,
          timeSlots: updatedTimeSlots
        }
      }
    });
  };

  const getActiveDaysCount = () => {
    return Object.values(localData.weeklySchedule).filter(day => day.isActive).length;
  };

  const getTotalHoursPerWeek = () => {
    let totalMinutes = 0;
    Object.values(localData.weeklySchedule).forEach(day => {
      if (day.isActive) {
        day.timeSlots.forEach(slot => {
          const start = new Date(`2000-01-01T${slot.start}:00`);
          const end = new Date(`2000-01-01T${slot.end}:00`);
          totalMinutes += (end.getTime() - start.getTime()) / (1000 * 60);
        });
      }
    });
    return Math.round(totalMinutes / 60 * 10) / 10;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Horarios y Disponibilidad</h2>
          <p className="text-sm text-muted-foreground">
            Configuración de horarios de trabajo y disponibilidad semanal
          </p>
        </div>
        
        {!isCreateMode && !isEditing ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEdit}
            className="text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
        ) : isEditing && !isCreateMode ? (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit({
                maxPatientsPerDay: professional?.maxPatientsPerDay || DEFAULT_SCHEDULE.maxPatientsPerDay,
                sessionDuration: professional?.schedule?.sessionDuration || DEFAULT_SCHEDULE.sessionDuration,
                breakBetweenSessions: professional?.schedule?.breakBetweenSessions || DEFAULT_SCHEDULE.breakBetweenSessions,
                weeklySchedule: {
                  ...DEFAULT_SCHEDULE.weeklySchedule,
                  ...professional?.schedule?.weeklySchedule
                }
              })}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className="medical-button-primary"
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar
            </Button>
          </div>
        ) : null}
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* General Settings */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-border rounded-lg">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Máximo Pacientes/Día</Label>
            {isEditing || isCreateMode ? (
              <Input
                type="number"
                min="1"
                max="20"
                value={localData.maxPatientsPerDay}
                onChange={(e) => handleGeneralSettingChange('maxPatientsPerDay', parseInt(e.target.value) || 1)}
              />
            ) : (
              <div className="p-2 bg-muted/30 rounded border text-sm">
                {localData.maxPatientsPerDay} pacientes
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Duración Sesión (min)</Label>
            {isEditing || isCreateMode ? (
              <Select
                value={localData.sessionDuration.toString()}
                onValueChange={(value) => handleGeneralSettingChange('sessionDuration', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="45">45 minutos</SelectItem>
                  <SelectItem value="60">60 minutos</SelectItem>
                  <SelectItem value="90">90 minutos</SelectItem>
                  <SelectItem value="120">120 minutos</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="p-2 bg-muted/30 rounded border text-sm">
                {localData.sessionDuration} minutos
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Descanso Entre Sesiones (min)</Label>
            {isEditing || isCreateMode ? (
              <Select
                value={localData.breakBetweenSessions.toString()}
                onValueChange={(value) => handleGeneralSettingChange('breakBetweenSessions', parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Sin descanso</SelectItem>
                  <SelectItem value="5">5 minutos</SelectItem>
                  <SelectItem value="10">10 minutos</SelectItem>
                  <SelectItem value="15">15 minutos</SelectItem>
                  <SelectItem value="30">30 minutos</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <div className="p-2 bg-muted/30 rounded border text-sm">
                {localData.breakBetweenSessions} minutos
              </div>
            )}
          </div>
        </div>

        {/* Weekly Schedule */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">Horario Semanal</h3>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <span>{getActiveDaysCount()} días activos</span>
              <span>{getTotalHoursPerWeek()}h/semana</span>
            </div>
          </div>

          <div className="space-y-3">
            {DAYS_OF_WEEK.map(({ key, label }) => {
              const daySchedule = localData.weeklySchedule[key as keyof typeof localData.weeklySchedule];
              
              return (
                <div key={key} className="p-4 border border-border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Label className="text-sm font-medium min-w-[80px]">{label}</Label>
                      {isEditing || isCreateMode ? (
                        <Switch
                          checked={daySchedule.isActive}
                          onCheckedChange={(checked) => handleDayToggle(key, checked)}
                        />
                      ) : (
                        <Badge variant={daySchedule.isActive ? "default" : "secondary"} className="text-xs">
                          {daySchedule.isActive ? 'Activo' : 'Inactivo'}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {daySchedule.isActive && (
                    <div className="space-y-2">
                      {daySchedule.timeSlots.map((slot, slotIndex) => (
                        <div key={slotIndex} className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {isEditing || isCreateMode ? (
                            <>
                              <Input
                                type="time"
                                value={slot.start}
                                onChange={(e) => handleTimeSlotChange(key, slotIndex, 'start', e.target.value)}
                                className="w-32"
                              />
                              <span className="text-muted-foreground">a</span>
                              <Input
                                type="time"
                                value={slot.end}
                                onChange={(e) => handleTimeSlotChange(key, slotIndex, 'end', e.target.value)}
                                className="w-32"
                              />
                              {daySchedule.timeSlots.length > 1 && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeTimeSlot(key, slotIndex)}
                                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </>
                          ) : (
                            <span className="text-sm">
                              {slot.start} - {slot.end}
                            </span>
                          )}
                        </div>
                      ))}
                      
                      {(isEditing || isCreateMode) && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => addTimeSlot(key)}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          + Agregar horario
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Schedule Summary */}
        {!isEditing && !isCreateMode && (
          <div className="p-4 bg-muted/30 rounded-lg border">
            <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Resumen de Disponibilidad
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Días activos:</span>
                <div className="font-medium">{getActiveDaysCount()}/7</div>
              </div>
              <div>
                <span className="text-muted-foreground">Horas/semana:</span>
                <div className="font-medium">{getTotalHoursPerWeek()}h</div>
              </div>
              <div>
                <span className="text-muted-foreground">Duración sesión:</span>
                <div className="font-medium">{localData.sessionDuration}min</div>
              </div>
              <div>
                <span className="text-muted-foreground">Máx. pacientes/día:</span>
                <div className="font-medium">{localData.maxPatientsPerDay}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Validation Errors */}
      {showValidation && validationErrors.length > 0 && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <ul className="text-sm text-destructive space-y-1">
            {validationErrors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

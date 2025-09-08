'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Edit, Save, X, CalendarDays, Plus, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Vacation {
  startDate: Date;
  endDate: Date;
  reason?: string;
  isRecurring?: boolean;
  recurrencePattern?: string;
}

interface VacationsSectionProps {
  professional: any;
  onEdit: (data: Vacation[] | null) => void;
  onSave: (data: Vacation[]) => void;
  validationErrors: Record<string, string[]>;
  showValidation: boolean;
  isCreateMode?: boolean;
}

export function VacationsSection({
  professional,
  onEdit,
  onSave,
  validationErrors,
  showValidation,
  isCreateMode = false
}: VacationsSectionProps) {
  const [isEditing, setIsEditing] = useState(isCreateMode);
  const [localData, setLocalData] = useState<Vacation[]>(() => {
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

  // Update localData when professional data changes
  useEffect(() => {
    if (!isEditing && professional?.vacations) {
      const vacations = professional.vacations.map((v: any) => ({
        ...v,
        startDate: new Date(v.startDate),
        endDate: new Date(v.endDate)
      }));
      setLocalData(vacations);
    }
  }, [professional?.vacations, isEditing]);

  const handleLocalChange = useCallback((updatedData: Vacation[]) => {
    setLocalData(updatedData);
    onEdit(updatedData);
  }, [onEdit]);

  const handleSave = useCallback(() => {
    setIsEditing(false);
    onSave(localData);
    onEdit(null);
  }, [localData, onSave, onEdit]);

  const handleEdit = () => {
    const initialData = professional?.vacations?.map((v: any) => ({
      ...v,
      startDate: new Date(v.startDate),
      endDate: new Date(v.endDate)
    })) || [];
    setLocalData(initialData);
    setIsEditing(true);
    onEdit(initialData);
  };

  const handleCancel = () => {
    const originalData = professional?.vacations?.map((v: any) => ({
      ...v,
      startDate: new Date(v.startDate),
      endDate: new Date(v.endDate)
    })) || [];
    setLocalData(originalData);
    setIsEditing(false);
    onEdit(null);
  };

  const addVacation = () => {
    if (newVacation.startDate && newVacation.endDate) {
      const vacation: Vacation = {
        startDate: newVacation.startDate,
        endDate: newVacation.endDate,
        reason: newVacation.reason || '',
        isRecurring: newVacation.isRecurring || false,
        recurrencePattern: newVacation.recurrencePattern || ''
      };
      
      const updatedVacations = [...localData, vacation];
      handleLocalChange(updatedVacations);
      
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
    const updatedVacations = localData.filter((_, i) => i !== index);
    handleLocalChange(updatedVacations);
  };

  const formatDateRange = (startDate: Date, endDate: Date) => {
    const start = format(startDate, 'dd MMM yyyy', { locale: es });
    const end = format(endDate, 'dd MMM yyyy', { locale: es });
    return `${start} - ${end}`;
  };

  const sectionValidationErrors = validationErrors.vacations || [];

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="pb-2 border-b border-border/30">
        <div className="flex items-center justify-between mb-1.5 py-4">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            Vacaciones y Ausencias
          </h3>
          
          {!isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEdit}
              className="text-muted-foreground hover:text-foreground"
            >
              <Edit className="h-4 w-4 mr-1" />
              Editar
            </Button>
          ) : (
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className="text-green-600 hover:text-green-700"
              >
                <Save className="h-4 w-4 mr-1" />
                Guardar
              </Button>
              {!isCreateMode && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCancel}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancelar
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Add New Vacation Form */}
        {isEditing && (
          <div className="space-y-2">
            <Label>Agregar Período de Vacaciones</Label>
            <div className="p-3 border border-dashed border-border rounded-md bg-muted/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                {/* Start Date */}
                <div className="space-y-1">
                  <Label className="text-sm">Fecha de Inicio</Label>
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
                      <Calendar
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
                  <Label className="text-sm">Fecha de Fin</Label>
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
                      <Calendar
                        mode="single"
                        selected={newVacation.endDate}
                        onSelect={(date) => setNewVacation(prev => ({ ...prev, endDate: date || new Date() }))}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Reason */}
              <div className="space-y-1 mb-3">
                <Label className="text-sm">Motivo (Opcional)</Label>
                <Textarea
                  placeholder="Vacaciones anuales, formación, etc."
                  value={newVacation.reason || ''}
                  onChange={(e) => setNewVacation(prev => ({ ...prev, reason: e.target.value }))}
                  className="resize-none h-20 text-sm"
                />
              </div>

              {/* Recurring */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <Label className="text-sm">¿Es recurrente?</Label>
                  <p className="text-xs text-muted-foreground">
                    Se repetirá automáticamente cada año
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
                size="sm"
                className="w-full h-8 text-sm"
              >
                <Plus className="h-3 w-3 mr-1" />
                Agregar
              </Button>
            </div>
          </div>
        )}

        {/* Vacations List */}
        <div className="space-y-2">
          <Label>Períodos Programados ({localData.length})</Label>
          {localData.length === 0 ? (
            <div className="text-center py-4">
              <CalendarDays className="h-5 w-5 mx-auto text-muted-foreground mb-1.5" />
              <p className="text-sm text-muted-foreground">
                No hay vacaciones programadas
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {localData.map((vacation, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2.5 border border-border rounded-md bg-background"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CalendarDays className="h-3 w-3 text-primary" />
                      <span className="font-medium text-sm">
                        {formatDateRange(vacation.startDate, vacation.endDate)}
                      </span>
                      {vacation.isRecurring && (
                        <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                          Recurrente
                        </span>
                      )}
                    </div>
                    {vacation.reason && (
                      <p className="text-xs text-muted-foreground ml-5">
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

        {/* Validation Errors */}
        {showValidation && sectionValidationErrors.length > 0 && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
            <ul className="text-sm text-destructive space-y-1">
              {sectionValidationErrors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

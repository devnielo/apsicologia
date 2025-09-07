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
  isEditing: boolean;
  editData: Vacation[];
  onEdit: (data: Vacation[]) => void;
  onSave: (data: Vacation[]) => void;
  validationErrors: string[];
  showValidation: boolean;
  isCreateMode?: boolean;
}

export function VacationsSection({
  professional,
  isEditing,
  editData,
  onEdit,
  onSave,
  validationErrors,
  showValidation,
  isCreateMode = false
}: VacationsSectionProps) {
  const [localData, setLocalData] = useState<Vacation[]>(() => {
    if (isEditing && editData) {
      return editData.map(v => ({
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

  // Update localData when professional data or editing state changes
  useEffect(() => {
    if (!isEditing && professional?.vacations) {
      const vacations = professional.vacations.map((v: any) => ({
        ...v,
        startDate: new Date(v.startDate),
        endDate: new Date(v.endDate)
      }));
      setLocalData(vacations);
    } else if (isEditing && editData) {
      const vacations = editData.map(v => ({
        ...v,
        startDate: new Date(v.startDate),
        endDate: new Date(v.endDate)
      }));
      setLocalData(vacations);
    }
  }, [professional?.vacations, isEditing, editData]);

  const handleLocalChange = useCallback((updatedData: Vacation[]) => {
    setLocalData(updatedData);
    onEdit(updatedData);
  }, [onEdit]);

  const handleSave = useCallback(() => {
    onSave(localData);
  }, [localData, onSave]);

  const handleEdit = () => {
    const initialData = professional?.vacations?.map((v: any) => ({
      ...v,
      startDate: new Date(v.startDate),
      endDate: new Date(v.endDate)
    })) || [];
    setLocalData(initialData);
    onEdit(initialData);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Vacaciones y Ausencias</h2>
          <p className="text-sm text-muted-foreground">
            Gestión de períodos de vacaciones y ausencias programadas
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
              onClick={() => onEdit(professional?.vacations || [])}
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

      {/* Add New Vacation Form */}
      {(isEditing || isCreateMode) && (
        <div className="p-4 border border-dashed border-border rounded-lg space-y-4">
          <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" />
            Agregar Período de Vacaciones
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Date */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Fecha de Inicio</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {newVacation.startDate ? format(newVacation.startDate, 'dd MMM yyyy', { locale: es }) : 'Seleccionar fecha'}
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
            <div className="space-y-2">
              <Label className="text-sm font-medium">Fecha de Fin</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarDays className="mr-2 h-4 w-4" />
                    {newVacation.endDate ? format(newVacation.endDate, 'dd MMM yyyy', { locale: es }) : 'Seleccionar fecha'}
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
          <div className="space-y-2">
            <Label className="text-sm font-medium">Motivo (Opcional)</Label>
            <Textarea
              placeholder="Vacaciones anuales, formación, etc."
              value={newVacation.reason || ''}
              onChange={(e) => setNewVacation(prev => ({ ...prev, reason: e.target.value }))}
              className="resize-none"
              rows={2}
            />
          </div>

          {/* Recurring */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">¿Es recurrente?</Label>
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
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Vacaciones
          </Button>
        </div>
      )}

      {/* Vacations List */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">
          Períodos Programados ({localData.length})
        </h3>
        
        {localData.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-border rounded-lg">
            <CalendarDays className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              No hay vacaciones programadas
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {localData.map((vacation, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border border-border rounded-lg bg-background"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <CalendarDays className="h-4 w-4 text-primary" />
                    <span className="font-medium text-sm">
                      {formatDateRange(vacation.startDate, vacation.endDate)}
                    </span>
                    {vacation.isRecurring && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                        Recurrente
                      </span>
                    )}
                  </div>
                  {vacation.reason && (
                    <p className="text-sm text-muted-foreground ml-6">
                      {vacation.reason}
                    </p>
                  )}
                </div>
                
                {(isEditing || isCreateMode) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVacation(index)}
                    className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
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

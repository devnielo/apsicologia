'use client';

import { Button } from '../../../../../components/ui/button';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import { Edit, Save, X, AlertTriangle } from 'lucide-react';

interface EmergencyContactSectionProps {
  patient: any;
  editingSection: string | null;
  editData: any;
  onEdit: (section: string, data: any) => void;
  onSave: (section: string) => void;
  onCancel: () => void;
  setEditData: (data: any) => void;
  validationErrors?: any;
  showValidation?: boolean;
  isCreating?: boolean;
}

export function EmergencyContactSection({
  patient,
  editingSection,
  editData,
  onEdit,
  onSave,
  onCancel,
  setEditData,
  validationErrors = {},
  showValidation = false,
  isCreating = false
}: EmergencyContactSectionProps) {
  // Helper function to render required field indicator
  const RequiredIndicator = () => (
    <span className="text-red-500 ml-1">*</span>
  );

  // Helper function to render field error
  const FieldError = ({ fieldName }: { fieldName: string }) => {
    if (!showValidation || !validationErrors[fieldName]) return null;
    return (
      <div className="text-xs text-red-500 mt-1">
        {validationErrors[fieldName]}
      </div>
    );
  };
  return (
    <div className="pb-4 border-b border-border/30">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-primary" />
          Contacto de Emergencia
        </h3>
        {!isCreating && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit('emergencyContact', patient.emergencyContact || {})}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-3 w-3" />
          </Button>
        )}
      </div>
      <div className="px-1">
        {(editingSection === 'emergencyContact' || isCreating) ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="emergencyName" className="text-xs font-medium text-foreground">
                  Nombre<RequiredIndicator />
                </Label>
                <Input
                  id="emergencyName"
                  value={isCreating ? (patient.emergencyContact?.name || '') : (editData.name || '')}
                  onChange={(e) => {
                    if (isCreating) {
                      onEdit('emergencyContact', { name: e.target.value });
                    } else {
                      setEditData({...editData, name: e.target.value});
                    }
                  }}
                  placeholder="Nombre del contacto"
                  className={`mt-1 h-8 text-xs ${
                    showValidation && validationErrors.emergencyContactName ? 'border-red-500' : ''
                  }`}
                />
                <FieldError fieldName="emergencyContactName" />
              </div>
              <div>
                <Label htmlFor="emergencyRelationship" className="text-xs font-medium text-foreground">Relación</Label>
                <Input
                  id="emergencyRelationship"
                  value={editData.relationship || ''}
                  onChange={(e) => setEditData({...editData, relationship: e.target.value})}
                  placeholder="Ej: Cónyuge, Padre, Hermano"
                  className="mt-1 h-8 text-xs"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="emergencyPhone" className="text-xs font-medium text-foreground">Teléfono</Label>
                <Input
                  id="emergencyPhone"
                  value={editData.phone || ''}
                  onChange={(e) => setEditData({...editData, phone: e.target.value})}
                  placeholder="+34 600 000 000"
                  className="mt-1 h-8 text-xs"
                />
              </div>
              <div>
                <Label htmlFor="emergencyEmail" className="text-xs font-medium text-foreground">Email (Opcional)</Label>
                <Input
                  id="emergencyEmail"
                  type="email"
                  value={editData.email || ''}
                  onChange={(e) => setEditData({...editData, email: e.target.value})}
                  placeholder="contacto@email.com"
                  className="mt-1 h-8 text-xs"
                />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={() => onSave('emergencyContact')} size="sm" className="h-7 text-xs">
                <Save className="h-3 w-3 mr-1" />
                Guardar
              </Button>
              <Button onClick={onCancel} variant="outline" size="sm" className="h-7 text-xs">
                <X className="h-3 w-3 mr-1" />
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Nombre:</span>
              <span className="text-foreground font-medium">{patient.emergencyContact?.name || 'Carmen López Martín'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Relación:</span>
              <span className="text-foreground font-medium">{patient.emergencyContact?.relationship || 'Hermana'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Teléfono:</span>
              <span className="text-foreground font-medium">{patient.emergencyContact?.phone || '+34 666 789 012'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Email:</span>
              <span className="text-foreground font-medium">{patient.emergencyContact?.email || 'carmen.lopez@email.com'}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

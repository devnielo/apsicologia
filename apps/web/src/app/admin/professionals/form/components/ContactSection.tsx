'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Edit, Save, X, Phone, Mail, MapPin } from 'lucide-react';

interface ContactInfo {
  phone?: string;
  email?: string;
  address?: string;
}

interface ContactSectionProps {
  professional: any;
  isEditing: boolean;
  editData: ContactInfo;
  onEdit: (data: ContactInfo) => void;
  onSave: (data: ContactInfo) => void;
  validationErrors: string[];
  showValidation: boolean;
  isCreateMode?: boolean;
}

export function ContactSection({
  professional,
  isEditing,
  editData,
  onEdit,
  onSave,
  validationErrors,
  showValidation,
  isCreateMode = false
}: ContactSectionProps) {
  const [localData, setLocalData] = useState<ContactInfo>(() => {
    if (isEditing && editData) {
      return editData;
    }
    return {
      phone: professional?.phone || '',
      email: professional?.email || '',
      address: professional?.address || '',
    };
  });

  // Update localData when professional data or editing state changes
  useEffect(() => {
    if (!isEditing && professional) {
      setLocalData({
        phone: professional.phone || '',
        email: professional.email || '',
        address: professional.address || '',
      });
    } else if (isEditing && editData) {
      setLocalData(editData);
    }
  }, [professional, isEditing, editData]);

  const handleLocalChange = useCallback((updatedData: ContactInfo) => {
    setLocalData(updatedData);
    onEdit(updatedData);
  }, [onEdit]);

  const handleSave = useCallback(() => {
    onSave(localData);
  }, [localData, onSave]);

  const handleEdit = () => {
    const initialData = {
      phone: professional?.phone || '',
      email: professional?.email || '',
      address: professional?.address || '',
    };
    setLocalData(initialData);
    onEdit(initialData);
  };

  const handleInputChange = (field: keyof ContactInfo, value: string) => {
    const updatedData = { ...localData, [field]: value };
    handleLocalChange(updatedData);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Información de Contacto</h2>
          <p className="text-sm text-muted-foreground">
            Información de contacto del profesional
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
              onClick={() => onEdit({ phone: professional?.phone || '', email: professional?.email || '', address: professional?.address || '' })}
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary" />
            Teléfono
          </Label>
          {isEditing || isCreateMode ? (
            <Input
              id="phone"
              type="tel"
              placeholder="+34 123 456 789"
              value={localData.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full"
            />
          ) : (
            <div className="p-3 bg-muted/30 rounded-md border">
              {localData.phone ? (
                <span className="text-foreground">{localData.phone}</span>
              ) : (
                <span className="text-muted-foreground text-sm">No especificado</span>
              )}
            </div>
          )}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            Email
          </Label>
          {isEditing || isCreateMode ? (
            <Input
              id="email"
              type="email"
              placeholder="profesional@ejemplo.com"
              value={localData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full"
            />
          ) : (
            <div className="p-3 bg-muted/30 rounded-md border">
              {localData.email ? (
                <span className="text-foreground">{localData.email}</span>
              ) : (
                <span className="text-muted-foreground text-sm">No especificado</span>
              )}
            </div>
          )}
        </div>

        {/* Address */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address" className="text-sm font-medium flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            Dirección
          </Label>
          {isEditing || isCreateMode ? (
            <Input
              id="address"
              type="text"
              placeholder="Calle Principal 123, Ciudad, Código Postal"
              value={localData.address || ''}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="w-full"
            />
          ) : (
            <div className="p-3 bg-muted/30 rounded-md border">
              {localData.address ? (
                <span className="text-foreground">{localData.address}</span>
              ) : (
                <span className="text-muted-foreground text-sm">No especificado</span>
              )}
            </div>
          )}
        </div>
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

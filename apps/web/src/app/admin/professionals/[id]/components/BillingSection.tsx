'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Edit, Save, X, CreditCard, Plus, Trash2 } from 'lucide-react';

interface BillingSettings {
  defaultPaymentMethod: 'cash' | 'card' | 'transfer' | 'insurance';
  acceptsInsurance: boolean;
  insuranceProviders: string[];
  taxRate?: number;
}

interface BillingSectionProps {
  professional: any;
  isEditing: boolean;
  editData: BillingSettings;
  onEdit: (data: BillingSettings) => void;
  onSave: (data: BillingSettings) => void;
  validationErrors: string[];
  showValidation: boolean;
  isCreateMode?: boolean;
}

const PAYMENT_METHODS = [
  { value: 'cash', label: 'Efectivo' },
  { value: 'card', label: 'Tarjeta' },
  { value: 'transfer', label: 'Transferencia' },
  { value: 'insurance', label: 'Seguro' },
];

export function BillingSection({
  professional,
  isEditing,
  editData,
  onEdit,
  onSave,
  validationErrors,
  showValidation,
  isCreateMode = false
}: BillingSectionProps) {
  const [localData, setLocalData] = useState<BillingSettings>(() => {
    if (isEditing && editData) {
      return editData;
    }
    return professional?.billingSettings || {
      defaultPaymentMethod: 'cash',
      acceptsInsurance: false,
      insuranceProviders: [],
      taxRate: 21,
    };
  });

  const [newInsuranceProvider, setNewInsuranceProvider] = useState('');

  // Update localData when professional data or editing state changes
  useEffect(() => {
    if (!isEditing && professional?.billingSettings) {
      setLocalData(professional.billingSettings);
    } else if (isEditing && editData) {
      setLocalData(editData);
    }
  }, [professional?.billingSettings, isEditing, editData]);

  const handleLocalChange = useCallback((updatedData: BillingSettings) => {
    setLocalData(updatedData);
    onEdit(updatedData);
  }, [onEdit]);

  const handleSave = useCallback(() => {
    onSave(localData);
  }, [localData, onSave]);

  const handleEdit = () => {
    const initialData = professional?.billingSettings || {
      defaultPaymentMethod: 'cash',
      acceptsInsurance: false,
      insuranceProviders: [],
      taxRate: 21,
    };
    setLocalData(initialData);
    onEdit(initialData);
  };

  const handleFieldChange = (field: keyof BillingSettings, value: any) => {
    const updatedData = { ...localData, [field]: value };
    handleLocalChange(updatedData);
  };

  const addInsuranceProvider = () => {
    if (newInsuranceProvider.trim()) {
      const updatedProviders = [...localData.insuranceProviders, newInsuranceProvider.trim()];
      handleFieldChange('insuranceProviders', updatedProviders);
      setNewInsuranceProvider('');
    }
  };

  const removeInsuranceProvider = (index: number) => {
    const updatedProviders = localData.insuranceProviders.filter((_, i) => i !== index);
    handleFieldChange('insuranceProviders', updatedProviders);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Configuración de Facturación</h2>
          <p className="text-sm text-muted-foreground">
            Métodos de pago, seguros y configuración fiscal
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
              onClick={() => onEdit(professional?.billingSettings || {})}
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
        {/* Payment Method */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="defaultPaymentMethod" className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Método de Pago Predeterminado
            </Label>
            {isEditing || isCreateMode ? (
              <Select
                value={localData.defaultPaymentMethod}
                onValueChange={(value) => handleFieldChange('defaultPaymentMethod', value as any)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar método" />
                </SelectTrigger>
                <SelectContent>
                  {PAYMENT_METHODS.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div className="p-3 bg-muted/30 rounded-md border">
                <span className="text-sm">
                  {PAYMENT_METHODS.find(m => m.value === localData.defaultPaymentMethod)?.label || 'No especificado'}
                </span>
              </div>
            )}
          </div>

          {/* Tax Rate */}
          <div className="space-y-2">
            <Label htmlFor="taxRate" className="text-sm font-medium">
              Tipo de IVA (%)
            </Label>
            {isEditing || isCreateMode ? (
              <Input
                id="taxRate"
                type="number"
                min="0"
                max="100"
                step="0.1"
                placeholder="21"
                value={localData.taxRate || ''}
                onChange={(e) => handleFieldChange('taxRate', parseFloat(e.target.value) || 0)}
                className="w-full"
              />
            ) : (
              <div className="p-3 bg-muted/30 rounded-md border">
                <span className="text-sm">
                  {localData.taxRate ? `${localData.taxRate}%` : 'No especificado'}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Insurance Settings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-foreground">Configuración de Seguros</h3>
              <p className="text-xs text-muted-foreground">
                Gestión de seguros médicos aceptados
              </p>
            </div>
            {isEditing || isCreateMode ? (
              <Switch
                checked={localData.acceptsInsurance}
                onCheckedChange={(checked) => handleFieldChange('acceptsInsurance', checked)}
              />
            ) : (
              <Badge variant={localData.acceptsInsurance ? "default" : "secondary"}>
                {localData.acceptsInsurance ? 'Acepta seguros' : 'No acepta seguros'}
              </Badge>
            )}
          </div>

          {/* Insurance Providers */}
          {localData.acceptsInsurance && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">
                Compañías de Seguros Aceptadas
              </Label>
              
              {/* Add new provider */}
              {(isEditing || isCreateMode) && (
                <div className="flex gap-2">
                  <Input
                    placeholder="Nombre de la compañía de seguros"
                    value={newInsuranceProvider}
                    onChange={(e) => setNewInsuranceProvider(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addInsuranceProvider()}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={addInsuranceProvider}
                    disabled={!newInsuranceProvider.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Providers list */}
              <div className="space-y-2">
                {localData.insuranceProviders.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-md">
                    No hay compañías de seguros configuradas
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {localData.insuranceProviders.map((provider, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-muted/30 rounded-md border"
                      >
                        <span className="text-sm">{provider}</span>
                        {(isEditing || isCreateMode) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeInsuranceProvider(index)}
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

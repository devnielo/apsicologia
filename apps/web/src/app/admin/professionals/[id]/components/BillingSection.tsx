'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Edit, Save, X, Plus, Trash2, CreditCard, Shield } from 'lucide-react';

interface BillingSettings {
  defaultPaymentMethod: 'cash' | 'card' | 'transfer' | 'insurance';
  acceptsInsurance: boolean;
  insuranceProviders: string[];
  taxRate?: number;
}

interface BillingSectionProps {
  professional: any;
  isEditing: boolean;
  editData: any;
  onEdit: (data: any) => void;
  onSave: (data: any) => void;
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
  const [localData, setLocalData] = useState<any>(() => {
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
    const updatedProviders = localData.insuranceProviders.filter((_: any, i: number) => i !== index);
    handleFieldChange('insuranceProviders', updatedProviders);
  };

  return (
    <div className="space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between mb-1.5 py-4 border-b border-border/30">
        <div>
          <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            Configuración de Facturación
          </h3>
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
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
        ) : isEditing && !isCreateMode ? (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setLocalData({});
                onEdit(null);
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className="text-green-600 hover:text-green-700"
            >
              <Save className="h-4 w-4 mr-1" />
              Guardar
            </Button>
          </div>
        ) : null}
      </div>

      {/* Content */}
      <div className="space-y-3">
        {/* Payment Method */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          <div className="space-y-1">
            <Label htmlFor="defaultPaymentMethod" className="text-sm font-medium flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Método de Pago Predeterminado
            </Label>
            {isEditing || isCreateMode ? (
              <Select
                value={localData.defaultPaymentMethod}
                onValueChange={(value) => handleFieldChange('defaultPaymentMethod', value as any)}
              >
                <SelectTrigger className="h-8 text-sm">
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
              <p className="text-sm py-2">
                {PAYMENT_METHODS.find(m => m.value === localData.defaultPaymentMethod)?.label || 'No especificado'}
              </p>
            )}
          </div>

          {/* Tax Rate */}
          <div className="space-y-1">
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
                className="h-8 text-sm"
              />
            ) : (
              <p className="text-sm py-2">
                {localData.taxRate ? `${localData.taxRate}%` : 'No especificado'}
              </p>
            )}
          </div>
        </div>

        {/* Insurance Settings */}
        <div className="space-y-1">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            ¿Acepta seguros médicos?
          </Label>
          {isEditing || isCreateMode ? (
            <div className="flex items-center space-x-2">
              <Switch
                checked={localData.acceptsInsurance}
                onCheckedChange={(checked) => handleFieldChange('acceptsInsurance', checked)}
              />
              <Label className="text-sm">
                {localData.acceptsInsurance ? 'Sí' : 'No'}
              </Label>
            </div>
          ) : (
            <p className="text-sm py-2">
              {localData.acceptsInsurance ? 'Sí' : 'No'}
            </p>
          )}
        </div>

        {/* Insurance Providers */}
        {localData.acceptsInsurance && (
          <div className="space-y-1">
            <Label className="text-sm font-medium">
              Compañías de Seguros Aceptadas
            </Label>
            {isEditing || isCreateMode ? (
              <div className="space-y-2">
                <div className="flex gap-1">
                  <Input
                    placeholder="Nombre de la compañía"
                    value={newInsuranceProvider}
                    onChange={(e) => setNewInsuranceProvider(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addInsuranceProvider()}
                    className="flex-1 h-8 text-sm"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={addInsuranceProvider}
                    disabled={!newInsuranceProvider.trim()}
                    className="h-8 px-3 text-sm"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Agregar
                  </Button>
                </div>
                {localData.insuranceProviders.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {localData.insuranceProviders.map((provider: any, index: number) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1 px-2.5 py-1 text-sm">
                        {provider}
                        <button
                          type="button"
                          onClick={() => removeInsuranceProvider(index)}
                          className="ml-1 hover:text-red-500"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {localData.insuranceProviders.length > 0 ? (
                  localData.insuranceProviders.map((provider: any, index: number) => (
                    <Badge key={index} variant="outline" className="px-2.5 py-1 text-sm">
                      {provider}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No hay compañías configuradas</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Validation Errors */}
      {showValidation && validationErrors.length > 0 && (
        <div className="p-2.5 bg-destructive/10 border border-destructive/20 rounded-md">
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

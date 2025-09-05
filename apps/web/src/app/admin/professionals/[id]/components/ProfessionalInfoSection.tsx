'use client';

import { useState, useCallback } from 'react';
import { Save, Edit, X, Plus, Trash2, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { PROFESSIONAL_SPECIALTIES, PROFESSIONAL_STATUS_OPTIONS } from '@shared/constants/clinical-options';
import type { IProfessional, IProfessionalUpdateInput } from '@shared/types/professional';

interface ProfessionalInfoSectionProps {
  professional: IProfessional;
  isEditing: boolean;
  editData: any;
  onEdit: (data: any) => void;
  onSave: (data: any) => void;
  validationErrors: string[];
  showValidation: boolean;
}

export function ProfessionalInfoSection({
  professional,
  isEditing,
  editData,
  onEdit,
  onSave,
  validationErrors,
  showValidation,
}: ProfessionalInfoSectionProps) {
  const [localData, setLocalData] = useState(editData);
  const [newSpecialty, setNewSpecialty] = useState('');

  const handleLocalChange = useCallback((field: string, value: any) => {
    const updatedData = { ...localData, [field]: value };
    setLocalData(updatedData);
    onEdit(updatedData);
  }, [localData, onEdit]);

  const handleEdit = () => {
    const initialData = {
      name: professional?.name || '',
      title: professional?.title || '',
      bio: professional?.bio || '',
      email: professional?.email || '',
      phone: professional?.phone || '',
      specialties: professional?.specialties || [],
      status: professional?.status || 'active',
      licenseNumber: professional?.licenseNumber || '',
      yearsOfExperience: professional?.yearsOfExperience || 0,
      languages: professional?.languages || [],
      isAcceptingNewPatients: professional?.isAcceptingNewPatients || false,
    };
    setLocalData(initialData);
    onEdit(initialData);
  };

  const handleAddSpecialty = useCallback(() => {
    if (!newSpecialty.trim()) return;

    const updatedSpecialties = [...(localData.specialties || []), newSpecialty.trim()];
    const updatedData = { ...localData, specialties: updatedSpecialties };
    setLocalData(updatedData);
    onEdit(updatedData);
    setNewSpecialty('');
  }, [localData, newSpecialty, onEdit]);

  const handleRemoveSpecialty = useCallback((index: number) => {
    const updatedSpecialties = (localData.specialties || []).filter((_: any, i: number) => i !== index);
    const updatedData = { ...localData, specialties: updatedSpecialties };
    setLocalData(updatedData);
    onEdit(updatedData);
  }, [localData, onEdit]);

  const handleSave = useCallback(() => {
    onSave(localData);
  }, [localData, onSave]);

  const getFieldError = (field: string) => {
    if (!showValidation) return null;
    return validationErrors.find((error: string) => error.includes(field));
  };

  return (
    <div className="space-y-4">
      {/* Información Profesional */}
      <div className="pb-4 border-b border-border/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            Información Profesional
          </h3>
          {!isEditing ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                const initialData = {
                  name: professional?.name || '',
                  title: professional?.title || '',
                  bio: professional?.bio || '',
                  email: professional?.email || '',
                  phone: professional?.phone || '',
                  specialties: professional?.specialties || [],
                  status: professional?.status || 'active',
                  licenseNumber: professional?.licenseNumber || '',
                  yearsOfExperience: professional?.yearsOfExperience || 0,
                  languages: professional?.languages || [],
                  isAcceptingNewPatients: professional?.isAcceptingNewPatients || false,
                };
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
                  setLocalData({});
                  onEdit(null);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Nombre Completo <span className="text-red-500">*</span>
            </Label>
            {isEditing ? (
              <Input
                id="name"
                value={localData.name || ''}
                onChange={(e) => handleLocalChange('name', e.target.value)}
                className={getFieldError('name') ? 'border-red-500' : ''}
              />
            ) : (
              <p className="text-sm py-2">{professional?.name || 'No especificado'}</p>
            )}
            {getFieldError('name') && (
              <p className="text-sm text-red-500">{getFieldError('name')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">
              Título Profesional
            </Label>
            {isEditing ? (
              <Input
                id="title"
                value={localData.title || ''}
                onChange={(e) => handleLocalChange('title', e.target.value)}
                placeholder="ej. Psicólogo Clínico"
              />
            ) : (
              <p className="text-sm py-2">{professional?.title || 'No especificado'}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            {isEditing ? (
              <Input
                id="email"
                type="email"
                value={localData.email || ''}
                onChange={(e) => handleLocalChange('email', e.target.value)}
                className={getFieldError('email') ? 'border-red-500' : ''}
              />
            ) : (
              <p className="text-sm py-2">{professional?.email || 'No especificado'}</p>
            )}
            {getFieldError('email') && (
              <p className="text-sm text-red-500">{getFieldError('email')}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Teléfono</Label>
            {isEditing ? (
              <Input
                id="phone"
                value={localData.phone || ''}
                onChange={(e) => handleLocalChange('phone', e.target.value)}
                placeholder="ej. +34 600 123 456"
              />
            ) : (
              <p className="text-sm py-2">{professional?.phone || 'No especificado'}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="yearsOfExperience">Años de Experiencia</Label>
            {isEditing ? (
              <Input
                id="yearsOfExperience"
                type="number"
                min="0"
                max="50"
                value={localData.yearsOfExperience || ''}
                onChange={(e) => handleLocalChange('yearsOfExperience', parseInt(e.target.value) || 0)}
              />
            ) : (
              <p className="text-sm py-2">
                {professional?.yearsOfExperience 
                  ? `${professional.yearsOfExperience} años`
                  : 'No especificado'
                }
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="licenseNumber">Número de Licencia</Label>
            {isEditing ? (
              <Input
                id="licenseNumber"
                value={localData.licenseNumber || ''}
                onChange={(e) => handleLocalChange('licenseNumber', e.target.value)}
                placeholder="ej. COL-12345"
              />
            ) : (
              <p className="text-sm py-2">{professional?.licenseNumber || 'No especificado'}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Estado</Label>
            {isEditing ? (
              <Select
                value={localData.status || 'active'}
                onValueChange={(value) => handleLocalChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  {PROFESSIONAL_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm py-2">
                {PROFESSIONAL_STATUS_OPTIONS.find(option => option.value === professional?.status)?.label || 'No especificado'}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="isAcceptingNewPatients">¿Acepta nuevos pacientes?</Label>
            {isEditing ? (
              <div className="flex items-center space-x-2">
                <Switch
                  id="isAcceptingNewPatients"
                  checked={localData.isAcceptingNewPatients || false}
                  onCheckedChange={(checked) => handleLocalChange('isAcceptingNewPatients', checked)}
                />
                <Label htmlFor="isAcceptingNewPatients" className="text-sm">
                  {localData.isAcceptingNewPatients ? 'Sí' : 'No'}
                </Label>
              </div>
            ) : (
              <p className="text-sm py-2">
                {professional?.isAcceptingNewPatients ? 'Sí' : 'No'}
              </p>
            )}
          </div>
        </div>

        {/* Bio Section */}
        <div className="space-y-2">
          <Label htmlFor="bio">Biografía</Label>
          {isEditing ? (
            <Textarea
              id="bio"
              value={localData.bio || ''}
              onChange={(e) => handleLocalChange('bio', e.target.value)}
              placeholder="Descripción profesional, experiencia, especialidades..."
              rows={4}
            />
          ) : (
            <p className="text-sm py-2 whitespace-pre-wrap">
              {professional?.bio || 'No especificado'}
            </p>
          )}
        </div>

        {/* Specialties Section */}
        <div className="space-y-2">
          <Label>Especialidades</Label>
          {isEditing ? (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Select
                  value=""
                  onValueChange={(value) => {
                    if (value && !localData.specialties?.includes(value)) {
                      const updatedSpecialties = [...(localData.specialties || []), value];
                      const updatedData = { ...localData, specialties: updatedSpecialties };
                      setLocalData(updatedData);
                      onEdit(updatedData);
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar especialidad" />
                  </SelectTrigger>
                  <SelectContent>
                    {PROFESSIONAL_SPECIALTIES.filter(specialty => 
                      !localData.specialties?.includes(specialty)
                    ).map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>
                        {specialty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="O escribir especialidad personalizada"
                  value={newSpecialty}
                  onChange={(e) => setNewSpecialty(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSpecialty();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddSpecialty}
                  disabled={!newSpecialty}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {(localData.specialties || []).map((specialty: string, index: number) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {specialty}
                    <button
                      type="button"
                      onClick={() => handleRemoveSpecialty(index)}
                      className="ml-1 hover:text-red-500"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {(professional?.specialties || []).map((specialty: string, index: number) => (
                <Badge key={index} variant="secondary">
                  {specialty}
                </Badge>
              ))}
              {(!professional?.specialties || professional.specialties.length === 0) && (
                <p className="text-sm text-muted-foreground">No hay especialidades definidas</p>
              )}
            </div>
          )}
        </div>

        {/* Languages Section */}
        <div className="space-y-2">
          <Label>Idiomas</Label>
          <div className="flex flex-wrap gap-2">
            {(professional?.languages || []).map((language: string, index: number) => (
              <Badge key={index} variant="outline">
                {language === 'es' ? 'Español' : language === 'en' ? 'Inglés' : language}
              </Badge>
            ))}
            {(!professional?.languages || professional.languages.length === 0) && (
              <p className="text-sm text-muted-foreground">No hay idiomas definidos</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

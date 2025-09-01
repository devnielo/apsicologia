'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label';
import { Edit, Save, X, User, Mail, Phone, MapPin, AlertTriangle } from 'lucide-react';

interface PersonalInfoSectionProps {
  patient: any;
  editingSection: string | null;
  editData: any;
  onEdit: (section: string, data: any) => void;
  onSave: (section: string) => void;
  onCancel: () => void;
  setEditData: (data: any) => void;
}

export function PersonalInfoSection({
  patient,
  editingSection,
  editData,
  onEdit,
  onSave,
  onCancel,
  setEditData
}: PersonalInfoSectionProps) {
  const fullName = `${patient.personalInfo?.firstName || ''} ${patient.personalInfo?.lastName || ''}`.trim();

  const formatDate = (date: string | Date) => {
    if (!date) return 'No especificado';
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatGender = (gender: string) => {
    const genderMap: { [key: string]: string } = {
      'male': 'Masculino',
      'female': 'Femenino',
      'non-binary': 'No binario',
      'other': 'Otro',
      'prefer-not-to-say': 'Prefiere no decir'
    };
    return genderMap[gender] || gender;
  };

  const formatMaritalStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'single': 'Soltero/a',
      'married': 'Casado/a',
      'divorced': 'Divorciado/a',
      'widowed': 'Viudo/a',
      'separated': 'Separado/a',
      'domestic-partnership': 'Pareja de hecho'
    };
    return statusMap[status] || status;
  };

  return (
    <div className="space-y-4">
      {/* Información Personal */}
      <div className="pb-4 border-b border-border/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <User className="h-4 w-4 text-primary" />
            Información Personal
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit('personalInfo', {
              firstName: patient.personalInfo?.firstName || '',
              lastName: patient.personalInfo?.lastName || '',
              dateOfBirth: patient.personalInfo?.dateOfBirth || '',
              gender: patient.personalInfo?.gender || '',
              maritalStatus: patient.personalInfo?.maritalStatus || '',
              occupation: patient.personalInfo?.occupation || '',
              idType: patient.personalInfo?.idType || '',
              idNumber: patient.personalInfo?.idNumber || ''
            })}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-3 w-3" />
          </Button>
        </div>
        <div className="px-1">
          {editingSection === 'personalInfo' ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Nombre:</span>
                  <Input
                    id="firstName"
                    value={editData.firstName ?? ''}
                    onChange={(e) => setEditData({...editData, firstName: e.target.value})}
                    className="h-9 text-sm max-w-[50%] text-left"
                    placeholder="Introduce el nombre"
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Apellidos:</span>
                  <Input
                    id="lastName"
                    value={editData.lastName ?? ''}
                    onChange={(e) => setEditData({...editData, lastName: e.target.value})}
                    className="h-9 text-sm max-w-[50%] text-left"
                    placeholder="Introduce los apellidos"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Nacimiento:</span>
                  <DatePicker
                    date={editData.dateOfBirth ? new Date(editData.dateOfBirth) : undefined}
                    onDateChange={(date) => setEditData({...editData, dateOfBirth: date})}
                    placeholder="Introduce la fecha de nacimiento"
                    className="h-9 text-sm w-[140px]"
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Género:</span>
                  <Select value={editData.gender ?? ''} onValueChange={(value) => setEditData({...editData, gender: value})}>
                    <SelectTrigger className="h-9 text-sm max-w-[50%]">
                      <SelectValue placeholder="Introduce el género" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Masculino</SelectItem>
                      <SelectItem value="female">Femenino</SelectItem>
                      <SelectItem value="non-binary">No binario</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                      <SelectItem value="prefer-not-to-say">Prefiere no decir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Estado civil:</span>
                  <Select value={editData.maritalStatus ?? ''} onValueChange={(value) => setEditData({...editData, maritalStatus: value})}>
                    <SelectTrigger className="h-9 text-sm max-w-[50%]">
                      <SelectValue placeholder="Introduce el estado civil" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Soltero/a</SelectItem>
                      <SelectItem value="married">Casado/a</SelectItem>
                      <SelectItem value="divorced">Divorciado/a</SelectItem>
                      <SelectItem value="widowed">Viudo/a</SelectItem>
                      <SelectItem value="separated">Separado/a</SelectItem>
                      <SelectItem value="domestic-partnership">Pareja de hecho</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Ocupación:</span>
                  <Input
                    id="occupation"
                    value={editData.occupation ?? ''}
                    onChange={(e) => setEditData({...editData, occupation: e.target.value})}
                    className="h-9 text-sm max-w-[50%] text-left"
                    placeholder="Introduce la ocupación"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tipo documento:</span>
                  <Select value={editData.idType ?? ''} onValueChange={(value) => setEditData({...editData, idType: value})}>
                    <SelectTrigger className="h-9 text-sm max-w-[50%]">
                      <SelectValue placeholder="Introduce el tipo de documento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dni">DNI</SelectItem>
                      <SelectItem value="nie">NIE</SelectItem>
                      <SelectItem value="passport">Pasaporte</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Número:</span>
                  <Input
                    id="idNumber"
                    value={editData.idNumber ?? ''}
                    onChange={(e) => setEditData({...editData, idNumber: e.target.value})}
                    className="h-9 text-sm max-w-[50%] text-left"
                    placeholder="Introduce el número de documento"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={() => onSave('personalInfo')} size="sm" className="h-7 text-xs">
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
            <div className="grid grid-cols-2 gap-3" style={{minHeight: '144px'}}>
              <div className="flex items-center justify-between text-sm h-9">
                <span className="text-muted-foreground">Nombre:</span>
                <span className="text-foreground font-medium">{fullName || 'Ana María González López'}</span>
              </div>
              <div className="flex items-center justify-between text-sm h-9">
                <span className="text-muted-foreground">Nacimiento:</span>
                <span className="text-foreground font-medium">{formatDate(patient.personalInfo?.dateOfBirth) || '15/03/1985'}</span>
              </div>
              <div className="flex items-center justify-between text-sm h-9">
                <span className="text-muted-foreground">Género:</span>
                <span className="text-foreground font-medium">{formatGender(patient.personalInfo?.gender) || 'Femenino'}</span>
              </div>
              <div className="flex items-center justify-between text-sm h-9">
                <span className="text-muted-foreground">Estado civil:</span>
                <span className="text-foreground font-medium">{formatMaritalStatus(patient.personalInfo?.maritalStatus) || 'Casado/a'}</span>
              </div>
              <div className="flex items-center justify-between text-sm h-9">
                <span className="text-muted-foreground">Ocupación:</span>
                <span className="text-foreground font-medium">{patient.personalInfo?.occupation || 'Profesora'}</span>
              </div>
              <div className="flex items-center justify-between text-sm h-9">
                <span className="text-muted-foreground">Documento:</span>
                <span className="text-foreground font-mono">{patient.personalInfo?.idType?.toUpperCase() || 'DNI'}: {patient.personalInfo?.idNumber || '12345678A'}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Información de Contacto */}
      <div className="pb-4 border-b border-border/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary" />
            Información de Contacto
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit('contactInfo', {
              email: patient.contactInfo?.email || '',
              phone: patient.contactInfo?.phone || '',
              street: patient.contactInfo?.address?.street || '',
              city: patient.contactInfo?.address?.city || '',
              postalCode: patient.contactInfo?.address?.postalCode || '',
              country: patient.contactInfo?.address?.country || ''
            })}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-3 w-3" />
          </Button>
        </div>
        <div className="px-1">
          {editingSection === 'contactInfo' ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Email:</span>
                  <Input
                    id="email"
                    type="email"
                    value={editData.email ?? ''}
                    onChange={(e) => setEditData({...editData, email: e.target.value})}
                    className="h-9 text-sm max-w-[50%] text-left"
                    placeholder="Introduce el email"
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Teléfono:</span>
                  <Input
                    id="phone"
                    value={editData.phone ?? ''}
                    onChange={(e) => setEditData({...editData, phone: e.target.value})}
                    className="h-9 text-sm max-w-[50%] text-left"
                    placeholder="Introduce el teléfono"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Dirección:</span>
                  <Input
                    id="street"
                    value={editData.street ?? ''}
                    onChange={(e) => setEditData({...editData, street: e.target.value})}
                    className="h-9 text-sm max-w-[50%] text-left"
                    placeholder="Introduce la dirección"
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Ciudad:</span>
                  <Input
                    id="city"
                    value={editData.city ?? ''}
                    onChange={(e) => setEditData({...editData, city: e.target.value})}
                    className="h-9 text-sm max-w-[50%] text-left"
                    placeholder="Introduce la ciudad"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Código postal:</span>
                  <Input
                    id="postalCode"
                    value={editData.postalCode ?? ''}
                    onChange={(e) => setEditData({...editData, postalCode: e.target.value})}
                    className="h-9 text-sm max-w-[50%] text-left"
                    placeholder="Introduce el código postal"
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">País:</span>
                  <Input
                    id="country"
                    value={editData.country ?? ''}
                    onChange={(e) => setEditData({...editData, country: e.target.value})}
                    className="h-9 text-sm max-w-[50%] text-left"
                    placeholder="Introduce el país"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={() => onSave('contactInfo')} size="sm" className="h-7 text-xs">
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
            <div className="grid grid-cols-2 gap-3" style={{minHeight: '144px'}}>
              <div className="flex items-center justify-between text-sm h-9">
                <span className="text-muted-foreground">Email:</span>
                <span className="text-foreground font-medium">{patient.contactInfo?.email || 'ana.gonzalez@email.com'}</span>
              </div>
              <div className="flex items-center justify-between text-sm h-9">
                <span className="text-muted-foreground">Teléfono:</span>
                <span className="text-foreground font-medium">{patient.contactInfo?.phone || '+34 666 123 456'}</span>
              </div>
              <div className="flex items-center justify-between text-sm h-9">
                <span className="text-muted-foreground">Dirección:</span>
                <span className="text-foreground font-medium">{patient.contactInfo?.address?.street || 'Calle Mayor 123'}</span>
              </div>
              <div className="flex items-center justify-between text-sm h-9">
                <span className="text-muted-foreground">Ciudad:</span>
                <span className="text-foreground font-medium">{patient.contactInfo?.address?.city || 'Madrid'}</span>
              </div>
              <div className="flex items-center justify-between text-sm h-9">
                <span className="text-muted-foreground">Código postal:</span>
                <span className="text-foreground font-medium">{patient.contactInfo?.address?.postalCode || '28001'}</span>
              </div>
              <div className="flex items-center justify-between text-sm h-9">
                <span className="text-muted-foreground">País:</span>
                <span className="text-foreground font-medium">{patient.contactInfo?.address?.country || 'España'}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contacto de Emergencia */}
      <div className="pb-4 border-b border-border/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-primary" />
            Contacto de Emergencia
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit('emergencyContact', {
              name: patient.emergencyContact?.name || '',
              relationship: patient.emergencyContact?.relationship || '',
              phone: patient.emergencyContact?.phone || '',
              email: patient.emergencyContact?.email || ''
            })}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-3 w-3" />
          </Button>
        </div>
        <div className="px-1">
          {editingSection === 'emergencyContact' ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Nombre:</span>
                  <Input
                    id="emergencyName"
                    value={editData.name ?? ''}
                    onChange={(e) => setEditData({...editData, name: e.target.value})}
                    placeholder="Introduce el nombre del contacto"
                    className="h-9 text-sm max-w-[50%] text-left"
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Relación:</span>
                  <Input
                    id="emergencyRelationship"
                    value={editData.relationship ?? ''}
                    onChange={(e) => setEditData({...editData, relationship: e.target.value})}
                    placeholder="Introduce la relación"
                    className="h-9 text-sm max-w-[50%] text-left"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Teléfono:</span>
                  <Input
                    id="emergencyPhone"
                    value={editData.phone ?? ''}
                    onChange={(e) => setEditData({...editData, phone: e.target.value})}
                    placeholder="Introduce el teléfono de emergencia"
                    className="h-9 text-sm max-w-[50%] text-left"
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Email:</span>
                  <Input
                    id="emergencyEmail"
                    type="email"
                    value={editData.email ?? ''}
                    onChange={(e) => setEditData({...editData, email: e.target.value})}
                    placeholder="Introduce el email de emergencia"
                    className="h-9 text-sm max-w-[50%] text-left"
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
            <div className="grid grid-cols-2 gap-3" style={{minHeight: '72px'}}>
              <div className="flex items-center justify-between text-sm h-9">
                <span className="text-muted-foreground">Nombre:</span>
                <span className="text-foreground font-medium">{patient.emergencyContact?.name || 'Carmen López Martín'}</span>
              </div>
              <div className="flex items-center justify-between text-sm h-9">
                <span className="text-muted-foreground">Relación:</span>
                <span className="text-foreground font-medium">{patient.emergencyContact?.relationship || 'Hermana'}</span>
              </div>
              <div className="flex items-center justify-between text-sm h-9">
                <span className="text-muted-foreground">Teléfono:</span>
                <span className="text-foreground font-medium">{patient.emergencyContact?.phone || '+34 666 789 012'}</span>
              </div>
              <div className="flex items-center justify-between text-sm h-9">
                <span className="text-muted-foreground">Email:</span>
                <span className="text-foreground font-medium">{patient.emergencyContact?.email || 'carmen.lopez@email.com'}</span>
              </div>
            </div>
          )}
        </div>
      </div>
     </div>
  );
}

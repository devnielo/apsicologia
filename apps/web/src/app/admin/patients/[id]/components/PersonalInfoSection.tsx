'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label';
import { Edit, Save, X, User, Phone, Mail, MapPin } from 'lucide-react';

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
            onClick={() => onEdit('personalInfo', patient.personalInfo || {})}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-3 w-3" />
          </Button>
        </div>
        <div className="px-1">
          {editingSection === 'personalInfo' ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="firstName" className="text-xs font-medium text-foreground">Nombre</Label>
                  <Input
                    id="firstName"
                    value={editData.firstName || ''}
                    onChange={(e) => setEditData({...editData, firstName: e.target.value})}
                    className="mt-1 h-8 text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-xs font-medium text-foreground">Apellidos</Label>
                  <Input
                    id="lastName"
                    value={editData.lastName || ''}
                    onChange={(e) => setEditData({...editData, lastName: e.target.value})}
                    className="mt-1 h-8 text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="dateOfBirth" className="text-xs font-medium text-foreground">Fecha de nacimiento</Label>
                  <DatePicker
                    date={editData.dateOfBirth ? new Date(editData.dateOfBirth) : undefined}
                    onDateChange={(date) => setEditData({...editData, dateOfBirth: date})}
                    placeholder="Seleccionar fecha"
                    className="mt-1 h-8 text-xs w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="gender" className="text-xs font-medium text-foreground">Género</Label>
                  <Select value={editData.gender || ''} onValueChange={(value) => setEditData({...editData, gender: value})}>
                    <SelectTrigger className="mt-1 h-8 text-xs">
                      <SelectValue placeholder="Seleccionar género" />
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
                <div>
                  <Label htmlFor="maritalStatus" className="text-xs font-medium text-foreground">Estado civil</Label>
                  <Select value={editData.maritalStatus || ''} onValueChange={(value) => setEditData({...editData, maritalStatus: value})}>
                    <SelectTrigger className="mt-1 h-8 text-xs">
                      <SelectValue placeholder="Seleccionar estado" />
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
                <div>
                  <Label htmlFor="occupation" className="text-xs font-medium text-foreground">Ocupación</Label>
                  <Input
                    id="occupation"
                    value={editData.occupation || ''}
                    onChange={(e) => setEditData({...editData, occupation: e.target.value})}
                    className="mt-1 h-8 text-xs"
                    placeholder="Profesión u ocupación"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="idType" className="text-xs font-medium text-foreground">Tipo de documento</Label>
                  <Select value={editData.idType || ''} onValueChange={(value) => setEditData({...editData, idType: value})}>
                    <SelectTrigger className="mt-1 h-8 text-xs">
                      <SelectValue placeholder="Tipo de ID" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dni">DNI</SelectItem>
                      <SelectItem value="nie">NIE</SelectItem>
                      <SelectItem value="passport">Pasaporte</SelectItem>
                      <SelectItem value="other">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="idNumber" className="text-xs font-medium text-foreground">Número de documento</Label>
                  <Input
                    id="idNumber"
                    value={editData.idNumber || ''}
                    onChange={(e) => setEditData({...editData, idNumber: e.target.value})}
                    className="mt-1 h-8 text-xs"
                    placeholder="Número del documento"
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
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Nombre:</span>
                <span className="text-foreground font-medium">{fullName || 'Ana María González López'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Nacimiento:</span>
                <span className="text-foreground font-medium">{formatDate(patient.personalInfo?.dateOfBirth) || '15/03/1985'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Género:</span>
                <span className="text-foreground font-medium">{formatGender(patient.personalInfo?.gender) || 'Femenino'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Estado civil:</span>
                <span className="text-foreground font-medium">{formatMaritalStatus(patient.personalInfo?.maritalStatus) || 'Casado/a'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Ocupación:</span>
                <span className="text-foreground font-medium">{patient.personalInfo?.occupation || 'Profesora'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
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
            onClick={() => onEdit('contactInfo', patient.contactInfo || {})}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-3 w-3" />
          </Button>
        </div>
        <div className="px-1">
          {editingSection === 'contactInfo' ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="email" className="text-xs font-medium text-foreground">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={editData.email || ''}
                    onChange={(e) => setEditData({...editData, email: e.target.value})}
                    className="mt-1 h-8 text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-xs font-medium text-foreground">Teléfono</Label>
                  <Input
                    id="phone"
                    value={editData.phone || ''}
                    onChange={(e) => setEditData({...editData, phone: e.target.value})}
                    className="mt-1 h-8 text-xs"
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
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{patient.contactInfo?.phone || '+34 666 123 456'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground truncate">{patient.contactInfo?.email || 'ana.gonzalez@email.com'}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground truncate">
                  {patient.contactInfo?.address ? 
                    `${patient.contactInfo.address.street || 'Calle Mayor 123'}, ${patient.contactInfo.address.city || 'Madrid'}` :
                    'Calle Mayor 123, Madrid'
                  }
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
     </div>
  );
}

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Save, X, User, Phone, AlertTriangle } from 'lucide-react';

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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Información Personal */}
      <Card className="medical-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2 text-foreground text-base">
            <AlertTriangle className="h-4 w-4 text-primary" />
            Contacto de Emergencia
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit('personalInfo', patient.personalInfo)}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3 p-4">
          {editingSection === 'personalInfo' ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="firstName" className="text-xs font-medium text-foreground">Nombre</Label>
                  <Input
                    id="firstName"
                    value={editData.firstName || ''}
                    onChange={(e) => setEditData({...editData, firstName: e.target.value})}
                    className="mt-1 medical-input h-8 text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-xs font-medium text-foreground">Apellidos</Label>
                  <Input
                    id="lastName"
                    value={editData.lastName || ''}
                    onChange={(e) => setEditData({...editData, lastName: e.target.value})}
                    className="mt-1 medical-input h-8 text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="dateOfBirth" className="text-xs font-medium text-foreground">Fecha nacimiento</Label>
                  <DatePicker
                    date={editData.dateOfBirth ? new Date(editData.dateOfBirth) : undefined}
                    onDateChange={(date) => setEditData({...editData, dateOfBirth: date})}
                    placeholder="Seleccionar"
                    className="mt-1 h-8 text-xs w-full"
                  />
                </div>
                <div>
                  <Label htmlFor="gender" className="text-xs font-medium text-foreground">Género</Label>
                  <Select value={editData.gender || ''} onValueChange={(value) => setEditData({...editData, gender: value})}>
                    <SelectTrigger className="mt-1 medical-input h-8 text-xs">
                      <SelectValue placeholder="Seleccionar" />
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
              <div>
                <Label htmlFor="nationality" className="text-xs font-medium text-foreground">Nacionalidad</Label>
                <Input
                  id="nationality"
                  value={editData.nationality || ''}
                  onChange={(e) => setEditData({...editData, nationality: e.target.value})}
                  placeholder="Ej: Española"
                  className="mt-1 medical-input h-8 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="idType" className="text-xs font-medium text-foreground">Tipo Documento</Label>
                  <Select value={editData.idType || ''} onValueChange={(value) => setEditData({...editData, idType: value})}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Tipo" />
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
                  <Label htmlFor="idNumber" className="text-xs font-medium text-foreground">Número Documento</Label>
                  <Input
                    id="idNumber"
                    value={editData.idNumber || ''}
                    onChange={(e) => setEditData({...editData, idNumber: e.target.value})}
                    placeholder="Ej: 12345678A"
                    className="mt-1 medical-input h-8 text-xs"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="maritalStatus" className="text-xs font-medium text-foreground">Estado civil</Label>
                <Select value={editData.maritalStatus || ''} onValueChange={(value) => setEditData({...editData, maritalStatus: value})}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Soltero/a</SelectItem>
                    <SelectItem value="married">Casado/a</SelectItem>
                    <SelectItem value="divorced">Divorciado/a</SelectItem>
                    <SelectItem value="widowed">Viudo/a</SelectItem>
                    <SelectItem value="separated">Separado/a</SelectItem>
                    <SelectItem value="domestic-partner">Pareja de hecho</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="occupation" className="text-xs font-medium text-foreground">Ocupación</Label>
                  <Input
                    id="occupation"
                    value={editData.occupation || ''}
                    onChange={(e) => setEditData({...editData, occupation: e.target.value})}
                    placeholder="Ej: Ingeniero"
                    className="mt-1 medical-input h-8 text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="employer" className="text-xs font-medium text-foreground">Empleador</Label>
                  <Input
                    id="employer"
                    value={editData.employer || ''}
                    onChange={(e) => setEditData({...editData, employer: e.target.value})}
                    placeholder="Empresa"
                    className="mt-1 medical-input h-8 text-xs"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-3">
                <Button onClick={() => onSave('personalInfo')} size="sm" className="medical-button-primary h-7 text-xs">
                  <Save className="h-3 w-3 mr-1" />
                  Guardar
                </Button>
                <Button onClick={onCancel} variant="outline" size="sm" className="medical-button-secondary h-7 text-xs">
                  <X className="h-3 w-3 mr-1" />
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Nombre</label>
                  <p className="text-foreground text-sm">{fullName || 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Nacimiento</label>
                  <p className="text-foreground text-sm">{formatDate(patient.personalInfo?.dateOfBirth)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Género</label>
                  <p className="text-foreground text-sm">{formatGender(patient.personalInfo?.gender)}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Estado civil</label>
                  <p className="text-foreground text-sm">{formatMaritalStatus(patient.personalInfo?.maritalStatus)}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Ocupación</label>
                  <p className="text-foreground text-sm">{patient.personalInfo?.occupation || 'No especificada'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Nacionalidad</label>
                  <p className="text-foreground text-sm">{patient.personalInfo?.nationality || 'No especificada'}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Información de Contacto */}
      <Card className="medical-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2 text-foreground text-base">
            <Phone className="h-4 w-4 text-primary" />
            Información de Contacto
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit('contactInfo', patient.contactInfo)}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3 p-4">
          {editingSection === 'contactInfo' ? (
            <div className="space-y-3">
              <div>
                <Label htmlFor="email" className="text-xs font-medium text-foreground">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editData.email || ''}
                  onChange={(e) => setEditData({...editData, email: e.target.value})}
                  placeholder="ejemplo@email.com"
                  className="mt-1 medical-input h-8 text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="phone" className="text-xs font-medium text-foreground">Teléfono</Label>
                  <Input
                    id="phone"
                    value={editData.phone || ''}
                    onChange={(e) => setEditData({...editData, phone: e.target.value})}
                    placeholder="+34 600 000 000"
                    className="mt-1 medical-input h-8 text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="alternativePhone" className="text-xs font-medium text-foreground">Tel. Alternativo</Label>
                  <Input
                    id="alternativePhone"
                    value={editData.alternativePhone || ''}
                    onChange={(e) => setEditData({...editData, alternativePhone: e.target.value})}
                    placeholder="+34 600 000 000"
                    className="mt-1 medical-input h-8 text-xs"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="preferredContactMethod" className="text-xs font-medium text-foreground">Método Preferido</Label>
                <Select value={editData.preferredContactMethod || ''} onValueChange={(value) => setEditData({...editData, preferredContactMethod: value})}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Teléfono</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-foreground">Dirección</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Input
                      id="street"
                      value={editData.address?.street || ''}
                      onChange={(e) => setEditData({...editData, address: {...editData.address, street: e.target.value}})}
                      placeholder="Calle"
                      className="medical-input h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Input
                      id="city"
                      value={editData.address?.city || ''}
                      onChange={(e) => setEditData({...editData, address: {...editData.address, city: e.target.value}})}
                      placeholder="Ciudad"
                      className="medical-input h-8 text-xs"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Input
                      id="postalCode"
                      value={editData.address?.postalCode || ''}
                      onChange={(e) => setEditData({...editData, address: {...editData.address, postalCode: e.target.value}})}
                      placeholder="CP"
                      className="medical-input h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Input
                      id="state"
                      value={editData.address?.state || ''}
                      onChange={(e) => setEditData({...editData, address: {...editData.address, state: e.target.value}})}
                      placeholder="Provincia"
                      className="medical-input h-8 text-xs"
                    />
                  </div>
                  <div>
                    <Input
                      id="country"
                      value={editData.address?.country || ''}
                      onChange={(e) => setEditData({...editData, address: {...editData.address, country: e.target.value}})}
                      placeholder="País"
                      className="medical-input h-8 text-xs"
                    />
                  </div>
                </div>
              </div>
              <div className="flex gap-2 pt-3">
                <Button onClick={() => onSave('contactInfo')} size="sm" className="medical-button-primary h-7 text-xs">
                  <Save className="h-3 w-3 mr-1" />
                  Guardar
                </Button>
                <Button onClick={onCancel} variant="outline" size="sm" className="medical-button-secondary h-7 text-xs">
                  <X className="h-3 w-3 mr-1" />
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Email</label>
                  <p className="text-foreground text-sm truncate">{patient.contactInfo?.email || 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Teléfono</label>
                  <p className="text-foreground text-sm">{patient.contactInfo?.phone || 'No especificado'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Tel. Alternativo</label>
                  <p className="text-foreground text-sm">{patient.contactInfo?.alternativePhone || 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Método Preferido</label>
                  <p className="text-foreground text-sm">
                    {patient.contactInfo?.preferredContactMethod === 'email' ? 'Email' :
                     patient.contactInfo?.preferredContactMethod === 'phone' ? 'Teléfono' :
                     patient.contactInfo?.preferredContactMethod === 'sms' ? 'SMS' :
                     patient.contactInfo?.preferredContactMethod === 'whatsapp' ? 'WhatsApp' :
                     'No especificado'}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Dirección</label>
                {patient.contactInfo?.address ? (
                  <div className="text-foreground text-sm leading-tight">
                    <p>{patient.contactInfo.address.street}</p>
                    <p>{patient.contactInfo.address.city}, {patient.contactInfo.address.state}</p>
                    <p>{patient.contactInfo.address.postalCode}, {patient.contactInfo.address.country}</p>
                  </div>
                ) : (
                  <p className="text-foreground text-sm">No especificado</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

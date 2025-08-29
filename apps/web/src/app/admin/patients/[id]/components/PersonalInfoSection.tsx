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
  formatDate: (date: string | Date) => string;
  formatGender: (gender: string) => string;
  formatMaritalStatus: (status: string) => string;
}

export function PersonalInfoSection({
  patient,
  editingSection,
  editData,
  onEdit,
  onSave,
  onCancel,
  setEditData,
  formatDate,
  formatGender,
  formatMaritalStatus
}: PersonalInfoSectionProps) {
  const fullName = `${patient.personalInfo?.firstName || ''} ${patient.personalInfo?.lastName || ''}`.trim();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Información Personal */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Información Personal
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit('personalInfo', patient.personalInfo)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {editingSection === 'personalInfo' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Nombre</Label>
                  <Input
                    id="firstName"
                    value={editData.firstName || ''}
                    onChange={(e) => setEditData({...editData, firstName: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Apellidos</Label>
                  <Input
                    id="lastName"
                    value={editData.lastName || ''}
                    onChange={(e) => setEditData({...editData, lastName: e.target.value})}
                  />
                </div>
              </div>
              <div>
                  <Label htmlFor="dateOfBirth">Fecha de Nacimiento</Label>
                  <DatePicker
                    date={editData.dateOfBirth ? new Date(editData.dateOfBirth) : undefined}
                    onDateChange={(date: Date | undefined) => setEditData({...editData, dateOfBirth: date})}
                  />
                </div>
              <div>
                <Label htmlFor="gender">Género</Label>
                <Select value={editData.gender || ''} onValueChange={(value) => setEditData({...editData, gender: value})}>
                  <SelectTrigger>
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
              <div>
                <Label htmlFor="nationality">Nacionalidad</Label>
                <Input
                  id="nationality"
                  value={editData.nationality || ''}
                  onChange={(e) => setEditData({...editData, nationality: e.target.value})}
                  placeholder="Ej: Española"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="idType">Tipo de Documento</Label>
                  <Select value={editData.idType || ''} onValueChange={(value) => setEditData({...editData, idType: value})}>
                    <SelectTrigger>
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
                  <Label htmlFor="idNumber">Número de Documento</Label>
                  <Input
                    id="idNumber"
                    value={editData.idNumber || ''}
                    onChange={(e) => setEditData({...editData, idNumber: e.target.value})}
                    placeholder="Ej: 12345678A"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="maritalStatus">Estado Civil</Label>
                <Select value={editData.maritalStatus || ''} onValueChange={(value) => setEditData({...editData, maritalStatus: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Estado civil" />
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="occupation">Ocupación</Label>
                  <Input
                    id="occupation"
                    value={editData.occupation || ''}
                    onChange={(e) => setEditData({...editData, occupation: e.target.value})}
                    placeholder="Ej: Ingeniero"
                  />
                </div>
                <div>
                  <Label htmlFor="employer">Empleador</Label>
                  <Input
                    id="employer"
                    value={editData.employer || ''}
                    onChange={(e) => setEditData({...editData, employer: e.target.value})}
                    placeholder="Nombre de la empresa"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={() => onSave('personalInfo')} size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </Button>
                <Button onClick={onCancel} variant="outline" size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Nombre Completo</label>
                <p className="text-gray-900">{fullName || 'No especificado'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Fecha de Nacimiento</label>
                <p className="text-gray-900">{formatDate(patient.personalInfo?.dateOfBirth) || 'No especificado'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Género</label>
                <p className="text-gray-900">{formatGender(patient.personalInfo?.gender || 'No especificado')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Nacionalidad</label>
                <p className="text-gray-900">{patient.personalInfo?.nationality || 'No especificado'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Documento de Identidad</label>
                <p className="text-gray-900">
                  {patient.personalInfo?.idType && patient.personalInfo?.idNumber 
                    ? `${patient.personalInfo.idType.toUpperCase()}: ${patient.personalInfo.idNumber}`
                    : 'No especificado'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Estado Civil</label>
                <p className="text-gray-900">{formatMaritalStatus(patient.personalInfo?.maritalStatus || 'No especificado')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Ocupación</label>
                <p className="text-gray-900">{patient.personalInfo?.occupation || 'No especificado'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Empleador</label>
                <p className="text-gray-900">{patient.personalInfo?.employer || 'No especificado'}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Información de Contacto */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Información de Contacto
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit('contactInfo', patient.contactInfo)}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {editingSection === 'contactInfo' ? (
            <div className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={editData.email || ''}
                  onChange={(e) => setEditData({...editData, email: e.target.value})}
                  placeholder="ejemplo@email.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Teléfono Principal</Label>
                <Input
                  id="phone"
                  value={editData.phone || ''}
                  onChange={(e) => setEditData({...editData, phone: e.target.value})}
                  placeholder="+34 600 000 000"
                />
              </div>
              <div>
                <Label htmlFor="alternativePhone">Teléfono Alternativo</Label>
                <Input
                  id="alternativePhone"
                  value={editData.alternativePhone || ''}
                  onChange={(e) => setEditData({...editData, alternativePhone: e.target.value})}
                  placeholder="+34 600 000 000"
                />
              </div>
              <div>
                <Label htmlFor="preferredContactMethod">Método de Contacto Preferido</Label>
                <Select value={editData.preferredContactMethod || ''} onValueChange={(value) => setEditData({...editData, preferredContactMethod: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar método" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="phone">Teléfono</SelectItem>
                    <SelectItem value="sms">SMS</SelectItem>
                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label>Dirección</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="street">Calle</Label>
                    <Input
                      id="street"
                      value={editData.address?.street || ''}
                      onChange={(e) => setEditData({...editData, address: {...editData.address, street: e.target.value}})}
                      placeholder="Calle Principal"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">Ciudad</Label>
                    <Input
                      id="city"
                      value={editData.address?.city || ''}
                      onChange={(e) => setEditData({...editData, address: {...editData.address, city: e.target.value}})}
                      placeholder="Madrid"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="postalCode">Código Postal</Label>
                    <Input
                      id="postalCode"
                      value={editData.address?.postalCode || ''}
                      onChange={(e) => setEditData({...editData, address: {...editData.address, postalCode: e.target.value}})}
                      placeholder="28001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">Provincia/Estado</Label>
                    <Input
                      id="state"
                      value={editData.address?.state || ''}
                      onChange={(e) => setEditData({...editData, address: {...editData.address, state: e.target.value}})}
                      placeholder="Madrid"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="country">País</Label>
                  <Input
                    id="country"
                    value={editData.address?.country || ''}
                    onChange={(e) => setEditData({...editData, address: {...editData.address, country: e.target.value}})}
                    placeholder="España"
                  />
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={() => onSave('contactInfo')} size="sm">
                  <Save className="h-4 w-4 mr-2" />
                  Guardar
                </Button>
                <Button onClick={onCancel} variant="outline" size="sm">
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-gray-900">{patient.contactInfo?.email || 'No especificado'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Teléfono Principal</label>
                <p className="text-gray-900">{patient.contactInfo?.phone || 'No especificado'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Teléfono Alternativo</label>
                <p className="text-gray-900">{patient.contactInfo?.alternativePhone || 'No especificado'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Método de Contacto Preferido</label>
                <p className="text-gray-900">
                  {patient.contactInfo?.preferredContactMethod === 'email' ? 'Email' :
                   patient.contactInfo?.preferredContactMethod === 'phone' ? 'Teléfono' :
                   patient.contactInfo?.preferredContactMethod === 'sms' ? 'SMS' :
                   patient.contactInfo?.preferredContactMethod === 'whatsapp' ? 'WhatsApp' :
                   'No especificado'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Dirección</label>
                {patient.contactInfo?.address ? (
                  <div className="text-gray-900">
                    <p>{patient.contactInfo.address.street}</p>
                    <p>{patient.contactInfo.address.city}, {patient.contactInfo.address.state}</p>
                    <p>{patient.contactInfo.address.postalCode}, {patient.contactInfo.address.country}</p>
                  </div>
                ) : (
                  <p className="text-gray-900">No especificado</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

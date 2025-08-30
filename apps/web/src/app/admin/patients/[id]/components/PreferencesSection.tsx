'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Edit, Save, X, Settings, Bell, Calendar, Globe, Shield } from 'lucide-react';

interface PreferencesSectionProps {
  patient: any;
  editingSection: string | null;
  editData: any;
  onEdit: (section: string, data: any) => void;
  onSave: (section: string) => void;
  onCancel: () => void;
  setEditData: (data: any) => void;
}

export function PreferencesSection({
  patient,
  editingSection,
  editData,
  onEdit,
  onSave,
  onCancel,
  setEditData
}: PreferencesSectionProps) {
  
  return (
    <div className="space-y-4">
      {/* Comunicación */}
      <Card className="medical-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2 text-foreground text-base">
            <Bell className="h-4 w-4 text-primary" />
            Comunicación
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit('communication', patient.preferences?.communication || {})}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          {editingSection === 'communication' ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium text-foreground">Método contacto</Label>
                  <Select 
                    value={editData.preferredContactMethod || 'email'} 
                    onValueChange={(value) => setEditData({...editData, preferredContactMethod: value})}
                  >
                    <SelectTrigger className="h-8 mt-1 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="phone">Teléfono</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-medium text-foreground">Idioma</Label>
                  <Select 
                    value={editData.language || 'es'} 
                    onValueChange={(value) => setEditData({...editData, language: value})}
                  >
                    <SelectTrigger className="h-8 mt-1 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ca">Català</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="emailReminders"
                    checked={editData.emailReminders !== false}
                    onChange={(e) => setEditData({...editData, emailReminders: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="emailReminders" className="text-xs text-foreground">Recordatorios por email</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="smsReminders"
                    checked={editData.smsReminders !== false}
                    onChange={(e) => setEditData({...editData, smsReminders: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="smsReminders" className="text-xs text-foreground">Recordatorios por SMS</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="marketingEmails"
                    checked={editData.marketingEmails === true}
                    onChange={(e) => setEditData({...editData, marketingEmails: e.target.checked})}
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="marketingEmails" className="text-xs text-foreground">Emails promocionales</Label>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={() => onSave('communication')} size="sm" className="medical-button-primary h-7 text-xs">
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
                  <label className="text-xs font-medium text-muted-foreground">Método contacto</label>
                  <p className="text-foreground text-sm">{patient.preferences?.communication?.preferredContactMethod || 'Email'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Idioma</label>
                  <p className="text-foreground text-sm">{patient.preferences?.communication?.language || 'Español'}</p>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Email recordatorios</span>
                  <Badge variant={patient.preferences?.communication?.emailReminders !== false ? 'default' : 'secondary'} className="text-xs">
                    {patient.preferences?.communication?.emailReminders !== false ? 'Sí' : 'No'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">SMS recordatorios</span>
                  <Badge variant={patient.preferences?.communication?.smsReminders !== false ? 'default' : 'secondary'} className="text-xs">
                    {patient.preferences?.communication?.smsReminders !== false ? 'Sí' : 'No'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Emails promocionales</span>
                  <Badge variant={patient.preferences?.communication?.marketingEmails === true ? 'default' : 'secondary'} className="text-xs">
                    {patient.preferences?.communication?.marketingEmails === true ? 'Sí' : 'No'}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Citas */}
      <Card className="medical-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2 text-foreground text-base">
            <Calendar className="h-4 w-4 text-primary" />
            Citas
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit('appointments', patient.preferences?.appointments || {})}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent>
          {editingSection === 'appointments' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium text-foreground">Duración citas</Label>
                  <Select 
                    value={editData.defaultDuration?.toString() || '60'} 
                    onValueChange={(value) => setEditData({...editData, defaultDuration: parseInt(value)})}
                  >
                    <SelectTrigger className="h-8 mt-1 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 min</SelectItem>
                      <SelectItem value="45">45 min</SelectItem>
                      <SelectItem value="60">60 min</SelectItem>
                      <SelectItem value="90">90 min</SelectItem>
                      <SelectItem value="120">120 min</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-medium text-foreground">Aviso mínimo (h)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="168"
                    value={editData.minimumNoticeHours || 24}
                    onChange={(e) => setEditData({...editData, minimumNoticeHours: parseInt(e.target.value)})}
                    className="h-8 mt-1 text-xs"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-medium text-foreground">Horarios preferidos</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <Input
                    type="time"
                    value={editData.preferredTimeSlots?.start || '09:00'}
                    onChange={(e) => setEditData({...editData, preferredTimeSlots: {...editData.preferredTimeSlots, start: e.target.value}})}
                    className="h-7 text-xs"
                  />
                  <Input
                    type="time"
                    value={editData.preferredTimeSlots?.end || '17:00'}
                    onChange={(e) => setEditData({...editData, preferredTimeSlots: {...editData.preferredTimeSlots, end: e.target.value}})}
                    className="h-7 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="allows-online"
                    checked={editData.allowsOnlineSessions || false}
                    onCheckedChange={(checked) => setEditData({...editData, allowsOnlineSessions: checked})}
                  />
                  <Label htmlFor="allows-online" className="text-xs text-foreground">Sesiones online</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-confirm"
                    checked={editData.autoConfirmAppointments || false}
                    onCheckedChange={(checked) => setEditData({...editData, autoConfirmAppointments: checked})}
                  />
                  <Label htmlFor="auto-confirm" className="text-xs text-foreground">Auto-confirmación</Label>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={() => onSave('appointments')} size="sm" className="medical-button-primary h-7 text-xs">
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
                  <label className="text-xs font-medium text-muted-foreground">Duración</label>
                  <p className="text-foreground text-sm">{patient.preferences?.appointments?.defaultDuration || 60} min</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Aviso mínimo</label>
                  <p className="text-foreground text-sm">{patient.preferences?.appointments?.minimumNoticeHours || 24}h</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Horario preferido</label>
                <p className="text-foreground text-sm">
                  {patient.preferences?.appointments?.preferredTimeSlots?.start || '09:00'} - 
                  {patient.preferences?.appointments?.preferredTimeSlots?.end || '17:00'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Online</span>
                  <Badge variant={patient.preferences?.appointments?.allowsOnlineSessions ? 'default' : 'secondary'} className="text-xs">
                    {patient.preferences?.appointments?.allowsOnlineSessions ? 'Sí' : 'No'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Auto-confirm</span>
                  <Badge variant={patient.preferences?.appointments?.autoConfirmAppointments ? 'default' : 'secondary'} className="text-xs">
                    {patient.preferences?.appointments?.autoConfirmAppointments ? 'Sí' : 'No'}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Portal del Paciente */}
      <Card className="medical-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2 text-foreground text-base">
            <Globe className="h-4 w-4 text-primary" />
            Portal del Paciente
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit('portal', patient.preferences?.portal || {})}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent>
          {editingSection === 'portal' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="portal-access"
                    checked={editData.allowPortalAccess || false}
                    onCheckedChange={(checked) => setEditData({...editData, allowPortalAccess: checked})}
                  />
                  <Label htmlFor="portal-access">Acceso al portal</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="view-appointments"
                    checked={editData.canViewAppointments || false}
                    onCheckedChange={(checked) => setEditData({...editData, canViewAppointments: checked})}
                  />
                  <Label htmlFor="view-appointments" className="text-xs text-foreground">Ver citas</Label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="book-appointments"
                    checked={editData.canBookAppointments || false}
                    onCheckedChange={(checked) => setEditData({...editData, canBookAppointments: checked})}
                  />
                  <Label htmlFor="book-appointments" className="text-xs text-foreground">Reservar citas</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="view-documents"
                    checked={editData.canViewDocuments || false}
                    onCheckedChange={(checked) => setEditData({...editData, canViewDocuments: checked})}
                  />
                  <Label htmlFor="view-documents" className="text-xs text-foreground">Ver documentos</Label>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={() => onSave('portal')} size="sm" className="medical-button-primary h-7 text-xs">
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
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Acceso portal</span>
                  <Badge variant={patient.preferences?.portal?.allowPortalAccess ? 'default' : 'secondary'} className="text-xs">
                    {patient.preferences?.portal?.allowPortalAccess ? 'Sí' : 'No'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Ver citas</span>
                  <Badge variant={patient.preferences?.portal?.canViewAppointments ? 'default' : 'secondary'} className="text-xs">
                    {patient.preferences?.portal?.canViewAppointments ? 'Sí' : 'No'}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Reservar citas</span>
                  <Badge variant={patient.preferences?.portal?.canBookAppointments ? 'default' : 'secondary'} className="text-xs">
                    {patient.preferences?.portal?.canBookAppointments ? 'Sí' : 'No'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Ver documentos</span>
                  <Badge variant={patient.preferences?.portal?.canViewDocuments ? 'default' : 'secondary'} className="text-xs">
                    {patient.preferences?.portal?.canViewDocuments ? 'Sí' : 'No'}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* GDPR */}
      <Card className="medical-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2 text-foreground text-base">
            <Shield className="h-4 w-4 text-primary" />
            Privacidad y Consentimiento
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit('privacy', patient.gdpr || {})}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent>
          {editingSection === 'privacy' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="data-processing"
                    checked={editData.dataProcessingConsent || false}
                    onCheckedChange={(checked) => setEditData({...editData, dataProcessingConsent: checked})}
                  />
                  <Label htmlFor="data-processing" className="text-xs text-foreground">Procesamiento de datos</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="marketing-consent"
                    checked={editData.marketingConsent || false}
                    onCheckedChange={(checked) => setEditData({...editData, marketingConsent: checked})}
                  />
                  <Label htmlFor="marketing-consent" className="text-xs text-foreground">Marketing</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="data-sharing"
                    checked={editData.dataSharingConsent || false}
                    onCheckedChange={(checked) => setEditData({...editData, dataSharingConsent: checked})}
                  />
                  <Label htmlFor="data-sharing" className="text-xs text-foreground">Compartir con terceros</Label>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={() => onSave('privacy')} size="sm" className="medical-button-primary h-7 text-xs">
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
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Procesamiento datos</span>
                  <Badge variant={patient.gdpr?.dataProcessingConsent ? 'default' : 'secondary'} className="text-xs">
                    {patient.gdpr?.dataProcessingConsent ? 'Sí' : 'No'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Marketing</span>
                  <Badge variant={patient.gdpr?.marketingConsent ? 'default' : 'secondary'} className="text-xs">
                    {patient.gdpr?.marketingConsent ? 'Sí' : 'No'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Compartir terceros</span>
                  <Badge variant={patient.gdpr?.dataSharingConsent ? 'default' : 'secondary'} className="text-xs">
                    {patient.gdpr?.dataSharingConsent ? 'Sí' : 'No'}
                  </Badge>
                </div>
              </div>
            </div>
          )}
          <div className="text-sm text-muted-foreground">
            Última actualización: {patient.gdprConsent?.lastUpdated ? new Date(patient.gdprConsent.lastUpdated).toLocaleDateString() : 'No disponible'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

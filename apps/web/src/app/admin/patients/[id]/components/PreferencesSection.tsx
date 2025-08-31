'use client';

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
      <div className="pb-4 border-b border-border/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            Comunicación
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit('communication', patient.preferences?.communication || {})}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-3 w-3" />
          </Button>
        </div>
        <div className="px-1">
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
                <Button onClick={() => onSave('communication')} size="sm" className="h-7 text-xs">
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
                <span className="text-muted-foreground">Método contacto:</span>
                <span className="text-foreground font-medium">{patient.preferences?.communication?.preferredContactMethod || 'Email'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Idioma:</span>
                <span className="text-foreground font-medium">{patient.preferences?.communication?.language === 'es' ? 'Español' : patient.preferences?.communication?.language === 'en' ? 'English' : patient.preferences?.communication?.language === 'ca' ? 'Català' : 'Español'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Email recordatorios:</span>
                <Badge variant={patient.preferences?.communication?.emailReminders !== false ? 'default' : 'secondary'} className="text-xs">
                  {patient.preferences?.communication?.emailReminders !== false ? 'Activado' : 'Desactivado'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">SMS recordatorios:</span>
                <Badge variant={patient.preferences?.communication?.smsReminders !== false ? 'default' : 'secondary'} className="text-xs">
                  {patient.preferences?.communication?.smsReminders !== false ? 'Activado' : 'Desactivado'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Emails promocionales:</span>
                <Badge variant={patient.preferences?.communication?.marketingEmails === true ? 'default' : 'secondary'} className="text-xs">
                  {patient.preferences?.communication?.marketingEmails === true ? 'Activado' : 'Desactivado'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Notificaciones push:</span>
                <Badge variant={patient.preferences?.communication?.pushNotifications !== false ? 'default' : 'secondary'} className="text-xs">
                  {patient.preferences?.communication?.pushNotifications !== false ? 'Activado' : 'Desactivado'}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Citas */}
      <div className="pb-4 border-b border-border/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Citas
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit('appointments', patient.preferences?.appointments || {})}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-3 w-3" />
          </Button>
        </div>
        <div className="px-1">
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
                <Button onClick={() => onSave('appointments')} size="sm" className="h-7 text-xs">
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
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Días preferidos</label>
                  <p className="text-foreground text-sm">{patient.preferences?.appointments?.preferredDays?.join(', ') || 'Lunes a Viernes'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Modalidad</label>
                  <p className="text-foreground text-sm">{patient.preferences?.appointments?.preferredModality || 'Presencial'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Sesiones online</span>
                  <Badge variant={patient.preferences?.appointments?.allowsOnlineSessions !== false ? 'default' : 'secondary'} className="text-xs">
                    {patient.preferences?.appointments?.allowsOnlineSessions !== false ? 'Permitidas' : 'No permitidas'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Auto-confirmación</span>
                  <Badge variant={patient.preferences?.appointments?.autoConfirmAppointments === true ? 'default' : 'secondary'} className="text-xs">
                    {patient.preferences?.appointments?.autoConfirmAppointments === true ? 'Activada' : 'Manual'}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Portal del Paciente */}
      <div className="pb-4 border-b border-border/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Globe className="h-4 w-4 text-primary" />
            Portal del Paciente
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit('portal', patient.preferences?.portal || {})}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-3 w-3" />
          </Button>
        </div>
        <div className="px-1">
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
                <Button onClick={() => onSave('portal')} size="sm" className="h-7 text-xs">
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
                <span className="text-muted-foreground">Estado portal:</span>
                <Badge variant={patient.preferences?.portal?.allowPortalAccess !== false ? 'default' : 'secondary'} className="text-xs">
                  {patient.preferences?.portal?.allowPortalAccess !== false ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Último acceso:</span>
                <span className="text-foreground font-medium">{patient.preferences?.portal?.lastLogin ? new Date(patient.preferences.portal.lastLogin).toLocaleDateString('es-ES') : '25/08/2024'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Ver citas:</span>
                <Badge variant={patient.preferences?.portal?.canViewAppointments !== false ? 'default' : 'secondary'} className="text-xs">
                  {patient.preferences?.portal?.canViewAppointments !== false ? 'Permitido' : 'Bloqueado'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Reservar citas:</span>
                <Badge variant={patient.preferences?.portal?.canBookAppointments !== false ? 'default' : 'secondary'} className="text-xs">
                  {patient.preferences?.portal?.canBookAppointments !== false ? 'Permitido' : 'Bloqueado'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Ver documentos:</span>
                <Badge variant={patient.preferences?.portal?.canViewDocuments !== false ? 'default' : 'secondary'} className="text-xs">
                  {patient.preferences?.portal?.canViewDocuments !== false ? 'Permitido' : 'Bloqueado'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Descargar informes:</span>
                <Badge variant={patient.preferences?.portal?.canDownloadReports !== false ? 'default' : 'secondary'} className="text-xs">
                  {patient.preferences?.portal?.canDownloadReports !== false ? 'Permitido' : 'Bloqueado'}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* GDPR */}
      <div className="pb-4 border-b border-border/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Privacidad y Consentimiento
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit('privacy', patient.gdpr || {})}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-3 w-3" />
          </Button>
        </div>
        <div className="px-1">
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
                <Button onClick={() => onSave('privacy')} size="sm" className="h-7 text-xs">
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
                <span className="text-muted-foreground">Fecha consentimiento:</span>
                <span className="text-foreground font-medium">{patient.gdpr?.consentDate ? new Date(patient.gdpr.consentDate).toLocaleDateString('es-ES') : '15/08/2024'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Versión política:</span>
                <span className="text-foreground font-medium">{patient.gdpr?.policyVersion || 'v2.1'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Procesamiento datos:</span>
                <Badge variant={patient.gdpr?.dataProcessingConsent !== false ? 'default' : 'secondary'} className="text-xs">
                  {patient.gdpr?.dataProcessingConsent !== false ? 'Consentido' : 'Denegado'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Marketing:</span>
                <Badge variant={patient.gdpr?.marketingConsent === true ? 'default' : 'secondary'} className="text-xs">
                  {patient.gdpr?.marketingConsent === true ? 'Consentido' : 'Denegado'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Compartir terceros:</span>
                <Badge variant={patient.gdpr?.dataSharingConsent === true ? 'default' : 'secondary'} className="text-xs">
                  {patient.gdpr?.dataSharingConsent === true ? 'Consentido' : 'Denegado'}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Derecho olvido:</span>
                <Badge variant={patient.gdpr?.rightToBeForgettenRequested ? 'destructive' : 'default'} className="text-xs">
                  {patient.gdpr?.rightToBeForgettenRequested ? 'Solicitado' : 'No solicitado'}
                </Badge>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

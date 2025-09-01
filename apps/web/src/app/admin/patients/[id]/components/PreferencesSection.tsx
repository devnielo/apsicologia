'use client';

import { Button } from '../../../../../components/ui/button';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../components/ui/select';
import { Badge } from '../../../../../components/ui/badge';
import { Switch } from '../../../../../components/ui/switch';
import { Checkbox } from '../../../../../components/ui/checkbox';
import { RichTextEditor } from '../../../../../components/ui/rich-text-editor';
import { Edit, Save, X, MessageSquare, Calendar, Globe, Shield, Bell } from 'lucide-react';

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
            onClick={() => onEdit('communication', patient.preferences?.communicationPreferences || {})}
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
                  <Checkbox
                    id="emailReminders"
                    checked={editData.emailReminders !== false}
                    onCheckedChange={(checked) => setEditData({...editData, emailReminders: checked})}
                  />
                  <Label htmlFor="emailReminders" className="text-xs text-foreground">Recordatorios por email</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="smsReminders"
                    checked={editData.smsReminders !== false}
                    onCheckedChange={(checked) => setEditData({...editData, smsReminders: checked})}
                  />
                  <Label htmlFor="smsReminders" className="text-xs text-foreground">Recordatorios por SMS</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="marketingEmails"
                    checked={editData.marketingEmails === true}
                    onCheckedChange={(checked) => setEditData({...editData, marketingEmails: checked})}
                  />
                  <Label htmlFor="marketingEmails" className="text-xs text-foreground">Emails de marketing</Label>
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
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={patient.preferences?.communication?.emailReminders !== false}
                    disabled
                    className="h-3 w-3"
                  />
                  <span className="text-xs text-foreground">{patient.preferences?.communication?.emailReminders !== false ? 'Activado' : 'Desactivado'}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">SMS recordatorios:</span>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={patient.preferences?.communication?.smsReminders !== false}
                    disabled
                    className="h-3 w-3"
                  />
                  <span className="text-xs text-foreground">{patient.preferences?.communication?.smsReminders !== false ? 'Activado' : 'Desactivado'}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Emails promocionales:</span>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    checked={patient.preferences?.communication?.marketingEmails === true}
                    disabled
                    className="h-3 w-3"
                  />
                  <span className="text-xs text-foreground">{patient.preferences?.communication?.marketingEmails === true ? 'Activado' : 'Desactivado'}</span>
                </div>
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
            onClick={() => onEdit('appointments', patient.preferences?.appointmentPreferences || {})}
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
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Duración citas:</span>
                <span className="text-foreground font-medium">{patient.preferences?.appointments?.defaultDuration || 60} min</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Aviso mínimo:</span>
                <span className="text-foreground font-medium">{patient.preferences?.appointments?.minimumNoticeHours || 24}h</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Horario preferido:</span>
                <span className="text-foreground font-medium">
                  {patient.preferences?.appointments?.preferredTimeSlots?.start || '09:00'} - {patient.preferences?.appointments?.preferredTimeSlots?.end || '17:00'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Sesiones online:</span>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={patient.preferences?.appointments?.allowsOnlineSessions || false}
                    disabled
                    className="h-4 w-7"
                  />
                  <span className="text-xs text-foreground">{patient.preferences?.appointments?.allowsOnlineSessions ? 'Permitido' : 'No permitido'}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Auto-confirmación:</span>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={patient.preferences?.appointments?.autoConfirmAppointments || false}
                    disabled
                    className="h-4 w-7"
                  />
                  <span className="text-xs text-foreground">{patient.preferences?.appointments?.autoConfirmAppointments ? 'Activado' : 'Desactivado'}</span>
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
            onClick={() => onEdit('portal', patient.preferences?.portalAccess || {})}
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
                <span className="text-muted-foreground">Acceso al portal:</span>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={patient.preferences?.portal?.allowPortalAccess || false}
                    disabled
                    className="h-4 w-7"
                  />
                  <span className="text-xs text-foreground">{patient.preferences?.portal?.allowPortalAccess ? 'Activo' : 'Inactivo'}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Ver citas:</span>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={patient.preferences?.portal?.canViewAppointments || false}
                    disabled
                    className="h-4 w-7"
                  />
                  <span className="text-xs text-foreground">{patient.preferences?.portal?.canViewAppointments ? 'Permitido' : 'Bloqueado'}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Reservar citas:</span>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={patient.preferences?.portal?.canBookAppointments || false}
                    disabled
                    className="h-4 w-7"
                  />
                  <span className="text-xs text-foreground">{patient.preferences?.portal?.canBookAppointments ? 'Permitido' : 'Bloqueado'}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Ver documentos:</span>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={patient.preferences?.portal?.canViewDocuments || false}
                    disabled
                    className="h-4 w-7"
                  />
                  <span className="text-xs text-foreground">{patient.preferences?.portal?.canViewDocuments ? 'Permitido' : 'Bloqueado'}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Descargar informes:</span>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={patient.preferences?.portal?.canDownloadReports || false}
                    disabled
                    className="h-4 w-7"
                  />
                  <span className="text-xs text-foreground">{patient.preferences?.portal?.canDownloadReports ? 'Permitido' : 'Bloqueado'}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Último acceso:</span>
                <span className="text-foreground font-medium">{patient.preferences?.portal?.lastLogin ? new Date(patient.preferences.portal.lastLogin).toLocaleDateString('es-ES') : '25/08/2024'}</span>
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
            onClick={() => onEdit('privacy', patient.gdprConsent || {})}
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
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={patient.gdpr?.dataProcessingConsent || false}
                    disabled
                    className="h-4 w-7"
                  />
                  <span className="text-xs text-foreground">{patient.gdpr?.dataProcessingConsent ? 'Consentido' : 'Denegado'}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Marketing:</span>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={patient.gdpr?.marketingConsent || false}
                    disabled
                    className="h-4 w-7"
                  />
                  <span className="text-xs text-foreground">{patient.gdpr?.marketingConsent ? 'Consentido' : 'Denegado'}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Compartir terceros:</span>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={patient.gdpr?.dataSharingConsent || false}
                    disabled
                    className="h-4 w-7"
                  />
                  <span className="text-xs text-foreground">{patient.gdpr?.dataSharingConsent ? 'Consentido' : 'Denegado'}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Derecho olvido:</span>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={patient.gdpr?.rightToBeForgettenRequested || false}
                    disabled
                    className="h-4 w-7"
                  />
                  <span className="text-xs text-foreground">{patient.gdpr?.rightToBeForgettenRequested ? 'Solicitado' : 'No solicitado'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
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
    <div className="space-y-6">
      {/* Comunicación */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Preferencias de Comunicación
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit('communicationPreferences', patient.preferences?.communication || {})}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {editingSection === 'communicationPreferences' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="appointment-reminders"
                    checked={editData.appointmentReminders || false}
                    onCheckedChange={(checked) => setEditData({...editData, appointmentReminders: checked})}
                  />
                  <Label htmlFor="appointment-reminders">Recordatorios de citas</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="newsletters"
                    checked={editData.newsletters || false}
                    onCheckedChange={(checked) => setEditData({...editData, newsletters: checked})}
                  />
                  <Label htmlFor="newsletters">Boletines informativos</Label>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="marketing-communications"
                  checked={editData.marketingCommunications || false}
                  onCheckedChange={(checked) => setEditData({...editData, marketingCommunications: checked})}
                />
                <Label htmlFor="marketing-communications">Comunicaciones de marketing</Label>
              </div>

              <div>
                <Label>Métodos de recordatorio</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  {['email', 'sms', 'phone', 'push'].map((method) => (
                    <div key={method} className="flex items-center space-x-2">
                      <Switch
                        id={`reminder-${method}`}
                        checked={editData.reminderMethods?.includes(method) || false}
                        onCheckedChange={(checked) => {
                          const methods = editData.reminderMethods || [];
                          if (checked) {
                            setEditData({...editData, reminderMethods: [...methods, method]});
                          } else {
                            setEditData({...editData, reminderMethods: methods.filter((m: string) => m !== method)});
                          }
                        }}
                      />
                      <Label htmlFor={`reminder-${method}`} className="capitalize">{method}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Tiempo de recordatorio (horas antes)</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {[24, 48, 72].map((hours) => (
                    <div key={hours} className="flex items-center space-x-2">
                      <Switch
                        id={`timing-${hours}`}
                        checked={editData.reminderTiming?.includes(hours) || false}
                        onCheckedChange={(checked) => {
                          const timings = editData.reminderTiming || [];
                          if (checked) {
                            setEditData({...editData, reminderTiming: [...timings, hours]});
                          } else {
                            setEditData({...editData, reminderTiming: timings.filter((t: number) => t !== hours)});
                          }
                        }}
                      />
                      <Label htmlFor={`timing-${hours}`}>{hours}h</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => onSave('communicationPreferences')} size="sm">
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Idioma preferido</label>
                  <p className="text-gray-900">{patient.preferences?.communication?.preferredLanguage || 'Español'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Horario de contacto</label>
                  <p className="text-gray-900">
                    {patient.preferences?.communication?.contactTimeFrom || '09:00'} - {patient.preferences?.communication?.contactTimeTo || '18:00'}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Notificaciones activas</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {patient.preferences?.communication?.emailNotifications && <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Email</span>}
                  {patient.preferences?.communication?.smsNotifications && <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">SMS</span>}
                  {patient.preferences?.communication?.appointmentReminders && <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">Recordatorios</span>}
                  {!patient.preferences?.communication?.emailNotifications && !patient.preferences?.communication?.smsNotifications && !patient.preferences?.communication?.appointmentReminders && (
                    <span className="text-gray-500">Ninguna configurada</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Citas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Preferencias de Citas
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit('appointmentPreferences', patient.preferences?.appointments || {})}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {editingSection === 'appointmentPreferences' ? (
            <div className="space-y-4">
              <div>
                <Label>Duración preferida de citas (minutos)</Label>
                <Select 
                  value={editData.defaultDuration?.toString() || '60'} 
                  onValueChange={(value) => setEditData({...editData, defaultDuration: parseInt(value)})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="45">45 minutos</SelectItem>
                    <SelectItem value="60">60 minutos</SelectItem>
                    <SelectItem value="90">90 minutos</SelectItem>
                    <SelectItem value="120">120 minutos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Días preferidos</Label>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map((day) => (
                    <div key={day} className="flex items-center space-x-2">
                      <Switch
                        id={`day-${day}`}
                        checked={editData.preferredDays?.includes(day) || false}
                        onCheckedChange={(checked) => {
                          const days = editData.preferredDays || [];
                          if (checked) {
                            setEditData({...editData, preferredDays: [...days, day]});
                          } else {
                            setEditData({...editData, preferredDays: days.filter((d: string) => d !== day)});
                          }
                        }}
                      />
                      <Label htmlFor={`day-${day}`} className="text-sm capitalize">{day}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Horarios preferidos</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label className="text-sm">Desde</Label>
                    <Input
                      type="time"
                      value={editData.preferredTimeSlots?.start || '09:00'}
                      onChange={(e) => setEditData({...editData, preferredTimeSlots: {...editData.preferredTimeSlots, start: e.target.value}})}
                    />
                  </div>
                  <div>
                    <Label className="text-sm">Hasta</Label>
                    <Input
                      type="time"
                      value={editData.preferredTimeSlots?.end || '17:00'}
                      onChange={(e) => setEditData({...editData, preferredTimeSlots: {...editData.preferredTimeSlots, end: e.target.value}})}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="allows-online"
                    checked={editData.allowsOnlineSessions || false}
                    onCheckedChange={(checked) => setEditData({...editData, allowsOnlineSessions: checked})}
                  />
                  <Label htmlFor="allows-online">Permite sesiones online</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-confirm"
                    checked={editData.autoConfirmAppointments || false}
                    onCheckedChange={(checked) => setEditData({...editData, autoConfirmAppointments: checked})}
                  />
                  <Label htmlFor="auto-confirm">Confirmación automática</Label>
                </div>
              </div>

              <div>
                <Label>Tiempo mínimo de aviso (horas)</Label>
                <Input
                  type="number"
                  min="1"
                  max="168"
                  value={editData.minimumNoticeHours || 24}
                  onChange={(e) => setEditData({...editData, minimumNoticeHours: parseInt(e.target.value)})}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => onSave('appointmentPreferences')} size="sm">
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Duración preferida</label>
                  <p className="text-gray-900">{patient.preferences?.appointments?.defaultDuration || 60} minutos</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Horario preferido</label>
                  <p className="text-gray-900">
                    {patient.preferences?.appointments?.preferredTimeSlots?.start || '09:00'} - {patient.preferences?.appointments?.preferredTimeSlots?.end || '17:00'}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Modalidades aceptadas</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Presencial</span>
                  {patient.preferences?.appointments?.allowsOnlineSessions && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Online</span>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Portal del Paciente */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Portal del Paciente
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit('portalPreferences', patient.preferences?.portal || {})}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {editingSection === 'portalPreferences' ? (
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
                  <Label htmlFor="view-appointments">Ver citas</Label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="book-appointments"
                    checked={editData.canBookAppointments || false}
                    onCheckedChange={(checked) => setEditData({...editData, canBookAppointments: checked})}
                  />
                  <Label htmlFor="book-appointments">Reservar citas</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="view-invoices"
                    checked={editData.canViewInvoices || false}
                    onCheckedChange={(checked) => setEditData({...editData, canViewInvoices: checked})}
                  />
                  <Label htmlFor="view-invoices">Ver facturas</Label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="download-documents"
                    checked={editData.canDownloadDocuments || false}
                    onCheckedChange={(checked) => setEditData({...editData, canDownloadDocuments: checked})}
                  />
                  <Label htmlFor="download-documents">Descargar documentos</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="message-professionals"
                    checked={editData.canMessageProfessionals || false}
                    onCheckedChange={(checked) => setEditData({...editData, canMessageProfessionals: checked})}
                  />
                  <Label htmlFor="message-professionals">Enviar mensajes</Label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => onSave('portalPreferences')} size="sm">
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
                <label className="text-sm font-medium text-gray-500">Estado del portal</label>
                <p className="text-gray-900">
                  {patient.preferences?.portal?.allowPortalAccess ? (
                    <span className="text-green-600">Activo</span>
                  ) : (
                    <span className="text-red-600">Inactivo</span>
                  )}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Permisos habilitados</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {patient.preferences?.portal?.canViewAppointments && <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Ver citas</span>}
                  {patient.preferences?.portal?.canBookAppointments && <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Reservar citas</span>}
                  {patient.preferences?.portal?.canViewInvoices && <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">Ver facturas</span>}
                  {patient.preferences?.portal?.canDownloadDocuments && <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">Descargar documentos</span>}
                  {patient.preferences?.portal?.canMessageProfessionals && <span className="px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded">Mensajes</span>}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* GDPR */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Consentimientos GDPR
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit('gdprConsent', patient.gdprConsent || {})}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {editingSection === 'gdprConsent' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="data-processing"
                    checked={editData.dataProcessingConsent || false}
                    onCheckedChange={(checked) => setEditData({...editData, dataProcessingConsent: checked})}
                  />
                  <Label htmlFor="data-processing">Consentimiento para procesamiento de datos</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="marketing-consent"
                    checked={editData.marketingConsent || false}
                    onCheckedChange={(checked) => setEditData({...editData, marketingConsent: checked})}
                  />
                  <Label htmlFor="marketing-consent">Consentimiento para marketing</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="third-party-sharing"
                    checked={editData.thirdPartySharing || false}
                    onCheckedChange={(checked) => setEditData({...editData, thirdPartySharing: checked})}
                  />
                  <Label htmlFor="third-party-sharing">Compartir con terceros</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="research-participation"
                    checked={editData.researchParticipation || false}
                    onCheckedChange={(checked) => setEditData({...editData, researchParticipation: checked})}
                  />
                  <Label htmlFor="research-participation">Participación en investigación</Label>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => onSave('gdprConsent')} size="sm">
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
                <label className="text-sm font-medium text-gray-500">Consentimientos activos</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {patient.gdprConsent?.dataProcessingConsent && <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Procesamiento de datos</span>}
                  {patient.gdprConsent?.marketingConsent && <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Marketing</span>}
                  {patient.gdprConsent?.thirdPartySharing && <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">Terceros</span>}
                  {patient.gdprConsent?.researchParticipation && <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">Investigación</span>}
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Última actualización: {patient.gdprConsent?.lastUpdated ? new Date(patient.gdprConsent.lastUpdated).toLocaleDateString() : 'No disponible'}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

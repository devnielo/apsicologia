'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Edit, Save, X, MessageCircle, Calendar, Shield, Monitor } from 'lucide-react';

interface PreferencesSectionProps {
  patient: any;
  editingSection: string | null;
  editData: any;
  onEdit: (section: string, data: any) => void;
  onSave: (section: string) => void;
  onCancel: () => void;
  setEditData: (data: any) => void;
}

export default function PreferencesSection({
  patient,
  editingSection,
  editData,
  onEdit,
  onSave,
  onCancel,
  setEditData
}: PreferencesSectionProps) {
  const formatDate = (date: string | Date) => {
    if (!date) return 'No especificado';
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatContactMethod = (method: string) => {
    const methodMap: { [key: string]: string } = {
      'email': 'Email',
      'phone': 'Teléfono',
      'sms': 'SMS'
    };
    return methodMap[method] || 'Email';
  };

  const formatSessionFormat = (format: string) => {
    const formatMap: { [key: string]: string } = {
      'in-person': 'Presencial',
      'video': 'Virtual',
      'hybrid': 'Híbrido'
    };
    return formatMap[format] || 'Presencial';
  };

  const formatPreferredTimes = (times: string) => {
    const timesMap: { [key: string]: string } = {
      'morning': 'Mañana',
      'afternoon': 'Tarde',
      'evening': 'Noche'
    };
    return timesMap[times] || 'Mañana';
  };

  const formatPreferredDays = (days: string[]) => {
    if (!days || days.length === 0) return 'No especificado';
    const dayMap: { [key: string]: string } = {
      'monday': 'Lun',
      'tuesday': 'Mar',
      'wednesday': 'Mié',
      'thursday': 'Jue',
      'friday': 'Vie',
      'saturday': 'Sáb',
      'sunday': 'Dom'
    };
    return days.map(day => dayMap[day] || day).join(', ');
  };

  return (
    <div className="space-y-4">
      {/* Comunicación */}
      <div className="pb-4 border-b border-border/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-primary" />
            Comunicación
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit('communication', {
              preferredContactMethod: patient.contactInfo?.preferredContactMethod || 'email',
              language: patient.preferences?.language || 'es',
              appointmentReminders: patient.preferences?.communicationPreferences?.appointmentReminders !== false,
              reminderMethods: patient.preferences?.communicationPreferences?.reminderMethods || ['email'],
              newsletters: patient.preferences?.communicationPreferences?.newsletters !== false,
              marketingCommunications: patient.preferences?.communicationPreferences?.marketingCommunications !== false
            })}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-3 w-3" />
          </Button>
        </div>
        <div className="px-1">
          {editingSection === 'communication' ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Método contacto:</span>
                  <Select 
                    value={editData.preferredContactMethod || 'email'} 
                    onValueChange={(value) => setEditData({...editData, preferredContactMethod: value})}
                  >
                    <SelectTrigger className="h-9 text-sm max-w-[50%]">
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
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Idioma:</span>
                  <Select 
                    value={editData.language || 'es'} 
                    onValueChange={(value) => setEditData({...editData, language: value})}
                  >
                    <SelectTrigger className="h-9 text-sm max-w-[50%]">
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
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Recordatorios citas:</span>
                  <Switch
                    checked={editData.appointmentReminders !== false}
                    onCheckedChange={(checked) => setEditData({...editData, appointmentReminders: checked})}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Marketing:</span>
                  <Switch
                    checked={editData.marketingCommunications !== false}
                    onCheckedChange={(checked) => setEditData({...editData, marketingCommunications: checked})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Newsletters:</span>
                  <Switch
                    checked={editData.newsletters !== false}
                    onCheckedChange={(checked) => setEditData({...editData, newsletters: checked})}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Métodos recordatorio:</span>
                  <span className="text-xs text-muted-foreground">Email, SMS</span>
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
            <div className="grid grid-cols-2 gap-3" style={{minHeight: '144px'}}>
              <div className="flex items-center justify-between text-sm h-9">
                <span className="text-muted-foreground">Método contacto:</span>
                <span className="text-foreground font-medium">{formatContactMethod(patient.contactInfo?.preferredContactMethod)}</span>
              </div>
              <div className="flex items-center justify-between text-sm h-9">
                <span className="text-muted-foreground">Idioma:</span>
                <span className="text-foreground font-medium">{patient.preferences?.language === 'es' ? 'Español' : patient.preferences?.language === 'en' ? 'English' : 'Español'}</span>
              </div>
              <div className="flex items-center justify-between text-sm h-9">
                <span className="text-muted-foreground">Recordatorios citas:</span>
                <span className="text-foreground font-medium">{patient.preferences?.communicationPreferences?.appointmentReminders !== false ? 'Sí' : 'No'}</span>
              </div>
              <div className="flex items-center justify-between text-sm h-9">
                <span className="text-muted-foreground">Métodos recordatorio:</span>
                <span className="text-foreground font-medium">{patient.preferences?.communicationPreferences?.reminderMethods?.join(', ') || 'Email'}</span>
              </div>
              <div className="flex items-center justify-between text-sm h-9">
                <span className="text-muted-foreground">Marketing:</span>
                <span className="text-foreground font-medium">{patient.preferences?.communicationPreferences?.marketingCommunications !== false ? 'Sí' : 'No'}</span>
              </div>
              <div className="flex items-center justify-between text-sm h-9">
                <span className="text-muted-foreground">Newsletters:</span>
                <span className="text-foreground font-medium">{patient.preferences?.communicationPreferences?.newsletters !== false ? 'Sí' : 'No'}</span>
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
            onClick={() => onEdit('appointments', {
              preferredTimes: patient.preferences?.appointmentPreferences?.preferredTimes || [],
              preferredServices: patient.preferences?.appointmentPreferences?.preferredServices || [],
              cancellationNotice: patient.preferences?.appointmentPreferences?.cancellationNotice || 24,
              waitingListOptIn: patient.preferences?.appointmentPreferences?.waitingListOptIn || false,
              notes: patient.preferences?.appointmentPreferences?.notes || ''
            })}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-3 w-3" />
          </Button>
        </div>
        <div className="px-1">
          {editingSection === 'appointments' ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Aviso cancelación:</span>
                  <Select 
                    value={editData.cancellationNotice?.toString() || '24'} 
                    onValueChange={(value) => setEditData({...editData, cancellationNotice: parseInt(value)})}
                  >
                    <SelectTrigger className="h-9 text-sm max-w-[50%]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 horas</SelectItem>
                      <SelectItem value="24">24 horas</SelectItem>
                      <SelectItem value="48">48 horas</SelectItem>
                      <SelectItem value="72">72 horas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Lista de espera:</span>
                  <Switch
                    checked={editData.waitingListOptIn || false}
                    onCheckedChange={(checked) => setEditData({...editData, waitingListOptIn: checked})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Notas:</span>
                  <Input
                    value={editData.notes || ''}
                    onChange={(e) => setEditData({...editData, notes: e.target.value})}
                    className="h-9 text-sm max-w-[70%] text-left"
                    placeholder="Notas adicionales"
                  />
                </div>
                <div></div>
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
            <div className="grid grid-cols-2 gap-3" style={{minHeight: '144px'}}>
              <div className="flex items-center justify-between text-sm h-9">
                <span className="text-muted-foreground">Horarios preferidos:</span>
                <span className="text-foreground font-medium">{patient.preferences?.appointmentPreferences?.preferredTimes?.length || 0} configurados</span>
              </div>
              <div className="flex items-center justify-between text-sm h-9">
                <span className="text-muted-foreground">Servicios preferidos:</span>
                <span className="text-foreground font-medium">{patient.preferences?.appointmentPreferences?.preferredServices?.length || 0} seleccionados</span>
              </div>
              <div className="flex items-center justify-between text-sm h-9">
                <span className="text-muted-foreground">Aviso cancelación:</span>
                <span className="text-foreground font-medium">{patient.preferences?.appointmentPreferences?.cancellationNotice || 24} horas</span>
              </div>
              <div className="flex items-center justify-between text-sm h-9">
                <span className="text-muted-foreground">Lista de espera:</span>
                <span className="text-foreground font-medium">{patient.preferences?.appointmentPreferences?.waitingListOptIn ? 'Sí' : 'No'}</span>
              </div>
              <div className="flex items-center justify-between text-sm h-9">
                <span className="text-muted-foreground">Profesionales:</span>
                <span className="text-foreground font-medium">{patient.preferences?.appointmentPreferences?.preferredProfessionals?.length || 0} asignados</span>
              </div>
              <div className="flex items-center justify-between text-sm h-9">
                <span className="text-muted-foreground">Notas:</span>
                <span className="text-foreground font-medium">{patient.preferences?.appointmentPreferences?.notes || 'Sin notas'}</span>
              </div>
            </div>
          )}
        </div>
      </div>


      {/* Portal del Paciente */}
      <div className="pb-4 border-b border-border/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Monitor className="h-4 w-4 text-primary" />
            Portal del Paciente
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit('portal', {
              enabled: patient.preferences?.portalAccess?.enabled || false,
              twoFactorEnabled: patient.preferences?.portalAccess?.twoFactorEnabled || false,
              loginNotifications: patient.preferences?.portalAccess?.loginNotifications !== false
            })}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-3 w-3" />
          </Button>
        </div>
        <div className="px-1">
          {editingSection === 'portal' ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Portal habilitado:</span>
                  <Switch
                    checked={editData.enabled || false}
                    onCheckedChange={(checked) => setEditData({...editData, enabled: checked})}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Doble factor:</span>
                  <Switch
                    checked={editData.twoFactorEnabled || false}
                    onCheckedChange={(checked) => setEditData({...editData, twoFactorEnabled: checked})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Notificaciones login:</span>
                  <Switch
                    checked={editData.loginNotifications !== false}
                    onCheckedChange={(checked) => setEditData({...editData, loginNotifications: checked})}
                  />
                </div>
                <div></div>
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
            <div className="grid grid-cols-2 gap-3" style={{minHeight: '144px'}}>
              <div className="flex items-center justify-between text-sm h-9">
                <span className="text-muted-foreground">Portal habilitado:</span>
                <span className="text-foreground font-medium">{patient.preferences?.portalAccess?.enabled ? 'Activo' : 'Inactivo'}</span>
              </div>
              <div className="flex items-center justify-between text-sm h-9">
                <span className="text-muted-foreground">Doble factor:</span>
                <span className="text-foreground font-medium">{patient.preferences?.portalAccess?.twoFactorEnabled ? 'Habilitado' : 'Deshabilitado'}</span>
              </div>
              <div className="flex items-center justify-between text-sm h-9">
                <span className="text-muted-foreground">Notificaciones login:</span>
                <span className="text-foreground font-medium">{patient.preferences?.portalAccess?.loginNotifications !== false ? 'Activas' : 'Inactivas'}</span>
              </div>
              <div className="flex items-center justify-between text-sm h-9">
                <span className="text-muted-foreground">Último acceso:</span>
                <span className="text-foreground font-medium">{patient.preferences?.portalAccess?.lastLogin ? new Date(patient.preferences.portalAccess.lastLogin).toLocaleDateString('es-ES') : 'Nunca'}</span>
              </div>
              <div className="flex items-center justify-between text-sm h-9">
                <span className="text-muted-foreground">Cambio contraseña:</span>
                <span className="text-foreground font-medium">{patient.preferences?.portalAccess?.passwordLastChanged ? new Date(patient.preferences.portalAccess.passwordLastChanged).toLocaleDateString('es-ES') : 'No registrado'}</span>
              </div>
              <div></div>
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
            onClick={() => onEdit('privacy', {
              dataProcessingConsented: patient.gdprConsent?.dataProcessing?.consented || false,
              marketingConsented: patient.gdprConsent?.marketingCommunications?.consented || false,
              dataSharingHealthcare: patient.gdprConsent?.dataSharing?.healthcareProfessionals || false,
              dataSharingInsurance: patient.gdprConsent?.dataSharing?.insuranceProviders || false,
              dataSharingEmergency: patient.gdprConsent?.dataSharing?.emergencyContacts || false,
              rightToErasureRequested: patient.gdprConsent?.rightToErasure?.requested || false
            })}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-3 w-3" />
          </Button>
        </div>
        <div className="px-1">
          {editingSection === 'privacy' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Procesamiento datos:</span>
                  <Switch
                    checked={editData.dataProcessingConsented || false}
                    onCheckedChange={(checked) => setEditData({...editData, dataProcessingConsented: checked})}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Marketing:</span>
                  <Switch
                    checked={editData.marketingConsented || false}
                    onCheckedChange={(checked) => setEditData({...editData, marketingConsented: checked})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Compartir profesionales:</span>
                  <Switch
                    checked={editData.dataSharingHealthcare || false}
                    onCheckedChange={(checked) => setEditData({...editData, dataSharingHealthcare: checked})}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Compartir seguros:</span>
                  <Switch
                    checked={editData.dataSharingInsurance || false}
                    onCheckedChange={(checked) => setEditData({...editData, dataSharingInsurance: checked})}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Contactos emergencia:</span>
                  <Switch
                    checked={editData.dataSharingEmergency || false}
                    onCheckedChange={(checked) => setEditData({...editData, dataSharingEmergency: checked})}
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Derecho olvido:</span>
                  <Switch
                    checked={editData.rightToErasureRequested || false}
                    onCheckedChange={(checked) => setEditData({...editData, rightToErasureRequested: checked})}
                  />
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
            <div className="grid grid-cols-2 gap-3" style={{minHeight: '144px'}}>
              <div className="flex items-center justify-between text-sm h-9">
                <span className="text-muted-foreground">Fecha consentimiento:</span>
                <span className="text-foreground font-medium">{patient.gdprConsent?.dataProcessing?.consentDate ? new Date(patient.gdprConsent.dataProcessing.consentDate).toLocaleDateString('es-ES') : 'No registrado'}</span>
              </div>
              <div className="flex items-center justify-between text-sm h-9">
                <span className="text-muted-foreground">Versión política:</span>
                <span className="text-foreground font-medium">{patient.gdprConsent?.dataProcessing?.consentVersion || 'v1.0'}</span>
              </div>
              <div className="flex items-center justify-between text-sm h-9">
                <span className="text-muted-foreground">Procesamiento datos:</span>
                <span className="text-foreground font-medium">{patient.gdprConsent?.dataProcessing?.consented ? 'Consentido' : 'Denegado'}</span>
              </div>
              <div className="flex items-center justify-between text-sm h-9">
                <span className="text-muted-foreground">Marketing:</span>
                <span className="text-foreground font-medium">{patient.gdprConsent?.marketingCommunications?.consented ? 'Consentido' : 'Denegado'}</span>
              </div>
              <div className="flex items-center justify-between text-sm h-9">
                <span className="text-muted-foreground">Compartir profesionales:</span>
                <span className="text-foreground font-medium">{patient.gdprConsent?.dataSharing?.healthcareProfessionals ? 'Permitido' : 'Denegado'}</span>
              </div>
              <div className="flex items-center justify-between text-sm h-9">
                <span className="text-muted-foreground">Derecho olvido:</span>
                <span className="text-foreground font-medium">{patient.gdprConsent?.rightToErasure?.requested ? 'Solicitado' : 'No solicitado'}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

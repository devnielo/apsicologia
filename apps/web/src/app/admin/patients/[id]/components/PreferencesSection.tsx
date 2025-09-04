'use client';

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Edit, Save, X, Plus, Trash2, FileText, Download, Eye, MessageCircle, Calendar, Monitor, Shield, Users } from "lucide-react";
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

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
  // Fetch all professionals for dropdowns
  const { data: professionalsData } = useQuery({
    queryKey: ['professionals', 'all'],
    queryFn: async () => {
      const response = await apiClient.get('/professionals');
      return response.data.data;
    }
  });

  const professionals = professionalsData || [];
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
                <div className="space-y-2">
                  <span className="text-muted-foreground text-sm">Métodos recordatorio:</span>
                  <div className="flex flex-wrap gap-2">
                    {['email', 'sms', 'phone', 'push'].map((method) => (
                      <div key={method} className="flex items-center space-x-2">
                        <Checkbox
                          id={method}
                          checked={(editData.reminderMethods || []).includes(method)}
                          onCheckedChange={(checked) => {
                            const currentMethods = editData.reminderMethods || [];
                            if (checked) {
                              setEditData({...editData, reminderMethods: [...currentMethods, method]});
                            } else {
                              setEditData({...editData, reminderMethods: currentMethods.filter((m: string) => m !== method)});
                            }
                          }}
                        />
                        <Label htmlFor={method} className="text-xs">
                          {method === 'email' ? 'Email' : 
                           method === 'sms' ? 'SMS' : 
                           method === 'phone' ? 'Teléfono' : 'Push'}
                        </Label>
                      </div>
                    ))}
                  </div>
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

      {/* Profesionales Asignados */}
      <div className="pb-4 border-b border-border/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            Profesionales Asignados
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit('professionals', {
              primaryProfessional: patient.clinicalInfo?.primaryProfessional?.id || patient.clinicalInfo?.primaryProfessional?._id || patient.clinicalInfo?.primaryProfessional || '',
              assignedProfessionals: patient.clinicalInfo?.assignedProfessionals?.map((prof: any) => 
                typeof prof === 'object' ? (prof.id || prof._id) : prof
              ) || []
            })}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-3 w-3" />
          </Button>
        </div>
        <div className="px-1">
          {editingSection === 'professionals' ? (
            <div className="space-y-4">
              {/* Profesional Principal */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Profesional Principal</Label>
                <Select
                  value={editData?.primaryProfessional || 'none'}
                  onValueChange={(value) => setEditData({ ...editData, primaryProfessional: value === 'none' ? '' : value })}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Seleccionar profesional principal" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin profesional principal</SelectItem>
                    {professionals.map((professional: any) => (
                      <SelectItem key={professional._id || professional.id} value={professional._id || professional.id}>
                        {professional.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Profesionales Asignados */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Profesionales Asignados</Label>
                <div className="space-y-2">
                  {professionals.map((professional: any) => (
                    <div key={professional._id || professional.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={professional._id || professional.id}
                        checked={(editData?.assignedProfessionals || []).includes(professional._id || professional.id)}
                        onCheckedChange={(checked) => {
                          const currentProfessionals = editData?.assignedProfessionals || [];
                          const professionalId = professional._id || professional.id;
                          const newAssignedProfessionals = checked 
                            ? [...currentProfessionals, professionalId]
                            : currentProfessionals.filter((id: string) => id !== professionalId);
                          
                          setEditData({
                            ...editData,
                            assignedProfessionals: newAssignedProfessionals
                          });
                        }}
                      />
                      <Label htmlFor={professional._id || professional.id} className="text-sm">
                        {professional.name}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button onClick={() => onSave('professionals')} size="sm" className="h-7 text-xs">
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
              {/* Show primaryProfessional first if it exists */}
              {patient.clinicalInfo?.primaryProfessional && (
                <div className="flex items-center gap-2 p-2 border rounded-md bg-muted/30">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">
                        {patient.clinicalInfo.primaryProfessional.name}
                      </span>
                      <Badge variant="default" className="text-xs">
                        Principal
                      </Badge>
                    </div>
                    {patient.clinicalInfo.primaryProfessional.specialties && patient.clinicalInfo.primaryProfessional.specialties.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {patient.clinicalInfo.primaryProfessional.specialties.slice(0, 3).map((specialty: string, specIndex: number) => (
                          <Badge key={specIndex} variant="outline" className="text-xs">
                            {specialty}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Show assignedProfessionals */}
              {patient.clinicalInfo?.assignedProfessionals && patient.clinicalInfo.assignedProfessionals.length > 0 ? (
                <div className="space-y-2">
                  {patient.clinicalInfo.assignedProfessionals.map((professional: any, index: number) => {
                    // Skip if this is the same as primaryProfessional
                    if (patient.clinicalInfo?.primaryProfessional && 
                        professional.id === patient.clinicalInfo.primaryProfessional.id) {
                      return null;
                    }
                    return (
                      <div key={index} className="flex items-center gap-2 p-2 border rounded-md bg-muted/30">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">
                              {professional.name || `Profesional ${index + 1}`}
                            </span>
                          </div>
                          {professional.specialties && professional.specialties.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {professional.specialties.slice(0, 3).map((specialty: string, specIndex: number) => (
                                <Badge key={specIndex} variant="outline" className="text-xs">
                                  {specialty}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : !patient.clinicalInfo?.primaryProfessional && (
                <div className="flex items-center justify-center p-4 border rounded-md bg-muted/30">
                  <span className="text-sm text-muted-foreground">No hay profesionales asignados</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Citas */}
      <div className="pb-4 border-b border-border/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" />
            Preferencias de Citas
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit('appointments', {
              preferredTimes: patient.preferences?.appointmentPreferences?.preferredTimes || [],
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
            <div className="space-y-4">
              {/* Horarios Preferidos */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Horarios Preferidos</Label>
                <div className="grid grid-cols-1 gap-2">
                  {(editData.preferredTimes || []).map((time: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 p-2 border rounded-md">
                      <Select 
                        value={time.day || 'monday'}
                        onValueChange={(value) => {
                          const newTimes = [...(editData.preferredTimes || [])];
                          newTimes[index] = { ...newTimes[index], day: value };
                          setEditData({...editData, preferredTimes: newTimes});
                        }}
                      >
                        <SelectTrigger className="h-8 text-xs w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="monday">Lun</SelectItem>
                          <SelectItem value="tuesday">Mar</SelectItem>
                          <SelectItem value="wednesday">Mié</SelectItem>
                          <SelectItem value="thursday">Jue</SelectItem>
                          <SelectItem value="friday">Vie</SelectItem>
                          <SelectItem value="saturday">Sáb</SelectItem>
                          <SelectItem value="sunday">Dom</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="time"
                        value={time.startTime || '09:00'}
                        onChange={(e) => {
                          const newTimes = [...(editData.preferredTimes || [])];
                          newTimes[index] = { ...newTimes[index], startTime: e.target.value };
                          setEditData({...editData, preferredTimes: newTimes});
                        }}
                        className="h-8 text-xs w-20"
                      />
                      <span className="text-xs text-muted-foreground">-</span>
                      <Input
                        type="time"
                        value={time.endTime || '17:00'}
                        onChange={(e) => {
                          const newTimes = [...(editData.preferredTimes || [])];
                          newTimes[index] = { ...newTimes[index], endTime: e.target.value };
                          setEditData({...editData, preferredTimes: newTimes});
                        }}
                        className="h-8 text-xs w-20"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newTimes = (editData.preferredTimes || []).filter((_: any, i: number) => i !== index);
                          setEditData({...editData, preferredTimes: newTimes});
                        }}
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newTimes = [...(editData.preferredTimes || []), { day: 'monday', startTime: '09:00', endTime: '17:00' }];
                      setEditData({...editData, preferredTimes: newTimes});
                    }}
                    className="h-8 text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Agregar horario
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Configuraciones */}
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

              {/* Notas */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Notas adicionales</Label>
                <Textarea
                  value={editData.notes || ''}
                  onChange={(e) => setEditData({...editData, notes: e.target.value})}
                  className="text-sm min-h-[60px]"
                  placeholder="Preferencias adicionales sobre citas..."
                />
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
            <div className="space-y-4">
              {/* Horarios Preferidos */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Horarios Preferidos</Label>
                {patient.preferences?.appointmentPreferences?.preferredTimes?.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2">
                    {patient.preferences.appointmentPreferences.preferredTimes.map((time: any, index: number) => (
                      <div key={index} className="flex items-center gap-2 p-2 border rounded-md bg-muted/30">
                        <Badge variant="outline" className="text-xs">
                          {time.day === 'monday' ? 'Lun' : 
                           time.day === 'tuesday' ? 'Mar' : 
                           time.day === 'wednesday' ? 'Mié' : 
                           time.day === 'thursday' ? 'Jue' : 
                           time.day === 'friday' ? 'Vie' : 
                           time.day === 'saturday' ? 'Sáb' : 'Dom'}
                        </Badge>
                        <span className="text-sm text-foreground">
                          {time.startTime} - {time.endTime}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">No configurados</span>
                )}
              </div>

              <Separator />


              {/* Configuraciones */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Aviso cancelación:</span>
                  <span className="text-foreground font-medium">{patient.preferences?.appointmentPreferences?.cancellationNotice || 24} horas</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Lista de espera:</span>
                  <span className="text-foreground font-medium">{patient.preferences?.appointmentPreferences?.waitingListOptIn ? 'Sí' : 'No'}</span>
                </div>
              </div>

              {/* Notas */}
              {patient.preferences?.appointmentPreferences?.notes && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Notas</Label>
                  <div className="p-2 border rounded-md bg-muted/30">
                    <span className="text-sm text-foreground">{patient.preferences.appointmentPreferences.notes}</span>
                  </div>
                </div>
              )}
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
              dataProcessingMethod: patient.gdprConsent?.dataProcessing?.consentMethod || 'digital',
              dataProcessingVersion: patient.gdprConsent?.dataProcessing?.consentVersion || '1.0',
              dataProcessingNotes: patient.gdprConsent?.dataProcessing?.notes || '',
              marketingConsented: patient.gdprConsent?.marketingCommunications?.consented || false,
              marketingMethod: patient.gdprConsent?.marketingCommunications?.method || 'digital',
              dataSharingHealthcare: patient.gdprConsent?.dataSharing?.healthcareProfessionals || false,
              dataSharingThirdParty: patient.gdprConsent?.dataSharing?.thirdPartyProviders || false,
              dataSharingEmergency: patient.gdprConsent?.dataSharing?.emergencyContacts || false,
              dataSharingResearch: patient.gdprConsent?.dataSharing?.researchPurposes || false,
              rightToErasureRequested: patient.gdprConsent?.rightToErasure?.requested || false,
              rightToErasureReason: patient.gdprConsent?.rightToErasure?.retentionReason || '',
              rightToErasureNotes: patient.gdprConsent?.rightToErasure?.notes || ''
            })}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-3 w-3" />
          </Button>
        </div>
        <div className="px-1">
          {editingSection === 'privacy' ? (
            <div className="space-y-4">
              {/* Procesamiento de Datos */}
              <div className="space-y-3">
                <Label className="text-xs font-medium text-muted-foreground">Procesamiento de Datos</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Consentimiento:</span>
                    <Switch
                      checked={editData.dataProcessingConsented || false}
                      onCheckedChange={(checked) => setEditData({...editData, dataProcessingConsented: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Método:</span>
                    <Select 
                      value={editData.dataProcessingMethod || 'digital'} 
                      onValueChange={(value) => setEditData({...editData, dataProcessingMethod: value})}
                    >
                      <SelectTrigger className="h-9 text-sm max-w-[50%]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="digital">Digital</SelectItem>
                        <SelectItem value="written">Escrito</SelectItem>
                        <SelectItem value="verbal">Verbal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Versión:</span>
                    <Input
                      value={editData.dataProcessingVersion || '1.0'}
                      onChange={(e) => setEditData({...editData, dataProcessingVersion: e.target.value})}
                      className="h-9 text-sm max-w-[50%]"
                      placeholder="1.0"
                    />
                  </div>
                  <div></div>
                </div>
              </div>

              <Separator />

              {/* Marketing */}
              <div className="space-y-3">
                <Label className="text-xs font-medium text-muted-foreground">Comunicaciones de Marketing</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Consentimiento:</span>
                    <Switch
                      checked={editData.marketingConsented || false}
                      onCheckedChange={(checked) => setEditData({...editData, marketingConsented: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Método:</span>
                    <Select 
                      value={editData.marketingMethod || 'digital'} 
                      onValueChange={(value) => setEditData({...editData, marketingMethod: value})}
                    >
                      <SelectTrigger className="h-9 text-sm max-w-[50%]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="digital">Digital</SelectItem>
                        <SelectItem value="written">Escrito</SelectItem>
                        <SelectItem value="verbal">Verbal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Compartir Datos */}
              <div className="space-y-3">
                <Label className="text-xs font-medium text-muted-foreground">Compartir Datos</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Profesionales:</span>
                    <Switch
                      checked={editData.dataSharingHealthcare || false}
                      onCheckedChange={(checked) => setEditData({...editData, dataSharingHealthcare: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Seguros:</span>
                    <Switch
                      checked={editData.dataSharingInsurance || false}
                      onCheckedChange={(checked) => setEditData({...editData, dataSharingInsurance: checked})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Emergencia:</span>
                    <Switch
                      checked={editData.dataSharingEmergency || false}
                      onCheckedChange={(checked) => setEditData({...editData, dataSharingEmergency: checked})}
                    />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Investigación:</span>
                    <Switch
                      checked={editData.dataSharingResearch || false}
                      onCheckedChange={(checked) => setEditData({...editData, dataSharingResearch: checked})}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Derecho al Olvido */}
              <div className="space-y-3">
                <Label className="text-xs font-medium text-muted-foreground">Derecho al Olvido</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Solicitado:</span>
                    <Switch
                      checked={editData.rightToErasureRequested || false}
                      onCheckedChange={(checked) => setEditData({...editData, rightToErasureRequested: checked})}
                    />
                  </div>
                  <div></div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Razón de retención</Label>
                  <Textarea
                    value={editData.rightToErasureReason || ''}
                    onChange={(e) => setEditData({...editData, rightToErasureReason: e.target.value})}
                    className="text-sm min-h-[60px]"
                    placeholder="Razón para retener los datos..."
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
            <div className="space-y-4">
              {/* Procesamiento de Datos */}
              <div className="space-y-3">
                <Label className="text-xs font-medium text-muted-foreground">Procesamiento de Datos</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Estado:</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={patient.gdprConsent?.dataProcessing?.consented ? "default" : "secondary"} className="text-xs">
                        {patient.gdprConsent?.dataProcessing?.consented ? 'Consentido' : 'Denegado'}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Método:</span>
                    <span className="text-sm text-foreground">
                      {patient.gdprConsent?.dataProcessing?.consentMethod === 'digital' ? 'Digital' :
                       patient.gdprConsent?.dataProcessing?.consentMethod === 'written' ? 'Escrito' :
                       patient.gdprConsent?.dataProcessing?.consentMethod === 'verbal' ? 'Verbal' : 'Digital'}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Fecha:</span>
                    <span className="text-sm text-foreground">
                      {patient.gdprConsent?.dataProcessing?.consentDate ? 
                        new Date(patient.gdprConsent.dataProcessing.consentDate).toLocaleDateString('es-ES') : 
                        'No registrado'}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Versión:</span>
                    <span className="text-sm text-foreground">{patient.gdprConsent?.dataProcessing?.consentVersion || 'v1.0'}</span>
                  </div>
                </div>
                {patient.gdprConsent?.dataProcessing?.notes && (
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Notas:</span>
                    <div className="p-2 border rounded-md bg-muted/30">
                      <span className="text-sm text-foreground">{patient.gdprConsent.dataProcessing.notes}</span>
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Marketing */}
              <div className="space-y-3">
                <Label className="text-xs font-medium text-muted-foreground">Comunicaciones de Marketing</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Estado:</span>
                    <Badge variant={patient.gdprConsent?.marketingCommunications?.consented ? "default" : "secondary"} className="text-xs">
                      {patient.gdprConsent?.marketingCommunications?.consented ? 'Consentido' : 'Denegado'}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Método:</span>
                    <span className="text-sm text-foreground">
                      {patient.gdprConsent?.marketingCommunications?.method === 'digital' ? 'Digital' :
                       patient.gdprConsent?.marketingCommunications?.method === 'written' ? 'Escrito' :
                       patient.gdprConsent?.marketingCommunications?.method === 'verbal' ? 'Verbal' : 'Digital'}
                    </span>
                  </div>
                </div>
                {patient.gdprConsent?.marketingCommunications?.consentDate && (
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Fecha consentimiento:</span>
                    <span className="text-sm text-foreground">
                      {new Date(patient.gdprConsent.marketingCommunications.consentDate).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                )}
              </div>

              <Separator />

              {/* Compartir Datos */}
              <div className="space-y-3">
                <Label className="text-xs font-medium text-muted-foreground">Compartir Datos</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Profesionales:</span>
                      <Badge variant={patient.gdprConsent?.dataSharing?.healthcareProfessionals ? "default" : "secondary"} className="text-xs">
                        {patient.gdprConsent?.dataSharing?.healthcareProfessionals ? 'Permitido' : 'Denegado'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Terceros:</span>
                      <Badge variant={patient.gdprConsent?.dataSharing?.thirdPartyProviders ? "default" : "secondary"} className="text-xs">
                        {patient.gdprConsent?.dataSharing?.thirdPartyProviders ? 'Permitido' : 'Denegado'}
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Emergencia:</span>
                      <Badge variant={patient.gdprConsent?.dataSharing?.emergencyContacts ? "default" : "secondary"} className="text-xs">
                        {patient.gdprConsent?.dataSharing?.emergencyContacts ? 'Permitido' : 'Denegado'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Investigación:</span>
                      <Badge variant={patient.gdprConsent?.dataSharing?.researchPurposes ? "default" : "secondary"} className="text-xs">
                        {patient.gdprConsent?.dataSharing?.researchPurposes ? 'Permitido' : 'Denegado'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Derecho al Olvido */}
              <div className="space-y-3">
                <Label className="text-xs font-medium text-muted-foreground">Derecho al Olvido</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Estado:</span>
                    <Badge variant={patient.gdprConsent?.rightToErasure?.requested ? "destructive" : "secondary"} className="text-xs">
                      {patient.gdprConsent?.rightToErasure?.requested ? 'Solicitado' : 'No solicitado'}
                    </Badge>
                  </div>
                  {patient.gdprConsent?.rightToErasure?.requestDate && (
                    <div className="space-y-1">
                      <span className="text-xs text-muted-foreground">Fecha solicitud:</span>
                      <span className="text-sm text-foreground">
                        {new Date(patient.gdprConsent.rightToErasure.requestDate).toLocaleDateString('es-ES')}
                      </span>
                    </div>
                  )}
                </div>
                {patient.gdprConsent?.rightToErasure?.retentionReason && (
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Razón de retención:</span>
                    <div className="p-2 border rounded-md bg-muted/30">
                      <span className="text-sm text-foreground">{patient.gdprConsent.rightToErasure.retentionReason}</span>
                    </div>
                  </div>
                )}
                {patient.gdprConsent?.rightToErasure?.notes && (
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Notas:</span>
                    <div className="p-2 border rounded-md bg-muted/30">
                      <span className="text-sm text-foreground">{patient.gdprConsent.rightToErasure.notes}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

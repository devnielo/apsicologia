'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { BadgeSelector } from '@/components/ui/badge-selector';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Save, X, Heart, Pill, Stethoscope } from 'lucide-react';
import {
  MEDICAL_CONDITIONS,
  ALLERGIES,
  MEDICATIONS,
  SURGERIES,
  MENTAL_HEALTH_DIAGNOSES,
  MENTAL_HEALTH_TREATMENTS,
  MENTAL_HEALTH_STATUS,
  MENTAL_HEALTH_SEVERITY,
  MENTAL_HEALTH_STATUS_LABELS,
  MENTAL_HEALTH_SEVERITY_LABELS,
  TREATMENT_FREQUENCY_LABELS,
} from '@/../../packages/shared/src/constants';

interface ClinicalSectionProps {
  patient: any;
  editingSection: string | null;
  editData: any;
  onEdit: (section: string, data: any) => void;
  onSave: (section: string) => void;
  onCancel: () => void;
  setEditData: (data: any) => void;
}

export default function ClinicalSection({
  patient,
  editingSection,
  editData,
  onEdit,
  onSave,
  onCancel,
  setEditData
}: ClinicalSectionProps) {
  const formatDate = (date: string | Date) => {
    if (!date) return 'No especificado';
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatStatus = (status: string) => {
    return MENTAL_HEALTH_STATUS_LABELS[status as keyof typeof MENTAL_HEALTH_STATUS_LABELS] || status;
  };

  const formatSeverity = (severity: string) => {
    return MENTAL_HEALTH_SEVERITY_LABELS[severity as keyof typeof MENTAL_HEALTH_SEVERITY_LABELS] || severity;
  };

  const formatFrequency = (frequency: string) => {
    return TREATMENT_FREQUENCY_LABELS[frequency as keyof typeof TREATMENT_FREQUENCY_LABELS] || frequency;
  };

  return (
    <div className="space-y-4">
      {/* Historial Médico */}
      <div className="pb-4 border-b border-border/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Heart className="h-4 w-4 text-primary" />
            Historial Médico
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit('medicalHistory', {
              conditions: patient.clinicalInfo?.medicalHistory?.conditions || [],
              medications: patient.clinicalInfo?.medicalHistory?.medications || [],
              allergies: patient.clinicalInfo?.medicalHistory?.allergies || [],
              surgeries: patient.clinicalInfo?.medicalHistory?.surgeries || [],
              notes: patient.clinicalInfo?.medicalHistory?.notes || ''
            })}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-3 w-3" />
          </Button>
        </div>
        <div className="px-1">
          {editingSection === 'medicalHistory' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-foreground mb-2 block">Condiciones médicas</Label>
                  <BadgeSelector
                    value={editData.conditions || []}
                    onChange={(conditions) => setEditData({...editData, conditions})}
                    predefinedOptions={[...MEDICAL_CONDITIONS]}
                    placeholder="Agregar condición"
                    className="min-h-[60px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-foreground mb-2 block">Medicación actual</Label>
                  <BadgeSelector
                    value={editData.medications || []}
                    onChange={(medications) => setEditData({...editData, medications})}
                    predefinedOptions={[...MEDICATIONS]}
                    placeholder="Agregar medicamento"
                    className="min-h-[60px]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-foreground mb-2 block">Alergias</Label>
                  <BadgeSelector
                    value={editData.allergies || []}
                    onChange={(allergies) => setEditData({...editData, allergies})}
                    predefinedOptions={[...ALLERGIES]}
                    placeholder="Agregar alergia"
                    className="min-h-[60px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-foreground mb-2 block">Cirugías previas</Label>
                  <BadgeSelector
                    value={editData.surgeries || []}
                    onChange={(surgeries) => setEditData({...editData, surgeries})}
                    predefinedOptions={[...SURGERIES]}
                    placeholder="Agregar cirugía"
                    className="min-h-[60px]"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs font-medium text-foreground mb-2 block">Notas médicas</Label>
                <RichTextEditor
                  content={editData.notes || ''}
                  onChange={(notes) => setEditData({...editData, notes})}
                  placeholder="Introduce observaciones médicas adicionales..."
                  className="min-h-[100px]"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={() => onSave('medicalHistory')} size="sm" className="h-7 text-xs">
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
            <div className="space-y-3">
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Condiciones médicas:</span>
                <div className="flex flex-wrap gap-1 min-h-[24px]">
                  {patient.clinicalInfo?.medicalHistory?.conditions?.length > 0 ? 
                    patient.clinicalInfo.medicalHistory.conditions.map((condition: string, index: number) => (
                      <Badge key={index} variant="default" className="text-xs">
                        {condition}
                      </Badge>
                    )) : 
                    <span className="text-foreground font-medium text-sm">No especificado</span>
                  }
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Alergias:</span>
                <div className="flex flex-wrap gap-1 min-h-[24px]">
                  {patient.clinicalInfo?.medicalHistory?.allergies?.length > 0 ? 
                    patient.clinicalInfo.medicalHistory.allergies.map((allergy: string, index: number) => (
                      <Badge key={index} variant="default" className="text-xs">
                        {allergy}
                      </Badge>
                    )) : 
                    <span className="text-foreground font-medium text-sm">No especificado</span>
                  }
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Medicación actual:</span>
                <div className="flex flex-wrap gap-1 min-h-[24px]">
                  {patient.clinicalInfo?.medicalHistory?.medications?.length > 0 ? 
                    patient.clinicalInfo.medicalHistory.medications.map((med: string, index: number) => (
                      <Badge key={index} variant="default" className="text-xs">
                        {med}
                      </Badge>
                    )) : 
                    <span className="text-foreground font-medium text-sm">No especificado</span>
                  }
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Cirugías previas:</span>
                <div className="flex flex-wrap gap-1 min-h-[24px]">
                  {patient.clinicalInfo?.medicalHistory?.surgeries?.length > 0 ? 
                    patient.clinicalInfo.medicalHistory.surgeries.map((surgery: string, index: number) => (
                      <Badge key={index} variant="default" className="text-xs">
                        {surgery}
                      </Badge>
                    )) : 
                    <span className="text-foreground font-medium text-sm">No especificado</span>
                  }
                </div>
              </div>
              {patient.clinicalInfo?.medicalHistory?.notes && (
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">Notas médicas:</span>
                  <RichTextEditor
                    content={patient.clinicalInfo.medicalHistory.notes}
                    editable={false}
                    className="text-sm"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Salud Mental */}
      <div className="pb-4 border-b border-border/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Stethoscope className="h-4 w-4 text-primary" />
            Salud Mental
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit('mentalHealthHistory', {
              diagnoses: patient.clinicalInfo?.mentalHealthHistory?.diagnoses || [],
              previousTreatments: patient.clinicalInfo?.mentalHealthHistory?.previousTreatments || [],
              currentStatus: patient.clinicalInfo?.mentalHealthHistory?.currentStatus || '',
              severity: patient.clinicalInfo?.mentalHealthHistory?.severity || '',
              notes: patient.clinicalInfo?.mentalHealthHistory?.notes || ''
            })}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-3 w-3" />
          </Button>
        </div>
        <div className="px-1">
          {editingSection === 'mentalHealthHistory' ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-foreground mb-2 block">Diagnósticos</Label>
                  <BadgeSelector
                    value={editData.diagnoses || []}
                    onChange={(diagnoses) => setEditData({...editData, diagnoses})}
                    predefinedOptions={[...MENTAL_HEALTH_DIAGNOSES]}
                    placeholder="Agregar diagnóstico"
                    className="min-h-[60px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-foreground mb-2 block">Tratamientos previos</Label>
                  <BadgeSelector
                    value={editData.previousTreatments || []}
                    onChange={(previousTreatments) => setEditData({...editData, previousTreatments})}
                    predefinedOptions={[...MENTAL_HEALTH_TREATMENTS]}
                    placeholder="Agregar tratamiento"
                    className="min-h-[60px]"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-foreground mb-2 block">Estado actual</Label>
                  <Select
                    value={editData.currentStatus || ''}
                    onValueChange={(currentStatus) => setEditData({...editData, currentStatus})}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(MENTAL_HEALTH_STATUS_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-foreground mb-2 block">Severidad</Label>
                  <Select
                    value={editData.severity || ''}
                    onValueChange={(severity) => setEditData({...editData, severity})}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Seleccionar severidad" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(MENTAL_HEALTH_SEVERITY_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs font-medium text-foreground mb-2 block">Notas de salud mental</Label>
                <RichTextEditor
                  content={editData.notes || ''}
                  onChange={(notes) => setEditData({...editData, notes})}
                  placeholder="Introduce observaciones sobre el estado mental del paciente..."
                  className="min-h-[100px]"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={() => onSave('mentalHealthHistory')} size="sm" className="h-7 text-xs">
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
            <div className="space-y-3">
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Diagnósticos:</span>
                <div className="flex flex-wrap gap-1 min-h-[24px]">
                  {patient.clinicalInfo?.mentalHealthHistory?.diagnoses?.length > 0 ? 
                    patient.clinicalInfo.mentalHealthHistory.diagnoses.map((diagnosis: string, index: number) => (
                      <Badge key={index} variant="default" className="text-xs">
                        {diagnosis}
                      </Badge>
                    )) : 
                    <span className="text-foreground font-medium text-sm">No especificado</span>
                  }
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Tratamientos previos:</span>
                <div className="flex flex-wrap gap-1 min-h-[24px]">
                  {patient.clinicalInfo?.mentalHealthHistory?.previousTreatments?.length > 0 ? 
                    patient.clinicalInfo.mentalHealthHistory.previousTreatments.map((treatment: string, index: number) => (
                      <Badge key={index} variant="default" className="text-xs">
                        {treatment}
                      </Badge>
                    )) : 
                    <span className="text-foreground font-medium text-sm">No especificado</span>
                  }
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Estado actual:</span>
                  <span className="text-foreground font-medium text-sm block">
                    {patient.clinicalInfo?.mentalHealthHistory?.currentStatus ? 
                      formatStatus(patient.clinicalInfo.mentalHealthHistory.currentStatus) : 
                      'No especificado'
                    }
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Severidad:</span>
                  <span className="text-foreground font-medium text-sm block">
                    {patient.clinicalInfo?.mentalHealthHistory?.severity ? 
                      formatSeverity(patient.clinicalInfo.mentalHealthHistory.severity) : 
                      'No especificado'
                    }
                  </span>
                </div>
              </div>
              {patient.clinicalInfo?.mentalHealthHistory?.notes && (
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">Notas de salud mental:</span>
                  <RichTextEditor
                    content={patient.clinicalInfo.mentalHealthHistory.notes}
                    editable={false}
                    className="text-sm"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tratamiento Actual */}
      <div className="pb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Pill className="h-4 w-4 text-primary" />
            Tratamiento Actual
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit('currentTreatment', {
              treatmentPlan: patient.clinicalInfo?.currentTreatment?.treatmentPlan || '',
              goals: patient.clinicalInfo?.currentTreatment?.goals || [],
              startDate: patient.clinicalInfo?.currentTreatment?.startDate || '',
              expectedDuration: patient.clinicalInfo?.currentTreatment?.expectedDuration || '',
              frequency: patient.clinicalInfo?.currentTreatment?.frequency || '',
              notes: patient.clinicalInfo?.currentTreatment?.notes || ''
            })}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-3 w-3" />
          </Button>
        </div>
        <div className="px-1">
          {editingSection === 'currentTreatment' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-foreground mb-2 block">Objetivos del tratamiento</Label>
                <BadgeSelector
                  value={editData.goals || []}
                  onChange={(goals) => setEditData({...editData, goals})}
                  predefinedOptions={[]}
                  placeholder="Agregar objetivo"
                  className="min-h-[60px]"
                />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-foreground mb-2 block">Duración esperada</Label>
                  <Input
                    value={editData.expectedDuration || ''}
                    onChange={(e) => setEditData({...editData, expectedDuration: e.target.value})}
                    placeholder="ej. 6 meses"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-foreground mb-2 block">Frecuencia</Label>
                  <Select value={editData.frequency || ''} onValueChange={(frequency) => setEditData({...editData, frequency})}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Seleccionar frecuencia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diaria</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="biweekly">Quincenal</SelectItem>
                      <SelectItem value="monthly">Mensual</SelectItem>
                      <SelectItem value="as-needed">Según necesidad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs font-medium text-foreground mb-2 block">Plan de tratamiento</Label>
                <RichTextEditor
                  content={editData.treatmentPlan || ''}
                  onChange={(treatmentPlan) => setEditData({...editData, treatmentPlan})}
                  placeholder="Describe el plan de tratamiento completo, objetivos, metodología, duración estimada, frecuencia de sesiones..."
                  className="min-h-[200px]"
                />
              </div>
              <div>
                <Label className="text-xs font-medium text-foreground mb-2 block">Notas del tratamiento</Label>
                <RichTextEditor
                  content={editData.notes || ''}
                  onChange={(notes) => setEditData({...editData, notes})}
                  placeholder="Notas adicionales sobre el tratamiento..."
                  className="min-h-[120px]"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={() => onSave('currentTreatment')} size="sm" className="h-7 text-xs">
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
            <div className="space-y-3">
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Objetivos del tratamiento:</span>
                <div className="flex flex-wrap gap-1 min-h-[24px]">
                  {patient.clinicalInfo?.currentTreatment?.goals?.length > 0 ? 
                    patient.clinicalInfo.currentTreatment.goals.map((goal: string, index: number) => (
                      <Badge key={index} variant="default" className="text-xs">
                        {goal}
                      </Badge>
                    )) : 
                    <span className="text-foreground font-medium text-sm">No especificado</span>
                  }
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Duración esperada:</span>
                  <span className="text-foreground font-medium text-sm block">
                    {patient.clinicalInfo?.currentTreatment?.expectedDuration || 'No especificado'}
                  </span>
                </div>
                <div className="space-y-1">
                  <span className="text-sm text-muted-foreground">Frecuencia:</span>
                  <span className="text-foreground font-medium text-sm block">
                    {patient.clinicalInfo?.currentTreatment?.frequency ? 
                      formatFrequency(patient.clinicalInfo.currentTreatment.frequency) : 
                      'No especificado'
                    }
                  </span>
                </div>
              </div>
              {patient.clinicalInfo?.currentTreatment?.treatmentPlan && (
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">Plan de tratamiento:</span>
                  <RichTextEditor
                    content={patient.clinicalInfo.currentTreatment.treatmentPlan}
                    editable={false}
                    className="text-sm"
                  />
                </div>
              )}
              {patient.clinicalInfo?.currentTreatment?.notes && (
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground">Notas del tratamiento:</span>
                  <RichTextEditor
                    content={patient.clinicalInfo.currentTreatment.notes}
                    editable={false}
                    className="text-sm"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

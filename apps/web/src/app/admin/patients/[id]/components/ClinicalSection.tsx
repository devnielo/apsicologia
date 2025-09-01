'use client';

import { Button } from '../../../../../components/ui/button';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../components/ui/select';
import { Textarea } from '../../../../../components/ui/textarea';
import { RichTextEditor } from '../../../../../components/ui/rich-text-editor';
import { TagInput } from '../../../../../components/ui/tag-input';
import { Badge } from '../../../../../components/ui/badge';
import { DatePicker } from '../../../../../components/ui/date-picker';
import { Edit, Save, X, Heart, Pill, AlertTriangle, Stethoscope } from 'lucide-react';

const formatDate = (date: any) => {
  if (!date) return null;
  return new Date(date).toLocaleDateString('es-ES');
};

const stripHtml = (html: string) => {
  if (!html) return '';
  // Create a temporary div element to parse HTML
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || '';
};

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
  const setEditingSection = (section: string | null) => {
    if (section) {
      onEdit(section, {});
    } else {
      onCancel();
    }
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
              allergies: patient.clinicalInfo?.medicalHistory?.allergies?.map((a: any) => 
                typeof a === 'string' ? a : a.allergen || a.name || a
              ) || [],
              medications: patient.clinicalInfo?.medicalHistory?.medications?.map((m: any) => 
                typeof m === 'string' ? m : m.name || m.medication || m
              ) || [],
              surgeries: patient.clinicalInfo?.medicalHistory?.surgeries?.map((s: any) => 
                typeof s === 'string' ? s : s.procedure || s.name || s
              ) || [],
              notes: stripHtml(patient.clinicalInfo?.medicalHistory?.notes || '')
            })}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-3 w-3" />
          </Button>
        </div>
        <div className="px-1">
          {editingSection === 'medicalHistory' ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium text-foreground">Condiciones médicas</Label>
                  <TagInput
                    value={editData.conditions || []}
                    onChange={(conditions) => setEditData({...editData, conditions})}
                    placeholder="Introduce las condiciones médicas"
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-foreground">Alergias</Label>
                  <TagInput
                    value={editData.allergies || []}
                    onChange={(allergies) => setEditData({...editData, allergies})}
                    placeholder="Introduce las alergias"
                    className="mt-1 text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium text-foreground">Medicación actual</Label>
                  <TagInput
                    value={editData.medications || []}
                    onChange={(medications) => setEditData({...editData, medications})}
                    placeholder="Introduce la medicación actual"
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-foreground">Cirugías previas</Label>
                  <TagInput
                    value={editData.surgeries || []}
                    onChange={(surgeries) => setEditData({...editData, surgeries})}
                    placeholder="Introduce las cirugías previas"
                    className="mt-1 text-xs"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs font-medium text-foreground">Notas médicas</Label>
                <RichTextEditor
                  content={editData.notes || ''}
                  onChange={(notes) => setEditData({...editData, notes})}
                  placeholder="Introduce las notas médicas"
                  className="mt-1 text-xs"
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
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Condiciones:</span>
                <div className="flex flex-wrap gap-1">
                  {patient.clinicalInfo?.medicalHistory?.conditions?.length > 0 ? 
                    patient.clinicalInfo.medicalHistory.conditions.slice(0, 2).map((condition: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {condition}
                      </Badge>
                    )) : 
                    <>
                      <Badge variant="outline" className="text-xs">Ansiedad</Badge>
                      <Badge variant="outline" className="text-xs">Insomnio</Badge>
                    </>
                  }
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Alergias:</span>
                <div className="flex flex-wrap gap-1">
                  {patient.clinicalInfo?.medicalHistory?.allergies?.length > 0 ? 
                    patient.clinicalInfo.medicalHistory.allergies.slice(0, 2).map((allergy: any, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {typeof allergy === 'string' ? allergy : allergy.allergen || allergy.type || 'Alergia'}
                      </Badge>
                    )) : 
                    <>
                      <Badge variant="secondary" className="text-xs">Polen</Badge>
                      <Badge variant="secondary" className="text-xs">Penicilina</Badge>
                    </>
                  }
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Medicación:</span>
                <div className="flex flex-wrap gap-1">
                  {patient.clinicalInfo?.medicalHistory?.medications?.length > 0 ? 
                    patient.clinicalInfo.medicalHistory.medications.slice(0, 2).map((med: any, index: number) => (
                      <Badge key={index} variant="default" className="text-xs">
                        {med.name}
                      </Badge>
                    )) : 
                    <>
                      <Badge variant="default" className="text-xs">Sertralina</Badge>
                      <Badge variant="default" className="text-xs">Lorazepam</Badge>
                    </>
                  }
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Última revisión:</span>
                <span className="text-foreground font-medium">{formatDate(patient.clinicalInfo?.medicalHistory?.lastReview) || '15/08/2024'}</span>
              </div>
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
            onClick={() => onEdit('mentalHealth', {
              diagnoses: patient.clinicalInfo?.mentalHealthHistory?.diagnoses?.map((d: any) => 
                typeof d === 'string' ? d : d.condition || d.diagnosis || d
              ) || [],
              treatments: patient.clinicalInfo?.mentalHealthHistory?.previousTreatments?.map((t: any) => 
                typeof t === 'string' ? t : t.type || t.treatment || t.provider || t
              ) || [],
              currentStatus: patient.clinicalInfo?.mentalHealthHistory?.currentStatus || '',
              severity: patient.clinicalInfo?.mentalHealthHistory?.severity || '',
              mentalHealthNotes: stripHtml(patient.clinicalInfo?.mentalHealthHistory?.notes || '')
            })}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-3 w-3" />
          </Button>
        </div>
        <div className="px-1">
          {editingSection === 'mentalHealth' ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium text-foreground">Diagnósticos</Label>
                  <TagInput
                    value={editData.diagnoses || []}
                    onChange={(diagnoses) => setEditData({...editData, diagnoses})}
                    placeholder="Introduce los diagnósticos"
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-foreground">Tratamientos</Label>
                  <TagInput
                    value={editData.treatments || []}
                    onChange={(treatments) => setEditData({...editData, treatments})}
                    placeholder="Introduce los tratamientos"
                    className="mt-1 text-xs"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium text-foreground">Estado actual</Label>
                  <Select value={editData.currentStatus || ''} onValueChange={(value) => setEditData({...editData, currentStatus: value})}>
                    <SelectTrigger className="mt-1 h-8 text-xs">
                      <SelectValue placeholder="Introduce el estado actual" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">En tratamiento</SelectItem>
                      <SelectItem value="stable">Estable</SelectItem>
                      <SelectItem value="improving">Mejorando</SelectItem>
                      <SelectItem value="critical">Crítico</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-medium text-foreground">Severidad</Label>
                  <Select value={editData.severity || ''} onValueChange={(value) => setEditData({...editData, severity: value})}>
                    <SelectTrigger className="mt-1 h-8 text-xs">
                      <SelectValue placeholder="Introduce la severidad" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mild">Leve</SelectItem>
                      <SelectItem value="moderate">Moderado</SelectItem>
                      <SelectItem value="severe">Severo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs font-medium text-foreground">Notas de salud mental</Label>
                <RichTextEditor
                  content={editData.mentalHealthNotes || ''}
                  onChange={(mentalHealthNotes) => setEditData({...editData, mentalHealthNotes})}
                  placeholder="Introduce las observaciones de salud mental"
                  className="mt-1 text-xs"
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
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Diagnósticos:</span>
                <div className="flex flex-wrap gap-1">
                  {patient.clinicalInfo?.mentalHealthHistory?.diagnoses?.length > 0 ? 
                    patient.clinicalInfo.mentalHealthHistory.diagnoses.slice(0, 2).map((diagnosis: any, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {diagnosis.condition || diagnosis}
                      </Badge>
                    )) : 
                    <>
                      <Badge variant="outline" className="text-xs">Trastorno de ansiedad</Badge>
                      <Badge variant="outline" className="text-xs">Depresión leve</Badge>
                    </>
                  }
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Tratamientos:</span>
                <div className="flex flex-wrap gap-1">
                  {patient.clinicalInfo?.mentalHealthHistory?.treatments?.length > 0 ? 
                    patient.clinicalInfo.mentalHealthHistory.treatments.slice(0, 2).map((treatment: any, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {treatment.type || treatment}
                      </Badge>
                    )) : 
                    <>
                      <Badge variant="secondary" className="text-xs">Terapia cognitiva</Badge>
                      <Badge variant="secondary" className="text-xs">Mindfulness</Badge>
                    </>
                  }
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Estado actual:</span>
                <span className="text-foreground font-medium">
                  {patient.clinicalInfo?.mentalHealthHistory?.currentStatus || 'En tratamiento'}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Última evaluación:</span>
                <span className="text-foreground font-medium">
                  {formatDate(patient.clinicalInfo?.mentalHealthHistory?.lastEvaluation) || '10/08/2024'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Plan de Tratamiento */}
      <div className="pb-4 border-b border-border/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Pill className="h-4 w-4 text-primary" />
            Plan de Tratamiento
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit('treatmentPlan', {
              objectives: stripHtml(patient.clinicalInfo?.currentTreatment?.treatmentPlan || ''),
              estimatedDuration: patient.clinicalInfo?.currentTreatment?.expectedDuration || '',
              frequency: patient.clinicalInfo?.currentTreatment?.frequency || '',
              status: patient.clinicalInfo?.currentTreatment?.status || 'active',
              startDate: patient.clinicalInfo?.currentTreatment?.startDate || '',
              planNotes: stripHtml(patient.clinicalInfo?.currentTreatment?.notes || '')
            })}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-3 w-3" />
          </Button>
        </div>
        <div className="px-1">
          {editingSection === 'treatmentPlan' ? (
            <div className="space-y-3">
              <div>
                <Label className="text-xs font-medium text-foreground">Objetivos</Label>
                <RichTextEditor
                  content={editData.objectives || ''}
                  onChange={(objectives) => setEditData({...editData, objectives})}
                  placeholder="Introduce los objetivos del tratamiento"
                  className="mt-1 text-xs"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium text-foreground">Duración estimada</Label>
                  <Input
                    value={editData.estimatedDuration || ''}
                    onChange={(e) => setEditData({...editData, estimatedDuration: e.target.value})}
                    placeholder="Introduce la duración estimada"
                    className="mt-1 h-8 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-foreground">Frecuencia</Label>
                  <Select
                    value={editData.frequency || ''}
                    onValueChange={(frequency) => setEditData({...editData, frequency})}
                  >
                    <SelectTrigger className="mt-1 h-8 text-xs">
                      <SelectValue placeholder="Introduce la frecuencia" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="biweekly">Quincenal</SelectItem>
                      <SelectItem value="monthly">Mensual</SelectItem>
                      <SelectItem value="daily">Diario</SelectItem>
                      <SelectItem value="as-needed">Según necesidad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium text-foreground">Estado</Label>
                  <Select value={editData.status || ''} onValueChange={(value) => setEditData({...editData, status: value})}>
                    <SelectTrigger className="mt-1 h-8 text-xs">
                      <SelectValue placeholder="Introduce el estado del plan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="paused">Pausado</SelectItem>
                      <SelectItem value="completed">Completado</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-medium text-foreground">Fecha inicio</Label>
                  <DatePicker
                    date={editData.startDate ? new Date(editData.startDate) : undefined}
                    onDateChange={(date) => setEditData({...editData, startDate: date})}
                    placeholder="Introduce la fecha de inicio"
                    className="mt-1 h-8 text-xs w-full"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs font-medium text-foreground">Notas del plan</Label>
                <RichTextEditor
                  content={editData.planNotes || ''}
                  onChange={(planNotes) => setEditData({...editData, planNotes})}
                  placeholder="Introduce las notas del plan de tratamiento"
                  className="mt-1 text-xs"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={() => onSave('treatmentPlan')} size="sm" className="h-7 text-xs">
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
              <div>
                <span className="text-xs font-medium text-muted-foreground">Objetivos principales</span>
                <div className="mt-1 text-sm text-foreground">
                  {patient.clinicalInfo?.treatmentPlan?.objectives || 
                    'Reducir niveles de ansiedad mediante técnicas de relajación y reestructuración cognitiva. Mejorar patrones de sueño y establecer rutinas saludables.'}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Duración:</span>
                  <span className="text-foreground font-medium">
                    {patient.clinicalInfo?.treatmentPlan?.estimatedDuration || '6 meses'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Frecuencia:</span>
                  <span className="text-foreground font-medium">
                    {patient.clinicalInfo?.treatmentPlan?.frequency === 'weekly' ? 'Semanal' :
                     patient.clinicalInfo?.treatmentPlan?.frequency === 'biweekly' ? 'Quincenal' :
                     patient.clinicalInfo?.treatmentPlan?.frequency === 'monthly' ? 'Mensual' : 'Semanal'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Inicio:</span>
                  <span className="text-foreground font-medium">
                    {formatDate(patient.clinicalInfo?.treatmentPlan?.startDate) || '01/08/2024'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Estado:</span>
                  <Badge variant="default" className="text-xs">
                    {patient.clinicalInfo?.treatmentPlan?.status || 'Activo'}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

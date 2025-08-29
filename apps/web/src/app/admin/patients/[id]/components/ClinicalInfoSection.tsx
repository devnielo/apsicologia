'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Edit, Save, X, Heart, Activity, Pill, Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ClinicalInfoSectionProps {
  patient: any;
  editingSection: string | null;
  editData: any;
  onEdit: (section: string, data: any) => void;
  onSave: (section: string) => void;
  onCancel: () => void;
  setEditData: (data: any) => void;
  formatDate: (date: string | Date) => string;
}

export function ClinicalInfoSection({
  patient,
  editingSection,
  editData,
  onEdit,
  onSave,
  onCancel,
  setEditData,
  formatDate
}: ClinicalInfoSectionProps) {
  
  const addMedication = () => {
    const newMedication = {
      name: '',
      dosage: '',
      frequency: '',
      prescribedBy: '',
      startDate: new Date(),
      active: true,
      notes: ''
    };
    setEditData({
      ...editData,
      medicalHistory: {
        ...editData.medicalHistory,
        medications: [...(editData.medicalHistory?.medications || []), newMedication]
      }
    });
  };

  const removeMedication = (index: number) => {
    const medications = [...(editData.medicalHistory?.medications || [])];
    medications.splice(index, 1);
    setEditData({
      ...editData,
      medicalHistory: {
        ...editData.medicalHistory,
        medications
      }
    });
  };

  const updateMedication = (index: number, field: string, value: any) => {
    const medications = [...(editData.medicalHistory?.medications || [])];
    medications[index] = { ...medications[index], [field]: value };
    setEditData({
      ...editData,
      medicalHistory: {
        ...editData.medicalHistory,
        medications
      }
    });
  };

  const addAllergy = () => {
    const newAllergy = {
      type: 'medication',
      allergen: '',
      severity: 'mild',
      reaction: '',
      notes: ''
    };
    setEditData({
      ...editData,
      medicalHistory: {
        ...editData.medicalHistory,
        allergies: [...(editData.medicalHistory?.allergies || []), newAllergy]
      }
    });
  };

  const removeAllergy = (index: number) => {
    const allergies = [...(editData.medicalHistory?.allergies || [])];
    allergies.splice(index, 1);
    setEditData({
      ...editData,
      medicalHistory: {
        ...editData.medicalHistory,
        allergies
      }
    });
  };

  const updateAllergy = (index: number, field: string, value: any) => {
    const allergies = [...(editData.medicalHistory?.allergies || [])];
    allergies[index] = { ...allergies[index], [field]: value };
    setEditData({
      ...editData,
      medicalHistory: {
        ...editData.medicalHistory,
        allergies
      }
    });
  };

  const addDiagnosis = () => {
    const newDiagnosis = {
      condition: '',
      diagnosedBy: '',
      diagnosisDate: new Date(),
      icdCode: '',
      status: 'active',
      severity: 'mild',
      notes: ''
    };
    setEditData({
      ...editData,
      mentalHealthHistory: {
        ...editData.mentalHealthHistory,
        diagnoses: [...(editData.mentalHealthHistory?.diagnoses || []), newDiagnosis]
      }
    });
  };

  const removeDiagnosis = (index: number) => {
    const diagnoses = [...(editData.mentalHealthHistory?.diagnoses || [])];
    diagnoses.splice(index, 1);
    setEditData({
      ...editData,
      mentalHealthHistory: {
        ...editData.mentalHealthHistory,
        diagnoses
      }
    });
  };

  const updateDiagnosis = (index: number, field: string, value: any) => {
    const diagnoses = [...(editData.mentalHealthHistory?.diagnoses || [])];
    diagnoses[index] = { ...diagnoses[index], [field]: value };
    setEditData({
      ...editData,
      mentalHealthHistory: {
        ...editData.mentalHealthHistory,
        diagnoses
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Historial Médico */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Historial Médico
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit('medicalHistory', patient.clinicalInfo?.medicalHistory || {})}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {editingSection === 'medicalHistory' ? (
            <div className="space-y-6">
              {/* Condiciones Médicas */}
              <div>
                <Label>Condiciones Médicas</Label>
                <RichTextEditor
                  content={editData.conditions?.join(', ') || ''}
                  onChange={(content) => {
                    const conditions = content.split(',').map(c => c.trim()).filter(c => c);
                    setEditData({...editData, conditions});
                  }}
                  placeholder="Escribir condiciones médicas separadas por comas..."
                />
              </div>

              {/* Medicaciones */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>Medicaciones</Label>
                  <Button onClick={addMedication} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Medicación
                  </Button>
                </div>
                <div className="space-y-4">
                  {editData.medications?.map((medication: any, index: number) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Medicación {index + 1}</h4>
                        <Button
                          onClick={() => removeMedication(index)}
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Nombre</Label>
                          <Input
                            value={medication.name || ''}
                            onChange={(e) => updateMedication(index, 'name', e.target.value)}
                            placeholder="Nombre del medicamento"
                          />
                        </div>
                        <div>
                          <Label>Dosis</Label>
                          <Input
                            value={medication.dosage || ''}
                            onChange={(e) => updateMedication(index, 'dosage', e.target.value)}
                            placeholder="Ej: 10mg"
                          />
                        </div>
                        <div>
                          <Label>Frecuencia</Label>
                          <Input
                            value={medication.frequency || ''}
                            onChange={(e) => updateMedication(index, 'frequency', e.target.value)}
                            placeholder="Ej: 2 veces al día"
                          />
                        </div>
                        <div>
                          <Label>Prescrito por</Label>
                          <Input
                            value={medication.prescribedBy || ''}
                            onChange={(e) => updateMedication(index, 'prescribedBy', e.target.value)}
                            placeholder="Dr. Nombre"
                          />
                        </div>
                        <div>
                          <Label>Fecha de inicio</Label>
                          <Input
                            type="date"
                            value={medication.startDate ? new Date(medication.startDate).toISOString().split('T')[0] : ''}
                            onChange={(e) => updateMedication(index, 'startDate', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Estado</Label>
                          <Select 
                            value={medication.active ? 'active' : 'inactive'} 
                            onValueChange={(value) => updateMedication(index, 'active', value === 'active')}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Activo</SelectItem>
                              <SelectItem value="inactive">Inactivo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Label>Notas</Label>
                        <RichTextEditor
                          content={medication.notes || ''}
                          onChange={(content) => updateMedication(index, 'notes', content)}
                          placeholder="Notas adicionales..."
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Alergias */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>Alergias</Label>
                  <Button onClick={addAllergy} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Alergia
                  </Button>
                </div>
                <div className="space-y-4">
                  {editData.allergies?.map((allergy: any, index: number) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Alergia {index + 1}</h4>
                        <Button
                          onClick={() => removeAllergy(index)}
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Tipo</Label>
                          <Select 
                            value={allergy.type || 'medication'} 
                            onValueChange={(value) => updateAllergy(index, 'type', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="medication">Medicamento</SelectItem>
                              <SelectItem value="food">Alimento</SelectItem>
                              <SelectItem value="environmental">Ambiental</SelectItem>
                              <SelectItem value="other">Otro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Alérgeno</Label>
                          <Input
                            value={allergy.allergen || ''}
                            onChange={(e) => updateAllergy(index, 'allergen', e.target.value)}
                            placeholder="Nombre del alérgeno"
                          />
                        </div>
                        <div>
                          <Label>Severidad</Label>
                          <Select 
                            value={allergy.severity || 'mild'} 
                            onValueChange={(value) => updateAllergy(index, 'severity', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mild">Leve</SelectItem>
                              <SelectItem value="moderate">Moderada</SelectItem>
                              <SelectItem value="severe">Severa</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Reacción</Label>
                          <Input
                            value={allergy.reaction || ''}
                            onChange={(e) => updateAllergy(index, 'reaction', e.target.value)}
                            placeholder="Descripción de la reacción"
                          />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => onSave('medicalHistory')} size="sm">
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
                <label className="text-sm font-medium text-gray-500">Condiciones Médicas</label>
                <p className="text-gray-900">
                  {patient.clinicalInfo?.medicalHistory?.conditions?.length > 0 
                    ? patient.clinicalInfo.medicalHistory.conditions.join(', ')
                    : 'Ninguna registrada'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Medicaciones Activas</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {patient.clinicalInfo?.medicalHistory?.medications?.filter((med: any) => med.active).map((med: any, index: number) => (
                    <Badge key={index} variant="secondary">
                      {med.name} - {med.dosage}
                    </Badge>
                  )) || <span className="text-gray-900">Ninguna registrada</span>}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Alergias</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {patient.clinicalInfo?.medicalHistory?.allergies?.map((allergy: any, index: number) => (
                    <Badge key={index} variant={allergy.severity === 'severe' ? 'destructive' : 'secondary'}>
                      {allergy.allergen} ({allergy.severity})
                    </Badge>
                  )) || <span className="text-gray-900">Ninguna registrada</span>}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Salud Mental */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Salud Mental
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit('mentalHealthHistory', patient.clinicalInfo?.mentalHealthHistory || {})}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {editingSection === 'mentalHealthHistory' ? (
            <div className="space-y-6">
              {/* Diagnósticos */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>Diagnósticos</Label>
                  <Button onClick={addDiagnosis} size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Agregar Diagnóstico
                  </Button>
                </div>
                <div className="space-y-4">
                  {editData.diagnoses?.map((diagnosis: any, index: number) => (
                    <Card key={index} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Diagnóstico {index + 1}</h4>
                        <Button
                          onClick={() => removeDiagnosis(index)}
                          size="sm"
                          variant="ghost"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Condición</Label>
                          <Input
                            value={diagnosis.condition || ''}
                            onChange={(e) => updateDiagnosis(index, 'condition', e.target.value)}
                            placeholder="Nombre de la condición"
                          />
                        </div>
                        <div>
                          <Label>Diagnosticado por</Label>
                          <Input
                            value={diagnosis.diagnosedBy || ''}
                            onChange={(e) => updateDiagnosis(index, 'diagnosedBy', e.target.value)}
                            placeholder="Dr. Nombre"
                          />
                        </div>
                        <div>
                          <Label>Fecha de diagnóstico</Label>
                          <Input
                            type="date"
                            value={diagnosis.diagnosisDate ? new Date(diagnosis.diagnosisDate).toISOString().split('T')[0] : ''}
                            onChange={(e) => updateDiagnosis(index, 'diagnosisDate', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Código ICD</Label>
                          <Input
                            value={diagnosis.icdCode || ''}
                            onChange={(e) => updateDiagnosis(index, 'icdCode', e.target.value)}
                            placeholder="Ej: F32.1"
                          />
                        </div>
                        <div>
                          <Label>Estado</Label>
                          <Select 
                            value={diagnosis.status || 'active'} 
                            onValueChange={(value) => updateDiagnosis(index, 'status', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Activo</SelectItem>
                              <SelectItem value="resolved">Resuelto</SelectItem>
                              <SelectItem value="in-remission">En remisión</SelectItem>
                              <SelectItem value="chronic">Crónico</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Severidad</Label>
                          <Select 
                            value={diagnosis.severity || 'mild'} 
                            onValueChange={(value) => updateDiagnosis(index, 'severity', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mild">Leve</SelectItem>
                              <SelectItem value="moderate">Moderada</SelectItem>
                              <SelectItem value="severe">Severa</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Label>Notas</Label>
                        <RichTextEditor
                          content={diagnosis.notes || ''}
                          onChange={(content) => updateDiagnosis(index, 'notes', content)}
                          placeholder="Notas del diagnóstico..."
                        />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => onSave('mentalHealthHistory')} size="sm">
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
                <label className="text-sm font-medium text-gray-500">Diagnósticos Activos</label>
                <div className="flex flex-wrap gap-2 mt-1">
                  {patient.clinicalInfo?.mentalHealthHistory?.diagnoses?.filter((d: any) => d.status === 'active').map((diagnosis: any, index: number) => (
                    <Badge key={index} variant="outline">
                      {diagnosis.condition} ({diagnosis.severity})
                    </Badge>
                  )) || <span className="text-gray-900">Ninguno registrado</span>}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tratamiento Actual */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <Pill className="h-5 w-5" />
            Tratamiento Actual
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit('currentTreatment', patient.clinicalInfo?.currentTreatment || {})}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {editingSection === 'currentTreatment' ? (
            <div className="space-y-4">
              <div>
                <Label>Plan de Tratamiento</Label>
                <RichTextEditor
                  content={editData.treatmentPlan || ''}
                  onChange={(content) => setEditData({...editData, treatmentPlan: content})}
                  placeholder="Describir el plan de tratamiento..."
                />
              </div>
              <div>
                <Label>Objetivos</Label>
                <RichTextEditor
                  content={editData.goals?.join('\n') || ''}
                  onChange={(content) => {
                    const goals = content.split('\n').filter(g => g.trim());
                    setEditData({...editData, goals});
                  }}
                  placeholder="Objetivos del tratamiento (uno por línea)..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Fecha de inicio</Label>
                  <Input
                    type="date"
                    value={editData.startDate ? new Date(editData.startDate).toISOString().split('T')[0] : ''}
                    onChange={(e) => setEditData({...editData, startDate: e.target.value})}
                  />
                </div>
                <div>
                  <Label>Duración esperada</Label>
                  <Input
                    value={editData.expectedDuration || ''}
                    onChange={(e) => setEditData({...editData, expectedDuration: e.target.value})}
                    placeholder="Ej: 6 meses"
                  />
                </div>
              </div>
              <div>
                <Label>Frecuencia</Label>
                <Input
                  value={editData.frequency || ''}
                  onChange={(e) => setEditData({...editData, frequency: e.target.value})}
                  placeholder="Ej: Semanal"
                />
              </div>
              <div>
                <Label>Notas</Label>
                <RichTextEditor
                  content={editData.notes || ''}
                  onChange={(content) => setEditData({...editData, notes: content})}
                  placeholder="Notas adicionales del tratamiento..."
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={() => onSave('currentTreatment')} size="sm">
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
                <label className="text-sm font-medium text-gray-500">Plan de Tratamiento</label>
                <div className="text-gray-900 prose prose-sm max-w-none" 
                     dangerouslySetInnerHTML={{ __html: patient.clinicalInfo?.currentTreatment?.treatmentPlan || 'No especificado' }} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Objetivos</label>
                <ul className="text-gray-900 list-disc list-inside">
                  {patient.clinicalInfo?.currentTreatment?.goals?.map((goal: string, index: number) => (
                    <li key={index}>{goal}</li>
                  )) || <span>No especificados</span>}
                </ul>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Fecha de inicio</label>
                  <p className="text-gray-900">{formatDate(patient.clinicalInfo?.currentTreatment?.startDate) || 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Frecuencia</label>
                  <p className="text-gray-900">{patient.clinicalInfo?.currentTreatment?.frequency || 'No especificado'}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { Card, CardContent, CardHeader, CardTitle } from '../../../../../components/ui/card';
import { Button } from '../../../../../components/ui/button';
import { Input } from '../../../../../components/ui/input';
import { Label } from '../../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../../components/ui/select';
import { RichTextEditor } from '../../../../../components/ui/rich-text-editor';
import { TagInput } from '../../../../../components/ui/tag-input';
import { Badge } from '../../../../../components/ui/badge';
import { Edit, Save, X, Heart, Pill, AlertTriangle, Stethoscope } from 'lucide-react';

interface ClinicalSectionProps {
  patient: any;
  editingSection: string | null;
  editData: any;
  onEdit: (section: string, data: any) => void;
  onSave: (section: string) => void;
  onCancel: () => void;
  setEditData: (data: any) => void;
}

export function ClinicalSection({
  patient,
  editingSection,
  editData,
  onEdit,
  onSave,
  onCancel,
  setEditData
}: ClinicalSectionProps) {

  // Constantes para sugerencias predefinidas
  const conditionSuggestions = [
    'Ansiedad', 'Depresión', 'Estrés crónico', 'TOC', 'TDAH',
    'Fobias específicos', 'Trastorno bipolar', 'Esquizofrenia',
    'Trastorno límite de personalidad', 'Autismo', 'Trastorno alimentario',
    'Insomnio', 'Fibromialgia', 'Migraña', 'Tiroides',
    'Diabetes', 'HTA', 'Asma', 'Alergia', 'Enfermedad coronaria'
  ];

  const medicationSuggestions = [
    'Sertralina (50mg)', 'Escitalopram (20mg)', 'Paroxetina (20mg)',
    'Venlafaxina (75mg)', 'Fluoxetina (20mg)', 'Citalopram (20mg)',
    'Lorazepam (1mg)', 'Alprazolam (0.5mg)', 'Diazepam (5mg)',
    'Clonazepam (1mg)', 'Ibuprofeno (600mg)', 'Paracetamol (650mg)',
    'Omeprazol (20mg)', 'Pantoprazol (40mg)', 'Losartán (50mg)',
    'Amlodipino (10mg)', 'Simvastatina (20mg)', 'Metformina (500mg)'
  ];

  const allergySuggestions = [
    'Penicilina', 'Aspirina', 'Ibuprofeno', 'Paracetamol', 'Kétoprofeno',
    'Amoxicilina', 'Clavulánico', 'Eritromicina', 'Ácidos grasos', 'Huevos',
    'Leche', 'Cambia', 'Maní', 'Nueces', 'Frutos secos', 'Frutos rojos',
    'Polen', 'Ácaros', 'Gatos', 'Perros', 'Abejas', 'Vespa'
  ];

  const diagnosisSuggestions = [
    'Trastorno depresivo mayor', 'Trastorno de ansiedad generalizada',
    'Fobia social', 'TOC (trastorno obsesivo compulsivo)', 'TDAH',
    'Trastorno bipolar tipo I', 'Trastorno bipolar tipo II',
    'Trastorno límite de personalidad', 'Episodio depresivo recurrente',
    'Trastorno de pánico'
  ];

  const formatDate = (date: string | Date) => {
    if (!date) return 'No especificado';
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="space-y-3">
      {/* Historial Médico */}
      <Card className="medical-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2 text-foreground text-base">
            <Heart className="h-4 w-4 text-primary" />
            Historial Médico
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit('medicalHistory', patient.clinicalInfo?.medicalHistory || {
              conditions: [],
              medications: [],
              allergies: []
            })}
            className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {editingSection === 'medicalHistory' ? (
            <div className="space-y-4">
              {/* Condiciones médicas */}
              <div>
                <Label className="text-xs font-medium text-foreground">Condiciones médicas</Label>
                <TagInput
                  value={editData.conditions || []}
                  onChange={(conditions) => setEditData({...editData, conditions})}
                  placeholder="Añadir condición médica..."
                  suggestions={conditionSuggestions}
                  maxTags={12}
                  className="mt-1"
                />
              </div>

              {/* Alergias */}
              <div>
                <Label className="text-xs font-medium text-foreground">Alergias</Label>
                <TagInput
                  value={editData.allergies?.map((allergy: any) => allergy.allergen + ' (' + allergy.severity + ')') || []}
                  onChange={(allergiesData) => {
                    const processedAllergies = allergiesData.map(item => {
                      const match = item.match(/(.+)\s*\((.+)\)/);
                      return {
                        type: 'medication',
                        allergen: match ? match[1].trim() : item,
                        severity: match ? match[2].trim() : 'moderate',
                        reaction: '',
                        notes: ''
                      };
                    });
                    setEditData({...editData, allergies: processedAllergies});
                  }}
                  placeholder="Añadir alergia..."
                  suggestions={allergySuggestions}
                  maxTags={8}
                  className="mt-1"
                />
              </div>

              {/* Medicaciones */}
              <div>
                <Label className="text-xs font-medium text-foreground">Medicaciones actuales</Label>
                <TagInput
                  value={editData.medications?.map((med: any) => med.name + ' (' + med.dosage + ')') || []}
                  onChange={(medicationsData) => {
                    const processedMedications = medicationsData.map(item => {
                      const match = item.match(/(.+)\s*\((.+)\)/);
                      return {
                        name: match ? match[1].trim() : item,
                        dosage: match ? match[2].trim() : '',
                        frequency: 'Una vez al día',
                        prescribedBy: '',
                        startDate: new Date(),
                        active: true,
                        notes: ''
                      };
                    });
                    setEditData({...editData, medications: processedMedications});
                  }}
                  placeholder="Añadir medicación..."
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <Button onClick={() => onSave('medicalHistory')} size="sm" className="medical-button-primary h-7 text-xs">
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
              <div>
                <label className="text-xs font-medium text-muted-foreground">Condiciones</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {patient.clinicalInfo?.medicalHistory?.conditions?.map((condition: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs px-2 py-0">
                      {condition}
                    </Badge>
                  )) || <span className="text-muted-foreground text-xs">Ninguna</span>}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Cirugías</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {patient.clinicalInfo?.medicalHistory?.surgeries?.map((surgery: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs px-2 py-0">
                      {surgery}
                    </Badge>
                  )) || <span className="text-muted-foreground text-xs">Ninguna</span>}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Antecedentes</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {patient.clinicalInfo?.medicalHistory?.familyHistory?.map((history: string, index: number) => (
                    <Badge key={index} variant="outline" className="text-xs px-2 py-0">
                      {history}
                    </Badge>
                  )) || <span className="text-muted-foreground text-xs">Ninguno</span>}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Salud Mental */}
      <Card className="medical-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2 text-foreground text-base">
            <Stethoscope className="h-4 w-4 text-primary" />
            Salud Mental
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit('mentalHealth', patient.clinicalInfo?.mentalHealthHistory || {
              diagnoses: []
            })}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3 p-4">
          {editingSection === 'mentalHealth' ? (
            <div className="space-y-3">
              <div>
                <Label className="text-xs font-medium text-foreground">Diagnósticos</Label>
                <TagInput
                  value={editData.diagnoses?.map((d: any) => d.condition + ' (' + d.severity + ')') || []}
                  onChange={(diagnosesData) => {
                    const processedDiagnoses = diagnosesData.map(item => {
                      const match = item.match(/(.+)\s*\((.+)\)/);
                      return {
                        condition: match ? match[1].trim() : item,
                        severity: match ? match[2].trim() : 'moderate',
                        status: 'active',
                        diagnosedBy: '',
                        diagnosisDate: new Date(),
                        icdCode: '',
                        notes: ''
                      };
                    });
                    setEditData({...editData, diagnoses: processedDiagnoses});
                  }}
                  placeholder="Añadir diagnóstico..."
                  suggestions={diagnosisSuggestions}
                  maxTags={4}
                  className="mt-1 text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={() => onSave('mentalHealth')} size="sm" className="medical-button-primary h-7 text-xs">
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
              <div>
                <label className="text-xs font-medium text-muted-foreground">Diagnósticos</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {patient.clinicalInfo?.mentalHealthHistory?.diagnoses?.filter((d: any) => d.status === 'active')
                    .slice(0, 3)?.map((diagnosis: any, idx: number) => (
                    <Badge key={idx} variant="outline" className="text-xs px-2 py-0">
                      {diagnosis.condition}
                    </Badge>
                  )) || <span className="text-muted-foreground text-xs">Ninguno</span>}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notas Clínicas */}
      <Card className="medical-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2 text-foreground text-base">
            <Pill className="h-4 w-4 text-primary" />
            Notas Clínicas
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit('clinicalNotes', {
              notes: patient.clinicalInfo?.clinicalNotes || ''
            })}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          {editingSection === 'clinicalNotes' ? (
            <div className="space-y-4">
              <div>
                <Label className="text-xs font-medium text-foreground">Notas del profesional</Label>
                <RichTextEditor
                  content={editData.notes || ''}
                  onChange={(content) => setEditData({...editData, notes: content})}
                  placeholder="Escribir observaciones clínicas, evolución del paciente, etc..."
                  className="mt-1 min-h-[200px]"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={() => onSave('clinicalNotes')} size="sm" className="medical-button-primary h-7 text-xs">
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
            <div className="text-xs">
              {patient.clinicalInfo?.clinicalNotes ? (
                <div 
                  className="prose prose-xs max-w-none text-foreground"
                  dangerouslySetInnerHTML={{ __html: patient.clinicalInfo.clinicalNotes }}
                />
              ) : (
                <span className="text-muted-foreground italic">No hay notas registradas</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Plan de Tratamiento */}
      <Card className="medical-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2 text-foreground text-base">
            <AlertTriangle className="h-4 w-4 text-primary" />
            Plan de Tratamiento
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit('treatmentPlan', {
              plan: patient.clinicalInfo?.currentTreatment?.treatmentPlan || ''
            })}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          {editingSection === 'treatmentPlan' ? (
            <div className="space-y-3">
              <div>
                <Label className="text-xs font-medium text-foreground">Plan terapéutico</Label>
                <RichTextEditor
                  content={editData.plan || ''}
                  onChange={(content) => setEditData({...editData, plan: content})}
                  placeholder="Objetivos, técnicas, frecuencia..."
                  className="mt-1 min-h-[150px]"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={() => onSave('treatmentPlan')} size="sm" className="medical-button-primary h-7 text-xs">
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
            <div className="text-xs">
              {patient.clinicalInfo?.currentTreatment?.treatmentPlan ? (
                <div 
                  className="prose prose-xs max-w-none text-foreground"
                  dangerouslySetInnerHTML={{ __html: patient.clinicalInfo.currentTreatment.treatmentPlan }}
                />
              ) : (
                <span className="text-muted-foreground italic">No hay plan definido</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tratamiento Actual */}
      <Card className="medical-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2 text-foreground text-base">
            <Heart className="h-4 w-4 text-primary" />
            Tratamiento Actual
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit('currentTreatment', patient.clinicalInfo?.currentTreatment || {})}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-3 p-4">
          {editingSection === 'currentTreatment' ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium text-foreground">Frecuencia</Label>
                  <Select
                    value={editData.frequency || 'Semanal'}
                    onValueChange={(value) => setEditData({...editData, frequency: value})}
                  >
                    <SelectTrigger className="h-8 mt-1 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Semanal">Semanal</SelectItem>
                      <SelectItem value="Quincenal">Quincenal</SelectItem>
                      <SelectItem value="Mensual">Mensual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-medium text-foreground">Duración</Label>
                  <Input
                    value={editData.expectedDuration || ''}
                    onChange={(e) => setEditData({...editData, expectedDuration: e.target.value})}
                    placeholder="6 meses"
                    className="h-8 mt-1 text-xs"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs font-medium text-foreground">Objetivos</Label>
                <RichTextEditor
                  content={editData.goals?.join('\n') || ''}
                  onChange={(content) => {
                    const goals = content.split('\n').filter(g => g.trim());
                    setEditData({...editData, goals});
                  }}
                  placeholder="Objetivos del tratamiento..."
                  className="mt-1 min-h-[100px]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={() => onSave('currentTreatment')} size="sm" className="medical-button-primary h-7 text-xs">
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
                  <label className="text-xs font-medium text-muted-foreground">Frecuencia</label>
                  <p className="text-foreground text-sm">{patient.clinicalInfo?.currentTreatment?.frequency || 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Duración</label>
                  <p className="text-foreground text-sm">{patient.clinicalInfo?.currentTreatment?.expectedDuration || 'No especificada'}</p>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Objetivos</label>
                <p className="text-foreground text-sm">{patient.clinicalInfo?.currentTreatment?.goals?.slice(0, 2)?.join(' • ') || 'No especificados'}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
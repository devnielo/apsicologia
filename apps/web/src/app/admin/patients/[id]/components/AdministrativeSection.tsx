'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Edit, Save, X, CreditCard, Tag, BarChart3, FileText, Clock, Plus, Trash2, Shield } from 'lucide-react';

interface AdministrativeSectionProps {
  patient: any;
  editingSection: string | null;
  editData: any;
  onEdit: (section: string, data: any) => void;
  onSave: (section: string) => void;
  onCancel: () => void;
  setEditData: (data: any) => void;
}

export function AdministrativeSection({
  patient,
  editingSection,
  editData,
  onEdit,
  onSave,
  onCancel,
  setEditData
}: AdministrativeSectionProps) {

  const formatDate = (date: string | Date) => {
    if (!date) return 'No especificado';
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const addTag = () => {
    const newTag = { 
      name: '', 
      color: '#3b82f6', 
      category: 'general',
      addedBy: 'current-user-id', // This should be set from current user context
      addedDate: new Date()
    };
    setEditData({
      ...editData,
      tags: [...(editData.tags || []), newTag]
    });
  };

  const removeTag = (index: number) => {
    const tags = [...(editData.tags || [])];
    tags.splice(index, 1);
    setEditData({ ...editData, tags });
  };

  const updateTag = (index: number, field: string, value: any) => {
    const tags = [...(editData.tags || [])];
    tags[index] = { ...tags[index], [field]: value };
    setEditData({ ...editData, tags });
  };

  return (
    <div className="space-y-4">
      {/* Facturación */}
      <Card className="medical-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2 text-foreground text-base">
            <CreditCard className="h-4 w-4 text-primary" />
            Información de Facturación
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit('billing', patient.billing || {})}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          {editingSection === 'billing' ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium text-foreground">Método de pago</Label>
                  <Select 
                    value={editData.preferredPaymentMethod || 'cash'} 
                    onValueChange={(value) => setEditData({...editData, preferredPaymentMethod: value})}
                  >
                    <SelectTrigger className="h-8 mt-1 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Efectivo</SelectItem>
                      <SelectItem value="card">Tarjeta</SelectItem>
                      <SelectItem value="transfer">Transferencia</SelectItem>
                      <SelectItem value="insurance">Seguro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-medium text-foreground">Compañía seguro</Label>
                  <Input
                    value={editData.insuranceCompany || ''}
                    onChange={(e) => setEditData({...editData, insuranceCompany: e.target.value})}
                    placeholder="Compañía"
                    className="h-8 mt-1 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs font-medium text-foreground">Número póliza</Label>
                  <Input
                    value={editData.insurancePolicyNumber || ''}
                    onChange={(e) => setEditData({...editData, insurancePolicyNumber: e.target.value})}
                    placeholder="Número"
                    className="h-8 mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-foreground">ID Stripe</Label>
                  <Input
                    value={editData.stripeCustomerId || ''}
                    onChange={(e) => setEditData({...editData, stripeCustomerId: e.target.value})}
                    placeholder="cus_..."
                    className="h-8 mt-1 text-xs"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-medium text-foreground">Notas facturación</Label>
                <RichTextEditor
                  content={editData.billingNotes || ''}
                  onChange={(content) => setEditData({...editData, billingNotes: content})}
                  placeholder="Notas sobre facturación..."
                  className="mt-1 min-h-[100px]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={() => onSave('billing')} size="sm" className="medical-button-primary h-7 text-xs">
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
                  <label className="text-xs font-medium text-muted-foreground">Método pago</label>
                  <p className="text-foreground text-sm">{patient.billing?.preferredPaymentMethod || 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Compañía seguro</label>
                  <p className="text-foreground text-sm">{patient.billing?.insuranceCompany || 'No especificado'}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Número póliza</label>
                  <p className="text-foreground text-sm">{patient.billing?.insurancePolicyNumber || 'No especificado'}</p>
                </div>
                {patient.billing?.stripeCustomerId && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">ID Stripe</label>
                    <p className="text-foreground font-mono text-xs">{patient.billing.stripeCustomerId}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Etiquetas */}
      <Card className="medical-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2 text-foreground text-base">
            <Tag className="h-4 w-4 text-primary" />
            Etiquetas
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit('tags', patient.tags || [])}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          {editingSection === 'tags' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-foreground">Etiquetas del paciente</Label>
                <Button onClick={addTag} size="sm" variant="outline" className="h-7 text-xs">
                  <Plus className="h-3 w-3 mr-1" />
                  Agregar
                </Button>
              </div>
              
              <div className="space-y-2">
                {editData.map((tag: any, index: number) => (
                  <div key={index} className="flex items-center gap-2 p-2 border rounded-lg">
                    <div className="flex-1 grid grid-cols-3 gap-2">
                      <Input
                        value={tag.name || ''}
                        onChange={(e) => updateTag(index, 'name', e.target.value)}
                        placeholder="Nombre"
                        className="h-7 text-xs"
                      />
                      <Input
                        type="color"
                        value={tag.color || '#3b82f6'}
                        onChange={(e) => updateTag(index, 'color', e.target.value)}
                        className="h-7 w-12"
                      />
                      <Select 
                        value={tag.category || 'general'} 
                        onValueChange={(value) => updateTag(index, 'category', value)}
                      >
                        <SelectTrigger className="h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="clinical">Clínico</SelectItem>
                          <SelectItem value="administrative">Admin</SelectItem>
                          <SelectItem value="priority">Prioridad</SelectItem>
                          <SelectItem value="risk">Riesgo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={() => removeTag(index)}
                      size="sm"
                      variant="ghost"
                      className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                <Button onClick={() => onSave('tags')} size="sm" className="medical-button-primary h-7 text-xs">
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
            <div className="flex flex-wrap gap-1">
              {patient.tags?.map((tag: any, index: number) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs"
                  style={{ backgroundColor: tag.color + '20', color: tag.color, borderColor: tag.color }}
                >
                  {tag.name}
                </Badge>
              )) || <span className="text-muted-foreground text-xs">No hay etiquetas asignadas</span>}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <Card className="medical-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-foreground text-base">
            <BarChart3 className="h-4 w-4 text-primary" />
            Estadísticas
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="text-center">
              <div className="text-lg font-bold text-blue-600">
                {patient.statistics?.totalAppointments || 0}
              </div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-green-600">
                {patient.statistics?.completedAppointments || 0}
              </div>
              <div className="text-xs text-muted-foreground">Completadas</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-red-600">
                {patient.statistics?.cancelledAppointments || 0}
              </div>
              <div className="text-xs text-muted-foreground">Canceladas</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-orange-600">
                {patient.statistics?.noShowAppointments || 0}
              </div>
              <div className="text-xs text-muted-foreground">No Show</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-purple-600">
                €{patient.statistics?.totalPaidAmount || 0}
              </div>
              <div className="text-xs text-muted-foreground">Pagado</div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-muted-foreground">Primera cita:</span>
                <span className="ml-2 text-foreground">{formatDate(patient.statistics?.firstAppointment) || 'N/A'}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Última cita:</span>
                <span className="ml-2 text-foreground">{formatDate(patient.statistics?.lastAppointment) || 'N/A'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notas Administrativas */}
      <Card className="medical-card">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2 text-foreground text-base">
            <FileText className="h-4 w-4 text-primary" />
            Notas Administrativas
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit('administrativeNotes', patient.administrativeNotes || [])}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-3 w-3" />
          </Button>
        </CardHeader>
        <CardContent className="p-4">
          {editingSection === 'administrativeNotes' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-foreground">Notas administrativas</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const newNote = {
                      noteId: `note_${Date.now()}`,
                      content: '',
                      category: 'general',
                      createdBy: 'current-user-id',
                      createdAt: new Date(),
                      isPrivate: false
                    };
                    setEditData([...(editData || []), newNote]);
                  }}
                  className="h-7 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Añadir
                </Button>
              </div>
              
              <div className="space-y-2">
                {editData?.map((note: any, index: number) => (
                  <div key={index} className="p-2 border rounded space-y-2">
                    <div className="flex items-center gap-2">
                      <Select
                        value={note.category || 'general'}
                        onValueChange={(value) => {
                          const newNotes = [...(editData || [])];
                          newNotes[index] = { ...note, category: value };
                          setEditData(newNotes);
                        }}
                      >
                        <SelectTrigger className="w-32 h-7 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="billing">Facturación</SelectItem>
                          <SelectItem value="medical">Médico</SelectItem>
                          <SelectItem value="behavioral">Conductual</SelectItem>
                          <SelectItem value="administrative">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="text-xs text-muted-foreground flex-1">
                        {note.createdAt && new Date(note.createdAt).toLocaleDateString()}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newNotes = editData?.filter((_: any, i: number) => i !== index) || [];
                          setEditData(newNotes);
                        }}
                        className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <RichTextEditor
                      content={note.content || ''}
                      onChange={(content) => {
                        const newNotes = [...(editData || [])];
                        newNotes[index] = { ...note, content };
                        setEditData(newNotes);
                      }}
                      placeholder="Contenido de la nota..."
                      className="min-h-[80px]"
                    />
                  </div>
                ))}
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button onClick={() => onSave('administrativeNotes')} size="sm" className="medical-button-primary h-7 text-xs">
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
            <div>
              {patient.administrativeNotes?.length > 0 ? (
                <div className="space-y-2">
                  {patient.administrativeNotes.map((note: any, index: number) => (
                    <div key={index} className="p-2 border rounded">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline" className="text-xs">{note.category}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {note.createdAt && new Date(note.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div 
                        className="prose prose-xs max-w-none text-foreground"
                        dangerouslySetInnerHTML={{ __html: note.content }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-xs">No hay notas administrativas</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Auditoría */}
      <Card className="medical-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-foreground text-base">
            <Shield className="h-4 w-4 text-primary" />
            Información de Auditoría
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Creado:</span>
              <span className="text-foreground">{formatDate(patient.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Última actualización:</span>
              <span className="text-foreground">{formatDate(patient.updatedAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Estado:</span>
              <Badge variant={patient.status === 'active' ? 'default' : 'secondary'}>
                {patient.status === 'active' ? 'Activo' : 
                 patient.status === 'inactive' ? 'Inactivo' : 
                 patient.status === 'archived' ? 'Archivado' : patient.status}
              </Badge>
            </div>
            {patient.relationships?.length > 0 && (
              <div>
                <span className="text-muted-foreground">Relaciones:</span>
                <div className="mt-1">
                  {patient.relationships.map((rel: any, index: number) => (
                    <Badge key={index} variant="outline" className="mr-1">
                      {rel.type}: {rel.relatedPatientId}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {patient.referral && (
              <div>
                <span className="text-muted-foreground">Referido por:</span>
                <span className="ml-2 text-foreground">{patient.referral.source} - {patient.referral.referrerName}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

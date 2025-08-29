'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { Edit, Save, X, CreditCard, Tag, BarChart3, FileText, Clock, Plus, Trash2 } from 'lucide-react';

interface AdministrativeSectionProps {
  patient: any;
  editingSection: string | null;
  editData: any;
  onEdit: (section: string, data: any) => void;
  onSave: (section: string) => void;
  onCancel: () => void;
  setEditData: (data: any) => void;
  formatDate: (date: string | Date) => string;
}

export function AdministrativeSection({
  patient,
  editingSection,
  editData,
  onEdit,
  onSave,
  onCancel,
  setEditData,
  formatDate
}: AdministrativeSectionProps) {

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
    <div className="space-y-6">
      {/* Facturación */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Información de Facturación
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit('billing', patient.billing || {})}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {editingSection === 'billing' ? (
            <div className="space-y-4">
              <div>
                <Label>Método de pago preferido</Label>
                <Select 
                  value={editData.preferredPaymentMethod || 'cash'} 
                  onValueChange={(value) => setEditData({...editData, preferredPaymentMethod: value})}
                >
                  <SelectTrigger>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Compañía de seguro</Label>
                  <Input
                    value={editData.insuranceCompany || ''}
                    onChange={(e) => setEditData({...editData, insuranceCompany: e.target.value})}
                    placeholder="Nombre de la compañía"
                  />
                </div>
                <div>
                  <Label>Número de póliza</Label>
                  <Input
                    value={editData.insurancePolicyNumber || ''}
                    onChange={(e) => setEditData({...editData, insurancePolicyNumber: e.target.value})}
                    placeholder="Número de póliza"
                  />
                </div>
              </div>

              <div>
                <Label>ID de cliente Stripe</Label>
                <Input
                  value={editData.stripeCustomerId || ''}
                  onChange={(e) => setEditData({...editData, stripeCustomerId: e.target.value})}
                  placeholder="cus_..."
                />
              </div>

              <div>
                <Label>Notas de facturación</Label>
                <RichTextEditor
                  content={editData.billingNotes || ''}
                  onChange={(content) => setEditData({...editData, billingNotes: content})}
                  placeholder="Notas adicionales sobre facturación..."
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => onSave('billing')} size="sm">
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
                  <label className="text-sm font-medium text-gray-500">Método de pago preferido</label>
                  <p className="text-gray-900">{patient.billing?.preferredPaymentMethod || 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Compañía de seguro</label>
                  <p className="text-gray-900">{patient.billing?.insuranceCompany || 'No especificado'}</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Número de póliza</label>
                <p className="text-gray-900">{patient.billing?.insurancePolicyNumber || 'No especificado'}</p>
              </div>
              {patient.billing?.stripeCustomerId && (
                <div>
                  <label className="text-sm font-medium text-gray-500">ID Stripe</label>
                  <p className="text-gray-900 font-mono text-sm">{patient.billing.stripeCustomerId}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Etiquetas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Etiquetas
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit('tags', patient.tags || [])}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {editingSection === 'tags' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Etiquetas del paciente</Label>
                <Button onClick={addTag} size="sm" variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Etiqueta
                </Button>
              </div>
              
              <div className="space-y-3">
                {editData.map((tag: any, index: number) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="flex-1 grid grid-cols-3 gap-3">
                      <Input
                        value={tag.name || ''}
                        onChange={(e) => updateTag(index, 'name', e.target.value)}
                        placeholder="Nombre de la etiqueta"
                      />
                      <Input
                        type="color"
                        value={tag.color || '#3b82f6'}
                        onChange={(e) => updateTag(index, 'color', e.target.value)}
                      />
                      <Select 
                        value={tag.category || 'general'} 
                        onValueChange={(value) => updateTag(index, 'category', value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General</SelectItem>
                          <SelectItem value="clinical">Clínico</SelectItem>
                          <SelectItem value="administrative">Administrativo</SelectItem>
                          <SelectItem value="priority">Prioridad</SelectItem>
                          <SelectItem value="risk">Riesgo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="text-xs text-gray-500 min-w-20">
                      {tag.addedDate && new Date(tag.addedDate).toLocaleDateString()}
                    </div>
                    <Button
                      onClick={() => removeTag(index)}
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-4">
                <Button onClick={() => onSave('tags')} size="sm">
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
            <div>
              <div className="flex flex-wrap gap-2">
                {patient.tags?.map((tag: any, index: number) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    style={{ backgroundColor: tag.color + '20', color: tag.color, borderColor: tag.color }}
                  >
                    {tag.name}
                  </Badge>
                )) || <span className="text-gray-500">No hay etiquetas asignadas</span>}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Estadísticas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {patient.statistics?.totalAppointments || 0}
              </div>
              <div className="text-sm text-gray-500">Total Citas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {patient.statistics?.completedAppointments || 0}
              </div>
              <div className="text-sm text-gray-500">Completadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {patient.statistics?.cancelledAppointments || 0}
              </div>
              <div className="text-sm text-gray-500">Canceladas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {patient.statistics?.noShowAppointments || 0}
              </div>
              <div className="text-sm text-gray-500">No Presentadas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                €{patient.statistics?.totalPaidAmount || 0}
              </div>
              <div className="text-sm text-gray-500">Total Pagado</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Primera cita:</span>
                <span className="ml-2">{formatDate(patient.statistics?.firstAppointment) || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500">Última cita:</span>
                <span className="ml-2">{formatDate(patient.statistics?.lastAppointment) || 'N/A'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notas Administrativas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Notas Administrativas
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit('administrativeNotes', patient.administrativeNotes || [])}
            className="h-8 w-8 p-0"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {editingSection === 'administrativeNotes' ? (
            <div className="space-y-4">
              <div>
                <Label>Notas administrativas</Label>
                <div className="space-y-2">
                  {editData?.map((note: any, index: number) => (
                    <div key={index} className="p-3 border rounded space-y-2">
                      <div className="flex items-center gap-2">
                        <Select
                          value={note.category || 'general'}
                          onValueChange={(value) => {
                            const newNotes = [...(editData || [])];
                            newNotes[index] = { ...note, category: value };
                            setEditData(newNotes);
                          }}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="general">General</SelectItem>
                            <SelectItem value="billing">Facturación</SelectItem>
                            <SelectItem value="medical">Médico</SelectItem>
                            <SelectItem value="behavioral">Conductual</SelectItem>
                            <SelectItem value="administrative">Administrativo</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="text-xs text-gray-500 flex-1">
                          {note.createdAt && new Date(note.createdAt).toLocaleString()}
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newNotes = editData?.filter((_: any, i: number) => i !== index) || [];
                            setEditData(newNotes);
                          }}
                        >
                          <X className="h-4 w-4" />
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
                      />
                    </div>
                  ))}
                  <Button
                    type="button"
                    variant="outline"
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
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Añadir nota
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button onClick={() => onSave('administrativeNotes')} size="sm">
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
            <div>
              {patient.administrativeNotes?.length > 0 ? (
                <div className="space-y-3">
                  {patient.administrativeNotes.map((note: any, index: number) => (
                    <div key={index} className="p-3 border rounded">
                      <div className="flex items-center justify-between mb-2">
                        <Badge variant="outline">{note.category}</Badge>
                        <span className="text-xs text-gray-500">
                          {note.createdAt && new Date(note.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div 
                        className="prose prose-sm max-w-none text-gray-900"
                        dangerouslySetInnerHTML={{ __html: note.content }}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No hay notas administrativas</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Auditoría */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Información de Auditoría
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Creado:</span>
              <span>{formatDate(patient.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Última actualización:</span>
              <span>{formatDate(patient.updatedAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Estado:</span>
              <Badge variant={patient.status === 'active' ? 'default' : 'secondary'}>
                {patient.status === 'active' ? 'Activo' : 
                 patient.status === 'inactive' ? 'Inactivo' : 
                 patient.status === 'archived' ? 'Archivado' : patient.status}
              </Badge>
            </div>
            {patient.relationships?.length > 0 && (
              <div>
                <span className="text-gray-500">Relaciones:</span>
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
                <span className="text-gray-500">Referido por:</span>
                <span className="ml-2">{patient.referral.source} - {patient.referral.referrerName}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

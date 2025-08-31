'use client';

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
      <div className="pb-4 border-b border-border/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <CreditCard className="h-4 w-4 text-primary" />
            Información de Facturación
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit('billing', patient.billing || {})}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-3 w-3" />
          </Button>
        </div>
        <div className="px-1">
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
                <Button onClick={() => onSave('billing')} size="sm" className="h-7 text-xs">
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
                <span className="text-muted-foreground">Método pago:</span>
                <span className="text-foreground font-medium">{patient.billing?.preferredPaymentMethod || 'Efectivo'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Compañía seguro:</span>
                <span className="text-foreground font-medium">{patient.billing?.insuranceCompany || 'Sanitas'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Número póliza:</span>
                <span className="text-foreground font-medium">{patient.billing?.insurancePolicyNumber || 'POL-2024-789456'}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">ID Stripe:</span>
                <span className="text-foreground font-mono text-xs">{patient.billing?.stripeCustomerId || 'cus_abc123def456'}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Etiquetas */}
      <div className="pb-4 border-b border-border/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Tag className="h-4 w-4 text-primary" />
            Etiquetas
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit('tags', patient.tags || [])}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-3 w-3" />
          </Button>
        </div>
        <div className="px-1">
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
                <Button onClick={() => onSave('tags')} size="sm" className="h-7 text-xs">
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
            <div className="flex flex-wrap gap-1">
              {patient.tags?.length > 0 ? patient.tags.map((tag: any, index: number) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs"
                  style={{ backgroundColor: tag.color + '20', color: tag.color, borderColor: tag.color }}
                >
                  {tag.name}
                </Badge>
              )) : (
                <>
                  <Badge variant="secondary" className="text-xs" style={{ backgroundColor: '#3b82f620', color: '#3b82f6', borderColor: '#3b82f6' }}>Prioritario</Badge>
                  <Badge variant="secondary" className="text-xs" style={{ backgroundColor: '#10b98120', color: '#10b981', borderColor: '#10b981' }}>Activo</Badge>
                  <Badge variant="secondary" className="text-xs" style={{ backgroundColor: '#f59e0b20', color: '#f59e0b', borderColor: '#f59e0b' }}>Seguimiento</Badge>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Estadísticas */}
      <div className="pb-4 border-b border-border/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Estadísticas
          </h3>
        </div>
        <div className="px-1">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <div className="text-center">
              <div className="text-sm font-bold text-blue-600">
                {patient.statistics?.totalAppointments || 12}
              </div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-green-600">
                {patient.statistics?.completedAppointments || 8}
              </div>
              <div className="text-xs text-muted-foreground">Completadas</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-red-600">
                {patient.statistics?.cancelledAppointments || 2}
              </div>
              <div className="text-xs text-muted-foreground">Canceladas</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-orange-600">
                {patient.statistics?.noShowAppointments || 1}
              </div>
              <div className="text-xs text-muted-foreground">No Show</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-bold text-purple-600">
                €{patient.statistics?.totalPaidAmount || 480}
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
        </div>
      </div>

      {/* Notas Administrativas */}
      <div className="pb-4 border-b border-border/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            Notas Administrativas
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit('administrativeNotes', patient.administrativeNotes || [])}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-3 w-3" />
          </Button>
        </div>
        <div className="px-1">
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
                <Button onClick={() => onSave('administrativeNotes')} size="sm" className="h-7 text-xs">
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
                <div className="space-y-2">
                  <div className="p-2 border rounded">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="text-xs">General</Badge>
                      <span className="text-xs text-muted-foreground">15/08/2024</span>
                    </div>
                    <div className="prose prose-xs max-w-none text-foreground">
                      <p>Paciente registrado en el sistema. Primera consulta programada para evaluación inicial.</p>
                    </div>
                  </div>
                  <div className="p-2 border rounded">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="text-xs">Facturación</Badge>
                      <span className="text-xs text-muted-foreground">20/08/2024</span>
                    </div>
                    <div className="prose prose-xs max-w-none text-foreground">
                      <p>Configuración de método de pago establecida. Seguro médico verificado y activo.</p>
                    </div>
                  </div>
                  <div className="p-2 border rounded">
                    <div className="flex items-center justify-between mb-1">
                      <Badge variant="outline" className="text-xs">Administrativo</Badge>
                      <span className="text-xs text-muted-foreground">25/08/2024</span>
                    </div>
                    <div className="prose prose-xs max-w-none text-foreground">
                      <p>Documentación GDPR completada. Consentimientos firmados y archivados correctamente.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Auditoría */}
      <div className="pb-4 border-b border-border/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            Información de Auditoría
          </h3>
        </div>
        <div className="px-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Creado:</span>
              <span className="text-foreground font-medium">{formatDate(patient.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Actualizado:</span>
              <span className="text-foreground font-medium">{formatDate(patient.updatedAt)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Estado:</span>
              <Badge variant={patient.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                {patient.status === 'active' ? 'Activo' : 
                 patient.status === 'inactive' ? 'Inactivo' : 
                 patient.status === 'archived' ? 'Archivado' : patient.status || 'Activo'}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">ID Sistema:</span>
              <span className="text-foreground font-mono text-xs">{patient.id?.toString().toUpperCase() || 'PAT-2024-001'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Versión:</span>
              <span className="text-foreground font-medium">{patient.__v !== undefined ? `v${patient.__v}` : 'v1'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Sincronización:</span>
              <span className="text-foreground font-medium">{formatDate(patient.updatedAt)}</span>
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
              <div className="space-y-1">
                <div>
                  <span className="text-muted-foreground">Fuente de referencia:</span>
                  <span className="ml-2 text-foreground capitalize">{patient.referral.source}</span>
                </div>
                {patient.referral.referringPerson && (
                  <div>
                    <span className="text-muted-foreground">Referido por:</span>
                    <span className="ml-2 text-foreground">{patient.referral.referringPerson}</span>
                  </div>
                )}
                {patient.referral.referringPhysician?.name && (
                  <div>
                    <span className="text-muted-foreground">Médico referente:</span>
                    <span className="ml-2 text-foreground">{patient.referral.referringPhysician.name}</span>
                    {patient.referral.referringPhysician.specialty && (
                      <span className="text-muted-foreground"> ({patient.referral.referringPhysician.specialty})</span>
                    )}
                  </div>
                )}
                {patient.referral.referralReason && (
                  <div>
                    <span className="text-muted-foreground">Motivo:</span>
                    <span className="ml-2 text-foreground">{patient.referral.referralReason}</span>
                  </div>
                )}
                {patient.referral.referralDate && (
                  <div>
                    <span className="text-muted-foreground">Fecha de referencia:</span>
                    <span className="ml-2 text-foreground">{formatDate(patient.referral.referralDate)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

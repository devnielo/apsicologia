'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { 
  Edit, Save, X, CreditCard, Tag, BarChart3, FileText, Clock, Plus, Trash2, Shield, 
  ExternalLink, Eye, Users, Calendar, AlertTriangle, Database, Activity, Settings,
  FileCheck, UserCheck, Lock, History, Download, Upload
} from 'lucide-react';

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
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'discharged': return 'outline';
      case 'transferred': return 'secondary';
      case 'deceased': return 'destructive';
      case 'deleted': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      active: 'Activo',
      inactive: 'Inactivo',
      discharged: 'Alta médica',
      transferred: 'Transferido',
      deceased: 'Fallecido',
      deleted: 'Eliminado'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const addTag = () => {
    const newTags = [...(editData.tags || []), { name: '', color: '#3b82f6', description: '' }];
    setEditData({ ...editData, tags: newTags });
  };

  const removeTag = (index: number) => {
    const newTags = (editData.tags || []).filter((_: any, i: number) => i !== index);
    setEditData({ ...editData, tags: newTags });
  };

  const updateTag = (index: number, field: string, value: string) => {
    const newTags = [...(editData.tags || [])];
    newTags[index] = { ...newTags[index], [field]: value };
    setEditData({ ...editData, tags: newTags });
  };

  return (
    <div className="space-y-4">
      {/* Acciones Administrativas */}
      <div className="pb-4 border-b border-border/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Settings className="h-4 w-4 text-primary" />
            Acciones Administrativas
          </h3>
        </div>
        <div className="px-1">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button variant="outline" size="sm" className="justify-start h-8 text-xs">
              <History className="h-3 w-3 mr-2" />
              Ver Logs
              <ExternalLink className="h-3 w-3 ml-auto" />
            </Button>
            <Button variant="outline" size="sm" className="justify-start h-8 text-xs">
              <Eye className="h-3 w-3 mr-2" />
              Auditoría
              <ExternalLink className="h-3 w-3 ml-auto" />
            </Button>
            <Button variant="outline" size="sm" className="justify-start h-8 text-xs">
              <Download className="h-3 w-3 mr-2" />
              Exportar RGPD
              <ExternalLink className="h-3 w-3 ml-auto" />
            </Button>
            <Button variant="outline" size="sm" className="justify-start h-8 text-xs">
              <Database className="h-3 w-3 mr-2" />
              Backup Datos
              <ExternalLink className="h-3 w-3 ml-auto" />
            </Button>
          </div>
        </div>
      </div>

      {/* Estado del Sistema */}
      <div className="pb-4 border-b border-border/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Activity className="h-4 w-4 text-primary" />
            Estado del Sistema
          </h3>
        </div>
        <div className="px-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Estado:</span>
              <Badge variant={getStatusBadgeVariant(patient.status)} className="text-xs">
                {getStatusLabel(patient.status)}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Versión:</span>
              <span className="text-foreground font-mono text-xs">v{patient.version || 1}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Creado:</span>
              <span className="text-foreground font-medium">{formatDate(patient.createdAt)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Actualizado:</span>
              <span className="text-foreground font-medium">{formatDate(patient.updatedAt)}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Creado por:</span>
              <span className="text-foreground text-xs">{patient.createdBy?.firstName} {patient.createdBy?.lastName}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Modificado por:</span>
              <span className="text-foreground text-xs">{patient.lastModifiedBy?.firstName} {patient.lastModifiedBy?.lastName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* RGPD y Cumplimiento */}
      <div className="pb-4 border-b border-border/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Shield className="h-4 w-4 text-primary" />
            RGPD y Cumplimiento
          </h3>
        </div>
        <div className="px-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Consentimiento RGPD:</span>
              <Badge variant={patient.gdprConsent?.dataProcessing?.consented ? 'default' : 'destructive'} className="text-xs">
                {patient.gdprConsent?.dataProcessing?.consented ? 'Otorgado' : 'Pendiente'}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Fecha consentimiento:</span>
              <span className="text-foreground text-xs">{patient.gdprConsent?.dataProcessing?.consentDate ? formatDate(patient.gdprConsent.dataProcessing.consentDate) : 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Profesionales sanitarios:</span>
              <Badge variant={patient.gdprConsent?.dataSharing?.healthcareProfessionals ? 'default' : 'secondary'} className="text-xs">
                {patient.gdprConsent?.dataSharing?.healthcareProfessionals ? 'Autorizado' : 'No autorizado'}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Marketing:</span>
              <Badge variant={patient.gdprConsent?.marketingCommunications?.consented ? 'default' : 'secondary'} className="text-xs">
                {patient.gdprConsent?.marketingCommunications?.consented ? 'Autorizado' : 'No autorizado'}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Contactos emergencia:</span>
              <Badge variant={patient.gdprConsent?.dataSharing?.emergencyContacts ? 'default' : 'secondary'} className="text-xs">
                {patient.gdprConsent?.dataSharing?.emergencyContacts ? 'Autorizado' : 'No autorizado'}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Investigación:</span>
              <Badge variant={patient.gdprConsent?.dataSharing?.researchPurposes ? 'default' : 'secondary'} className="text-xs">
                {patient.gdprConsent?.dataSharing?.researchPurposes ? 'Autorizado' : 'No autorizado'}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Documentos de Consentimiento */}
      <div className="pb-4 border-b border-border/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-primary" />
            Documentos de Consentimiento
          </h3>
        </div>
        <div className="px-1">
          {patient.signedConsentDocuments?.length > 0 ? (
            <div className="space-y-2">
              {patient.signedConsentDocuments.map((doc: any, index: number) => (
                <div key={index} className="p-2 border rounded">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {doc.documentType === 'informed_consent' ? 'Consentimiento Informado' :
                         doc.documentType === 'privacy_policy' ? 'Política de Privacidad' :
                         doc.documentType === 'data_processing' ? 'Protección de Datos' :
                         doc.documentType === 'telehealth_consent' ? 'Telesalud' :
                         doc.documentTitle}
                      </Badge>
                      <Badge variant={doc.isActive ? 'default' : 'secondary'} className="text-xs">
                        {doc.isActive ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => {
                        // Generar enlace de descarga falso por ahora
                        const downloadUrl = `/api/files/download/${doc.documentId}?token=fake_token_${Date.now()}`;
                        window.open(downloadUrl, '_blank');
                      }}
                    >
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>Firmado: {doc.signedDate && new Date(doc.signedDate).toLocaleDateString('es-ES')}</span>
                      <span>Versión: {doc.documentVersion}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Método: {doc.signatureMethod === 'digital' ? 'Digital' : doc.signatureMethod}</span>
                      {doc.expirationDate && (
                        <span>Expira: {new Date(doc.expirationDate).toLocaleDateString('es-ES')}</span>
                      )}
                    </div>
                    {doc.notes && (
                      <div className="text-xs text-foreground mt-1">
                        {doc.notes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              <div className="p-2 border rounded">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">Consentimiento Informado</Badge>
                    <Badge variant="default" className="text-xs">Activo</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      const downloadUrl = `/api/files/download/consent_informed_${patient.id}?token=demo_token_${Date.now()}`;
                      window.open(downloadUrl, '_blank');
                    }}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Firmado: {new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES')}</span>
                    <span>Versión: 2.1</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Método: Digital</span>
                    <span>Expira: {new Date(Date.now() + 350 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES')}</span>
                  </div>
                  <div className="text-xs text-foreground mt-1">
                    Consentimiento firmado durante la primera consulta
                  </div>
                </div>
              </div>
              <div className="p-2 border rounded">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">Protección de Datos</Badge>
                    <Badge variant="default" className="text-xs">Activo</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                    onClick={() => {
                      const downloadUrl = `/api/files/download/gdpr_consent_${patient.id}?token=demo_token_${Date.now()}`;
                      window.open(downloadUrl, '_blank');
                    }}
                  >
                    <Download className="h-3 w-3" />
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex justify-between">
                    <span>Firmado: {new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES')}</span>
                    <span>Versión: 1.3</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Método: Digital</span>
                    <span>Expira: {new Date(Date.now() + 730 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES')}</span>
                  </div>
                  <div className="text-xs text-foreground mt-1">
                    Aceptación de política de privacidad actualizada GDPR
                  </div>
                </div>
              </div>
            </div>
          )}
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
                      <p>Configuración de método de pago establecida. Sistema de facturación configurado correctamente.</p>
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
    </div>
  );
}

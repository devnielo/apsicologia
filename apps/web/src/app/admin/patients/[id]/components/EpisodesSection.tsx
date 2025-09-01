'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { DatePicker } from '@/components/ui/date-picker';
import { Edit, Save, X, AlertCircle, Plus, Trash2, Clock } from 'lucide-react';

interface EpisodesSectionProps {
  patient: any;
  editingSection: string | null;
  editData: any;
  onEdit: (section: string, data: any) => void;
  onSave: (section: string) => void;
  onCancel: () => void;
  setEditData: (data: any) => void;
}

export function EpisodesSection({
  patient,
  editingSection,
  editData,
  onEdit,
  onSave,
  onCancel,
  setEditData
}: EpisodesSectionProps) {

  const formatDate = (date: string | Date) => {
    if (!date) return 'No especificado';
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatSeverity = (severity: string) => {
    const severityMap: { [key: string]: string } = {
      'mild': 'Leve',
      'moderate': 'Moderado',
      'severe': 'Severo'
    };
    return severityMap[severity] || severity;
  };

  const formatImpact = (impact: string) => {
    const impactMap: { [key: string]: string } = {
      'low': 'Bajo',
      'medium': 'Medio',
      'high': 'Alto'
    };
    return impactMap[impact] || impact;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'mild': return 'bg-green-100 text-green-800 border-green-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'severe': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const addEpisode = () => {
    const newEpisode = {
      date: new Date(),
      description: '',
      duration: '',
      severity: 'mild',
      impact: 'low',
      notes: ''
    };
    setEditData({
      ...editData,
      episodes: [...(editData.episodes || []), newEpisode]
    });
  };

  const removeEpisode = (index: number) => {
    const episodes = [...(editData.episodes || [])];
    episodes.splice(index, 1);
    setEditData({ ...editData, episodes });
  };

  const updateEpisode = (index: number, field: string, value: any) => {
    const episodes = [...(editData.episodes || [])];
    episodes[index] = { ...episodes[index], [field]: value };
    setEditData({ ...editData, episodes });
  };

  return (
    <div className="space-y-4">
      {/* Episodios */}
      <div className="pb-4 border-b border-border/30">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-primary" />
            Episodios Clínicos
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit('episodes', patient.episodes || [])}
            className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-3 w-3" />
          </Button>
        </div>
        <div className="px-1">
          {editingSection === 'episodes' ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-foreground">Episodios del paciente</Label>
                <Button 
                  onClick={addEpisode}
                  size="sm" 
                  variant="outline" 
                  className="h-7 text-xs"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Agregar
                </Button>
              </div>

              {(editData.episodes || []).map((episode: any, index: number) => (
                <div key={index} className="p-2 border rounded space-y-2 bg-muted/20">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-foreground">Episodio #{index + 1}</span>
                    <Button
                      onClick={() => removeEpisode(index)}
                      size="sm"
                      variant="ghost"
                      className="h-5 w-5 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-medium text-foreground">Fecha</Label>
                      <DatePicker
                        date={episode.date ? new Date(episode.date) : undefined}
                        onDateChange={(date) => updateEpisode(index, 'date', date)}
                        placeholder="Seleccionar fecha"
                        className="mt-1 h-8 text-xs w-full"
                      />
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-foreground">Duración</Label>
                      <Input
                        value={episode.duration || ''}
                        onChange={(e) => updateEpisode(index, 'duration', e.target.value)}
                        placeholder="Ej: 2 horas, 3 días"
                        className="mt-1 h-8 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs font-medium text-foreground">Severidad</Label>
                      <Select 
                        value={episode.severity || 'mild'} 
                        onValueChange={(value) => updateEpisode(index, 'severity', value)}
                      >
                        <SelectTrigger className="h-8 mt-1 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mild">Leve</SelectItem>
                          <SelectItem value="moderate">Moderado</SelectItem>
                          <SelectItem value="severe">Severo</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs font-medium text-foreground">Impacto</Label>
                      <Select 
                        value={episode.impact || 'low'} 
                        onValueChange={(value) => updateEpisode(index, 'impact', value)}
                      >
                        <SelectTrigger className="h-8 mt-1 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Bajo</SelectItem>
                          <SelectItem value="medium">Medio</SelectItem>
                          <SelectItem value="high">Alto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-foreground">Descripción</Label>
                    <Input
                      value={episode.description || ''}
                      onChange={(e) => updateEpisode(index, 'description', e.target.value)}
                      placeholder="Descripción del episodio"
                      className="mt-1 h-8 text-xs"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-foreground">Notas adicionales</Label>
                    <RichTextEditor
                      content={episode.notes || ''}
                      onChange={(value: string) => updateEpisode(index, 'notes', value)}
                      placeholder="Notas detalladas del episodio..."
                      className="mt-1 min-h-[80px] text-xs"
                    />
                  </div>
                </div>
              ))}

              <div className="flex gap-2 pt-2">
                <Button onClick={() => onSave('episodes')} size="sm" className="h-7 text-xs">
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
              {patient.episodes?.length > 0 ? (
                <div className="space-y-3">
                  {patient.episodes.map((episode: any, index: number) => (
                    <div key={index} className="p-3 border rounded-lg bg-muted/20">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium text-foreground">
                            {formatDate(episode.date)}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getSeverityColor(episode.severity)}`}
                          >
                            {formatSeverity(episode.severity)}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            Impacto {formatImpact(episode.impact)}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="space-y-1">
                        <p className="text-sm text-foreground font-medium">
                          {episode.description}
                        </p>
                        {episode.duration && (
                          <p className="text-xs text-muted-foreground">
                            Duración: {episode.duration}
                          </p>
                        )}
                        {episode.notes && (
                          <div 
                            className="text-xs text-muted-foreground prose prose-xs max-w-none mt-2"
                            dangerouslySetInnerHTML={{ __html: episode.notes }}
                          />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="p-2 border rounded bg-muted/20">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-medium text-foreground">12/08/2024</span>
                      </div>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs bg-yellow-100 text-yellow-800">Moderado</Badge>
                        <Badge variant="secondary" className="text-xs">Impacto Medio</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-foreground font-medium mb-1">Crisis de ansiedad durante reunión laboral</p>
                    <p className="text-xs text-muted-foreground">Duración: 45 minutos</p>
                  </div>
                  <div className="p-2 border rounded bg-muted/20">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs font-medium text-foreground">08/08/2024</span>
                      </div>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs bg-green-100 text-green-800">Leve</Badge>
                        <Badge variant="secondary" className="text-xs">Impacto Bajo</Badge>
                      </div>
                    </div>
                    <p className="text-xs text-foreground font-medium mb-1">Episodio de insomnio nocturno</p>
                    <p className="text-xs text-muted-foreground">Duración: 3 horas</p>
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

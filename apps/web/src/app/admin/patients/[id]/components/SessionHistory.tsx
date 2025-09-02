'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Calendar, 
  Clock, 
  Star, 
  Target, 
  TrendingUp, 
  Edit, 
  Eye,
  Plus,
  User
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { SESSION_TYPE_LABELS, MOOD_LEVEL_LABELS, SESSION_STATUS_LABELS } from '@apsicologia/shared/constants';

interface Session {
  sessionId: string;
  sessionNumber: number;
  date: string;
  duration: number;
  type: string;
  status?: string;
  professionalId: string;
  mood?: {
    before?: number;
    after?: number;
  };
  objectives?: string[];
  homework?: string;
  notes?: string;
  progress?: {
    rating?: number;
    observations?: string;
  };
}

interface SessionHistoryProps {
  patientId: string;
  sessions: Session[];
  onAddSession: () => void;
  onEditSession: (sessionId: string) => void;
}

function MoodIndicator({ mood, label }: { mood?: number; label: string }) {
  if (mood === undefined) return null;
  
  const getMoodColor = (value: number) => {
    if (value <= 3) return 'bg-red-500';
    if (value <= 6) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getMoodEmoji = (value: number) => {
    if (value <= 2) return '😢';
    if (value <= 4) return '😕';
    if (value <= 6) return '😐';
    if (value <= 8) return '🙂';
    return '😊';
  };

  const getMoodLabel = (value: number) => {
    const moodKey = Object.keys(MOOD_LEVEL_LABELS).find(key => 
      parseInt(key) === value
    );
    return moodKey ? MOOD_LEVEL_LABELS[parseInt(moodKey) as keyof typeof MOOD_LEVEL_LABELS] : `${value}/10`;
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-lg">{getMoodEmoji(mood)}</span>
      <div className="flex flex-col">
        <span className="text-xs text-muted-foreground">{label}</span>
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${getMoodColor(mood)}`} />
          <span className="text-sm font-medium" title={getMoodLabel(mood)}>{mood}/10</span>
        </div>
      </div>
    </div>
  );
}

export function SessionHistory({ patientId, sessions, onAddSession, onEditSession }: SessionHistoryProps) {
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No hay sesiones registradas</h3>
        <p className="text-muted-foreground mb-4">
          Comienza agregando la primera sesión de tratamiento
        </p>
        <Button onClick={onAddSession}>
          <Plus className="h-4 w-4 mr-2" />
          Agregar primera sesión
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {sessions.map((session) => (
          <div 
            key={session.sessionId} 
            className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <div className="flex items-center gap-3">
                  <h4 className="font-medium">
                    Sesión #{session.sessionNumber} - {SESSION_TYPE_LABELS[session.type as keyof typeof SESSION_TYPE_LABELS] || session.type}
                  </h4>
                  {session.status && (
                    <Badge variant={session.status === 'completed' ? 'default' : session.status === 'cancelled' ? 'destructive' : 'secondary'}>
                      {SESSION_STATUS_LABELS[session.status as keyof typeof SESSION_STATUS_LABELS] || session.status}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{format(new Date(session.date), "d MMM yyyy", { locale: es })}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{session.duration} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    <span>{session.progress?.rating || 0}/10</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <MoodIndicator mood={session.mood?.before} label="Antes" />
                <MoodIndicator mood={session.mood?.after} label="Después" />
                
                {session.objectives && session.objectives.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Target className="h-3 w-3 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {session.objectives.length} objetivo{session.objectives.length > 1 ? 's' : ''}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedSession(session)}
              >
                <Eye className="h-3 w-3 mr-1" />
                Ver
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditSession(session.sessionId)}
              >
                <Edit className="h-3 w-3 mr-1" />
                Editar
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Full-screen Session Detail Modal */}
      <Dialog open={!!selectedSession} onOpenChange={() => setSelectedSession(null)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full overflow-y-auto">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl">
              Sesión #{selectedSession?.sessionNumber} - {SESSION_TYPE_LABELS[selectedSession?.type as keyof typeof SESSION_TYPE_LABELS] || selectedSession?.type}
            </DialogTitle>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{selectedSession && format(new Date(selectedSession.date), "d 'de' MMMM, yyyy", { locale: es })}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{selectedSession?.duration} minutos</span>
              </div>
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>Dr. {selectedSession?.professionalId}</span>
              </div>
            </div>
          </DialogHeader>
          
          {selectedSession && (
            <div className="space-y-8 py-6">
              {/* Mood and Progress Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Estado de ánimo
                  </h4>
                  <div className="space-y-3 pl-7">
                    <MoodIndicator mood={selectedSession.mood?.before} label="Inicio" />
                    <MoodIndicator mood={selectedSession.mood?.after} label="Final" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium text-lg flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Progreso de la sesión
                  </h4>
                  <div className="pl-7">
                    <div className="flex items-center gap-2 mb-3">
                      <Star className="h-4 w-4 text-yellow-500" />
                      <span className="font-medium text-lg">{selectedSession.progress?.rating || 0}/10</span>
                    </div>
                    {selectedSession.progress?.observations && (
                      <p className="text-sm text-muted-foreground">
                        {selectedSession.progress.observations}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Objectives */}
              {selectedSession.objectives && selectedSession.objectives.length > 0 && (
                <div className="space-y-4">
                  <h4 className="font-medium text-lg flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Objetivos de la sesión
                  </h4>
                  <div className="flex flex-wrap gap-2 pl-7">
                    {selectedSession.objectives.map((objective, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {objective}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Homework */}
              {selectedSession.homework && (
                <div className="space-y-4">
                  <h4 className="font-medium text-lg">Tareas para casa</h4>
                  <div className="p-4 bg-muted/50 rounded-lg ml-7">
                    <p className="text-sm">{selectedSession.homework}</p>
                  </div>
                </div>
              )}

              {/* Session Notes */}
              {selectedSession.notes && (
                <div className="space-y-4">
                  <h4 className="font-medium text-lg">Notas de la sesión</h4>
                  <div className="border rounded-lg p-6 ml-7">
                    <RichTextEditor
                      content={selectedSession.notes}
                      editable={false}
                      className="min-h-[300px]"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button variant="outline" onClick={() => setSelectedSession(null)}>
                  Cerrar
                </Button>
                <Button onClick={() => {
                  setSelectedSession(null);
                  onEditSession(selectedSession.sessionId);
                }}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar sesión
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

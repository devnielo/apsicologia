'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useSessions } from '@/hooks/use-sessions';
import { SessionHistory } from './SessionHistory';
import SessionForm from './SessionForm';

interface SessionsSectionProps {
  patient: any;
  patientId: string;
}

export function SessionsSection({ patient, patientId }: SessionsSectionProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingSession, setEditingSession] = useState<any>(null);
  const { addSession, updateSession, isLoading } = useSessions(patientId);

  // Get sessions from patient data
  const sessions = patient?.clinicalInfo?.currentTreatment?.sessions || [];

  const handleAddSession = () => {
    setEditingSession(null);
    setShowForm(true);
  };

  const handleEditSession = (sessionId: string) => {
    const session = sessions.find((s: any) => s.sessionId === sessionId);
    if (session) {
      setEditingSession(session);
      setShowForm(true);
    }
  };

  const handleSaveSession = async (sessionData: any) => {
    try {
      if (editingSession) {
        // Update existing session
        await updateSession({
          sessionId: editingSession.sessionId,
          sessionData,
        });
      } else {
        // Add new session
        await addSession(sessionData);
      }
      setShowForm(false);
      setEditingSession(null);
    } catch (error) {
      // Error handling is done in the hook
      console.error('Session save error:', error);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingSession(null);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Historial de sesiones</h2>
            <p className="text-sm text-muted-foreground">
              Gestiona y revisa las sesiones de tratamiento del paciente
            </p>
          </div>
          <Button onClick={handleAddSession}>
            <Plus className="h-4 w-4 mr-2" />
            Nueva sesión
          </Button>
        </div>

        <SessionHistory
          patientId={patientId}
          sessions={sessions}
          onAddSession={handleAddSession}
          onEditSession={handleEditSession}
        />
      </div>

      {/* Full-screen Session Form Modal */}
      <Dialog open={showForm} onOpenChange={() => setShowForm(false)}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full overflow-y-auto">
          <DialogHeader className="border-b pb-4">
            <DialogTitle className="text-xl">
              {editingSession ? 'Editar sesión' : 'Nueva sesión'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-6">
            <SessionForm
              patientId={patientId}
              session={editingSession}
              onSave={handleSaveSession}
              onCancel={handleCancel}
              isLoading={isLoading}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

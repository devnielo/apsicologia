'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  AlertTriangle, 
  Trash2, 
  Shield, 
  FileText,
  Clock
} from 'lucide-react';
import { Patient } from '../types';

interface DeletePatientDialogProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onConfirm: (patient: Patient) => Promise<void>;
  isLoading?: boolean;
}

export function DeletePatientDialog({ 
  isOpen, 
  onClose, 
  patient, 
  onConfirm, 
  isLoading = false 
}: DeletePatientDialogProps) {
  const [confirmText, setConfirmText] = useState('');
  const [step, setStep] = useState<'warning' | 'confirm'>('warning');

  if (!patient) return null;

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleClose = () => {
    setConfirmText('');
    setStep('warning');
    onClose();
  };

  const handleContinue = () => {
    setStep('confirm');
  };

  const handleConfirm = async () => {
    if (confirmText === patient.personalInfo.fullName) {
      try {
        await onConfirm(patient);
        handleClose();
      } catch (error) {
        console.error('Error al eliminar paciente:', error);
      }
    }
  };

  const isConfirmValid = confirmText === patient.personalInfo.fullName;

  return (
    <AlertDialog open={isOpen} onOpenChange={handleClose}>
      <AlertDialogContent className="max-w-md">
        {step === 'warning' ? (
          <>
            <AlertDialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <AlertDialogTitle className="text-left">
                    Eliminar Paciente
                  </AlertDialogTitle>
                </div>
              </div>
              
              <AlertDialogDescription className="text-left space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage 
                      src={patient.personalInfo.profilePicture} 
                      alt={patient.personalInfo.fullName} 
                    />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
                      {getInitials(patient.personalInfo.firstName, patient.personalInfo.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-foreground">
                      {patient.personalInfo.fullName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      ID: {patient._id ? patient._id.slice(-8) : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-sm">
                    Estás a punto de eliminar permanentemente este paciente del sistema.
                  </p>
                  
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-amber-800">
                        <p className="font-medium mb-1">Esta acción es irreversible</p>
                        <ul className="space-y-1 list-disc list-inside">
                          <li>Se eliminará toda la información personal</li>
                          <li>Se perderá el historial clínico</li>
                          <li>Se eliminarán las citas asociadas</li>
                          <li>Los datos no se pueden recuperar</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-xs text-blue-800">
                        <p className="font-medium mb-1">Alternativas recomendadas</p>
                        <ul className="space-y-1 list-disc list-inside">
                          <li>Cambiar el estado a "Inactivo"</li>
                          <li>Archivar el paciente</li>
                          <li>Transferir a otro profesional</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleClose}>
                Cancelar
              </AlertDialogCancel>
              <Button 
                variant="destructive" 
                onClick={handleContinue}
                className="bg-destructive hover:bg-destructive/90"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Continuar
              </Button>
            </AlertDialogFooter>
          </>
        ) : (
          <>
            <AlertDialogHeader>
              <div className="flex items-center gap-3 mb-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                  <Trash2 className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <AlertDialogTitle className="text-left">
                    Confirmar Eliminación
                  </AlertDialogTitle>
                </div>
              </div>
              
              <AlertDialogDescription className="text-left space-y-4">
                <p className="text-sm">
                  Para confirmar la eliminación, escribe el nombre completo del paciente:
                </p>
                
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-sm font-mono font-medium text-center">
                    {patient.personalInfo.fullName}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-name" className="text-sm font-medium">
                    Nombre del paciente
                  </Label>
                  <Input
                    id="confirm-name"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="Escribe el nombre completo aquí"
                    className={`${
                      confirmText && !isConfirmValid 
                        ? 'border-destructive focus:border-destructive' 
                        : ''
                    }`}
                    autoComplete="off"
                  />
                  {confirmText && !isConfirmValid && (
                    <p className="text-xs text-destructive">
                      El nombre no coincide exactamente
                    </p>
                  )}
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-red-600" />
                    <p className="text-xs text-red-800 font-medium">
                      Esta acción se ejecutará inmediatamente y no se puede deshacer
                    </p>
                  </div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleClose}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirm}
                disabled={!isConfirmValid || isLoading}
                className="bg-destructive hover:bg-destructive/90 focus:ring-destructive"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Eliminando...
                  </>
                ) : (
                  <>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Eliminar Definitivamente
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
}

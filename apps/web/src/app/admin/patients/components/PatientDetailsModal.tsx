'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Heart, 
  FileText,
  Edit,
  X,
  Copy,
  ExternalLink,
  Clock,
  Shield,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Patient {
  _id: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    fullName: string;
    dateOfBirth: Date;
    age: number;
    gender: string;
    profilePicture?: string;
    idNumber?: string;
    nationality?: string;
    occupation?: string;
    maritalStatus?: string;
  };
  contactInfo: {
    email: string;
    phone: string;
    alternativePhone?: string;
    preferredContactMethod: string;
    address: {
      street: string;
      city: string;
      postalCode: string;
      state?: string;
      country: string;
    };
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  clinicalInfo?: {
    primaryProfessional?: string;
    assignedProfessionals?: string[];
    medicalHistory?: {
      conditions?: string[];
      medications?: string[];
      allergies?: string[];
    };
    mentalHealthHistory?: {
      previousTreatments?: string[];
      diagnoses?: string[];
    };
    currentTreatment?: {
      treatmentPlan?: string;
      goals?: string[];
      startDate?: Date;
      notes?: string;
    };
  };
  status: 'active' | 'inactive' | 'discharged' | 'transferred' | 'deceased';
  createdAt: Date;
  updatedAt: Date;
}

interface PatientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient | null;
  onEdit: (patient: Patient) => void;
}

const statusConfig = {
  active: { 
    label: 'Activo', 
    className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    icon: CheckCircle
  },
  inactive: { 
    label: 'Inactivo', 
    className: 'bg-slate-100 text-slate-800 border-slate-200',
    icon: Clock
  },
  discharged: { 
    label: 'Alta', 
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: CheckCircle
  },
  transferred: { 
    label: 'Transferido', 
    className: 'bg-amber-100 text-amber-800 border-amber-200',
    icon: ExternalLink
  },
  deceased: { 
    label: 'Fallecido', 
    className: 'bg-red-100 text-red-800 border-red-200',
    icon: AlertTriangle
  }
};

const genderConfig = {
  male: 'Masculino',
  female: 'Femenino',
  'non-binary': 'No binario',
  other: 'Otro',
  'prefer-not-to-say': 'Prefiere no decir'
};

const maritalStatusConfig = {
  single: 'Soltero/a',
  married: 'Casado/a',
  divorced: 'Divorciado/a',
  widowed: 'Viudo/a',
  separated: 'Separado/a',
  'domestic-partnership': 'Pareja de hecho'
};

const contactMethodConfig = {
  email: 'Email',
  phone: 'Teléfono',
  sms: 'SMS',
  whatsapp: 'WhatsApp'
};

export function PatientDetailsModal({ 
  isOpen, 
  onClose, 
  patient, 
  onEdit 
}: PatientDetailsModalProps) {
  const [activeTab, setActiveTab] = useState('personal');

  if (!patient) return null;

  const statusInfo = statusConfig[patient.status];
  const StatusIcon = statusInfo.icon;

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (date: Date) => {
    return format(new Date(date), 'dd/MM/yyyy', { locale: es });
  };

  const formatDateTime = (date: Date) => {
    return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: es });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const formatAddress = (address: Patient['contactInfo']['address']) => {
    const parts = [
      address.street,
      address.city,
      address.postalCode,
      address.state,
      address.country
    ].filter(Boolean);
    return parts.join(', ');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage 
                  src={patient.personalInfo.profilePicture} 
                  alt={patient.personalInfo.fullName} 
                />
                <AvatarFallback className="text-lg bg-gradient-to-br from-primary/20 to-primary/10">
                  {getInitials(patient.personalInfo.firstName, patient.personalInfo.lastName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-xl">
                  {patient.personalInfo.fullName}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-2">
                  <Badge className={statusInfo.className}>
                    <StatusIcon className="mr-1 h-3 w-3" />
                    {statusInfo.label}
                  </Badge>
                  <span>•</span>
                  <span>{patient.personalInfo.age} años</span>
                  <span>•</span>
                  <span>ID: {patient._id.slice(-8)}</span>
                </DialogDescription>
              </div>
            </div>
            <Button onClick={() => onEdit(patient)} size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Editar
            </Button>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Personal
            </TabsTrigger>
            <TabsTrigger value="contact" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Contacto
            </TabsTrigger>
            <TabsTrigger value="emergency" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Emergencia
            </TabsTrigger>
            <TabsTrigger value="clinical" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Clínico
            </TabsTrigger>
          </TabsList>

          {/* Información Personal */}
          <TabsContent value="personal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información Personal</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Nombre completo</label>
                      <p className="text-sm font-medium">{patient.personalInfo.fullName}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Fecha de nacimiento</label>
                      <p className="text-sm">{formatDate(patient.personalInfo.dateOfBirth)}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Edad</label>
                      <p className="text-sm">{patient.personalInfo.age} años</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Género</label>
                      <p className="text-sm">
                        {genderConfig[patient.personalInfo.gender as keyof typeof genderConfig] || patient.personalInfo.gender}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {patient.personalInfo.idNumber && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">DNI/NIE</label>
                        <div className="flex items-center gap-2">
                          <p className="text-sm">{patient.personalInfo.idNumber}</p>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => copyToClipboard(patient.personalInfo.idNumber!)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {patient.personalInfo.nationality && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Nacionalidad</label>
                        <p className="text-sm">{patient.personalInfo.nationality}</p>
                      </div>
                    )}
                    
                    {patient.personalInfo.occupation && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Profesión</label>
                        <p className="text-sm">{patient.personalInfo.occupation}</p>
                      </div>
                    )}
                    
                    {patient.personalInfo.maritalStatus && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Estado civil</label>
                        <p className="text-sm">
                          {maritalStatusConfig[patient.personalInfo.maritalStatus as keyof typeof maritalStatusConfig] || patient.personalInfo.maritalStatus}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Información de Contacto */}
          <TabsContent value="contact" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información de Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <div className="flex items-center gap-2">
                        <p className="text-sm">{patient.contactInfo.email}</p>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => copyToClipboard(patient.contactInfo.email)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => window.open(`mailto:${patient.contactInfo.email}`)}
                          className="h-6 w-6 p-0"
                        >
                          <Mail className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
                      <div className="flex items-center gap-2">
                        <p className="text-sm">{patient.contactInfo.phone}</p>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => copyToClipboard(patient.contactInfo.phone)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => window.open(`tel:${patient.contactInfo.phone}`)}
                          className="h-6 w-6 p-0"
                        >
                          <Phone className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {patient.contactInfo.alternativePhone && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Teléfono alternativo</label>
                        <div className="flex items-center gap-2">
                          <p className="text-sm">{patient.contactInfo.alternativePhone}</p>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => copyToClipboard(patient.contactInfo.alternativePhone!)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => window.open(`tel:${patient.contactInfo.alternativePhone}`)}
                            className="h-6 w-6 p-0"
                          >
                            <Phone className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Método de contacto preferido</label>
                      <p className="text-sm">
                        {contactMethodConfig[patient.contactInfo.preferredContactMethod as keyof typeof contactMethodConfig]}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Dirección</label>
                      <div className="flex items-start gap-2">
                        <div className="flex-1">
                          <p className="text-sm">{formatAddress(patient.contactInfo.address)}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => copyToClipboard(formatAddress(patient.contactInfo.address))}
                          className="h-6 w-6 p-0 mt-0.5"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(formatAddress(patient.contactInfo.address))}`)}
                          className="h-6 w-6 p-0 mt-0.5"
                        >
                          <MapPin className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Contacto de Emergencia */}
          <TabsContent value="emergency" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Contacto de Emergencia</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Nombre</label>
                      <p className="text-sm font-medium">{patient.emergencyContact.name}</p>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Relación</label>
                      <p className="text-sm">{patient.emergencyContact.relationship}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Teléfono</label>
                      <div className="flex items-center gap-2">
                        <p className="text-sm">{patient.emergencyContact.phone}</p>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => copyToClipboard(patient.emergencyContact.phone)}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => window.open(`tel:${patient.emergencyContact.phone}`)}
                          className="h-6 w-6 p-0"
                        >
                          <Phone className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    
                    {patient.emergencyContact.email && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Email</label>
                        <div className="flex items-center gap-2">
                          <p className="text-sm">{patient.emergencyContact.email}</p>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => copyToClipboard(patient.emergencyContact.email!)}
                            className="h-6 w-6 p-0"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => window.open(`mailto:${patient.emergencyContact.email}`)}
                            className="h-6 w-6 p-0"
                          >
                            <Mail className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Información Clínica */}
          <TabsContent value="clinical" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información Clínica</CardTitle>
                <CardDescription>
                  Historial médico y tratamiento actual
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {patient.clinicalInfo ? (
                  <div className="space-y-4">
                    {patient.clinicalInfo.currentTreatment && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Tratamiento Actual</h4>
                        <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                          {patient.clinicalInfo.currentTreatment.treatmentPlan && (
                            <div>
                              <label className="text-xs font-medium text-muted-foreground">Plan de tratamiento</label>
                              <p className="text-sm">{patient.clinicalInfo.currentTreatment.treatmentPlan}</p>
                            </div>
                          )}
                          {patient.clinicalInfo.currentTreatment.goals && patient.clinicalInfo.currentTreatment.goals.length > 0 && (
                            <div>
                              <label className="text-xs font-medium text-muted-foreground">Objetivos</label>
                              <ul className="text-sm list-disc list-inside">
                                {patient.clinicalInfo.currentTreatment.goals.map((goal, index) => (
                                  <li key={index}>{goal}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {patient.clinicalInfo.currentTreatment.startDate && (
                            <div>
                              <label className="text-xs font-medium text-muted-foreground">Fecha de inicio</label>
                              <p className="text-sm">{formatDate(patient.clinicalInfo.currentTreatment.startDate)}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {patient.clinicalInfo.medicalHistory && (
                      <div>
                        <h4 className="text-sm font-medium mb-2">Historial Médico</h4>
                        <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                          {patient.clinicalInfo.medicalHistory.conditions && patient.clinicalInfo.medicalHistory.conditions.length > 0 && (
                            <div>
                              <label className="text-xs font-medium text-muted-foreground">Condiciones médicas</label>
                              <ul className="text-sm list-disc list-inside">
                                {patient.clinicalInfo.medicalHistory.conditions.map((condition, index) => (
                                  <li key={index}>{condition}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {patient.clinicalInfo.medicalHistory.medications && patient.clinicalInfo.medicalHistory.medications.length > 0 && (
                            <div>
                              <label className="text-xs font-medium text-muted-foreground">Medicamentos</label>
                              <ul className="text-sm list-disc list-inside">
                                {patient.clinicalInfo.medicalHistory.medications.map((medication, index) => (
                                  <li key={index}>{medication}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {patient.clinicalInfo.medicalHistory.allergies && patient.clinicalInfo.medicalHistory.allergies.length > 0 && (
                            <div>
                              <label className="text-xs font-medium text-muted-foreground">Alergias</label>
                              <ul className="text-sm list-disc list-inside">
                                {patient.clinicalInfo.medicalHistory.allergies.map((allergy, index) => (
                                  <li key={index}>{allergy}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Sin información clínica</h3>
                    <p className="text-sm text-muted-foreground">
                      No hay información clínica registrada para este paciente.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Información del sistema */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>Creado: {formatDateTime(patient.createdAt)}</span>
                <span>Actualizado: {formatDateTime(patient.updatedAt)}</span>
              </div>
              <span>ID: {patient._id}</span>
            </div>
          </CardContent>
        </Card>

        {/* Botón de cerrar */}
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            <X className="mr-2 h-4 w-4" />
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

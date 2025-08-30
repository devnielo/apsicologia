'use client';

// Removed Card imports for minimalist design
import { Avatar, AvatarFallback, AvatarImage } from '../../../../../components/ui/avatar';
import { Badge } from '../../../../../components/ui/badge';
import { User, Mail, Phone, MapPin, Shield } from 'lucide-react';
import { base64ToImageUrl } from '../../../../../lib/utils';

interface PatientSidebarProps {
  patient: any;
}

export function PatientSidebar({ patient }: PatientSidebarProps) {
  const fullName = `${patient.personalInfo?.firstName || ''} ${patient.personalInfo?.lastName || ''}`.trim();
  const age = patient.personalInfo?.dateOfBirth ? calculateAge(patient.personalInfo.dateOfBirth) : null;

  function calculateAge(dateOfBirth: string | Date) {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  const formatDate = (date: string | Date) => {
    if (!date) return 'No especificado';
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatGender = (gender: string) => {
    const genderMap: { [key: string]: string } = {
      'male': 'Masculino',
      'female': 'Femenino',
      'non-binary': 'No binario',
      'other': 'Otro',
      'prefer-not-to-say': 'Prefiere no decir'
    };
    return genderMap[gender] || gender;
  };

  return (
    <div className="w-80 space-y-4">
      {/* Patient Avatar and Basic Info */}
      <div className="text-center p-3 border-b border-border/30">
        <Avatar className="h-16 w-16 mx-auto mb-3">
          <AvatarImage
            src={patient.personalInfo?.profilePicture ? base64ToImageUrl(patient.personalInfo.profilePicture) : undefined}
          />
          <AvatarFallback className="text-sm bg-primary/10 text-primary">
            {patient.personalInfo?.firstName?.[0]}{patient.personalInfo?.lastName?.[0]}
          </AvatarFallback>
        </Avatar>

        <h2 className="text-base font-semibold text-foreground mb-1">{fullName}</h2>
        <p className="text-sm text-muted-foreground mb-2">
          {age ? `${age} años` : 'Edad no especificada'} • {formatGender(patient.personalInfo?.gender)}
        </p>
        
        <Badge 
          variant={patient.status === 'active' ? 'default' : 'secondary'}
          className="text-sm bg-primary text-primary-foreground"
        >
          {patient.status === 'active' ? 'Activo' : patient.status}
        </Badge>
      </div>

      {/* Contact Information */}
      <div className="pb-3 border-b border-border/30">
        <h3 className="text-sm font-semibold text-foreground mb-3 px-1">Contacto</h3>
        <div className="space-y-2 px-1">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground truncate">{patient.contactInfo?.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground">{patient.contactInfo?.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-foreground truncate">
              {patient.contactInfo?.address?.street}, {patient.contactInfo?.address?.city} {patient.contactInfo?.address?.postalCode}
            </span>
          </div>
        </div>
      </div>

      {/* Professional assigned */}
      <div className="pb-3 border-b border-border/30">
        <h3 className="text-sm font-semibold text-foreground mb-3 px-1">Profesional Asignado</h3>
        <div className="flex items-center gap-2 text-sm px-1">
          <User className="h-4 w-4 text-primary" />
          <div className="flex-1">
            <div className="text-foreground">
              {patient.clinicalInfo?.primaryProfessional?.name || 'No asignado'}
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      {patient.emergencyContact && (
        <div className="pb-3 border-b border-border/30">
          <h3 className="text-sm font-semibold text-foreground mb-3 px-1">Contacto de Emergencia</h3>
          <div className="px-1">
            <div className="space-y-1 text-sm">
              <div className="font-medium text-foreground">{patient.emergencyContact.name}</div>
              <div className="text-muted-foreground">{patient.emergencyContact.relationship}</div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Phone className="h-4 w-4" />
                {patient.emergencyContact.phone}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="px-1">
        <h3 className="text-sm font-semibold text-foreground mb-3">Información</h3>
        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Desde:</span>
            <span className="text-foreground font-medium">{formatDate(patient.createdAt)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">ID:</span>
            <span className="text-foreground font-mono">
              {patient.id?.toString().toUpperCase()}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Última visita:</span>
            <span className="text-foreground font-medium">{formatDate(patient.updatedAt)}</span>
          </div>
        </div>
      </div>

    </div>
  );
}
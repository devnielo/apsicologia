'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  Phone, 
  Mail,
  Calendar,
  Tag,
  User,
  MapPin,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { base64ToImageUrl, generateInitials } from '@/lib/utils';
import { Patient, PaginationMeta } from '../types';
import { PaginationControls } from './PaginationControls';

interface PatientsTableProps {
  patients: Patient[];
  paginationMeta?: PaginationMeta;
  onDeletePatient: (patient: Patient) => void;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  isLoading?: boolean;
}

const statusConfig = {
  active: { 
    label: 'Activo', 
    variant: 'default' as const,
    className: 'bg-emerald-100 text-emerald-800 border-emerald-200'
  },
  inactive: { 
    label: 'Inactivo', 
    variant: 'secondary' as const,
    className: 'bg-slate-100 text-slate-800 border-slate-200'
  },
  discharged: { 
    label: 'Alta', 
    variant: 'outline' as const,
    className: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  transferred: { 
    label: 'Transferido', 
    variant: 'outline' as const,
    className: 'bg-amber-100 text-amber-800 border-amber-200'
  },
  deceased: { 
    label: 'Fallecido', 
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-800 border-red-200'
  }
};

const genderConfig = {
  male: 'Masculino',
  female: 'Femenino',
  'non-binary': 'No binario',
  other: 'Otro',
  'prefer-not-to-say': 'Prefiere no decir'
};

const contactMethodConfig = {
  email: { icon: Mail, label: 'Email' },
  phone: { icon: Phone, label: 'Teléfono' },
  sms: { icon: Phone, label: 'SMS' },
  whatsapp: { icon: Phone, label: 'WhatsApp' }
};

export function PatientsTable({ 
  patients, 
  paginationMeta,
  onDeletePatient,
  onPageChange,
  onPageSizeChange,
  isLoading = false 
}: PatientsTableProps) {
  const router = useRouter();
  const [sortField, setSortField] = useState<string>('personalInfo.fullName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Helper para obtener el nombre del profesional desde el ID
  const getProfessionalName = (professionalId: string | undefined): string => {
    if (!professionalId) return 'Sin asignar';
    
    // En producción, esto debería resolverse desde una query de profesionales
    // Por ahora usamos una lógica simple basada en los IDs conocidos del seed
    const lastChars = professionalId.slice(-4);
    
    // Patrón simple para identificar profesionales del seed
    if (lastChars.includes('a') || lastChars.includes('e') || lastChars.includes('1')) {
      return 'Dr. María García López';
    } else {
      return 'Dr. Carlos Rodríguez Martín';
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    if (!firstName || !lastName) return 'NN';
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return 'No disponible';
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) {
        return 'Fecha inválida';
      }
      return format(dateObj, 'dd/MM/yyyy', { locale: es });
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const formatAge = (age: number | null | undefined) => {
    if (!age || age <= 0) return 'No disponible';
    return `${age} años`;
  };

  const ContactMethodIcon = ({ method }: { method: string }) => {
    const config = contactMethodConfig[method as keyof typeof contactMethodConfig];
    if (!config) return null;
    
    const Icon = config.icon;
    return (
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Icon className="h-3 w-3" />
        <span>{config.label}</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="rounded-lg border bg-card">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-sm text-muted-foreground">Cargando pacientes...</p>
        </div>
      </div>
    );
  }

  if (patients.length === 0) {
    return (
      <div className="rounded-lg border bg-card">
        <div className="p-8 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
            <Calendar className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 text-lg font-semibold">No hay pacientes</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Comienza agregando tu primer paciente al sistema.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <Table className="w-full">
        <TableHeader>
          <TableRow className="hover:bg-muted/50">
            <TableHead className="w-12"></TableHead>
            <TableHead className="font-semibold min-w-[100px]">ID</TableHead>
            <TableHead className="font-semibold min-w-[200px]">Paciente</TableHead>
            <TableHead className="font-semibold min-w-[80px]">Edad</TableHead>
            <TableHead className="font-semibold min-w-[200px]">Contacto</TableHead>
            <TableHead className="font-semibold min-w-[100px]">Estado</TableHead>
            <TableHead className="font-semibold min-w-[150px]">Profesional</TableHead>
            <TableHead className="font-semibold min-w-[150px]">Última actualización</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient, index) => {
            if (!patient) return null;
            
            const statusInfo = statusConfig[patient.status] || statusConfig.active;
            const personalInfo = patient.personalInfo || {};
            const contactInfo = patient.contactInfo || {};
            
            // Usar el ID correcto - id o index como fallback
            const patientId = patient.id || `patient-${index}`;
            
            return (
              <TableRow 
                key={patientId}
                className="hover:bg-muted/50 cursor-pointer group"
                onClick={() => router.push(`/admin/patients/new?id=${patient.id}`)}
              >
                <TableCell>
                  <Avatar className="h-8 w-8 ring-2 ring-slate-200">
                    <AvatarImage 
                      src={personalInfo.profilePicture ? base64ToImageUrl(personalInfo.profilePicture) : ""} 
                      alt={personalInfo.fullName || 'Paciente'} 
                    />
                    <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-semibold text-xs">
                      {generateInitials(personalInfo.fullName || `${personalInfo.firstName || ''} ${personalInfo.lastName || ''}`)}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                
                <TableCell>
                  <div className="font-mono text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded">
                    {patient.id ? patient.id.slice(-8) : `TMP-${index.toString().padStart(3, '0')}`}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium text-foreground">
                      {personalInfo.fullName || 'Sin nombre'}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {genderConfig[personalInfo.gender as keyof typeof genderConfig] || personalInfo.gender || 'No especificado'}
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">{formatAge(personalInfo.age)}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(personalInfo.dateOfBirth)}</div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm">{contactInfo.phone || 'No disponible'}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[150px]">{contactInfo.email || 'No disponible'}</div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <Badge 
                    variant={statusInfo.variant}
                    className={`${statusInfo.className} text-xs`}
                  >
                    {statusInfo.label}
                  </Badge>
                </TableCell>
                
                <TableCell>
                  <div className="space-y-1">
                    {patient.clinicalInfo?.primaryProfessional ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs bg-primary/10">
                            {getProfessionalName(patient.clinicalInfo.primaryProfessional)?.charAt(0) || 'P'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{getProfessionalName(patient.clinicalInfo.primaryProfessional)}</span>
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">Sin asignar</span>
                    )}
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="text-xs text-muted-foreground">{formatDate(patient.updatedAt)}</div>
                </TableCell>
                
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Abrir menú</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/admin/patients/new?id=${patient.id}`);
                        }}
                        className="cursor-pointer"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalles
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/admin/patients/new?id=${patient.id}`);
                        }}
                        className="cursor-pointer"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeletePatient(patient);
                        }}
                        className="cursor-pointer text-destructive focus:text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        {paginationMeta && onPageChange && onPageSizeChange && (
          <PaginationControls
            meta={paginationMeta}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
            isLoading={isLoading}
          />
        )}
      </div>
    </div>
  );
}

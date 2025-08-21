'use client';

import { useState } from 'react';
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
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  Phone, 
  Mail,
  Calendar
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
  clinicalInfo?: any;
  status: 'active' | 'inactive' | 'discharged' | 'transferred' | 'deceased';
  createdAt: Date;
  updatedAt: Date;
}

interface PatientsTableProps {
  patients: Patient[];
  onViewPatient: (patient: Patient) => void;
  onEditPatient: (patient: Patient) => void;
  onDeletePatient: (patient: Patient) => void;
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
  onViewPatient, 
  onEditPatient, 
  onDeletePatient,
  isLoading = false 
}: PatientsTableProps) {
  const [sortField, setSortField] = useState<string>('personalInfo.fullName');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (date: Date) => {
    return format(new Date(date), 'dd/MM/yyyy', { locale: es });
  };

  const formatAge = (age: number) => {
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
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-muted/50">
            <TableHead className="w-12"></TableHead>
            <TableHead className="font-semibold">Paciente</TableHead>
            <TableHead className="font-semibold">Contacto</TableHead>
            <TableHead className="font-semibold">Edad</TableHead>
            <TableHead className="font-semibold">Estado</TableHead>
            <TableHead className="font-semibold">Última actualización</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => {
            const statusInfo = statusConfig[patient.status];
            
            return (
              <TableRow 
                key={patient._id} 
                className="hover:bg-muted/50 cursor-pointer group"
                onClick={() => onViewPatient(patient)}
              >
                <TableCell>
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={patient.personalInfo.profilePicture} 
                      alt={patient.personalInfo.fullName} 
                    />
                    <AvatarFallback className="text-xs bg-gradient-to-br from-primary/20 to-primary/10">
                      {getInitials(patient.personalInfo.firstName, patient.personalInfo.lastName)}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium text-foreground">
                      {patient.personalInfo.fullName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {genderConfig[patient.personalInfo.gender as keyof typeof genderConfig] || patient.personalInfo.gender}
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">{patient.contactInfo.phone}</div>
                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {patient.contactInfo.email}
                    </div>
                    <ContactMethodIcon method={patient.contactInfo.preferredContactMethod} />
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="space-y-1">
                    <div className="text-sm font-medium">
                      {formatAge(patient.personalInfo.age)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(patient.personalInfo.dateOfBirth)}
                    </div>
                  </div>
                </TableCell>
                
                <TableCell>
                  <Badge 
                    variant={statusInfo.variant}
                    className={statusInfo.className}
                  >
                    {statusInfo.label}
                  </Badge>
                </TableCell>
                
                <TableCell>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(patient.updatedAt)}
                  </div>
                </TableCell>
                
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Abrir menú</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewPatient(patient);
                        }}
                        className="cursor-pointer"
                      >
                        <Eye className="mr-2 h-4 w-4" />
                        Ver detalles
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditPatient(patient);
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
  );
}

'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef, createSortableHeader, ColumnFilterConfig } from '@/components/ui/advanced-data-table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar,
  User
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { base64ToImageUrl, generateInitials } from '@/lib/utils';
import { Patient } from '../types';

// Status configuration
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
  },
  deleted: { 
    label: 'Eliminado', 
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

// Helper functions
const getProfessionalInfo = (professional: any): { firstName: string; fullName: string; avatar: string } => {
  if (!professional) return { firstName: 'Sin asignar', fullName: 'Sin asignar', avatar: '' };
  
  // If professional is populated as an object, use its data
  if (typeof professional === 'object' && professional.name) {
    const name = professional.name;
    const nameParts = name.split(' ');
    
    // Skip titles like "Dr.", "Dra." and get the actual first name
    let firstName = nameParts[0];
    if (firstName === 'Dr.' || firstName === 'Dra.') {
      firstName = nameParts[1] || firstName;
    }
    
    return { 
      firstName, 
      fullName: name, 
      avatar: generateInitials(name) 
    };
  }
  
  // If professional is just an ID string, return placeholder
  return { firstName: 'Cargando...', fullName: 'Cargando...', avatar: '?' };
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

interface UsePatientColumnsProps {
  onDeletePatient: (patient: Patient) => void;
}

export function usePatientColumns({ onDeletePatient }: UsePatientColumnsProps) {
  const router = useRouter();

  const columns: ColumnDef<Patient>[] = useMemo(() => [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Seleccionar todos"
          className="translate-y-[2px]"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Seleccionar fila"
          className="translate-y-[2px]"
        />
      ),
      enableSorting: false,
      enableHiding: false,
      size: 140,
    },
    {
      accessorKey: 'id',
      header: 'ID',
      cell: ({ row }) => {
        const fullId = row.getValue('id') as string;
        if (!fullId) return <div className="font-mono text-xs text-muted-foreground">N/A</div>;
        
        return (
          <div className="font-mono text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded min-w-[80px]" title={fullId}>
            {fullId.slice(-8)}
          </div>
        );
      },
      size: 100,
    },
    {
      accessorKey: 'personalInfo.fullName',
      id: 'patient',
      header: createSortableHeader('Paciente'),
      cell: ({ row }) => {
        const patient = row.original;
        const personalInfo = patient.personalInfo || {};
        const fullName = personalInfo.fullName || `${personalInfo.firstName || ''} ${personalInfo.lastName || ''}`.trim() || 'Sin nombre';
        
        return (
          <div className="flex items-center gap-3 min-w-[200px]">
            <Avatar className="h-8 w-8 ring-2 ring-slate-200">
              <AvatarImage 
                src={personalInfo.profilePicture ? base64ToImageUrl(personalInfo.profilePicture) : ""} 
                alt={fullName} 
              />
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white font-semibold text-xs">
                {generateInitials(fullName)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <div className="font-medium text-foreground">{fullName}</div>
            </div>
          </div>
        );
      },
      filterFn: 'includesString',
      size: 250,
    },
    {
      accessorKey: 'personalInfo.age',
      id: 'age', 
      header: createSortableHeader('Edad'),
      cell: ({ row }) => {
        const personalInfo = row.original.personalInfo || {};
        return (
          <div className="space-y-1 min-w-[80px]">
            <div className="text-sm font-medium">{formatAge(personalInfo.age)}</div>
            <div className="text-xs text-muted-foreground">{formatDate(personalInfo.dateOfBirth)}</div>
          </div>
        );
      },
      size: 100,
    },
    {
      accessorKey: 'personalInfo.gender',
      id: 'gender',
      header: 'Género',
      cell: ({ row }) => {
        const gender = row.original.personalInfo?.gender;
        return (
          <div className="text-sm min-w-[100px]">
            {genderConfig[gender as keyof typeof genderConfig] || gender || 'No especificado'}
          </div>
        );
      },
      size: 120,
    },
    {
      accessorKey: 'contactInfo.phone',
      id: 'contact',
      header: 'Contacto',
      cell: ({ row }) => {
        const contactInfo = row.original.contactInfo || {};
        return (
          <div className="space-y-1 min-w-[150px]">
            <div className="text-sm">{contactInfo.phone || 'No disponible'}</div>
            <div className="text-xs text-muted-foreground truncate">
              {contactInfo.email || 'No disponible'}
            </div>
          </div>
        );
      },
      size: 180,
    },
    {
      accessorKey: 'status',
      id: 'status',
      header: 'Estado',
      cell: ({ row }) => {
        const status = row.getValue('status') as keyof typeof statusConfig;
        const statusInfo = statusConfig[status] || statusConfig.active;
        
        return (
          <Badge 
            variant={statusInfo.variant}
            className={`${statusInfo.className} text-xs min-w-[80px] justify-center`}
          >
            {statusInfo.label}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
      size: 100,
    },
    {
      accessorKey: 'clinicalInfo.primaryProfessional',
      id: 'professional',
      header: 'Profesional',
      cell: ({ row }) => {
        const primaryProfessional = row.original.clinicalInfo?.primaryProfessional;
        const professionalInfo = getProfessionalInfo(primaryProfessional);
        
        return (
          <div className="space-y-1 min-w-[120px]">
            {primaryProfessional ? (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6 ring-1 ring-primary/20">
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground font-semibold">
                    {professionalInfo.avatar}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium">{professionalInfo.firstName}</span>
              </div>
            ) : (
              <span className="text-muted-foreground text-sm">Sin asignar</span>
            )}
          </div>
        );
      },
      size: 140,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const patient = row.original;
        
        const handleViewPatient = (e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          router.push(`/admin/patients/${patient.id}`);
        };

        const handleEditPatient = (e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          router.push(`/admin/patients/${patient.id}/edit`);
        };

        const handleDeletePatient = (e: React.MouseEvent) => {
          e.preventDefault();
          e.stopPropagation();
          onDeletePatient(patient);
        };
        
        return (
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="h-8 w-8 p-0"
                >
                  <span className="sr-only">Abrir menú</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-[160px]">
                <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleViewPatient}
                  className="cursor-pointer"
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Ver detalles
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={handleEditPatient}
                  className="cursor-pointer"
                >
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleDeletePatient}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
      enableSorting: false,
      enableHiding: false,
      size: 60,
    },
  ], [onDeletePatient, router]);

  // Column filter configurations
  const columnFilterConfigs: Record<string, ColumnFilterConfig> = useMemo(() => ({
    'patient': {
      type: 'text',
      placeholder: 'Buscar por nombre...'
    },
    'age': {
      type: 'text',
      placeholder: 'Edad (ej: 25-65)'
    },
    'gender': {
      type: 'select',
      options: [
        { label: 'Masculino', value: 'male' },
        { label: 'Femenino', value: 'female' },
        { label: 'No binario', value: 'non-binary' },
        { label: 'Otro', value: 'other' },
        { label: 'Prefiere no decir', value: 'prefer-not-to-say' }
      ]
    },
    'contact': {
      type: 'text',
      placeholder: 'Teléfono o email...'
    },
    'status': {
      type: 'multiselect',
      options: [
        { label: 'Activo', value: 'active' },
        { label: 'Inactivo', value: 'inactive' },
        { label: 'Alta', value: 'discharged' },
        { label: 'Transferido', value: 'transferred' },
        { label: 'Fallecido', value: 'deceased' },
        { label: 'Eliminado', value: 'deleted' }
      ]
    },
  }), []);

  return { columns, columnFilterConfigs };
}

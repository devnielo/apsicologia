'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload,
  MoreVertical,
  Users,
  UserCheck,
  UserX,
  FileText,
  Settings,
  X
} from 'lucide-react';
import { PatientFilters } from '../types';

interface PatientsHeaderProps {
  totalPatients: number;
  onCreatePatient: () => void;
  filters: PatientFilters;
  onFiltersChange: (filters: PatientFilters) => void;
  onExport: () => Promise<void>;
  isExporting: boolean;
}

const statusOptions = [
  { value: 'all', label: 'Todos los estados' },
  { value: 'active', label: 'Activos' },
  { value: 'inactive', label: 'Inactivos' },
  { value: 'discharged', label: 'Alta médica' },
  { value: 'transferred', label: 'Transferidos' },
];

const genderOptions = [
  { value: 'all', label: 'Todos los géneros' },
  { value: 'male', label: 'Masculino' },
  { value: 'female', label: 'Femenino' },
  { value: 'non-binary', label: 'No binario' },
  { value: 'other', label: 'Otro' },
  { value: 'prefer-not-to-say', label: 'Prefiere no decir' },
];

export function PatientsHeader({
  totalPatients,
  onCreatePatient,
  filters,
  onFiltersChange,
  onExport,
  isExporting
}: PatientsHeaderProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const updateFilter = (key: keyof PatientFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFiltersChange({ search: '', status: 'all', gender: 'all', professionalId: undefined });
  };

  const hasActiveFilters = filters.search || (filters.status && filters.status !== 'all') || (filters.gender && filters.gender !== 'all') || filters.professionalId;

  return (
    <div className="space-y-6">
      {/* Título y estadísticas */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Gestión de Pacientes</h1>
              <p className="text-sm text-muted-foreground">
                Administra la información y el tratamiento de tus pacientes
              </p>
            </div>
          </div>
          
        </div>

        {/* Estadísticas y acciones principales */}
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Users className="mr-1 h-3 w-3" />
            {totalPatients} Pacientes
          </Badge>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onExport}
              disabled={isExporting}
            >
              <Download className="mr-2 h-4 w-4" />
              {isExporting ? 'Exportando...' : 'Exportar'}
            </Button>

            <Button onClick={onCreatePatient} className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Paciente
            </Button>
          </div>
        </div>
      </div>

      {/* Barra de búsqueda y filtros */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        {/* Búsqueda */}
        <div className="relative flex-1 max-w-md">
          <Search className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transition-colors ${
            isSearchFocused ? 'text-primary' : 'text-muted-foreground'
          }`} />
          <Input
            placeholder="Buscar pacientes por nombre, email o teléfono..."
            value={filters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className={`pl-9 transition-all duration-200 ${
              isSearchFocused 
                ? 'ring-2 ring-primary/20 border-primary/30' 
                : 'border-border'
            }`}
          />
        </div>

        {/* Filtros avanzados */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span>Filtrar:</span>
          </div>
          
          <Select value={filters.status || ''} onValueChange={(value) => updateFilter('status', value || undefined)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.gender || ''} onValueChange={(value) => updateFilter('gender', value || undefined)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Género" />
            </SelectTrigger>
            <SelectContent>
              {genderOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-8 px-2 text-xs"
            >
              <X className="mr-1 h-3 w-3" />
              Limpiar filtros
            </Button>
          )}
        </div>
      </div>

      {/* Indicador de filtros activos */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
          <Filter className="h-4 w-4" />
          <span>Filtros activos:</span>
          
          {filters.search && (
            <Badge variant="secondary" className="text-xs">
              Búsqueda: "{filters.search}"
            </Badge>
          )}
          
          {filters.status && (
            <Badge variant="secondary" className="text-xs">
              Estado: {statusOptions.find(s => s.value === filters.status)?.label}
            </Badge>
          )}
          
          {filters.gender && (
            <Badge variant="secondary" className="text-xs">
              Género: {genderOptions.find(g => g.value === filters.gender)?.label}
            </Badge>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-6 px-2 text-xs ml-2"
          >
            <X className="mr-1 h-3 w-3" />
            Limpiar todo
          </Button>
        </div>
      )}
    </div>
  );
}

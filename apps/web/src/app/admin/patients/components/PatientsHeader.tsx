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
  Settings
} from 'lucide-react';

interface PatientsHeaderProps {
  totalPatients: number;
  activePatients: number;
  onCreatePatient: () => void;
  onImportPatients: () => void;
  onExportPatients: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
  onBulkActions: () => void;
}

const statusOptions = [
  { value: 'all', label: 'Todos los estados', count: 0 },
  { value: 'active', label: 'Activos', count: 0 },
  { value: 'inactive', label: 'Inactivos', count: 0 },
  { value: 'discharged', label: 'Alta médica', count: 0 },
  { value: 'transferred', label: 'Transferidos', count: 0 },
];

export function PatientsHeader({
  totalPatients,
  activePatients,
  onCreatePatient,
  onImportPatients,
  onExportPatients,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onBulkActions
}: PatientsHeaderProps) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const inactivePatients = totalPatients - activePatients;

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
          
          {/* Estadísticas rápidas */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                <UserCheck className="mr-1 h-3 w-3" />
                {activePatients} Activos
              </Badge>
              <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                <UserX className="mr-1 h-3 w-3" />
                {inactivePatients} Inactivos
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Users className="mr-1 h-3 w-3" />
                {totalPatients} Total
              </Badge>
            </div>
          </div>
        </div>

        {/* Acciones principales */}
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="mr-2 h-4 w-4" />
                Más acciones
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Importar/Exportar</DropdownMenuLabel>
              <DropdownMenuItem onClick={onImportPatients} className="cursor-pointer">
                <Upload className="mr-2 h-4 w-4" />
                Importar pacientes
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onExportPatients} className="cursor-pointer">
                <Download className="mr-2 h-4 w-4" />
                Exportar datos
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Gestión masiva</DropdownMenuLabel>
              <DropdownMenuItem onClick={onBulkActions} className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Acciones masivas
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <FileText className="mr-2 h-4 w-4" />
                Generar reportes
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={onCreatePatient} className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Paciente
          </Button>
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
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className={`pl-9 transition-all duration-200 ${
              isSearchFocused 
                ? 'ring-2 ring-primary/20 border-primary/30' 
                : 'border-border'
            }`}
          />
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="h-4 w-4" />
            <span>Filtrar por:</span>
          </div>
          
          <Select value={statusFilter} onValueChange={onStatusFilterChange}>
            <SelectTrigger className="w-40">
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
        </div>
      </div>

      {/* Indicador de búsqueda activa */}
      {searchQuery && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Search className="h-4 w-4" />
          <span>
            Mostrando resultados para: <strong className="text-foreground">"{searchQuery}"</strong>
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onSearchChange('')}
            className="h-6 px-2 text-xs"
          >
            Limpiar
          </Button>
        </div>
      )}
    </div>
  );
}

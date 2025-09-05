'use client';

import { useState, useCallback, useMemo } from 'react';
import { Search, Filter, X, Eye, Edit, Trash2, UserPlus, Calendar, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import type { IProfessional } from '@shared/types/professional';
import { PaginationControls } from './PaginationControls';

interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ProfessionalsManagerProps {
  professionals: IProfessional[];
  pagination?: PaginationMeta;
  isLoading: boolean;
  searchTerm: string;
  statusFilter: string;
  specialtyFilter: string;
  onSearchChange: (term: string) => void;
  onStatusFilterChange: (status: string) => void;
  onSpecialtyFilterChange: (specialty: string) => void;
  onClearFilters: () => void;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onViewDetails: (professionalId: string) => void;
  onCreateNew: () => void;
}

export function ProfessionalsManager({
  professionals,
  pagination,
  isLoading,
  searchTerm,
  statusFilter,
  specialtyFilter,
  onSearchChange,
  onStatusFilterChange,
  onSpecialtyFilterChange,
  onClearFilters,
  onPageChange,
  onPageSizeChange,
  onViewDetails,
  onCreateNew,
}: ProfessionalsManagerProps) {
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Helper functions
  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'default',
      inactive: 'secondary',
      on_leave: 'outline',
      suspended: 'destructive',
    } as const;

    const labels = {
      active: 'Activo',
      inactive: 'Inactivo',
      on_leave: 'De baja',
      suspended: 'Suspendido',
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'secondary'}>
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const generateInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatExperience = (years?: number) => {
    if (!years) return 'N/A';
    return `${years} año${years !== 1 ? 's' : ''}`;
  };

  const formatRating = (rating?: number) => {
    if (!rating) return 'N/A';
    return (
      <div className="flex items-center gap-1">
        <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
        <span className="text-sm">{rating.toFixed(1)}</span>
      </div>
    );
  };

  // Get unique specialties for filter
  const availableSpecialties = useMemo(() => {
    const specialties = new Set<string>();
    professionals.forEach(prof => {
      prof.specialties.forEach(specialty => specialties.add(specialty));
    });
    return Array.from(specialties).sort();
  }, [professionals]);

  const hasActiveFilters = searchTerm || statusFilter !== 'all' || specialtyFilter !== 'all';

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading State */}
        <div className="bg-card border border-border rounded-lg">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <h3 className="text-base font-medium text-foreground">Profesionales</h3>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-card border border-border rounded-lg">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Gestión de Profesionales</h2>
          <Button onClick={onCreateNew} className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Nuevo Profesional
          </Button>
        </div>
        <div className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar profesionales..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={onStatusFilterChange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="inactive">Inactivo</SelectItem>
                  <SelectItem value="on_leave">De baja</SelectItem>
                  <SelectItem value="suspended">Suspendido</SelectItem>
                </SelectContent>
              </Select>

              <Select value={specialtyFilter} onValueChange={onSpecialtyFilterChange}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Especialidad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {availableSpecialties.map((specialty) => (
                    <SelectItem key={specialty} value={specialty}>
                      {specialty}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(searchTerm || statusFilter !== 'all' || specialtyFilter !== 'all') && (
                <Button variant="outline" onClick={onClearFilters} className="flex items-center gap-2">
                  <X className="h-4 w-4" />
                  Limpiar
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      {professionals.length === 0 ? (
        <div className="text-center py-8">
          <UserPlus className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No se encontraron profesionales</h3>
          <p className="text-muted-foreground mb-4">
            {hasActiveFilters 
              ? 'Intenta ajustar los filtros de búsqueda'
              : 'Comienza agregando tu primer profesional'
            }
          </p>
          {!hasActiveFilters && (
            <Button onClick={onCreateNew}>
              <UserPlus className="h-4 w-4 mr-2" />
              Crear Primer Profesional
            </Button>
          )}
        </div>
      ) : viewMode === 'table' ? (
        <div className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Profesional</TableHead>
                <TableHead>Especialidades</TableHead>
                <TableHead>Experiencia</TableHead>
                <TableHead>Pacientes</TableHead>
                <TableHead>Valoración</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {professionals.map((professional) => (
                <TableRow key={professional._id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={professional.avatar} />
                        <AvatarFallback>
                          {generateInitials(professional.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{professional.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {professional.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {professional.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {professional.specialties.slice(0, 2).map((specialty) => (
                        <Badge key={specialty} variant="outline" className="text-xs">
                          {specialty}
                        </Badge>
                      ))}
                      {professional.specialties.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{professional.specialties.length - 2}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatExperience(professional.yearsOfExperience)}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{professional.stats.activePatients} activos</div>
                      <div className="text-muted-foreground">
                        {professional.stats.totalPatients} total
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatRating(professional.stats.averageRating)}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {getStatusBadge(professional.status)}
                      {professional.isAcceptingNewPatients && (
                        <Badge variant="outline" className="text-xs block w-fit">
                          Acepta nuevos
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetails(professional._id)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {pagination && (
            <PaginationControls
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              pageSize={pagination.limit}
              totalItems={pagination.total}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
            />
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {professionals.map((professional) => (
              <div key={professional._id} className="bg-card border border-border rounded-lg hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={professional.avatar} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {generateInitials(professional.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{professional.name}</h3>
                        <p className="text-muted-foreground">{professional.title}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {getStatusBadge(professional.status)}
                          {professional.isAcceptingNewPatients && (
                            <Badge variant="outline" className="text-xs">
                              Acepta nuevos pacientes
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                          <span>Exp: {formatExperience(professional.yearsOfExperience)}</span>
                          <span>•</span>
                          <span>Pacientes: {professional.stats?.activePatients || 0}</span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            {formatRating(professional.stats?.averageRating)}
                          </div>
                        </div>
                        {professional.specialties && professional.specialties.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {professional.specialties.slice(0, 3).map((specialty, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                            {professional.specialties.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{professional.specialties.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetails(professional._id.toString())}
                        className="flex items-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Ver
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {pagination && (
            <PaginationControls
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              pageSize={pagination.limit}
              totalItems={pagination.total}
              onPageChange={onPageChange}
              onPageSizeChange={onPageSizeChange}
            />
          )}
        </div>
      )}
    </div>
  );
}

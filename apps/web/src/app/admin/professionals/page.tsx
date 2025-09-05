'use client';

import { useState, useMemo, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { Plus, FileDown, Users, Download, Upload, UserCheck, UserX, Clock, Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { AdvancedDataTable, exportToCSV, exportToJSON } from '@/components/ui/advanced-data-table';
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
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Types
interface Professional {
  id: string;
  name: string;
  email: string;
  phone?: string;
  title: string;
  licenseNumber?: string;
  specialties: string[];
  bio?: string;
  yearsOfExperience?: number;
  status: 'active' | 'inactive' | 'on_leave';
  isAcceptingNewPatients: boolean;
  telehealthEnabled: boolean;
  color: string;
  languages: string[];
  currency: string;
  acceptsOnlinePayments: boolean;
  paymentMethods: string[];
  createdAt: string;
  updatedAt: string;
}

interface ProfessionalsFilters {
  search?: string;
  status?: string | string[];
  specialty?: string;
  acceptingPatients?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

interface TableFilters {
  [key: string]: any;
}

export default function ProfessionalsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // State
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Server-side filtering and pagination state
  const [filters, setFilters] = useState<ProfessionalsFilters>({
    page: 1,
    limit: 25,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  
  const [tableFilters, setTableFilters] = useState<TableFilters>({});
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [sorting, setSorting] = useState<{ field: string; order: 'asc' | 'desc' }[]>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 });
  
  // Debounce filters to avoid excessive API calls
  const debouncedFilters = useDebounce({ 
    ...tableFilters, 
    search: globalFilter 
  }, 500);

  // Convert table filters to API format
  const apiFilters = useMemo(() => {
    const result: ProfessionalsFilters = {
      ...filters,
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      search: debouncedFilters.search,
    };

    // Apply column filters
    Object.entries(debouncedFilters).forEach(([key, value]) => {
      if (key !== 'search' && value !== undefined && value !== '' && value !== null) {
        if (Array.isArray(value) && value.length > 0) {
          (result as any)[key] = value;
        } else if (!Array.isArray(value)) {
          (result as any)[key] = value;
        }
      }
    });

    // Apply sorting
    if (sorting.length > 0) {
      result.sortBy = sorting[0].field;
      result.sortOrder = sorting[0].order;
    }

    return result;
  }, [filters, pagination, debouncedFilters, sorting]);

  // Fetch professionals data
  const { data: professionalsResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['professionals', apiFilters],
    queryFn: async () => {
      const params = new URLSearchParams();
      
      Object.entries(apiFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v.toString()));
          } else {
            params.append(key, value.toString());
          }
        }
      });
      
      const response = await api.professionals.list({ 
        page: apiFilters.page,
        limit: apiFilters.limit,
        search: apiFilters.search 
      });
      return response.data;
    },
  });

  const professionals = (professionalsResponse?.data as any)?.professionals || [];
  const totalProfessionals = professionals.length;

  // Professional columns for the table
  const professionalColumns = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Nombre',
      cell: ({ row }: any) => {
        const professional = row.original;
        return (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-medium text-primary">
                {professional.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
              </span>
            </div>
            <div>
              <div className="font-medium">{professional.title} {professional.name}</div>
              <div className="text-sm text-muted-foreground">{professional.email}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'specialties',
      header: 'Especialidades',
      cell: ({ row }: any) => {
        const specialties = row.original.specialties || [];
        return (
          <div className="flex flex-wrap gap-1">
            {specialties.slice(0, 2).map((specialty: string, index: number) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {specialty}
              </Badge>
            ))}
            {specialties.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{specialties.length - 2}
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'status',
      header: 'Estado',
      cell: ({ row }: any) => {
        const status = row.original.status;
        return (
          <Badge
            variant={status === 'active' ? 'default' : 'secondary'}
            className={cn(
              status === 'active' && 'bg-green-100 text-green-800 hover:bg-green-100',
              status === 'inactive' && 'bg-red-100 text-red-800 hover:bg-red-100',
              status === 'on_leave' && 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
            )}
          >
            {status === 'active' ? 'Activo' : status === 'inactive' ? 'Inactivo' : 'De baja'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'isAcceptingNewPatients',
      header: 'Acepta Pacientes',
      cell: ({ row }: any) => {
        const accepting = row.original.isAcceptingNewPatients;
        return (
          <Badge variant={accepting ? 'default' : 'secondary'}>
            {accepting ? 'Sí' : 'No'}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'yearsOfExperience',
      header: 'Experiencia',
      cell: ({ row }: any) => {
        const years = row.original.yearsOfExperience;
        return years ? `${years} años` : 'N/A';
      },
    },
    {
      accessorKey: 'createdAt',
      header: 'Fecha Registro',
      cell: ({ row }: any) => {
        return format(new Date(row.original.createdAt), 'dd/MM/yyyy', { locale: es });
      },
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }: any) => {
        const professional = row.original;
        return (
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/admin/professionals/${professional.id}`)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/admin/professionals/${professional.id}/edit`)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedProfessional(professional);
                setShowDeleteDialog(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ], [router]);

  // Statistics
  const stats = useMemo(() => {
    if (!Array.isArray(professionals) || !professionals.length) return null;
    
    const total = professionals.length;
    const active = professionals.filter((p: any) => p.status === 'active').length;
    const accepting = professionals.filter((p: any) => p.isAcceptingNewPatients).length;
    const avgExperience = professionals.reduce((acc: number, p: any) => acc + (p.yearsOfExperience || 0), 0) / total;
    
    return { total, active, accepting, avgExperience: Math.round(avgExperience) };
  }, [professionals]);

  // Export functions
  const handleExportCSV = useCallback(() => {
    if (!Array.isArray(professionals) || !professionals.length) {
      toast('No hay datos para exportar');
      return;
    }

    const csvData = professionals.map((professional: any) => ({
      Nombre: professional.name,
      Email: professional.email,
      Teléfono: professional.phone || 'N/A',
      Título: professional.title,
      'Número de Licencia': professional.licenseNumber || 'N/A',
      Especialidades: professional.specialties?.join(', ') || 'N/A',
      'Años de Experiencia': professional.yearsOfExperience || 'N/A',
      Estado: professional.status === 'active' ? 'Activo' : professional.status === 'inactive' ? 'Inactivo' : 'De baja',
      'Acepta Pacientes': professional.isAcceptingNewPatients ? 'Sí' : 'No',
      'Fecha de Registro': format(new Date(professional.createdAt), 'dd/MM/yyyy', { locale: es })
    }));

    exportToCSV(csvData, [], { format: 'csv', filename: 'profesionales' });
    toast('Archivo CSV exportado exitosamente');
  }, [professionals]);

  const handleExportJSON = useCallback(() => {
    if (!Array.isArray(professionals) || !professionals.length) {
      toast('No hay datos para exportar');
      return;
    }

    exportToJSON(professionals, { format: 'json', filename: 'profesionales' });
    toast('Archivo JSON exportado exitosamente');
  }, [professionals]);

  // Delete professional mutation
  const deleteProfessionalMutation = useMutation({
    mutationFn: async (professionalId: string) => {
      const response = await api.professionals.delete(professionalId);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals'] });
      toast('Profesional eliminado exitosamente');
      setShowDeleteDialog(false);
      setSelectedProfessional(null);
    },
    onError: (error: any) => {
      toast(`Error al eliminar profesional: ${error.response?.data?.message || error.message}`);
    },
  });

  const handleDeleteProfessional = useCallback(() => {
    if (selectedProfessional) {
      deleteProfessionalMutation.mutate(selectedProfessional.id);
    }
  }, [selectedProfessional, deleteProfessionalMutation]);

  // Handler functions
  const handleExportData = useCallback(() => {
    handleExportCSV();
  }, [handleExportCSV]);

  const handleCreateNew = useCallback(() => {
    router.push('/admin/professionals/create');
  }, [router]);

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-destructive">Error al cargar los profesionales</p>
              <Button onClick={() => refetch()} className="mt-4">
                Reintentar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profesionales</h1>
          <p className="text-muted-foreground">
            Gestiona el equipo de profesionales de la clínica
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Profesional
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mb-1" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Profesionales</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">
                Profesionales registrados
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activos</CardTitle>
              <UserCheck className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.active}</div>
              <p className="text-xs text-muted-foreground">
                Profesionales activos
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Aceptando Pacientes</CardTitle>
              <UserX className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.accepting}</div>
              <p className="text-xs text-muted-foreground">
                Disponibles para nuevos pacientes
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Experiencia Promedio</CardTitle>
              <Clock className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgExperience}</div>
              <p className="text-xs text-muted-foreground">
                Años de experiencia
              </p>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {/* Main Content */}
      <AdvancedDataTable
        columns={professionalColumns}
        data={professionals}
        isLoading={isLoading}
        searchPlaceholder="Buscar profesionales..."
        emptyMessage="No se encontraron profesionales"
        onExport={(data) => {
          if (data && Array.isArray(data)) {
            const csvData = data.map((professional: any) => ({
              Nombre: professional.name,
              Email: professional.email,
              Teléfono: professional.phone || 'N/A',
              Título: professional.title,
              Especialidades: professional.specialties?.join(', ') || 'N/A',
              Estado: professional.status === 'active' ? 'Activo' : 'Inactivo'
            }));
            exportToCSV(csvData, [], { format: 'csv', filename: 'profesionales' });
          }
        }}
      />
    </div>
  );
}

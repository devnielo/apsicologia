'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { Plus, FileDown, Settings, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Service, ServiceFilters, ServicePaginationState, ServiceSortState, ServiceTableFilters } from './types';
import { AdvancedDataTable, exportToCSV, exportToJSON } from '@/components/ui/advanced-data-table';
import { useServiceColumns } from './components/ServiceColumns';
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

// Types
interface ServicePaginationState {
  page: number;
  limit: number;
  total: number;
}

interface ServiceSortState {
  field: string;
  order: 'asc' | 'desc';
}

interface ServiceTableFilters {
  [key: string]: any;
}

export default function ServicesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // State
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Server-side filtering and pagination state
  const [filters, setFilters] = useState<ServiceFilters>({
    page: 1,
    limit: 25,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  
  const [tableFilters, setTableFilters] = useState<ServiceTableFilters>({});
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [sorting, setSorting] = useState<ServiceSortState[]>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 });
  
  // Debounce filters to avoid excessive API calls
  const debouncedFilters = useDebounce({ 
    ...tableFilters, 
    search: globalFilter 
  }, 500);

  // Convert table filters to API format
  const apiFilters = useMemo(() => {
    const result: ServiceFilters = {
      ...filters,
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      search: debouncedFilters.search,
    };

    // Handle sorting
    if (sorting.length > 0) {
      const sort = sorting[0];
      result.sortBy = sort.field;
      result.sortOrder = sort.order;
    }

    // Handle column filters
    Object.keys(debouncedFilters).forEach(key => {
      if (key !== 'search' && debouncedFilters[key] !== undefined && debouncedFilters[key] !== '') {
        switch (key) {
          case 'category':
            result.category = debouncedFilters[key];
            break;
          case 'isActive':
            result.isActive = debouncedFilters[key];
            break;
          case 'isOnlineAvailable':
            result.isOnlineAvailable = debouncedFilters[key];
            break;
          case 'requiresApproval':
            result.requiresApproval = debouncedFilters[key];
            break;
          case 'isPubliclyBookable':
            result.isPubliclyBookable = debouncedFilters[key];
            break;
          case 'currency':
            result.currency = debouncedFilters[key];
            break;
          case 'priceMin':
            result.priceMin = parseFloat(debouncedFilters[key]);
            break;
          case 'priceMax':
            result.priceMax = parseFloat(debouncedFilters[key]);
            break;
          case 'durationMin':
            result.durationMin = parseInt(debouncedFilters[key]);
            break;
          case 'durationMax':
            result.durationMax = parseInt(debouncedFilters[key]);
            break;
          default:
            // Handle other filters generically
            (result as any)[key] = debouncedFilters[key];
        }
      }
    });

    return result;
  }, [filters, pagination, sorting, debouncedFilters]);

  // Fetch services
  const {
    data: servicesData,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['services', apiFilters],
    queryFn: async () => {
      console.log('🔄 Fetching services with filters:', apiFilters);
      const response = await api.get('/services', { 
        params: apiFilters 
      });
      console.log('📊 Services response:', response.data);
      return response.data;
    },
    keepPreviousData: true,
  });

  const services = servicesData?.services || [];
  const totalServices = servicesData?.total || 0;
  const totalPages = Math.ceil(totalServices / pagination.pageSize);

  // Update pagination when data changes
  useEffect(() => {
    if (servicesData) {
      setPagination(prev => ({ 
        ...prev, 
        pageIndex: Math.min(prev.pageIndex, Math.max(0, totalPages - 1))
      }));
    }
  }, [servicesData, totalPages]);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/services/${id}`);
    },
    onSuccess: () => {
      toast.success('Servicio eliminado correctamente');
      queryClient.invalidateQueries({ queryKey: ['services'] });
      setShowDeleteDialog(false);
      setSelectedService(null);
    },
    onError: (error: any) => {
      console.error('Error deleting service:', error);
      toast.error(error?.response?.data?.message || 'Error al eliminar el servicio');
    },
  });

  // Event handlers
  const handleEdit = useCallback((service: Service) => {
    router.push(`/admin/services/${service.id}`);
  }, [router]);

  const handleDelete = useCallback((service: Service) => {
    setSelectedService(service);
    setShowDeleteDialog(true);
  }, []);

  const handleView = useCallback((service: Service) => {
    router.push(`/admin/services/${service.id}`);
  }, [router]);

  const confirmDelete = useCallback(() => {
    if (selectedService) {
      deleteMutation.mutate(selectedService.id);
    }
  }, [selectedService, deleteMutation]);

  // Export functions
  const handleExportCSV = useCallback(() => {
    if (services.length > 0) {
      const exportData = services.map((service: Service) => ({
        'Nombre': service.name,
        'Descripción': service.description || '',
        'Categoría': service.category || '',
        'Duración (min)': service.durationMinutes,
        'Precio': service.price,
        'Moneda': service.currency,
        'Disponible Online': service.isOnlineAvailable ? 'Sí' : 'No',
        'Público': service.isPubliclyBookable ? 'Sí' : 'No',
        'Requiere Aprobación': service.requiresApproval ? 'Sí' : 'No',
        'Estado': service.isActive ? 'Activo' : 'Inactivo',
        'Tags': service.tags.join(', '),
        'Total Reservas': service.stats.totalBookings,
        'Reservas Completadas': service.stats.completedBookings,
        'Ingresos Totales': service.stats.totalRevenue,
        'Calificación Promedio': service.stats.averageRating || 'N/A',
        'Fecha Creación': format(new Date(service.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })
      }));
      
      exportToCSV(exportData, `servicios_${format(new Date(), 'yyyy-MM-dd')}`);
      toast.success('Servicios exportados a CSV');
    } else {
      toast.error('No hay servicios para exportar');
    }
  }, [services]);

  const handleExportJSON = useCallback(() => {
    if (services.length > 0) {
      exportToJSON(services, `servicios_${format(new Date(), 'yyyy-MM-dd')}`);
      toast.success('Servicios exportados a JSON');
    } else {
      toast.error('No hay servicios para exportar');
    }
  }, [services]);

  // Table columns
  const columns = useServiceColumns({
    onEdit: handleEdit,
    onDelete: handleDelete,
    onView: handleView,
  });

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <h1 className="text-xl font-semibold text-foreground">Servicios</h1>
            </div>
            <Badge variant="secondary" className="font-normal">
              {isLoading ? '...' : `${totalServices} servicio${totalServices !== 1 ? 's' : ''}`}
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            {/* Export Dropdown */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                disabled={isLoading || services.length === 0}
                className="h-8"
              >
                <Download className="h-3 w-3 mr-1.5" />
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportJSON}
                disabled={isLoading || services.length === 0}
                className="h-8"
              >
                <FileDown className="h-3 w-3 mr-1.5" />
                JSON
              </Button>
            </div>

            {/* Create Service Button */}
            <Button 
              onClick={() => router.push('/admin/services/create')}
              className="h-8 bg-primary hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Crear Servicio
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full p-6">
          <div className="h-full">
            <AdvancedDataTable
              data={services}
              columns={columns}
              // Server-side pagination
              pagination={{
                pageIndex: pagination.pageIndex,
                pageSize: pagination.pageSize,
              }}
              onPaginationChange={setPagination}
              pageCount={totalPages}
              // Server-side sorting
              sorting={sorting}
              onSortingChange={setSorting}
              // Filtering
              globalFilter={globalFilter}
              onGlobalFilterChange={setGlobalFilter}
              columnFilters={tableFilters}
              onColumnFiltersChange={setTableFilters}
              // Loading state
              loading={isLoading}
              // Error state
              error={isError ? (error as any)?.message : null}
              // Config
              enableExport={true}
              enableColumnVisibility={true}
              enableDensity={true}
              // Search config
              searchPlaceholder="Buscar servicios por nombre, categoría..."
              // Filter presets for common queries
              filterPresets={[
                {
                  label: 'Servicios Activos',
                  filters: { isActive: true }
                },
                {
                  label: 'Servicios Online',
                  filters: { isOnlineAvailable: true }
                },
                {
                  label: 'Servicios Públicos',
                  filters: { isPubliclyBookable: true }
                },
                {
                  label: 'Requiere Aprobación',
                  filters: { requiresApproval: true }
                }
              ]}
              // Custom row actions
              onRowClick={(service) => handleView(service)}
            />
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar servicio?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar el servicio "{selectedService?.name}"? 
              Esta acción no se puede deshacer y el servicio será marcado como eliminado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

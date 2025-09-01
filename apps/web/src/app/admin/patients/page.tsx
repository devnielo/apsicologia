'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
// Removed Card imports for minimalist design
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRouter } from 'next/navigation';
import { Plus, FileDown, Users, Download, Upload } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Patient } from './types';
import { AdvancedDataTable, exportToCSV, exportToJSON } from '@/components/ui/advanced-data-table';
import { usePatientColumns } from './components/PatientColumns';
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
import { useDebounce } from '../../../hooks/useDebounce';

// Types
interface PatientsFilters {
  search?: string;
  status?: string | string[];
  gender?: string;
  contact?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  dateFrom?: string;
  dateTo?: string;
  dateField?: string;
  professionalId?: string;
  dateRange?: { from?: Date; to?: Date };
  tags?: string[];
  ageMin?: number;
  ageMax?: number;
  hasInsurance?: boolean;
}

interface PaginationState {
  page: number;
  limit: number;
  total: number;
}

interface SortState {
  field: string;
  order: 'asc' | 'desc';
}

interface TableFilters {
  [key: string]: any;
}


export default function PatientsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  // State
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  // Server-side filtering and pagination state
  const [filters, setFilters] = useState<PatientsFilters>({
    page: 1,
    limit: 25,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
  
  const [tableFilters, setTableFilters] = useState<TableFilters>({});
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [sorting, setSorting] = useState<SortState[]>([]);
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 });
  
  // Debounce filters to avoid excessive API calls
  const debouncedFilters = useDebounce({ 
    ...tableFilters, 
    search: globalFilter 
  }, 500);

  // Convert table filters to API format
  const apiFilters = useMemo(() => {
    const result: PatientsFilters = {
      ...filters,
      page: pagination.pageIndex + 1,
      limit: pagination.pageSize,
      search: debouncedFilters.search,
    };

    // Handle table column filters
    Object.entries(debouncedFilters).forEach(([key, value]) => {
      // Skip empty, null, undefined values and empty arrays
      if (!value || (Array.isArray(value) && value.length === 0) || value === '') return;

      switch (key) {
        case 'patient':
          result.search = value;
          break;
        case 'age':
          // Handle age range filter (format: "25-65" or single number)
          if (typeof value === 'string' && value.trim() !== '') {
            const trimmedValue = value.trim();
            if (trimmedValue.includes('-')) {
              const [minStr, maxStr] = trimmedValue.split('-').map(s => s.trim());
              const minAge = parseInt(minStr, 10);
              const maxAge = parseInt(maxStr, 10);
              if (!isNaN(minAge)) result.ageMin = minAge;
              if (!isNaN(maxAge)) result.ageMax = maxAge;
            } else {
              const singleAge = parseInt(trimmedValue, 10);
              if (!isNaN(singleAge)) {
                result.ageMin = singleAge;
                result.ageMax = singleAge;
              }
            }
          }
          break;
        case 'gender':
          result.gender = value !== 'all' ? value : undefined;
          break;
        case 'status':
          if (Array.isArray(value)) {
            const validStatuses = value.filter(v => v && v !== 'all');
            if (validStatuses.length > 0) {
              result.status = validStatuses;
            }
          } else {
            result.status = value !== 'all' ? value : undefined;
          }
          break;
        case 'contact':
          result.contact = value;
          break;
        case 'professional':
          result.professionalId = value;
          break;
      }
    });

    // Handle sorting
    if (sorting.length > 0) {
      const sort = sorting[0];
      result.sortBy = sort.field === 'patient' ? 'personalInfo.fullName' : sort.field;
      result.sortOrder = sort.order === 'desc' ? 'desc' : 'asc';
    }

    // Clean up undefined values to avoid sending empty parameters
    Object.keys(result).forEach(key => {
      const value = result[key as keyof PatientsFilters];
      if (value === undefined || value === null || value === '' || 
          (Array.isArray(value) && value.length === 0)) {
        delete result[key as keyof PatientsFilters];
      }
    });

    return result;
  }, [filters, pagination, debouncedFilters, sorting]);

  // Fetch patients with server-side filtering
  const query = useQuery({
    queryKey: ['patients', apiFilters],
    queryFn: () => api.patients.list(apiFilters),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  const patients = useMemo(() => query.data?.data.data?.patients || [], [query.data?.data.data?.patients]);
  const totalCount = useMemo(() => query.data?.data.data?.pagination?.total || 0, [query.data?.data.data?.pagination?.total]);

  // Patient columns hook with memoized callback
  const handleDeletePatient = useCallback((patient: Patient) => {
    setSelectedPatient(patient);
    setShowDeleteDialog(true);
  }, []);

  const { columns, columnFilterConfigs } = usePatientColumns({
    onDeletePatient: handleDeletePatient,
  });

  // Mutations - Soft delete mutation (change status to 'deleted')
  const deleteMutation = useMutation({
    mutationFn: (patientId: string) => api.patients.update(patientId, { 
      status: 'deleted',
      lastModifiedBy: 'current-user-id' // TODO: Get actual user ID from auth context
    }),
    onSuccess: () => {
      toast.success('Paciente eliminado correctamente');
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      setShowDeleteDialog(false);
      setSelectedPatient(null);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al eliminar el paciente');
    },
  });

  // Handlers
  const confirmDelete = () => {
    if (selectedPatient) {
      deleteMutation.mutate(selectedPatient.id);
    }
  };

  // Table event handlers - all memoized to prevent re-renders
  const handleFiltersChange = useCallback((newFilters: TableFilters) => {
    setTableFilters(newFilters);
  }, []);

  const handleGlobalFilterChange = useCallback((value: string) => {
    setGlobalFilter(value);
  }, []);

  const handleSortingChange = useCallback((newSorting: SortState[]) => {
    setSorting(newSorting);
  }, []);

  const handlePaginationChange = useCallback((newPagination: { pageIndex: number; pageSize: number }) => {
    setPagination(newPagination);
  }, []);

  // Export functionality
  const handleExport = useCallback((selectedRows?: Patient[]) => {
    const dataToExport = selectedRows && selectedRows.length > 0 ? selectedRows : patients;
    const filename = `patients_${new Date().toISOString().split('T')[0]}`;
    exportToCSV(dataToExport, columns, { filename, format: 'csv' });
    toast.success('Exportación CSV completada');
  }, [patients, columns]);

  // Navigation handlers
  const handleCreatePatient = useCallback(() => {
    router.push('/admin/patients/create');
  }, [router]);

  return (
    <div className="w-full px-2 py-2 space-y-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pacientes</h1>
          <p className="text-muted-foreground">
            Gestiona y supervisa la información de los pacientes
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="gap-2">
            <Users className="h-4 w-4" />
            {totalCount} pacientes
          </Badge>
        </div>
      </div>

      {/* Advanced Data Table */}
      <div className="w-full border border-border rounded-lg bg-card">
        <div className="p-2">
          <AdvancedDataTable
            data={patients}
            columns={columns}
            isLoading={query.isLoading}
            searchPlaceholder="Buscar pacientes..."
            emptyMessage="No se encontraron pacientes"
            columnFilterConfigs={columnFilterConfigs}
            enableFiltering
            enableGlobalFilter
            enableSorting
            enableRowSelection
            enableColumnVisibility
            enablePagination
            showToolbar
            defaultPageSize={25}
            onExport={handleExport}
            // Server-side pagination props
            manualPagination
            pageCount={Math.ceil(totalCount / pagination.pageSize)}
            onPaginationChange={handlePaginationChange}
            // Server-side filtering props
            manualFiltering
            onColumnFiltersChange={handleFiltersChange}
            onGlobalFilterChange={handleGlobalFilterChange}
            // Server-side sorting props
            manualSorting
            onSortingChange={handleSortingChange}
            // Memoized props to prevent re-renders
            pageSizeOptions={useMemo(() => [10, 25, 50, 100], [])}
            toolbarActions={useMemo(() => (
              <Button onClick={handleCreatePatient} size="sm" className="h-9">
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Paciente
              </Button>
            ), [handleCreatePatient])}
            // Current state - memoized to prevent re-renders
            state={useMemo(() => ({
              pagination,
              columnFilters: Object.entries(tableFilters).map(([id, value]) => ({ id, value })),
              globalFilter,
              sorting: sorting.map(s => ({ id: s.field, desc: s.order === 'desc' })),
            }), [pagination, tableFilters, globalFilter, sorting])}
          />
        </div>
      </div>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Paciente</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar a {selectedPatient?.personalInfo?.fullName || 'este paciente'}?
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import {
  PatientsHeader,
  PatientsTable,
  DeletePatientDialog
} from './components';
import { Patient, PatientFilters, PatientsApiResponse } from './types';

// API functions
const fetchPatients = async (filters: PatientFilters = {}): Promise<PatientsApiResponse> => {
  const params: any = {
    page: filters.page || 1,
    limit: filters.limit || 20,
    sortBy: filters.sortBy || 'createdAt',
    sortOrder: filters.sortOrder || 'desc',
  };

  if (filters.search) params.search = filters.search;
  if (filters.status && filters.status !== 'all') params.status = filters.status;
  if (filters.gender && filters.gender !== 'all') params.gender = filters.gender;
  if (filters.professionalId) params.professionalId = filters.professionalId;
  if (filters.dateFrom) params.dateFrom = filters.dateFrom.toISOString();
  if (filters.dateTo) params.dateTo = filters.dateTo.toISOString();
  if (filters.tags?.length) params.tags = filters.tags.join(',');

  const response = await api.patients.list(params);
  
  // Transform backend response to match our interface
  const backendData = response.data.data;
  const patients = Array.isArray(backendData?.patients) 
    ? backendData.patients 
    : Array.isArray(backendData) 
    ? backendData 
    : [];

  // Handle different backend pagination response formats
  const backendPagination = backendData?.pagination || {};
  
  // Extract values with fallbacks for different backend response formats
  const currentPage = (backendPagination as any).currentPage || (backendPagination as any).page || 1;
  const total = (backendPagination as any).totalItems || (backendPagination as any).total || patients.length;
  const limit = (backendPagination as any).itemsPerPage || (backendPagination as any).limit || params.limit;
  const totalPages = (backendPagination as any).totalPages || Math.ceil(total / limit);
  const hasNext = (backendPagination as any).hasNextPage ?? (backendPagination as any).hasNext ?? (currentPage < totalPages);
  const hasPrev = (backendPagination as any).hasPrevPage ?? (backendPagination as any).hasPrev ?? (currentPage > 1);

  return {
    success: true,
    message: 'Patients fetched successfully',
    data: {
      patients,
      pagination: {
        currentPage,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: hasNext,
        hasPrevPage: hasPrev
      }
    }
  };
};

const deletePatient = async (id: string): Promise<void> => {
  await api.patients.delete(id);
};

const exportPatients = async (filters: PatientFilters = {}) => {
  const response = await api.patients.export({ filters, format: 'csv' });
  return response.data;
};

export default function PatientsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  
  // Estados
  const [filters, setFilters] = useState<PatientFilters>({
    search: '',
    status: 'all',
    gender: 'all',
    page: 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Query para obtener pacientes con paginación
  const {
    data: patientsResponse,
    isLoading: patientsLoading,
    error: patientsError,
    refetch: refetchPatients
  } = useQuery({
    queryKey: ['patients', filters],
    queryFn: () => fetchPatients(filters),
    staleTime: 5 * 60 * 1000,
  });

  // Mutación para eliminar paciente
  const deleteMutation = useMutation({
    mutationFn: deletePatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Paciente eliminado exitosamente');
      setIsDeleteDialogOpen(false);
      setSelectedPatient(null);
      refetchPatients();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar paciente');
    },
  });

  // Mutación para exportar
  const exportMutation = useMutation({
    mutationFn: exportPatients,
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = 'pacientes.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Pacientes exportados exitosamente');
    },
    onError: () => {
      toast.error('Error al exportar pacientes');
    },
  });

  // Extract data from server response
  const patients = patientsResponse?.data.patients || [];
  const paginationMeta = patientsResponse?.data.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
    hasNextPage: false,
    hasPrevPage: false
  };

  // Handlers
  const handleCreatePatient = () => {
    router.push('/admin/patients/new');
  };

  const handleDeletePatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedPatient) {
      deleteMutation.mutate(selectedPatient.id);
    }
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handlePageSizeChange = (limit: number) => {
    setFilters(prev => ({ ...prev, limit, page: 1 })); // Reset to first page when changing page size
  };

  const handleFiltersChange = (newFilters: Partial<PatientFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 })); // Reset to first page when filters change
  };

  if (!user) {
    return null;
  }

  if (patientsError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-xl font-semibold mb-2">Error al cargar pacientes</h2>
        <p className="text-muted-foreground mb-4">
          {patientsError?.message || 'Ha ocurrido un error inesperado'}
        </p>
        <button 
          onClick={() => refetchPatients()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-6 h-full w-full">
      <PatientsHeader
        totalPatients={paginationMeta.totalItems}
        onCreatePatient={handleCreatePatient}
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onExport={async () => exportMutation.mutate(filters)}
        isExporting={exportMutation.isPending}
      />

      <PatientsTable
        patients={patients}
        paginationMeta={paginationMeta}
        onDeletePatient={handleDeletePatient}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        isLoading={patientsLoading}
      />

      <DeletePatientDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedPatient(null);
        }}
        onConfirm={handleDeleteConfirm}
        patient={selectedPatient}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

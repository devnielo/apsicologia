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
import { Patient, PatientFilters } from './types';

// API functions
const fetchPatients = async (filters: PatientFilters = {}): Promise<Patient[]> => {
  const params: any = {
    page: 1,
    limit: 50,
  };

  if (filters.search) params.search = filters.search;
  if (filters.status && filters.status !== 'all') params.status = filters.status;
  if (filters.gender && filters.gender !== 'all') params.gender = filters.gender;
  if (filters.professionalId) params.professionalId = filters.professionalId;
  if (filters.dateFrom) params.dateFrom = filters.dateFrom.toISOString();
  if (filters.dateTo) params.dateTo = filters.dateTo.toISOString();

  const response = await api.patients.list(params);
  
  // Debug: Log the response structure
  console.log('API Response:', response);
  console.log('Response data:', response.data);
  
  // Extract patients array from response
  const patients = Array.isArray(response.data.data?.patients) 
    ? response.data.data.patients 
    : Array.isArray(response.data.data) 
    ? response.data.data 
    : Array.isArray(response.data) 
    ? response.data 
    : [];
  
  console.log('Extracted patients:', patients);
  if (patients.length > 0) {
    console.log('First patient:', patients[0]);
  }
  
  return patients;
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
    gender: 'all'
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  const [filtersAdvanced, setFiltersAdvanced] = useState<PatientFilters>({
    search: '',
    status: 'all',
    gender: 'all',
    professionalId: undefined
  });

  // Query para obtener pacientes
  const {
    data: patients,
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

  // Filtrado local optimizado
  const validPatients = Array.isArray(patients) ? patients : [];
  const filteredPatients = useMemo(() => {
    return validPatients.filter((p: Patient) => {
      if (!p || !p.personalInfo) return false;
      
      const search = filtersAdvanced.search?.toLowerCase() || '';
      const matchesSearch = !search || 
        p.personalInfo.fullName?.toLowerCase().includes(search) ||
        p.contactInfo?.email?.toLowerCase().includes(search) ||
        p.contactInfo?.phone?.includes(search);
      
      return matchesSearch;
    });
  }, [validPatients, filtersAdvanced]);

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
        totalPatients={validPatients.length}
        onCreatePatient={handleCreatePatient}
        filters={filters}
        onFiltersChange={setFilters}
        onExport={async () => exportMutation.mutate(filters)}
        isExporting={exportMutation.isPending}
      />

      <PatientsTable
        patients={filteredPatients}
        onDeletePatient={handleDeletePatient}
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

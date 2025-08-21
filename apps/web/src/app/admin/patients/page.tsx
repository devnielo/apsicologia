'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import {
  PatientsHeader,
  PatientsTable,
  PatientModal,
  PatientDetailsModal,
  DeletePatientDialog
} from './components';

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

// API functions usando el cliente api existente
const fetchPatients = async (): Promise<Patient[]> => {
  const response = await api.patients.list();
  return response.data.data || [];
};

const createPatient = async (patientData: any): Promise<Patient> => {
  const response = await api.patients.create(patientData);
  return response.data.data;
};

const updatePatient = async ({ id, data }: { id: string; data: any }): Promise<Patient> => {
  const response = await api.patients.update(id, data);
  return response.data.data;
};

const deletePatient = async (id: string): Promise<void> => {
  await api.patients.delete(id);
};

export default function PatientsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  
  // Estados para modales
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  // Estados para filtros y búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Query para obtener pacientes
  const {
    data: patients = [],
    isLoading: patientsLoading,
    error: patientsError
  } = useQuery({
    queryKey: ['patients'],
    queryFn: fetchPatients,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Mutación para crear paciente
  const createMutation = useMutation({
    mutationFn: createPatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Paciente creado exitosamente');
      setIsCreateModalOpen(false);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear paciente');
    },
  });

  // Mutación para actualizar paciente
  const updateMutation = useMutation({
    mutationFn: updatePatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Paciente actualizado exitosamente');
      setIsEditModalOpen(false);
      setSelectedPatient(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al actualizar paciente');
    },
  });

  // Mutación para eliminar paciente
  const deleteMutation = useMutation({
    mutationFn: deletePatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      toast.success('Paciente eliminado exitosamente');
      setIsDeleteDialogOpen(false);
      setSelectedPatient(null);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al eliminar paciente');
    },
  });

  // Filtrar pacientes
  const filteredPatients = patients.filter((patient) => {
    const matchesSearch = searchQuery === '' || 
      patient.personalInfo.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.contactInfo.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.contactInfo.phone.includes(searchQuery);
    
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calcular estadísticas
  const totalPatients = patients.length;
  const activePatients = patients.filter(p => p.status === 'active').length;

  // Handlers
  const handleCreatePatient = () => {
    setSelectedPatient(null);
    setIsCreateModalOpen(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsEditModalOpen(true);
  };

  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsDetailsModalOpen(true);
  };

  const handleDeletePatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsDeleteDialogOpen(true);
  };

  const handleSavePatient = async (data: any) => {
    if (selectedPatient) {
      await updateMutation.mutateAsync({ id: selectedPatient._id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  const handleConfirmDelete = async (patient: Patient) => {
    await deleteMutation.mutateAsync(patient._id);
  };

  const handleImportPatients = () => {
    toast.info('Función de importación en desarrollo');
  };

  const handleExportPatients = () => {
    toast.info('Función de exportación en desarrollo');
  };

  const handleBulkActions = () => {
    toast.info('Acciones masivas en desarrollo');
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Acceso Denegado</h2>
          <p className="text-muted-foreground">No tienes permisos para acceder a esta página.</p>
        </div>
      </div>
    );
  }

  if (patientsError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Error al cargar pacientes</h2>
          <p className="text-muted-foreground">
            {patientsError instanceof Error ? patientsError.message : 'Error desconocido'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full p-6 space-y-6">
      <PatientsHeader
        totalPatients={totalPatients}
        activePatients={activePatients}
        onCreatePatient={handleCreatePatient}
        onImportPatients={handleImportPatients}
        onExportPatients={handleExportPatients}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        onBulkActions={handleBulkActions}
      />

      <PatientsTable
        patients={filteredPatients}
        onViewPatient={handleViewPatient}
        onEditPatient={handleEditPatient}
        onDeletePatient={handleDeletePatient}
        isLoading={patientsLoading}
      />

      {/* Modal para crear/editar paciente */}
      <PatientModal
        isOpen={isCreateModalOpen || isEditModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setIsEditModalOpen(false);
          setSelectedPatient(null);
        }}
        patient={selectedPatient}
        onSave={handleSavePatient}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Modal para ver detalles del paciente */}
      <PatientDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedPatient(null);
        }}
        patient={selectedPatient}
        onEdit={handleEditPatient}
      />

      {/* Dialog para eliminar paciente */}
      <DeletePatientDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedPatient(null);
        }}
        patient={selectedPatient}
        onConfirm={handleConfirmDelete}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}

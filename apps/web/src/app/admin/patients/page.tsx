'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  User,
  Phone,
  Mail,
  Calendar,
  FileText,
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface Patient {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other';
  address?: {
    street: string;
    city: string;
    zipCode: string;
    country: string;
  };
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  medicalHistory?: {
    allergies?: string[];
    medications?: string[];
    conditions?: string[];
    notes?: string;
  };
  tags?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PatientsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();

  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  // Redirect if not authenticated or not authorized
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login');
    } else if (user && !['admin', 'professional', 'reception'].includes(user.role)) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, router]);

  // Fetch patients query
  const {
    data: patientsResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['patients', { page: currentPage, limit: pageSize, search: searchTerm }],
    queryFn: async () => {
      const response = await api.patients.list({
        page: currentPage,
        limit: pageSize,
        search: searchTerm || undefined,
      });
      return response.data;
    },
    enabled: isAuthenticated && ['admin', 'professional', 'reception'].includes(user?.role || ''),
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.patients.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
  });

  // Handle delete
  const handleDelete = async (patient: Patient) => {
    if (confirm(`¿Estás seguro de que quieres eliminar al paciente ${patient.name}?`)) {
      try {
        await deleteMutation.mutateAsync(patient._id);
        alert('Paciente eliminado exitosamente');
      } catch (error) {
        console.error('Error deleting patient:', error);
        alert('Error al eliminar el paciente');
      }
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  // Calculate age
  const calculateAge = (dateOfBirth?: string) => {
    if (!dateOfBirth) return 'N/A';
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return `${age} años`;
  };

  if (!isAuthenticated || (user && !['admin', 'professional', 'reception'].includes(user.role))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  const patients = patientsResponse?.data || [];
  const totalPatients = patientsResponse?.meta?.total || 0;
  const totalPages = Math.ceil(totalPatients / pageSize);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Gestión de Pacientes</h1>
              <p className="text-muted-foreground">
                Administra y consulta la información de los pacientes
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="medical-button-secondary"
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Volver al Dashboard
              </button>
              
              <button
                onClick={() => setShowCreateModal(true)}
                className="medical-button-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Paciente
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* Search and Filters */}
          <div className="medical-card p-6 mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Buscar pacientes por nombre, email o teléfono..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10 pr-4 py-2 w-full rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <button className="medical-button-secondary">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                </button>
                
                <select
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-3 py-2 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value={10}>10 por página</option>
                  <option value={25}>25 por página</option>
                  <option value={50}>50 por página</option>
                </select>
              </div>
            </div>
          </div>

          {/* Patients Table */}
          <div className="medical-card">
            <div className="px-6 py-4 border-b border-border">
              <h3 className="text-lg font-medium text-foreground">
                Pacientes ({totalPatients})
              </h3>
            </div>

            {isLoading ? (
              <div className="p-6">
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="flex items-center space-x-4">
                        <div className="h-10 w-10 bg-muted rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-1/4"></div>
                          <div className="h-3 bg-muted rounded w-1/6"></div>
                        </div>
                        <div className="flex space-x-2">
                          <div className="h-8 w-16 bg-muted rounded"></div>
                          <div className="h-8 w-16 bg-muted rounded"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : error ? (
              <div className="p-6 text-center">
                <p className="text-destructive">Error al cargar los pacientes</p>
                <button
                  onClick={() => queryClient.invalidateQueries({ queryKey: ['patients'] })}
                  className="medical-button-secondary mt-2"
                >
                  Reintentar
                </button>
              </div>
            ) : patients.length === 0 ? (
              <div className="p-6 text-center">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  {searchTerm ? 'No se encontraron pacientes' : 'No hay pacientes registrados'}
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="medical-button-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primer Paciente
                </button>
              </div>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/20">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Paciente
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Contacto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Edad
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Registro
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {patients.map((patient: Patient) => (
                        <tr key={patient._id} className="hover:bg-muted/10">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="bg-primary/10 text-primary rounded-full p-2 mr-3">
                                <User className="h-4 w-4" />
                              </div>
                              <div>
                                <div className="text-sm font-medium text-foreground">
                                  {patient.name}
                                </div>
                                {patient.tags && patient.tags.length > 0 && (
                                  <div className="flex space-x-1 mt-1">
                                    {patient.tags.slice(0, 2).map((tag, index) => (
                                      <span
                                        key={index}
                                        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-accent/10 text-accent"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                    {patient.tags.length > 2 && (
                                      <span className="text-xs text-muted-foreground">
                                        +{patient.tags.length - 2} más
                                      </span>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-foreground">
                              <div className="flex items-center">
                                <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                                {patient.email}
                              </div>
                              {patient.phone && (
                                <div className="flex items-center mt-1">
                                  <Phone className="h-3 w-3 mr-1 text-muted-foreground" />
                                  {patient.phone}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                            {calculateAge(patient.dateOfBirth)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                            {formatDate(patient.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                patient.isActive
                                  ? 'bg-success/10 text-success'
                                  : 'bg-destructive/10 text-destructive'
                              }`}
                            >
                              {patient.isActive ? 'Activo' : 'Inactivo'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex items-center justify-end space-x-2">
                              <button
                                onClick={() => {
                                  setSelectedPatient(patient);
                                  setShowViewModal(true);
                                }}
                                className="text-accent hover:text-accent/80 p-1 rounded"
                                title="Ver detalles"
                              >
                                <Eye className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  setSelectedPatient(patient);
                                  setShowEditModal(true);
                                }}
                                className="text-warning hover:text-warning/80 p-1 rounded"
                                title="Editar"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(patient)}
                                className="text-destructive hover:text-destructive/80 p-1 rounded"
                                title="Eliminar"
                                disabled={deleteMutation.isPending}
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden divide-y divide-border">
                  {patients.map((patient: Patient) => (
                    <div key={patient._id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center">
                          <div className="bg-primary/10 text-primary rounded-full p-2 mr-3">
                            <User className="h-4 w-4" />
                          </div>
                          <div>
                            <h4 className="text-sm font-medium text-foreground">
                              {patient.name}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {calculateAge(patient.dateOfBirth)}
                            </p>
                          </div>
                        </div>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            patient.isActive
                              ? 'bg-success/10 text-success'
                              : 'bg-destructive/10 text-destructive'
                          }`}
                        >
                          {patient.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Mail className="h-3 w-3 mr-1" />
                          {patient.email}
                        </div>
                        {patient.phone && (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Phone className="h-3 w-3 mr-1" />
                            {patient.phone}
                          </div>
                        )}
                      </div>

                      {patient.tags && patient.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {patient.tags.slice(0, 3).map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-accent/10 text-accent"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-muted-foreground">
                          Registrado: {formatDate(patient.createdAt)}
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => {
                              setSelectedPatient(patient);
                              setShowViewModal(true);
                            }}
                            className="text-accent hover:text-accent/80 p-1 rounded"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPatient(patient);
                              setShowEditModal(true);
                            }}
                            className="text-warning hover:text-warning/80 p-1 rounded"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(patient)}
                            className="text-destructive hover:text-destructive/80 p-1 rounded"
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="medical-card p-4 mt-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Mostrando {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalPatients)} de {totalPatients} pacientes
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="medical-button-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  
                  <span className="px-3 py-2 text-sm text-foreground">
                    Página {currentPage} de {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="medical-button-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals would go here - for now showing placeholders */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">Nuevo Paciente</h3>
            <p className="text-muted-foreground mb-4">
              Funcionalidad de creación próximamente disponible.
            </p>
            <button
              onClick={() => setShowCreateModal(false)}
              className="medical-button-primary w-full"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {showEditModal && selectedPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">Editar Paciente</h3>
            <p className="text-muted-foreground mb-4">
              Editando: {selectedPatient.name}
            </p>
            <button
              onClick={() => {
                setShowEditModal(false);
                setSelectedPatient(null);
              }}
              className="medical-button-primary w-full"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {showViewModal && selectedPatient && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card p-6 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-medium mb-4">Detalles del Paciente</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Nombre:</label>
                <p className="text-sm text-muted-foreground">{selectedPatient.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-foreground">Email:</label>
                <p className="text-sm text-muted-foreground">{selectedPatient.email}</p>
              </div>
              {selectedPatient.phone && (
                <div>
                  <label className="text-sm font-medium text-foreground">Teléfono:</label>
                  <p className="text-sm text-muted-foreground">{selectedPatient.phone}</p>
                </div>
              )}
              <div>
                <label className="text-sm font-medium text-foreground">Edad:</label>
                <p className="text-sm text-muted-foreground">{calculateAge(selectedPatient.dateOfBirth)}</p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowViewModal(false);
                setSelectedPatient(null);
              }}
              className="medical-button-primary w-full mt-6"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

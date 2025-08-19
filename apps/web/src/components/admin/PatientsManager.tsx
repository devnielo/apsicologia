'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
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
  Download,
  Upload,
  MoreHorizontal,
  MapPin,
  X,
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

interface Patient {
  _id: string;
  personalInfo: {
    firstName: string;
    lastName: string;
    fullName: string;
    dateOfBirth?: Date;
    gender?: 'male' | 'female' | 'non-binary' | 'other' | 'prefer-not-to-say';
    age?: number;
    nationality?: string;
    idNumber?: string;
    idType?: 'dni' | 'nie' | 'passport' | 'other';
    maritalStatus?: 'single' | 'married' | 'divorced' | 'widowed' | 'separated' | 'domestic-partner';
    occupation?: string;
    employer?: string;
  };
  contactInfo: {
    email: string;
    phone: string;
    alternativePhone?: string;
    preferredContactMethod: 'email' | 'phone' | 'sms' | 'whatsapp';
    address: {
      street: string;
      city: string;
      state?: string;
      postalCode: string;
      country: string;
    };
  };
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
    email?: string;
  };
  clinicalInfo?: {
    medicalHistory?: {
      conditions?: string[];
      medications?: any[];
      allergies?: any[];
      surgeries?: any[];
      hospitalizations?: any[];
    };
  };
  gdprConsent: {
    dataProcessing: {
      consented: boolean;
      consentDate: string;
      consentMethod: 'verbal' | 'written' | 'digital';
      consentVersion: string;
    };
  };
  tags?: any[];
  status: 'active' | 'inactive' | 'discharged' | 'transferred' | 'deceased';
  createdAt: string;
  updatedAt: string;
}

interface PatientsApiResponse {
  patients: Patient[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalPatients: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

const patientSchema = z.object({
  personalInfo: z.object({
    firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
    dateOfBirth: z.string().optional(),
    gender: z.enum(['male', 'female', 'non-binary', 'other', 'prefer-not-to-say']).optional(),
    nationality: z.string().optional(),
    idNumber: z.string().optional(),
    idType: z.enum(['dni', 'nie', 'passport', 'other']).optional(),
    maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed', 'separated', 'domestic-partner']).optional(),
    occupation: z.string().optional(),
    employer: z.string().optional()
  }),
  contactInfo: z.object({
    email: z.string().email('Email inválido'),
    phone: z.string().min(9, 'El teléfono debe tener al menos 9 dígitos'),
    alternativePhone: z.string().optional(),
    preferredContactMethod: z.enum(['email', 'phone', 'sms', 'whatsapp']).default('email'),
    address: z.object({
      street: z.string().min(1, 'La dirección es requerida'),
      city: z.string().min(1, 'La ciudad es requerida'),
      postalCode: z.string().min(1, 'El código postal es requerido'),
      state: z.string().optional(),
      country: z.string().min(1, 'El país es requerido').default('Spain')
    })
  }),
  emergencyContact: z.object({
    name: z.string().min(1, 'El nombre del contacto de emergencia es requerido'),
    relationship: z.string().min(1, 'La relación es requerida'),
    phone: z.string().min(9, 'El teléfono debe tener al menos 9 dígitos'),
    email: z.string().email().optional()
  }),
  clinicalInfo: z.object({
    medicalHistory: z.object({
      conditions: z.array(z.string()).default([]),
      medications: z.array(z.any()).default([]),
      allergies: z.array(z.any()).default([]),
      surgeries: z.array(z.any()).default([]),
      hospitalizations: z.array(z.any()).default([])
    }).optional()
  }).optional(),
  gdprConsent: z.object({
    dataProcessing: z.object({
      consented: z.boolean(),
      consentDate: z.string(),
      consentMethod: z.enum(['verbal', 'written', 'digital']),
      consentVersion: z.string().default('1.0')
    })
  }),
  tags: z.array(z.any()).default([])
});

type PatientFormData = z.infer<typeof patientSchema>;

// Status badge component
const StatusBadge = ({ status }: { status: Patient['status'] }) => {
  const statusConfig = {
    active: { label: 'Activo', variant: 'default' as const, icon: CheckCircle },
    inactive: { label: 'Inactivo', variant: 'secondary' as const, icon: XCircle },
    discharged: { label: 'Alta', variant: 'outline' as const, icon: Info },
    transferred: { label: 'Transferido', variant: 'outline' as const, icon: Info },
    deceased: { label: 'Fallecido', variant: 'destructive' as const, icon: AlertTriangle }
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} className="flex items-center gap-1">
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};

// Gender badge component
const GenderBadge = ({ gender }: { gender?: Patient['personalInfo']['gender'] }) => {
  if (!gender) return null;
  
  const genderConfig = {
    male: { label: 'Masculino', variant: 'outline' as const },
    female: { label: 'Femenino', variant: 'outline' as const },
    other: { label: 'Otro', variant: 'outline' as const },
    prefer_not_to_say: { label: 'Prefiere no decir', variant: 'outline' as const }
  };

  const config = genderConfig[gender];
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export default function PatientsManager() {
  const queryClient = useQueryClient();

  // States
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [viewingPatient, setViewingPatient] = useState<Patient | null>(null);
  
  // Filter states
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [genderFilter, setGenderFilter] = useState<string>('');
  const [dateFromFilter, setDateFromFilter] = useState<string>('');
  const [dateToFilter, setDateToFilter] = useState<string>('');

  // Fetch patients query
  const {
    data: patientsResponse,
    isLoading,
    error,
  } = useQuery<PatientsApiResponse>({
    queryKey: ['patients', { 
      page: currentPage, 
      limit: pageSize, 
      search: searchTerm,
      status: statusFilter,
      gender: genderFilter,
      dateFrom: dateFromFilter,
      dateTo: dateToFilter
    }],
    queryFn: async (): Promise<PatientsApiResponse> => {
      const params: any = {
        page: currentPage,
        limit: pageSize,
        search: searchTerm,
      };
      
      if (statusFilter) params.status = statusFilter;
      if (genderFilter) params.gender = genderFilter;
      if (dateFromFilter) params.dateFrom = dateFromFilter;
      if (dateToFilter) params.dateTo = dateToFilter;
      
      const response = await api.patients.list(params);
      return response.data.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Create patient mutation
  const createMutation = useMutation({
    mutationFn: async (data: PatientFormData) => {
      const response = await api.patients.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      handleCloseCreateModal();
    },
    onError: (error: any) => {
      console.error('Error creating patient:', error);
    },
  });

  // Update patient mutation
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: PatientFormData }) => {
      const response = await api.patients.update(id, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      handleCloseEditModal();
    },
    onError: (error: any) => {
      console.error('Error updating patient:', error);
    },
  });

  // Delete patient mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const response = await api.patients.delete(id);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
    onError: (error: any) => {
      console.error('Error deleting patient:', error);
    },
  });

  // Form handling
  const form = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
  });

  // Handle form submission
  const onSubmit = async (data: PatientFormData) => {
    if (editingPatient) {
      updateMutation.mutate({ id: editingPatient._id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  // Handle close modals
  const handleCloseCreateModal = () => {
    setShowCreateModal(false);
    form.reset();
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingPatient(null);
    form.reset();
  };

  const handleCloseViewModal = () => {
    setShowViewModal(false);
    setViewingPatient(null);
  };

  // Handle edit
  const handleEdit = (patient: Patient) => {
    setEditingPatient(patient);
    setSelectedPatient(patient);
    
    // Reset form first
    form.reset();
    
    // Set form values with proper structure
    form.setValue('personalInfo', {
      firstName: patient.personalInfo.firstName,
      lastName: patient.personalInfo.lastName,
      dateOfBirth: patient.personalInfo.dateOfBirth ? new Date(patient.personalInfo.dateOfBirth).toISOString().split('T')[0] : '',
      gender: patient.personalInfo.gender
    });
    
    form.setValue('contactInfo', {
      email: patient.contactInfo.email,
      phone: patient.contactInfo.phone || '',
      address: patient.contactInfo.address || {
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: ''
      }
    });
    
    form.setValue('emergencyContact', patient.emergencyContact || {
      name: '',
      relationship: '',
      phone: '',
      email: ''
    });
    
    form.setValue('clinicalInfo', {
      medicalHistory: patient.clinicalInfo?.medicalHistory || {
        conditions: [],
        medications: [],
        allergies: [],
        surgeries: [],
        hospitalizations: [],
        familyHistory: '',
        notes: ''
      }
    });
    
    form.setValue('tags', patient.tags || []);
    
    setShowEditModal(true);
  };

  // Handle delete
  const handleDelete = (patient: Patient) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar a ${patient.personalInfo.fullName}?`)) {
      deleteMutation.mutate(patient._id);
    }
  };

  // Handle view
  const handleView = (patient: Patient) => {
    setViewingPatient(patient);
    setSelectedPatient(patient);
    setShowViewModal(true);
  };

  // Handle filters
  const clearFilters = () => {
    setStatusFilter('');
    setGenderFilter('');
    setDateFromFilter('');
    setDateToFilter('');
    setCurrentPage(1);
  };

  const hasActiveFilters = statusFilter || genderFilter || dateFromFilter || dateToFilter;

  const patients = patientsResponse?.patients || [];
  const totalPatients = patientsResponse?.pagination?.totalPatients || 0;
  const totalPages = Math.ceil(totalPatients / pageSize);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert variant="destructive" className="max-w-md">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            No se pudieron cargar los pacientes. Por favor, intenta nuevamente.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Gestión de Pacientes</h1>
            <p className="text-sm text-muted-foreground">
              Administra y consulta la información de los pacientes
            </p>
          </div>
          
          <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nuevo Paciente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Crear Nuevo Paciente</DialogTitle>
                <DialogDescription>
                  Completa la información del nuevo paciente
                </DialogDescription>
              </DialogHeader>
              <PatientForm 
                form={form} 
                onSubmit={onSubmit} 
                isSubmitting={createMutation.isPending}
                onCancel={handleCloseCreateModal}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar pacientes por nombre, email o teléfono..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="pl-10"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Button 
                  variant={hasActiveFilters ? "default" : "outline"}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtros
                  {hasActiveFilters && (
                    <Badge variant="secondary" className="ml-2">
                      {[statusFilter, genderFilter, dateFromFilter, dateToFilter].filter(Boolean).length}
                    </Badge>
                  )}
                </Button>
                
                <Select value={pageSize.toString()} onValueChange={(value) => {
                  setPageSize(Number(value));
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem key="10" value="10">10 por página</SelectItem>
                    <SelectItem key="25" value="25">25 por página</SelectItem>
                    <SelectItem key="50" value="50">50 por página</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Filters Panel */}
            {showFilters && (
              <>
                <Separator className="my-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Status Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Estado</Label>
                    <Select value={statusFilter || ""} onValueChange={(value) => {
                      setStatusFilter(value === "" ? "" : value);
                      setCurrentPage(1);
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los estados" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos los estados</SelectItem>
                        <SelectItem value="active">Activo</SelectItem>
                        <SelectItem value="inactive">Inactivo</SelectItem>
                        <SelectItem value="discharged">Alta</SelectItem>
                        <SelectItem value="transferred">Transferido</SelectItem>
                        <SelectItem value="deceased">Fallecido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Gender Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Género</Label>
                    <Select value={genderFilter || ""} onValueChange={(value) => {
                      setGenderFilter(value === "" ? "" : value);
                      setCurrentPage(1);
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los géneros" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Todos los géneros</SelectItem>
                        <SelectItem value="male">Masculino</SelectItem>
                        <SelectItem value="female">Femenino</SelectItem>
                        <SelectItem value="other">Otro</SelectItem>
                        <SelectItem value="prefer_not_to_say">Prefiere no decir</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date From Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Desde</Label>
                    <Input
                      type="date"
                      value={dateFromFilter}
                      onChange={(e) => {
                        setDateFromFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                  </div>

                  {/* Date To Filter */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Hasta</Label>
                    <Input
                      type="date"
                      value={dateToFilter}
                      onChange={(e) => {
                        setDateToFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                </div>
                
                {hasActiveFilters && (
                  <div className="flex justify-end mt-4">
                    <Button variant="outline" onClick={clearFilters}>
                      <X className="h-4 w-4 mr-2" />
                      Limpiar filtros
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>

        {/* Patients Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Pacientes</CardTitle>
                <CardDescription>
                  {totalPatients} paciente{totalPatients !== 1 ? 's' : ''} encontrado{totalPatients !== 1 ? 's' : ''}
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </Button>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Importar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[150px]" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-8" />
                  </div>
                ))}
              </div>
            ) : patients.length === 0 ? (
              <div className="text-center py-12">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No hay pacientes</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm || hasActiveFilters 
                    ? 'No se encontraron pacientes con los criterios de búsqueda actuales.'
                    : 'Aún no has agregado ningún paciente.'}
                </p>
                {!searchTerm && !hasActiveFilters && (
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear primer paciente
                  </Button>
                )}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Paciente</TableHead>
                      <TableHead>Contacto</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Género</TableHead>
                      <TableHead>Edad</TableHead>
                      <TableHead>Registrado</TableHead>
                      <TableHead className="text-right">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patients.map((patient) => (
                      <TableRow key={patient._id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarFallback>
                                {patient.personalInfo.firstName[0]}{patient.personalInfo.lastName[0]}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">
                                {patient.personalInfo.fullName}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                ID: {patient._id ? patient._id.slice(-8) : 'N/A'}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center text-sm">
                              <Mail className="h-3 w-3 mr-1 text-muted-foreground" />
                              {patient.contactInfo.email}
                            </div>
                            {patient.contactInfo.phone && (
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Phone className="h-3 w-3 mr-1" />
                                {patient.contactInfo.phone}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={patient.status} />
                        </TableCell>
                        <TableCell>
                          <GenderBadge gender={patient.personalInfo.gender} />
                        </TableCell>
                        <TableCell>
                          {patient.personalInfo.age ? `${patient.personalInfo.age} años` : '-'}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {new Date(patient.createdAt).toLocaleDateString('es-ES')}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleView(patient)}>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver detalles
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEdit(patient)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDelete(patient)}
                                className="text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Eliminar
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-muted-foreground">
                  Mostrando {((currentPage - 1) * pageSize) + 1} a {Math.min(currentPage * pageSize, totalPatients)} de {totalPatients} pacientes
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Anterior
                  </Button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      const page = i + 1;
                      return (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Siguiente
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Edit Modal */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar Paciente</DialogTitle>
              <DialogDescription>
                Modifica la información del paciente
              </DialogDescription>
            </DialogHeader>
            <PatientForm 
              form={form} 
              onSubmit={onSubmit} 
              isSubmitting={updateMutation.isPending}
              onCancel={handleCloseEditModal}
              isEditing
            />
          </DialogContent>
        </Dialog>

        {/* View Modal */}
        <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Detalles del Paciente</DialogTitle>
              <DialogDescription>
                Información completa del paciente
              </DialogDescription>
            </DialogHeader>
            {viewingPatient && <PatientDetails patient={viewingPatient} />}
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}

// Patient Form Component
function PatientForm({ 
  form, 
  onSubmit, 
  isSubmitting, 
  onCancel, 
  isEditing = false 
}: {
  form: any;
  onSubmit: (data: PatientFormData) => void;
  isSubmitting: boolean;
  onCancel: () => void;
  isEditing?: boolean;
}) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="personal" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="contact">Contacto</TabsTrigger>
            <TabsTrigger value="emergency">Emergencia</TabsTrigger>
            <TabsTrigger value="medical">Médico</TabsTrigger>
          </TabsList>
          
          <TabsContent value="personal" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="personalInfo.firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="personalInfo.lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Apellido</FormLabel>
                    <FormControl>
                      <Input placeholder="Apellido" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="personalInfo.dateOfBirth"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fecha de Nacimiento</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="personalInfo.gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Género</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar género" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="male">Masculino</SelectItem>
                        <SelectItem value="female">Femenino</SelectItem>
                        <SelectItem value="other">Otro</SelectItem>
                        <SelectItem value="prefer_not_to_say">Prefiere no decir</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="contact" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contactInfo.email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@ejemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contactInfo.phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input placeholder="+34 123 456 789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Dirección</h4>
              <FormField
                control={form.control}
                name="contactInfo.address.street"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Calle</FormLabel>
                    <FormControl>
                      <Input placeholder="Calle Principal 123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contactInfo.address.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ciudad</FormLabel>
                      <FormControl>
                        <Input placeholder="Madrid" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactInfo.address.state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provincia</FormLabel>
                      <FormControl>
                        <Input placeholder="Madrid" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="contactInfo.address.postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código Postal</FormLabel>
                      <FormControl>
                        <Input placeholder="28001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactInfo.address.country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>País</FormLabel>
                      <FormControl>
                        <Input placeholder="España" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="emergency" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="emergencyContact.name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Contacto</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="emergencyContact.relationship"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Relación</FormLabel>
                    <FormControl>
                      <Input placeholder="Padre, Madre, Hermano, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="emergencyContact.phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input placeholder="+34 123 456 789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="emergencyContact.email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (Opcional)</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@ejemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="medical" className="space-y-4">
            <FormField
              control={form.control}
              name="clinicalInfo.medicalHistory.familyHistory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Historial Familiar</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe el historial médico familiar relevante..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="clinicalInfo.medicalHistory.notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas Médicas</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Notas adicionales sobre el historial médico..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')} Paciente
          </Button>
        </div>
      </form>
    </Form>
  );
}

// Patient Details Component
function PatientDetails({ patient }: { patient: Patient }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Avatar className="h-16 w-16">
          <AvatarFallback className="text-lg">
            {patient.personalInfo.firstName[0]}{patient.personalInfo.lastName[0]}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="text-xl font-semibold">{patient.personalInfo.fullName}</h3>
          <div className="flex items-center space-x-2 mt-1">
            <StatusBadge status={patient.status} />
            <GenderBadge gender={patient.personalInfo.gender} />
          </div>
        </div>
      </div>
      
      <Tabs defaultValue="personal" className="w-full">
        <TabsList>
          <TabsTrigger value="personal">Información Personal</TabsTrigger>
          <TabsTrigger value="contact">Contacto</TabsTrigger>
          <TabsTrigger value="emergency">Emergencia</TabsTrigger>
          <TabsTrigger value="medical">Historial Médico</TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Datos Personales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Nombre</Label>
                  <p className="text-sm">{patient.personalInfo.firstName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Apellido</Label>
                  <p className="text-sm">{patient.personalInfo.lastName}</p>
                </div>
              </div>
              {patient.personalInfo.dateOfBirth && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Fecha de Nacimiento</Label>
                  <p className="text-sm">{new Date(patient.personalInfo.dateOfBirth).toLocaleDateString('es-ES')}</p>
                </div>
              )}
              {patient.personalInfo.age && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Edad</Label>
                  <p className="text-sm">{patient.personalInfo.age} años</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="contact" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                <p className="text-sm">{patient.contactInfo.email}</p>
              </div>
              {patient.contactInfo.phone && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Teléfono</Label>
                  <p className="text-sm">{patient.contactInfo.phone}</p>
                </div>
              )}
              {patient.contactInfo.address && (
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Dirección</Label>
                  <p className="text-sm">
                    {patient.contactInfo.address.street}<br />
                    {patient.contactInfo.address.city}, {patient.contactInfo.address.state}<br />
                    {patient.contactInfo.address.postalCode}, {patient.contactInfo.address.country}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="emergency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contacto de Emergencia</CardTitle>
            </CardHeader>
            <CardContent>
              {patient.emergencyContact ? (
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Nombre</Label>
                    <p className="text-sm">{patient.emergencyContact.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Relación</Label>
                    <p className="text-sm">{patient.emergencyContact.relationship}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Teléfono</Label>
                    <p className="text-sm">{patient.emergencyContact.phone}</p>
                  </div>
                  {patient.emergencyContact.email && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                      <p className="text-sm">{patient.emergencyContact.email}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No se ha registrado contacto de emergencia</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="medical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Historial Médico</CardTitle>
            </CardHeader>
            <CardContent>
              {patient.clinicalInfo?.medicalHistory ? (
                <div className="space-y-4">
                  {patient.clinicalInfo.medicalHistory.familyHistory && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Historial Familiar</Label>
                      <p className="text-sm mt-1">{patient.clinicalInfo.medicalHistory.familyHistory}</p>
                    </div>
                  )}
                  {patient.clinicalInfo.medicalHistory.notes && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Notas Médicas</Label>
                      <p className="text-sm mt-1">{patient.clinicalInfo.medicalHistory.notes}</p>
                    </div>
                  )}
                  {(!patient.clinicalInfo.medicalHistory.familyHistory && !patient.clinicalInfo.medicalHistory.notes) && (
                    <p className="text-sm text-muted-foreground">No hay información médica registrada</p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No hay historial médico registrado</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="text-xs text-muted-foreground">
        <p>Creado: {new Date(patient.createdAt).toLocaleString('es-ES')}</p>
        <p>Actualizado: {new Date(patient.updatedAt).toLocaleString('es-ES')}</p>
      </div>
    </div>
  );
}
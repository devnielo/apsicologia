'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Heart,
  Activity,
  Pill,
  FileText,
  AlertTriangle,
  Download,
  MoreVertical,
  Badge,
  UserCheck,
  Shield,
  Settings,
  Stethoscope,
  Building2,
  Globe
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge as BadgeComponent } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PersonalInfoSection } from './components/PersonalInfoSection';
import { EmergencyContactSection } from './components/EmergencyContactSection';
import { ClinicalInfoSection } from './components/ClinicalInfoSection';
import { PreferencesSection } from './components/PreferencesSection';
import { AdministrativeSection } from './components/AdministrativeSection';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { base64ToImageUrl } from '@/lib/utils';

interface PatientDetailsPageProps {
  params: {
    id: string;
  };
}

export default function PatientDetailsPage({ params }: PatientDetailsPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('personal');
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const queryClient = useQueryClient();

  // Utility function to calculate age
  const calculateAge = (dateOfBirth: string | Date) => {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  // Format date utility
  const formatDate = (date: string | Date) => {
    if (!date) return 'No especificado';
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Format gender utility
  const formatGender = (gender: string) => {
    const genderMap: { [key: string]: string } = {
      'male': 'Masculino',
      'female': 'Femenino',
      'non-binary': 'No binario',
      'other': 'Otro',
      'prefer-not-to-say': 'Prefiere no decir'
    };
    return genderMap[gender] || gender;
  };

  // Format marital status utility
  const formatMaritalStatus = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'single': 'Soltero/a',
      'married': 'Casado/a',
      'divorced': 'Divorciado/a',
      'widowed': 'Viudo/a',
      'separated': 'Separado/a',
      'domestic-partner': 'Pareja de hecho'
    };
    return statusMap[status] || status;
  };

  const fetchPatient = async (id: string) => {
    try {
      const response = await api.patients.get(id);
      return response.data.data.patient;
    } catch (error) {
      console.error('Error fetching patient:', error);
      throw error;
    }
  };

  const { data: patientData, isLoading, error } = useQuery({
    queryKey: ['patient', params.id],
    queryFn: () => fetchPatient(params.id),
  });

  // Mutation for updating patient data
  const updatePatientMutation = useMutation({
    mutationFn: async ({ section, data }: { section: string; data: any }) => {
      const response = await api.patients.update(params.id, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', params.id] });
      toast({
        title: "Actualizado correctamente",
        description: "Los datos del paciente se han guardado.",
      });
      setEditingSection(null);
      setEditData({});
    },
    onError: (error) => {
      toast({
        title: "Error al actualizar",
        description: "No se pudieron guardar los cambios.",
        variant: "destructive",
      });
    }
  });

  const handleEdit = (section: string, currentData: any) => {
    setEditingSection(section);
    setEditData(currentData);
  };

  const handleSave = (section: string) => {
    updatePatientMutation.mutate({ section, data: editData });
  };

  const handleCancel = () => {
    setEditingSection(null);
    setEditData({});
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="container mx-auto px-6 py-4">
            <Skeleton className="h-8 w-48" />
          </div>
        </div>
        <div className="container mx-auto px-6 py-6">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error al cargar el paciente</h1>
          <p className="text-gray-600 mb-4">No se pudo cargar la información del paciente.</p>
          <Button onClick={() => router.push('/admin/patients')}>
            Volver a pacientes
          </Button>
        </div>
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Paciente no encontrado</h1>
          <p className="text-gray-600 mb-4">El paciente que buscas no existe o ha sido eliminado.</p>
          <Button onClick={() => router.push('/admin/patients')}>
            Volver a pacientes
          </Button>
        </div>
      </div>
    );
  }

  const patient = patientData;
  const fullName = `${patient.personalInfo?.firstName || ''} ${patient.personalInfo?.lastName || ''}`.trim();
  const age = patient.personalInfo?.dateOfBirth ? calculateAge(patient.personalInfo.dateOfBirth) : null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'discharged': return 'outline';
      case 'transferred': return 'destructive';
      case 'deleted': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/admin/patients')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Pacientes
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Datos
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-6 py-6">
        <div className="w-full">
          {/* Patient Header Card */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <Avatar className="h-20 w-20 ring-4 ring-white shadow-lg">
                  <AvatarImage 
                    src={patient.personalInfo?.profilePicture ? base64ToImageUrl(patient.personalInfo.profilePicture) : undefined} 
                  />
                  <AvatarFallback className="text-xl font-semibold bg-blue-100 text-blue-700">
                    {patient.personalInfo?.firstName?.[0]}{patient.personalInfo?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">
                      {fullName || 'Sin nombre'}
                    </h1>
                    <BadgeComponent variant={getStatusColor(patient.status)}>
                      {patient.status === 'active' ? 'Activo' : 
                       patient.status === 'inactive' ? 'Inactivo' :
                       patient.status === 'discharged' ? 'Alta' : patient.status}
                    </BadgeComponent>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="h-4 w-4" />
                      <span>{age ? `${age} años` : 'Edad no especificada'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Badge className="h-4 w-4" />
                      <span>{formatGender(patient.personalInfo?.gender || 'No especificado')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Ingreso: {formatDate(patient.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>Última actualización: {formatDate(patient.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="w-full bg-white border border-gray-200 p-1 rounded-lg shadow-sm">
              <TabsTrigger 
                value="personal" 
                className="flex-1 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 data-[state=active]:shadow-sm rounded-md transition-all"
              >
                <User className="h-4 w-4 mr-2" />
                Personal
              </TabsTrigger>
              <TabsTrigger 
                value="clinical" 
                className="flex-1 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 data-[state=active]:shadow-sm rounded-md transition-all"
              >
                <Stethoscope className="h-4 w-4 mr-2" />
                Clínico
              </TabsTrigger>
              <TabsTrigger 
                value="preferences" 
                className="flex-1 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 data-[state=active]:shadow-sm rounded-md transition-all"
              >
                <Settings className="h-4 w-4 mr-2" />
                Preferencias
              </TabsTrigger>
              <TabsTrigger 
                value="admin" 
                className="flex-1 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-blue-200 data-[state=active]:shadow-sm rounded-md transition-all"
              >
                <Shield className="h-4 w-4 mr-2" />
                Administrativo
              </TabsTrigger>
            </TabsList>

            {/* Personal Tab */}
            <TabsContent value="personal" className="space-y-6">
              <PersonalInfoSection
                patient={patient}
                editingSection={editingSection}
                editData={editData}
                onEdit={handleEdit}
                onSave={handleSave}
                onCancel={handleCancel}
                setEditData={setEditData}
                formatDate={formatDate}
                formatGender={formatGender}
                formatMaritalStatus={formatMaritalStatus}
              />
              
              <EmergencyContactSection
                patient={patient}
                editingSection={editingSection}
                editData={editData}
                onEdit={handleEdit}
                onSave={handleSave}
                onCancel={handleCancel}
                setEditData={setEditData}
              />
            </TabsContent>

            {/* Clinical Tab */}
            <TabsContent value="clinical" className="space-y-6">
              <ClinicalInfoSection
                patient={patient}
                editingSection={editingSection}
                editData={editData}
                onEdit={handleEdit}
                onSave={handleSave}
                onCancel={handleCancel}
                setEditData={setEditData}
                formatDate={formatDate}
              />
            </TabsContent>

            {/* Preferences Tab */}
            <TabsContent value="preferences" className="space-y-6">
              <PreferencesSection
                patient={patient}
                editingSection={editingSection}
                editData={editData}
                onEdit={handleEdit}
                onSave={handleSave}
                onCancel={handleCancel}
                setEditData={setEditData}
              />
            </TabsContent>

            {/* Administrative Tab */}
            <TabsContent value="admin" className="space-y-6">
              <AdministrativeSection
                patient={patient}
                editingSection={editingSection}
                editData={editData}
                onEdit={handleEdit}
                onSave={handleSave}
                onCancel={handleCancel}
                setEditData={setEditData}
                formatDate={formatDate}
              />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

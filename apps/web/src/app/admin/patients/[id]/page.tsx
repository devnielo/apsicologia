'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Download, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { IPatient } from '@apsicologia/shared/types';

// Import new compact components
import { PatientSidebar } from './components/PatientSidebar';
import { PersonalInfoSection } from './components/PersonalInfoSection';
import { ClinicalSection } from './components/ClinicalSection';
import { PreferencesSection } from './components/PreferencesSection';
import { AdministrativeSection } from './components/AdministrativeSection';

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

  // Edit handling functions
  const handleEdit = (section: string, data: any) => {
    setEditingSection(section);
    setEditData(data);
  };

  const handleSave = async (section: string) => {
    try {
      await updatePatientMutation.mutateAsync({
        id: params.id,
        data: editData
      });
      setEditingSection(null);
      setEditData({});
      toast({
        title: 'Éxito',
        description: 'Información actualizada correctamente'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar la información',
        variant: 'destructive'
      });
    }
  };

  const handleCancel = () => {
    setEditingSection(null);
    setEditData({});
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

  const { data: patientData, isLoading, error } = useQuery<IPatient>({
    queryKey: ['patient', params.id],
    queryFn: () => fetchPatient(params.id),
  });

  const updatePatientMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await api.patients.update(id, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patient', params.id] });
    }
  });


  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="w-80 p-4">
          <Skeleton className="h-96 w-full" />
        </div>
        <div className="flex-1 p-4">
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error || !patientData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-foreground mb-2">
            {error ? 'Error al cargar el paciente' : 'Paciente no encontrado'}
          </h1>
          <p className="text-muted-foreground mb-4 text-sm">
            {error ? 'No se pudo cargar la información del paciente.' : 'El paciente que buscas no existe o ha sido eliminado.'}
          </p>
          <Button size="sm" onClick={() => router.push('/admin/patients')} className="medical-button-primary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a pacientes
          </Button>
        </div>
      </div>
    );
  }

  const patient = patientData;
  const fullName = `${(patient as any)?.personalInfo?.firstName || ''} ${(patient as any)?.personalInfo?.lastName || ''}`.trim();

  return (
    <div className="h-full bg-background flex overflow-hidden">
      {/* Sidebar */}
      <div className="bg-card border-r border-border h-full overflow-hidden flex-shrink-0 flex flex-col">
        <div className="p-4 border-b border-border flex-shrink-0">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/admin/patients')}
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
        <div className="flex-1 overflow-hidden p-4">
          <PatientSidebar patient={patient} />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-background flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="bg-card border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-foreground">
                {fullName || 'Sin nombre'}
              </h1>
              <Badge 
                variant={patient.status === 'active' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {patient.status === 'active' ? 'Activo' : patient.status}
              </Badge>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="text-muted-foreground hover:text-foreground">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="text-foreground">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Tabs Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-card border border-border sticky top-0 z-10">
                <TabsTrigger value="personal" className="text-sm text-muted-foreground data-[state=active]:text-foreground">Personal</TabsTrigger>
                <TabsTrigger value="clinical" className="text-sm text-muted-foreground data-[state=active]:text-foreground">Clínico</TabsTrigger>
                <TabsTrigger value="preferences" className="text-sm text-muted-foreground data-[state=active]:text-foreground">Preferencias</TabsTrigger>
                <TabsTrigger value="admin" className="text-sm text-muted-foreground data-[state=active]:text-foreground">Admin</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="mt-6">
                <PersonalInfoSection
                  patient={patient}
                  editingSection={editingSection}
                  editData={editData}
                  onEdit={handleEdit}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  setEditData={setEditData}
                />
              </TabsContent>

              <TabsContent value="clinical" className="mt-6">
                <ClinicalSection
                  patient={patient}
                  editingSection={editingSection}
                  editData={editData}
                  onEdit={handleEdit}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  setEditData={setEditData}
                />
              </TabsContent>

              <TabsContent value="preferences" className="mt-6">
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

              <TabsContent value="admin" className="mt-6">
                <AdministrativeSection
                  patient={patient}
                  editingSection={editingSection}
                  editData={editData}
                  onEdit={handleEdit}
                  onSave={handleSave}
                  onCancel={handleCancel}
                  setEditData={setEditData}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

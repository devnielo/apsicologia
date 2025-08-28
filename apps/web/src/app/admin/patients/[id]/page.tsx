'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { 
  ArrowLeft,
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Edit,
  Heart,
  Target,
  CreditCard,
  Shield,
  Brain,
  Pill,
  CheckCircle,
  AlertTriangle,
  Settings,
  Calendar,
  Plus,
  Activity,
  FileText,
  MoreVertical,
  Key,
  Trash2,
  UserCheck,
  UserX,
  Download
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

interface PatientDetailsPageProps {
  params: {
    id: string;
  };
}

export default function PatientDetailsPage({ params }: PatientDetailsPageProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');

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

  const handleResetPassword = async () => {
    try {
      // TODO: Implement reset password API call
      toast({
        title: "Contraseña restablecida",
        description: "Se ha enviado un enlace de restablecimiento al email del paciente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo restablecer la contraseña.",
        variant: "destructive",
      });
    }
  };

  const handleTogglePortalAccess = async () => {
    try {
      // TODO: Implement toggle portal access API call
      const newStatus = !patientData.preferences?.portalAccess?.enabled;
      toast({
        title: `Acceso al portal ${newStatus ? 'habilitado' : 'deshabilitado'}`,
        description: `El paciente ${newStatus ? 'ahora puede' : 'ya no puede'} acceder al portal.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo cambiar el acceso al portal.",
        variant: "destructive",
      });
    }
  };

  const handleExportData = async () => {
    try {
      // TODO: Implement export patient data API call
      toast({
        title: "Datos exportados",
        description: "Los datos del paciente se han exportado correctamente.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudieron exportar los datos.",
        variant: "destructive",
      });
    }
  };

  const handleDeletePatient = async () => {
    try {
      // TODO: Implement delete patient API call
      toast({
        title: "Paciente eliminado",
        description: "El paciente ha sido eliminado correctamente.",
      });
      router.push('/admin/patients');
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el paciente.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-9 w-20" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center py-12 text-red-600">Error loading patient data</div>;
  }

  if (!patientData) {
    return <div className="text-center py-12">No patient data found</div>;
  }


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
    <div className="min-h-screen bg-muted/30">
      {/* Compact Header */}
      <div className="bg-background border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => router.push('/admin/patients')} className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Pacientes
              </Button>
              <Separator orientation="vertical" className="h-5" />
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={patientData.personalInfo?.profilePicture || undefined} />
                  <AvatarFallback className="text-sm font-medium">
                    {patientData.personalInfo?.firstName?.[0]}{patientData.personalInfo?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="font-semibold text-foreground leading-none">{patientData.personalInfo?.firstName} {patientData.personalInfo?.lastName}</h1>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={getStatusColor(patientData.status)} className="text-xs px-1.5 py-0.5">
                      {patientData.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {calculateAge(patientData.personalInfo?.dateOfBirth)} años • {patientData.personalInfo?.gender}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Nueva Cita
              </Button>
              <Button size="sm" onClick={() => router.push(`/admin/patients/${params.id}/edit`)}>
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4 mr-1" />
                    Gestión
                    <MoreVertical className="h-3 w-3 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Acciones Administrativas</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleResetPassword}>
                    <Key className="h-4 w-4 mr-2" />
                    Restablecer Contraseña
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleTogglePortalAccess}>
                    {patientData.preferences?.portalAccess?.enabled ? (
                      <><UserX className="h-4 w-4 mr-2" />Deshabilitar Portal</>
                    ) : (
                      <><UserCheck className="h-4 w-4 mr-2" />Habilitar Portal</>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Shield className="h-4 w-4 mr-2" />
                    Configurar 2FA
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleExportData}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Datos (RGPD)
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <DropdownMenuItem 
                        className="text-red-600 focus:text-red-600"
                        onSelect={(e) => e.preventDefault()}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar Paciente
                      </DropdownMenuItem>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>¿Eliminar paciente?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción no se puede deshacer. Se eliminará permanentemente
                          al paciente <strong>{patientData.personalInfo?.firstName} {patientData.personalInfo?.lastName}</strong> 
                          y todos sus datos asociados (citas, historial clínico, facturas, etc.).
                          <br /><br />
                          <span className="text-red-600 font-medium">
                            ⚠️ Esta es una acción irreversible
                          </span>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={handleDeletePatient}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Sí, eliminar paciente
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Sidebar - Patient Summary */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            {/* Basic Info Card */}
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col items-center text-center space-y-3">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={patientData.personalInfo?.profilePicture || undefined} />
                    <AvatarFallback className="text-lg">
                      {patientData.personalInfo?.firstName?.[0]}{patientData.personalInfo?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{patientData.personalInfo?.firstName} {patientData.personalInfo?.lastName}</h3>
                    <p className="text-sm text-muted-foreground">{patientData.personalInfo?.occupation || 'Sin ocupación'}</p>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{patientData.contactInfo?.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{patientData.contactInfo?.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs">{patientData.contactInfo?.address?.city}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs">Registro: {new Date(patientData.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Patient Summary Sidebar */}
            <div className="space-y-3">
              {/* Quick Info */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Información Personal</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-xs">
                    <div>
                      <span className="text-muted-foreground">Edad:</span>
                      <span className="ml-1 font-medium">{calculateAge(patientData.personalInfo.dateOfBirth)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Género:</span>
                      <span className="ml-1 font-medium capitalize">{patientData.personalInfo.gender}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">E. Civil:</span>
                      <span className="ml-1 font-medium">{patientData.personalInfo.maritalStatus || 'N/E'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Ocupación:</span>
                      <span className="ml-1 font-medium">{patientData.personalInfo.occupation || 'N/E'}</span>
                    </div>
                    {patientData.personalInfo.idNumber && (
                      <>
                        <div>
                          <span className="text-muted-foreground">ID:</span>
                          <span className="ml-1 font-medium font-mono text-xs">{patientData.personalInfo.idNumber}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Tipo:</span>
                          <span className="ml-1 font-medium uppercase">{patientData.personalInfo.idType}</span>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Estadísticas de Citas</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center p-2 bg-primary/10 rounded border border-primary/20">
                      <div className="text-lg font-bold text-primary">
                        {patientData.statistics?.totalAppointments || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Total</div>
                    </div>
                    <div className="text-center p-2 bg-green-50 rounded border border-green-200">
                      <div className="text-lg font-bold text-green-600">
                        {patientData.statistics?.completedAppointments || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Completas</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="text-center p-2 bg-orange-50 rounded border border-orange-200">
                      <div className="text-sm font-bold text-orange-600">
                        {patientData.statistics?.cancelledAppointments || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Cancel.</div>
                    </div>
                    <div className="text-center p-2 bg-red-50 rounded border border-red-200">
                      <div className="text-sm font-bold text-red-600">
                        {patientData.statistics?.noShowAppointments || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">No Show</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Medical Info */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Estado Clínico</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-2">
                    {/* Conditions */}
                    {patientData.clinicalInfo?.medicalHistory?.conditions?.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Condiciones:</p>
                        <div className="flex flex-wrap gap-1">
                          {patientData.clinicalInfo.medicalHistory.conditions.slice(0, 2).map((condition: string, idx: number) => (
                            <Badge key={idx} variant="secondary" className="text-xs h-5">
                              {condition}
                            </Badge>
                          ))}
                          {patientData.clinicalInfo.medicalHistory.conditions.length > 2 && (
                            <Badge variant="outline" className="text-xs h-5">
                              +{patientData.clinicalInfo.medicalHistory.conditions.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Allergies */}
                    {patientData.clinicalInfo?.medicalHistory?.allergies?.length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Alergias:</p>
                        <div className="flex flex-wrap gap-1">
                          {patientData.clinicalInfo.medicalHistory.allergies.slice(0, 2).map((allergy: any, idx: number) => (
                            <Badge key={idx} variant="destructive" className="text-xs h-5">
                              {allergy.allergen || allergy}
                            </Badge>
                          ))}
                          {patientData.clinicalInfo.medicalHistory.allergies.length > 2 && (
                            <Badge variant="outline" className="text-xs h-5">
                              +{patientData.clinicalInfo.medicalHistory.allergies.length - 2}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Current Medications */}
                    {patientData.clinicalInfo?.medicalHistory?.medications?.filter((med: any) => med.active).length > 0 && (
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Medicación Actual:</p>
                        <div className="text-xs space-y-1">
                          {patientData.clinicalInfo.medicalHistory.medications
                            .filter((med: any) => med.active)
                            .slice(0, 2)
                            .map((med: any, idx: number) => (
                              <div key={idx} className="p-1 bg-blue-50 rounded text-blue-700">
                                {med.name} - {med.dosage}
                              </div>
                            ))}
                          {patientData.clinicalInfo.medicalHistory.medications.filter((med: any) => med.active).length > 2 && (
                            <div className="text-xs text-muted-foreground">
                              +{patientData.clinicalInfo.medicalHistory.medications.filter((med: any) => med.active).length - 2} más
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {(!patientData.clinicalInfo?.medicalHistory?.conditions?.length && 
                      !patientData.clinicalInfo?.medicalHistory?.allergies?.length && 
                      !patientData.clinicalInfo?.medicalHistory?.medications?.filter((med: any) => med.active).length) && (
                      <p className="text-xs text-muted-foreground text-center py-2">
                        Sin información clínica registrada
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Contact & Payment */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Contacto & Facturación</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span className="font-mono">{patientData.contactInfo.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span className="truncate">{patientData.contactInfo.email}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Pago:</span>
                      <Badge 
                        variant={patientData.billing?.paymentMethod === 'stripe' ? 'default' : 'secondary'} 
                        className="text-xs h-5"
                      >
                        {patientData.billing?.paymentMethod === 'stripe' ? 'Tarjeta' : 'Efectivo'}
                      </Badge>
                    </div>
                    {patientData.billing?.stripeCustomerId && (
                      <div className="text-xs text-muted-foreground">
                        Cliente Stripe registrado
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tags/Conditions */}
            {(patientData.tags?.length > 0 || patientData.clinicalInfo?.medicalHistory?.conditions?.length > 0) && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Heart className="h-4 w-4" />
                    Condiciones
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="flex flex-wrap gap-1">
                    {patientData.tags?.map((tag: any, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {tag.name}
                      </Badge>
                    ))}
                    {patientData.clinicalInfo?.medicalHistory?.conditions?.map((condition: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {condition}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Main Content Area */}
          <div className="col-span-12 lg:col-span-9">

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList className="grid w-full grid-cols-4 bg-muted/50">
                <TabsTrigger value="overview" className="text-sm">Resumen</TabsTrigger>
                <TabsTrigger value="clinical" className="text-sm">Clínico</TabsTrigger>
                <TabsTrigger value="billing" className="text-sm">Facturación</TabsTrigger>
                <TabsTrigger value="contact" className="text-sm">Contacto</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4 mt-4">
                {/* Recent Activity Placeholder */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-medium">Actividad Reciente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Historial de citas y actividades del paciente...</p>
                  </CardContent>
                </Card>
                
                {/* Professional Assignment Placeholder */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-medium">Profesional Asignado</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">Información del profesional asignado...</p>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="contact" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Contact Information */}
                  <div className="space-y-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Información de Contacto
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 gap-3">
                          <div className="flex items-center gap-3">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{patientData.contactInfo.email}</p>
                              <p className="text-xs text-muted-foreground">Email principal</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{patientData.contactInfo.phone}</p>
                              <p className="text-xs text-muted-foreground">Teléfono principal</p>
                            </div>
                          </div>

                          <div className="pt-2 border-t">
                            <p className="text-sm font-medium mb-1">Método de contacto preferido:</p>
                            <Badge variant="outline" className="capitalize">
                              {patientData.contactInfo.preferredContactMethod || 'Email'}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Address Information */}
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          Dirección
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {patientData.contactInfo.address ? (
                          <div className="space-y-2">
                            <div>
                              <p className="text-sm font-medium">{patientData.contactInfo.address.street}</p>
                              <p className="text-xs text-muted-foreground">Calle</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-medium">{patientData.contactInfo.address.city}</p>
                                <p className="text-xs text-muted-foreground">Ciudad</p>
                              </div>
                              <div>
                                <p className="text-sm font-medium">{patientData.contactInfo.address.postalCode}</p>
                                <p className="text-xs text-muted-foreground">Código Postal</p>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No se ha registrado dirección</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Emergency Contact */}
                  <div className="space-y-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-medium flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          Contacto de Emergencia
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div>
                          <p className="text-sm font-medium">{patientData.emergencyContact?.name || 'No especificado'}</p>
                          <p className="text-xs text-muted-foreground">Nombre completo</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">{patientData.emergencyContact?.relationship || 'Sin relación'}</p>
                          <p className="text-xs text-muted-foreground">Relación</p>
                        </div>
                        {patientData.emergencyContact?.phone && (
                          <div className="flex items-center gap-3">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{patientData.emergencyContact.phone}</p>
                              <p className="text-xs text-muted-foreground">Teléfono</p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="clinical" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Medical History */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-medium flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        Historial Médico
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Activity className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm font-medium">Condiciones</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {patientData.clinicalInfo?.medicalHistory?.conditions?.length > 0 ? (
                            patientData.clinicalInfo.medicalHistory.conditions.map((condition: string, idx: number) => (
                              <Badge key={idx} variant="outline" className="text-xs">{condition}</Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">No especificadas</span>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-3 w-3 text-amber-500" />
                          <span className="text-sm font-medium">Alergias</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {patientData.clinicalInfo?.medicalHistory?.allergies?.length > 0 ? (
                            patientData.clinicalInfo.medicalHistory.allergies.map((allergy: any, idx: number) => (
                              <Badge key={idx} variant="destructive" className="text-xs">
                                {typeof allergy === 'string' ? allergy : allergy.allergen}
                                {allergy.severity && ` (${allergy.severity})`}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">Sin alergias conocidas</span>
                          )}
                        </div>
                      </div>

                      {/* Previous Treatments */}
                      {patientData.clinicalInfo?.mentalHealthHistory?.previousTreatments?.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm font-medium">Tratamientos Previos</span>
                          </div>
                          <div className="space-y-1">
                            {patientData.clinicalInfo.mentalHealthHistory.previousTreatments.slice(0, 3).map((treatment: any, idx: number) => (
                              <div key={idx} className="text-xs p-2 bg-blue-50 rounded border border-blue-200">
                                <div className="font-medium capitalize">{treatment.type}</div>
                                <div className="text-muted-foreground">{treatment.reason}</div>
                                {treatment.provider && <div className="text-muted-foreground">Por: {treatment.provider}</div>}
                              </div>
                            ))}
                            {patientData.clinicalInfo.mentalHealthHistory.previousTreatments.length > 3 && (
                              <div className="text-xs text-muted-foreground text-center">
                                +{patientData.clinicalInfo.mentalHealthHistory.previousTreatments.length - 3} más
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Current Treatment */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-medium flex items-center gap-2">
                        <Pill className="h-4 w-4" />
                        Tratamiento Actual
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Pill className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm font-medium">Medicación</span>
                        </div>
                        <div className="space-y-1">
                          {patientData.clinicalInfo?.medicalHistory?.medications?.filter((med: any) => med.active || typeof med === 'string')?.length > 0 ? (
                            patientData.clinicalInfo.medicalHistory.medications
                              .filter((med: any) => med.active || typeof med === 'string')
                              .map((med: any, idx: number) => (
                              <div key={idx} className="text-xs p-2 bg-muted/50 rounded">
                                {typeof med === 'string' ? med : (
                                  <>
                                    <div className="font-medium">{med.name}</div>
                                    {med.dosage && <div className="text-muted-foreground">Dosis: {med.dosage}</div>}
                                    {med.frequency && <div className="text-muted-foreground">Frecuencia: {med.frequency}</div>}
                                  </>
                                )}
                              </div>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">Sin medicación</span>
                          )}
                        </div>
                      </div>

                      {/* Treatment Goals */}
                      {patientData.clinicalInfo?.currentTreatment?.goals?.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <FileText className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm font-medium">Objetivos Terapéuticos</span>
                          </div>
                          <div className="space-y-1">
                            {patientData.clinicalInfo.currentTreatment.goals.map((goal: string, idx: number) => (
                              <div key={idx} className="text-xs p-2 bg-green-50 rounded border border-green-200 text-green-800">
                                • {goal}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Diagnoses */}
                      {patientData.clinicalInfo?.mentalHealthHistory?.diagnoses?.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Activity className="h-3 w-3 text-muted-foreground" />
                            <span className="text-sm font-medium">Diagnósticos</span>
                          </div>
                          <div className="space-y-1">
                            {patientData.clinicalInfo.mentalHealthHistory.diagnoses.slice(0, 3).map((diagnosis: any, idx: number) => (
                              <div key={idx} className="text-xs p-2 bg-amber-50 rounded border border-amber-200">
                                <div className="font-medium">{diagnosis.condition}</div>
                                <div className="text-muted-foreground flex justify-between">
                                  <span className="capitalize">Estado: {diagnosis.status}</span>
                                  {diagnosis.severity && <span className="capitalize">Severidad: {diagnosis.severity}</span>}
                                </div>
                                {diagnosis.icdCode && <div className="text-muted-foreground font-mono">{diagnosis.icdCode}</div>}
                              </div>
                            ))}
                            {patientData.clinicalInfo.mentalHealthHistory.diagnoses.length > 3 && (
                              <div className="text-xs text-muted-foreground text-center">
                                +{patientData.clinicalInfo.mentalHealthHistory.diagnoses.length - 3} más
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Risk Factors */}
                      {patientData.clinicalInfo?.mentalHealthHistory?.riskFactors?.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <AlertTriangle className="h-3 w-3 text-red-500" />
                            <span className="text-sm font-medium">Factores de Riesgo</span>
                          </div>
                          <div className="space-y-1">
                            {patientData.clinicalInfo.mentalHealthHistory.riskFactors.map((risk: any, idx: number) => (
                              <div key={idx} className="text-xs p-2 bg-red-50 rounded border border-red-200">
                                <div className="flex justify-between items-center">
                                  <span className="font-medium">{risk.factor}</span>
                                  <Badge 
                                    variant={risk.level === 'high' ? 'destructive' : risk.level === 'moderate' ? 'secondary' : 'outline'}
                                    className="text-xs h-4"
                                  >
                                    {risk.level}
                                  </Badge>
                                </div>
                                {risk.notes && <div className="text-muted-foreground mt-1">{risk.notes}</div>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Episodes */}
                {patientData.episodes?.length > 0 && (
                  <Card className="mt-4">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-medium flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Episodios de Tratamiento
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {patientData.episodes.slice(0, 4).map((episode: any, idx: number) => (
                          <div key={idx} className="p-3 border rounded-lg space-y-2">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium">{episode.title}</h4>
                              <Badge 
                                variant={episode.status === 'active' ? 'default' : episode.status === 'completed' ? 'secondary' : 'outline'}
                                className="text-xs"
                              >
                                {episode.status}
                              </Badge>
                            </div>
                            {episode.description && (
                              <p className="text-xs text-muted-foreground">{episode.description}</p>
                            )}
                            <div className="text-xs text-muted-foreground">
                              Inicio: {new Date(episode.startDate).toLocaleDateString('es-ES')}
                              {episode.endDate && (
                                <> • Fin: {new Date(episode.endDate).toLocaleDateString('es-ES')}</>
                              )}
                            </div>
                            {episode.goals?.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {episode.goals.slice(0, 2).map((goal: string, goalIdx: number) => (
                                  <Badge key={goalIdx} variant="outline" className="text-xs">
                                    {goal}
                                  </Badge>
                                ))}
                                {episode.goals.length > 2 && (
                                  <Badge variant="outline" className="text-xs">+{episode.goals.length - 2}</Badge>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      {patientData.episodes.length > 4 && (
                        <div className="text-center mt-4">
                          <span className="text-sm text-muted-foreground">
                            Mostrando 4 de {patientData.episodes.length} episodios
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="billing" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Financial Summary */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-medium flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Resumen Financiero
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div className="p-3 bg-muted/50 rounded-lg">
                          <div className="text-lg font-semibold text-primary">
                            €{patientData.statistics?.totalInvoiceAmount?.toFixed(2) || '0.00'}
                          </div>
                          <div className="text-xs text-muted-foreground">Total Facturado</div>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <div className="text-lg font-semibold text-green-600">
                            €{patientData.statistics?.totalPaidAmount?.toFixed(2) || '0.00'}
                          </div>
                          <div className="text-xs text-muted-foreground">Total Pagado</div>
                        </div>
                      </div>
                      
                      <div className="mt-4 space-y-2 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Método de Pago:</span>
                          <Badge variant="outline" className="text-xs">
                            {patientData.billing?.paymentMethod === 'stripe' ? 'Tarjeta de Crédito' : 'Pago en Efectivo'}
                          </Badge>
                        </div>
                        {patientData.billing?.stripeCustomerId && (
                          <div className="flex justify-between items-center">
                            <span className="text-muted-foreground">Cliente Stripe:</span>
                            <Badge variant="secondary" className="text-xs">
                              Registrado
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Payment Information */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base font-medium flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Información de Pago
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Método Principal:</span>
                        <Badge variant={patientData.billing?.paymentMethod === 'stripe' ? 'default' : 'secondary'} className="text-xs">
                          {patientData.billing?.paymentMethod === 'stripe' ? 'Tarjeta de Crédito' : 'Pago en Efectivo'}
                        </Badge>
                      </div>
                      
                      {patientData.billing?.paymentMethod === 'stripe' && patientData.billing?.stripeCustomerId && (
                        <div className="p-3 border rounded-lg space-y-2">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Cliente Stripe</p>
                            <p className="text-sm font-mono">{patientData.billing.stripeCustomerId}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-muted-foreground">Estado</p>
                            <Badge variant="secondary" className="text-xs">Activo</Badge>
                          </div>
                        </div>
                      )}
                      
                      {patientData.billing?.paymentMethod === 'cash' && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-center">
                          <div className="flex items-center justify-center gap-2 mb-1">
                            <AlertTriangle className="h-4 w-4 text-amber-600" />
                            <p className="text-sm font-medium text-amber-800">Pago en Efectivo</p>
                          </div>
                          <p className="text-xs text-amber-700">Procesado únicamente por administradores</p>
                        </div>
                      )}
                      
                      {patientData.billing?.billingNotes && (
                        <div className="p-3 bg-muted/30 rounded-lg">
                          <p className="text-xs font-medium text-muted-foreground mb-1">Notas de Facturación:</p>
                          <p className="text-sm">{patientData.billing.billingNotes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

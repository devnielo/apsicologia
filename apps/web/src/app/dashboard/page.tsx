'use client';

import { useAuth } from '@/lib/auth-context';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  Calendar,
  Users,
  FileText,
  DollarSign,
  Activity,
  Clock,
  LogOut,
  User,
  Settings,
  Bell,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
    }
  }, [isLoading, isAuthenticated, router]);

  // Fetch dashboard stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['stats', 'dashboard'],
    queryFn: async () => {
      const response = await api.stats.dashboard();
      return response.data.data;
    },
    enabled: isAuthenticated,
  });

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-foreground">apsicologia</h1>
              <div className="ml-6 text-sm text-muted-foreground">
                Dashboard
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="p-2 text-muted-foreground hover:text-foreground">
                <Bell className="h-5 w-5" />
              </button>
              
              {/* Settings */}
              <button className="p-2 text-muted-foreground hover:text-foreground">
                <Settings className="h-5 w-5" />
              </button>
              
              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="bg-primary text-primary-foreground rounded-full p-2">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{user?.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {user?.role}
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={handleLogout}
                  className="p-2 text-muted-foreground hover:text-destructive"
                  title="Cerrar sesión"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="px-4 py-6 sm:px-0">
          <div className="medical-card p-6 mb-6">
            <h2 className="text-xl font-semibold text-foreground mb-2">
              ¡Bienvenido/a de vuelta, {user?.name}!
            </h2>
            <p className="text-muted-foreground">
              Aquí tienes un resumen de tu actividad en la plataforma apsicologia.
            </p>
          </div>

          {/* Stats Grid */}
          {statsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="medical-card p-6">
                  <div className="animate-pulse">
                    <div className="h-8 bg-muted rounded mb-2"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="medical-card p-6">
                <div className="flex items-center">
                  <div className="bg-primary/10 text-primary rounded-lg p-3">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-foreground">
                      {stats?.appointments?.total || 0}
                    </p>
                    <p className="text-muted-foreground text-sm">Citas Totales</p>
                  </div>
                </div>
              </div>

              <div className="medical-card p-6">
                <div className="flex items-center">
                  <div className="bg-success/10 text-success rounded-lg p-3">
                    <Users className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-foreground">
                      {stats?.patients?.total || 0}
                    </p>
                    <p className="text-muted-foreground text-sm">Pacientes</p>
                  </div>
                </div>
              </div>

              <div className="medical-card p-6">
                <div className="flex items-center">
                  <div className="bg-warning/10 text-warning rounded-lg p-3">
                    <FileText className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-foreground">
                      {stats?.notes?.total || 0}
                    </p>
                    <p className="text-muted-foreground text-sm">Notas Clínicas</p>
                  </div>
                </div>
              </div>

              <div className="medical-card p-6">
                <div className="flex items-center">
                  <div className="bg-accent/10 text-accent rounded-lg p-3">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-foreground">
                      €{stats?.revenue?.total || 0}
                    </p>
                    <p className="text-muted-foreground text-sm">Facturación</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="medical-card p-6">
              <div className="flex items-center mb-4">
                <Activity className="h-5 w-5 text-primary mr-2" />
                <h3 className="text-lg font-semibold text-foreground">
                  Acciones Rápidas
                </h3>
              </div>
              <div className="space-y-2">
                <button 
                  onClick={() => router.push('/admin/patients')}
                  className="medical-button-primary w-full text-left"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Gestión de Pacientes
                </button>
                <button className="medical-button-secondary w-full text-left">
                  <Calendar className="h-4 w-4 mr-2" />
                  Nueva Cita
                </button>
                <button className="medical-button-secondary w-full text-left">
                  <FileText className="h-4 w-4 mr-2" />
                  Nueva Nota
                </button>
              </div>
            </div>

            <div className="medical-card p-6">
              <div className="flex items-center mb-4">
                <Clock className="h-5 w-5 text-accent mr-2" />
                <h3 className="text-lg font-semibold text-foreground">
                  Próximas Citas
                </h3>
              </div>
              <div className="space-y-3">
                {stats?.upcomingAppointments?.length > 0 ? (
                  stats.upcomingAppointments.slice(0, 3).map((appointment: any, index: number) => (
                    <div key={index} className="flex items-center p-2 bg-muted/50 rounded">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {appointment.patientName || 'Paciente'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {appointment.service || 'Consulta'}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {appointment.time || 'Pendiente'}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-sm">
                    No hay citas próximas
                  </p>
                )}
              </div>
            </div>

            <div className="medical-card p-6">
              <div className="flex items-center mb-4">
                <Activity className="h-5 w-5 text-success mr-2" />
                <h3 className="text-lg font-semibold text-foreground">
                  Estado del Sistema
                </h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">API Backend</span>
                  <span className="text-sm text-success">✅ Operativo</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Base de Datos</span>
                  <span className="text-sm text-success">✅ Conectada</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Autenticación</span>
                  <span className="text-sm text-success">✅ Activa</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
